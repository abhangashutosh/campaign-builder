import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CampaignType, ChannelType } from '@/types'

interface Step1Data {
  name: string
  type: CampaignType | ''
  channels: ChannelType[]
  description: string
  workspace: string
  folder: string
  tags: string[]
  templateId: string
  abTestEnabled: boolean
}

interface Step2Data {
  audienceSegmentId: string
}

interface Step3Data {
  templateId: string
}

interface Step4Data {
  scheduledFor: string
  metadata: {
    frequencyCapPerDay?: number
    quietHoursStart?: string
    quietHoursEnd?: string
    quietHoursTimezone?: string
  }
  utmParams: { source: string; medium: string; campaign: string; content: string }
  abTestConfig: { goal: string; windowDays: number; attribution: string }
}

interface CampaignBuilderStore {
  campaignId: string | null
  currentStep: number
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
  setCurrentStep: (step: number) => void
  setCampaignId: (id: string) => void
  updateStep1: (data: Partial<Step1Data>) => void
  updateStep2: (data: Partial<Step2Data>) => void
  updateStep3: (data: Partial<Step3Data>) => void
  updateStep4: (data: Partial<Step4Data>) => void
  reset: () => void
}

const defaultStep1: Step1Data = {
  name: '',
  type: '',
  channels: [],
  description: '',
  workspace: 'default',
  folder: '',
  tags: [],
  templateId: '',
  abTestEnabled: false,
}

const defaultStep2: Step2Data = { audienceSegmentId: '' }
const defaultStep3: Step3Data = { templateId: '' }
const defaultStep4: Step4Data = {
  scheduledFor: '',
  metadata: {},
  utmParams: { source: '', medium: '', campaign: '', content: '' },
  abTestConfig: { goal: '', windowDays: 7, attribution: 'last_touch' },
}

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
  persist(
    (set) => ({
      campaignId: null,
      currentStep: 1,
      step1: defaultStep1,
      step2: defaultStep2,
      step3: defaultStep3,
      step4: defaultStep4,
      setCurrentStep: (step) => set({ currentStep: step }),
      setCampaignId: (id) => set({ campaignId: id }),
      updateStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
      updateStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
      updateStep3: (data) => set((s) => ({ step3: { ...s.step3, ...data } })),
      updateStep4: (data) => set((s) => ({ step4: { ...s.step4, ...data } })),
      reset: () =>
        set({
          campaignId: null,
          currentStep: 1,
          step1: defaultStep1,
          step2: defaultStep2,
          step3: defaultStep3,
          step4: defaultStep4,
        }),
    }),
    { name: 'campaign-builder' },
  ),
)
