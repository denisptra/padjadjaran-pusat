import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AUDIT_LOG_KEY,
  AuditLogOptions,
} from '../decorators/audit-log.decorator';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogRepository: AuditLogRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditLogOptions>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ipAddress = request.ip || request.headers['x-forwarded-for'];

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.auditLogRepository.create({
            userId: user?.id || null,
            module: auditOptions.resource,
            action: auditOptions.action,
            ipAddress: ipAddress ? String(ipAddress) : null,
            details: JSON.stringify({
              method: request.method,
              url: request.url,
              params: request.params,
              query: request.query,
              // body: request.body, // Be careful with sensitive data in body
            }),
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }
}
