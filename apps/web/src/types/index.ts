export type CampaignType = 'one_time' | 'scheduled' | 'recurring' | 'triggered' | 'transactional' | 'journey' | 'api_triggered'
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'needs_review'
export type ChannelType = 'email' | 'whatsapp'

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  channels: ChannelType[]
  version: number
  abTestEnabled: boolean
  audienceSegmentId?: string
  templateId?: string
  scheduledFor?: string
  tags: string[]
  createdBy: string
  workspace: string
  folder?: string
  description?: string
  utmParams: { source?: string; medium?: string; campaign?: string; content?: string }
  abTestConfig: { goal?: string; windowDays?: number; attribution?: string }
  metadata: { frequencyCapPerDay?: number; quietHoursStart?: string; quietHoursEnd?: string; quietHoursTimezone?: string }
  createdAt: string
  updatedAt: string
}

export interface Segment {
  id: string
  name: string
  audienceEstimate?: number
  rules: { include: unknown[]; exclude: unknown[] }
  createdAt: string
}

export interface Template {
  id: string
  name: string
  type: ChannelType
  subject?: string
  approvalStatus: string
  category: string
  variables: string[]
  createdAt: string
}

export interface OverviewStats {
  totalContacts: number
  activeCampaigns: number
  emailsSentToday: number
  avgOpenRate: number
}

export interface Journey {
  id: string
  name: string
  status: string
  nodes: unknown[]
  createdAt: string
}

export interface DomainCheckResult {
  domain: string
  spf: 'pass' | 'fail' | 'missing'
  dkim: 'pass' | 'fail' | 'missing'
  dmarc: 'pass' | 'partial' | 'missing'
  score: number
}
