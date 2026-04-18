import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common'
import { JourneysService } from './journeys.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'
import { Journey } from './entities/journey.entity'

@Controller('journeys')
@UseGuards(JwtAuthGuard)
export class JourneysController {
  constructor(private readonly service: JourneysService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: Partial<Journey>) {
    return this.service.create(tenantId, body)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: Partial<Journey>) {
    return this.service.update(tenantId, id, body)
  }
}
