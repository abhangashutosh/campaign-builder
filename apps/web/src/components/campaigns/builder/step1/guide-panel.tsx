'use client'
import { Panel } from '@/components/ui/panel'
import { Circle } from 'lucide-react'

const GUIDE_STEPS = [
  { n: 2, title: 'Audience',         desc: 'Choose a segment or build rules' },
  { n: 3, title: 'Message',          desc: 'Pick a template and personalize' },
  { n: 4, title: 'Delivery Rules',   desc: 'Set schedule, freq cap, quiet hours' },
  { n: 5, title: 'Review & Publish', desc: 'Check readiness and go live' },
]

interface GuidePanelProps {
  canContinue: boolean
  saving: boolean
  onNext: () => void
  onSaveDraft?: () => void
}

export function GuidePanel({ canContinue, saving, onNext, onSaveDraft }: GuidePanelProps) {
  return (
    <Panel title="Setup Guide" subtitle="What happens next">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {GUIDE_STEPS.map((s) => (
          <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Circle size={16} color="var(--border)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Step {s.n}: {s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          disabled={!canContinue || saving}
          onClick={onNext}
          style={{
            width: '100%', padding: '9px 16px', borderRadius: 'var(--radius-md)',
            background: canContinue ? 'var(--navy)' : 'var(--border)',
            color: '#fff', fontSize: 13, fontWeight: 600, border: 'none',
            cursor: canContinue && !saving ? 'pointer' : 'not-allowed', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Continue →'}
        </button>
        {onSaveDraft && (
          <button
            onClick={onSaveDraft}
            style={{
              width: '100%', padding: '9px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
            }}
          >
            Save Draft
          </button>
        )}
      </div>
    </Panel>
  )
}
