import { Controller, Get, UseGuards } from '@nestjs/common'
import { OverviewService } from './overview.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'

@Controller('overview')
@UseGuards(JwtAuthGuard)
export class OverviewController {
  constructor(private readonly service: OverviewService) {}

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId)
  }
}
