import { Injectable } from '@nestjs/common'
import { ContactsRepository } from './contacts.repository'
import { BulkUpsertContactsDto } from './dto/bulk-upsert-contacts.dto'
import { Contact } from './entities/contact.entity'

@Injectable()
export class ContactsService {
  constructor(private readonly repo: ContactsRepository) {}

  async bulkUpsert(tenantId: string, dto: BulkUpsertContactsDto): Promise<Contact[]> {
    return this.repo.bulkUpsert(tenantId, dto.contacts as Partial<Contact>[])
  }

  async findAll(tenantId: string, segmentId?: string): Promise<Contact[]> {
    if (segmentId) {
      return this.repo.findAll(tenantId, {
        where: { tenantId, deletedAt: null } as any,
      })
    }
    return this.repo.findAll(tenantId)
  }

  async updateConsent(
    tenantId: string,
    id: string,
    consentEmail?: boolean,
    consentWhatsapp?: boolean,
  ): Promise<Contact> {
    const contact = await this.repo.findOneOrFail(tenantId, id)
    if (consentEmail !== undefined) contact.consentEmail = consentEmail
    if (consentWhatsapp !== undefined) contact.consentWhatsapp = consentWhatsapp
    return (this.repo as any).repo.save(contact)
  }
}
