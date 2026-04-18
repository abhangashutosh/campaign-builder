import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChannelConfig } from './entities/channel-config.entity'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

@Injectable()
export class SettingsService {
  private readonly encryptionKey: Buffer

  constructor(
    @InjectRepository(ChannelConfig)
    private readonly repo: Repository<ChannelConfig>,
  ) {
    const key = process.env.ENCRYPTION_KEY || ''
    this.encryptionKey = Buffer.from(key, 'hex')
  }

  private encrypt(data: Record<string, unknown>): Buffer {
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return Buffer.concat([iv, authTag, encrypted])
  }

  private decrypt(data: Buffer): Record<string, unknown> {
    const iv = data.subarray(0, 12)
    const authTag = data.subarray(12, 28)
    const encrypted = data.subarray(28)
    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>
  }

  async getChannelConfig(tenantId: string, channel: string): Promise<{ channel: string; provider: string; isActive: boolean; healthStatus: string }> {
    const config = await this.repo.findOne({ where: { tenantId, channel } as any })
    if (!config) throw new NotFoundException(`Channel config for ${channel} not found`)
    return {
      channel: config.channel,
      provider: config.provider,
      isActive: config.isActive,
      healthStatus: config.healthStatus,
    }
  }

  async upsertChannelConfig(tenantId: string, channel: string, provider: string, credentials: Record<string, unknown>): Promise<{ channel: string; isActive: boolean }> {
    const encrypted = this.encrypt(credentials)
    const existing = await this.repo.findOne({ where: { tenantId, channel } as any })
    if (existing) {
      await this.repo.update(existing.id, { provider, credentials: encrypted, isActive: true })
    } else {
      await this.repo.save(this.repo.create({ tenantId, channel, provider, credentials: encrypted, isActive: true }))
    }
    return { channel, isActive: true }
  }
}
