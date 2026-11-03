import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight,
  CheckCircle2, ExternalLink, Mail, MessageSquare, Building2, Send
} from 'lucide-react'
import './App.css'
import Home, { SiteNav, SiteFooter } from './Home'

// ─── Docs Page ───────────────────────────────────────────────────────────────

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/v1/payments',
    desc: 'Initiate a USSD push payment. Returns immediately with status PROCESSING. Poll the GET endpoint or use webhooks to confirm completion.',
    body: `{
  "amount_minor": 25000,
  "currency": "TZS",
  "payer": { "msisdn": "255712345678" },
  "merchant_reference": "order_001",
  "callback_url": "https://yoursite.com/webhooks"
}`,
    response: `{
  "id": "pay_abc123",
  "status": "PROCESSING",
  "amount_minor": 25000,
  "currency": "TZS",
  "created_at": "2024-01-15T10:30:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/v1/payments/:id',
    desc: 'Retrieve a single payment by ID. Poll this endpoint to check status after creation.',
    body: null,
    response: `{
  "id": "pay_abc123",
  "status": "COMPLETED",
  "amount_minor": 25000,
  "currency": "TZS",
  "merchant_reference": "order_001",
  "completed_at": "2024-01-15T10:32:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/v1/payments',
    desc: 'List all payments for the current environment. Supports limit and offset for pagination.',
    body: null,
    response: `{
  "object": "list",
  "data": [ /* payment objects */ ],
  "has_more": false,
  "next_cursor": null
}`,
  },
  {
    method: 'POST',
    path: '/v1/payment-links',
    desc: 'Create a shareable payment link. The customer opens the URL and pays on any mobile money network.',
    body: `{
  "amount_minor": 50000,
  "currency": "TZS",
  "label": "Invoice #1042",
  "expires_in": 3600
}`,
    response: `{
  "id": "lnk_xyz789",
  "url": "https://wisopay.io/pay/lnk_xyz789",
  "expires_at": "2024-01-15T11:00:00Z"
}`,
  },
]

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: '#D1FAE5', text: '#059669' },
  POST:   { bg: '#DBEAFE', text: '#1D4ED8' },
  PUT:    { bg: '#FEF3C7', text: '#D97706' },
  DELETE: { bg: '#FEE2E2', text: '#DC2626' },
}

function DocCodeBlock({
  label,
  code,
  copyKey,
  copied,
  onCopy,
}: {
  label: string
  code: string
  copyKey: string
  copied: string | null
  onCopy: (text: string, key: string) => void
}) {
  return (
    <div className="docs2-codeblock">
      <div className="docs2-codeblock__bar">
        <span className="docs2-codeblock__lang">{label}</span>
        <button className="docs2-codeblock__copy" onClick={() => onCopy(code, copyKey)}>
          {copied === copyKey ? <><CheckCircle2 size={11} />&nbsp;Copied</> : 'Copy'}
        </button>
      </div>
      <pre className="docs2-codeblock__pre"><code>{code}</code></pre>
    </div>
  )
}

