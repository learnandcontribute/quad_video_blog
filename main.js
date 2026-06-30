/* ═══════════════════════════════════════
   QUAD RENT ZAGREB — Shared JS
   ═══════════════════════════════════════ */

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60));
}

// ── MOBILE MENU ──
function toggleMenu() {
  const mm = document.getElementById('mobileMenu');
  const hb = document.getElementById('hamburger');
  if (!mm) return;
  const open = mm.classList.toggle('open');
  if (hb) hb.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

// ── FAQ ACCORDION ──
function togFaq(btn) {
  const item = btn.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ═══ BOOKING MODAL — multi-quad cart ═══
const QUADS = {
  segway:     { half: 100, full: 150, max: 4, label: 'Segway AT5L' },
  linhai550:  { half: 100, full: 150, max: 2, label: 'Linhai 550L' },
  linhai650:  { half: 100, full: 150, max: 2, label: 'Linhai 650 Landforce' },
  linhai1000: { half: 100, full: 150, max: 2, label: 'Linhai 1000' },
  kids:       { half: 60,  full: 120, max: 2, label: 'Dječji quad' }
};

const DUR_LABELS = {
  half: 'Pola dana (6h)',
  full: 'Cijeli dan (12h)'
};

// Legacy aliases for prefill from older pages (e.g. quad.html uses 'standard')
const PREFILL_ALIASES = {
  standard: 'segway'
};

let booking = {
  counts: { segway: 0, linhai550: 0, linhai650: 0, linhai1000: 0, kids: 0 },
  duration: 'half',
  date: ''
};

// Init date
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
    booking.date = dateInput.value;
    dateInput.addEventListener('change', function () { booking.date = this.value; });
    // Klik bilo gdje na polje otvara kalendar (ne samo na ikonu)
    dateInput.addEventListener('click', function () {
      if (typeof this.showPicker === 'function') {
        try { this.showPicker(); } catch (e) { /* tihi fallback na staro ponašanje */ }
      }
    });
  }
});

function openBooking(prefillType, prefillDuration) {
  // Reset
  for (const k in booking.counts) booking.counts[k] = 0;
  // Prefill 1 of the requested type (resolving legacy aliases)
  if (prefillType) {
    const resolved = PREFILL_ALIASES[prefillType] || prefillType;
    if (QUADS[resolved]) booking.counts[resolved] = 1;
  }
  booking.duration = (prefillDuration === 'full') ? 'full' : 'half';
  setDuration(booking.duration);
  updateAllCounts();
  updateSummary();
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function setDuration(dur) {
  booking.duration = dur;
  document.querySelectorAll('#durationToggle .modal__toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dur === dur);
  });
  updateSummary();
}

function changeCount(type, delta) {
  if (!QUADS[type]) return;
  const max = QUADS[type].max;
  booking.counts[type] = Math.max(0, Math.min(max, booking.counts[type] + delta));
  const el = document.getElementById('count-' + type);
  if (el) el.textContent = booking.counts[type];
  updateSummary();
}

function updateAllCounts() {
  for (const k in booking.counts) {
    const el = document.getElementById('count-' + k);
    if (el) el.textContent = booking.counts[k];
  }
}

function updateSummary() {
  const summaryEl = document.getElementById('bookSummary');
  if (!summaryEl) return;

  // Remove previous dynamic line items (everything except empty + total)
  summaryEl.querySelectorAll('.modal__summary-row').forEach(r => r.remove());

  const totalEl = document.getElementById('summaryTotal');
  let total = 0;
  let hasAny = false;

  for (const k in booking.counts) {
    const count = booking.counts[k];
    if (count > 0) {
      hasAny = true;
      const lineTotal = count * QUADS[k][booking.duration];
      total += lineTotal;
      const row = document.createElement('div');
      row.className = 'modal__summary-row';
      row.innerHTML = '<span>' + count + '× ' + QUADS[k].label + '</span><span>€' + lineTotal + '</span>';
      if (totalEl) summaryEl.insertBefore(row, totalEl);
      else summaryEl.appendChild(row);
    }
  }

  const emptyEl = document.getElementById('summaryEmpty');
  const submitEl = document.getElementById('bookSubmit');
  const totalValEl = document.getElementById('sumTotal');

  if (emptyEl) emptyEl.style.display = hasAny ? 'none' : 'block';
  if (totalEl) totalEl.style.display = hasAny ? 'flex' : 'none';
  if (totalValEl) totalValEl.textContent = '€' + total;
  if (submitEl) submitEl.disabled = !hasAny;
}

