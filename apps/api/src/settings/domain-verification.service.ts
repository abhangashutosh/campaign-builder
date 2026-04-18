import { Injectable, NotFoundException } from '@nestjs/common'
import { promises as dns } from 'dns'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChannelConfig } from './entities/channel-config.entity'

export interface DomainCheckResult {
  domain: string
  spf: 'pass' | 'fail' | 'missing'
  dkim: 'pass' | 'fail' | 'missing'
  dmarc: 'pass' | 'partial' | 'missing'
  score: number
}

const HOSTNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

@Injectable()
export class DomainVerificationService {
  constructor(
    @InjectRepository(ChannelConfig)
    private readonly channelConfigRepo: Repository<ChannelConfig>,
  ) {}

  private validateHostname(domain: string): void {
    if (!HOSTNAME_REGEX.test(domain)) {
      throw new NotFoundException('Invalid domain format')
    }
  }

  async check(domain: string): Promise<DomainCheckResult> {
    this.validateHostname(domain)

    const [spf, dkim, dmarc] = await Promise.allSettled([
      dns.resolveTxt(domain).then((records) =>
        records.flat().some((r) => r.includes('v=spf1')) ? 'pass' : 'fail',
      ),
      dns.resolveTxt(`default._domainkey.${domain}`).then((records) =>
        records.flat().some((r) => r.includes('v=DKIM1')) ? 'pass' : 'fail',
      ),
      dns.resolveTxt(`_dmarc.${domain}`).then((records) => {
        const flat = records.flat()
        if (!flat.some((r) => r.includes('v=DMARC1'))) return 'missing'
        if (flat.some((r) => r.includes('p=none'))) return 'partial'
        return 'pass'
      }),
    ])

    const spfResult = spf.status === 'fulfilled' ? spf.value as 'pass' | 'fail' : 'missing'
    const dkimResult = dkim.status === 'fulfilled' ? dkim.value as 'pass' | 'fail' : 'missing'
    const dmarcResult = dmarc.status === 'fulfilled' ? dmarc.value as 'pass' | 'partial' | 'missing' : 'missing'

    const score =
      (spfResult === 'pass' ? 34 : 0) +
      (dkimResult === 'pass' ? 33 : 0) +
      (dmarcResult === 'pass' ? 33 : dmarcResult === 'partial' ? 16 : 0)

    return { domain, spf: spfResult, dkim: dkimResult, dmarc: dmarcResult, score }
  }

  async getDomains(tenantId: string): Promise<DomainCheckResult[]> {
    const configs = await this.channelConfigRepo.find({
      where: { tenantId, channel: 'email' } as any,
    })
    if (!configs.length) return []

    return Promise.all(
      configs.map((c) => {
        try {
          const creds = JSON.parse(c.credentials.toString())
          const domain = (creds as Record<string, string>).domain || (creds as Record<string, string>).from?.split('@')[1]
          if (!domain) return Promise.resolve({ domain: 'unknown', spf: 'missing' as const, dkim: 'missing' as const, dmarc: 'missing' as const, score: 0 })
          return this.check(domain)
        } catch {
          return Promise.resolve({ domain: 'unknown', spf: 'missing' as const, dkim: 'missing' as const, dmarc: 'missing' as const, score: 0 })
        }
      }),
    )
  }
}
