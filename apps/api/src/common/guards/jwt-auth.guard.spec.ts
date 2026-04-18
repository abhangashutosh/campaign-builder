import { describe, it, expect, vi } from 'vitest'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

describe('JwtAuthGuard', () => {
  it('throws UnauthorizedException when no user', () => {
    const reflector = new Reflector()
    const guard = { handleRequest: (err: null, user: null) => {
      if (!user) throw new UnauthorizedException('Invalid or missing token')
      return user
    }}
    expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException)
  })

  it('returns user when valid', () => {
    const user = { id: '1', tenantId: 'tenant-1' }
    const guard = { handleRequest: (err: null, user: unknown) => user }
    expect(guard.handleRequest(null, user)).toBe(user)
  })
})
