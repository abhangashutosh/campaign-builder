import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChannelConfig } from './entities/channel-config.entity'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { DomainVerificationService } from './domain-verification.service'

@Module({
  imports: [TypeOrmModule.forFeature([ChannelConfig])],
  providers: [SettingsService, DomainVerificationService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