function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('quickstart')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

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
    { id: 'quickstart', label: 'Quick Start' },
    { id: 'auth',       label: 'Authentication' },
    { id: 'baseurl',    label: 'Base URL' },
    { id: 'idempotency',label: 'Idempotency' },
    { id: 'endpoints',  label: 'Endpoints' },
    { id: 'webhooks',   label: 'Webhooks' },
    { id: 'statuses',   label: 'Payment Statuses' },
    { id: 'errors',     label: 'Error Codes' },
  ]

  return (
    <div className="docs2-page">
      <div className="docs2-hero">
        <div className="docs2-hero__grid" aria-hidden="true" />
        <div className="container">
          <div className="docs2-hero__inner">
            <div className="docs2-hero__eyebrow">API Reference · v1</div>
            <h1 className="docs2-hero__title">Documentation</h1>
            <p className="docs2-hero__sub">
              Everything you need to integrate WisoPay.
              Bearer token auth, JSON in, JSON out.
            </p>
            <div className="docs2-hero__pills">
              <span className="docs2-pill docs2-pill--green">REST</span>
              <span className="docs2-pill docs2-pill--dim">JSON</span>
              <span className="docs2-pill docs2-pill--dim">HTTPS</span>
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
            <Link to="/sandbox" className="docs2-sidebar__link">Sandbox ↗</Link>
            <a href="https://portal.wisopay.io" className="docs2-sidebar__link">Merchant Portal ↗</a>
          </div>
        </aside>

        <main className="docs2-content">

          <section id="quickstart" data-docs-section="quickstart" className="docs2-section">
            <div className="docs2-section__eyebrow">Start here</div>
            <h2 className="docs2-section__title">Quick Start</h2>
            <p className="docs2-section__lead">
              Get an API key from the <a href="https://portal.wisopay.io" className="docs2-link">merchant portal</a> and
              trigger a USSD push in under 60 seconds.
            </p>
            <DocCodeBlock label="shell" copyKey="qs" copied={copied} onCopy={copy} code={`curl -X POST https://api.wisopay.io/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order_001" \\
  -d '{
    "amount_minor": 25000,
    "currency": "TZS",
    "payer": { "msisdn": "255712345678" },
    "merchant_reference": "order_001",
    "callback_url": "https://yoursite.com/webhooks"
  }'`} />
            <div className="docs2-callout docs2-callout--tip">
              <strong>Testing?</strong> Switch to <Link to="/sandbox" className="docs2-link">Sandbox mode</Link> — payments complete instantly with no real USSD push.
            </div>
          </section>

          <section id="auth" data-docs-section="auth" className="docs2-section">
            <div className="docs2-section__eyebrow">Security</div>
            <h2 className="docs2-section__title">Authentication</h2>
            <p className="docs2-section__lead">
              Every request requires your API key as a Bearer token in the{' '}
              <code className="docs2-inline-code">Authorization</code> header.
              Keys are environment-scoped — sandbox keys only hit sandbox, live keys only hit live.
            </p>
            <DocCodeBlock label="http" copyKey="auth" copied={copied} onCopy={copy} code={`Authorization: Bearer YOUR_API_KEY`} />
            <div className="docs2-callout docs2-callout--warn">
              Never expose your API key client-side or commit it to version control.
            </div>
          </section>

          <section id="baseurl" data-docs-section="baseurl" className="docs2-section">
            <div className="docs2-section__eyebrow">Endpoint</div>
            <h2 className="docs2-section__title">Base URL</h2>
            <p className="docs2-section__lead">All requests go to the same base URL. Your API key determines which environment is used.</p>
            <DocCodeBlock label="url" copyKey="url" copied={copied} onCopy={copy} code={`https://api.wisopay.io/v1`} />
            <div className="docs2-env-rows">
              <div className="docs2-env-row">
                <span className="docs2-pill docs2-pill--green">Live</span>
                <code className="docs2-inline-code">dpay_live_…</code>
                <span className="docs2-env-desc">Real payments. Funds move.</span>
              </div>
              <div className="docs2-env-row">
                <span className="docs2-pill docs2-pill--amber">Sandbox</span>
                <code className="docs2-inline-code">dpay_test_…</code>
                <span className="docs2-env-desc">Simulated payments, no real charges.</span>
              </div>
            </div>
          </section>

          <section id="idempotency" data-docs-section="idempotency" className="docs2-section">
            <div className="docs2-section__eyebrow">Reliability</div>
            <h2 className="docs2-section__title">Idempotency</h2>
            <p className="docs2-section__lead">
              Send an <code className="docs2-inline-code">Idempotency-Key</code> header on every{' '}
              <code className="docs2-inline-code">POST</code> request.
              If the same key is reused, WisoPay returns the original response instead of creating a duplicate payment.
            </p>
            <DocCodeBlock label="http" copyKey="idempotency" copied={copied} onCopy={copy} code={`Idempotency-Key: your_unique_key_here`} />
            <p className="docs2-section__note">
              Use a UUID or your own <code className="docs2-inline-code">merchant_reference</code>. Keys are scoped to your environment and expire after 24 hours.
            </p>
          </section>

          <section id="endpoints" data-docs-section="endpoints" className="docs2-section">
            <div className="docs2-section__eyebrow">API Reference</div>
            <h2 className="docs2-section__title">Endpoints</h2>
            <div className="docs2-endpoints">
              {ENDPOINTS.map(ep => {
                const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.POST
                return (
                  <div key={ep.path} className="docs2-endpoint">
                    <div className="docs2-endpoint__head">
                      <span className="docs2-method" style={{ background: mc.bg, color: mc.text }}>{ep.method}</span>
                      <code className="docs2-path">{ep.path}</code>
                    </div>
                    <p className="docs2-endpoint__desc">{ep.desc}</p>
                    <div className={`docs2-endpoint__cols${ep.body ? '' : ' docs2-endpoint__cols--single'}`}>
                      {ep.body && (
                        <DocCodeBlock label="request body" copyKey={ep.path + 'req'} copied={copied} onCopy={copy} code={ep.body} />
                      )}
                      <DocCodeBlock label="response" copyKey={ep.path + 'res'} copied={copied} onCopy={copy} code={ep.response} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section id="webhooks" data-docs-section="webhooks" className="docs2-section">
            <div className="docs2-section__eyebrow">Events</div>
            <h2 className="docs2-section__title">Webhooks</h2>
            <p className="docs2-section__lead">
              WisoPay sends a <code className="docs2-inline-code">POST</code> to your{' '}
              <code className="docs2-inline-code">callback_url</code> when a payment status changes.
              Respond with HTTP&nbsp;200 to acknowledge.
            </p>
            <DocCodeBlock label="json" copyKey="webhook" copied={copied} onCopy={copy} code={`{
  "event": "payment.completed",
  "payment": {
    "id": "pay_abc123",
    "status": "COMPLETED",
    "amount_minor": 25000,
    "currency": "TZS",
    "merchant_reference": "order_001"
  }
}`} />
            <div className="docs2-callout docs2-callout--tip">
              Webhooks are retried up to 3 times with exponential backoff if your endpoint doesn't return HTTP 200.
            </div>
          </section>

          <section id="statuses" data-docs-section="statuses" className="docs2-section">
            <div className="docs2-section__eyebrow">Payment lifecycle</div>
            <h2 className="docs2-section__title">Payment Statuses</h2>
            <div className="docs2-statuses">
              {[
                { s: 'PROCESSING', color: 'blue',  d: 'USSD push sent, awaiting customer approval.' },
                { s: 'COMPLETED',  color: 'green', d: 'Customer approved and funds collected.' },
                { s: 'FAILED',     color: 'red',   d: 'Customer declined, timed out, or insufficient funds.' },
                { s: 'CANCELLED',  color: 'grey',  d: 'Payment was cancelled programmatically.' },
              ].map(({ s, color, d }) => (
                <div key={s} className="docs2-status">
                  <span className={`docs2-status__badge docs2-status__badge--${color}`}>{s}</span>
                  <span className="docs2-status__desc">{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="errors" data-docs-section="errors" className="docs2-section docs2-section--last">
            <div className="docs2-section__eyebrow">Troubleshooting</div>
            <h2 className="docs2-section__title">Error Codes</h2>
            <p className="docs2-section__lead">
              All errors return JSON with an <code className="docs2-inline-code">error_code</code> and a human-readable{' '}
              <code className="docs2-inline-code">message</code>.
            </p>
            <div className="docs2-table-wrap">
              <table className="docs2-table">
                <thead>
                  <tr>
                    <th>HTTP</th>
                    <th>error_code</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { http: 400, code: 'validation_error',      desc: 'A required field is missing or has an invalid value.' },
                    { http: 401, code: 'authentication_error',  desc: 'Invalid or missing API key.' },
                    { http: 403, code: 'authorization_error',   desc: 'API key valid but the environment is inactive or revoked.' },
                    { http: 404, code: 'not_found_error',       desc: 'The requested resource does not exist.' },
                    { http: 409, code: 'idempotency_conflict',  desc: 'Different request body sent with an existing idempotency key.' },
                    { http: 422, code: 'payment_error',         desc: 'Payment was rejected by the mobile network.' },
                    { http: 500, code: 'internal_error',        desc: 'Unexpected server error. Contact support if it persists.' },
                  ].map(r => (
                    <tr key={r.code}>
                      <td>
                        <span className={`docs2-http docs2-http--${r.http >= 500 ? 'err' : r.http >= 400 ? 'warn' : 'ok'}`}>{r.http}</span>
                      </td>
                      <td><code className="docs2-inline-code">{r.code}</code></td>
                      <td className="docs2-table__desc">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}

// ─── Sandbox Page ─────────────────────────────────────────────────────────────

function SandboxPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('credentials')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

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
            <DocCodeBlock label="url" copyKey="url" copied={copied} onCopy={copy} code={`https://api.wisopay.io/v1`} />
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
            <DocCodeBlock
              label="shell"
              copyKey="curl"
              copied={copied}
              onCopy={copy}
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

// ─── FAQ hook ────────────────────────────────────────────────────────────────

function useFaq() {
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([])
  useEffect(() => {
    fetch('https://api.wisopay.io/pay/faq')
      .then(r => r.ok ? r.json() : { faq: [] })
      .then(d => { if (Array.isArray(d.faq) && d.faq.length) setFaq(d.faq) })
      .catch(() => {})
  }, [])
  return faq
}

// ─── Contact Page ────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: 'sales',        label: 'Sales & pricing' },
  { value: 'technical',    label: 'Technical support' },
  { value: 'integration',  label: 'Integration help' },
  { value: 'partnership',  label: 'Partnership' },
  { value: 'general',      label: 'General inquiry' },
]

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: 'general', message: '' })
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const faq = useFaq()

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const subjectLabel = SUBJECTS.find(s => s.value === form.subject)?.label || form.subject
    const mailSubject  = encodeURIComponent(`[Wisopay] ${subjectLabel} — ${form.name}`)
    const mailBody     = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}${form.company ? `\nCompany: ${form.company}` : ''}\nTopic: ${subjectLabel}\n\n${form.message}`
    )
    window.location.href = `mailto:support@wisopay.io?subject=${mailSubject}&body=${mailBody}`
    setSent(true)
  }

  function field(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  return (
    <div className="docs-page">
      <div className="docs-hero docs-hero--contact">
        <div className="container">
          <div className="docs-hero__inner">
            <span className="badge badge--green"><span className="badge__dot" />Get in touch</span>
            <h1 className="docs-hero__title">Contact us</h1>
            <p className="docs-hero__sub">
              Have a question about integrating Wisopay, pricing, or partnerships?
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="container contact-body">
        <div className="contact-layout">

          {/* Left — channels */}
          <aside className="contact-channels">
            <h2 className="contact-channels__title">Other ways to reach us</h2>

            <div className="contact-channel">
              <div className="contact-channel__icon contact-channel__icon--emerald">
                <Mail size={18} />
              </div>
              <div>
                <p className="contact-channel__label">Email</p>
                <a href="mailto:support@wisopay.io" className="contact-channel__value">support@wisopay.io</a>
              </div>
            </div>

            <div className="contact-channel">
              <div className="contact-channel__icon contact-channel__icon--blue">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="contact-channel__label">Sales</p>
                <a href="mailto:sales@wisopay.io" className="contact-channel__value">sales@wisopay.io</a>
              </div>
            </div>

            <div className="contact-channel">
              <div className="contact-channel__icon contact-channel__icon--violet">
                <Building2 size={18} />
              </div>
              <div>
                <p className="contact-channel__label">Partnerships</p>
                <a href="mailto:partners@wisopay.io" className="contact-channel__value">partners@wisopay.io</a>
              </div>
            </div>

            {faq.length > 0 && (
              <div className="contact-faq" id="faq">
                <p className="contact-faq__head">Frequently asked questions</p>
                <div className="contact-faq__list">
                  {faq.map((item, i) => {
                    const key = `faq-${i}`
                    const isOpen = openFaq === key
                    return (
                      <div key={key} className={`contact-faq__item ${isOpen ? 'contact-faq__item--open' : ''}`}>
                        <button className="contact-faq__q" onClick={() => setOpenFaq(isOpen ? null : key)}>
                          <span>{item.q}</span>
                          <ChevronRight size={14} className="contact-faq__chevron" />
                        </button>
                        {isOpen && <p className="contact-faq__a">{item.a}</p>}
                      </div>
                    )
                  })}
                </div>
                <div className="contact-faq__links" style={{ marginTop: '16px' }}>
                  <Link to="/docs" className="btn btn--outline-dark btn--sm">API docs</Link>
                  <Link to="/sandbox" className="btn btn--outline-dark btn--sm">Sandbox</Link>
                </div>
              </div>
            )}
            {faq.length === 0 && (
              <div className="contact-faq">
                <p className="contact-faq__head">Looking for docs?</p>
                <p className="contact-faq__sub">Check out the API reference and sandbox for technical questions.</p>
                <div className="contact-faq__links">
                  <Link to="/docs" className="btn btn--outline-dark btn--sm">API docs</Link>
                  <Link to="/sandbox" className="btn btn--outline-dark btn--sm">Sandbox</Link>
                </div>
              </div>
            )}
          </aside>

          {/* Right — form */}
          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success__icon">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="contact-success__title">Message composed!</h3>
                <p className="contact-success__sub">
                  Your mail client opened with the message pre-filled. We'll get back to you within one business day.
                </p>
                <button className="btn btn--outline-dark btn--sm" onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', subject: 'general', message: '' }) }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label className="contact-form__label" htmlFor="cf-name">Full name <span className="contact-form__req">*</span></label>
                    <input
                      id="cf-name"
                      className={`contact-form__input ${errors.name ? 'contact-form__input--err' : ''}`}
                      type="text"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={e => field('name', e.target.value)}
                    />
                    {errors.name && <span className="contact-form__error">{errors.name}</span>}
                  </div>
                  <div className="contact-form__field">
                    <label className="contact-form__label" htmlFor="cf-email">Email <span className="contact-form__req">*</span></label>
                    <input
                      id="cf-email"
                      className={`contact-form__input ${errors.email ? 'contact-form__input--err' : ''}`}
                      type="email"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={e => field('email', e.target.value)}
                    />
                    {errors.email && <span className="contact-form__error">{errors.email}</span>}
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label className="contact-form__label" htmlFor="cf-company">Company <span className="contact-form__opt">(optional)</span></label>
                    <input
                      id="cf-company"
                      className="contact-form__input"
                      type="text"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={e => field('company', e.target.value)}
                    />
                  </div>
                  <div className="contact-form__field">
                    <label className="contact-form__label" htmlFor="cf-subject">Topic</label>
                    <select
                      id="cf-subject"
                      className="contact-form__input contact-form__select"
                      value={form.subject}
                      onChange={e => field('subject', e.target.value)}
                    >
                      {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="cf-message">Message <span className="contact-form__req">*</span></label>
                  <textarea
                    id="cf-message"
                    className={`contact-form__input contact-form__textarea ${errors.message ? 'contact-form__input--err' : ''}`}
                    placeholder="Tell us how we can help…"
                    rows={5}
                    value={form.message}
                    onChange={e => field('message', e.target.value)}
                  />
                  {errors.message && <span className="contact-form__error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn--primary btn--lg contact-form__submit">
                  Send message <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
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
  return (
    <>
      <SiteNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqRedirect />} />
      </Routes>
      <SiteFooter />
      <CookieBanner />
    </>
  )
}
