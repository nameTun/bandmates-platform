import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const VisitorId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-visitor-id'];
  },
);
