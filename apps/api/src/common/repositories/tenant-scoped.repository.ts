import { Repository, FindManyOptions, FindOneOptions } from 'typeorm'
import { NotFoundException } from '@nestjs/common'

export abstract class TenantScopedRepository<T extends { tenantId: string; deletedAt?: Date | null }> {
  protected abstract repo: Repository<T>

  protected assertTenant(tenantId: string): void {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('tenantId is required for all repository operations')
    }
  }

  async findAll(tenantId: string, opts?: FindManyOptions<T>): Promise<T[]> {
    this.assertTenant(tenantId)
    return this.repo.find({
      ...opts,
      where: {
        ...(opts?.where as object),
        tenantId,
        deletedAt: null,
      } as unknown as FindManyOptions<T>['where'],
    })
  }

  async findOne(tenantId: string, id: string): Promise<T | null> {
    this.assertTenant(tenantId)
    return this.repo.findOne({
      where: { id, tenantId, deletedAt: null } as unknown as FindOneOptions<T>['where'],
    })
  }

  async findOneOrFail(tenantId: string, id: string): Promise<T> {
    const entity = await this.findOne(tenantId, id)
    if (!entity) {
      throw new NotFoundException(`Resource ${id} not found`)
    }
    return entity
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    this.assertTenant(tenantId)
    const entity = await this.findOneOrFail(tenantId, id)
    await this.repo.save({ ...entity, deletedAt: new Date() } as T)
  }
}
