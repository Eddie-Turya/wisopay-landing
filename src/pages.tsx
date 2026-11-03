import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Mail, MessageSquare, Building2, Send, ChevronDown, ArrowRight, BookOpen, FlaskConical, Lightbulb, AlertTriangle } from 'lucide-react'
import './pages.css'

const PORTAL = 'https://portal.wisopay.io'

// ─── Shared ──────────────────────────────────────────────────────────────────

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-w-reveal], [data-w-stagger]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target) } })
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

export function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* clipboard blocked */ }
  }
  return (
    <div className="p-code">
      <div className="p-code__bar">
        <span>{label}</span>
        <button type="button" onClick={copy} className="p-code__copy" aria-label={`Copy ${label}`}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function Callout({ tone, children }: { tone: 'tip' | 'warn'; children: React.ReactNode }) {
  const Icon = tone === 'tip' ? Lightbulb : AlertTriangle
  return (
    <div className={`p-callout p-callout--${tone}`}>
      <Icon size={17} />
      <div>{children}</div>
    </div>
  )
}

// ─── Docs ────────────────────────────────────────────────────────────────────

const ENDPOINTS = [
  {
    method: 'POST', path: '/v1/payments',
    desc: 'Start a USSD push payment. Returns straight away with status PROCESSING. Use webhooks (or poll the GET endpoint) to confirm completion.',
    body: `{
  "amount_minor": 25000,
  "currency": "TZS",
  "payer": { "msisdn": "255712345678" },
  "merchant_reference": "order_001",
  "callback_url": "https://yoursite.com/webhooks"
}`,
    response: `{
  "id": "TXN-T4K2QZ-7HF2",
  "status": "PROCESSING",
  "amount_minor": 25000,
  "currency": "TZS",
  "created_at": "2026-11-03T10:30:00Z"
}`,
  },
  {
    method: 'GET', path: '/v1/payments/:id',
    desc: 'Retrieve a single payment by ID. Poll this endpoint to check status after creation.',
    body: null,
    response: `{
  "id": "TXN-T4K2QZ-7HF2",
  "status": "COMPLETED",
  "amount_minor": 25000,
  "currency": "TZS",
  "merchant_reference": "order_001",
  "completed_at": "2026-11-03T10:32:00Z"
}`,
  },
  {
    method: 'GET', path: '/v1/payments',
    desc: 'List payments for the current environment. Supports limit and offset for pagination.',
    body: null,
    response: `{
  "object": "list",
  "data": [ /* payment objects */ ],
  "has_more": false,
  "next_cursor": null
}`,
  },
  {
    method: 'POST', path: '/v1/payment-links',
    desc: 'Create a shareable payment link. The customer opens the URL and pays from any mobile money network.',
    body: `{
  "amount_minor": 50000,
  "currency": "TZS",
  "label": "Invoice #1042",
  "expires_in": 3600
}`,
    response: `{
  "id": "lnk_xyz789",
  "url": "https://wisopay.io/pay/lnk_xyz789",
  "expires_at": "2026-11-03T11:00:00Z"
}`,
  },
]

const DOC_NAV = [
  { id: 'quickstart', label: 'Quick start' },
  { id: 'auth', label: 'Authentication' },
  { id: 'baseurl', label: 'Base URL' },
  { id: 'idempotency', label: 'Idempotency' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'statuses', label: 'Payment statuses' },
  { id: 'errors', label: 'Error codes' },
]

const STATUSES = [
  { s: 'PROCESSING', tone: 'info', d: 'USSD push sent, waiting for the customer to approve.' },
  { s: 'COMPLETED', tone: 'ok', d: 'Customer approved and the funds were collected.' },
  { s: 'FAILED', tone: 'err', d: 'Customer declined, timed out, or had insufficient funds.' },
  { s: 'CANCELLED', tone: 'mute', d: 'The payment was cancelled through the API.' },
]

const ERRORS = [
  { http: 400, code: 'validation_error', desc: 'A required field is missing or has an invalid value.' },
  { http: 401, code: 'authentication_error', desc: 'Invalid or missing API key.' },
  { http: 403, code: 'authorization_error', desc: 'The key is valid but the environment is inactive or revoked.' },
  { http: 404, code: 'not_found_error', desc: 'The requested resource does not exist.' },
  { http: 409, code: 'idempotency_conflict', desc: 'A different request body was sent with an existing idempotency key.' },
  { http: 422, code: 'payment_error', desc: 'The mobile network rejected the payment.' },
  { http: 500, code: 'internal_error', desc: 'Unexpected server error. Contact support if it persists.' },
]

export function DocsPage() {
  const [active, setActive] = useState('quickstart')
  useReveal()

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-docs-section]')
    const obs = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length) setActive(visible[0].target.getAttribute('data-docs-section') || '')
    }, { rootMargin: '-15% 0px -70% 0px' })
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const code = (s: string) => <code className="p-inline">{s}</code>

  return (
    <main className="w-page p-page">
      <section className="p-hero">
        <div className="w-wrap p-hero__inner">
          <span className="w-pill w-pill--yellow">API reference · v1</span>
          <h1 className="w-h1">Documentation</h1>
          <p className="p-hero__lead">Everything you need to integrate WisoPay. Bearer token auth, JSON in, JSON out.</p>
          <div className="p-hero__tags"><span>REST</span><span>JSON</span><span>HTTPS</span><span>TZS</span></div>
        </div>
      </section>

      <div className="w-wrap p-docs">
        <aside className="p-docs__side">
          <nav aria-label="On this page">
            <p className="p-docs__label">On this page</p>
            {DOC_NAV.map(n => (
              <a key={n.id} href={`#${n.id}`} className={`p-docs__link ${active === n.id ? 'is-on' : ''}`}>{n.label}</a>
            ))}
          </nav>
          <div className="p-docs__res">
            <p className="p-docs__label">Resources</p>
            <Link to="/sandbox" className="p-docs__res-link"><FlaskConical size={15} /> Sandbox</Link>
            <a href={PORTAL} className="p-docs__res-link"><BookOpen size={15} /> Merchant portal</a>
          </div>
        </aside>

        <div className="p-docs__body">
          <section id="quickstart" data-docs-section="quickstart" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Start here</p>
            <h2>Quick start</h2>
            <p className="p-sec__lead">Get an API key from the <a href={PORTAL} className="p-link">merchant portal</a> and trigger a USSD push in under a minute.</p>
            <CodeBlock label="shell" code={`curl -X POST https://api.wisopay.io/v1/payments \\
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
            <Callout tone="tip"><strong>Testing?</strong> Use a sandbox key and <Link to="/sandbox" className="p-link">sandbox mode</Link>: payments complete instantly with no real USSD push.</Callout>
          </section>

          <section id="auth" data-docs-section="auth" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Security</p>
            <h2>Authentication</h2>
            <p className="p-sec__lead">Every request needs your API key as a Bearer token in the {code('Authorization')} header. Keys are scoped to an environment: sandbox keys only reach sandbox, live keys only reach live.</p>
            <CodeBlock label="http" code="Authorization: Bearer YOUR_API_KEY" />
            <Callout tone="warn">Never expose your API key in client-side code or commit it to version control.</Callout>
          </section>

          <section id="baseurl" data-docs-section="baseurl" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Endpoint</p>
            <h2>Base URL</h2>
            <p className="p-sec__lead">All requests go to the same base URL. Your API key decides which environment is used.</p>
            <CodeBlock label="url" code="https://api.wisopay.io/v1" />
            <div className="p-envs">
              <div className="p-env"><span className="p-badge p-badge--ok">Live</span>{code('dpay_live_…')}<span>Real payments. Funds move.</span></div>
              <div className="p-env"><span className="p-badge p-badge--mute">Sandbox</span>{code('dpay_test_…')}<span>Simulated payments, no real charges.</span></div>
            </div>
          </section>

          <section id="idempotency" data-docs-section="idempotency" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Reliability</p>
            <h2>Idempotency</h2>
            <p className="p-sec__lead">Send an {code('Idempotency-Key')} header on every {code('POST')}. If the same key is reused, WisoPay returns the original response instead of creating a duplicate payment.</p>
            <CodeBlock label="http" code="Idempotency-Key: your_unique_key_here" />
            <p className="p-sec__note">Use a UUID or your own {code('merchant_reference')}. Keys are scoped to your environment and expire after 24 hours.</p>
          </section>

          <section id="endpoints" data-docs-section="endpoints" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">API reference</p>
            <h2>Endpoints</h2>
            <div className="p-endpoints">
              {ENDPOINTS.map(ep => (
                <article key={`${ep.method} ${ep.path}`} className="p-endpoint">
                  <div className="p-endpoint__head">
                    <span className={`p-method p-method--${ep.method.toLowerCase()}`}>{ep.method}</span>
                    <code>{ep.path}</code>
                  </div>
                  <p>{ep.desc}</p>
                  <div className={`p-endpoint__cols ${ep.body ? '' : 'is-single'}`}>
                    {ep.body && <CodeBlock label="request body" code={ep.body} />}
                    <CodeBlock label="response" code={ep.response} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="webhooks" data-docs-section="webhooks" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Events</p>
            <h2>Webhooks</h2>
            <p className="p-sec__lead">WisoPay sends a {code('POST')} to your {code('callback_url')} when a payment's status changes. Reply with HTTP 200 to acknowledge it.</p>
            <CodeBlock label="json" code={`{
  "event": "payment.completed",
  "payment": {
    "id": "TXN-T4K2QZ-7HF2",
    "status": "COMPLETED",
    "amount_minor": 25000,
    "currency": "TZS",
    "merchant_reference": "order_001"
  }
}`} />
            <Callout tone="tip">If your endpoint doesn't return HTTP 200, the webhook is retried with exponential backoff.</Callout>
          </section>

          <section id="statuses" data-docs-section="statuses" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Payment lifecycle</p>
            <h2>Payment statuses</h2>
            <div className="p-statuses">
              {STATUSES.map(st => (
                <div key={st.s} className="p-status">
                  <span className={`p-badge p-badge--${st.tone}`}>{st.s}</span>
                  <span>{st.d}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="errors" data-docs-section="errors" className="p-sec" data-w-reveal>
            <p className="p-sec__eyebrow">Troubleshooting</p>
            <h2>Error codes</h2>
            <p className="p-sec__lead">Every error returns JSON with an {code('error_code')} and a readable {code('message')}.</p>
            <div className="p-table-wrap">
              <table className="p-table">
                <thead><tr><th>HTTP</th><th>error_code</th><th>Meaning</th></tr></thead>
                <tbody>
                  {ERRORS.map(r => (
                    <tr key={r.code}>
                      <td><span className={`p-http ${r.http >= 500 ? 'is-err' : 'is-warn'}`}>{r.http}</span></td>
                      <td>{code(r.code)}</td>
                      <td>{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="p-docs__cta" data-w-reveal>
            <div>
              <h3>Ready to go live?</h3>
              <p>Create an account, test in the sandbox, then switch to your live key.</p>
            </div>
            <a href={`${PORTAL}/signup`} className="w-btn w-btn--lime">Create an account <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function useFaq() {
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([])
  useEffect(() => {
    fetch('https://api.wisopay.io/pay/faq')
      .then(r => (r.ok ? r.json() : { faq: [] }))
      .then(d => { if (Array.isArray(d.faq) && d.faq.length) setFaq(d.faq) })
      .catch(() => {})
  }, [])
  return faq
}

const SUBJECTS = [
  { value: 'sales', label: 'Sales & pricing' },
  { value: 'technical', label: 'Technical support' },
  { value: 'integration', label: 'Integration help' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'general', label: 'General inquiry' },
]

const CHANNELS = [
  { icon: Mail, label: 'Support', value: 'support@wisopay.io', note: 'Integration and account help' },
  { icon: MessageSquare, label: 'Sales', value: 'sales@wisopay.io', note: 'Pricing and high-volume plans' },
  { icon: Building2, label: 'Partnerships', value: 'partners@wisopay.io', note: 'Platforms and resellers' },
]

const EMPTY = { name: '', email: '', company: '', subject: 'general', message: '' }

export function ContactPage() {
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faq = useFaq()
  useReveal()

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const subjectLabel = SUBJECTS.find(s => s.value === form.subject)?.label || form.subject
    const mailSubject = encodeURIComponent(`[Wisopay] ${subjectLabel} — ${form.name}`)
    const mailBody = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}${form.company ? `\nCompany: ${form.company}` : ''}\nTopic: ${subjectLabel}\n\n${form.message}`
    )
    window.location.href = `mailto:support@wisopay.io?subject=${mailSubject}&body=${mailBody}`
    setSent(true)
  }

  function field(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const input = (k: string) => `p-input ${errors[k] ? 'is-err' : ''}`

  return (
    <main className="w-page p-page">
      <section className="p-hero">
        <div className="w-wrap p-hero__inner">
          <span className="w-pill w-pill--yellow">Get in touch</span>
          <h1 className="w-h1">Talk to the WisoPay team.</h1>
          <p className="p-hero__lead">Questions about integrating, pricing or partnerships? Send us a message and we'll reply within one business day.</p>
        </div>
      </section>

      <div className="w-wrap p-contact">
        <div className="p-card p-contact__form" data-w-reveal>
          {sent ? (
            <div className="p-sent">
              <span className="p-sent__icon"><Check size={26} strokeWidth={2.5} /></span>
              <h2>Your email is ready to send</h2>
              <p>Your mail app opened with the message filled in. Send it from there and we'll reply within one business day.</p>
              <button type="button" className="w-btn w-btn--light" onClick={() => { setSent(false); setForm(EMPTY) }}>Write another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="p-form">
              <h2>Send us a message</h2>
              <div className="p-form__row">
                <div className="p-field">
                  <label htmlFor="cf-name">Full name</label>
                  <input id="cf-name" className={input('name')} type="text" autoComplete="name" placeholder="Asha Mwakyusa" value={form.name} onChange={e => field('name', e.target.value)} aria-invalid={!!errors.name} />
                  {errors.name && <span className="p-field__err">{errors.name}</span>}
                </div>
                <div className="p-field">
                  <label htmlFor="cf-email">Email</label>
                  <input id="cf-email" className={input('email')} type="email" autoComplete="email" placeholder="you@business.com" value={form.email} onChange={e => field('email', e.target.value)} aria-invalid={!!errors.email} />
                  {errors.email && <span className="p-field__err">{errors.email}</span>}
                </div>
              </div>
              <div className="p-form__row">
                <div className="p-field">
                  <label htmlFor="cf-company">Company <span className="p-field__opt">optional</span></label>
                  <input id="cf-company" className="p-input" type="text" autoComplete="organization" placeholder="Duka la Mama Ltd" value={form.company} onChange={e => field('company', e.target.value)} />
                </div>
                <div className="p-field">
                  <label htmlFor="cf-subject">Topic</label>
                  <div className="p-select">
                    <select id="cf-subject" className="p-input" value={form.subject} onChange={e => field('subject', e.target.value)}>
                      {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="p-field">
                <label htmlFor="cf-message">Message</label>
                <textarea id="cf-message" className={`${input('message')} p-textarea`} rows={6} placeholder="Tell us how we can help…" value={form.message} onChange={e => field('message', e.target.value)} aria-invalid={!!errors.message} />
                {errors.message && <span className="p-field__err">{errors.message}</span>}
              </div>
              <button type="submit" className="w-btn w-btn--lime w-btn--lg p-form__submit">Send message <Send size={16} /></button>
              <p className="p-form__note">This opens your email app with the message ready to send to support@wisopay.io.</p>
            </form>
          )}
        </div>

        <aside className="p-contact__side">
          <div className="p-channels" data-w-stagger>
            {CHANNELS.map(c => (
              <div key={c.label} className="p-channel">
                <span className="p-channel__icon"><c.icon size={18} /></span>
                <div>
                  <p className="p-channel__label">{c.label}</p>
                  <p className="p-channel__value">{c.value}</p>
                  <p className="p-channel__note">{c.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-card p-faq" id="faq" data-w-reveal>
            <h2>{faq.length ? 'Frequently asked questions' : 'Looking for technical answers?'}</h2>
            {faq.length > 0 ? (
              <div className="p-faq__list">
                {faq.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div key={i} className={`p-faq__item ${open ? 'is-open' : ''}`}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                        <span>{item.q}</span>
                        <ChevronDown size={17} />
                      </button>
                      <div className="p-faq__a"><div><p>{item.a}</p></div></div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="p-faq__sub">The API reference and sandbox cover most integration questions.</p>
            )}
            <div className="p-faq__links">
              <Link to="/docs" className="w-btn w-btn--light w-btn--sm"><BookOpen size={15} /> API docs</Link>
              <Link to="/sandbox" className="w-btn w-btn--light w-btn--sm"><FlaskConical size={15} /> Sandbox</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
