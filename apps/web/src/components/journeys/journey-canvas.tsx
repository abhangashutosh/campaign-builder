'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Zap, Clock, GitBranch, Mail, Target, X } from 'lucide-react'
import { api } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JourneyNode {
  id: string
  type: 'trigger' | 'wait' | 'condition' | 'email' | 'goal'
  label: string
  position: { x: number; y: number }
  config?: Record<string, unknown>
  templateId?: string
}

interface Journey {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  nodes: JourneyNode[]
  entryTrigger: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  trigger:   { bg: '#FFF1E6', border: '#E85D04', icon: '#E85D04' },
  wait:      { bg: '#F1F5F9', border: '#94A3B8', icon: '#64748B' },
  condition: { bg: '#EEF2FF', border: '#1B4DFF', icon: '#1B4DFF' },
  email:     { bg: '#EEF2FF', border: '#1B4DFF', icon: '#1B4DFF' },
  goal:      { bg: '#E6FBF5', border: '#00C9A7', icon: '#00C9A7' },
}

const NODE_ICONS = {
  trigger:   Zap,
  wait:      Clock,
  condition: GitBranch,
  email:     Mail,
  goal:      Target,
} as const

// ─── Props ────────────────────────────────────────────────────────────────────

interface JourneyCanvasProps {
  journeyId: string
}

// ─── Inspector Panel ──────────────────────────────────────────────────────────

interface InspectorPanelProps {
  node: JourneyNode
  onClose: () => void
}

function InspectorPanel({ node, onClose }: InspectorPanelProps) {
  const colors = NODE_COLORS[node.type] ?? NODE_COLORS.wait

  return (
    <div
      className="w-72 border-l flex-shrink-0 overflow-y-auto"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Node Inspector
        </p>
        <button
          onClick={onClose}
          className="rounded p-0.5 hover:bg-gray-100"
          style={{ color: 'var(--text-3)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
            TYPE
          </p>
          <span
            className="rounded px-2 py-0.5 text-xs capitalize font-medium"
            style={{ background: colors.bg, color: colors.icon }}
          >
            {node.type}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
            LABEL
          </p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {node.label}
          </p>
        </div>

        {node.config && Object.keys(node.config).length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              CONFIG
            </p>
            <div className="space-y-1">
              {Object.entries(node.config).map(([k, v]) => (
                <p key={k} className="text-xs" style={{ color: 'var(--text-2)' }}>
                  <span className="font-medium">{k}:</span> {String(v)}
                </p>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-lg border p-3"
          style={{ background: 'var(--bg, #F8FAFC)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-3)' }}>
            METRICS
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                1,248
              </p>
              <p style={{ color: 'var(--text-3)' }}>Entered</p>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                68.2%
              </p>
              <p style={{ color: 'var(--text-3)' }}>Open rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function JourneyCanvas({ journeyId }: JourneyCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null)

  const { data: journey, isLoading } = useQuery({
    queryKey: ['journeys', journeyId],
    queryFn: () => api.get<Journey>(`/journeys/${journeyId}`),
  })

  const nodes = (journey?.nodes as JourneyNode[]) ?? []
  const edges = nodes.slice(0, -1).map((n, i) => ({ from: n, to: nodes[i + 1] }))

  const canvasWidth =
    nodes.length > 0
      ? Math.max(600, ...nodes.map((n) => n.position.x + 300))
      : 600

  const canvasHeight =
    nodes.length > 0
      ? Math.max(600, ...nodes.map((n) => n.position.y + 200))
      : 600

  const statusChipStyle =
    journey?.status === 'active'
      ? { background: 'var(--success-50)', color: 'var(--success)' }
      : { background: 'var(--warning-50)', color: 'var(--warning)' }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Loading journey…
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg, #F8FAFC)' }}>
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/journeys"
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} style={{ color: 'var(--text-2)' }} />
          </Link>
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>
              {journey?.name ?? 'Journey'}
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>
              {journey?.nodes?.length ?? 0} nodes · {journey?.status ?? 'draft'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-medium capitalize"
            style={statusChipStyle}
          >
            {journey?.status ?? 'draft'}
          </span>
          <button
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            <Pause size={14} />
            Pause
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Play size={14} />
            Publish v{journey?.nodes?.length ?? 1}
          </button>
        </div>
      </div>

      {/* ── Canvas + Inspector ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 relative overflow-auto"
          style={{ background: 'var(--bg, #F8FAFC)' }}
        >
          <div
            className="relative"
            style={{ width: canvasWidth, height: canvasHeight, minWidth: '100%', minHeight: '100%' }}
          >
            {/* SVG edges */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: canvasWidth, height: canvasHeight }}
            >
              {edges.map(({ from, to }, i) => {
                const x1 = from.position.x + 88
                const y1 = from.position.y + 60
                const x2 = to.position.x + 88
                const y2 = to.position.y
                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <polygon
                      points={`${x2},${y2} ${x2 - 5},${y2 - 8} ${x2 + 5},${y2 - 8}`}
                      fill="#CBD5E1"
                    />
                  </g>
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                  No nodes yet — this journey is empty.
                </p>
              </div>
            ) : (
              nodes.map((node) => {
                const colors = NODE_COLORS[node.type] ?? NODE_COLORS.wait
                const Icon =
                  NODE_ICONS[node.type as keyof typeof NODE_ICONS] ?? Mail
                const isSelected = selectedNode?.id === node.id

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className="absolute cursor-pointer rounded-lg border-2 p-3 w-44 shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      background: colors.bg,
                      borderColor: isSelected ? colors.icon : colors.border,
                      boxShadow: isSelected
                        ? `0 0 0 3px ${colors.icon}30`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded p-1 flex-shrink-0"
                        style={{ background: `${colors.icon}20` }}
                      >
                        <Icon size={14} style={{ color: colors.icon }} />
                      </div>
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: 'var(--text)' }}
                      >
                        {node.label}
                      </p>
                    </div>
                    <p
                      className="text-xs mt-1 capitalize"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {node.type}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Inspector panel */}
        {selectedNode && (
          <InspectorPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  )
}
