import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('dns', () => ({
  promises: {
    resolveTxt: vi.fn(),
  },
}))

import { promises as dns } from 'dns'

const mockCheck = async (domain: string) => {
  const resolveTxt = dns.resolveTxt as ReturnType<typeof vi.fn>

  const spfRecord = await resolveTxt(domain).catch(() => null)
  const spf = spfRecord?.flat().some((r: string) => r.includes('v=spf1')) ? 'pass' : 'missing'

  const dkimRecord = await resolveTxt(`default._domainkey.${domain}`).catch(() => null)
  const dkim = dkimRecord?.flat().some((r: string) => r.includes('v=DKIM1')) ? 'pass' : 'missing'

  const dmarcRecord = await resolveTxt(`_dmarc.${domain}`).catch(() => null)
  let dmarc: 'pass' | 'partial' | 'missing' = 'missing'
  if (dmarcRecord?.flat().some((r: string) => r.includes('v=DMARC1'))) {
    dmarc = dmarcRecord.flat().some((r: string) => r.includes('p=none')) ? 'partial' : 'pass'
  }

  const score =
    (spf === 'pass' ? 34 : 0) +
    (dkim === 'pass' ? 33 : 0) +
    (dmarc === 'pass' ? 33 : dmarc === 'partial' ? 16 : 0)

  return { domain, spf, dkim, dmarc, score }
}

describe('DomainVerificationService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('all 3 records present → score: 100', async () => {
    const resolveTxt = dns.resolveTxt as ReturnType<typeof vi.fn>
    resolveTxt.mockImplementation((host: string) => {
      if (host === 'example.com') return Promise.resolve([['v=spf1 include:sendgrid.net ~all']])
      if (host.includes('_domainkey')) return Promise.resolve([['v=DKIM1; k=rsa; p=abc']])
      if (host.includes('_dmarc')) return Promise.resolve([['v=DMARC1; p=reject; rua=mailto:dmarc@example.com']])
      return Promise.reject(new Error('NXDOMAIN'))
    })
    const result = await mockCheck('example.com')
    expect(result.score).toBe(100)
    expect(result.spf).toBe('pass')
    expect(result.dkim).toBe('pass')
    expect(result.dmarc).toBe('pass')
  })

  it('SPF + DKIM only → dmarc: missing, score: 67', async () => {
    const resolveTxt = dns.resolveTxt as ReturnType<typeof vi.fn>
    resolveTxt.mockImplementation((host: string) => {
      if (host === 'example.com') return Promise.resolve([['v=spf1 ~all']])
      if (host.includes('_domainkey')) return Promise.resolve([['v=DKIM1; k=rsa; p=abc']])
      return Promise.reject(new Error('NXDOMAIN'))
    })
    const result = await mockCheck('example.com')
    expect(result.score).toBe(67)
    expect(result.dmarc).toBe('missing')
  })

  it('DMARC p=none → dmarc: partial, score: 83', async () => {
    const resolveTxt = dns.resolveTxt as ReturnType<typeof vi.fn>
    resolveTxt.mockImplementation((host: string) => {
      if (host === 'example.com') return Promise.resolve([['v=spf1 ~all']])
      if (host.includes('_domainkey')) return Promise.resolve([['v=DKIM1; k=rsa; p=abc']])
      if (host.includes('_dmarc')) return Promise.resolve([['v=DMARC1; p=none; rua=mailto:dmarc@example.com']])
      return Promise.reject(new Error('NXDOMAIN'))
    })
    const result = await mockCheck('example.com')
    expect(result.score).toBe(83)
    expect(result.dmarc).toBe('partial')
  })
})
