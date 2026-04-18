import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Contact } from './entities/contact.entity'
import { ContactsRepository } from './contacts.repository'
import { ContactsService } from './contacts.service'
import { ContactsController } from './contacts.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  providers: [ContactsRepository, ContactsService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
