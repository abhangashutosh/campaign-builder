import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { TemplatesService } from './templates.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'
import { Template } from './entities/template.entity'

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query('type') type?: string) {
    return this.service.findAll(tenantId, type)
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: Partial<Template>) {
    return this.service.create(tenantId, body)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: Partial<Template>) {
    return this.service.update(tenantId, id, body)
  }

  @Delete(':id')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.delete(tenantId, id)
  }

  @Patch(':id/approve')
  approve(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.approve(tenantId, id)
  }
}
