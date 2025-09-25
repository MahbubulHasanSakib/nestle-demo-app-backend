import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    const req: any = ctx.switchToHttp().getRequest<Request>();

    if (req.clientIp) return req.clientIp;
    return requestIp.getClientIp(req); // In case we forgot to include requestIp.mw() in main.ts
  },
);
