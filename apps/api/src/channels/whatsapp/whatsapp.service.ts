import { Injectable, Logger } from '@nestjs/common'

export interface WhatsAppSendOptions {
  to: string                 // E.164 phone number
  templateName: string       // approved WhatsApp template name
  languageCode: string       // e.g. 'en_US'
  variables: string[]        // positional {{1}}, {{2}} … replacements
  mediaUrl?: string          // optional media attachment
}

export interface WhatsAppSendResult {
  messageId: string
  provider: string
}

export class UnsupportedProviderError extends Error {
  constructor(provider: string) {
    super(`WhatsApp provider '${provider}' is not supported`)
    this.name = 'UnsupportedProviderError'
  }
}

export interface IWhatsAppProvider {
  send(opts: WhatsAppSendOptions): Promise<WhatsAppSendResult>
}

/**
 * MetaCloudApiProvider
 * Implements the Meta Cloud API for WhatsApp Business Platform.
 * Stub — HTTP call placeholder for the real Meta Graph API endpoint.
 */
class MetaCloudApiProvider implements IWhatsAppProvider {
  private readonly logger = new Logger('MetaCloudApiProvider')

  constructor(
    private readonly phoneNumberId: string,
    private readonly accessToken: string,
  ) {}

  async send(opts: WhatsAppSendOptions): Promise<WhatsAppSendResult> {
    this.logger.debug(`Sending WhatsApp to ${opts.to} via Meta Cloud API`)

    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: opts.to,
      type: 'template',
      template: {
        name: opts.templateName,
        language: { code: opts.languageCode },
        components: opts.variables.length
          ? [
              {
                type: 'body',
                parameters: opts.variables.map((v) => ({ type: 'text', text: v })),
              },
            ]
          : [],
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
      throw new Error(`Meta API error ${res.status}: ${errBody.error?.message ?? 'Unknown'}`)
    }

    const data = (await res.json()) as { messages?: Array<{ id: string }> }
    const messageId = data.messages?.[0]?.id ?? 'unknown'

    return { messageId, provider: 'meta_cloud_api' }
  }
}

/**
 * WhatsAppService
 * Factory-pattern: resolves the correct IWhatsAppProvider based on the
 * `provider` string stored in `channel_configs.credentials`.
 *
 * Supported providers: 'meta_cloud_api'
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name)

  resolveProvider(
    provider: string,
    credentials: Record<string, string>,
  ): IWhatsAppProvider {
    switch (provider) {
      case 'meta_cloud_api':
        return new MetaCloudApiProvider(
          credentials.phone_number_id ?? '',
          credentials.access_token ?? '',
        )
      default:
        throw new UnsupportedProviderError(provider)
    }
  }

  async send(
    provider: string,
    credentials: Record<string, string>,
    opts: WhatsAppSendOptions,
  ): Promise<WhatsAppSendResult> {
    const providerImpl = this.resolveProvider(provider, credentials)
    this.logger.debug(`Dispatching WhatsApp via provider=${provider} to ${opts.to}`)
    return providerImpl.send(opts)
  }
}
