'use client'

import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useSegments, useSegmentEstimate } from '@/hooks/use-segments'

export function Step2Audience() {
  const { step1, step2, updateStep2, setCurrentStep } = useCampaignBuilderStore()
  const { data: segments } = useSegments()
  const { data: estimate } = useSegmentEstimate(step2.audienceSegmentId)

  const isTransactional = step1.type === 'transactional'

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
