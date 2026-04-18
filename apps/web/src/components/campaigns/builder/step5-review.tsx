'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useCampaignReadiness, usePublishCampaign, useSendTest } from '@/hooks/use-campaigns'
import { Check, AlertTriangle, X, Send } from 'lucide-react'
import { Panel } from '@/components/ui/panel'

export function Step5Review() {
  const router = useRouter()
  const { campaignId, step1, step2, step3, step4, setCurrentStep, reset } = useCampaignBuilderStore()

  const { data: readiness } = useCampaignReadiness(campaignId ?? '')
  const publishCampaign = usePublishCampaign()
  const sendTest = useSendTest()

  const [testEmail, setTestEmail] = useState('')
  const [testSent, setTestSent] = useState(false)
  const [testError, setTestError] = useState(false)
  const [previewChannel, setPreviewChannel] = useState<string>(
    step1.channels?.[0] ?? 'email'
  )

  const score    = readiness?.score ?? 75
  const ready    = readiness?.ready ?? false
  const blockers = readiness?.blockers ?? []
  const warnings = readiness?.warnings ?? []

  async function handleSendTest() {
    if (!campaignId || !testEmail) return
    setTestError(false)
    setTestSent(false)
    try {
      await sendTest.mutateAsync({ id: campaignId, testEmail })
      setTestSent(true)
    } catch {
      setTestError(true)
    }
  }

  async function handlePublish() {
    if (!campaignId) return
    try {
      await publishCampaign.mutateAsync(campaignId)
      reset()
      router.push('/campaigns')
    } catch (err) {
      console.error('Publish failed:', err)
    }
  }

  const scoreColor =
    score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning, #F59E0B)' : 'var(--danger)'

  const SUMMARY = [
    {
      step: 1,
      title: 'Campaign Setup',
      items: [
        { label: 'Name',     value: step1.name || '—' },
        { label: 'Type',     value: step1.type ? step1.type.replace(/_/g, ' ') : '—' },
        { label: 'Channels', value: step1.channels?.join(' + ') || '—' },
      ],
    },
    {
      step: 2,
      title: 'Audience',
      items: [
        { label: 'Segment', value: step2.audienceSegmentId || '—' },
      ],
    },
    {
      step: 3,
      title: 'Message',
      items: [
        { label: 'Subject',  value: step3.subject || '—' },
        { label: 'Template', value: step3.templateId || '—' },
        { label: 'Sender',   value: step3.senderEmail || '—' },
      ],
    },
    {
      step: 4,
      title: 'Delivery',
      items: [
        {
          label: 'Schedule',
          value: step4.scheduledFor
            ? new Date(step4.scheduledFor).toLocaleString()
            : step4.stoEnabled
              ? 'Smart Time Optimization'
              : 'Send now',
        },
        { label: 'Rate limit', value: step4.rateLimit === 'none' ? 'No limit' : step4.rateLimit === 'unlimited' ? 'Unlimited' : `${step4.rateLimit}/s` },
      ],
    },
  ]

  return (
    <div className="builder">
      {/* LEFT: Summary */}
      <Panel title="Campaign Summary" subtitle="Review all settings before publishing">
        {SUMMARY.map(({ step, title, items }) => (
          <div
            key={step}
            style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Step {step}: {title}
              </div>
              <button
                onClick={() => setCurrentStep(step)}
                style={{
                  fontSize: 11,
                  color: 'var(--navy)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </div>
            {items.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: 'var(--text-2)' }}>{label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600, maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        ))}

        {blockers.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {blockers.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
                <X size={12} color="var(--danger)" />
                <span style={{ color: 'var(--danger)' }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {warnings.map((w) => (
              <div key={w} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
                <AlertTriangle size={12} color="var(--warning, #F59E0B)" />
                <span style={{ color: 'var(--warning, #F59E0B)' }}>{w}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* MIDDLE: Preview & Send Test */}
      <Panel title="Preview & Simulation">
        {/* Channel tab switcher */}
        {step1.channels && step1.channels.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginBottom: 14,
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
            }}
          >
            {step1.channels.map((ch: string) => (
              <button
                key={ch}
                onClick={() => setPreviewChannel(ch)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  background: previewChannel === ch ? 'var(--navy)' : 'transparent',
                  color: previewChannel === ch ? '#fff' : 'var(--text-2)',
                }}
              >
                {ch === 'email' ? 'Email' : ch === 'whatsapp' ? 'WhatsApp' : ch}
              </button>
            ))}
          </div>
        )}

        {/* Inbox preview */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bg)',
              padding: '8px 12px',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              color: 'var(--text-2)',
            }}
          >
            <div><strong>From:</strong> {step3.senderEmail || 'campaigns@example.com'}</div>
            <div><strong>Subject:</strong> {step3.subject || '(no subject)'}</div>
            {step3.preheader && (
              <div style={{ color: 'var(--text-2)', opacity: 0.7, marginTop: 2 }}>{step3.preheader}</div>
            )}
          </div>
          <div style={{ padding: 16, fontSize: 13, color: 'var(--text-2)', minHeight: 80 }}>
            {step3.templateId
              ? `Template "${step3.templateId}" will be rendered here.`
              : 'Select a template in Step 3 to preview email content.'}
          </div>
        </div>

        {/* Send test */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            Send Test Email
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="test@example.com"
              className="input"
              style={{ flex: 1 }}
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value)
                setTestSent(false)
                setTestError(false)
              }}
            />
            <button
              disabled={!testEmail || sendTest.isPending || !campaignId}
              onClick={handleSendTest}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--navy)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: !testEmail || !campaignId ? 0.5 : 1,
              }}
            >
              <Send size={12} />
              {sendTest.isPending ? '…' : 'Send'}
            </button>
          </div>
          {testSent && (
            <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 4 }}>
              Test email sent successfully
            </div>
          )}
          {testError && (
            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
              Failed to send test email
            </div>
          )}
        </div>
      </Panel>

      {/* RIGHT: Readiness Score + Launch */}
      <Panel title="Approval & Launch">
        {/* Readiness score gauge */}
        <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>/ 100 readiness score</div>
          <div
            style={{
              margin: '10px auto 0',
              height: 6,
              background: 'var(--border)',
              borderRadius: 3,
              width: '80%',
            }}
          >
            <div
              style={{
                height: '100%',
                background: scoreColor,
                borderRadius: 3,
                width: `${score}%`,
                transition: 'width 0.4s',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: scoreColor, marginTop: 8, fontWeight: 600 }}>
            {score >= 80 ? 'Ready to launch' : score >= 50 ? 'Needs attention' : 'Not ready'}
          </div>
        </div>

        {/* Readiness checks derived from blockers/warnings */}
        {(blockers.length > 0 || warnings.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            {blockers.map((b) => (
              <div key={b} className="checklist-item">
                <X size={14} color="var(--danger)" />
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>{b}</span>
              </div>
            ))}
            {warnings.map((w) => (
              <div key={w} className="checklist-item">
                <AlertTriangle size={14} color="var(--warning, #F59E0B)" />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Static passing checks when no readiness data yet */}
        {!readiness && (
          <div style={{ marginBottom: 16 }}>
            {[
              { label: 'Campaign name set', passed: !!step1.name },
              { label: 'Channel selected', passed: step1.channels.length > 0 },
              { label: 'Audience configured', passed: !!step2.audienceSegmentId },
              { label: 'Message drafted', passed: !!step3.subject },
            ].map((c) => (
              <div key={c.label} className="checklist-item">
                {c.passed
                  ? <Check size={14} color="var(--success)" />
                  : <AlertTriangle size={14} color="var(--warning, #F59E0B)" />}
                <span style={{ fontSize: 12, color: c.passed ? 'var(--text)' : 'var(--text-2)' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Launch buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            disabled={publishCampaign.isPending || (!!readiness && !ready)}
            onClick={handlePublish}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--navy)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: publishCampaign.isPending ? 'wait' : 'pointer',
              opacity: publishCampaign.isPending || (!!readiness && !ready) ? 0.6 : 1,
            }}
          >
            {publishCampaign.isPending ? 'Publishing…' : 'Launch Now'}
          </button>
          <button
            onClick={() => setCurrentStep(4)}
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
          <button
            onClick={() => router.push('/campaigns')}
            style={{
              textAlign: 'center',
              width: '100%',
              fontSize: 11,
              color: 'var(--text-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            Save as Draft
          </button>
        </div>
      </Panel>
    </div>
  )
}
