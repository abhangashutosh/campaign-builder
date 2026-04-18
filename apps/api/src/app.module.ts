import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import appConfig from './common/config/app.config'
import databaseConfig from './common/config/database.config'
import { HealthModule } from './health/health.module'
import { ContactsModule } from './contacts/contacts.module'
import { SegmentsModule } from './segments/segments.module'
import { TemplatesModule } from './templates/templates.module'
import { CampaignsModule } from './campaigns/campaigns.module'
import { JourneysModule } from './journeys/journeys.module'
import { SettingsModule } from './settings/settings.module'
import { EventsGateway } from './events/events.gateway'
import * as Joi from 'joi'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema: Joi.object({
        APP_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        APP_PORT: Joi.number().default(4000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        ENCRYPTION_KEY: Joi.string().min(64).required(),
      }),
      validationOptions: { abortEarly: true },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: process.env.APP_ENV === 'development',
      }),
    }),
    BullModule.forRoot({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    HealthModule,
    ContactsModule,
    SegmentsModule,
    TemplatesModule,
    CampaignsModule,
    JourneysModule,
    SettingsModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
