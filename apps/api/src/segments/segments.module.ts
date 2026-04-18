import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Segment } from './entities/segment.entity'
import { SegmentsRepository } from './segments.repository'
import { SegmentsService } from './segments.service'
import { SegmentsController } from './segments.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Segment])],
  providers: [SegmentsRepository, SegmentsService],
  controllers: [SegmentsController],
  exports: [SegmentsService],
})
export class SegmentsModule {}
