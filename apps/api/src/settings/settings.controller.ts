import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { DomainVerificationService } from './domain-verification.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { TenantId } from '../common/decorators/tenant.decorator'

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly domainVerificationService: DomainVerificationService,
  ) {}

  @Get('channels/:channel')
  getChannelConfig(@TenantId() tenantId: string, @Param('channel') channel: string) {
    return this.settingsService.getChannelConfig(tenantId, channel)
  }

  @Post('channels/:channel')
  upsertChannelConfig(
    @TenantId() tenantId: string,
    @Param('channel') channel: string,
    @Body() body: { provider: string; credentials: Record<string, unknown> },
  ) {
    return this.settingsService.upsertChannelConfig(tenantId, channel, body.provider, body.credentials)
  }

  @Get('domains')
  getDomains(@TenantId() tenantId: string) {
    return this.domainVerificationService.getDomains(tenantId)
  }

  @Post('domains/:domain/verify')
  verifyDomain(@Param('domain') domain: string) {
    return this.domainVerificationService.check(domain)
  }
}
