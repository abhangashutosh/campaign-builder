import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { BulkUpsertContactsDto } from './dto/bulk-upsert-contacts.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @Post()
  bulkUpsert(@TenantId() tenantId: string, @Body() dto: BulkUpsertContactsDto) {
    return this.service.bulkUpsert(tenantId, dto)
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('segment_id') segmentId?: string) {
    return this.service.findAll(tenantId, segmentId)
  }

  @Patch(':id/consent')
  updateConsent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { consentEmail?: boolean; consentWhatsapp?: boolean },
  ) {
    return this.service.updateConsent(tenantId, id, body.consentEmail, body.consentWhatsapp)
  }
}
