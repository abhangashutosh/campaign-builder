'use client'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { Step1Type } from './step1-type'
import { Step2Audience } from './step2-audience'
import { Step3Template } from './step3-template'
import { Step4Delivery } from './step4-delivery'
import { Step5Review } from './step5-review'
import { Check } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'TYPE',     title: 'Campaign Type'   },
  { n: 2, label: 'AUDIENCE', title: 'Audience'         },
  { n: 3, label: 'MESSAGE',  title: 'Message'          },
  { n: 4, label: 'DELIVERY', title: 'Delivery Rules'   },
  { n: 5, label: 'REVIEW',   title: 'Review & Publish' },
]

export function CampaignBuilder() {
  const { currentStep, setCurrentStep } = useCampaignBuilderStore()

  return (
    <div style={{ padding: '16px 24px', minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="stepper">
        {STEPS.map((step) => {
          const isDone   = step.n < currentStep
          const isActive = step.n === currentStep
          return (
            <button
              key={step.n}
              className={`step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              onClick={() => (isDone || isActive) && setCurrentStep(step.n)}
              style={{ width: '100%', background: 'none', border: 'none' }}
            >
              <span className="step-num">
                {isDone ? <Check size={12} strokeWidth={3} /> : step.n}
              </span>
              <div>
                <div className="step-label">Step {step.n}</div>
                <div className="step-title">{step.title}</div>
              </div>
            </button>
          )
        })}
      </nav>

      {currentStep === 1 && <Step1Type />}
      {currentStep === 2 && <Step2Audience />}
      {currentStep === 3 && <Step3Template />}
      {currentStep === 4 && <Step4Delivery />}
      {currentStep === 5 && <Step5Review />}
    </div>
  )
}
