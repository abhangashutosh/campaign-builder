export const QUEUE_NAMES = {
  CAMPAIGN_DISPATCH: 'campaign-dispatch',
  EMAIL_SEND: 'email-send',
  WHATSAPP_SEND: 'whatsapp-send',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

export interface CampaignDispatchJobData {
  tenantId: string
  campaignId: string
}

export interface EmailSendJobData {
  tenantId: string
  deliveryId: string
  to: string
  from: string
  subject: string
  html: string
}

export interface WhatsAppSendJobData {
  tenantId: string
  deliveryId: string
  to: string
  templateName: string
  languageCode: string
  variables: string[]
  provider: string
  credentials: Record<string, string>
}
