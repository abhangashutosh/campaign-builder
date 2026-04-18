import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FailureReasonsList } from './failure-reasons-list'

describe('FailureReasonsList', () => {
  it('shows empty state when all counts are 0', () => {
    render(<FailureReasonsList breakdown={{ hardBounce: 0, spamComplaint: 0, invalidAddress: 0 }} />)
    expect(screen.getByText('No delivery failures')).toBeTruthy()
  })

  it('shows failure counts when non-zero', () => {
    render(<FailureReasonsList breakdown={{ hardBounce: 5, spamComplaint: 2, invalidAddress: 1 }} />)
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })
})
