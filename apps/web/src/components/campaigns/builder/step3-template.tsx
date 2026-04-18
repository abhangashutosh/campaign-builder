'use client'

import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useTemplates } from '@/hooks/use-templates'
import type { ChannelType } from '@/types'

export function Step3Template() {
  const { step1, step3, updateStep3, setCurrentStep } = useCampaignBuilderStore()
  const primaryChannel = step1.channels[0] as ChannelType | undefined
  const { data: templates } = useTemplates(primaryChannel)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Select Template</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Choose a template for your campaign</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {templates?.map((t) => (
          <button
            key={t.id}
            onClick={() => updateStep3({ templateId: t.id })}
            className="rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: step3.templateId === t.id ? 'var(--navy)' : 'var(--border)',
              background: step3.templateId === t.id ? 'var(--navy-50)' : 'var(--card)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: step3.templateId === t.id ? 'var(--navy)' : 'var(--text)' }}>
              {t.name}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {t.type} · {t.approvalStatus}
            </p>
            {t.variables.length > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                Variables: {t.variables.join(', ')}
              </p>
            )}
          </button>
        ))}
        {!templates?.length && (
          <p className="col-span-2 text-sm" style={{ color: 'var(--text-2)' }}>No templates found. Create one first.</p>
        )}
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
