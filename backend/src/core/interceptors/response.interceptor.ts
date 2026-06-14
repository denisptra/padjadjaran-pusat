import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If it's already in the correct format, return it
        if (res && res.data && res.meta) {
          return res;
        }
        // If it's an array, it might be a list result from a service that forgot to wrap it
        // Or if it's a single object
        return {
          data: res,
          meta: res?.meta || undefined,
        };
      }),
    );
  }
}
