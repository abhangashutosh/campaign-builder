'use client'

import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { Step1Type } from './step1-type'
import { Step2Audience } from './step2-audience'
import { Step3Template } from './step3-template'
import { Step4Delivery } from './step4-delivery'
import { Step5Review } from './step5-review'

const STEPS = [
  { n: 1, label: 'Campaign Type' },
  { n: 2, label: 'Audience' },
  { n: 3, label: 'Template' },
  { n: 4, label: 'Delivery' },
  { n: 5, label: 'Review' },
]

export function CampaignBuilder() {
  const { currentStep, setCurrentStep } = useCampaignBuilderStore()

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-8 flex items-center gap-0">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex items-center">
            <button
              onClick={() => step.n < currentStep && setCurrentStep(step.n)}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: step.n === currentStep ? 'var(--navy)' : step.n < currentStep ? 'var(--success)' : 'var(--text-3)' }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                style={{
                  background: step.n === currentStep ? 'var(--navy)' : step.n < currentStep ? 'var(--success)' : 'var(--border)',
                  color: step.n <= currentStep ? '#fff' : 'var(--text-3)',
                }}
              >
                {step.n}
              </span>
              {step.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="mx-3 h-px w-8 flex-shrink-0" style={{ background: 'var(--border)' }} />
            )}
          </div>
        ))}
      </nav>

      <div
        className="rounded-lg border p-8"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {currentStep === 1 && <Step1Type />}
        {currentStep === 2 && <Step2Audience />}
        {currentStep === 3 && <Step3Template />}
        {currentStep === 4 && <Step4Delivery />}
        {currentStep === 5 && <Step5Review />}
      </div>
    </div>
  )
}
