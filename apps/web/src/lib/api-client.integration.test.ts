import { describe, it, expect } from 'vitest'
import { server } from '../test/msw/server'
import { http, HttpResponse } from 'msw'

describe('api-client — header and tenant validation', () => {
  it('sends x-tenant-id header that is a valid UUID', async () => {
    let capturedTenant: string | null = null

    server.use(
      http.get('http://localhost:4000/api/v1/campaigns', ({ request }) => {
        capturedTenant = request.headers.get('x-tenant-id')
        return HttpResponse.json({ success: true, data: [] })
      })
    )

    const { api } = await import('./api-client')
    await api.get('/campaigns')

    expect(capturedTenant).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('throws when API returns success: false', async () => {
    server.use(
      http.get('http://localhost:4000/api/v1/campaigns', () =>
        HttpResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
      )
    )

    const { api } = await import('./api-client')
    await expect(api.get('/campaigns')).rejects.toThrow('Unauthorized')
  })

  it('sends Content-Type: application/json on POST', async () => {
    let capturedContentType: string | null = null

    server.use(
      http.post('http://localhost:4000/api/v1/campaigns', ({ request }) => {
        capturedContentType = request.headers.get('content-type')
        return HttpResponse.json({ success: true, data: { id: 'x' } }, { status: 201 })
      })
    )

    const { api } = await import('./api-client')
    await api.post('/campaigns', { name: 'Test' })

    expect(capturedContentType).toContain('application/json')
  })
})
