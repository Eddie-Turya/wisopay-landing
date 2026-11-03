import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight, Check, Menu, X, Smartphone, Link2, Zap, Bell, ShieldCheck, Code2,
  LayoutDashboard, ArrowLeftRight, Wallet, BarChart3, Users, KeyRound, Webhook,
  Split, Calendar, Copy,
} from 'lucide-react'
import mpesa from './assets/mpesa.png'
import airtel from './assets/airtel.png'
import yas from './assets/yas.png'
import halopesa from './assets/halopesa.png'
import './home.css'

const PORTAL = 'https://portal.wisopay.io'

const NETWORKS = [
  { name: 'M-Pesa', by: 'Vodacom', logo: mpesa },
  { name: 'Airtel Money', by: 'Airtel', logo: airtel },
  { name: 'Mixx by Yas', by: 'Yas', logo: yas },
  { name: 'HaloPesa', by: 'Halotel', logo: halopesa },
]

function CountUp({ to, prefix = '', duration = 1400 }: { to: number; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(to); return }
    let raf = 0
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => { obs.disconnect(); cancelAnimationFrame(raf) }
  }, [to, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-US')}</span>
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const home = pathname === '/'
  const anchor = (id: string) => (home ? `#${id}` : `/#${id}`)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const links = [
    { label: 'Products', href: anchor('products') },
    { label: 'Payment methods', href: anchor('methods') },
    { label: 'How it works', href: anchor('how') },
    { label: 'Pricing', href: anchor('pricing') },
    { label: 'Developers', href: anchor('developers') },
  ]

  return (
    <header className={`w-nav ${scrolled || !home ? 'w-nav--scrolled' : ''}`}>
      <div className="w-nav__bar">
        <Link to="/" className="w-logo" aria-label="WisoPay home">
          <img src="/logo.png" alt="" />
          <span>wisopay</span>
        </Link>
        <nav className="w-nav__links">
          {links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
          <Link to="/docs">Docs</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="w-nav__actions">
          <a href={PORTAL} className="w-nav__login">Log in</a>
          <a href={PORTAL} className="w-btn w-btn--dark w-btn--sm">Create an account</a>
          <button className="w-nav__burger" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="w-nav__sheet">
          {links.map(l => <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
          <Link to="/docs">Docs</Link>
          <Link to="/sandbox">Sandbox</Link>
          <Link to="/contact">Contact</Link>
          <div className="w-nav__sheet-cta">
            <a href={PORTAL} className="w-btn w-btn--light">Log in</a>
            <a href={PORTAL} className="w-btn w-btn--dark">Create an account</a>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

const FLOATERS: { style: React.CSSProperties; logo?: string; icon?: typeof Zap; tone?: string }[] = [
  { style: { top: '13%', left: '26%' }, icon: Smartphone, tone: 'dark' },
  { style: { top: '11%', right: '25%' }, logo: mpesa },
  { style: { top: '31%', right: '11%' }, icon: Zap, tone: 'lime' },
  { style: { top: '38%', left: '9%' }, logo: airtel },
  { style: { top: '56%', left: '22%' }, icon: Bell, tone: 'yellow' },
  { style: { top: '60%', right: '17%' }, logo: yas },
  { style: { top: '74%', left: '13%' }, icon: ShieldCheck, tone: 'violet' },
  { style: { top: '76%', right: '30%' }, logo: halopesa },
]

function Hero() {
  return (
    <section className="w-hero">
      <div className="w-hero__swirl" aria-hidden="true" />
      <div className="w-hero__floaters" aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <span key={i} className={`w-float w-float--${f.tone ?? 'logo'}`} style={{ ...f.style, animationDelay: `${0.45 + i * 0.09}s, ${1.2 + i * 0.7}s` }}>
            {f.logo ? <img src={f.logo} alt="" /> : f.icon ? <f.icon size={16} /> : null}
          </span>
        ))}
      </div>

      <div className="w-wrap w-hero__copy">
        <span className="w-pill w-pill--yellow">Mobile money payments in Tanzania</span>
        <h1 className="w-h1">Get paid by every<br />mobile wallet in Tanzania.</h1>
        <p className="w-hero__sub">
          M-Pesa, Airtel Money, Mixx by Yas or HaloPesa: WisoPay sends a USSD prompt to
          your customer's phone, collects the payment and settles it to your account.
        </p>
        <div className="w-hero__cta">
          <a href={PORTAL} className="w-btn w-btn--dark w-btn--lg">Create an account</a>
          <a href="#methods" className="w-btn w-btn--light w-btn--lg">See payment methods</a>
        </div>
      </div>

      <div className="w-wrap">
        <DashboardMock />
      </div>
    </section>
  )
}

const CHART = [6, 4, 5, 4, 9, 5, 4, 22, 6, 5, 34, 7, 5, 4, 26, 6, 18, 5, 4, 30, 6, 12, 8, 5, 24, 7, 38, 14, 46]

function DashboardMock() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.75)))
      el.style.setProperty('--tilt', `${(1 - p) * 16}deg`)
      el.style.setProperty('--sc', `${0.93 + p * 0.07}`)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  const w = 760, h = 190, max = 50
  const step = w / (CHART.length - 1)
  const pts = CHART.map((v, i) => [i * step, h - (v / max) * h] as const)
  const line = pts.map(([x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    return `C${cx},${py} ${cx},${y} ${x},${y}`
  }).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  const nav = [
    { group: 'Overview', items: [{ i: LayoutDashboard, t: 'Overview', active: true }, { i: Wallet, t: 'Balance' }, { i: ArrowLeftRight, t: 'Transactions' }, { i: BarChart3, t: 'Reports' }] },
    { group: 'Collect', items: [{ i: Smartphone, t: 'USSD push' }, { i: Link2, t: 'Payment links' }, { i: Users, t: 'Customers' }] },
    { group: 'Developers', items: [{ i: KeyRound, t: 'API keys' }, { i: Webhook, t: 'Webhooks' }] },
  ]

  return (
    <div ref={ref} className="w-dash" data-w-watch role="img" aria-label="Preview of the WisoPay merchant portal">
      <aside className="w-dash__side">
        <div className="w-dash__brand">
          <img src="/logo.png" alt="" />
          <div><strong>wisopay</strong><small>Merchant portal</small></div>
        </div>
        <div className="w-dash__shop"><span>D</span><div><strong>Duka la Mama</strong><small>Live account</small></div></div>
        {nav.map(g => (
          <div key={g.group} className="w-dash__group">
            <small>{g.group}</small>
            {g.items.map(it => (
              <div key={it.t} className={`w-dash__item ${'active' in it && it.active ? 'is-active' : ''}`}>
                <it.i size={14} /> {it.t}
              </div>
            ))}
          </div>
        ))}
      </aside>
      <div className="w-dash__main">
        <div className="w-dash__crumb">wisopay <span>›</span> Overview</div>
        <div className="w-dash__head">
          <div><h4>Overview</h4><p>Welcome back, Duka la Mama</p></div>
          <span className="w-dash__btn"><Calendar size={13} /> Last 30 days</span>
        </div>
        <div className="w-dash__panel">
          <div className="w-dash__panel-top">
            <strong>Payments</strong>
            <div className="w-dash__tabs">
              <span className="is-on">All</span><span>Completed</span><span>Failed</span>
            </div>
            <div className="w-dash__tabs">
              <span>7d</span><span className="is-on">30d</span><span>90d</span>
            </div>
          </div>
          <div className="w-dash__metrics">
            <div><small>Transactions</small><b><CountUp to={148} /></b></div>
            <div><small>Volume</small><b><CountUp to={3835000} prefix="TZS " /></b><em>after 2% fee: <CountUp to={3758300} prefix="TZS " /></em></div>
            <div><small>Networks</small><span className="w-dash__nets">{NETWORKS.map(n => <img key={n.name} src={n.logo} alt="" />)}</span></div>
          </div>
          <svg className="w-dash__chart" viewBox={`0 0 ${w} ${h + 24}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#0eb981" stopOpacity=".35" />
                <stop offset="1" stopColor="#0eb981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="w-dash__grid" />)}
            <path d={area} fill="url(#wfill)" className="w-dash__area" />
            <path d={line} className="w-dash__line" pathLength={1} />
          </svg>
          <div className="w-dash__axis">
            {['4 Oct', '9 Oct', '14 Oct', '19 Oct', '24 Oct', '29 Oct', '3 Nov'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

function Overview() {
  return (
    <section className="w-sec w-sec--mist" id="products">
      <div className="w-wrap">
        <div className="w-head" data-w-reveal>
          <h2 className="w-h2">Four networks, one account.</h2>
          <p className="w-lead">
            One WisoPay account and your customers pay with the wallet already on their phone.
            Every payment lands in a single balance, and settlements go to your account in TZS.
          </p>
        </div>

        <div className="w-glowcard" data-w-reveal>
          <div className="w-glowcard__glow" aria-hidden="true" />
          <div className="w-glowcard__left">
            <p>Your customer gets a PIN prompt on their phone. No app, no card, no internet needed.</p>
            <a href={PORTAL} className="w-btn w-btn--white">Create an account</a>
          </div>
          <ul className="w-ticks w-ticks--light" data-w-stagger>
            <li>M-Pesa, Airtel Money, Mixx by Yas and HaloPesa.</li>
            <li>Collect through the API, a payment link or a USSD push from the portal.</li>
            <li>Signed webhooks the moment a payment completes.</li>
            <li>Settlement to your merchant wallet, tracked in the portal.</li>
          </ul>
        </div>

        <div className="w-duo" data-w-stagger>
          <article className="w-tile">
            <div className="w-tile__art w-tile__art--dark">
              <div className="w-stat">
                <b><CountUp to={4} duration={900} /></b>
                <span>mobile money networks<br />in Tanzania</span>
              </div>
              <div className="w-ring" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" className="w-ring__track" />
                  <circle cx="60" cy="60" r="50" className="w-ring__val" pathLength="100" strokeDasharray="2 98" />
                </svg>
                <span><b>2</b><small>%</small><em>per payment</em></span>
              </div>
            </div>
            <h3>Mobile money, every network</h3>
            <p>M-Pesa, Airtel Money, Mixx by Yas, HaloPesa: your customers pay with what they already carry.</p>
          </article>

          <article className="w-tile">
            <div className="w-tile__art w-tile__art--lime">
              <div className="w-mini">
                <div className="w-mini__head"><img src="/logo.png" alt="" /><div><strong>Your WisoPay portal</strong><small>Real-time dashboard</small></div></div>
                <div className="w-mini__row"><Check size={14} /> 12 payments today</div>
                <div className="w-mini__row"><Check size={14} /> TZS 412,000 collected</div>
                <div className="w-mini__row"><Check size={14} /> Webhooks delivered</div>
              </div>
            </div>
            <h3>Everything in one portal</h3>
            <p>Transactions, balance, API keys, payment links and USSD push, all from one dashboard.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

// ─── How it works ────────────────────────────────────────────────────────────

const STEPS = [
  { t: 'Create your account', d: 'Sign up in minutes and get sandbox keys straight away. Go live once your business documents are verified.' },
  { t: 'Choose how you collect', d: 'Call the REST API from your app, share a payment link on WhatsApp or SMS, or send a USSD push from the portal.' },
  { t: 'Get paid and settle', d: 'Your customer approves with their PIN. You get a signed webhook and the funds land in your merchant wallet.' },
]

function How() {
  return (
    <section className="w-sec w-sec--white" id="how">
      <div className="w-wrap">
        <div className="w-darkbox w-darkbox--violet" data-w-reveal>
          <div className="w-darkbox__glow" aria-hidden="true" />
          <div className="w-head w-head--light">
            <span className="w-pill w-pill--yellow">How it works</span>
            <h2 className="w-h2">Three steps, and you're getting paid.</h2>
            <p className="w-lead">No aggregator contract, no hardware: one account, one integration, and your customers pay.</p>
          </div>
          <div className="w-steps" data-w-stagger>
            {STEPS.map((s, i) => (
              <div key={s.t} className="w-step">
                <span className="w-step__n">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Ways to collect ─────────────────────────────────────────────────────────

const TOOLS = [
  { icon: Code2, tone: 'dark', name: 'REST API', tag: 'Collect in your app', d: 'One endpoint to create a payment. Bearer auth, JSON in and out, idempotency keys.', cta: 'Read the docs', href: '/docs', internal: true },
  { icon: Link2, tone: 'blue', name: 'Payment links', tag: 'Collect without code', d: 'A link with a fixed amount. Share it on WhatsApp, SMS or email and the customer enters their number.', cta: 'Create a link', href: PORTAL },
  { icon: Smartphone, tone: 'lime', name: 'USSD push', tag: 'Collect from the portal', d: 'Type a phone number and amount in the portal. The PIN prompt reaches the customer in seconds.', cta: 'Open the portal', href: PORTAL },
  { icon: Split, tone: 'orange', name: 'Wiso Split', tag: 'Split a bill', d: 'Split a bill between friends or a group. Each person pays their share from their own wallet.', cta: 'Talk to us', href: '/contact', internal: true },
]

function Tools() {
  return (
    <section className="w-sec w-sec--white w-sec--tight">
      <div className="w-wrap">
        <div className="w-head" data-w-reveal>
          <span className="w-pill w-pill--yellow">Ways to collect</span>
          <h2 className="w-h2">Pick how you sell.<br />WisoPay collects for you.</h2>
          <p className="w-lead">Every channel pays into the same balance, with the same fee and the same settlement.</p>
        </div>
        <div className="w-tools" data-w-stagger>
          {TOOLS.map(t => (
            <article key={t.name} className="w-tool">
              <span className={`w-tool__icon w-tool__icon--${t.tone}`}><t.icon size={20} /></span>
              <h3>{t.name}</h3>
              <p className="w-tool__tag">{t.tag}</p>
              <p>{t.d}</p>
              {t.internal
                ? <Link to={t.href} className="w-tool__link">{t.cta}</Link>
                : <a href={t.href} className="w-tool__link">{t.cta}</a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="w-sec w-sec--sand">
      <div className="w-wrap w-feat">
        <div className="w-feat__copy" data-w-reveal>
          <span className="w-pill w-pill--yellow">Features</span>
          <h2 className="w-h2 w-h2--left">Collecting mobile money in Tanzania has never been this simple.</h2>
          <ul className="w-ticks" data-w-stagger>
            <li>Signed webhooks (HMAC-SHA256) the moment a payment completes or fails.</li>
            <li>Idempotency keys so a retry never charges a customer twice.</li>
            <li>A full sandbox where payments complete instantly and webhooks still fire.</li>
          </ul>
          <a href={PORTAL} className="w-btn w-btn--light w-btn--lg">Create an account</a>
        </div>
        <div className="w-feat__art" data-w-reveal>
          <div className="w-receipt">
            <small>Latest payment</small>
            <div className="w-receipt__row">
              <img src={mpesa} alt="" />
              <div><strong>M-Pesa</strong><span>TZS 25,000, completed</span></div>
            </div>
            <div className="w-receipt__meta"><span>8 min ago</span><span>order_2847</span></div>
          </div>
          <div className="w-chip">
            <span className="w-chip__logos">{NETWORKS.slice(1).map(n => <img key={n.name} src={n.logo} alt="" />)}</span>
            <div><strong>Webhook delivered</strong><small>signed, 200 OK in 140 ms</small></div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section className="w-sec w-sec--white" id="pricing">
      <div className="w-wrap">
        <div className="w-head" data-w-reveal>
          <span className="w-pill w-pill--yellow">Pricing</span>
          <h2 className="w-h2">Simple, with no surprises.</h2>
        </div>
        <div className="w-prices" data-w-stagger>
          <article className="w-price">
            <h3>Sandbox</h3>
            <p className="w-price__desc">Build and test your integration before you take a single real shilling.</p>
            <div className="w-price__amt">Free</div>
            <p className="w-price__unit">no card, no commitment</p>
            <a href={PORTAL} className="w-btn w-btn--light w-btn--block">Get test keys</a>
            <ul className="w-ticks w-ticks--dot">
              <li>Sandbox API keys on sign-up</li>
              <li>Payments complete instantly</li>
              <li>Webhooks fire like in production</li>
              <li>No real money moves</li>
            </ul>
          </article>

          <article className="w-price w-price--hero">
            <h3>wisopay</h3>
            <p className="w-price__desc">Collect from every mobile wallet in Tanzania with one account.</p>
            <div className="w-price__amt">2 %</div>
            <p className="w-price__unit">per successful payment</p>
            <a href={PORTAL} className="w-btn w-btn--dark w-btn--block">Create an account</a>
            <ul className="w-ticks w-ticks--dot">
              <li>No monthly fee, no setup fee</li>
              <li>M-Pesa, Airtel Money, Mixx by Yas, HaloPesa</li>
              <li>API, payment links and USSD push</li>
              <li>Signed webhooks and idempotency keys</li>
              <li>Settlement to your merchant wallet</li>
              <li>Online merchant portal</li>
            </ul>
          </article>

          <article className="w-price">
            <h3>Enterprise</h3>
            <p className="w-price__desc">High volumes, several brands or specific compliance needs.</p>
            <div className="w-price__amt w-price__amt--sm">Custom</div>
            <p className="w-price__unit">based on your volume</p>
            <Link to="/contact" className="w-btn w-btn--light w-btn--block">Contact the team</Link>
            <ul className="w-ticks w-ticks--dot">
              <li>Rates negotiated on volume</li>
              <li>Dedicated account manager</li>
              <li>Integration support</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

// ─── Payment methods ─────────────────────────────────────────────────────────

function Methods() {
  return (
    <section className="w-sec w-sec--white w-sec--flush" id="methods">
      <div className="w-wrap">
        <div className="w-darkbox w-darkbox--blue" data-w-reveal>
          <div className="w-darkbox__planet" aria-hidden="true" />
          <div className="w-head w-head--light">
            <span className="w-pill w-pill--yellow">Payment methods</span>
            <h2 className="w-h2">Every mobile wallet,<br />one account.</h2>
            <p className="w-lead">WisoPay connects to all four mobile money networks in Tanzania, from Dar es Salaam to Kigoma.</p>
          </div>
          <div className="w-methods" data-w-stagger>
            {NETWORKS.map(n => (
              <a key={n.name} href={PORTAL} className="w-method">
                <img src={n.logo} alt="" />
                <div><strong>{n.name}</strong><small>Mobile money · {n.by}</small></div>
                <span className="w-method__go"><ArrowRight size={18} /></span>
              </a>
            ))}
          </div>
          <div className="w-center">
            <a href={PORTAL} className="w-btn w-btn--white">Create an account</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Developers ──────────────────────────────────────────────────────────────

const CODE = `const res = await fetch('https://api.wisopay.io/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${WISOPAY_KEY}\`,
    'Idempotency-Key': 'order_2847',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount_minor: 25000,        // TZS 25,000
    currency: 'TZS',
    merchant_reference: 'order_2847',
    payer: { msisdn: '255712345678' },
  }),
})

