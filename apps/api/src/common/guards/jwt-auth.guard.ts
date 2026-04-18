import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    // Dev bypass: no Authorization header → skip JWT, let TenantId fall back to x-tenant-id header
    if (process.env.APP_ENV === 'development') {
      const req = context.switchToHttp().getRequest()
      if (!req.headers['authorization']) return true
    }

    return super.canActivate(context)
  }

  handleRequest<T>(err: Error | null, user: T): T {
    // Allow unauthenticated requests in dev (user will be null/false when bypassed)
    if (process.env.APP_ENV === 'development' && !err && !user) return user
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token')
    }
    return user
  }
}
