import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { SegmentsService } from './segments.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'
import { SegmentRules } from '@campaign/shared'

@Controller('segments')
@UseGuards(JwtAuthGuard)
export class SegmentsController {
  constructor(private readonly service: SegmentsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: { name: string; rules?: SegmentRules }) {
    return this.service.create(tenantId, body)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: Partial<{ name: string; rules: SegmentRules }>) {
    return this.service.update(tenantId, id, body)
  }

  @Delete(':id')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.delete(tenantId, id)
  }

  @Get(':id/estimate')
  estimate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.estimate(tenantId, id)
  }
}
