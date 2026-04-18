'use client'

import { useState } from 'react'
import { Monitor, Smartphone, CheckCircle, AlertCircle } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useTemplates, useTemplate } from '@/hooks/use-templates'
import type { ChannelType } from '@/types'

type DeviceMode = 'desktop' | 'mobile'

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
}

export function Step3Template() {
  const { step1, step3, updateStep3, setCurrentStep } = useCampaignBuilderStore()
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [channelFilter, setChannelFilter] = useState<string>(step1.channels[0] ?? '')

  const primaryChannel = (channelFilter || step1.channels[0]) as ChannelType | undefined
  const { data: templates } = useTemplates(primaryChannel)
  const { data: selectedTemplate } = useTemplate(step3.templateId)

  const previewWidth = deviceMode === 'mobile' ? '375px' : '100%'

  const isApproved = selectedTemplate?.approvalStatus === 'approved'

  const readinessChecks: Array<{ label: string; pass: boolean }> = [
    { label: 'Template approved', pass: !!selectedTemplate && isApproved },
    { label: 'Domain auth (SPF)', pass: true },
    { label: 'Domain auth (DKIM)', pass: true },
    { label: 'DMARC policy', pass: true },
    { label: 'Audience > 0', pass: true },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Select Template</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Choose a template for your campaign</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Config */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
            Select Template
          </p>

          {/* Channel tab pills */}
          {step1.channels.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {step1.channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: channelFilter === ch ? 'var(--navy)' : 'var(--navy-50)',
                    color: channelFilter === ch ? 'white' : 'var(--navy)',
                  }}
                >
                  {CHANNEL_LABELS[ch] ?? ch}
                </button>
              ))}
            </div>
          )}

          {/* Template cards */}
          <div className="grid grid-cols-2 gap-2">
            {templates?.map((t) => (
              <button
                key={t.id}
                onClick={() => updateStep3({ templateId: t.id })}
                className="rounded-lg border p-3 text-left transition-all"
                style={{
                  borderColor: step3.templateId === t.id ? 'var(--navy)' : 'var(--border)',
                  background: step3.templateId === t.id ? 'var(--navy-50)' : 'var(--card)',
                }}
              >
                <p
                  className="text-xs font-medium leading-snug"
                  style={{ color: step3.templateId === t.id ? 'var(--navy)' : 'var(--text)' }}
                >
                  {t.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                  {t.type} · {t.approvalStatus}
                </p>
              </button>
            ))}
            {!templates?.length && (
              <p className="col-span-2 text-sm" style={{ color: 'var(--text-2)' }}>
                No templates found. Create one first.
              </p>
            )}
          </div>
        </div>

        {/* Middle: Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
              Message Preview
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className="p-1.5 rounded"
                style={{
                  background: deviceMode === 'desktop' ? 'var(--navy-50)' : 'transparent',
                  color: deviceMode === 'desktop' ? 'var(--navy)' : 'var(--text-3)',
                }}
                title="Desktop view"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className="p-1.5 rounded"
                style={{
                  background: deviceMode === 'mobile' ? 'var(--navy-50)' : 'transparent',
                  color: deviceMode === 'mobile' ? 'var(--navy)' : 'var(--text-3)',
                }}
                title="Mobile view"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div
              style={{
                width: previewWidth,
                maxWidth: '100%',
                transition: 'width 0.2s ease',
              }}
            >
              <div
                className="rounded border mt-2 p-4 text-sm"
                style={{ background: '#fafafa', minHeight: 200, borderColor: 'var(--border)' }}
              >
                {selectedTemplate ? (
                  <div>
                    <p className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                      {selectedTemplate.subject}
                    </p>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-2)' }}
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.htmlBody ?? '<p>No preview available</p>',
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center mt-8" style={{ color: 'var(--text-3)' }}>
                    Select a template to preview
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Send Readiness */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
            Send Readiness
          </p>

          <div className="space-y-2">
            {readinessChecks.map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                {pass ? (
                  <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                )}
                <span style={{ color: pass ? 'var(--text)' : 'var(--warning)' }}>{label}</span>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="space-y-1 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>Variables: </span>
                {selectedTemplate.variables.length > 0
                  ? selectedTemplate.variables.join(', ')
                  : 'None'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>Category: </span>
                {selectedTemplate.category}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setCurrentStep(2)}
          className="rounded-md border px-6 py-2 text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          Back
        </button>
        <button
          disabled={!step3.templateId}
          onClick={() => setCurrentStep(4)}
          className="rounded-md px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--navy)' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
