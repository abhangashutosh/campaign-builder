import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Template } from './entities/template.entity'
import { TemplatesRepository } from './templates.repository'
import { TemplatesService } from './templates.service'
import { TemplatesController } from './templates.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  providers: [TemplatesRepository, TemplatesService],
  controllers: [TemplatesController],
  exports: [TemplatesService],
})
export class TemplatesModule {}
