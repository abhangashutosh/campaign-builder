import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Template } from './entities/template.entity'
import { TenantScopedRepository } from '../common/repositories/tenant-scoped.repository'

@Injectable()
export class TemplatesRepository extends TenantScopedRepository<Template> {
  protected repo: Repository<Template>

  constructor(
    @InjectRepository(Template)
    repo: Repository<Template>,
  ) {
    super()
    this.repo = repo
  }

  async create(tenantId: string, data: Partial<Template>): Promise<Template> {
    this.assertTenant(tenantId)
    const template = this.repo.create({ ...data, tenantId })
    return this.repo.save(template)
  }

  async update(tenantId: string, id: string, data: Partial<Template>): Promise<Template> {
    const template = await this.findOneOrFail(tenantId, id)
    Object.assign(template, data)
    return this.repo.save(template)
  }
}
