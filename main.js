/* עו"ד לאון סברדלוב, עמוד הבית: תנועה והתנהגות · design-dna motion + GSAP (חבילה מאושרת 6.9.2026) */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('js');
  var qa = /[?&]qa=1/.test(location.search);
  if (qa) html.classList.add('qa');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || qa;
  var hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof DrawSVGPlugin !== 'undefined') gsap.registerPlugin(DrawSVGPlugin);
  }

  /* ---- שנה בפוטר ---- */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* ---- header ---- */
  var header = document.getElementById('siteHeader');
  var innerPage = document.body.classList.contains('inner-page');
  function onScroll() { header.classList.toggle('is-solid', innerPage || window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- reveal (IO + keyframes) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- hero: הסימן נמשך בקו + כניסת התוכן בטיימליין ---- */
  var heroEls = document.querySelectorAll('[data-hero-el]');
  var markPaths = document.querySelectorAll('#heroMark path');
  if (hasGsap && !reduced && heroEls.length) {
    gsap.set(heroEls, { autoAlpha: 0, y: 34 });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (typeof DrawSVGPlugin !== 'undefined' && markPaths.length) {
      gsap.set(markPaths, { drawSVG: '0%' });
      tl.to(markPaths, { drawSVG: '100%', duration: 1.7, ease: 'power2.inOut', stagger: 0.25 }, 0);
    }
    tl.to(heroEls, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12 }, 0.35);
  }

  /* ---- G17 (זוג): שני המסלולים נכנסים מהצדדים בסקראב ---- */
  var lanes = document.querySelectorAll('.lane');
  if (hasGsap && !reduced && lanes.length) {
    var mmLanes = gsap.matchMedia();
    mmLanes.add('(min-width: 768px)', function () {
      var st = { trigger: '#laneRow', start: 'top 85%', end: 'top 45%', scrub: 1 };
      /* RTL: הכרטיס הראשון יושב מימין ונכנס מימין (x חיובי) */
      gsap.from('[data-lane="right"]', { x: '22vw', rotate: -3, autoAlpha: 0, scrollTrigger: st });
      gsap.from('[data-lane="left"]',  { x: '-22vw', rotate: 3, autoAlpha: 0, scrollTrigger: st });
    });
    mmLanes.add('(max-width: 767px)', function () {
      lanes.forEach(function (el) {
        gsap.from(el, { y: 40, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 70%', scrub: 1 } });
      });
    });
  }

  /* ---- G13: batch reveal לתחומי העיסוק ---- */
  var batch = document.querySelectorAll('.batch-card');
  if (hasGsap && !reduced && batch.length) {
    gsap.set(batch, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(batch, {
      start: 'top 88%', once: true,
      onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }); }
    });
  }

  /* ---- G4ב: כותרת שירות הדגל מתבהרת מילה-מילה (פיצול ידני, בלי SplitText) ---- */
  function splitWords(el) {
    if (!el || el.querySelector('.w')) return el ? el.querySelectorAll('.w') : [];
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.textContent = w; el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.w');
  }
  var flagH2 = document.getElementById('flagH2');
  if (hasGsap && !reduced && flagH2) {
    var ws = splitWords(flagH2);
    gsap.from(ws, { opacity: 0.18, stagger: 0.35, ease: 'none',
      scrollTrigger: { trigger: flagH2, start: 'top 85%', end: 'top 45%', scrub: 1 } });
  }

  /* ---- B18: קו התהליך שמתמלא בגלילה ---- */
  var wrap = document.getElementById('processWrap');
  var fill = document.getElementById('processFill');
  var steps = document.querySelectorAll('.process-step');
  function paintRail() {
    if (!wrap || !fill) return;
    var vh = window.innerHeight;
    if (reduced) { fill.style.height = '100%'; steps.forEach(function (s) { s.classList.add('is-active'); }); return; }
    var r = wrap.getBoundingClientRect();
    var progress = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / r.height));
    fill.style.height = (progress * 100) + '%';
    steps.forEach(function (s) { s.classList.toggle('is-active', s.getBoundingClientRect().top < vh * 0.72); });
  }
  window.addEventListener('scroll', paintRail, { passive: true });
  window.addEventListener('resize', paintRail);
  paintRail();

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  /* ---- טופס: ולידציה בסיסית + מצב הצלחה (חיווט לשליחה אמיתית בשלב Lovable) ---- */
  var formBox = document.getElementById('contactForm');
  if (formBox) {
    var form = formBox.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.style.borderColor = bad ? '#E07A7A' : '';
        if (bad) ok = false;
      });
      if (!ok) return;
      formBox.classList.add('is-sent');
      formBox.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---- B3: בר דביק חכם (מובייל): מופיע רק כשאף CTA ראשי ולא הפוטר על המסך ---- */
  var bar = document.getElementById('stickyBar');
  if (bar && 'IntersectionObserver' in window) {
    var watched = Array.prototype.slice.call(document.querySelectorAll('[data-primary-cta], #siteFooter, #contact'));
    var visible = new Set();
    var ioBar = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
      var on = visible.size === 0 && window.scrollY > 200;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    }, { rootMargin: '-72px 0px -72px 0px' });
    watched.forEach(function (el) { ioBar.observe(el); });
  }

  /* ---- ScrollTrigger refresh אחרי טעינה ---- */
  if (hasGsap && !reduced) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('load', function () { ScrollTrigger.refresh(); paintRail(); });
  }

  /* ---- ?debug=1: סריקת גלישה אופקית ---- */
  if (/[?&]debug=1/.test(location.search)) {
    window.addEventListener('load', function () {
      var bad = [];
      document.querySelectorAll('body *').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > window.innerWidth + 1)) bad.push(el.tagName + '.' + el.className);
      });
      document.body.setAttribute('data-overflow', bad.slice(0, 20).join(' | ') || 'none');
    });
  }
})();
