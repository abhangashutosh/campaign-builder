'use client'
import { useState } from 'react'
import { Mail, MessageSquare, Zap, Key, Shield, Globe, Users, type LucideIcon } from 'lucide-react'

type SectionKey = 'email' | 'whatsapp' | 'webhooks' | 'apikeys' | 'compliance' | 'tenant' | 'roles'

const NAV_ITEMS: { key: SectionKey; label: string; Icon: LucideIcon }[] = [
  { key: 'email',      label: 'Email providers',      Icon: Mail },
  { key: 'whatsapp',   label: 'WhatsApp providers',   Icon: MessageSquare },
  { key: 'webhooks',   label: 'Webhooks & events',    Icon: Zap },
  { key: 'apikeys',    label: 'API keys',             Icon: Key },
  { key: 'compliance', label: 'Compliance',           Icon: Shield },
  { key: 'tenant',     label: 'Tenant & branding',    Icon: Globe },
  { key: 'roles',      label: 'Roles & permissions',  Icon: Users },
]

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-2)' }}>{label}</div>
      <div style={{ fontSize: 12 }}>Coming soon</div>
    </div>
  )
}

function EmailProvidersSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Email providers</div>
            <div className="card-sub">Configure SMTP / API providers used for Email sends</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn primary">Add provider</button>
          </div>
        </div>
        <div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#1A82E2' }}>SG</div>
            <div className="provider-meta">
              <div className="n">SendGrid · Primary</div>
              <div className="d">us-east-1 · API · daily cap 2M · sending domain configured</div>
            </div>
            <span className="chip running"><span className="d" />Active</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#FF6B35' }}>RS</div>
            <div className="provider-meta">
              <div className="n">Resend · Primary</div>
              <div className="d">API key configured · from: campaigns@yourdomain.com</div>
            </div>
            <span className="chip running"><span className="d" />Active</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#FF6B35' }}>AS</div>
            <div className="provider-meta">
              <div className="n">Amazon SES · Sandbox</div>
              <div className="d">ap-south-1 · connected · unverified domain</div>
            </div>
            <span className="chip draft"><span className="d" />Inactive</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Domain authentication</div>
            <div className="card-sub">SPF · DKIM · DMARC · return-path</div>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Domain</th>
                <th>SPF</th>
                <th>DKIM</th>
                <th>DMARC</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="c-name">yourdomain.com</td>
                <td><span className="chip running"><span className="d" />Pass</span></td>
                <td><span className="chip running"><span className="d" />Pass</span></td>
                <td><span className="chip draft"><span className="d" />Pending</span></td>
                <td><span className="chip scheduled"><span className="d" />Partial</span></td>
                <td><button className="btn sm ghost">Verify</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Compliance & consent</div>
            <div className="card-sub">Global defaults for consent, opt-out, and data residency</div>
          </div>
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Double opt-in for Email</label>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Require confirmation before first marketing send</div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>WhatsApp marketing opt-in</label>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Block templates without explicit opt-in event</div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Unsubscribe link</label>
            <select style={{ width: '100%', fontSize: 12, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
              <option>Auto-inject if missing (recommended)</option>
              <option>Inject always</option>
              <option>Manual only</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Data residency</label>
            <select style={{ width: '100%', fontSize: 12, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
              <option>EU + US (shard by user region)</option>
              <option>EU only</option>
              <option>US only</option>
              <option>India only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsContent() {
  const [active, setActive] = useState<SectionKey>('email')

  return (
    <div style={{ padding: '20px 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Settings</h1>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Channel configuration and domain verification</div>
        </div>
        <button className="btn">View audit log</button>
      </div>

      <div className="settings-grid">
        <aside className="settings-nav">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <a
              key={key}
              className={active === key ? 'active' : ''}
              onClick={() => setActive(key)}
            >
              <Icon size={14} />
              {label}
            </a>
          ))}
        </aside>

        <div>
          {active === 'email' ? <EmailProvidersSection /> : (
            <ComingSoon label={NAV_ITEMS.find(n => n.key === active)?.label ?? active} />
          )}
        </div>
      </div>
    </div>
  )
}
