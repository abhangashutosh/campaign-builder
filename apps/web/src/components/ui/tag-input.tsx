'use client'
import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ value, onChange, placeholder = 'Add tag…', maxTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase().replace(/,/g, '')
    if (!trimmed || value.includes(trimmed)) return
    if (maxTags && value.length >= maxTags) return
    onChange([...value, trimmed])
    setInputValue('')
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inputValue) }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) removeTag(value[value.length - 1])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', minHeight: 36 }}>
      {value.map((tag) => (
        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--navy-50)', color: 'var(--navy)', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}>
          {tag}
          <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--navy)' }}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={value.length === 0 ? placeholder : ''}
        style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, minWidth: 80, background: 'transparent', color: 'var(--text)' }}
      />
    </div>
  )
}
