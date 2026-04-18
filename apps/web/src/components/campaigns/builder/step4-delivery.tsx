'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'

const SUPPRESSION_OPTS = [
  'Completed Onboarding',
  'Opted Out',
  'Hard Bounced',
  'Unsubscribed',
  'Already received this week',
] as const

const RATE_LIMIT_OPTIONS = ['none', '500', '1000', 'unlimited'] as const
type RateLimit = (typeof RATE_LIMIT_OPTIONS)[number]

function rateLimitLabel(r: RateLimit): string {
  if (r === 'none') return 'No limit'
  if (r === 'unlimited') return 'Unlimited'
  return `${r}/s`
}

const estimatedContacts = 18

export function Step4Delivery() {
  const { step1, step4: rawStep4, updateStep4, setCurrentStep } = useCampaignBuilderStore()
  const step4 = {
    ...rawStep4,
    suppressionRules: rawStep4.suppressionRules ?? [],
    rateLimit: rawStep4.rateLimit ?? '1000',
    stoEnabled: rawStep4.stoEnabled ?? false,
  }
  const [utmOpen, setUtmOpen] = useState(false)

  function toggleSuppression(opt: string, checked: boolean) {
    const next = checked
      ? [...step4.suppressionRules, opt]
      : step4.suppressionRules.filter((r) => r !== opt)
    updateStep4({ suppressionRules: next })
  }

  const scheduleLabel = step4.scheduledFor
    ? new Date(step4.scheduledFor).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'sends immediately'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Delivery Rules</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Configure when and how to send</p>
      </div>

      {/* Smart Time Optimization */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Smart Time Optimization</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
              Send at the optimal time for each recipient
            </p>
          </div>
          <button
            onClick={() => updateStep4({ stoEnabled: !step4.stoEnabled })}
            className="relative inline-flex h-6 w-11 rounded-full transition-colors"
            style={{ background: step4.stoEnabled ? 'var(--teal)' : 'var(--border)' }}
            aria-label="Toggle Smart Time Optimization"
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5"
              style={{ transform: step4.stoEnabled ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
        {step4.stoEnabled && (
          <div
            className="mt-3 rounded px-3 py-2 text-xs"
            style={{ background: 'var(--teal-50)', color: 'var(--teal)' }}
          >
            ✓ STO Enabled · Recommended window: Tue–Thu · 09:00–11:00 local
          </div>
        )}
      </div>

      {/* Frequency Cap + Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Frequency Cap (per day)
          </label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="e.g. 2"
            value={step4.metadata.frequencyCapPerDay || ''}
            onChange={(e) =>
              updateStep4({
                metadata: {
                  ...step4.metadata,
                  frequencyCapPerDay: parseInt(e.target.value) || undefined,
                },
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Schedule (optional)
          </label>
          <input
            type="datetime-local"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.scheduledFor}
            onChange={(e) => updateStep4({ scheduledFor: e.target.value })}
          />
        </div>
      </div>

      {/* Rate Limiting */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          Rate Limit
        </label>
        <div className="flex gap-2 flex-wrap">
          {RATE_LIMIT_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => updateStep4({ rateLimit: r })}
              className="px-3 py-1.5 rounded border text-sm transition-colors"
              style={{
                borderColor: step4.rateLimit === r ? 'var(--navy)' : 'var(--border)',
                background: step4.rateLimit === r ? 'var(--navy-50)' : 'var(--card)',
                color: step4.rateLimit === r ? 'var(--navy)' : 'var(--text-2)',
              }}
            >
              {rateLimitLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Quiet Hours Start
          </label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.metadata.quietHoursStart || ''}
            onChange={(e) =>
              updateStep4({ metadata: { ...step4.metadata, quietHoursStart: e.target.value } })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Quiet Hours End
          </label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.metadata.quietHoursEnd || ''}
            onChange={(e) =>
              updateStep4({ metadata: { ...step4.metadata, quietHoursEnd: e.target.value } })
            }
          />
        </div>
      </div>

      {/* Suppression Rules */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          Suppression Rules
        </label>
        <div className="space-y-2">
          {SUPPRESSION_OPTS.map((opt) => {
            const checked = step4.suppressionRules.includes(opt)
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleSuppression(opt, e.target.checked)}
                  className="rounded"
                  style={{ accentColor: 'var(--navy)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text)' }}>{opt}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* UTM Parameters */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          style={{ color: 'var(--text)' }}
          onClick={() => setUtmOpen(!utmOpen)}
        >
          UTM Parameters
          {utmOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {utmOpen && (
          <div
            className="border-t p-4 grid grid-cols-2 gap-3"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['source', 'medium', 'campaign', 'content'] as const).map((key) => (
              <div key={key}>
                <label
                  className="block text-xs font-medium mb-1 capitalize"
                  style={{ color: 'var(--text-2)' }}
                >
                  utm_{key}
                </label>
                <input
                  className="w-full rounded border px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  value={step4.utmParams[key]}
                  onChange={(e) =>
                    updateStep4({ utmParams: { ...step4.utmParams, [key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* A/B Test Config */}
      {step1.abTestEnabled && (
        <div
          className="rounded-lg border p-4 space-y-3"
          style={{ borderColor: 'var(--navy)', background: 'var(--navy-50)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>A/B Test Configuration</p>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>
              Conversion Goal
            </label>
            <input
              className="w-full rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
              placeholder="e.g. Completed Onboarding"
              value={step4.abTestConfig.goal}
              onChange={(e) =>
                updateStep4({ abTestConfig: { ...step4.abTestConfig, goal: e.target.value } })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                Window (days)
              </label>
              <input
                type="number"
                className="w-full rounded border px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
                value={step4.abTestConfig.windowDays}
                onChange={(e) =>
                  updateStep4({
                    abTestConfig: {
                      ...step4.abTestConfig,
                      windowDays: parseInt(e.target.value) || 7,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                Attribution Model
              </label>
              <select
                className="w-full rounded border px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
                value={step4.abTestConfig.attribution}
                onChange={(e) =>
                  updateStep4({
                    abTestConfig: { ...step4.abTestConfig, attribution: e.target.value },
                  })
                }
              >
                <option value="last_touch">Last-touch</option>
                <option value="first_touch">First-touch</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Send Projection */}
      <div
        className="rounded-lg border px-4 py-3"
        style={{ background: 'var(--teal-50)', borderColor: 'var(--teal)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>Send Projection</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          ~{estimatedContacts} recipients · {scheduleLabel}
        </p>
      </div>

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setCurrentStep(3)}
          className="rounded-md border px-6 py-2 text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="rounded-md px-6 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--navy)' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
