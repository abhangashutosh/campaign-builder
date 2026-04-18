'use client'
import * as Switch from '@radix-ui/react-switch'

interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  color?: 'navy' | 'teal'
  id?: string
}

export function ToggleSwitch({ checked, onCheckedChange, label, disabled, color = 'navy', id }: ToggleSwitchProps) {
  const trackColor = checked
    ? (color === 'navy' ? 'var(--navy)' : 'var(--teal)')
    : 'var(--border)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        style={{
          width: 36, height: 20, borderRadius: 10, padding: 2,
          background: trackColor, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s', outline: 'none',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Switch.Thumb
          style={{
            display: 'block', width: 16, height: 16, borderRadius: 8,
            background: '#fff',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </Switch.Root>
      {label && (
        <label htmlFor={id} style={{ fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
          {label}
        </label>
      )}
    </div>
  )
}
