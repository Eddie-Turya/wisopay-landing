/**
 * First-party analytics for wisopay.io, sent to api.wisopay.io/t (no third parties).
 *
 * Accepted cookies → full journey: visitor id (localStorage), session (new after 30 idle minutes),
 * page views with time on page, clicks on links/buttons; links to the portal carry the visitor id so a
 * sign-up can be linked back. Declined or not chosen → only an anonymous page count, no identifiers.
 */
const ENDPOINT: string | null = import.meta.env.VITE_TRACK_URL || (typeof location !== 'undefined' && /(^|\.)wisopay\.io$/.test(location.hostname) ? 'https://api.wisopay.io/t' : null)
const SESSION_GAP_MS = 30 * 60_000

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } },
}
const newId = () => (crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, '').slice(0, 24)
const consented = () => store.get('cookie_consent') === 'accepted'

function ids(): { vid: string; sid: string; isNewSession: boolean } {
  let vid = store.get('wp_vid')
  if (!vid) { vid = newId(); store.set('wp_vid', vid) }
  const last = Number(store.get('wp_last') || 0)
  let sid = store.get('wp_sid')
  let isNewSession = false
  if (!sid || Date.now() - last > SESSION_GAP_MS) { sid = newId(); store.set('wp_sid', sid); isNewSession = true }
  store.set('wp_last', String(Date.now()))
  return { vid, sid, isNewSession }
}

function send(event: Record<string, unknown>) {
  if (!ENDPOINT) return
  const body = JSON.stringify(event)
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return
  } catch { /* fall back below */ }
  void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }).catch(() => {})
}

let current: { path: string; since: number } | null = null

function utmFromUrl(): Record<string, string> | null {
  const p = new URLSearchParams(location.search)
  const utm: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) { const v = p.get(k); if (v) utm[k] = v }
  return Object.keys(utm).length ? utm : null
}

/** Time spent on the page being left. */
function leave() {
  if (!current || !consented()) return
  const { vid, sid } = ids()
  send({ consent: true, vid, sid, type: 'leave', path: current.path, duration_ms: Date.now() - current.since })
}

/** Call on every route change. */
export function trackPageview(path: string) {
  if (current && current.path !== path) leave()
  current = { path, since: Date.now() }
  if (!consented()) { send({ consent: false, type: 'pageview', path }); return }
  const { vid, sid, isNewSession } = ids()
  send({
    consent: true, vid, sid, type: 'pageview', path, title: document.title,
    // Where they came from: only meaningful on a session's first page
    referrer: isNewSession && document.referrer && !document.referrer.includes(location.host) ? document.referrer : null,
    utm: isNewSession ? utmFromUrl() : null,
    screen: `${screen.width}x${screen.height}`, language: navigator.language,
  })
}

let started = false
/** Click and page-hide listeners; call once. */
export function startAnalytics() {
  if (started) return
  started = true

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') leave()
    else if (current) current.since = Date.now() // came back: time the rest of the visit on this page
  })

  // Clicks on links and buttons (what they clicked and where it goes)
  document.addEventListener('click', (ev) => {
    if (!consented()) return
    const el = (ev.target as HTMLElement | null)?.closest('a,button') as HTMLAnchorElement | HTMLButtonElement | null
    if (!el || el.closest('.cookie-banner')) return
    const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    const href = el instanceof HTMLAnchorElement ? el.href : ''
    const { vid, sid } = ids()
    // Carry the visitor to the portal, so a sign-up can be linked to this visit
    if (el instanceof HTMLAnchorElement && /^https:\/\/portal\.wisopay\.io/.test(href)) {
      try { const u = new URL(href); u.searchParams.set('wv', vid); el.href = u.toString() } catch { /* leave link as is */ }
    }
    send({ consent: true, vid, sid, type: 'click', path: current?.path ?? location.pathname, target: href ? `${label} → ${href.replace(/[?&]wv=[^&]+/, '')}` : label })
  }, { capture: true })

  // Accepting the banner mid-visit starts tracking from the current page
  window.addEventListener('wp-consent', () => { if (consented()) trackPageview(location.pathname) })
}
