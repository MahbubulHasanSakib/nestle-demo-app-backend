import { SetMetadata } from '@nestjs/common';

export const excludeCustomInterceptorSymbol = Symbol();

export const ExcludeCustomInterceptor = () =>
  SetMetadata('excludeCustomInterceptorSymbol', excludeCustomInterceptorSymbol);
