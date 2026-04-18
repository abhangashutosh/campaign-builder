'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { useCampaigns } from '@/hooks/use-campaigns'
import type { Campaign, CampaignStatus } from '@/types'

// ── Inline ChannelPill ───────────────────────────────────────────────────────
function ChannelPill({ channel }: { channel: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    email:    { bg: 'var(--navy-50)',  color: 'var(--navy)' },
    whatsapp: { bg: 'var(--teal-50)',  color: 'var(--teal)' },
  }
  const c = config[channel] ?? { bg: 'var(--border)', color: 'var(--text-2)' }
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.color }}
    >
      {channel}
    </span>
  )
}

// ── Status filter tabs ───────────────────────────────────────────────────────
type FilterStatus = 'all' | CampaignStatus

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Running',   value: 'running'   },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Draft',     value: 'draft'     },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed',    value: 'failed'    },
]

// ── Scheduled date formatter ─────────────────────────────────────────────────
function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── 3-dot Actions menu ───────────────────────────────────────────────────────
const ACTION_ITEMS = ['View', 'Edit', 'Pause', 'Duplicate', 'Delete'] as const

function ActionsMenu({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
        style={{ color: 'var(--text-3)' }}
        aria-label="Campaign actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 min-w-[130px] rounded-lg border py-1 shadow-md"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {ACTION_ITEMS.map((action) => (
            <button
              key={action}
              className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50"
              style={{
                color: action === 'Delete' ? 'var(--danger)' : 'var(--text)',
              }}
              onClick={() => {
                // Intentionally no-op — detail actions are handled in the campaign detail page
                setOpen(false)
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Table helpers ────────────────────────────────────────────────────────────
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-5 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap${right ? ' text-right' : ''}`}
      style={{ color: 'var(--text-3)' }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  right,
  muted,
  className,
}: {
  children: React.ReactNode
  right?: boolean
  muted?: boolean
  className?: string
}) {
  return (
    <td
      className={`px-5 py-3.5${right ? ' text-right tabular-nums' : ''}${className ? ` ${className}` : ''}`}
      style={{ color: muted ? 'var(--text-3)' : 'var(--text)' }}
    >
      {children}
    </td>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function CampaignsContent() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const { data: campaigns, isLoading } = useCampaigns()

  const filtered =
    activeFilter === 'all'
      ? (campaigns ?? [])
      : (campaigns ?? []).filter((c) => c.status === activeFilter)

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage all your email and WhatsApp campaigns"
        actions={
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Campaign
          </Link>
        }
      />

      {/* Status filter tabs */}
      <div
        className="flex items-center gap-0 border-b mb-6"
        style={{ borderColor: 'var(--border)' }}
      >
        {FILTER_TABS.map(({ label, value }) => {
          const active = activeFilter === value
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className="px-4 py-2.5 text-sm font-medium transition-colors -mb-px"
              style={{
                color: active ? 'var(--navy)' : 'var(--text-2)',
                borderBottom: active ? '2px solid var(--navy)' : '2px solid transparent',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Table card */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {isLoading ? (
          <div className="p-8 text-sm text-center" style={{ color: 'var(--text-2)' }}>
            Loading campaigns…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <Th>Campaign</Th>
                  <Th>Channel</Th>
                  <Th>Audience</Th>
                  <Th>Status</Th>
                  <Th>Scheduled</Th>
                  <Th right>Delivered</Th>
                  <Th right>Opened</Th>
                  <Th right>Clicked</Th>
                  <Th right>Replies</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: Campaign) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 transition-colors hover:bg-slate-50/60"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Campaign name + description */}
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--text)' }}
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-3)' }}>
                          {c.description}
                        </p>
                      )}
                    </td>

                    {/* Channel pills */}
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {c.channels.map((ch) => (
                          <ChannelPill key={ch} channel={ch} />
                        ))}
                      </div>
                    </Td>

                    {/* Audience segment — not available without join */}
                    <Td muted>—</Td>

                    {/* Status */}
                    <Td>
                      <StatusBadge status={c.status as CampaignStatus} />
                    </Td>

                    {/* Scheduled date */}
                    <Td muted>{fmtDate(c.scheduledFor)}</Td>

                    {/* Metric columns — detail in Reports page */}
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>

                    {/* 3-dot actions */}
                    <td className="px-5 py-3.5 w-12">
                      <ActionsMenu campaignId={c.id} />
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-10 text-center text-sm"
                      style={{ color: 'var(--text-2)' }}
                    >
                      {activeFilter === 'all' ? (
                        <>
                          No campaigns yet.{' '}
                          <Link href="/campaigns/new" style={{ color: 'var(--navy)' }}>
                            Create your first campaign
                          </Link>
                        </>
                      ) : (
                        `No ${activeFilter} campaigns.`
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
