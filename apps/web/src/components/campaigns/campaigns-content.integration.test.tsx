import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignsContent } from './campaigns-content'

function renderCampaigns() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <CampaignsContent />
    </QueryClientProvider>
  )
}

describe('CampaignsContent — integration', () => {
  it('renders without crashing', () => {
    renderCampaigns()
    expect(document.body).toBeTruthy()
  })

  it('renders campaign row after data loads', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Welcome Series')).toBeInTheDocument())
  })

  it('shows segment name in Audience column', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('New Users')).toBeInTheDocument())
  })

  it('shows correct status chip for draft campaign', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Draft')).toBeInTheDocument())
  })

  it('shows Email channel span', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Email')).toBeInTheDocument())
  })

  it('shows empty state when no campaigns match filter', async () => {
    renderCampaigns()
    await waitFor(() => screen.getByText('Welcome Series'))
    fireEvent.click(screen.getByRole('button', { name: 'Running' }))
    await waitFor(() => expect(screen.getByText('No campaigns found')).toBeInTheDocument())
  })

  it('shows "New Campaign" link pointing to /campaigns/new', async () => {
    renderCampaigns()
    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /New Campaign/i })
      expect(links[0]).toHaveAttribute('href', '/campaigns/new')
    })
  })

  it('renders table headers from design HTML', async () => {
    renderCampaigns()
    await waitFor(() => {
      expect(screen.getByText('Campaign')).toBeInTheDocument()
      expect(screen.getByText('Channel')).toBeInTheDocument()
      expect(screen.getByText('Audience')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })
  })
})
