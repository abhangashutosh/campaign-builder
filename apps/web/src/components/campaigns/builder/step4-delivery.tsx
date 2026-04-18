'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'

export function Step4Delivery() {
  const { step1, step4, updateStep4, setCurrentStep } = useCampaignBuilderStore()
  const [utmOpen, setUtmOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Delivery Rules</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Configure when and how to send</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Frequency Cap (per day)</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="e.g. 2"
            value={step4.metadata.frequencyCapPerDay || ''}
            onChange={(e) => updateStep4({ metadata: { ...step4.metadata, frequencyCapPerDay: parseInt(e.target.value) || undefined } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Schedule (optional)</label>
          <input
            type="datetime-local"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.scheduledFor}
            onChange={(e) => updateStep4({ scheduledFor: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Quiet Hours Start</label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.metadata.quietHoursStart || ''}
            onChange={(e) => updateStep4({ metadata: { ...step4.metadata, quietHoursStart: e.target.value } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Quiet Hours End</label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={step4.metadata.quietHoursEnd || ''}
            onChange={(e) => updateStep4({ metadata: { ...step4.metadata, quietHoursEnd: e.target.value } })}
          />
        </div>
      </div>

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
          <div className="border-t p-4 grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
            {(['source', 'medium', 'campaign', 'content'] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1 capitalize" style={{ color: 'var(--text-2)' }}>utm_{key}</label>
                <input
                  className="w-full rounded border px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  value={step4.utmParams[key]}
                  onChange={(e) => updateStep4({ utmParams: { ...step4.utmParams, [key]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {step1.abTestEnabled && (
        <div
          className="rounded-lg border p-4 space-y-3"
          style={{ borderColor: 'var(--navy)', background: 'var(--navy-50)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>A/B Test Configuration</p>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Conversion Goal</label>
            <input
              className="w-full rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
              placeholder="e.g. Completed Onboarding"
              value={step4.abTestConfig.goal}
              onChange={(e) => updateStep4({ abTestConfig: { ...step4.abTestConfig, goal: e.target.value } })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Window (days)</label>
              <input
                type="number"
                className="w-full rounded border px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
                value={step4.abTestConfig.windowDays}
                onChange={(e) => updateStep4({ abTestConfig: { ...step4.abTestConfig, windowDays: parseInt(e.target.value) || 7 } })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Attribution Model</label>
              <select
                className="w-full rounded border px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'white' }}
                value={step4.abTestConfig.attribution}
                onChange={(e) => updateStep4({ abTestConfig: { ...step4.abTestConfig, attribution: e.target.value } })}
              >
                <option value="last_touch">Last-touch</option>
                <option value="first_touch">First-touch</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
