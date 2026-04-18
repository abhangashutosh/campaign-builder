import { Injectable } from '@nestjs/common'
import { TemplatesRepository } from './templates.repository'
import { Template } from './entities/template.entity'

@Injectable()
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}

  async findAll(tenantId: string, type?: string): Promise<Template[]> {
    if (type) {
      return this.repo.findAll(tenantId, { where: { tenantId, type, deletedAt: null } as any })
    }
    return this.repo.findAll(tenantId)
  }

  async findOne(tenantId: string, id: string): Promise<Template> {
    return this.repo.findOneOrFail(tenantId, id)
  }

  async create(tenantId: string, data: Partial<Template>): Promise<Template> {
    return this.repo.create(tenantId, data)
  }

  async update(tenantId: string, id: string, data: Partial<Template>): Promise<Template> {
    return this.repo.update(tenantId, id, data)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    return this.repo.softDelete(tenantId, id)
  }

  async approve(tenantId: string, id: string): Promise<Template> {
    return this.repo.update(tenantId, id, { approvalStatus: 'approved' })
  }
}
