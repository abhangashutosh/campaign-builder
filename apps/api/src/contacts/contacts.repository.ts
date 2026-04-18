import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Contact } from './entities/contact.entity'
import { TenantScopedRepository } from '../common/repositories/tenant-scoped.repository'

@Injectable()
export class ContactsRepository extends TenantScopedRepository<Contact> {
  protected repo: Repository<Contact>

  constructor(
    @InjectRepository(Contact)
    repo: Repository<Contact>,
  ) {
    super()
    this.repo = repo
  }

  async bulkUpsert(tenantId: string, contacts: Partial<Contact>[]): Promise<Contact[]> {
    this.assertTenant(tenantId)
    const values = contacts.map((c) => ({ ...c, tenantId }))
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Contact)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values(values as any)
      .orUpdate(
        ['first_name', 'last_name', 'email', 'phone', 'attributes', 'consent_email', 'consent_whatsapp', 'lifecycle_stage', 'updated_at'],
        ['tenant_id', 'external_id'],
      )
      .execute()
    return this.repo.find({ where: { tenantId } as any })
  }
}
