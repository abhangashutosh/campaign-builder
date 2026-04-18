'use client'
import { Users } from 'lucide-react'
import { Panel } from '@/components/ui/panel'
import { useSegmentEstimate } from '@/hooks/use-segments'

interface AudiencePreviewProps {
  segmentId: string
}

export function AudiencePreview({ segmentId }: AudiencePreviewProps) {
  const { data: estimate } = useSegmentEstimate(segmentId)

  const total    = estimate?.total ?? 0
  const emailPct = total > 0 ? Math.round(((estimate?.emailReachable ?? 0) / total) * 100) : 0
  const waPct    = total > 0 ? Math.round(((estimate?.whatsappReachable ?? 0) / total) * 100) : 0

  return (
    <Panel
      title="Live Audience Preview"
      subtitle={segmentId ? 'Updated based on segment rules' : 'Select a segment to see preview'}
    >
      {segmentId ? (
        <>
          <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--navy)' }}>{total.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>contacts matched</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--text-2)' }}>
                <span>Email reachable</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {(estimate?.emailReachable ?? 0).toLocaleString()} ({emailPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                <div style={{ height: '100%', background: 'var(--navy)', borderRadius: 3, width: `${emailPct}%`, transition: 'width 0.4s' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--text-2)' }}>
                <span>WhatsApp reachable</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {(estimate?.whatsappReachable ?? 0).toLocaleString()} ({waPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                <div style={{ height: '100%', background: 'var(--teal, #0D9488)', borderRadius: 3, width: `${waPct}%`, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 8, color: 'var(--muted)' }}>
          <Users size={32} strokeWidth={1.5} />
          <div style={{ fontSize: 13 }}>Select or build a segment to preview audience</div>
        </div>
      )}
    </Panel>
  )
}
