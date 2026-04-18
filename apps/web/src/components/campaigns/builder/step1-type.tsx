'use client'

import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import type { CampaignType, ChannelType } from '@/types'

const CAMPAIGN_TYPES: { type: CampaignType; label: string; description: string }[] = [
  { type: 'one_time', label: 'One-time', description: 'Send once to a segment' },
  { type: 'recurring', label: 'Recurring', description: 'Repeat on a schedule' },
  { type: 'triggered', label: 'Triggered', description: 'Fire on user behavior' },
  { type: 'transactional', label: 'Transactional', description: 'Receipts, OTPs, alerts — bypass marketing consent' },
  { type: 'journey', label: 'Journey', description: 'Multi-step path with branches, waits and conditions' },
  { type: 'api_triggered', label: 'API-triggered', description: 'Send via REST API on demand from your backend' },
]

const STARTING_TEMPLATES = [
  { id: 'welcome', label: 'Welcome Series' },
  { id: 'cart', label: 'Cart Abandonment' },
  { id: 'reengagement', label: 'Re-engagement' },
  { id: 'blank', label: 'Blank Canvas' },
  { id: 'transactional_receipt', label: 'Transactional Receipt' },
]

const CHANNELS: { value: ChannelType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

export function Step1Type() {
  const { step1, updateStep1, setCurrentStep } = useCampaignBuilderStore()

  const toggleChannel = (ch: ChannelType) => {
    const has = step1.channels.includes(ch)
    updateStep1({ channels: has ? step1.channels.filter((c) => c !== ch) : [...step1.channels, ch] })
  }

  const canContinue = step1.name.trim() && step1.type && step1.channels.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Campaign Details</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Start by choosing a type and naming your campaign</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Campaign Name *</label>
        <input
          className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          placeholder="e.g. Summer Re-engagement"
          value={step1.name}
          onChange={(e) => updateStep1({ name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Campaign Type *</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAMPAIGN_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => updateStep1({ type })}
              className="rounded-lg border p-3 text-left transition-all"
              style={{
                borderColor: step1.type === type ? 'var(--navy)' : 'var(--border)',
                background: step1.type === type ? 'var(--navy-50)' : 'var(--card)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: step1.type === type ? 'var(--navy)' : 'var(--text)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Channels *</label>
        <div className="flex gap-3">
          {CHANNELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleChannel(value)}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-all"
              style={{
                borderColor: step1.channels.includes(value) ? 'var(--navy)' : 'var(--border)',
                background: step1.channels.includes(value) ? 'var(--navy-50)' : 'var(--card)',
                color: step1.channels.includes(value) ? 'var(--navy)' : 'var(--text-2)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Description</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          rows={3}
          placeholder="Internal notes about this campaign…"
          value={step1.description}
          onChange={(e) => updateStep1({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Workspace</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step1.workspace}
            onChange={(e) => updateStep1({ workspace: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>A/B Test</label>
          <button
            onClick={() => updateStep1({ abTestEnabled: !step1.abTestEnabled })}
            className="flex items-center gap-2 text-sm"
            style={{ color: step1.abTestEnabled ? 'var(--navy)' : 'var(--text-2)' }}
          >
            <span
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ background: step1.abTestEnabled ? 'var(--navy)' : 'var(--border)' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: `translateX(${step1.abTestEnabled ? '1.1rem' : '0.1rem'})` }}
              />
            </span>
            {step1.abTestEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Starting Templates</p>
        <div className="flex flex-wrap gap-2">
          {STARTING_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateStep1({ templateId: t.id })}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              style={{
                borderColor: step1.templateId === t.id ? 'var(--navy)' : 'var(--border)',
                background: step1.templateId === t.id ? 'var(--navy-50)' : 'transparent',
                color: step1.templateId === t.id ? 'var(--navy)' : 'var(--text-2)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          disabled={!canContinue}
          onClick={() => setCurrentStep(2)}
          className="rounded-md px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--navy)' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
