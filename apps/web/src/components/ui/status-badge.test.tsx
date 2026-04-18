import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './status-badge'
import type { CampaignStatus } from '@/types'

const statuses: CampaignStatus[] = ['draft', 'running', 'scheduled', 'paused', 'completed', 'failed', 'needs_review']

describe('StatusBadge', () => {
  statuses.forEach((status) => {
    it(`renders ${status} badge`, () => {
      render(<StatusBadge status={status} />)
      const badge = screen.getByText(/draft|running|scheduled|paused|completed|failed|needs review/i)
      expect(badge).toBeTruthy()
    })
  })
})
