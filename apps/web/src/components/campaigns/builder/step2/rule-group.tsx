'use client'
import { Plus } from 'lucide-react'
import { Condition, ConditionRow } from './condition-row'

type Logic = 'AND' | 'OR' | 'ANY'
type GroupType = 'include' | 'exclude'

interface RuleGroupProps {
  groupType: GroupType
  logic: Logic
  conditions: Condition[]
  onLogicChange: (logic: Logic) => void
  onConditionsChange: (conditions: Condition[]) => void
}

const LOGIC_CYCLE: Logic[] = ['AND', 'OR', 'ANY']
const DEFAULT_CONDITION: Condition = { field: 'lifecycle_stage', op: 'eq', value: '' }

export function RuleGroup({ groupType, logic, conditions, onLogicChange, onConditionsChange }: RuleGroupProps) {
  function cycleLogic() {
    const i = LOGIC_CYCLE.indexOf(logic)
    onLogicChange(LOGIC_CYCLE[(i + 1) % 3])
  }

  function addCondition() {
    onConditionsChange([...conditions, { ...DEFAULT_CONDITION }])
  }

  function updateCondition(index: number, condition: Condition) {
    const next = [...conditions]
    next[index] = condition
    onConditionsChange(next)
  }

  function removeCondition(index: number) {
    onConditionsChange(conditions.filter((_, i) => i !== index))
  }

  return (
    <div className={`rule-group ${groupType}-group`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: groupType === 'include' ? 'var(--success)' : 'var(--danger)' }}>
          {groupType === 'include' ? 'INCLUDE' : 'EXCLUDE'} — match
        </span>
        <button className="logic-badge" onClick={cycleLogic}>{logic}</button>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>of these conditions</span>
      </div>
      {conditions.map((c, i) => (
        <ConditionRow key={i} condition={c} index={i} onUpdate={updateCondition} onRemove={removeCondition} />
      ))}
      <button
        onClick={addCondition}
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--navy)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Plus size={12} /> Add condition
      </button>
    </div>
  )
}
