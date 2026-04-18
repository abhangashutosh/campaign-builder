'use client'
import { X } from 'lucide-react'

export interface Condition {
  field: string
  op: string
  value: string
}

const FIELDS = ['email', 'lifecycle_stage', 'country', 'last_seen_days', 'plan', 'created_at']
const OPS = [
  { value: 'eq',       label: 'equals' },
  { value: 'neq',      label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt',       label: 'greater than' },
  { value: 'lt',       label: 'less than' },
  { value: 'in',       label: 'in list' },
  { value: 'exists',   label: 'exists' },
]

interface ConditionRowProps {
  condition: Condition
  index: number
  onUpdate: (index: number, c: Condition) => void
  onRemove: (index: number) => void
}

const sel: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text)',
  background: 'var(--surface)', outline: 'none',
}

export function ConditionRow({ condition, index, onUpdate, onRemove }: ConditionRowProps) {
  return (
    <div className="condition-row">
      <select style={sel} value={condition.field} onChange={(e) => onUpdate(index, { ...condition, field: e.target.value })}>
        {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select style={sel} value={condition.op} onChange={(e) => onUpdate(index, { ...condition, op: e.target.value })}>
        {OPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {condition.op !== 'exists' && (
        <input
          style={{ ...sel, flex: 1 }}
          value={condition.value}
          onChange={(e) => onUpdate(index, { ...condition, value: e.target.value })}
          placeholder="value"
        />
      )}
      <button
        onClick={() => onRemove(index)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', padding: 2 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