function formatDate(dateStr) {
  if (!dateStr) return 'nije odabran';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
  const months = ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'];
  return days[d.getDay()] + ', ' + d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear() + '.';
}

function sendWhatsApp() {
  const dateInput = document.getElementById('bookDate');
  const date = dateInput ? dateInput.value : '';
  let total = 0;
  let totalQuads = 0;
  const lines = [];

  for (const k in booking.counts) {
    const count = booking.counts[k];
    if (count > 0) {
      const lineTotal = count * QUADS[k][booking.duration];
      total += lineTotal;
      totalQuads += count;
      lines.push('• ' + count + '× ' + QUADS[k].label + ' — €' + lineTotal);
    }
  }
  if (lines.length === 0) return;

  let msg = 'Bok! Želim rezervirati quad vožnju:\n\n';
  msg += '🏍 Quadovi:\n' + lines.join('\n') + '\n\n';
  msg += '⏱ Trajanje: ' + DUR_LABELS[booking.duration] + '\n';
  msg += '📅 Datum: ' + formatDate(date) + '\n';
  msg += '👥 Ukupno quadova: ' + totalQuads + '\n';
  msg += '💰 Ukupno: €' + total + '\n';
  msg += '📏 Ograničenje: 100 km po quadu (dodatni km = €1)\n\n';
  msg += 'Molim potvrdu dostupnosti. Hvala!';

  window.open('https://wa.me/385955442541?text=' + encodeURIComponent(msg), '_blank');
}

// Close modal on Escape
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBooking(); });

// ── NAV ACTIVE STATE ──
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});

// ═══ COOKIE CONSENT ═══
const COOKIE_KEY = 'qrz_cookie_consent';

function getCookieConsent() {
  try { return JSON.parse(localStorage.getItem(COOKIE_KEY)); } catch(e) { return null; }
}

function setCookieConsent(prefs) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
  applyCookiePrefs(prefs);
}

function applyCookiePrefs(prefs) {
  if (!prefs) return;
  if (prefs.analytics && window.GA_ID) {
    if (!document.getElementById('ga-script')) {
      const s = document.createElement('script');
      s.id = 'ga-script';
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_ID;
      s.async = true;
      document.head.appendChild(s);
      s.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', window.GA_ID);
      };
    }
  }
  if (prefs.marketing) {
    // Marketing pixels placeholder
  }
}

function showCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (banner) setTimeout(() => banner.classList.add('show'), 500);
}

function hideCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.remove('show');
}

function acceptAllCookies() {
  setCookieConsent({ necessary: true, analytics: true, marketing: true });
  hideCookieBanner();
}

function declineOptionalCookies() {
  setCookieConsent({ necessary: true, analytics: false, marketing: false });
  hideCookieBanner();
}

function saveCookieSettings() {
  const analytics = document.getElementById('cookieAnalytics');
  const marketing = document.getElementById('cookieMarketing');
  setCookieConsent({
    necessary: true,
    analytics: analytics ? analytics.checked : false,
    marketing: marketing ? marketing.checked : false
  });
  hideCookieBanner();
}

function toggleCookieDetails() {
  const panel = document.getElementById('cookieSettings');
  if (panel) panel.classList.toggle('show');
}

function reopenCookieSettings() {
  const banner = document.getElementById('cookieBanner');
  const panel = document.getElementById('cookieSettings');
  if (banner) {
    banner.classList.add('show');
    if (panel) panel.classList.add('show');
    const prefs = getCookieConsent();
    if (prefs) {
      const a = document.getElementById('cookieAnalytics');
      const m = document.getElementById('cookieMarketing');
      if (a) a.checked = prefs.analytics;
      if (m) m.checked = prefs.marketing;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const prefs = getCookieConsent();
  if (!prefs) showCookieBanner();
  else applyCookiePrefs(prefs);
});
