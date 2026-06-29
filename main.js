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

// ═══ BOOKING MODAL ═══
const prices = {
  segway: { half: 100, full: 150 },
  linhai550: { half: 100, full: 150 },
  linhai650: { half: 100, full: 150 },
  linhai1000: { half: 100, full: 150 },
  kids: { half: 60, full: 120 }
};

const maxCount = {
  segway: 4,
  linhai550: 2,
  linhai650: 2,
  linhai1000: 2,
  kids: 2
};

const typeLabels = {
  segway: 'Segway AT5L',
  linhai550: 'Linhai 550L',
  linhai650: 'Linhai 650 Landforce',
  linhai1000: 'Linhai 1000',
  kids: 'Dječji quad'
};

const durLabels = {
  half: 'Pola dana (6h)',
  full: 'Cijeli dan (12h)'
};

let booking = {
  type: 'segway',
  duration: 'half',
  count: 1,
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
  }
});

function openBooking(type, duration) {
  booking.type = type || 'segway';
  booking.duration = duration || 'half';
  booking.count = 1;
  setType(booking.type);
  setDuration(booking.duration);
  const cv = document.getElementById('countVal');
  if (cv) cv.textContent = booking.count;
  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

function setType(type) {
  booking.type = type;
  if (booking.count > (maxCount[type] || 2)) {
    booking.count = maxCount[type] || 2;
    const cv = document.getElementById('countVal');
    if (cv) cv.textContent = booking.count;
  }
  document.querySelectorAll('#typeToggle .modal__toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  updatePriceDisplay();
  updateSummary();
}

function setDuration(dur) {
  booking.duration = dur;
  document.querySelectorAll('#durationToggle .modal__toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dur === dur);
  });
  updateSummary();
}

function updatePriceDisplay() {
  const hp = document.getElementById('halfPrice');
  const fp = document.getElementById('fullPrice');
  if (hp) hp.textContent = '€' + prices[booking.type].half;
  if (fp) fp.textContent = '€' + prices[booking.type].full;
}

function changeCount(delta) {
  booking.count = Math.max(1, Math.min(maxCount[booking.type] || 2, booking.count + delta));
  const cv = document.getElementById('countVal');
  if (cv) cv.textContent = booking.count;
  updateSummary();
}

function updateSummary() {
  const unitPrice = prices[booking.type][booking.duration];
  const total = unitPrice * booking.count;
  const st = document.getElementById('sumType');
  const sd = document.getElementById('sumDur');
  const sc = document.getElementById('sumCount');
  const stot = document.getElementById('sumTotal');
  if (st) st.textContent = typeLabels[booking.type];
  if (sd) sd.textContent = durLabels[booking.duration];
  if (sc) sc.textContent = booking.count;
  if (stot) stot.textContent = '€' + total;
}

function formatDate(dateStr) {
  if (!dateStr) return 'nije odabran';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
  const months = ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'];
  return days[d.getDay()] + ', ' + d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear() + '.';
}

function sendWhatsApp() {
  const date = document.getElementById('bookDate').value;
  const unitPrice = prices[booking.type][booking.duration];
  const total = unitPrice * booking.count;
  const quadType = typeLabels[booking.type];
  const dur = durLabels[booking.duration];
  const dateFormatted = formatDate(date);

  let msg = 'Bok! Želim rezervirati quad vožnju:\n\n';
  msg += '🏍 Quad: ' + quadType + '\n';
  msg += '⏱ Trajanje: ' + dur + '\n';
  msg += '📅 Datum: ' + dateFormatted + '\n';
  msg += '👥 Broj quadova: ' + booking.count + '\n';
  msg += '💰 Ukupno: €' + total + '\n';
  msg += '📏 Ograničenje: 100 km (dodatni km = €1)\n\n';
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
  // Analytics: load GA if consented
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
  // Marketing: placeholder for future pixels
  if (prefs.marketing) {
    // Load Facebook Pixel, etc. when ready
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
    // Restore current prefs to toggles
    const prefs = getCookieConsent();
    if (prefs) {
      const a = document.getElementById('cookieAnalytics');
      const m = document.getElementById('cookieMarketing');
      if (a) a.checked = prefs.analytics;
      if (m) m.checked = prefs.marketing;
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const prefs = getCookieConsent();
  if (!prefs) {
    showCookieBanner();
  } else {
    applyCookiePrefs(prefs);
  }
});
