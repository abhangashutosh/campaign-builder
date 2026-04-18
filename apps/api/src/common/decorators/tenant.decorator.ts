import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id']
    return tenantId as string
  },
)
