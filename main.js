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

  /* ---- reveal: 16px / 0.5s, פעם אחת. עם GSAP מקבלים גם קסקדה בתוך קבוצה (G13) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  var revealReady = false;

  function initReveal() {
    if (revealReady || !revealEls.length) return;
    revealReady = true;

    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    if (hasGsap) {
      /* GSAP מנהל את השקיפות והתזוזה, ולכן לא מוסיפים is-in (שמפעיל keyframe מתחרה) */
      gsap.set(revealEls, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(revealEls, {
        start: 'top 98%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out',
            stagger: 0.06, overwrite: true
          });
        }
      });
      ScrollTrigger.refresh();
      /* רשת ביטחון לגלילה מהירה (הערת לאון, 8.9.2026): אם עצרנו ואלמנט שנמצא
         על המסך עדיין שקוף, חושפים אותו מיד במקום להשאיר מסך ריק */
      var idle;
      window.addEventListener('scroll', function () {
        clearTimeout(idle);
        idle = setTimeout(function () {
          var vh = window.innerHeight, late = [];
          revealEls.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0 && +getComputedStyle(el).opacity < 0.9) late.push(el);
          });
          if (late.length) gsap.to(late, { autoAlpha: 1, y: 0, duration: 0.25, overwrite: true });
        }, 120);
      }, { passive: true });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- preloader: הסימן מצטייר, המסך מתרומם, ואז נכנס ההירו ---- */
  var pre = document.getElementById('preloader');
  var heroEls = document.querySelectorAll('[data-hero-el]');
  var heroStarted = false;
  var wmPaths = document.querySelectorAll('.hero-watermark path');
  var canDraw = hasGsap && !reduced && typeof DrawSVGPlugin !== 'undefined' && wmPaths.length;
  if (canDraw) gsap.set(wmPaths, { drawSVG: '0%', fillOpacity: 0, strokeOpacity: 1 });

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    /* ה-reveal מתחיל רק כשהמסך נחשף. אחרת האלמנטים שבמסך הראשון נחשפים מאחורי הפרילודר
       והעמוד נפתח סטטי (נתפס בפועל, 6.9.2026) */
    initReveal();
    /* הסימן ממשיך להצטייר בהירו, כהמשך ישיר של הפרילודר */
    /* הסימן מצטייר כמתאר ואז מתמלא, והמתאר נעלם. אחרת נשארת מסגרת מלבנית מוזרה */
    if (canDraw) gsap.timeline({ delay: 0.15 })
        .to(wmPaths, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut', stagger: 0.2 })
        .to(wmPaths, { fillOpacity: 1, duration: 0.6 }, '-=0.4')
        .to(wmPaths, { strokeOpacity: 0, duration: 0.4 }, '-=0.3');
    if (!hasGsap || reduced || !heroEls.length) return;
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(heroEls, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12 });
  }

  if (hasGsap && !reduced && heroEls.length) gsap.set(heroEls, { autoAlpha: 0, y: 34 });

  if (pre && !reduced && hasGsap) {
    var t0 = Date.now(), preGone = false;
    var preMark = pre.querySelectorAll('path');
    if (typeof DrawSVGPlugin !== 'undefined' && preMark.length) {
      gsap.set(preMark, { drawSVG: '0%', fillOpacity: 0 });
      gsap.timeline()
          .to(preMark, { drawSVG: '100%', duration: 1.05, ease: 'power2.inOut', stagger: 0.16 })
          .to(preMark, { fillOpacity: 1, duration: 0.45, ease: 'power1.out' }, '-=0.25');
    } else if (preMark.length) {
      gsap.set(preMark, { fillOpacity: 1 });
    }
    var hidePre = function () {
      if (preGone) return;
      preGone = true;
      pre.classList.add('is-out');
      startHero();
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
    };
    /* נעלם כשהעמוד באמת נטען, עם מינימום שיספיק לראות את הסימן מצטייר */
    var hideWhenReady = function () { setTimeout(hidePre, Math.max(0, 1500 - (Date.now() - t0))); };
    if (document.readyState === 'complete') hideWhenReady();
    else window.addEventListener('load', hideWhenReady);
    setTimeout(hidePre, 4500); /* גיבוי: לא נתקעים אם load מתעכב */
  } else {
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    startHero();
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
  var splitHeads = document.querySelectorAll('.split-words');
  if (hasGsap && !reduced && splitHeads.length) {
    splitHeads.forEach(function (h) {
      var ws = splitWords(h);
      if (!ws.length) return;
      gsap.from(ws, { opacity: 0.18, stagger: 0.35, ease: 'none',
        scrollTrigger: { trigger: h, start: 'top 85%', end: 'top 45%', scrub: 1 } });
    });
  }

  /* ---- G2: תמונות נצבעות מלמטה למעלה בקצב הגלילה (מסכת גרדיאנט) ---- */
  var paints = document.querySelectorAll('.paint');
  if (hasGsap && !reduced && paints.length) {
    paints.forEach(function (el) {
      var st = { val: 0 };
      el.style.setProperty('--reveal', '0%');
      gsap.to(st, {
        val: 100, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 38%', scrub: 0.6 },
        onUpdate: function () { el.style.setProperty('--reveal', st.val + '%'); }
      });
    });
  }

  /* ---- פרלקס עדין בהירו: הרקע והווטרמרק בהפרש מהירות. דסקטופ בלבד ---- */
  if (hasGsap && !reduced) {
    var mmHero = gsap.matchMedia();
    mmHero.add('(min-width: 768px)', function () {
      var stHero = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.set('.hero', { '--hero-y': '55%' });
      gsap.to('.hero', { '--hero-y': '46%', ease: 'none', scrollTrigger: stHero });
      gsap.to('.hero-watermark', { y: 80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
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

  /* ---- ?scroll=N: קופץ למיקום גלילה. שער QA לצילומי מסך אוטומטיים ---- */
  var scrollTo = /[?&]scroll=(\d+)/.exec(location.search);
  if (scrollTo) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('load', function () {
      /* הזזת מרג'ין ולא גלילה: צילום מסך headless אחרי scroll מחזיר פריים ריק */
      document.body.style.marginTop = '-' + (+scrollTo[1]) + 'px';
      if (hasGsap) ScrollTrigger.refresh();
    });
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
