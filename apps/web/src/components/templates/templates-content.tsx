'use client'

import { useState } from 'react'
import { Plus, X, Search, Mail, MessageSquare } from 'lucide-react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/page-header'
import { useTemplates } from '@/hooks/use-templates'
import { api } from '@/lib/api-client'
import type { Template } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type ChannelFilter = 'all' | 'email' | 'whatsapp'

interface NewTemplateForm {
  name: string
  type: 'email' | 'whatsapp'
  category: 'marketing' | 'transactional'
  subject: string
  htmlBody: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function approvalBadgeStyle(status: Template['approvalStatus']): React.CSSProperties {
  switch (status) {
    case 'approved':
      return { background: 'var(--success-50)', color: 'var(--success)' }
    case 'pending':
      return { background: 'var(--warning-50)', color: 'var(--warning)' }
    case 'rejected':
      return { background: 'var(--danger-50)', color: 'var(--danger)' }
    default:
      return { background: '#F1F5F9', color: 'var(--text-3)' }
  }
}

function approvalLabel(status: Template['approvalStatus']): string {
  switch (status) {
    case 'approved': return 'Approved'
    case 'pending': return 'In Review'
    case 'rejected': return 'Rejected'
    default: return 'Draft'
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ templates }: { templates: Template[] }) {
  const stats = [
    { label: 'Total', value: templates.length },
    { label: 'Approved', value: templates.filter(t => t.approvalStatus === 'approved').length },
    { label: 'In Review', value: templates.filter(t => t.approvalStatus === 'pending').length },
    { label: 'Drafts', value: templates.filter(t => t.approvalStatus === 'draft').length },
    { label: 'Rejected', value: templates.filter(t => t.approvalStatus === 'rejected').length },
  ]

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {stats.map(s => (
        <div
          key={s.label}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            {s.value}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Filter Row ──────────────────────────────────────────────────────────────

function FilterRow({
  filterText,
  onFilterText,
  channelFilter,
  onChannelFilter,
}: {
  filterText: string
  onFilterText: (v: string) => void
  channelFilter: ChannelFilter
  onChannelFilter: (v: ChannelFilter) => void
}) {
  const chips: { label: string; value: ChannelFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Email', value: 'email' },
    { label: 'WhatsApp', value: 'whatsapp' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {/* Search */}
      <div style={{ position: 'relative', flexGrow: 1, maxWidth: '320px' }}>
        <Search
          size={14}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
        />
        <input
          type="text"
          placeholder="Search templates…"
          value={filterText}
          onChange={e => onFilterText(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '32px',
            paddingRight: '12px',
            paddingTop: '7px',
            paddingBottom: '7px',
            fontSize: '13px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--card)',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Channel chips */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {chips.map(c => (
          <button
            key={c.value}
            onClick={() => onChannelFilter(c.value)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: channelFilter === c.value ? 'var(--navy)' : 'var(--card)',
              color: channelFilter === c.value ? '#fff' : 'var(--text-2)',
              transition: 'background 0.15s',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: Template }) {
  const isEmail = template.type === 'email'
  const channelStyle: React.CSSProperties = isEmail
    ? { background: 'var(--navy-50)', color: 'var(--navy)' }
    : { background: 'var(--teal-50)', color: 'var(--teal)' }

  const truncatedSubject = template.subject && template.subject.length > 50
    ? template.subject.slice(0, 50) + '…'
    : template.subject

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Top row: channel pill + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            ...channelStyle,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {isEmail
            ? <Mail size={11} />
            : <MessageSquare size={11} />}
          {isEmail ? 'Email' : 'WhatsApp'}
        </span>
        <span
          style={{
            ...approvalBadgeStyle(template.approvalStatus),
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {approvalLabel(template.approvalStatus)}
        </span>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>
        {template.name}
      </div>

      {/* Category */}
      <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'capitalize' }}>
        {template.category}
      </div>

      {/* Subject */}
      {truncatedSubject && (
        <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
          {truncatedSubject}
        </div>
      )}

      {/* Variables */}
      {template.variables.length > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
          {template.variables.map(v => `{{${v}}}`).join(', ')}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-3)' }}>
        0 campaigns · {formatDate(template.createdAt)}
      </div>
    </div>
  )
}

// ─── New Template Modal ───────────────────────────────────────────────────────

const INITIAL_FORM: NewTemplateForm = {
  name: '',
  type: 'email',
  category: 'marketing',
  subject: '',
  htmlBody: '',
}

function NewTemplateModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<NewTemplateForm>(INITIAL_FORM)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: NewTemplateForm) =>
      api.post('/templates', {
        name: data.name,
        type: data.type,
        category: data.category,
        subject: data.subject || undefined,
        htmlBody: data.htmlBody,
        textBody: data.htmlBody,
        variables: [],
        approvalStatus: 'draft',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate(form)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: '#fff',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-2)',
    marginBottom: '4px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '448px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>New Template</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Welcome Email"
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              {(['email', 'whatsapp'] as const).map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--text)' }}>
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={() => setForm(f => ({ ...f, type: t }))}
                  />
                  {t === 'email' ? 'Email' : 'WhatsApp'}
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as 'marketing' | 'transactional' }))}
              style={{ ...inputStyle }}
            >
              <option value="marketing">Marketing</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>

          {/* Subject — email only */}
          {form.type === 'email' && (
            <div>
              <label style={labelStyle}>Subject Line</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Welcome to our platform!"
                style={inputStyle}
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label style={labelStyle}>HTML Body</label>
            <textarea
              rows={4}
              value={form.htmlBody}
              onChange={e => setForm(f => ({ ...f, htmlBody: e.target.value }))}
              placeholder="Enter email HTML or plain text…"
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                background: 'var(--navy)',
                color: '#fff',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'Saving…' : 'Save Template'}
            </button>
          </div>

          {mutation.isError && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', margin: 0 }}>
              {(mutation.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TemplatesContent() {
  const { data: templates = [], isLoading } = useTemplates()
  const [filterText, setFilterText] = useState('')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = templates.filter(t => {
    const matchesText =
      filterText === '' ||
      t.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (t.subject ?? '').toLowerCase().includes(filterText.toLowerCase())
    const matchesChannel =
      channelFilter === 'all' || t.type === channelFilter
    return matchesText && matchesChannel
  })

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Email and WhatsApp message templates"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              background: 'var(--navy)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            New Template
          </button>
        }
      />

      {!isLoading && <StatsBar templates={templates} />}

      <FilterRow
        filterText={filterText}
        onFilterText={setFilterText}
        channelFilter={channelFilter}
        onChannelFilter={setChannelFilter}
      />

      {isLoading && (
        <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>Loading…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>
          No templates match your filters.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {filtered.map(t => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      {showModal && <NewTemplateModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