const payment = await res.json()
// { id: 'TXN-…', status: 'PROCESSING' }`

function Developers() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(CODE); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
  return (
    <section className="w-sec w-sec--cloud" id="developers">
      <div className="w-wrap">
        <div className="w-head" data-w-reveal>
          <span className="w-pill w-pill--yellow">Developers</span>
          <h2 className="w-h2">One API call to get paid.</h2>
          <p className="w-lead">A predictable REST API, signed webhooks and a sandbox that behaves like production.</p>
        </div>
        <div className="w-dev" data-w-reveal>
          <div className="w-code">
            <div className="w-code__bar">
              <span className="w-code__dots"><i /><i /><i /></span>
              <span>create-payment.js</span>
              <button onClick={copy} className="w-code__copy">{copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}</button>
            </div>
            <pre><code>{CODE}</code></pre>
          </div>
          <div className="w-dev__list" data-w-stagger>
            {[
              { i: KeyRound, t: 'Bearer token auth', d: 'Live and sandbox keys from the portal. No OAuth dance.' },
              { i: ShieldCheck, t: 'Idempotency keys', d: 'Retry safely: the same key never creates a second charge.' },
              { i: Webhook, t: 'Signed webhooks', d: 'HMAC-SHA256 payloads with automatic retries and a delivery log.' },
              { i: Zap, t: 'Instant sandbox', d: 'Test payments complete immediately, no phone needed.' },
            ].map(f => (
              <div key={f.t} className="w-dev__item">
                <span><f.i size={18} /></span>
                <div><strong>{f.t}</strong><p>{f.d}</p></div>
              </div>
            ))}
            <Link to="/docs" className="w-btn w-btn--dark w-btn--lg">Read the API docs <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function Cta() {
  return (
    <section className="w-cta">
      <div className="w-cta__glow" aria-hidden="true" />
      <div className="w-wrap w-cta__inner" data-w-reveal>
        <div>
          <h2 className="w-h2 w-h2--left">Create your account today,<br />get paid tomorrow.</h2>
          <p>Sign up in minutes. Test in the sandbox right away, go live once your business is verified.</p>
        </div>
        <div className="w-cta__btns">
          <a href={PORTAL} className="w-btn w-btn--lime w-btn--lg">Create an account <ArrowRight size={16} /></a>
          <Link to="/contact" className="w-btn w-btn--ghost w-btn--lg">Talk to us</Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function SiteFooter() {
  const { pathname } = useLocation()
  const anchor = (id: string) => (pathname === '/' ? `#${id}` : `/#${id}`)
  return (
    <footer className="w-foot">
      <div className="w-wrap">
        <div className="w-foot__top">
          <div className="w-foot__brand">
            <Link to="/" className="w-logo w-logo--light"><img src="/logo.png" alt="" /><span>wisopay</span></Link>
            <p>Mobile money payments for Tanzania. M-Pesa, Airtel Money, Mixx by Yas and HaloPesa in one account.</p>
            <a href={PORTAL} className="w-btn w-btn--lime">Create an account</a>
          </div>
          <div className="w-foot__cols">
            <div>
              <h4>Product</h4>
              <a href={anchor('products')}>Overview</a>
              <a href={anchor('methods')}>Payment methods</a>
              <a href={anchor('pricing')}>Pricing</a>
              <a href={PORTAL}>Merchant portal</a>
            </div>
            <div>
              <h4>Developers</h4>
              <Link to="/docs">API reference</Link>
              <Link to="/sandbox">Sandbox</Link>
              <a href={anchor('developers')}>Webhooks</a>
              <a href={PORTAL}>API keys</a>
            </div>
            <div>
              <h4>Company</h4>
              <Link to="/contact">Contact</Link>
              <Link to="/faq">FAQ</Link>
              <a href="mailto:pay@wisopay.com">pay@wisopay.com</a>
            </div>
          </div>
        </div>
        <div className="w-foot__word" aria-hidden="true">wisopay</div>
        <div className="w-foot__bottom">
          <span>© {new Date().getFullYear()} WisoPay. All rights reserved.</span>
          <span className="w-foot__legal"><a href="#">Privacy</a><a href="#">Terms</a></span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-w-reveal], [data-w-stagger], [data-w-watch]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => obs.observe(el))
    if (window.location.hash) {
      setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView(), 60)
    }
    return () => obs.disconnect()
  }, [])

  return (
    <main className="w-page">
      <Hero />
      <Overview />
      <How />
      <Tools />
      <Features />
      <Pricing />
      <Methods />
      <Developers />
      <Cta />
    </main>
  )
}
