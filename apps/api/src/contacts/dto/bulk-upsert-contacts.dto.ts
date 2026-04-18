import { IsArray, IsEmail, IsOptional, IsString, Matches, ArrayMaxSize, ValidateNested, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

export class ContactDto {
  @IsString()
  externalId!: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'phone must be E.164 format' })
  phone?: string

  @IsOptional()
  attributes?: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  consentEmail?: boolean

  @IsOptional()
  @IsBoolean()
  consentWhatsapp?: boolean

  @IsOptional()
  @IsString()
  lifecycleStage?: string
}

export class BulkUpsertContactsDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts!: ContactDto[]
}
