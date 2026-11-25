import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Mail, Phone, MessageSquare, Building2, Send, ChevronDown, ArrowRight, BookOpen, FlaskConical } from 'lucide-react'
import './pages.css'
import { ApiDocs } from './docs/ApiDocs'

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


// ─── Docs ────────────────────────────────────────────────────────────────────

export function DocsPage() {
  useReveal()
  return (
    <main className="w-page p-page">
      <section className="p-hero">
        <div className="w-wrap p-hero__inner">
          <span className="w-pill w-pill--yellow">API reference · v1</span>
          <h1 className="w-h1">Documentation</h1>
          <p className="p-hero__lead">Everything you need to take mobile money payments and refunds with WisoPay. Bearer token auth, JSON in, JSON out.</p>
          <div className="p-hero__tags"><span>REST</span><span>JSON</span><span>HTTPS</span><span>TZS</span></div>
        </div>
      </section>
      <div className="w-wrap p-apidocs">
        <ApiDocs topOffset={88} />
        <div className="p-docs__cta" data-w-reveal>
          <div>
            <h3>Ready to go live?</h3>
            <p>Create an account, test in the sandbox, then switch to your live key.</p>
          </div>
          <a href={`${PORTAL}/signup`} className="w-btn w-btn--lime">Create an account <ArrowRight size={16} /></a>
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
  { icon: Phone, label: 'WhatsApp', value: '+255 744 447 401', note: 'Quick help from the support team' },
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
