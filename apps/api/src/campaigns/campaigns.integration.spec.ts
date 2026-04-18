import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../app.module'

const TENANT = process.env.TEST_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

describe('Campaigns — Integration (real HTTP + real DB)', () => {
  let app: INestApplication
  let createdId: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/v1/health → 200', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health')
    expect(res.status).toBe(200)
  })

  it('POST /campaigns — rejects non-UUID tenant (was bug: returned 500)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test', type: 'one_time', channels: ['email'] })
    expect(res.status).not.toBe(500)
  })

  it('POST /campaigns — creates campaign with valid UUID tenant', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .set('x-tenant-id', TENANT)
      .send({ name: 'Integration Test Campaign', type: 'one_time', channels: ['email'], createdBy: 'test-runner' })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'Integration Test Campaign', status: 'draft', tenantId: TENANT })
    createdId = res.body.data.id
  })

  it('GET /campaigns — lists campaigns for tenant', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/campaigns')
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((c: Record<string, unknown>) => c.id === createdId)).toBe(true)
  })

  it('GET /campaigns/:id — returns single campaign', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(createdId)
  })

  it('PATCH /campaigns/:id — updates campaign name', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
      .send({ name: 'Updated Integration Campaign' })
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(createdId)
  })

  it('GET /campaigns/:id/readiness — returns score object', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}/readiness`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    const { score, ready, blockers, checks } = res.body.data
    expect(typeof score).toBe('number')
    expect(typeof ready).toBe('boolean')
    expect(Array.isArray(blockers)).toBe(true)
    expect(Array.isArray(checks)).toBe(true)
  })

  it('POST /campaigns/:id/send-test — 400 on invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/campaigns/${createdId}/send-test`)
      .set('x-tenant-id', TENANT)
      .send({ testEmail: 'not-an-email' })
    expect(res.status).toBe(400)
  })

  it('GET /campaigns/:id — 404 from different tenant (isolation check)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', '00000000-0000-0000-0000-000000000002')
    expect(res.status).toBe(404)
  })

  it('DELETE /campaigns/:id — soft-deletes campaign', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
  })
})
