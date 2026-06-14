import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ACTION_KEY } from '../decorators/action-matrix.decorator';
import { ActionMatrixRepository } from '../repositories/action-matrix.repository';

@Injectable()
export class ActionMatrixGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private actionMatrixRepository: ActionMatrixRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAction = this.reflector.getAllAndOverride<string>(
      REQUIRE_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAction) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Super admin can do anything by default
    if (user.role === 'super_admin') return true;

    const permission = await this.actionMatrixRepository.findOne({
      role_action: {
        role: user.role,
        action: requiredAction,
      },
    });

    if (!permission || !permission.isAllowed) {
      throw new ForbiddenException(
        `Access denied for action: ${requiredAction}`,
      );
    }

    return true;
  }
}
