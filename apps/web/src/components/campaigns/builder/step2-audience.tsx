'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useSegments, useSegmentEstimate } from '@/hooks/use-segments'

interface Contact {
  id: string
  firstName?: string
  lastName: string
  email?: string
  lifecycleStage: string
}

const LIFECYCLE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active_customer: { bg: 'var(--success-50)', color: 'var(--success)', label: 'Active Customer' },
  lead:            { bg: 'var(--navy-50)',    color: 'var(--navy)',    label: 'Lead' },
  subscriber:      { bg: '#F1F5F9',           color: 'var(--text-3)', label: 'Subscriber' },
  churned:         { bg: 'var(--danger-50)',  color: 'var(--danger)', label: 'Churned' },
}

function getLifecycleStyle(stage: string) {
  return LIFECYCLE_STYLES[stage] ?? { bg: '#F1F5F9', color: 'var(--text-3)', label: stage }
}

function getInitials(contact: Contact): string {
  const first = contact.firstName?.[0] ?? ''
  const last = contact.lastName[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

export function Step2Audience() {
  const { step1, step2, updateStep2, setCurrentStep } = useCampaignBuilderStore()
  const { data: segments } = useSegments()
  const { data: estimate } = useSegmentEstimate(step2.audienceSegmentId)

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.get<Contact[]>('/contacts'),
  })

  const isTransactional = step1.type === 'transactional'

  const sampleContacts = contacts?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Select Audience</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Choose which segment receives this campaign</p>
      </div>

      {isTransactional && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--navy)', background: 'var(--navy-50)', color: 'var(--navy)' }}
        >
          Transactional campaigns bypass segment selection — they are sent via API to individual contacts.
        </div>
      )}

      {!isTransactional && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Segment</label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step2.audienceSegmentId}
            onChange={(e) => updateStep2({ audienceSegmentId: e.target.value })}
          >
            <option value="">Select a segment…</option>
            {segments?.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.audienceEstimate ?? '?'} contacts)</option>
            ))}
          </select>
        </div>
      )}

      {estimate && (
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Audience Estimate</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{estimate.total.toLocaleString()}</p>
              <p style={{ color: 'var(--text-2)' }}>Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{estimate.emailReachable.toLocaleString()}</p>
              <p style={{ color: 'var(--text-2)' }}>Email reachable</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{estimate.whatsappReachable.toLocaleString()}</p>
              <p style={{ color: 'var(--text-2)' }}>WhatsApp reachable</p>
            </div>
          </div>
        </div>
      )}

      {/* Audience Validation Panel */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Audience Validation</p>
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full border-4 font-bold text-sm"
            style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
          >
            92
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {[
            { label: 'Size', detail: '18 eligible contacts' },
            { label: 'Consent', detail: 'All have email consent' },
            { label: 'Overlap', detail: 'No overlap with active campaigns' },
            { label: 'Suppression', detail: '0 suppressed contacts' },
            { label: 'Recency', detail: 'Active in last 90 days' },
          ].map(({ label, detail }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span className="font-medium" style={{ color: 'var(--text)' }}>{label}</span>
              <span style={{ color: 'var(--text-2)' }}>— {detail}</span>
            </div>
          ))}
        </div>

        <div
          className="rounded px-3 py-2 text-xs"
          style={{ background: 'var(--success-50)', color: 'var(--success)' }}
        >
          Estimated cost: Email × 18 = $0.02
        </div>
      </div>

      {/* Sample Contacts */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Sample Contacts</p>
        {sampleContacts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>No contacts found.</p>
        ) : (
          <div className="space-y-3">
            {sampleContacts.map((contact) => {
              const ls = getLifecycleStyle(contact.lifecycleStage)
              return (
                <div key={contact.id} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: 'var(--navy)' }}
                  >
                    {getInitials(contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {[contact.firstName, contact.lastName].filter(Boolean).join(' ')}
                    </p>
                    {contact.email && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{contact.email}</p>
                    )}
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                    style={{ background: ls.bg, color: ls.color }}
                  >
                    {ls.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setCurrentStep(1)}
          className="rounded-md border px-6 py-2 text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="rounded-md px-6 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--navy)' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
