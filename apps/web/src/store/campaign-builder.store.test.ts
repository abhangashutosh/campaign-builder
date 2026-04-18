import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCampaignBuilderStore } from './campaign-builder.store'

describe('CampaignBuilderStore', () => {
  beforeEach(() => {
    useCampaignBuilderStore.getState().reset()
  })

  it('starts at step 1', () => {
    expect(useCampaignBuilderStore.getState().currentStep).toBe(1)
  })

  it('setCurrentStep updates step', () => {
    act(() => {
      useCampaignBuilderStore.getState().setCurrentStep(3)
    })
    expect(useCampaignBuilderStore.getState().currentStep).toBe(3)
  })

  it('updateStep1 merges name', () => {
    act(() => {
      useCampaignBuilderStore.getState().updateStep1({ name: 'My Campaign' })
    })
    expect(useCampaignBuilderStore.getState().step1.name).toBe('My Campaign')
  })

  it('reset returns to defaults', () => {
    act(() => {
      useCampaignBuilderStore.getState().updateStep1({ name: 'Test' })
      useCampaignBuilderStore.getState().setCurrentStep(4)
      useCampaignBuilderStore.getState().reset()
    })
    const s = useCampaignBuilderStore.getState()
    expect(s.currentStep).toBe(1)
    expect(s.step1.name).toBe('')
  })
})
