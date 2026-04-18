import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { createCipheriv, randomBytes } from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../../../..', '.env') })

const TENANT_ID = 'default'
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex')

function encryptCredentials(data: Record<string, string>): Buffer {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  const payload = Buffer.from(JSON.stringify(data))
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted])
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: [],
  synchronize: false,
  logging: false,
})

async function seed() {
  await AppDataSource.initialize()
  const q = AppDataSource.createQueryRunner()
  await q.connect()

  try {
    // ── Clean existing demo data ──────────────────────────────────────────────
    await q.query(`DELETE FROM delivery_events   WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM campaign_deliveries WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM campaigns          WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM journeys           WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM templates          WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM segments           WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM channel_configs    WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM contacts           WHERE tenant_id = $1`, [TENANT_ID])
    console.log('✓ Cleared existing demo data')

    // ── 1. Contacts ──────────────────────────────────────────────────────────
    const contacts = [
      { externalId: 'usr_001', firstName: 'Aarav',    lastName: 'Mehta',   email: 'aarav.mehta@example.com',    phone: '+919876543201', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 92 },
      { externalId: 'usr_002', firstName: 'Priya',    lastName: 'Sharma',  email: 'priya.sharma@example.com',   phone: '+919876543202', lifecycle: 'active_customer', consentEmail: true,  consentWa: false, leadScore: 88 },
      { externalId: 'usr_003', firstName: 'Rohan',    lastName: 'Gupta',   email: 'rohan.gupta@example.com',    phone: '+919876543203', lifecycle: 'lead',            consentEmail: true,  consentWa: true,  leadScore: 74 },
      { externalId: 'usr_004', firstName: 'Sneha',    lastName: 'Patel',   email: 'sneha.patel@example.com',    phone: '+919876543204', lifecycle: 'lead',            consentEmail: true,  consentWa: false, leadScore: 65 },
      { externalId: 'usr_005', firstName: 'Vikram',   lastName: 'Singh',   email: 'vikram.singh@example.com',   phone: '+919876543205', lifecycle: 'subscriber',      consentEmail: true,  consentWa: false, leadScore: 30 },
      { externalId: 'usr_006', firstName: 'Ananya',   lastName: 'Reddy',   email: 'ananya.reddy@example.com',   phone: '+919876543206', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 95 },
      { externalId: 'usr_007', firstName: 'Karan',    lastName: 'Verma',   email: 'karan.verma@example.com',    phone: '+919876543207', lifecycle: 'churned',         consentEmail: false, consentWa: false, leadScore: 10 },
      { externalId: 'usr_008', firstName: 'Meera',    lastName: 'Iyer',    email: 'meera.iyer@example.com',     phone: '+919876543208', lifecycle: 'churned',         consentEmail: true,  consentWa: false, leadScore: 15 },
      { externalId: 'usr_009', firstName: 'Arjun',    lastName: 'Nair',    email: 'arjun.nair@example.com',     phone: '+919876543209', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 80 },
      { externalId: 'usr_010', firstName: 'Divya',    lastName: 'Pillai',  email: 'divya.pillai@example.com',   phone: '+919876543210', lifecycle: 'lead',            consentEmail: true,  consentWa: true,  leadScore: 58 },
      { externalId: 'usr_011', firstName: 'Rahul',    lastName: 'Joshi',   email: 'rahul.joshi@example.com',    phone: '+919876543211', lifecycle: 'subscriber',      consentEmail: true,  consentWa: false, leadScore: 40 },
      { externalId: 'usr_012', firstName: 'Kavya',    lastName: 'Bhat',    email: 'kavya.bhat@example.com',     phone: '+919876543212', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 77 },
      { externalId: 'usr_013', firstName: 'Siddharth', lastName: 'Rao',   email: 'siddharth.rao@example.com',  phone: '+919876543213', lifecycle: 'lead',            consentEmail: true,  consentWa: false, leadScore: 62 },
      { externalId: 'usr_014', firstName: 'Nisha',    lastName: 'Kapoor',  email: 'nisha.kapoor@example.com',   phone: '+919876543214', lifecycle: 'churned',         consentEmail: true,  consentWa: false, leadScore: 8  },
      { externalId: 'usr_015', firstName: 'Aditya',   lastName: 'Kumar',   email: 'aditya.kumar@example.com',   phone: '+919876543215', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 85 },
      { externalId: 'usr_016', firstName: 'Pooja',    lastName: 'Mishra',  email: 'pooja.mishra@example.com',   phone: '+919876543216', lifecycle: 'subscriber',      consentEmail: true,  consentWa: false, leadScore: 22 },
      { externalId: 'usr_017', firstName: 'Nikhil',   lastName: 'Tiwari',  email: 'nikhil.tiwari@example.com',  phone: '+919876543217', lifecycle: 'lead',            consentEmail: true,  consentWa: true,  leadScore: 70 },
      { externalId: 'usr_018', firstName: 'Rhea',     lastName: 'Desai',   email: 'rhea.desai@example.com',     phone: '+919876543218', lifecycle: 'active_customer', consentEmail: true,  consentWa: false, leadScore: 90 },
      { externalId: 'usr_019', firstName: 'Varun',    lastName: 'Malhotra',email: 'varun.malhotra@example.com', phone: '+919876543219', lifecycle: 'churned',         consentEmail: false, consentWa: false, leadScore: 5  },
      { externalId: 'usr_020', firstName: 'Tanvi',    lastName: 'Shah',    email: 'tanvi.shah@example.com',     phone: '+919876543220', lifecycle: 'subscriber',      consentEmail: true,  consentWa: true,  leadScore: 45 },
      { externalId: 'usr_021', firstName: 'Isha',     lastName: 'Pandey',  email: 'isha.pandey@example.com',    phone: '+919876543221', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 83 },
      { externalId: 'usr_022', firstName: 'Manish',   lastName: 'Agarwal', email: 'manish.agarwal@example.com', phone: '+919876543222', lifecycle: 'lead',            consentEmail: true,  consentWa: false, leadScore: 55 },
      { externalId: 'usr_023', firstName: 'Swati',    lastName: 'Saxena',  email: 'swati.saxena@example.com',   phone: '+919876543223', lifecycle: 'subscriber',      consentEmail: true,  consentWa: false, leadScore: 35 },
      { externalId: 'usr_024', firstName: 'Dev',      lastName: 'Choudhary',email:'dev.choudhary@example.com', phone: '+919876543224', lifecycle: 'active_customer', consentEmail: true,  consentWa: true,  leadScore: 91 },
      { externalId: 'usr_025', firstName: 'Nandini',  lastName: 'Srivastava',email:'nandini.srivastava@example.com', phone: '+919876543225', lifecycle: 'lead', consentEmail: true, consentWa: true, leadScore: 68 },
    ]

    const contactIds: string[] = []
    for (const c of contacts) {
      const res = await q.query(
        `INSERT INTO contacts (tenant_id, external_id, first_name, last_name, email, phone,
          attributes, consent_email, consent_whatsapp, lifecycle_stage)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [TENANT_ID, c.externalId, c.firstName, c.lastName, c.email, c.phone,
         JSON.stringify({ lead_score: c.leadScore, country: 'IN', plan: c.lifecycle === 'active_customer' ? 'pro' : 'free' }),
         c.consentEmail, c.consentWa, c.lifecycle]
      )
      contactIds.push(res[0].id)
    }
    console.log(`✓ Inserted ${contactIds.length} contacts`)

    // ── 2. Segments ──────────────────────────────────────────────────────────
    const segRows = await q.query(
      `INSERT INTO segments (tenant_id, name, rules, audience_estimate, refresh_cadence) VALUES
        ($1, 'Newsletter Subscribers',     $2, 18, 'hourly'),
        ($1, 'Active Customers',           $3, 9,  'hourly'),
        ($1, 'High-Value Leads',           $4, 7,  'daily'),
        ($1, 'Re-engagement Targets',      $5, 4,  'on_demand')
       RETURNING id, name`,
      [
        TENANT_ID,
        JSON.stringify({ include: [{ field: 'consent_email', op: 'eq', value: true }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'lifecycle_stage', op: 'eq', value: 'active_customer' }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'attributes.lead_score', op: 'gt', value: 50 }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'lifecycle_stage', op: 'eq', value: 'churned' }, { field: 'consent_email', op: 'eq', value: true }], exclude: [] }),
      ]
    )
    const [segAll, segActive, segHighValue, segChurned] = segRows.map((r: any) => r.id)
    console.log(`✓ Inserted ${segRows.length} segments`)

    // ── 3. Templates ─────────────────────────────────────────────────────────
    const tplRows = await q.query(
      `INSERT INTO templates (tenant_id, name, type, channel, subject, preheader, html_body, text_body, variables, approval_status, category) VALUES
        ($1,'Welcome to CampaignBuilder','email','email','Welcome, {{first_name}}! 🎉','Your account is ready','<h1>Hi {{first_name}},</h1><p>Welcome aboard! Your account <strong>{{email}}</strong> is all set.</p><p><a href="{{cta_url}}">Get started →</a></p>','Hi {{first_name}}, welcome to CampaignBuilder! Visit {{cta_url}} to get started.','{first_name,email,cta_url}','approved','marketing'),
        ($1,'Cart Abandonment Reminder','email','email','You left something behind, {{first_name}}','Complete your purchase today','<h2>Hi {{first_name}},</h2><p>You left <strong>{{item_name}}</strong> in your cart.</p><p><a href="{{cart_url}}">Complete purchase →</a></p>','Hi {{first_name}}, complete your purchase of {{item_name}} at {{cart_url}}.','{first_name,item_name,cart_url,item_price}','approved','marketing'),
        ($1,'Monthly Newsletter — May 2026','email','email','May 2026: Product updates & tips','See what''s new this month','<h1>May 2026 Newsletter</h1><p>Hi {{first_name}}, here''s what''s new: {{highlights}}</p>','Hi {{first_name}}, May 2026 highlights: {{highlights}}.','{first_name,highlights,unsubscribe_url}','approved','marketing'),
        ($1,'OTP Verification','whatsapp','whatsapp',NULL,NULL,NULL,'Your OTP is {{otp_code}}. Valid for {{expiry_mins}} minutes. Do not share with anyone.','{otp_code,expiry_mins}','approved','transactional'),
        ($1,'Product Launch Announcement','email','email','Introducing {{product_name}} — Now Live!','The wait is over','<h1>{{product_name}} is here!</h1><p>Hi {{first_name}}, {{product_description}}</p><p><a href="{{launch_url}}">Explore now →</a></p>','Hi {{first_name}}, {{product_name}} is now live! Visit {{launch_url}}.','{first_name,product_name,product_description,launch_url}','approved','marketing'),
        ($1,'Win-Back: We miss you','email','email','{{first_name}}, it''s been a while...','Come back and see what''s new','<h2>Hi {{first_name}},</h2><p>We noticed you haven''t visited in {{days_inactive}} days.</p><p><a href="{{reactivate_url}}">Reactivate your account →</a></p>','Hi {{first_name}}, we miss you! It has been {{days_inactive}} days. Visit {{reactivate_url}} to come back.','{first_name,days_inactive,reactivate_url}','approved','marketing')
       RETURNING id, name`,
      [TENANT_ID]
    )
    const [tplWelcome, tplCart, tplNewsletter, tplOtp, tplLaunch, tplWinback] = tplRows.map((r: any) => r.id)
    console.log(`✓ Inserted ${tplRows.length} templates`)

    // ── 4. Channel Config ─────────────────────────────────────────────────────
    const emailCreds = encryptCredentials({ api_key: 're_demo_key_abc123', from_name: 'Campaign Builder Demo', from_email: 'demo@campaignbuilder.io' })
    await q.query(
      `INSERT INTO channel_configs (tenant_id, channel, provider, credentials, is_active, health_status, last_checked_at) VALUES
        ($1, 'email', 'resend', $2, true, 'healthy', now())`,
      [TENANT_ID, emailCreds]
    )
    console.log('✓ Inserted channel config (email/resend)')

    // ── 5. Campaigns ─────────────────────────────────────────────────────────
    const insertCampaign = async (
      name: string, description: string, workspace: string, type: string, status: string,
      channels: string, segId: string | null, tplId: string | null,
      scheduledFor: string | null, tags: string, version: number, abTest: boolean,
      utm: string, metadata: string,
    ): Promise<string> => {
      const res = await q.query(
        `INSERT INTO campaigns (tenant_id, name, description, workspace, type, status, channels,
          audience_segment_id, template_id, scheduled_for, tags, created_by, version,
          ab_test_enabled, utm_params, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'admin@demo.com',$12,$13,$14,$15)
         RETURNING id`,
        [TENANT_ID, name, description, workspace, type, status, channels,
         segId, tplId, scheduledFor, tags, version, abTest, utm, metadata]
      )
      return res[0].id
    }

    const campNewsletter = await insertCampaign(
      'Q2 Newsletter — May 2026', 'Monthly product update email for all subscribers', 'marketing',
      'one_time', 'completed', '{email}', segAll, tplNewsletter,
      new Date(Date.now() - 7 * 86400000).toISOString(), '{newsletter,product-update}', 3, false,
      '{"source":"email","medium":"newsletter","campaign":"q2-newsletter-may2026","content":""}',
      '{"frequencyCapPerDay":1,"quietHoursStart":"22:00","quietHoursEnd":"08:00","quietHoursTimezone":"Asia/Kolkata"}'
    )
    const campWelcome = await insertCampaign(
      'Welcome Email Series', 'Automated welcome drip for new signups', 'onboarding',
      'recurring', 'running', '{email}', segActive, tplWelcome, null,
      '{welcome,onboarding}', 2, false,
      '{"source":"email","medium":"lifecycle","campaign":"welcome-series","content":""}',
      '{"frequencyCapPerDay":1,"quietHoursStart":"21:00","quietHoursEnd":"09:00","quietHoursTimezone":"Asia/Kolkata"}'
    )
    const campCart = await insertCampaign(
      'Cart Abandonment Recovery', 'Trigger email 1h after cart is abandoned', 'marketing',
      'triggered', 'running', '{email}', segActive, tplCart, null,
      '{cart,recovery,triggered}', 1, false,
      '{"source":"email","medium":"triggered","campaign":"cart-recovery","content":"cart-v1"}',
      '{"frequencyCapPerDay":2,"quietHoursStart":"23:00","quietHoursEnd":"07:00","quietHoursTimezone":"Asia/Kolkata"}'
    )
    const campLaunch = await insertCampaign(
      'Product Launch — Engage v2', 'Launch announcement for Engage Plugin 2.0', 'product',
      'one_time', 'scheduled', '{email}', segAll, tplLaunch,
      new Date(Date.now() + 14 * 86400000).toISOString(),
      '{launch,product,engage-v2}', 1, true,
      '{"source":"email","medium":"announcement","campaign":"engage-v2-launch","content":"{{variant.id}}"}',
      '{"frequencyCapPerDay":1,"quietHoursStart":"22:00","quietHoursEnd":"08:00","quietHoursTimezone":"Asia/Kolkata"}'
    )
    await insertCampaign(
      'Re-engagement Drive Q2', 'Win back churned users from Q1', 'marketing',
      'one_time', 'draft', '{email}', segChurned, tplWinback, null,
      '{reengagement,winback}', 1, false,
      '{"source":"email","medium":"lifecycle","campaign":"reengagement-q2","content":""}', '{}'
    )
    await insertCampaign(
      'OTP Notifications', 'Transactional OTP via WhatsApp', 'transactional',
      'transactional', 'running', '{whatsapp}', null, tplOtp, null,
      '{otp,transactional,whatsapp}', 1, false, '{}', '{}'
    )
    console.log('✓ Inserted 6 campaigns')

    // ── 6. Journeys ──────────────────────────────────────────────────────────
    await q.query(
      `INSERT INTO journeys (tenant_id, name, status, nodes, entry_trigger) VALUES
        ($1, 'Onboarding Journey', 'active',
          $2::jsonb,
          '{"type":"event","event":"user_signed_up"}'),
        ($1, 'Win-Back Journey', 'draft',
          $3::jsonb,
          '{"type":"event","event":"user_inactive_30d"}')`,
      [
        TENANT_ID,
        JSON.stringify([
          { id: 'n1', type: 'trigger',  label: 'User signs up',          position: { x: 100, y: 50 }  },
          { id: 'n2', type: 'email',    label: 'Send welcome email',      position: { x: 100, y: 180 }, templateId: tplWelcome },
          { id: 'n3', type: 'wait',     label: 'Wait 3 days',             position: { x: 100, y: 310 }, config: { duration: 3, unit: 'days' } },
          { id: 'n4', type: 'condition',label: 'Opened email?',           position: { x: 100, y: 440 }, config: { event: 'email_opened' } },
          { id: 'n5', type: 'email',    label: 'Send feature tips',       position: { x: 0,   y: 570 }, templateId: tplWelcome },
          { id: 'n6', type: 'email',    label: 'Send re-engagement nudge',position: { x: 200, y: 570 }, templateId: tplWinback },
        ]),
        JSON.stringify([
          { id: 'n1', type: 'trigger',  label: 'User inactive 30 days',  position: { x: 100, y: 50 }  },
          { id: 'n2', type: 'email',    label: 'Send win-back email',     position: { x: 100, y: 180 }, templateId: tplWinback },
          { id: 'n3', type: 'wait',     label: 'Wait 7 days',             position: { x: 100, y: 310 }, config: { duration: 7, unit: 'days' } },
          { id: 'n4', type: 'condition',label: 'Converted?',              position: { x: 100, y: 440 }, config: { event: 'purchase_completed' } },
        ]),
      ]
    )
    console.log('✓ Inserted 2 journeys')

    // ── 7. Campaign Deliveries + Events (for completed newsletter) ─────────
    const deliveryStatuses = [
      'clicked','clicked','clicked','opened','opened','opened','opened',
      'delivered','delivered','bounced','failed','sent','sent',
    ]
    // Use first 18 contacts for the newsletter campaign
    const newsletterContacts = contactIds.slice(0, 18)
    const deliveryIds: string[] = []

    for (let i = 0; i < newsletterContacts.length; i++) {
      const status = deliveryStatuses[i % deliveryStatuses.length]
      const sentAt = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000) + (i * 300000))
      const res = await q.query(
        `INSERT INTO campaign_deliveries
           (tenant_id, campaign_id, contact_id, channel, status, sent_at, provider_msg_id, error_reason)
         VALUES ($1, $2, $3, 'email', $4, $5, $6, $7) RETURNING id`,
        [
          TENANT_ID, campNewsletter, newsletterContacts[i], status,
          sentAt.toISOString(),
          `msg_${Math.random().toString(36).slice(2, 10)}`,
          status === 'bounced' ? 'Hard bounce: email address does not exist' :
          status === 'failed'  ? 'Delivery failed: recipient server rejected message' : null,
        ]
      )
      deliveryIds.push(res[0].id)
    }

    // Also add some deliveries for the Welcome campaign (running)
    const welcomeContacts = contactIds.slice(0, 9)
    for (let i = 0; i < welcomeContacts.length; i++) {
      const wStatus = ['sent','delivered','opened','clicked'][Math.floor(Math.random() * 4)]
      await q.query(
        `INSERT INTO campaign_deliveries
           (tenant_id, campaign_id, contact_id, channel, status, sent_at, provider_msg_id)
         VALUES ($1, $2, $3, 'email', $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [TENANT_ID, campWelcome, welcomeContacts[i], wStatus,
         new Date(Date.now() - (i * 86400000)).toISOString(),
         `msg_${Math.random().toString(36).slice(2, 10)}`]
      )
    }
    console.log(`✓ Inserted ${deliveryIds.length + welcomeContacts.length} deliveries`)

    // ── 8. Delivery Events ───────────────────────────────────────────────────
    const eventMap: Record<string, string[][]> = {
      sent:      [['sent',      {}]],
      delivered: [['sent',      {}], ['delivered', {}]],
      opened:    [['sent',      {}], ['delivered', {}], ['opened',    { user_agent: 'Mozilla/5.0', device: 'mobile' }]],
      clicked:   [['sent',      {}], ['delivered', {}], ['opened',    { user_agent: 'Mozilla/5.0', device: 'desktop' }], ['clicked', { url: 'https://app.campaignbuilder.io', link_id: 'cta_main' }]],
      bounced:   [['sent',      {}], ['bounced',   { bounce_type: 'hard', smtp_code: '550' }]],
      failed:    [['failed',    { reason: 'rejected_by_server' }]],
    }

    for (let i = 0; i < deliveryIds.length; i++) {
      const status = deliveryStatuses[i % deliveryStatuses.length]
      const events = eventMap[status] || [['sent', {}]]
      const baseTime = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000) + (i * 300000))

      for (let j = 0; j < events.length; j++) {
        const [evType, evMeta] = events[j]
        await q.query(
          `INSERT INTO delivery_events (tenant_id, delivery_id, event_type, occurred_at, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [TENANT_ID, deliveryIds[i], evType,
           new Date(baseTime.getTime() + j * 60000).toISOString(),
           JSON.stringify(evMeta)]
        )
      }
    }
    console.log('✓ Inserted delivery events')

    console.log('\n✅ Demo seed complete!')
    console.log(`   Tenant ID : ${TENANT_ID}`)
    console.log(`   Contacts  : ${contactIds.length}`)
    console.log(`   Segments  : 4`)
    console.log(`   Templates : 6`)
    console.log(`   Campaigns : 6`)
    console.log(`   Journeys  : 2`)
    console.log(`   Deliveries: ${deliveryIds.length + welcomeContacts.length}`)

  } catch (err) {
    console.error('Seed failed:', (err as Error).message)
    throw err
  } finally {
    await q.release()
    await AppDataSource.destroy()
  }
}

seed().catch(() => process.exit(1))
