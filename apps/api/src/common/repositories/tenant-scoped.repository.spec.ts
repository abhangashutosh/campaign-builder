import { describe, it, expect } from 'vitest'

describe('TenantScopedRepository.assertTenant', () => {
  const assertTenant = (tenantId: string) => {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('tenantId is required for all repository operations')
    }
  }

  it('throws when tenantId is empty string', () => {
    expect(() => assertTenant('')).toThrow('tenantId is required')
  })

  it('throws when tenantId is whitespace', () => {
    expect(() => assertTenant('   ')).toThrow('tenantId is required')
  })

  it('does not throw when tenantId is valid', () => {
    expect(() => assertTenant('tenant-123')).not.toThrow()
  })
})
