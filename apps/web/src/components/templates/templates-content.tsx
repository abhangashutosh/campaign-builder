'use client'

import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { useTemplates } from '@/hooks/use-templates'

export function TemplatesContent() {
  const { data: templates, isLoading } = useTemplates()

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Email and WhatsApp message templates"
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Template
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm" style={{ color: 'var(--text-2)' }}>Loading…</p>}
        {templates?.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border p-5"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.name}</p>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  background: t.approvalStatus === 'approved' ? 'var(--success-50)' : 'var(--warning-50)',
                  color: t.approvalStatus === 'approved' ? 'var(--success)' : 'var(--warning)',
                }}
              >
                {t.approvalStatus}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>{t.type} · {t.category}</p>
            {t.subject && <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{t.subject}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
