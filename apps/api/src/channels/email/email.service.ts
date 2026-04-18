import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'
import { EmailSendOptions, EmailSendResult, EmailSendError, IEmailProvider } from './email.types'

/**
 * EmailService wraps the Resend SDK.
 * Retry logic (exponential backoff x3) lives in the BullMQ processor — NOT here.
 * This service throws EmailSendError with retryable flag so the processor can decide.
 *
 * SECURITY: bodyHtml is NEVER constructed from raw user input.
 * Dynamic values are rendered via React Email components (HTML-escaped by React).
 */
@Injectable()
export class EmailService implements IEmailProvider {
  private readonly client: Resend
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') ?? 're_placeholder'
    this.client = new Resend(apiKey)
  }

  async send(opts: EmailSendOptions): Promise<EmailSendResult> {
    this.logger.debug(`Sending email to ${opts.to} via Resend`)

    let result: Awaited<ReturnType<typeof this.client.emails.send>>

    try {
      result = await this.client.emails.send({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      })
    } catch (err: unknown) {
      // Network-level error — treat as 5xx retryable
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new EmailSendError(`Resend network error: ${message}`, 503)
    }

    if (result.error) {
      const statusCode = (result.error as { statusCode?: number }).statusCode ?? 500
      throw new EmailSendError(result.error.message, statusCode)
    }

    const messageId = result.data?.id ?? 'unknown'
    this.logger.debug(`Email sent: messageId=${messageId}`)

    return { messageId, provider: 'resend' }
  }
}
