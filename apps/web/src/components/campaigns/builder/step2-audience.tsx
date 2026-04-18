'use client'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useCampaignBuilderStore } from '@/store/campaign-builder.store'
import { useSegments } from '@/hooks/use-segments'
import { api } from '@/lib/api-client'
import { Panel } from '@/components/ui/panel'
import { RuleGroup } from './step2/rule-group'
import { AudiencePreview } from './step2/audience-preview'
import type { Condition } from './step2/condition-row'

type Logic = 'AND' | 'OR' | 'ANY'

export function Step2Audience() {
  const { step1, step2, updateStep2, campaignId, setCurrentStep } = useCampaignBuilderStore()
  const { data: segments = [] } = useSegments()

  const isTransactional = step1.type === 'transactional'

  const [includeLogic, setIncludeLogic] = useState<Logic>('AND')
  const [excludeLogic, setExcludeLogic] = useState<Logic>('OR')
  const [includeConditions, setIncludeConditions] = useState<Condition[]>([
    { field: 'lifecycle_stage', op: 'eq', value: 'subscriber' },
  ])
  const [excludeConditions, setExcludeConditions] = useState<Condition[]>([])
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!campaignId) {
      setCurrentStep(3)
      return
    }
    setSaving(true)
    try {
      await api.patch(`/campaigns/${campaignId}`, {
        audienceSegmentId: step2.audienceSegmentId || null,
      })
      setCurrentStep(3)
    } catch (err) {
      console.error('Step 2 save failed:', err)
      // Don't block — still advance
      setCurrentStep(3)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="builder">
      {/* LEFT: Audience Builder */}
      <Panel title="Audience Builder" subtitle="Define who receives this campaign">
        {isTransactional ? (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--navy-50, #EEF1FF)',
              border: '1px solid var(--navy)',
              color: 'var(--navy)',
              fontSize: 12,
            }}
          >
            Transactional campaigns bypass segment rules — they are sent to individual recipients via API.
          </div>
        ) : (
          <>
            <div className="field">
              <label className="label">Base Segment</label>
              <select
                className="input"
                value={step2.audienceSegmentId}
                onChange={(e) => updateStep2({ audienceSegmentId: e.target.value })}
              >
                <option value="">— Select a saved segment —</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.audienceEstimate != null ? ` (${s.audienceEstimate} contacts)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <RuleGroup
              groupType="include"
              logic={includeLogic}
              conditions={includeConditions}
              onLogicChange={setIncludeLogic}
              onConditionsChange={setIncludeConditions}
            />

            {excludeConditions.length > 0 && (
              <RuleGroup
                groupType="exclude"
                logic={excludeLogic}
                conditions={excludeConditions}
                onLogicChange={setExcludeLogic}
                onConditionsChange={setExcludeConditions}
              />
            )}

            <button
              onClick={() =>
                setExcludeConditions([{ field: 'lifecycle_stage', op: 'eq', value: '' }])
              }
              style={{
                fontSize: 11,
                color: 'var(--danger)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0 0',
              }}
            >
              + Add exclusion group
            </button>
          </>
        )}
      </Panel>

      {/* MIDDLE: Live Preview */}
      <AudiencePreview segmentId={step2.audienceSegmentId} />

      {/* RIGHT: Navigation */}
      <Panel title="Audience Validation">
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
          {isTransactional
            ? 'Transactional campaigns do not require a segment.'
            : step2.audienceSegmentId
              ? 'Segment selected. Click Continue to proceed.'
              : 'Select a segment to validate audience size.'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            disabled={saving}
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--navy)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Continue →'}
          </button>
          <button
            onClick={() => setCurrentStep(1)}
            style={{
              width: '100%',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-2)',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <ChevronLeft size={14} /> Back
          </button>
        </div>
      </Panel>
    </div>
  )
}
