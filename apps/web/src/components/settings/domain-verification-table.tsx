'use client'

import { api } from '@/lib/api-client'
import type { DomainCheckResult } from '@/types'

function StatusChip({ value }: { value: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    pass:    { bg: 'var(--success-50)', text: 'var(--success)' },
    fail:    { bg: 'var(--danger-50)',  text: 'var(--danger)' },
    partial: { bg: 'var(--warning-50)', text: 'var(--warning)' },
    missing: { bg: '#F1F5F9',           text: 'var(--text-2)' },
  }
  const c = config[value] ?? config.missing
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {value}
    </span>
  )
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'
  return <span className="font-semibold text-sm" style={{ color }}>{score}</span>
}

interface DomainVerificationTableProps {
  domains: DomainCheckResult[]
  onVerify: () => void
}

export function DomainVerificationTable({ domains, onVerify }: DomainVerificationTableProps) {
  const handleVerify = async (domain: string) => {
    await api.post(`/settings/domains/${domain}/verify`)
    onVerify()
  }

  return (
    <div
      className="rounded-lg border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Domain Verification</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <th className="px-6 py-3 font-medium">Domain</th>
            <th className="px-6 py-3 font-medium">SPF</th>
            <th className="px-6 py-3 font-medium">DKIM</th>
            <th className="px-6 py-3 font-medium">DMARC</th>
            <th className="px-6 py-3 font-medium">Score</th>
            <th className="px-6 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.domain} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <td className="px-6 py-3 font-medium" style={{ color: 'var(--text)' }}>{d.domain}</td>
              <td className="px-6 py-3"><StatusChip value={d.spf} /></td>
              <td className="px-6 py-3"><StatusChip value={d.dkim} /></td>
              <td className="px-6 py-3"><StatusChip value={d.dmarc} /></td>
              <td className="px-6 py-3"><ScoreChip score={d.score} /></td>
              <td className="px-6 py-3">
                <button
                  onClick={() => handleVerify(d.domain)}
                  className="rounded border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
          {!domains.length && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center" style={{ color: 'var(--text-2)' }}>
                No domains configured
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
