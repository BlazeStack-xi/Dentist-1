/* ==========================================================
   LUMIÈRE DENTAL STUDIO — script.js
   Vanilla JS, no dependencies (Lucide icons are optional).

   TABLE OF CONTENTS
   1.  CONFIG  ← edit clinic details here
   2.  Data (services, gallery, testimonials, FAQs)
   3.  Utilities (DOM, storage, toast, images, dates)
   4.  WhatsApp helpers
   5.  BookingAPI  ← swap in a real backend here
   6.  Navigation, scroll effects, reveal
   7.  Services + modal
   8.  Booking form
   9.  Gallery + lightbox
   10. Testimonial carousel
   11. FAQ accordion
   12. Contact form
   13. Init
   ========================================================== */
(() => {
  'use strict';

  /* 1. CONFIG --------------------------------------------- */
  // DEMO VALUES — replace every item below with the real clinic's details.
  const CONFIG = {
    clinicName: 'Lumière Dental Studio',
    whatsappNumber: '+91 98765 43210',   // any format; normalised automatically
    displayPhone: '+91 98765 43210',
    email: 'hello@lumieredental.example',
    address: 'Demo Address, Sector 00, Gurugram, Haryana, India',
    mapQuery: 'Gurugram, Haryana, India',  // use the clinic's full address or Google Place name
    bookingEndpoint: null,               // e.g. 'https://api.yourdomain.com/appointments' (see BookingAPI)
    storageKey: 'lumiere_demo_requests_v1',
    maxAdvanceDays: 120,
    closedWeekdays: [0],                 // 0 = Sunday
    timeSlots: [
      { label: '10:00 AM', hour: 10 }, { label: '11:00 AM', hour: 11 }, { label: '12:00 PM', hour: 12 },
      { label: '02:00 PM', hour: 14 }, { label: '03:00 PM', hour: 15 }, { label: '04:00 PM', hour: 16 },
      { label: '05:00 PM', hour: 17 }, { label: '06:00 PM', hour: 18 }
    ]
  };

  /* 2. DATA ----------------------------------------------- */
  // Image helper. Replace with local files, e.g. 'assets/img/whitening.jpg'.
  const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
  const IMG = {
    a: '1629909613654-28e377c37b09', b: '1606811841689-23dfddce3e95', c: '1588776814546-1ffcf47267a5',
    d: '1609840114035-3c981b782dfe', e: '1598256989800-fe5f95da9787', f: '1606265752439-1f18756aa5fc'
  };

  const SERVICES = [
    { id: 'general', name: 'General Dentistry', icon: 'stethoscope', img: IMG.a,
      short: 'Check-ups, examinations, fillings and preventive advice to keep your mouth healthy.',
      points: ['A thorough examination and a conversation about your concerns', 'Digital imaging where your dentist considers it appropriate', 'A clear explanation of findings and options', 'Preventive guidance tailored to you'] },
    { id: 'cleaning', name: 'Teeth Cleaning & Polishing', icon: 'sparkles', img: IMG.c,
      short: 'Professional scaling and polishing to remove plaque and surface stains.',
      points: ['Removal of plaque and tartar build-up', 'Polishing to leave teeth smooth', 'Home-care advice for brushing and flossing', 'Suggested recall interval from your dentist'] },
    { id: 'whitening', name: 'Teeth Whitening', icon: 'sun', img: IMG.d,
      short: 'Supervised whitening options designed to brighten your smile safely.',
      points: ['Assessment to check whether whitening is suitable', 'Options discussed, such as in-clinic or take-home approaches', 'Guidance on managing sensitivity', 'Results vary between individuals'] },
    { id: 'implants', name: 'Dental Implants', icon: 'gem', img: IMG.b,
      short: 'A long-term option for replacing missing teeth, planned carefully with your dentist.',
      points: ['Consultation and imaging to assess suitability', 'A staged treatment plan with timelines explained', 'Discussion of alternatives, risks and aftercare', 'Estimated costs shared before you decide'] },
    { id: 'aligners', name: 'Braces & Clear Aligners', icon: 'align-center', img: IMG.e,
      short: 'Straighten teeth with traditional braces or removable clear aligners where suitable.',
      points: ['Bite and alignment assessment', 'Discussion of braces versus aligner options', 'Regular review visits to monitor progress', 'Retainer guidance after treatment'] },
    { id: 'rootcanal', name: 'Root Canal Treatment', icon: 'activity', img: IMG.c,
      short: 'Gentle treatment to relieve pain and save a badly infected or damaged tooth.',
      points: ['Diagnosis and explanation of why treatment is advised', 'Comfort-focused procedure with local anaesthesia', 'Often followed by a crown to protect the tooth', 'Aftercare instructions provided'] },
    { id: 'cosmetic', name: 'Cosmetic Dentistry', icon: 'smile', img: IMG.f,
      short: 'Veneers, bonding and smile design to refine shape, colour and symmetry.',
      points: ['A discussion of what you would like to change', 'Conservative options explained first', 'Preview and planning where appropriate', 'Honest guidance on longevity and maintenance'] },
    { id: 'crowns', name: 'Crowns & Bridges', icon: 'crown', img: IMG.b,
      short: 'Durable restorations that rebuild strength, shape and function.',
      points: ['Materials and shade options discussed', 'Precise impressions or digital scans', 'Temporary protection between visits', 'Fit and bite checked before finishing'] },
    { id: 'pediatric', name: 'Pediatric Dentistry', icon: 'baby', img: IMG.a,
      short: 'Friendly, patient care for children, from first visits to preventive treatment.',
      points: ['Gentle introduction to the dental chair', 'Preventive advice for parents and children', 'Age-appropriate explanations', 'Parents are welcome to stay throughout'] },
    { id: 'emergency', name: 'Emergency Dental Care', icon: 'siren', img: IMG.e,
      short: 'Prompt help for severe pain, swelling, broken teeth or knocked-out teeth.',
      points: ['Please call the clinic directly for urgent problems', 'The team will advise on the quickest way to be seen', 'Seek hospital care for facial swelling affecting breathing or swallowing', 'Do not rely on an online form in an emergency'] }
  ];

  const GALLERY = [
    { id: 'g1', cat: 'Whitening', title: 'Brighter shade', img: IMG.d, alt: 'Illustrative comparison of teeth before and after whitening' },
    { id: 'g2', cat: 'Aligners', title: 'Smoother alignment', img: IMG.e, alt: 'Illustrative comparison of teeth before and after alignment' },
    { id: 'g3', cat: 'Implants', title: 'Restored smile', img: IMG.b, alt: 'Illustrative comparison representing a tooth replacement' },
    { id: 'g4', cat: 'Cosmetic', title: 'Refined shape', img: IMG.f, alt: 'Illustrative comparison representing cosmetic smile improvement' },
    { id: 'g5', cat: 'Whitening', title: 'Even, natural tone', img: IMG.a, alt: 'Second illustrative whitening comparison' },
    { id: 'g6', cat: 'Cosmetic', title: 'Balanced smile line', img: IMG.c, alt: 'Second illustrative cosmetic comparison' }
  ];

  const TESTIMONIALS = [
    { name: 'Sample Patient A', meta: 'Teeth cleaning', text: 'The team explained every step and I never felt rushed. This is a sample testimonial written for the demo.' },
    { name: 'Sample Patient B', meta: 'Aligner consultation', text: 'I appreciated the clear treatment plan and the written cost estimate before anything started. Demo text only.' },
    { name: 'Sample Parent C', meta: 'Pediatric visit', text: 'My child was nervous but the dentist was patient and kind. Sample review for demonstration purposes.' },
    { name: 'Sample Patient D', meta: 'Root canal', text: 'I came in worried about pain and left reassured. The follow-up instructions were easy to follow. Demo content.' },
    { name: 'Sample Patient E', meta: 'Whitening', text: 'Booking over WhatsApp was quick and the clinic replied with available slots. Illustrative demo testimonial.' }
  ];

  const FAQS = [
    { q: 'How do I book an appointment?', a: 'Use the appointment form on this page, or message the clinic on WhatsApp. Your request becomes a confirmed appointment only once the clinic replies and confirms a time with you.' },
    { q: 'What should I bring to my consultation?', a: 'Bring a photo ID, a list of any medicines you take, and any previous dental records or X-rays if you have them. If a referral or insurance document applies to you, bring that too.' },
    { q: 'Do you treat children?', a: 'Yes. Pediatric dentistry is part of our services, and parents are welcome to stay with their child throughout the visit. (Demo content: confirm with the real clinic.)' },
    { q: 'What happens during my first visit?', a: 'You will be welcomed, asked about your dental history and concerns, and examined by the dentist. Any imaging, findings and options are explained, and you leave with a clear plan and estimated costs.' },
    { q: 'How do I contact the clinic about an urgent dental concern?', a: 'Please call the clinic directly on the number shown in the contact section rather than using a form. For severe swelling, difficulty breathing or swallowing, or serious injury, go to the nearest hospital emergency department.' },
    { q: 'Does treatment cost vary?', a: 'Yes. Costs depend on the treatment, materials and your individual needs. After examination, the dentist will explain your options and provide an estimate before treatment begins.' }
  ];

  /* 3. UTILITIES ------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const icons = () => { try { window.lucide && window.lucide.createIcons(); } catch (e) { /* icons are decorative */ } };

  // Replace broken remote images with an inline placeholder so layouts never collapse.
  const FALLBACK_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDE9DF"/><stop offset="1" stop-color="#C7A77A" stop-opacity=".6"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="none" stroke="#123C3A" stroke-width="10" stroke-linejoin="round" opacity=".55"><path d="M400 210c-26-19-62-24-90-5-30 20-34 62-19 100 10 26 13 50 16 80 4 32 10 85 36 85 23 0 23-60 57-60s34 60 57 60c26 0 32-53 36-85 3-30 6-54 16-80 15-38 11-80-19-100-28-19-64-14-90 5z"/></g></svg>');
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && !img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.src = FALLBACK_SVG;
    }
  }, true);

  // Safe localStorage wrapper (private mode / blocked storage must not break the page).
  const Store = {
    read() {
      try { const v = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]'); return Array.isArray(v) ? v : []; }
      catch (e) { return []; }
    },
    write(list) {
      try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(list)); return true; }
      catch (e) { return false; }
    },
    add(item) { const l = this.read(); l.unshift(item); return this.write(l.slice(0, 20)); },
    clear() { try { localStorage.removeItem(CONFIG.storageKey); return true; } catch (e) { return false; } }
  };

  function toast(msg) {
    const region = $('#toasts');
    if (!region) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    region.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, 3800);
  }

  const pad = (n) => String(n).padStart(2, '0');
  const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISODate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const formatDate = (s) => parseISODate(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }

  /* 4. WHATSAPP ------------------------------------------- */
  // Keeps digits only and adds India's country code to bare 10-digit numbers.
  function normalizePhone(raw) {
    let d = String(raw || '').replace(/\D/g, '').replace(/^0+/, '');
    if (d.length === 10) d = '91' + d;
    return d;
  }
  function buildWhatsAppUrl(message, phone = CONFIG.whatsappNumber) {
    const base = `https://wa.me/${normalizePhone(phone)}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  }
  // Opens WhatsApp (app or web) in a new tab. The user must still press Send there.
  function openWhatsApp(message) {
    const a = document.createElement('a');
    a.href = buildWhatsAppUrl(message);
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
    toast('WhatsApp is opening in a new tab. Press Send there to deliver your message.');
  }
  const MSG = {
    general: `Hello ${CONFIG.clinicName}, I would like to make an enquiry.`,
    service: (name) => `Hello ${CONFIG.clinicName}, I would like to enquire about ${name}. Could you share available appointment times?`,
    serviceWithDate: (name, date) => `Hello ${CONFIG.clinicName}, I would like to enquire about ${name}. My preferred appointment date is ${date}.`
  };

  /* 5. BOOKING API (integration point) -------------------- */
  // Replace the body of submit() or set CONFIG.bookingEndpoint to connect a real backend.
  // Expected: POST JSON payload -> 2xx response (optionally { ref: "..." }).
  const BookingAPI = {
    async submit(payload) {
      if (CONFIG.bookingEndpoint) {
        const res = await fetch(CONFIG.bookingEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Booking service returned ' + res.status);
        const data = await res.json().catch(() => ({}));
        return { mode: 'remote', ref: data.ref || payload.ref };
      }
      await wait(700); // simulates network latency in demo mode
      return { mode: 'local', ref: payload.ref, savedLocally: Store.add(payload) };
    }
  };

  /* 6. NAVIGATION, SCROLL, REVEAL ------------------------- */
  function initNav() {
    const header = $('.site-header');
    const toggle = $('#menu-toggle');
    const menu = $('#nav-menu');
    const scrim = $('#nav-scrim');
    const toTop = $('#to-top');

    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      scrim.hidden = !open;
      document.body.classList.toggle('no-scroll', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    scrim.addEventListener('click', () => setMenu(false));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
      toTop.hidden = window.scrollY < 700;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));

    // Active section indicator
    const links = $$('a[data-nav]', menu);
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
          const l = map.get(en.target.id);
          if (l) { l.classList.add('active'); l.setAttribute('aria-current', 'true'); }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  let revealIO = null;
  function watchReveals(root = document) {
    const items = $$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('in')); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    items.forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', ((i % 4) * 0.08) + 's');
      revealIO.observe(el);
    });
  }

  /* Overlay manager (modal + lightbox): focus trap, Esc, restore focus */
  const Overlay = {
    current: null, opener: null, onKey: null,
    open(el, opener, onKey) {
      this.close(true);
      this.current = el; this.opener = opener || document.activeElement; this.onKey = onKey || null;
      el.hidden = false; document.body.classList.add('no-scroll');
      const target = $('[data-autofocus]', el) || $('button:not([data-close])', el) || $('[data-close]', el);
      setTimeout(() => target && target.focus(), 30);
    },
    close(silent) {
      if (!this.current) return;
      this.current.hidden = true; document.body.classList.remove('no-scroll');
      const o = this.opener; this.current = null; this.onKey = null;
      if (!silent && o && o.focus) o.focus();
    }
  };
  document.addEventListener('keydown', (e) => {
    if (!Overlay.current) return;
    if (e.key === 'Escape') { e.preventDefault(); Overlay.close(); return; }
    if (Overlay.onKey) Overlay.onKey(e);
    if (e.key === 'Tab') {
      const f = $$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', Overlay.current).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', (e) => { if (Overlay.current && e.target.closest('[data-close]') && Overlay.current.contains(e.target.closest('[data-close]'))) Overlay.close(); });

  /* 7. SERVICES + MODAL ----------------------------------- */
  function renderServices() {
    const grid = $('#service-grid');
    grid.innerHTML = SERVICES.map((s) => `
      <article class="service-card reveal">
        <div class="service-img">
          <img src="${U(s.img, 700)}" alt="${s.name} at the clinic (stock photo)" width="700" height="438" loading="lazy">
          <span class="service-icon"><i data-lucide="${s.icon}" aria-hidden="true"></i></span>
        </div>
        <div class="service-body">
          <h3>${s.name}</h3>
          <p>${s.short}</p>
          <div class="service-actions">
            <button type="button" class="learn" data-learn="${s.id}">Learn more <i data-lucide="arrow-up-right" aria-hidden="true"></i></button>
            <span class="spacer"></span>
            <a class="icon-btn" href="${buildWhatsAppUrl(MSG.service(s.name))}" target="_blank" rel="noopener noreferrer" data-wa-click aria-label="Ask about ${s.name} on WhatsApp"><i data-lucide="message-circle" aria-hidden="true"></i></a>
            <button type="button" class="btn btn-primary btn-sm" data-book="${s.id}">Book</button>
          </div>
        </div>
      </article>`).join('');

    $('#footer-services').innerHTML = SERVICES.slice(0, 7).map((s) => `<li><a href="#treatments" data-learn="${s.id}">${s.name}</a></li>`).join('');

    document.addEventListener('click', (e) => {
      const learn = e.target.closest('[data-learn]');
      if (learn) { e.preventDefault(); openService(learn.dataset.learn, learn); return; }
      const book = e.target.closest('[data-book]');
      if (book) { selectService(book.dataset.book); return; }
      const wa = e.target.closest('[data-wa-click]');
      if (wa) toast('WhatsApp is opening in a new tab. Press Send there to deliver your message.');
    });
  }

  let modalService = null;
  function openService(id, opener) {
    const s = SERVICES.find((x) => x.id === id);
    if (!s) return;
    modalService = s;
    const img = $('#sm-img');
    img.dataset.fallback = ''; img.src = U(s.img, 900); img.alt = `${s.name} (stock photo)`;
    $('#sm-title').textContent = s.name;
    $('#sm-desc').textContent = s.short;
    $('#sm-points').innerHTML = s.points.map((p) => `<li>${p}</li>`).join('');
    Overlay.open($('#service-modal'), opener);
  }
  function initServiceModal() {
    $('#sm-book').addEventListener('click', () => { const id = modalService.id; Overlay.close(true); selectService(id); });
    $('#sm-wa').addEventListener('click', () => openWhatsApp(MSG.service(modalService.name)));
  }

  /* 8. BOOKING FORM --------------------------------------- */
  const form = () => $('#booking-form');
  let isSubmitting = false;
  let lastPayload = null;

  function fillSelects() {
    const sel = $('#b-service');
    sel.innerHTML = '<option value="">Select a treatment</option><option value="consultation">General consultation / not sure yet</option>' +
      SERVICES.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
    updateTimeSlots();
  }
  function updateTimeSlots() {
    const sel = $('#b-time'); const prev = sel.value;
    const dateVal = $('#b-date').value; const now = new Date();
    const isToday = dateVal === toISODate(now);
    sel.innerHTML = '<option value="">Select a time</option>' + CONFIG.timeSlots.map((t) => {
      const past = isToday && t.hour <= now.getHours();
      return `<option value="${t.label}" ${past ? 'disabled' : ''}>${t.label}${past ? ' (passed)' : ''}</option>`;
    }).join('');
    if (prev && !sel.querySelector(`option[value="${prev}"]:disabled`)) sel.value = prev;
  }
  function setDateLimits() {
    const input = $('#b-date'); const today = new Date();
    const max = new Date(today); max.setDate(max.getDate() + CONFIG.maxAdvanceDays);
    input.min = toISODate(today); input.max = toISODate(max);
  }
  const serviceName = (id) => id === 'consultation' ? 'General consultation' : (SERVICES.find((s) => s.id === id) || {}).name || '';

  function setError(inputId, msg) {
    const input = document.getElementById(inputId);
    const wrap = input.closest('.field');
    const err = document.getElementById(inputId + '-err');
    wrap.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
    return !msg;
  }
  function cleanPhone(v) {
    let d = String(v).replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d;
  }
  const validators = {
    name: (v) => !v.trim() ? 'Please enter your full name.' : (/^[\p{L}][\p{L}\s.'-]{1,59}$/u.test(v.trim()) ? '' : 'Please enter a valid name (letters only, 2–60 characters).'),
    phone: (v) => !v.trim() ? 'Please enter your mobile number.' : (/^[6-9]\d{9}$/.test(cleanPhone(v)) ? '' : 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.'),
    email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address or leave it blank.',
    service: (v) => v ? '' : 'Please choose a treatment.',
    date: (v) => {
      if (!v) return 'Please choose a preferred date.';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Please enter a valid date.';
      const today = toISODate(new Date());
      if (v < today) return 'Please choose today or a future date.';
      if (v > $('#b-date').max) return `Please choose a date within the next ${CONFIG.maxAdvanceDays} days.`;
      if (CONFIG.closedWeekdays.includes(parseISODate(v).getDay())) return 'The clinic is closed on Sundays. Please pick another day.';
      return '';
    },
    time: (v) => v ? '' : 'Please choose a time slot.',
    consent: (_, el) => el.checked ? '' : 'Please accept the privacy consent to continue.'
  };
  const fieldMap = { name: 'b-name', phone: 'b-phone', email: 'b-email', service: 'b-service', date: 'b-date', time: 'b-time', consent: 'b-consent' };

  function validateField(key) {
    const el = document.getElementById(fieldMap[key]);
    return setError(fieldMap[key], validators[key](el.value, el));
  }
  function validateBooking() {
    const results = Object.keys(fieldMap).map((k) => [k, validateField(k)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) document.getElementById(fieldMap[firstBad[0]]).focus();
    return !firstBad;
  }

  function buildPayload() {
    const f = form();
    const dateISO = f.date.value;
    const d = new Date();
    let ref;
    const existing = new Set(Store.read().map((r) => r.ref));
    do { ref = `LDS-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; } while (existing.has(ref));
    return {
      ref, createdAt: d.toISOString(),
      name: f.name.value.trim(), phone: '+91' + cleanPhone(f.phone.value), email: f.email.value.trim(),
      serviceId: f.service.value, serviceName: serviceName(f.service.value),
      date: dateISO, dateLabel: formatDate(dateISO), time: f.time.value,
      patientType: f.patientType.value, notes: f.notes.value.trim(),
      status: 'Request only — not confirmed'
    };
  }
  // WhatsApp summary: intentionally omits email/phone (WhatsApp already shows the sender) and asks for no medical details.
  function bookingMessage(p) {
    const lines = [
      `Hello ${CONFIG.clinicName}, I would like to request an appointment.`,
      `Reference: ${p.ref}`, `Name: ${p.name}`, `Treatment: ${p.serviceName}`,
      `Preferred date: ${p.dateLabel}`, `Preferred time: ${p.time}`, `Patient type: ${p.patientType}`
    ];
    if (p.notes) lines.push(`Notes: ${p.notes}`);
    lines.push('Please let me know if this slot is available. Thank you.');
    return lines.join('\n');
  }

  function showSuccess(p, info) {
    lastPayload = p;
    $('#s-ref').textContent = p.ref;
    const rows = [['Name', p.name], ['Mobile', p.phone], ['Email', p.email || '—'], ['Treatment', p.serviceName], ['Date', p.dateLabel], ['Time', p.time], ['Patient', p.patientType], ['Notes', p.notes || '—']];
    const dl = $('#s-summary'); dl.textContent = '';
    rows.forEach(([k, v]) => { const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; row.append(dt, dd); dl.appendChild(row); });
    const h = $('#b-success h3'); const notice = $('#b-success .notice');
    if (info.mode === 'remote') {
      h.textContent = 'Request sent to the clinic';
      notice.innerHTML = '<strong>Not yet confirmed.</strong> The clinic will review your request and contact you to confirm a time.';
    } else {
      h.textContent = info.savedLocally ? 'Request saved in this demo' : 'Request prepared (could not be saved in this browser)';
      notice.innerHTML = '<strong>Not yet confirmed.</strong> This demo stores requests only in your browser' + (info.savedLocally ? '' : ' (and storage is unavailable here)') + '. Clinic staff cannot see it. Send it via WhatsApp so the clinic can review it and confirm a slot.';
    }
    form().hidden = true; const s = $('#b-success'); s.hidden = false; s.focus();
    renderHistory(); icons();
    $('#book').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateBooking()) return;
    isSubmitting = true;
    const btn = $('#b-submit'); btn.classList.add('is-loading'); btn.disabled = true; $('#b-wa').disabled = true;
    btn.querySelector('.btn-label').textContent = 'Submitting…';
    try {
      const p = buildPayload();
      const info = await BookingAPI.submit(p);
      showSuccess(p, info);
      if (info.mode === 'local' && info.savedLocally) toast('Saved in this browser only. Send via WhatsApp to reach the clinic.');
    } catch (err) {
      toast('Sorry, the request could not be submitted. Please try WhatsApp instead.');
    } finally {
      isSubmitting = false; btn.classList.remove('is-loading'); btn.disabled = false; $('#b-wa').disabled = false;
      btn.querySelector('.btn-label').textContent = 'Request Appointment';
    }
  }
  // Direct WhatsApp path: validate, save locally, open WhatsApp synchronously (keeps the click gesture for popup rules).
  function whatsappBooking() {
    if (isSubmitting) return;
    if (!validateBooking()) return;
    isSubmitting = true;
    const p = buildPayload(); p.status = 'Opened in WhatsApp — user must press Send';
    const saved = Store.add(p);
    openWhatsApp(bookingMessage(p));
    showSuccess(p, { mode: 'local', savedLocally: saved });
    isSubmitting = false;
  }

  function selectService(id, note) {
    $('#book').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    resetBookingView();
    if (id) $('#b-service').value = id;
    if (note) { const n = $('#b-notes'); if (!n.value) n.value = note; }
    setError('b-service', '');
    setTimeout(() => $('#b-name').focus({ preventScroll: true }), 500);
  }
  function resetBookingView() { $('#b-success').hidden = true; form().hidden = false; }

  function renderHistory() {
    const list = Store.read(); const ul = $('#history-list');
    $('#history-count').textContent = list.length; ul.textContent = '';
    if (!list.length) { const li = document.createElement('li'); li.textContent = 'No requests saved in this browser yet.'; ul.appendChild(li); return; }
    list.forEach((r) => {
      const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = r.ref;
      const span = document.createElement('span'); span.textContent = ` · ${r.serviceName} · ${r.dateLabel}, ${r.time}`;
      const st = document.createElement('div'); st.textContent = r.status;
      li.append(b, span, st); ul.appendChild(li);
    });
  }

  function initBooking() {
    fillSelects(); setDateLimits(); renderHistory();
    const f = form();
    f.addEventListener('submit', submitBooking);
    $('#b-wa').addEventListener('click', whatsappBooking);
    f.addEventListener('blur', (e) => { const k = Object.keys(fieldMap).find((x) => fieldMap[x] === e.target.id); if (k && (e.target.value || e.target.dataset.touched)) validateField(k); e.target.dataset.touched = '1'; }, true);
    f.addEventListener('input', (e) => { const k = Object.keys(fieldMap).find((x) => fieldMap[x] === e.target.id); if (k && e.target.closest('.field').classList.contains('invalid')) validateField(k); });
    f.addEventListener('change', (e) => { const k = Object.keys(fieldMap).find((x) => fieldMap[x] === e.target.id); if (k && e.target.dataset.touched) validateField(k); });
    $('#b-date').addEventListener('change', () => { updateTimeSlots(); });
    $('#s-wa').addEventListener('click', () => lastPayload && openWhatsApp(bookingMessage(lastPayload)));
    $('#s-copy').addEventListener('click', async () => { if (!lastPayload) return; toast(await copyText(bookingMessage(lastPayload)) ? 'Appointment details copied.' : 'Could not copy. Please select and copy manually.'); });
    $('#s-new').addEventListener('click', () => { f.reset(); $$('.field.invalid', f).forEach((w) => w.classList.remove('invalid')); $$('[data-touched]', f).forEach((x) => delete x.dataset.touched); updateTimeSlots(); resetBookingView(); $('#b-name').focus(); });
    $('#history-clear').addEventListener('click', () => { toast(Store.clear() ? 'Saved demo requests cleared.' : 'Could not clear storage.'); renderHistory(); });
    // Keep time slots fresh if the page is left open across hours
    setInterval(updateTimeSlots, 5 * 60 * 1000);
    $$('[data-prefill-note]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); selectService('consultation', a.dataset.prefillNote); }));
  }

  /* 9. GALLERY + LIGHTBOX --------------------------------- */
  let galleryFilter = 'All'; let lbIndex = 0;
  const visibleGallery = () => GALLERY.filter((g) => galleryFilter === 'All' || g.cat === galleryFilter);
  const baMarkup = (g, w) => `<img class="before" src="${U(g.img, w)}" alt="${g.alt} (before view)" width="${w}" height="${Math.round(w * 0.75)}" loading="lazy"><img class="after" src="${U(g.img, w)}" alt="${g.alt} (after view)" width="${w}" height="${Math.round(w * 0.75)}" loading="lazy"><span class="tag b">Before</span><span class="tag a">After</span>`;

  function renderGallery() {
    const cats = ['All', ...new Set(GALLERY.map((g) => g.cat))];
    const bar = $('#gallery-filters');
    bar.innerHTML = cats.map((c) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === galleryFilter}">${c}</button>`).join('');
    bar.onclick = (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      galleryFilter = b.dataset.cat;
      $$('.chip', bar).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === galleryFilter)));
      drawGalleryGrid();
    };
    drawGalleryGrid();
  }
  function drawGalleryGrid() {
    const grid = $('#gallery-grid');
    grid.innerHTML = visibleGallery().map((g, i) => `
      <button type="button" class="g-item" data-i="${i}" aria-label="Open ${g.title} (${g.cat}), illustrative demo image">
        <div class="ba">${baMarkup(g, 600)}</div>
        <span class="g-cap"><strong>${g.title}</strong><span>${g.cat} · Illustrative demo image</span></span>
      </button>`).join('');
    $$('.g-item', grid).forEach((b) => b.addEventListener('click', () => openLightbox(Number(b.dataset.i), b)));
  }
  function drawLightbox() {
    const list = visibleGallery(); const g = list[lbIndex];
    $('#lb-ba').innerHTML = baMarkup(g, 1000);
    $('#lb-caption').innerHTML = `<strong>${g.title}</strong> · ${g.cat} <small>${lbIndex + 1} / ${list.length} · Illustrative demonstration image, not a real patient or verified result.</small>`;
  }
  const lbStep = (d) => { const n = visibleGallery().length; lbIndex = (lbIndex + d + n) % n; drawLightbox(); };
  function openLightbox(i, opener) {
    lbIndex = i; drawLightbox();
    Overlay.open($('#lightbox'), opener, (e) => { if (e.key === 'ArrowLeft') lbStep(-1); if (e.key === 'ArrowRight') lbStep(1); });
  }
  function initLightbox() {
    $('#lb-prev').addEventListener('click', () => lbStep(-1));
    $('#lb-next').addEventListener('click', () => lbStep(1));
    let sx = null; const lb = $('#lightbox');
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbStep(dx > 0 ? -1 : 1); sx = null; }, { passive: true });
  }

  /* 10. TESTIMONIAL CAROUSEL ------------------------------ */
  function initCarousel() {
    const track = $('#carousel-track'); const viewport = $('#carousel-viewport'); const dotsEl = $('#car-dots');
    const star = '<i data-lucide="star" aria-hidden="true"></i>';
    track.innerHTML = TESTIMONIALS.map((t, i) => `
      <div class="t-card" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${TESTIMONIALS.length}">
        <figure class="t-inner" style="margin:0">
          <div class="stars" role="img" aria-label="5 out of 5 stars (sample)">${star.repeat(5)}</div>
          <blockquote>${t.text}</blockquote>
          <figcaption class="t-who"><span class="avatar" aria-hidden="true">${t.name.split(' ').pop().charAt(0)}</span><span><strong>${t.name}</strong><small>${t.meta} · Sample testimonial</small></span></figcaption>
        </figure>
      </div>`).join('');
    let index = 0; let perView = 1;
    const maxIndex = () => Math.max(0, TESTIMONIALS.length - perView);
    const calc = () => { perView = window.innerWidth >= 900 ? 2 : 1; track.style.setProperty('--per-view', perView); index = Math.min(index, maxIndex()); buildDots(); update(); };
    function buildDots() {
      dotsEl.innerHTML = Array.from({ length: maxIndex() + 1 }, (_, i) => `<button type="button" class="dot" role="tab" aria-label="Go to testimonial ${i + 1}" data-i="${i}"></button>`).join('');
    }
    function update() {
      track.style.transform = `translateX(${-index * (100 / perView)}%)`;
      $$('.dot', dotsEl).forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
      $$('.t-card', track).forEach((c, i) => c.setAttribute('aria-hidden', String(i < index || i >= index + perView)));
    }
    const go = (i) => { const m = maxIndex(); index = i > m ? 0 : i < 0 ? m : i; update(); };
    $('#car-prev').addEventListener('click', () => go(index - 1));
    $('#car-next').addEventListener('click', () => go(index + 1));
    dotsEl.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) go(Number(d.dataset.i)); });
    $('#carousel').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(index - 1); if (e.key === 'ArrowRight') go(index + 1); });
    // Pointer / touch swipe
    let startX = null;
    viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; viewport.classList.add('dragging'); });
    const end = (e) => { if (startX === null) return; const dx = e.clientX - startX; if (Math.abs(dx) > 45) go(dx < 0 ? index + 1 : index - 1); startX = null; viewport.classList.remove('dragging'); };
    viewport.addEventListener('pointerup', end); viewport.addEventListener('pointercancel', () => { startX = null; viewport.classList.remove('dragging'); });
    viewport.addEventListener('pointerleave', end);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(calc, 120); });
    calc();
  }

  /* 11. FAQ ACCORDION ------------------------------------- */
  function initFaq() {
    const acc = $('#accordion');
    acc.innerHTML = FAQS.map((f, i) => `
      <div class="acc-item">
        <h3 style="margin:0"><button type="button" class="acc-btn" id="faq-b${i}" aria-expanded="false" aria-controls="faq-p${i}"><span>${f.q}</span><span class="plus" aria-hidden="true"><i data-lucide="plus"></i></span></button></h3>
        <div class="acc-panel" id="faq-p${i}" role="region" aria-labelledby="faq-b${i}"><div><p>${f.a}</p></div></div>
      </div>`).join('');
    const btns = $$('.acc-btn', acc);
    const toggle = (btn, open) => { btn.setAttribute('aria-expanded', String(open)); document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('open', open); };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => { const willOpen = b.getAttribute('aria-expanded') !== 'true'; btns.forEach((x) => toggle(x, false)); toggle(b, willOpen); });
      b.addEventListener('keydown', (e) => {
        const k = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (k !== undefined) { e.preventDefault(); btns[(k + btns.length) % btns.length].focus(); }
      });
    });
    toggle(btns[0], true);
  }

  /* 12. CONTACT FORM -------------------------------------- */
  function initContact() {
    const f = $('#contact-form');
    const rules = {
      'c-name': (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
      'c-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
      'c-phone': (v) => /^[6-9]\d{9}$/.test(cleanPhone(v)) ? '' : 'Enter a valid 10-digit Indian mobile number.',
      'c-subject': (v) => v.trim().length >= 3 ? '' : 'Please add a short subject.',
      'c-message': (v) => v.trim().length >= 10 ? '' : 'Please write a message of at least 10 characters.'
    };
    const check = (id) => setError(id, rules[id](document.getElementById(id).value));
    Object.keys(rules).forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('blur', () => { if (el.value) check(id); });
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('invalid')) check(id); });
    });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = Object.keys(rules).map((id) => [id, check(id)]);
      const bad = results.find(([, ok]) => !ok);
      if (bad) { document.getElementById(bad[0]).focus(); return; }
      const v = (id) => document.getElementById(id).value.trim();
      openWhatsApp([`Hello ${CONFIG.clinicName},`, `Subject: ${v('c-subject')}`, '', v('c-message'), '', `— ${v('c-name')}`, `Mobile: +91${cleanPhone(v('c-phone'))}`, `Email: ${v('c-email')}`].join('\n'));
      f.reset();
    });
  }

  /* 13. INIT ---------------------------------------------- */
  function initStatic() {
    $('#year').textContent = new Date().getFullYear();
    $$('[data-wa]').forEach((a) => {
      a.href = buildWhatsAppUrl(MSG.general); a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.addEventListener('click', () => toast('WhatsApp is opening in a new tab. Press Send there to deliver your message.'));
    });
    $$('[data-phone]').forEach((a) => { a.href = 'tel:+' + normalizePhone(CONFIG.displayPhone); a.textContent = CONFIG.displayPhone; });
    $('#c-address').textContent = CONFIG.address;
    $('#map').src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapQuery)}&output=embed`;
    $('#directions').href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONFIG.mapQuery)}`;
  }

  function init() {
    renderServices(); initServiceModal(); initStatic();
    initNav(); initBooking(); renderGallery(); initLightbox(); initCarousel(); initFaq(); initContact();
    icons(); watchReveals();
    // Re-run icon replacement shortly after load in case the icon CDN finished late.
    window.addEventListener('load', () => { icons(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Exposed for easy testing in the console (e.g. Demo.buildWhatsAppUrl('Hi')).
  window.Demo = { CONFIG, buildWhatsAppUrl, normalizePhone, BookingAPI };
})();