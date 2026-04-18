import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { CampaignsService } from './campaigns.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'
import { Campaign } from './entities/campaign.entity'
import { SendTestDto } from './dto/send-test.dto'

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: Partial<Campaign>) {
    return this.service.create(tenantId, body)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: Partial<Campaign>) {
    return this.service.update(tenantId, id, body)
  }

  @Delete(':id')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.delete(tenantId, id)
  }

  @Post(':id/publish')
  publish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.publish(tenantId, id)
  }

  @Post(':id/pause')
  pause(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.pause(tenantId, id)
  }

  @Get(':id/readiness')
  getReadiness(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.getReadiness(tenantId, id)
  }

  @Get(':id/reports')
  getReports(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.getReports(tenantId, id)
  }

  @Patch(':id')
  patch(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { id: _id, tenantId: _t, status: _s, version: _v,
            createdAt: _c, updatedAt: _u, deletedAt: _d, ...safe } = body as any
    return this.service.update(tenantId, id, safe)
  }

  @Post(':id/send-test')
  sendTest(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: SendTestDto,
  ) {
    return this.service.sendTest(tenantId, id, body.testEmail)
  }
}
