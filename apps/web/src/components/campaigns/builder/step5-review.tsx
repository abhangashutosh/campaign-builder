'use client'

import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useCampaignReadiness } from '@/hooks/use-campaigns'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export function Step5Review() {
  const { campaignId, step1, setCurrentStep } = useCampaignBuilderStore()
  const { data: readiness } = useCampaignReadiness(campaignId ?? '')

  const canPublish = readiness?.ready ?? false
  const version = 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Review & Publish</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Check your campaign before going live</p>
      </div>

      {readiness && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Readiness Score</p>
            <span
              className="text-2xl font-bold"
              style={{ color: readiness.score >= 80 ? 'var(--success)' : readiness.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}
            >
              {readiness.score}/100
            </span>
          </div>
          <div
            className="w-full rounded-full h-2 mb-4"
            style={{ background: 'var(--border)' }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${readiness.score}%`,
                background: readiness.score >= 80 ? 'var(--success)' : readiness.score >= 50 ? 'var(--warning)' : 'var(--danger)',
              }}
            />
          </div>

          {readiness.blockers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--danger)' }}>BLOCKERS</p>
              {readiness.blockers.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm mb-1">
                  <XCircle size={14} style={{ color: 'var(--danger)' }} />
                  <span style={{ color: 'var(--text)' }}>{b}</span>
                </div>
              ))}
            </div>
          )}

          {readiness.warnings.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--warning)' }}>WARNINGS</p>
              {readiness.warnings.map((w) => (
                <div key={w} className="flex items-center gap-2 text-sm mb-1">
                  <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                  <span style={{ color: 'var(--text)' }}>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className="rounded-lg border p-4 space-y-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <p><span style={{ color: 'var(--text-2)' }}>Name:</span> <span className="font-medium" style={{ color: 'var(--text)' }}>{step1.name}</span></p>
        <p><span style={{ color: 'var(--text-2)' }}>Type:</span> <span style={{ color: 'var(--text)' }}>{step1.type}</span></p>
        <p><span style={{ color: 'var(--text-2)' }}>Channels:</span> <span style={{ color: 'var(--text)' }}>{step1.channels.join(', ')}</span></p>
      </div>

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setCurrentStep(4)}
          className="rounded-md border px-6 py-2 text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          Back
        </button>
        <button
          disabled={!canPublish}
          className="rounded-md px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--navy)' }}
        >
          Publish v{version + 1}
        </button>
      </div>
    </div>
  )
}
