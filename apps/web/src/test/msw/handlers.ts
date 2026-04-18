import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:4000/api/v1'
const TENANT_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function tenantCheck(req: Request) {
  const t = req.headers.get('x-tenant-id')
  if (!t || !TENANT_UUID_RE.test(t)) {
    return HttpResponse.json({ success: false, error: { message: 'Invalid tenant ID' } }, { status: 400 })
  }
  return null
}

const MOCK_CAMPAIGN = {
  id: 'camp-001',
  tenantId: '00000000-0000-0000-0000-000000000001',
  name: 'Welcome Series',
  type: 'one_time',
  status: 'draft',
  channels: ['email'],
  version: 1,
  tags: [],
  abTestEnabled: false,
  utmParams: {},
  abTestConfig: {},
  metadata: {},
  segment: { id: 'seg-1', name: 'New Users', audienceEstimate: 1234 },
  template: null,
  audienceSegmentId: 'seg-1',
  templateId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
}

export const handlers = [
  http.get(`${BASE}/campaigns`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [MOCK_CAMPAIGN] })
  }),

  http.post(`${BASE}/campaigns`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { ...MOCK_CAMPAIGN, ...body, id: 'camp-new' } }, { status: 201 })
  }),

  http.patch(`${BASE}/campaigns/:id`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { ...MOCK_CAMPAIGN, ...body } })
  }),

  http.get(`${BASE}/campaigns/:id/readiness`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({
      success: true,
      data: {
        score: 40,
        ready: false,
        blockers: ['Template assigned'],
        warnings: [],
        checks: [
          { name: 'Campaign has name', passed: true, type: 'warning', points: 10 },
          { name: 'Template assigned', passed: false, type: 'blocker', points: 15 },
        ],
      },
    })
  }),

  http.post(`${BASE}/campaigns/:id/send-test`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    if (!body.testEmail || !String(body.testEmail).includes('@')) {
      return HttpResponse.json({ success: false, error: { message: 'Invalid email' } }, { status: 400 })
    }
    return HttpResponse.json({ success: true, data: { messageId: 'msg-test-001' } }, { status: 201 })
  }),

  http.get(`${BASE}/segments`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [{ id: 'seg-1', name: 'New Users', audienceEstimate: 1234 }] })
  }),

  http.get(`${BASE}/templates`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [
      { id: 'tmpl-1', name: 'Welcome Email', type: 'email', approvalStatus: 'approved', subject: 'Welcome!', htmlBody: '<p>Hi</p>' },
    ]})
  }),
]
