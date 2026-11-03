import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import './App.css'
import Home, { SiteNav, SiteFooter } from './Home'
import { DocsPage, ContactPage, CodeBlock } from './pages'

// ─── Sandbox Page ─────────────────────────────────────────────────────────────

function SandboxPage() {
  const [activeSection, setActiveSection] = useState('credentials')

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-docs-section]')
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) setActiveSection(visible[0].target.getAttribute('data-docs-section') || '')
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const NAV = [
    { id: 'credentials', label: 'Get Credentials' },
    { id: 'baseurl',     label: 'Base URL' },
    { id: 'phones',      label: 'Test Phone Numbers' },
    { id: 'quickstart',  label: 'Quick Start' },
    { id: 'differences', label: 'What\'s Different' },
  ]

  const TEST_PHONES = [
    { msisdn: '255712000001', network: 'Airtel',   outcome: 'COMPLETED', label: 'COMPLETED immediately' },
    { msisdn: '255712000002', network: 'Airtel',   outcome: 'FAILED',    label: 'FAILED — insufficient funds' },
    { msisdn: '255712000003', network: 'Airtel',   outcome: 'FAILED',    label: 'FAILED — declined by user' },
    { msisdn: '255787000001', network: 'HaloPesa', outcome: 'COMPLETED', label: 'COMPLETED immediately' },
    { msisdn: '255787000002', network: 'HaloPesa', outcome: 'FAILED',    label: 'FAILED — timeout' },
  ]

  return (
    <div className="docs2-page">
      <div className="docs2-hero docs2-hero--sandbox">
        <div className="docs2-hero__grid" aria-hidden="true" />
        <div className="container">
          <div className="docs2-hero__inner">
            <div className="docs2-hero__eyebrow">Test environment</div>
            <h1 className="docs2-hero__title">Sandbox</h1>
            <p className="docs2-hero__sub">
              Test your integration without moving real money.
              Payments complete instantly, webhooks fire, no USSD push goes to real phones.
            </p>
            <div className="docs2-hero__pills">
              <span className="docs2-pill docs2-pill--amber">Sandbox</span>
              <span className="docs2-pill docs2-pill--dim">No real charges</span>
              <span className="docs2-pill docs2-pill--dim">Instant completion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container docs2-layout">
        <aside className="docs2-sidebar">
          <nav className="docs2-nav">
            <div className="docs2-nav__label">On this page</div>
            {NAV.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`docs2-nav__item${activeSection === item.id ? ' docs2-nav__item--active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="docs2-sidebar__sep" />
          <div className="docs2-sidebar__links">
            <div className="docs2-nav__label">Resources</div>
            <Link to="/docs" className="docs2-sidebar__link">API Docs ↗</Link>
            <a href="https://portal.wisopay.io" className="docs2-sidebar__link">Merchant Portal ↗</a>
          </div>
        </aside>

        <main className="docs2-content">

          <section id="credentials" data-docs-section="credentials" className="docs2-section">
            <div className="docs2-section__eyebrow">Setup</div>
            <h2 className="docs2-section__title">Get Sandbox Credentials</h2>
            <p className="docs2-section__lead">
              Create a free merchant account and switch to <strong>Sandbox mode</strong> in the portal.
              Your sandbox API key will be prefixed with <code className="docs2-inline-code">dpay_test_</code>.
            </p>
            <a href="https://portal.wisopay.io" className="btn btn--primary">
              Open merchant portal <ArrowRight size={15} />
            </a>
          </section>

          <section id="baseurl" data-docs-section="baseurl" className="docs2-section">
            <div className="docs2-section__eyebrow">Endpoint</div>
            <h2 className="docs2-section__title">Base URL</h2>
            <CodeBlock label="url" code={`https://api.wisopay.io/v1`} />
            <p className="docs2-section__note">
              Sandbox uses the same base URL as live — your API key prefix (<code className="docs2-inline-code">dpay_test_…</code> vs <code className="docs2-inline-code">dpay_live_…</code>) determines which environment your requests hit.
            </p>
          </section>

          <section id="phones" data-docs-section="phones" className="docs2-section">
            <div className="docs2-section__eyebrow">Test data</div>
            <h2 className="docs2-section__title">Test Phone Numbers</h2>
            <p className="docs2-section__lead">
              Use these MSISDN values to trigger specific outcomes in sandbox:
            </p>
            <div className="docs2-table-wrap">
              <table className="docs2-table">
                <thead>
                  <tr>
                    <th>MSISDN</th>
                    <th>Network</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {TEST_PHONES.map(r => (
                    <tr key={r.msisdn}>
                      <td><code className="docs2-inline-code">{r.msisdn}</code></td>
                      <td>{r.network}</td>
                      <td>
                        <span className={`docs2-http ${r.outcome === 'COMPLETED' ? 'docs2-http--ok' : 'docs2-http--err'}`}>
                          {r.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="quickstart" data-docs-section="quickstart" className="docs2-section">
            <div className="docs2-section__eyebrow">Try it now</div>
            <h2 className="docs2-section__title">Quick Start</h2>
            <p className="docs2-section__lead">Run this curl command with your sandbox key to trigger an instant payment:</p>
            <CodeBlock
              label="shell"
              code={`curl -X POST https://api.wisopay.io/v1/payments \\
  -H "Authorization: Bearer YOUR_SANDBOX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_minor": 10000,
    "currency": "TZS",
    "payer": { "msisdn": "255712000001" },
    "merchant_reference": "test-001"
  }'`}
            />
            <div className="docs2-callout docs2-callout--tip">
              Use MSISDN <code className="docs2-inline-code">255712000001</code> — it resolves to COMPLETED instantly.
            </div>
          </section>

          <section id="differences" data-docs-section="differences" className="docs2-section docs2-section--last">
            <div className="docs2-section__eyebrow">Behaviour</div>
            <h2 className="docs2-section__title">What's Different in Sandbox</h2>
            <div className="docs2-checklist">
              {[
                { text: 'Payments transition to COMPLETED or FAILED in under 2 seconds' },
                { text: 'No real USSD push is sent to the payer phone' },
                { text: 'Webhooks fire to your callback_url exactly as in live' },
                { text: 'API keys are prefixed with dpay_test_' },
                { text: 'All data is isolated — sandbox payments never appear in live reports' },
              ].map(item => (
                <div key={item.text} className="docs2-checklist__item">
                  <CheckCircle2 size={15} className="docs2-checklist__icon" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="docs2-cta-row">
              <span className="docs2-cta-row__label">Ready to go live?</span>
              <Link to="/docs" className="btn btn--outline-dark">Read the full API docs <ExternalLink size={14} /></Link>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

function FaqRedirect() {
  useEffect(() => {
    // Give ContactPage a tick to render, then scroll to FAQ
    const t = setTimeout(() => {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
    return () => clearTimeout(t)
  }, [])
  return <ContactPage />
}

// ─── Cookie Banner ───────────────────────────────────────────────────────────

function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('cookie_consent')) setVisible(true)
    } catch { setVisible(true) }
  }, [])

  function accept() {
    try { localStorage.setItem('cookie_consent', 'accepted') } catch {}
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem('cookie_consent', 'declined') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <strong>We use cookies</strong>
          <span> to improve your experience and analyse site traffic. See our <Link to="/contact" className="cookie-banner__link">Privacy Policy</Link> for details.</span>
        </div>
        <div className="cookie-banner__actions">
          <button className="cookie-banner__decline" onClick={decline}>Decline</button>
          <button className="cookie-banner__accept" onClick={accept}>Accept all</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return (
    <>
      <SiteNav />
      <div key={pathname} className="w-route">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqRedirect />} />
      </Routes>
      </div>
      <SiteFooter />
      <CookieBanner />
    </>
  )
}
