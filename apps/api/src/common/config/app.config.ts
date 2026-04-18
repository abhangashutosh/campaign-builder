import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  env: process.env.APP_ENV || 'development',
  port: parseInt(process.env.APP_PORT || '4000', 10),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'campaigns@example.com',
}))
