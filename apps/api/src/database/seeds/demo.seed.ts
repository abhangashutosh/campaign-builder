import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { createCipheriv, randomBytes } from 'crypto'

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

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString()
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
    await q.query(`DELETE FROM delivery_events    WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM campaign_deliveries WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM campaigns           WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM journeys            WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM templates           WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM segments            WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM channel_configs     WHERE tenant_id = $1`, [TENANT_ID])
    await q.query(`DELETE FROM contacts            WHERE tenant_id = $1`, [TENANT_ID])
    console.log('✓ Cleared existing demo data')

    // ════════════════════════════════════════════════════════════════════════
    // 1. CONTACTS  (50 demo contacts — Indian professionals, varied lifecycle)
    // ════════════════════════════════════════════════════════════════════════
    const rawContacts = [
      // active_customer  (12)
      { ext: 'usr_001', fn: 'Aarav',      ln: 'Mehta',       email: 'aarav.mehta@example.com',       phone: '+919876543201', lc: 'active_customer', ce: true,  cw: true,  score: 92, plan: 'pro' },
      { ext: 'usr_002', fn: 'Priya',      ln: 'Sharma',      email: 'priya.sharma@example.com',      phone: '+919876543202', lc: 'active_customer', ce: true,  cw: false, score: 88, plan: 'pro' },
      { ext: 'usr_006', fn: 'Ananya',     ln: 'Reddy',       email: 'ananya.reddy@example.com',      phone: '+919876543206', lc: 'active_customer', ce: true,  cw: true,  score: 95, plan: 'pro' },
      { ext: 'usr_009', fn: 'Arjun',      ln: 'Nair',        email: 'arjun.nair@example.com',        phone: '+919876543209', lc: 'active_customer', ce: true,  cw: true,  score: 80, plan: 'pro' },
      { ext: 'usr_012', fn: 'Kavya',      ln: 'Bhat',        email: 'kavya.bhat@example.com',        phone: '+919876543212', lc: 'active_customer', ce: true,  cw: true,  score: 77, plan: 'pro' },
      { ext: 'usr_015', fn: 'Aditya',     ln: 'Kumar',       email: 'aditya.kumar@example.com',      phone: '+919876543215', lc: 'active_customer', ce: true,  cw: true,  score: 85, plan: 'pro' },
      { ext: 'usr_018', fn: 'Rhea',       ln: 'Desai',       email: 'rhea.desai@example.com',        phone: '+919876543218', lc: 'active_customer', ce: true,  cw: false, score: 90, plan: 'enterprise' },
      { ext: 'usr_021', fn: 'Isha',       ln: 'Pandey',      email: 'isha.pandey@example.com',       phone: '+919876543221', lc: 'active_customer', ce: true,  cw: true,  score: 83, plan: 'pro' },
      { ext: 'usr_024', fn: 'Dev',        ln: 'Choudhary',   email: 'dev.choudhary@example.com',     phone: '+919876543224', lc: 'active_customer', ce: true,  cw: true,  score: 91, plan: 'enterprise' },
      { ext: 'usr_026', fn: 'Ritika',     ln: 'Verma',       email: 'ritika.verma@example.com',      phone: '+919876543226', lc: 'active_customer', ce: true,  cw: true,  score: 87, plan: 'pro' },
      { ext: 'usr_027', fn: 'Sameer',     ln: 'Kapoor',      email: 'sameer.kapoor@example.com',     phone: '+919876543227', lc: 'active_customer', ce: true,  cw: false, score: 79, plan: 'pro' },
      { ext: 'usr_028', fn: 'Trisha',     ln: 'Ghosh',       email: 'trisha.ghosh@example.com',      phone: '+919876543228', lc: 'active_customer', ce: true,  cw: true,  score: 93, plan: 'enterprise' },
      // lead  (14)
      { ext: 'usr_003', fn: 'Rohan',      ln: 'Gupta',       email: 'rohan.gupta@example.com',       phone: '+919876543203', lc: 'lead',            ce: true,  cw: true,  score: 74, plan: 'free' },
      { ext: 'usr_004', fn: 'Sneha',      ln: 'Patel',       email: 'sneha.patel@example.com',       phone: '+919876543204', lc: 'lead',            ce: true,  cw: false, score: 65, plan: 'free' },
      { ext: 'usr_010', fn: 'Divya',      ln: 'Pillai',      email: 'divya.pillai@example.com',      phone: '+919876543210', lc: 'lead',            ce: true,  cw: true,  score: 58, plan: 'free' },
      { ext: 'usr_013', fn: 'Siddharth',  ln: 'Rao',         email: 'siddharth.rao@example.com',     phone: '+919876543213', lc: 'lead',            ce: true,  cw: false, score: 62, plan: 'free' },
      { ext: 'usr_017', fn: 'Nikhil',     ln: 'Tiwari',      email: 'nikhil.tiwari@example.com',     phone: '+919876543217', lc: 'lead',            ce: true,  cw: true,  score: 70, plan: 'free' },
      { ext: 'usr_022', fn: 'Manish',     ln: 'Agarwal',     email: 'manish.agarwal@example.com',    phone: '+919876543222', lc: 'lead',            ce: true,  cw: false, score: 55, plan: 'free' },
      { ext: 'usr_025', fn: 'Nandini',    ln: 'Srivastava',  email: 'nandini.srivastava@example.com',phone: '+919876543225', lc: 'lead',            ce: true,  cw: true,  score: 68, plan: 'free' },
      { ext: 'usr_029', fn: 'Vikash',     ln: 'Jain',        email: 'vikash.jain@example.com',       phone: '+919876543229', lc: 'lead',            ce: true,  cw: false, score: 61, plan: 'free' },
      { ext: 'usr_030', fn: 'Prerna',     ln: 'Sinha',       email: 'prerna.sinha@example.com',      phone: '+919876543230', lc: 'lead',            ce: true,  cw: true,  score: 72, plan: 'free' },
      { ext: 'usr_031', fn: 'Akash',      ln: 'Yadav',       email: 'akash.yadav@example.com',       phone: '+919876543231', lc: 'lead',            ce: true,  cw: true,  score: 66, plan: 'free' },
      { ext: 'usr_032', fn: 'Shruti',     ln: 'Bajaj',       email: 'shruti.bajaj@example.com',      phone: '+919876543232', lc: 'lead',            ce: true,  cw: false, score: 59, plan: 'free' },
      { ext: 'usr_033', fn: 'Gaurav',     ln: 'Bansal',      email: 'gaurav.bansal@example.com',     phone: '+919876543233', lc: 'lead',            ce: true,  cw: false, score: 53, plan: 'free' },
      { ext: 'usr_034', fn: 'Apurva',     ln: 'Kulkarni',    email: 'apurva.kulkarni@example.com',   phone: '+919876543234', lc: 'lead',            ce: true,  cw: true,  score: 77, plan: 'free' },
      // subscriber  (12)
      { ext: 'usr_005', fn: 'Vikram',     ln: 'Singh',       email: 'vikram.singh@example.com',      phone: '+919876543205', lc: 'subscriber',      ce: true,  cw: false, score: 30, plan: 'free' },
      { ext: 'usr_011', fn: 'Rahul',      ln: 'Joshi',       email: 'rahul.joshi@example.com',       phone: '+919876543211', lc: 'subscriber',      ce: true,  cw: false, score: 40, plan: 'free' },
      { ext: 'usr_016', fn: 'Pooja',      ln: 'Mishra',      email: 'pooja.mishra@example.com',      phone: '+919876543216', lc: 'subscriber',      ce: true,  cw: false, score: 22, plan: 'free' },
      { ext: 'usr_020', fn: 'Tanvi',      ln: 'Shah',        email: 'tanvi.shah@example.com',        phone: '+919876543220', lc: 'subscriber',      ce: true,  cw: true,  score: 45, plan: 'free' },
      { ext: 'usr_023', fn: 'Swati',      ln: 'Saxena',      email: 'swati.saxena@example.com',      phone: '+919876543223', lc: 'subscriber',      ce: true,  cw: false, score: 35, plan: 'free' },
      { ext: 'usr_035', fn: 'Lalit',      ln: 'Chandra',     email: 'lalit.chandra@example.com',     phone: '+919876543235', lc: 'subscriber',      ce: true,  cw: false, score: 28, plan: 'free' },
      { ext: 'usr_036', fn: 'Deepa',      ln: 'Nataraj',     email: 'deepa.nataraj@example.com',     phone: '+919876543236', lc: 'subscriber',      ce: true,  cw: true,  score: 33, plan: 'free' },
      { ext: 'usr_037', fn: 'Harish',     ln: 'Menon',       email: 'harish.menon@example.com',      phone: '+919876543237', lc: 'subscriber',      ce: true,  cw: false, score: 25, plan: 'free' },
      { ext: 'usr_038', fn: 'Sonal',      ln: 'Khanna',      email: 'sonal.khanna@example.com',      phone: '+919876543238', lc: 'subscriber',      ce: true,  cw: false, score: 38, plan: 'free' },
      { ext: 'usr_039', fn: 'Bharat',     ln: 'Rawat',       email: 'bharat.rawat@example.com',      phone: '+919876543239', lc: 'subscriber',      ce: true,  cw: true,  score: 42, plan: 'free' },
      { ext: 'usr_040', fn: 'Pallavi',    ln: 'Deshpande',   email: 'pallavi.deshpande@example.com', phone: '+919876543240', lc: 'subscriber',      ce: true,  cw: false, score: 31, plan: 'free' },
      { ext: 'usr_041', fn: 'Suresh',     ln: 'Iyer',        email: 'suresh.iyer@example.com',       phone: '+919876543241', lc: 'subscriber',      ce: true,  cw: false, score: 27, plan: 'free' },
      // churned  (6)
      { ext: 'usr_007', fn: 'Karan',      ln: 'Verma',       email: 'karan.verma@example.com',       phone: '+919876543207', lc: 'churned',         ce: false, cw: false, score: 10, plan: 'free' },
      { ext: 'usr_008', fn: 'Meera',      ln: 'Iyer',        email: 'meera.iyer@example.com',        phone: '+919876543208', lc: 'churned',         ce: true,  cw: false, score: 15, plan: 'free' },
      { ext: 'usr_014', fn: 'Nisha',      ln: 'Kapoor',      email: 'nisha.kapoor@example.com',      phone: '+919876543214', lc: 'churned',         ce: true,  cw: false, score: 8,  plan: 'free' },
      { ext: 'usr_019', fn: 'Varun',      ln: 'Malhotra',    email: 'varun.malhotra@example.com',    phone: '+919876543219', lc: 'churned',         ce: false, cw: false, score: 5,  plan: 'free' },
      { ext: 'usr_042', fn: 'Seema',      ln: 'Trivedi',     email: 'seema.trivedi@example.com',     phone: '+919876543242', lc: 'churned',         ce: true,  cw: false, score: 12, plan: 'free' },
      { ext: 'usr_043', fn: 'Raj',        ln: 'Pillai',      email: 'raj.pillai@example.com',        phone: '+919876543243', lc: 'churned',         ce: false, cw: false, score: 7,  plan: 'free' },
      // high-value leads  (6, lead_score > 70)
      { ext: 'usr_044', fn: 'Harshit',    ln: 'Agarwal',     email: 'harshit.agarwal@example.com',   phone: '+919876543244', lc: 'lead',            ce: true,  cw: true,  score: 82, plan: 'free' },
      { ext: 'usr_045', fn: 'Sakshi',     ln: 'Misra',       email: 'sakshi.misra@example.com',      phone: '+919876543245', lc: 'lead',            ce: true,  cw: true,  score: 76, plan: 'free' },
      { ext: 'usr_046', fn: 'Rohit',      ln: 'Shukla',      email: 'rohit.shukla@example.com',      phone: '+919876543246', lc: 'lead',            ce: true,  cw: false, score: 71, plan: 'free' },
      { ext: 'usr_047', fn: 'Anjali',     ln: 'Soni',        email: 'anjali.soni@example.com',       phone: '+919876543247', lc: 'lead',            ce: true,  cw: true,  score: 84, plan: 'free' },
      { ext: 'usr_048', fn: 'Pankaj',     ln: 'Dubey',       email: 'pankaj.dubey@example.com',      phone: '+919876543248', lc: 'lead',            ce: true,  cw: false, score: 78, plan: 'free' },
      { ext: 'usr_049', fn: 'Ritu',       ln: 'Pathak',      email: 'ritu.pathak@example.com',       phone: '+919876543249', lc: 'lead',            ce: true,  cw: true,  score: 80, plan: 'free' },
    ]

    const contactIds: string[] = []
    const contactMap: Record<string, string> = {}
    for (const c of rawContacts) {
      const res = await q.query(
        `INSERT INTO contacts (tenant_id, external_id, first_name, last_name, email, phone,
           attributes, consent_email, consent_whatsapp, lifecycle_stage)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [TENANT_ID, c.ext, c.fn, c.ln, c.email, c.phone,
         JSON.stringify({ lead_score: c.score, country: 'IN', plan: c.plan, city: 'Mumbai' }),
         c.ce, c.cw, c.lc]
      )
      contactIds.push(res[0].id)
      contactMap[c.ext] = res[0].id
    }
    console.log(`✓ Inserted ${contactIds.length} contacts`)

    // ════════════════════════════════════════════════════════════════════════
    // 2. SEGMENTS  (7 segments with varied cadences)
    // ════════════════════════════════════════════════════════════════════════
    const segRows = await q.query(
      `INSERT INTO segments (tenant_id, name, rules, audience_estimate, refresh_cadence) VALUES
        ($1, 'All Email Subscribers',    $2, 44, 'hourly'),
        ($1, 'Active Customers',         $3, 12, 'hourly'),
        ($1, 'High-Value Leads',         $4, 13, 'daily'),
        ($1, 'Re-engagement Targets',    $5, 6,  'on_demand'),
        ($1, 'WhatsApp Opted-In',        $6, 22, 'hourly'),
        ($1, 'Enterprise Accounts',      $7, 3,  'daily'),
        ($1, 'New Signups (Last 30d)',   $8, 8,  'hourly')
       RETURNING id, name`,
      [
        TENANT_ID,
        JSON.stringify({ include: [{ field: 'consent_email', op: 'eq', value: true }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'lifecycle_stage', op: 'eq', value: 'active_customer' }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'attributes.lead_score', op: 'gt', value: 70 }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'lifecycle_stage', op: 'in', value: ['churned'] }, { field: 'consent_email', op: 'eq', value: true }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'consent_whatsapp', op: 'eq', value: true }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'attributes.plan', op: 'eq', value: 'enterprise' }], exclude: [] }),
        JSON.stringify({ include: [{ field: 'created_at', op: 'gte', value: daysAgo(30) }], exclude: [] }),
      ]
    )
    const [segAll, segActive, segHighValue, segChurned, segWA, segEnterprise, segNew] = segRows.map((r: { id: string }) => r.id)
    console.log(`✓ Inserted ${segRows.length} segments`)

    // ════════════════════════════════════════════════════════════════════════
    // 3. TEMPLATES  (10 templates — mix of statuses + channels)
    // ════════════════════════════════════════════════════════════════════════
    const tplRows = await q.query(
      `INSERT INTO templates (tenant_id, name, type, channel, subject, preheader, html_body, text_body, variables, approval_status, category) VALUES
        ($1,'Welcome to CampaignBuilder','email','email',
          'Welcome, {{first_name}}! 🎉','Your account is ready',
          '<h1 style="color:#1E3A5F">Hi {{first_name}},</h1><p>Welcome aboard! Your account <strong>{{email}}</strong> is all set.</p><p>You are now part of 10,000+ marketers using Engage to run smarter campaigns.</p><p style="margin-top:24px"><a href="{{cta_url}}" style="background:#1E3A5F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Get started →</a></p>',
          'Hi {{first_name}}, welcome to CampaignBuilder! Visit {{cta_url}} to get started.',
          '{first_name,email,cta_url}','approved','marketing'),

        ($1,'Cart Abandonment Reminder','email','email',
          'You left something behind, {{first_name}}','Complete your purchase today',
          '<h2 style="color:#1E3A5F">Hi {{first_name}},</h2><p>You left <strong>{{item_name}}</strong> (₹{{item_price}}) in your cart.</p><p>Your cart is saved and ready — complete your order before it expires.</p><p style="margin-top:20px"><a href="{{cart_url}}" style="background:#1E3A5F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Complete purchase →</a></p>',
          'Hi {{first_name}}, complete your purchase of {{item_name}} at {{cart_url}}.',
          '{first_name,item_name,cart_url,item_price}','approved','marketing'),

        ($1,'Monthly Newsletter — May 2026','email','email',
          'May 2026: Product updates & tips ✨','See what''s new this month',
          '<h1 style="color:#1E3A5F">May 2026 Newsletter</h1><p>Hi {{first_name}}, here is what shipped this month:</p><ul>{{highlights}}</ul><p>Read more on our blog →</p>',
          'Hi {{first_name}}, May 2026 highlights: {{highlights}}.',
          '{first_name,highlights,unsubscribe_url}','approved','marketing'),

        ($1,'OTP Verification','whatsapp','whatsapp',
          NULL,NULL,NULL,
          'Your OTP is *{{otp_code}}*. Valid for {{expiry_mins}} minutes. Do not share this code with anyone.',
          '{otp_code,expiry_mins}','approved','transactional'),

        ($1,'Product Launch Announcement','email','email',
          'Introducing {{product_name}} — Now Live! 🚀','The wait is over',
          '<h1 style="color:#1E3A5F">{{product_name}} is here!</h1><p>Hi {{first_name}},</p><p>{{product_description}}</p><p style="margin-top:24px"><a href="{{launch_url}}" style="background:#1E3A5F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Explore now →</a></p>',
          'Hi {{first_name}}, {{product_name}} is now live! Visit {{launch_url}}.',
          '{first_name,product_name,product_description,launch_url}','approved','marketing'),

        ($1,'Win-Back: We miss you','email','email',
          '{{first_name}}, it''s been a while...','Come back and see what''s new',
          '<h2 style="color:#1E3A5F">Hi {{first_name}},</h2><p>We noticed you have not visited in <strong>{{days_inactive}} days</strong>.</p><p>A lot has changed! Here is a special offer just for you: <strong>30% off your first month back.</strong></p><p style="margin-top:20px"><a href="{{reactivate_url}}" style="background:#1E3A5F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Reactivate →</a></p>',
          'Hi {{first_name}}, we miss you! It has been {{days_inactive}} days. Visit {{reactivate_url}} to come back.',
          '{first_name,days_inactive,reactivate_url}','approved','marketing'),

        ($1,'WhatsApp Onboarding Checklist','whatsapp','whatsapp',
          NULL,NULL,NULL,
          'Hi {{first_name}} 👋 Welcome to {{app_name}}! Complete your setup in 3 steps:\n1️⃣ Set up your first campaign\n2️⃣ Import contacts\n3️⃣ Choose a template\n\nNeed help? Reply *HELP* anytime.',
          '{first_name,app_name}','approved','marketing'),

        ($1,'Feature Announcement — Analytics v2','email','email',
          'New: {{feature_name}} is live in your dashboard','Check out what changed',
          '<h2 style="color:#1E3A5F">{{feature_name}} is now live</h2><p>Hi {{first_name}},</p><p>{{feature_description}}</p><p><a href="{{feature_url}}" style="color:#1E3A5F">See it in action →</a></p>',
          'Hi {{first_name}}, {{feature_name}} is now live. Check it out at {{feature_url}}.',
          '{first_name,feature_name,feature_description,feature_url}','pending','marketing'),

        ($1,'Price Drop Alert','email','email',
          '⚡ Price dropped on {{product_name}}!','Limited time offer',
          '<h2>Hi {{first_name}},</h2><p>The price of <strong>{{product_name}}</strong> just dropped from ₹{{old_price}} to <strong>₹{{new_price}}</strong>.</p><p>Grab it before it runs out!</p>',
          'Hi {{first_name}}, {{product_name}} dropped to ₹{{new_price}}.',
          '{first_name,product_name,old_price,new_price}','draft','marketing'),

        ($1,'Account Deletion Warning','email','email',
          'Your account will be deleted in {{days}} days','Action required',
          '<p>Hi {{first_name}},</p><p>Your account is scheduled for deletion in <strong>{{days}} days</strong> due to inactivity.</p><p>Log in to keep your account active.</p>',
          'Hi {{first_name}}, your account will be deleted in {{days}} days.',
          '{first_name,days,login_url}','rejected','transactional')

       RETURNING id, name`,
      [TENANT_ID]
    )
    const [tplWelcome, tplCart, tplNewsletter, tplOtp, tplLaunch, tplWinback, tplWAOnboard, tplFeature, , ] = tplRows.map((r: { id: string }) => r.id)
    console.log(`✓ Inserted ${tplRows.length} templates`)

    // ════════════════════════════════════════════════════════════════════════
    // 4. CHANNEL CONFIGS  (email + whatsapp)
    // ════════════════════════════════════════════════════════════════════════
    const emailCreds = encryptCredentials({ api_key: 're_demo_key_abc123', from_name: 'Campaign Builder Demo', from_email: 'demo@campaignbuilder.io' })
    const waCreds = encryptCredentials({ phone_number_id: '123456789', access_token: 'EAAd_demo_token', from_number: '+911234567890' })
    await q.query(
      `INSERT INTO channel_configs (tenant_id, channel, provider, credentials, is_active, health_status, last_checked_at) VALUES
        ($1, 'email',    'resend',  $2, true,  'healthy', now()),
        ($1, 'whatsapp', 'meta_wa', $3, true,  'healthy', now())`,
      [TENANT_ID, emailCreds, waCreds]
    )
    console.log('✓ Inserted 2 channel configs (email + whatsapp)')

    // ════════════════════════════════════════════════════════════════════════
    // 5. CAMPAIGNS  (10 campaigns — all statuses, both channels)
    // ════════════════════════════════════════════════════════════════════════
    const ic = async (
      name: string, desc: string, workspace: string, type: string, status: string,
      channels: string[], segId: string | null, tplId: string | null,
      scheduledFor: string | null, tags: string[], version: number, abTest: boolean,
    ): Promise<string> => {
      const res = await q.query(
        `INSERT INTO campaigns (tenant_id, name, description, workspace, type, status, channels,
           audience_segment_id, template_id, scheduled_for, tags, created_by, version,
           ab_test_enabled, utm_params, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'admin@demo.com',$12,$13,$14,$15) RETURNING id`,
        [TENANT_ID, name, desc, workspace, type, status, `{${channels.join(',')}}`,
         segId, tplId, scheduledFor, `{${tags.join(',')}}`, version, abTest,
         JSON.stringify({ source: 'email', medium: 'newsletter', campaign: name.toLowerCase().replace(/\s+/g, '-'), content: '' }),
         JSON.stringify({ frequencyCapPerDay: 2, quietHoursStart: '22:00', quietHoursEnd: '08:00', quietHoursTimezone: 'Asia/Kolkata' })]
      )
      return res[0].id
    }

    const campNewsletter = await ic('Q2 Newsletter — May 2026', 'Monthly product update email for all subscribers', 'marketing', 'one_time', 'completed', ['email'], segAll, tplNewsletter, daysAgo(7), ['newsletter', 'product-update'], 3, false)
    const campWelcome    = await ic('Welcome Email Series', 'Automated welcome drip for new signups', 'onboarding', 'recurring', 'running', ['email'], segNew, tplWelcome, null, ['welcome', 'onboarding'], 2, false)
    const campCart       = await ic('Cart Abandonment Recovery', 'Trigger email 1h after cart is abandoned', 'marketing', 'triggered', 'running', ['email'], segActive, tplCart, null, ['cart', 'recovery', 'triggered'], 1, false)
    const campLaunch     = await ic('Product Launch — Engage v2', 'Launch announcement for Engage Plugin 2.0 with A/B test', 'product', 'one_time', 'scheduled', ['email'], segAll, tplLaunch, daysFromNow(14), ['launch', 'product', 'engage-v2'], 1, true)
    const campWinback    = await ic('Re-engagement Drive Q2', 'Win back churned users from Q1 with 30% discount offer', 'marketing', 'one_time', 'draft', ['email'], segChurned, tplWinback, null, ['reengagement', 'winback'], 1, false)
    const campOTP        = await ic('OTP Notifications', 'Transactional OTP verification via WhatsApp', 'transactional', 'transactional', 'running', ['whatsapp'], null, tplOtp, null, ['otp', 'transactional', 'whatsapp'], 5, false)
    const campWAOnboard  = await ic('WhatsApp Onboarding', 'Onboarding checklist delivered via WhatsApp for new WA users', 'onboarding', 'triggered', 'completed', ['whatsapp'], segNew, tplWAOnboard, daysAgo(14), ['whatsapp', 'onboarding'], 2, false)
    const campHighValue  = await ic('High-Value Lead Nurture', 'Personalised nurture sequence for leads with score > 70', 'marketing', 'recurring', 'running', ['email'], segHighValue, tplFeature, null, ['nurture', 'high-value', 'leads'], 1, false)
    const campEnterprise = await ic('Enterprise Quarterly Update', 'Exclusive quarterly briefing for enterprise accounts', 'marketing', 'one_time', 'completed', ['email'], segEnterprise, tplNewsletter, daysAgo(30), ['enterprise', 'quarterly'], 4, false)
    await ic('Price Drop Blast', 'Flash sale alert for all email subscribers', 'marketing', 'one_time', 'paused', ['email'], segAll, null, daysFromNow(3), ['flash-sale', 'promo'], 1, false)
    console.log('✓ Inserted 10 campaigns')

    // ════════════════════════════════════════════════════════════════════════
    // 6. JOURNEYS  (4 journeys — active, draft, paused, completed)
    // ════════════════════════════════════════════════════════════════════════
    await q.query(
      `INSERT INTO journeys (tenant_id, name, status, nodes, entry_trigger) VALUES
        ($1, 'Onboarding Journey', 'active', $2::jsonb, '{"type":"event","event":"user_signed_up"}'),
        ($1, 'Win-Back Journey',   'draft',  $3::jsonb, '{"type":"event","event":"user_inactive_30d"}'),
        ($1, 'Lead Nurture Flow',  'active', $4::jsonb, '{"type":"segment","segment":"High-Value Leads"}'),
        ($1, 'Upsell Journey',     'paused', $5::jsonb, '{"type":"event","event":"trial_ended"}')`,
      [
        TENANT_ID,
        JSON.stringify([
          { id: 'n1', type: 'trigger',   label: 'User signs up',              position: { x: 200, y: 50  } },
          { id: 'n2', type: 'email',     label: 'Send welcome email',         position: { x: 200, y: 180 }, templateId: tplWelcome, config: { template: 'Welcome Email' } },
          { id: 'n3', type: 'wait',      label: 'Wait 3 days',                position: { x: 200, y: 310 }, config: { duration: 3, unit: 'days' } },
          { id: 'n4', type: 'condition', label: 'Opened email?',              position: { x: 200, y: 440 }, config: { event: 'email_opened', operator: 'eq', value: true } },
          { id: 'n5', type: 'email',     label: 'Send feature tips',          position: { x: 80,  y: 570 }, templateId: tplWelcome, config: { template: 'Feature Tips' } },
          { id: 'n6', type: 'email',     label: 'Send re-engagement nudge',   position: { x: 320, y: 570 }, templateId: tplWinback, config: { template: 'Win-Back' } },
          { id: 'n7', type: 'goal',      label: 'Completed onboarding',       position: { x: 200, y: 700 }, config: { event: 'onboarding_completed' } },
        ]),
        JSON.stringify([
          { id: 'n1', type: 'trigger',   label: 'User inactive 30 days',     position: { x: 200, y: 50  } },
          { id: 'n2', type: 'email',     label: 'Send win-back email',        position: { x: 200, y: 180 }, templateId: tplWinback },
          { id: 'n3', type: 'wait',      label: 'Wait 7 days',                position: { x: 200, y: 310 }, config: { duration: 7, unit: 'days' } },
          { id: 'n4', type: 'condition', label: 'Converted?',                 position: { x: 200, y: 440 }, config: { event: 'purchase_completed' } },
          { id: 'n5', type: 'goal',      label: 'Reactivated',                position: { x: 200, y: 570 }, config: { event: 'session_started' } },
        ]),
        JSON.stringify([
          { id: 'n1', type: 'trigger',   label: 'Enters High-Value segment',  position: { x: 200, y: 50  } },
          { id: 'n2', type: 'email',     label: 'Send personalised intro',    position: { x: 200, y: 180 }, templateId: tplFeature },
          { id: 'n3', type: 'wait',      label: 'Wait 2 days',                position: { x: 200, y: 310 }, config: { duration: 2, unit: 'days' } },
          { id: 'n4', type: 'condition', label: 'High intent signal?',        position: { x: 200, y: 440 }, config: { event: 'demo_requested' } },
          { id: 'n5', type: 'email',     label: 'Send case study',            position: { x: 80,  y: 570 }, templateId: tplFeature },
          { id: 'n6', type: 'email',     label: 'Send trial offer',           position: { x: 320, y: 570 }, templateId: tplLaunch },
        ]),
        JSON.stringify([
          { id: 'n1', type: 'trigger',   label: 'Trial ended (no purchase)',  position: { x: 200, y: 50  } },
          { id: 'n2', type: 'email',     label: 'Send upsell offer',          position: { x: 200, y: 180 }, templateId: tplLaunch },
          { id: 'n3', type: 'wait',      label: 'Wait 24 hours',              position: { x: 200, y: 310 }, config: { duration: 1, unit: 'days' } },
          { id: 'n4', type: 'condition', label: 'Upgraded?',                  position: { x: 200, y: 440 }, config: { event: 'plan_upgraded' } },
          { id: 'n5', type: 'goal',      label: 'Converted to paid',          position: { x: 200, y: 570 }, config: { event: 'plan_upgraded' } },
        ]),
      ]
    )
    console.log('✓ Inserted 4 journeys')

    // ════════════════════════════════════════════════════════════════════════
    // 7. DELIVERIES + EVENTS  (rich data for all completed/running campaigns)
    // ════════════════════════════════════════════════════════════════════════

    // Helper: insert a batch of deliveries and events for a campaign
    const insertDeliveries = async (
      campaignId: string, channel: string,
      contacts: string[], sentDaysAgo: number,
      mix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'>,
    ) => {
      const deliveryIds: string[] = []
      for (let i = 0; i < contacts.length; i++) {
        const status = mix[i % mix.length]
        const sentAt = new Date(Date.now() - sentDaysAgo * 86400000 + i * 300000)
        const res = await q.query(
          `INSERT INTO campaign_deliveries
             (tenant_id, campaign_id, contact_id, channel, status, sent_at, provider_msg_id, error_reason)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [TENANT_ID, campaignId, contacts[i], channel, status,
           sentAt.toISOString(),
           `msg_${Math.random().toString(36).slice(2, 10)}`,
           status === 'bounced' ? 'Hard bounce: address does not exist' :
           status === 'failed'  ? 'Delivery failed: server rejected message' : null]
        )
        deliveryIds.push(res[0].id)
      }

      // Insert delivery events per delivery
      const evMap: Record<string, Array<[string, Record<string, string>]>> = {
        sent:      [['sent', {}]],
        delivered: [['sent', {}], ['delivered', {}]],
        opened:    [['sent', {}], ['delivered', {}], ['opened', { user_agent: 'Mozilla/5.0', device: 'mobile' }]],
        clicked:   [['sent', {}], ['delivered', {}], ['opened', { user_agent: 'Mozilla/5.0', device: 'desktop' }], ['clicked', { url: 'https://app.campaignbuilder.io', link_id: 'cta_main' }]],
        bounced:   [['sent', {}], ['bounced', { bounce_type: 'hard', smtp_code: '550' }]],
        failed:    [['failed', { reason: 'rejected_by_server' }]],
      }

      for (let i = 0; i < deliveryIds.length; i++) {
        const status = mix[i % mix.length]
        const events = evMap[status] ?? [['sent', {}]]
        const base = new Date(Date.now() - sentDaysAgo * 86400000 + i * 300000)
        for (let j = 0; j < events.length; j++) {
          const [evType, evMeta] = events[j]
          await q.query(
            `INSERT INTO delivery_events (tenant_id, delivery_id, event_type, occurred_at, metadata)
             VALUES ($1,$2,$3,$4,$5)`,
            [TENANT_ID, deliveryIds[i], evType,
             new Date(base.getTime() + j * 90000).toISOString(),
             JSON.stringify(evMeta)]
          )
        }
      }
      return deliveryIds.length
    }

    // Q2 Newsletter (completed, 7 days ago) — 44 contacts
    const newsletterMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = [
      'clicked','clicked','clicked','clicked','clicked',
      'opened','opened','opened','opened','opened','opened','opened','opened',
      'delivered','delivered','delivered','delivered','delivered',
      'sent','sent','bounced','failed',
    ]
    const d1 = await insertDeliveries(campNewsletter, 'email', contactIds.slice(0, 44), 7, newsletterMix)
    console.log(`  newsletter: ${d1} deliveries`)

    // Welcome Email Series (running, staggered over last 8 days)
    const welcomeMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['clicked','opened','opened','delivered','sent']
    const d2 = await insertDeliveries(campWelcome, 'email', contactIds.slice(0, 8), 3, welcomeMix)
    console.log(`  welcome: ${d2} deliveries`)

    // Cart Abandonment (running, recent)
    const cartMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['clicked','clicked','opened','delivered','sent','bounced']
    const d3 = await insertDeliveries(campCart, 'email', contactIds.slice(0, 12), 1, cartMix)
    console.log(`  cart: ${d3} deliveries`)

    // WhatsApp Onboarding (completed, 14 days ago)
    const waMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['delivered','delivered','delivered','opened','sent']
    const d4 = await insertDeliveries(campWAOnboard, 'whatsapp', contactIds.slice(0, 8), 14, waMix)
    console.log(`  wa-onboard: ${d4} deliveries`)

    // Enterprise Quarterly (completed, 30 days ago)  — 3 enterprise contacts
    const entMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['clicked','opened','delivered']
    const d5 = await insertDeliveries(campEnterprise, 'email', contactIds.slice(0, 3), 30, entMix)
    console.log(`  enterprise: ${d5} deliveries`)

    // High-Value Lead Nurture (running, 5 days ago)
    const hvMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['opened','opened','delivered','clicked','sent']
    const d6 = await insertDeliveries(campHighValue, 'email', contactIds.slice(0, 13), 5, hvMix)
    console.log(`  high-value: ${d6} deliveries`)

    // OTP notifications (running, hourly — insert last 24h)
    const otpContacts = contactIds.filter((_, i) => rawContacts[i]?.cw).slice(0, 20)
    const otpMix: Array<'clicked' | 'opened' | 'delivered' | 'sent' | 'bounced' | 'failed'> = ['delivered','delivered','delivered','sent']
    const d7 = await insertDeliveries(campOTP, 'whatsapp', otpContacts, 0, otpMix)
    console.log(`  otp: ${d7} deliveries`)

    const totalDeliveries = d1 + d2 + d3 + d4 + d5 + d6 + d7
    console.log(`✓ Inserted ${totalDeliveries} total deliveries with events`)

    // ════════════════════════════════════════════════════════════════════════
    // Summary
    // ════════════════════════════════════════════════════════════════════════
    console.log('\n✅ Demo seed complete!')
    console.log(`   Tenant    : ${TENANT_ID}`)
    console.log(`   Contacts  : ${contactIds.length}`)
    console.log(`   Segments  : ${segRows.length}`)
    console.log(`   Templates : ${tplRows.length} (approved×7, pending×1, draft×1, rejected×1)`)
    console.log(`   Campaigns : 10 (completed×2, running×3, scheduled×1, draft×1, paused×1, transactional×1, triggered×1)`)
    console.log(`   Journeys  : 4 (active×2, draft×1, paused×1)`)
    console.log(`   Deliveries: ${totalDeliveries} across 7 campaigns`)

  } catch (err) {
    console.error('Seed failed:', (err as Error).message)
    throw err
  } finally {
    await q.release()
    await AppDataSource.destroy()
  }
}

seed().catch(() => process.exit(1))
