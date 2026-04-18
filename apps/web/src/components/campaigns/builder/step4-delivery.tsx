'use client'
import { useState } from 'react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useUpdateCampaign } from '@/hooks/use-campaigns'
import { Panel } from '@/components/ui/panel'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { EngagementHeatmap } from './step4/engagement-heatmap'
import { ThrottleBars } from './step4/throttle-bars'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

type ScheduleMode = 'now' | 'scheduled' | 'sto'

const SEND_MODES: { mode: ScheduleMode; label: string; desc: string }[] = [
  { mode: 'now',       label: 'Send Now',   desc: 'Dispatch immediately on publish' },
  { mode: 'scheduled', label: 'Schedule',   desc: 'Choose a specific date and time' },
  { mode: 'sto',       label: 'Smart Time', desc: 'Send when each recipient is most active' },
]

const FREQ_UNITS = ['per day', 'per week', 'per month']
const TIMEZONES  = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo']

const RATE_LIMIT_OPTIONS = ['none', '500', '1000', 'unlimited'] as const

function rateLimitToNumber(r: string): number {
  if (r === 'none' || r === 'unlimited') return 1000
  return parseInt(r, 10) || 1000
}

export function Step4Delivery() {
  const { step1, step4, updateStep4, campaignId, setCurrentStep } = useCampaignBuilderStore()
  const updateCampaign = useUpdateCampaign()

  const initMode: ScheduleMode = step4.stoEnabled ? 'sto' : step4.scheduledFor ? 'scheduled' : 'now'
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(initMode)
  const [utmOpen, setUtmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleScheduleMode(mode: ScheduleMode) {
    setScheduleMode(mode)
    updateStep4({ stoEnabled: mode === 'sto' })
  }

  async function handleContinue() {
    if (!campaignId) { setCurrentStep(5); return }
    setSaving(true)
    try {
      await updateCampaign.mutateAsync({
        id: campaignId,
        metadata: step4.metadata,
        utmParams: step4.utmParams,
        abTestConfig: step4.abTestConfig,
        stoEnabled: step4.stoEnabled,
        rateLimit: step4.rateLimit,
        suppressionRules: step4.suppressionRules,
        scheduledFor: scheduleMode === 'scheduled' && step4.scheduledFor ? step4.scheduledFor : undefined,
      } as Parameters<typeof updateCampaign.mutateAsync>[0])
      setCurrentStep(5)
    } catch (err) {
      console.error('Step 4 save failed:', err)
      setCurrentStep(5)
    } finally {
      setSaving(false)
    }
  }

  const ratePerHour = rateLimitToNumber(step4.rateLimit)

  const deliveryChecks = [
    { label: 'Frequency cap configured', passed: !!step4.metadata.frequencyCapPerDay },
    { label: 'Quiet hours set', passed: !!(step4.metadata.quietHoursStart && step4.metadata.quietHoursEnd) },
    { label: 'Send mode selected', passed: true },
    { label: 'Channel config active', passed: step1.channels.length > 0 },
  ]

  return (
    <div className="builder">
      {/* LEFT: Scheduling */}
      <Panel title="Scheduling" subtitle="Control when and how often messages are sent">
        {/* Frequency Cap */}
        <div className="field">
          <label className="label">Frequency Cap</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              min={1}
              className="input"
              style={{ width: 70 }}
              value={step4.metadata.frequencyCapPerDay ?? ''}
              placeholder="0"
              onChange={(e) =>
                updateStep4({
                  metadata: {
                    ...step4.metadata,
                    frequencyCapPerDay: parseInt(e.target.value) || undefined,
                  },
                })
              }
            />
            <select className="input" style={{ flex: 1 }}>
              {FREQ_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="field">
          <label className="label">Quiet Hours</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="time"
              className="input"
              style={{ flex: 1 }}
              value={step4.metadata.quietHoursStart ?? '22:00'}
              onChange={(e) =>
                updateStep4({ metadata: { ...step4.metadata, quietHoursStart: e.target.value } })
              }
            />
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>to</span>
            <input
              type="time"
              className="input"
              style={{ flex: 1 }}
              value={step4.metadata.quietHoursEnd ?? '08:00'}
              onChange={(e) =>
                updateStep4({ metadata: { ...step4.metadata, quietHoursEnd: e.target.value } })
              }
            />
          </div>
          <select
            className="input"
            style={{ marginTop: 6 }}
            value={step4.metadata.quietHoursTimezone ?? 'UTC'}
            onChange={(e) =>
              updateStep4({ metadata: { ...step4.metadata, quietHoursTimezone: e.target.value } })
            }
          >
            {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
          </select>
        </div>

        {/* Rate Limit */}
        <div className="field">
          <label className="label">Rate Limit</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RATE_LIMIT_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => updateStep4({ rateLimit: r })}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${step4.rateLimit === r ? 'var(--navy)' : 'var(--border)'}`,
                  background: step4.rateLimit === r ? 'var(--navy)' : 'transparent',
                  color: step4.rateLimit === r ? '#fff' : 'var(--text-2)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {r === 'none' ? 'No limit' : r === 'unlimited' ? 'Unlimited' : `${r}/s`}
              </button>
            ))}
          </div>
        </div>

        {/* Send Mode */}
        <div className="field">
          <label className="label">Send Mode</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SEND_MODES.map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => handleScheduleMode(mode)}
                className={`type-card${scheduleMode === mode ? ' selected' : ''}`}
                style={{ textAlign: 'left', padding: '8px 10px' }}
              >
                <div className="type-card-name">{label}</div>
                <div className="type-card-desc">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {scheduleMode === 'scheduled' && (
          <div className="field">
            <label className="label">Scheduled For</label>
            <input
              type="datetime-local"
              className="input"
              value={
                step4.scheduledFor
                  ? new Date(step4.scheduledFor).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                updateStep4({
                  scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : '',
                })
              }
            />
          </div>
        )}

        {/* Suppression Rules */}
        <div className="field">
          <label className="label">Suppression Rules</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Completed Onboarding',
              'Opted Out',
              'Hard Bounced',
              'Unsubscribed',
              'Already received this week',
            ].map((opt) => {
              const checked = step4.suppressionRules.includes(opt)
              return (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...step4.suppressionRules, opt]
                        : step4.suppressionRules.filter((r) => r !== opt)
                      updateStep4({ suppressionRules: next })
                    }}
                    style={{ accentColor: 'var(--navy)', width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{opt}</span>
                </label>
              )
            })}
          </div>
        </div>
      </Panel>

      {/* MIDDLE: Smart Optimizations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Panel title="Engagement Heatmap" subtitle="Optimal send windows based on audience activity">
          <EngagementHeatmap />
        </Panel>

        {/* Smart Time Optimization toggle */}
        <Panel title="Smart Time Optimization">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Send at optimal time per recipient</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>Uses ML to find peak engagement windows</div>
            </div>
            <ToggleSwitch
              checked={step4.stoEnabled}
              onCheckedChange={(v) => {
                updateStep4({ stoEnabled: v })
                setScheduleMode(v ? 'sto' : 'now')
              }}
            />
          </div>
          {step4.stoEnabled && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,128,128,0.08)', fontSize: 11, color: 'var(--teal)' }}>
              STO Enabled · Recommended window: Tue–Thu · 09:00–11:00 local
            </div>
          )}
        </Panel>

        {/* UTM Parameters */}
        <Panel
          title="UTM Parameters"
          action={
            <button
              onClick={() => setUtmOpen(!utmOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', padding: 0 }}
            >
              {utmOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          }
        >
          {utmOpen ? (
            <div>
              {(['source', 'medium', 'campaign', 'content'] as const).map((key) => (
                <div key={key} className="field">
                  <label className="label">utm_{key}</label>
                  <input
                    className="input"
                    placeholder={key === 'campaign' ? 'auto from name' : `utm_${key}`}
                    value={step4.utmParams[key]}
                    onChange={(e) =>
                      updateStep4({ utmParams: { ...step4.utmParams, [key]: e.target.value } })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Click to add UTM tracking parameters</div>
          )}
        </Panel>

        {step1.abTestEnabled && (
          <Panel title="A/B Test Configuration">
            <div className="field">
              <label className="label">Conversion Goal</label>
              <input
                className="input"
                value={step4.abTestConfig.goal}
                placeholder="e.g. Purchase"
                onChange={(e) =>
                  updateStep4({ abTestConfig: { ...step4.abTestConfig, goal: e.target.value } })
                }
              />
            </div>
            <div className="field">
              <label className="label">Attribution Window (days)</label>
              <input
                type="number"
                min={1}
                className="input"
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
            <div className="field">
              <label className="label">Attribution Model</label>
              <select
                className="input"
                value={step4.abTestConfig.attribution}
                onChange={(e) =>
                  updateStep4({ abTestConfig: { ...step4.abTestConfig, attribution: e.target.value } })
                }
              >
                <option value="last_touch">Last-touch</option>
                <option value="first_touch">First-touch</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </Panel>
        )}
      </div>

      {/* RIGHT: Send Projection + Launch checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="proj-card">
          <ThrottleBars ratePerHour={ratePerHour} maxRate={1000} />
        </div>

        <Panel title="Delivery Checks">
          {deliveryChecks.map((check) => (
            <div key={check.label} className="checklist-item">
              <Check size={14} color={check.passed ? 'var(--success)' : 'var(--border)'} />
              <span style={{ fontSize: 12, color: check.passed ? 'var(--text)' : 'var(--text-2)' }}>
                {check.label}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <button
              disabled={saving}
              onClick={handleContinue}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--navy)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-2)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
