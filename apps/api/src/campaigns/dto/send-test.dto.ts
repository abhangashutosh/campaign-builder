import { IsEmail, IsOptional, IsString } from 'class-validator'

export class SendTestDto {
  @IsEmail()
  testEmail!: string

  @IsString()
  @IsOptional()
  previewName?: string
}
