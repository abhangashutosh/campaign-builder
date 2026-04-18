import { describe, it, expect, vi } from 'vitest'

// Mock TypeORM decorators before any entity imports
vi.mock('typeorm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('typeorm')>()
  return {
    ...actual,
    Entity: () => () => {},
    PrimaryGeneratedColumn: () => () => {},
    Column: () => () => {},
    CreateDateColumn: () => () => {},
    UpdateDateColumn: () => () => {},
    DeleteDateColumn: () => () => {},
    ManyToOne: () => () => {},
    JoinColumn: () => () => {},
    Index: () => () => {},
    OneToMany: () => () => {},
    ManyToMany: () => () => {},
    JoinTable: () => () => {},
    OneToOne: () => () => {},
  }
})

vi.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}))

vi.mock('@nestjs/common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nestjs/common')>()
  return {
    ...actual,
    Injectable: () => () => {},
  }
})

vi.mock('@nestjs/config', () => ({
  ConfigService: class {},
}))

vi.mock('@campaign/shared', () => ({}))

import { BadRequestException } from '@nestjs/common'
import { CampaignsService } from './campaigns.service'

function makeCampaign(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1', tenantId: 't1', name: 'Test Campaign', type: 'one_time',
    status: 'draft', channels: ['email'], audienceSegmentId: 's1',
    templateId: 'tmpl1', version: 1, abTestEnabled: false,
    tags: [], utmParams: {}, abTestConfig: {}, metadata: {},
    template: { id: 'tmpl1', subject: 'Hello', approvalStatus: 'approved', htmlBody: '<p>hi</p>', textBody: null },
    segment: { id: 's1', name: 'All Users' },
    ...overrides,
  }
}

function makeService(campaign: ReturnType<typeof makeCampaign>, estimateTotal = 100) {
  const repo = {
    findWithRelations: vi.fn().mockResolvedValue(campaign),
    findAllWithRelations: vi.fn().mockResolvedValue([campaign]),
    findOneOrFail: vi.fn().mockResolvedValue(campaign),
    create: vi.fn(),
    update: vi.fn().mockImplementation((_t: string, _id: string, data: unknown) =>
      Promise.resolve({ ...campaign, ...(data as object) })),
    softDelete: vi.fn(),
    findAll: vi.fn().mockResolvedValue([campaign]),
  }
  const deliveryEventRepo = {}
  const segmentsService = {
    estimate: vi.fn().mockResolvedValue({ total: estimateTotal, emailReachable: 80, whatsappReachable: 60 }),
  }
  const templatesService = { findOne: vi.fn() }
  const emailService = {
    send: vi.fn().mockResolvedValue({ messageId: 'msg-test-123', provider: 'resend' }),
  }
  const config = { get: vi.fn().mockReturnValue('campaigns@example.com') }

  return {
    svc: new CampaignsService(
      repo as any, deliveryEventRepo as any, segmentsService as any,
      templatesService as any, emailService as any, config as any,
    ),
    emailService,
    segmentsService,
  }
}

describe('CampaignsService.getReadiness — template approved check', () => {
  it('passes when template.approvalStatus === approved', async () => {
    const { svc } = makeService(makeCampaign())
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Template approved')!.passed).toBe(true)
  })

  it('fails when template.approvalStatus is draft', async () => {
    const { svc } = makeService(makeCampaign({ template: { subject: 'Hi', approvalStatus: 'draft', htmlBody: '' } }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Template approved')!.passed).toBe(false)
  })

  it('fails when no template assigned', async () => {
    const { svc } = makeService(makeCampaign({ templateId: null, template: null }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Template approved')!.passed).toBe(false)
  })
})

describe('CampaignsService.getReadiness — segment estimate check', () => {
  it('passes when estimate.total > 0', async () => {
    const { svc } = makeService(makeCampaign(), 500)
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Segment estimate > 0')!.passed).toBe(true)
  })

  it('fails when estimate.total === 0', async () => {
    const { svc } = makeService(makeCampaign(), 0)
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Segment estimate > 0')!.passed).toBe(false)
  })

  it('passes for transactional campaigns without a segment', async () => {
    const { svc } = makeService(makeCampaign({ type: 'transactional', audienceSegmentId: null }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Segment estimate > 0')!.passed).toBe(true)
  })
})

describe('CampaignsService.getReadiness — subject line check', () => {
  it('fails when email channel is set but subject is empty', async () => {
    const { svc } = makeService(makeCampaign({ channels: ['email'], template: { subject: '', approvalStatus: 'approved', htmlBody: '' } }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Subject line (email)')!.passed).toBe(false)
  })

  it('passes when email channel and subject are set', async () => {
    const { svc } = makeService(makeCampaign({ channels: ['email'] }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Subject line (email)')!.passed).toBe(true)
  })

  it('passes for whatsapp-only campaigns regardless of subject', async () => {
    const { svc } = makeService(makeCampaign({ channels: ['whatsapp'], template: { subject: null, approvalStatus: 'approved', htmlBody: '' } }))
    const r = await svc.getReadiness('t1', 'c1')
    expect(r.checks.find(c => c.name === 'Subject line (email)')!.passed).toBe(true)
  })
})

describe('CampaignsService.sendTest', () => {
  it('sends email with [TEST] prefix and returns messageId', async () => {
    const { svc, emailService } = makeService(makeCampaign())
    const result = await svc.sendTest('t1', 'c1', 'qa@example.com')
    expect(result.messageId).toBe('msg-test-123')
    expect(emailService.send.mock.calls[0][0].subject).toBe('[TEST] Hello')
    expect(emailService.send.mock.calls[0][0].to).toBe('qa@example.com')
    expect(emailService.send.mock.calls[0][0].tags.send_type).toBe('test')
  })

  it('throws when no template is assigned', async () => {
    const { svc } = makeService(makeCampaign({ templateId: null, template: null }))
    await expect(svc.sendTest('t1', 'c1', 'qa@example.com'))
      .rejects.toThrow('does not have a template assigned')
  })

  it('falls back to campaign name in subject when template subject is blank', async () => {
    const { svc, emailService } = makeService(
      makeCampaign({ name: 'Promo Oct', template: { subject: '', approvalStatus: 'draft', htmlBody: '' } })
    )
    await svc.sendTest('t1', 'c1', 'qa@example.com')
    expect(emailService.send.mock.calls[0][0].subject).toBe('[TEST] Promo Oct')
  })
})
