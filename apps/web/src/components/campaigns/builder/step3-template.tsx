'use client'
import { useState } from 'react'
import { Monitor, Smartphone, CheckCircle, AlertCircle } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useTemplates, useTemplate } from '@/hooks/use-templates'
import { api } from '@/lib/api-client'
import { Panel } from '@/components/ui/panel'
import type { ChannelType } from '@/types'

type DeviceMode = 'desktop' | 'mobile'

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
}

export function Step3Template() {
  const { step1, step3, updateStep3, campaignId, setCurrentStep } = useCampaignBuilderStore()
  const primaryChannel = step1.channels[0] ?? 'email'
  const [channelTab, setChannelTab] = useState<string>(primaryChannel)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [saving, setSaving] = useState(false)

  const { data: templates = [] } = useTemplates(channelTab as ChannelType)
  const { data: selectedTemplate } = useTemplate(step3.templateId)

  async function handleContinue() {
    if (!campaignId) {
      setCurrentStep(4)
      return
    }
    setSaving(true)
    try {
      await api.patch(`/campaigns/${campaignId}`, {
        templateId: step3.templateId || null,
      })
      setCurrentStep(4)
    } catch (err) {
      console.error('Step 3 save failed:', err)
      // Don't block — still advance
      setCurrentStep(4)
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    background: active ? 'var(--navy)' : 'transparent',
    color: active ? '#fff' : 'var(--text-2)',
    border: 'none',
    cursor: 'pointer',
  })

  const readinessChecks: Array<{ label: string; ok: boolean }> = [
    { label: 'Template selected',  ok: !!step3.templateId },
    { label: 'Subject line set',   ok: channelTab !== 'email' || !!step3.subject },
    { label: 'Template approved',  ok: selectedTemplate?.approvalStatus === 'approved' },
  ]

  return (
    <div className="builder">
      {/* LEFT: Configuration */}
      <Panel title="Configuration" subtitle="Set up your message content">
        {step1.channels.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '8px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 14,
            }}
          >
            {step1.channels.map((ch) => (
              <button key={ch} style={tabStyle(channelTab === ch)} onClick={() => setChannelTab(ch)}>
                {CHANNEL_LABELS[ch] ?? ch}
              </button>
            ))}
          </div>
        )}

        {channelTab === 'email' && (
          <>
            <div className="field">
              <label className="label">Subject Line</label>
              <input
                className="input"
                value={step3.subject}
                onChange={(e) => updateStep3({ subject: e.target.value })}
                placeholder="e.g. Welcome to Northwind 👋"
              />
            </div>
            <div className="field">
              <label className="label">Preheader</label>
              <input
                className="input"
                value={step3.preheader}
                onChange={(e) => updateStep3({ preheader: e.target.value })}
                placeholder="Short preview text after subject…"
              />
            </div>
          </>
        )}

        <div className="field">
          <label className="label">Template</label>
          <select
            className="input"
            value={step3.templateId}
            onChange={(e) => updateStep3({ templateId: e.target.value })}
          >
            <option value="">— Select template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.approvalStatus}
              </option>
            ))}
          </select>
        </div>

        {/* Template cards grid */}
        {templates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => updateStep3({ templateId: t.id })}
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${step3.templateId === t.id ? 'var(--navy)' : 'var(--border)'}`,
                  background: step3.templateId === t.id ? 'var(--navy-50)' : 'var(--card)',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: step3.templateId === t.id ? 'var(--navy)' : 'var(--text)',
                    marginBottom: 2,
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {t.type} · {t.approvalStatus}
                </div>
              </button>
            ))}
          </div>
        )}

        {templates.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
            No templates found for this channel. Create one first.
          </p>
        )}
      </Panel>

      {/* MIDDLE: Preview */}
      <Panel
        title="Message Preview"
        action={
          <div
            style={{
              display: 'flex',
              gap: 2,
              padding: '2px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {(['desktop', 'mobile'] as DeviceMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setDeviceMode(m)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: deviceMode === m ? '#fff' : 'transparent',
                  color: deviceMode === m ? 'var(--navy)' : 'var(--text-2)',
                  display: 'flex',
                }}
                title={m === 'desktop' ? 'Desktop view' : 'Mobile view'}
              >
                {m === 'desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
              </button>
            ))}
          </div>
        }
      >
        {selectedTemplate ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <div
              style={{
                width: deviceMode === 'desktop' ? '100%' : 375,
                maxWidth: '100%',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'width 0.2s ease',
              }}
            >
              {channelTab === 'email' ? (
                <>
                  {selectedTemplate.subject && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text)',
                        background: 'var(--card)',
                      }}
                    >
                      {selectedTemplate.subject}
                    </div>
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.htmlBody ?? '<p style="padding:16px;color:#475569;font-size:13px">No HTML body available.</p>',
                    }}
                  />
                </>
              ) : (
                <div style={{ background: '#E7F7E8', padding: 16 }}>
                  <div
                    style={{
                      background: '#DCF8C6',
                      borderRadius: '12px 12px 2px 12px',
                      padding: '10px 14px',
                      maxWidth: 240,
                      fontSize: 13,
                      color: '#0F172A',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedTemplate.htmlBody ?? 'WhatsApp template preview'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              color: 'var(--muted)',
              fontSize: 13,
            }}
          >
            Select a template to preview
          </div>
        )}

        {selectedTemplate && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Variables: </span>
              {selectedTemplate.variables.length > 0 ? selectedTemplate.variables.join(', ') : 'None'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Category: </span>
              {selectedTemplate.category}
            </p>
          </div>
        )}
      </Panel>

      {/* RIGHT: Readiness + Navigation */}
      <Panel title="Send Readiness">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {readinessChecks.map((check) => (
            <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              {check.ok ? (
                <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={14} style={{ color: 'var(--warning, #F59E0B)', flexShrink: 0 }} />
              )}
              <span style={{ color: check.ok ? 'var(--text)' : 'var(--text-2)' }}>{check.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            disabled={!step3.templateId || saving}
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              background: step3.templateId ? 'var(--navy)' : 'var(--border)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: step3.templateId && !saving ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving…' : 'Continue →'}
          </button>
          <button
            onClick={() => setCurrentStep(2)}
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
  )
}
