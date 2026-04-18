export interface EmailSendOptions {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Record<string, string>
}

export interface EmailSendResult {
  messageId: string
  provider: string
}

export class EmailSendError extends Error {
  readonly retryable: boolean
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'EmailSendError'
    this.statusCode = statusCode
    // 4xx errors are not retryable; 5xx are
    this.retryable = statusCode >= 500
  }
}

export interface IEmailProvider {
  send(opts: EmailSendOptions): Promise<EmailSendResult>
}
