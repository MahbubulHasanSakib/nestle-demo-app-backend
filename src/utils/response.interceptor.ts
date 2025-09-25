import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { excludeCustomInterceptorSymbol } from './decorator/exclude-custom-interceptor.decorator';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    const symbol = this.reflector.getAllAndOverride<symbol, string>(
      'excludeCustomInterceptorSymbol',
      [context.getHandler(), context.getClass()],
    );

    if (symbol) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode:
          data?.status ??
          data?.statusCode ??
          context.switchToHttp().getResponse().statusCode,
        message: data?.message ?? 'Request processed successfully.',
        data: data?.data ?? null,
        meta: data?.meta,
      })),
    );
  }
}
