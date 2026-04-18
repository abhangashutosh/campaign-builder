'use client'
import { useState } from 'react'
import { Mail, MessageSquare, Zap, RefreshCw, Send, GitBranch, Clock, Radio } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useCreateCampaign } from '@/hooks/use-campaigns'
import { Panel } from '@/components/ui/panel'
import { TagInput } from '@/components/ui/tag-input'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { TypeCard } from './step1/type-card'
import { ChannelToggleCard } from './step1/channel-toggle-card'
import { GuidePanel } from './step1/guide-panel'
import type { CampaignType, ChannelType } from '@/types'
import type { LucideIcon } from 'lucide-react'

const CAMPAIGN_TYPES: { type: CampaignType; label: string; Icon: LucideIcon; description: string }[] = [
  { type: 'one_time',      label: 'One-time',      Icon: Send,      description: 'Send to a static audience immediately or on a date' },
  { type: 'recurring',     label: 'Recurring',     Icon: RefreshCw, description: 'Daily, weekly, or monthly cadence' },
  { type: 'triggered',     label: 'Triggered',     Icon: Zap,       description: 'Fires when a user performs an event' },
  { type: 'transactional', label: 'Transactional', Icon: Clock,     description: 'Receipts, OTPs — bypasses consent' },
  { type: 'journey',       label: 'Journey',       Icon: GitBranch, description: 'Multi-step automated path with branches' },
  { type: 'api_triggered', label: 'API-triggered', Icon: Radio,     description: 'Triggered via REST API from your backend' },
]

const CHANNELS: { channel: ChannelType; label: string; description: string; Icon: LucideIcon }[] = [
  { channel: 'email',    label: 'Email',    description: 'Rich HTML messages with tracking', Icon: Mail },
  { channel: 'whatsapp', label: 'WhatsApp', description: 'Approved templates with variables', Icon: MessageSquare },
]

const WORKSPACES = ['Product · Growth', 'Marketing', 'Sales', 'Support', 'Engineering']

export function Step1Type() {
  const { step1, updateStep1, campaignId, setCampaignId, setCurrentStep } = useCampaignBuilderStore()
  const createCampaign = useCreateCampaign()
  const [saving, setSaving] = useState(false)

  const canContinue = !!step1.name.trim() && !!step1.type && step1.channels.length > 0

  function toggleChannel(channel: ChannelType) {
    const next = step1.channels.includes(channel)
      ? step1.channels.filter((c) => c !== channel)
      : [...step1.channels, channel]
    updateStep1({ channels: next })
  }

  async function handleContinue() {
    if (!canContinue) return
    setSaving(true)
    try {
      if (!campaignId) {
        const campaign = await createCampaign.mutateAsync({
          name: step1.name,
          type: step1.type as CampaignType,
          channels: step1.channels,
          description: step1.description || undefined,
          tags: step1.tags || [],
          abTestEnabled: step1.abTestEnabled || false,
          workspace: step1.workspace,
          folder: step1.folder || undefined,
        })
        setCampaignId(campaign.id)
      }
      setCurrentStep(2)
    } catch (err) {
      console.error('Step 1 save failed:', err)
      // Still advance — state is in Zustand, API can be retried
      setCurrentStep(2)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="builder">
      {/* LEFT: Campaign Basics */}
      <Panel title="Campaign Basics" subtitle="Name and organize your campaign">
        <div className="field">
          <label className="label">Campaign Name *</label>
          <input
            className="input"
            value={step1.name}
            onChange={(e) => updateStep1({ name: e.target.value })}
            placeholder="e.g. Welcome Series — October 2026"
          />
        </div>
        <div className="field">
          <label className="label">Description</label>
          <textarea
            className="input textarea"
            value={step1.description}
            onChange={(e) => updateStep1({ description: e.target.value })}
            placeholder="Internal notes about this campaign"
          />
        </div>
        <div className="field">
          <label className="label">Workspace</label>
          <select
            className="input"
            value={step1.workspace}
            onChange={(e) => updateStep1({ workspace: e.target.value })}
          >
            {WORKSPACES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Tags</label>
          <TagInput value={step1.tags} onChange={(tags) => updateStep1({ tags })} placeholder="Add tags…" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>A/B Test</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Split audience into variants</div>
          </div>
          <ToggleSwitch
            checked={step1.abTestEnabled}
            onCheckedChange={(v) => updateStep1({ abTestEnabled: v })}
          />
        </div>
      </Panel>

      {/* MIDDLE: Type & Channel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Panel title="Campaign Type" subtitle="Choose how this campaign fires">
          <div className="type-cards">
            {CAMPAIGN_TYPES.map((ct) => (
              <TypeCard
                key={ct.type}
                type={ct.type}
                label={ct.label}
                description={ct.description}
                Icon={ct.Icon}
                selected={step1.type === ct.type}
                onSelect={(t) => updateStep1({ type: t })}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Channels" subtitle="Select one or more channels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHANNELS.map((ch) => (
              <ChannelToggleCard
                key={ch.channel}
                channel={ch.channel}
                label={ch.label}
                description={ch.description}
                Icon={ch.Icon}
                active={step1.channels.includes(ch.channel)}
                onToggle={toggleChannel}
              />
            ))}
          </div>
        </Panel>
      </div>

      {/* RIGHT: Guide */}
      <GuidePanel canContinue={canContinue} saving={saving} onNext={handleContinue} />
    </div>
  )
}
