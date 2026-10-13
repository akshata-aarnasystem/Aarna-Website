/* Aarna Systems - menu, scroll effects and animations (vanilla JS, no dependencies).
   Runs after include.js has loaded the shared header and footer. */
function aaInit() {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var inEditor = d.body.classList.contains('elementor-editor-active') || d.body.classList.contains('elementor-editor-preview') || /[?&]elementor-preview=/.test(location.search);
  if (reduce || inEditor) { root.classList.add('aa-static'); }
  var live = !(reduce || inEditor);
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- header ---------- */
  var header = $('[data-aa-header]');
  var burger = $('[data-aa-burger]'), panel = $('[data-aa-navpanel]');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open); panel.classList.toggle('is-open', open);
    });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); panel.classList.remove('is-open'); }); });
  }

  /* ---------- scroll progress ---------- */
  var bar = d.createElement('div'); bar.className = 'aa-progress'; d.body.appendChild(bar);

  /* ---------- counters (section: trust, hero, engine, case) ---------- */
  function fmt(el, v) {
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    el.textContent = (el.getAttribute('data-prefix') || '') + v.toFixed(dec) + (el.getAttribute('data-suffix') || '');
  }
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1800;
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      fmt(el, to * e); if (p < 1) requestAnimationFrame(step); else fmt(el, to);
    }
    requestAnimationFrame(step);
  }

  /* ---------- prepare text effects ---------- */
  $$('[data-lines],.aa-h-hero').forEach(function (h) {
    $$('.aa-mask', h).forEach(function (m, i) { m.style.setProperty('--m', i); });
  });
  var scrubEl = $('[data-scrub]'), words = [];
  if (scrubEl && live) {
    var txt = scrubEl.textContent.trim().split(/\s+/);
    scrubEl.setAttribute('aria-label', scrubEl.textContent.trim());
    scrubEl.innerHTML = txt.map(function (w) { return '<span class="aa-w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    words = $$('.aa-w', scrubEl);
  }
  var wm = $('[data-letters]');
  if (wm) {
    var label = wm.textContent.trim(); wm.innerHTML = '';
    label.split('').forEach(function (ch, i) {
      var s = d.createElement('span'); s.className = 'aa-letter'; s.style.setProperty('--l', i);
      s.textContent = ch === ' ' ? '\u00a0' : ch; s.setAttribute('aria-hidden', 'true'); wm.appendChild(s);
    });
  }
  $$('[data-stagger]').forEach(function (p) { $$('[data-r]', p).forEach(function (c, i) { c.style.setProperty('--i', i); }); });

  /* ---------- reveal observer ---------- */
  function reveal(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    $$('[data-count]', el).forEach(count);
    if (el.hasAttribute('data-count')) count(el);
    if (el.hasAttribute('data-r')) setTimeout(function () { el.classList.add('is-done'); }, 2200);
  }
  var targets = $$('[data-r],[data-lines],[data-letters],[data-count]').filter(function (t) { return !(t.hasAttribute('data-count') && !t.hasAttribute('data-r') && t.parentNode.closest('[data-r]')); });
  if (live && 'IntersectionObserver' in window) {
    /* clip-path hides an element from IntersectionObserver, so clipped items are watched through their parent */
    var map = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { (map.get(e.target) || []).forEach(reveal); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) {
      if (t.closest('[data-aa-hero]')) return;
      var r = t.getAttribute('data-r'), o = (r === 'clip' || r === 'clip-up') ? t.parentNode : t;
      if (!map.has(o)) { map.set(o, []); io.observe(o); }
      map.get(o).push(t);
    });
  } else { targets.forEach(function (t) { t.classList.add('is-in'); }); }
  /* Fail-safe: content must never remain hidden if an observer is interrupted or a browser extension blocks it. */
  if (live) {
    window.setTimeout(function () {
      targets.forEach(function (t) {
        if (!t.classList.contains('is-in')) {
          t.classList.add('is-in');
          $$('[data-count]', t).forEach(count);
          if (t.hasAttribute('data-count')) count(t);
        }
      });
    }, 2600);
  }

  /* ---------- hero intro (one orchestrated page-load moment) ---------- */
  var hero = $('[data-aa-hero]');
  function intro() {
    root.classList.add('aa-ready');
    if (hero) { hero.classList.add('is-in'); $$('[data-count]', hero).forEach(function (c) { setTimeout(function () { count(c); }, 1200); }); }
  }
  if (live) {
    d.documentElement.classList.add('aa-js');
    if (d.fonts && d.fonts.ready) {
      Promise.race([Promise.resolve(d.fonts.ready).catch(function () {}), new Promise(function (r) { setTimeout(r, 900); })])
        .then(intro).catch(intro);
    } else { intro(); }
  } else { intro(); }

  /* ---------- hero: signal matrix wave ---------- */
  var matrix = $('[data-matrix]');
  if (matrix) {
    var lime = [0, 5, 10, 15, 20];
    for (var i = 0; i < 24; i++) {
      var dot = d.createElement('i'); if (lime.indexOf(i) > -1) dot.className = 'on';
      dot.style.setProperty('--wd', (((i % 10) + Math.floor(i / 10)) * 0.12) + 's'); matrix.appendChild(dot);
    }
  }

  /* ---------- hero: generative growth filaments on canvas ---------- */
  var cv = $('[data-growth-canvas]');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, mx = 0, my = 0, tx = 0, ty = 0, vis = true, fil = [], seed = 7, raf = 0;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    function size() {
      var r = cv.getBoundingClientRect(), small = window.matchMedia('(max-width: 640px)').matches;
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 7; fil = [];
      for (var k = 0; k < (small ? 10 : 16); k++) fil.push({ a: rnd() * 0.5 + 0.1, s: rnd() * 0.8 + 0.4, o: rnd() * 6, w: rnd() * 1.4 + 0.3, hue: rnd() });
      schedule();
    }
    function curve(f, time) {
      var x0 = W * (0.12 + f.a * 0.25), y0 = H * 1.02;
      var x1 = W * (0.62 + f.a * 0.35), y1 = H * (0.06 + f.a * 0.18);
      var sw = Math.sin(time * 0.0006 * f.s + f.o) * W * 0.08;
      return { x0: x0, y0: y0, x1: x1, y1: y1, c1x: x0 + W * 0.05 + sw, c1y: H * 0.62, c2x: x1 - W * 0.28 - sw * 0.5, c2y: H * 0.38 };
    }
    function pt(c, t) {
      var u = 1 - t;
      return [u * u * u * c.x0 + 3 * u * u * t * c.c1x + 3 * u * t * t * c.c2x + t * t * t * c.x1, u * u * u * c.y0 + 3 * u * u * t * c.c1y + 3 * u * t * t * c.c2y + t * t * t * c.y1];
    }
    function schedule() {
      if (live && vis && !d.hidden && !raf) raf = requestAnimationFrame(frame);
    }
    function frame(time) {
      raf = 0;
      if (!vis || d.hidden || !W || !fil.length) return;
      tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      var curves = fil.map(function (f) { return curve(f, time); });
      ctx.clearRect(0, 0, W, H); ctx.save(); ctx.translate(tx * 16, ty * 12);
      /* ribbon */
      var g = ctx.createLinearGradient(0, H, W, 0); g.addColorStop(0, 'rgba(120,87,255,0)'); g.addColorStop(0.5, 'rgba(120,87,255,.20)'); g.addColorStop(1, 'rgba(185,255,61,.30)');
      ctx.beginPath(); var n = 30, i, p;
      for (i = 0; i <= n; i++) { p = pt(curves[0], i / n); ctx[i ? 'lineTo' : 'moveTo'](p[0] - 34 * (i / n), p[1]); }
      for (i = n; i >= 0; i--) { p = pt(curves[5], i / n); ctx.lineTo(p[0] + 60 * (i / n), p[1]); }
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      /* filaments */
      ctx.lineCap = 'round';
      for (var k = 0; k < fil.length; k++) {
        var f = fil[k], c = curves[k]; ctx.beginPath();
        for (i = 0; i <= 32; i++) { p = pt(c, i / 32); ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }
        ctx.strokeStyle = f.hue > 0.82 ? 'rgba(90,220,255,.45)' : f.hue > 0.6 ? 'rgba(150,120,255,.5)' : 'rgba(185,255,61,' + (0.25 + f.w * 0.25) + ')';
        ctx.lineWidth = f.w; ctx.shadowColor = 'rgba(185,255,61,.7)'; ctx.shadowBlur = 4; ctx.stroke();
        /* travelling pulse */
        var t = ((time * 0.00006 * f.s + f.o) % 1); p = pt(c, t);
        ctx.shadowBlur = 16; ctx.fillStyle = '#B9FF3D'; ctx.beginPath(); ctx.arc(p[0], p[1], 1.6 + f.w, 0, 6.283); ctx.fill();
      }
      ctx.restore(); schedule();
    }
    size(); window.addEventListener('resize', size);
    var stage = cv.parentNode;
    stage.addEventListener('mousemove', function (e) { var r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });
    stage.addEventListener('mouseleave', function () { mx = my = 0; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; schedule(); }).observe(cv);
    d.addEventListener('visibilitychange', schedule);
    if (live) schedule(); else { vis = false; ctx.clearRect(0, 0, W, H); }
  }

  /* ---------- magnetic buttons ---------- */
  if (live && window.matchMedia('(pointer:fine)').matches) {
    $$('.aa-magnetic').forEach(function (el) {
      var bounds;
      el.addEventListener('mouseenter', function () { bounds = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - bounds.left - bounds.width / 2) * 0.22 + 'px,' + (e.clientY - bounds.top - bounds.height / 2) * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; bounds = null; });
    });
    /* tilt chips (problem section) */
    $$('[data-tilt]').forEach(function (el) {
      var bounds;
      el.addEventListener('mouseenter', function () { bounds = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', function (e) {
        if (!el.classList.contains('is-done')) return;
        if (!bounds) bounds = el.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width - 0.5, y = (e.clientY - bounds.top) / bounds.height - 0.5;
        el.style.transform = 'perspective(800px) rotateY(' + x * 12 + 'deg) rotateX(' + -y * 12 + 'deg) translateZ(0)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; bounds = null; });
    });
    /* spotlight cards (services section) */
    $$('[data-spot]').forEach(function (el) {
      var bounds;
      el.addEventListener('mouseenter', function () { bounds = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - bounds.left) + 'px'); el.style.setProperty('--my', (e.clientY - bounds.top) + 'px');
      });
      el.addEventListener('mouseleave', function () { bounds = null; });
    });
  }

  /* ---------- engine: cycling stages synced with mantra ---------- */
  var eng = $('[data-engine]');
  if (eng && live) {
    var stages = $$('[data-stage]', eng), mant = $$('.aa-mantra__item', eng), cur = 0, timer, running = false;
    var setActive = function (n) {
      cur = n; stages.forEach(function (s, i) { s.classList.toggle('is-active', i === n); }); mant.forEach(function (m, i) { m.classList.toggle('is-on', i <= n); });
    };
    stages.forEach(function (s, i) { s.addEventListener('mouseenter', function () { setActive(i); }); });
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !running) { running = true; setActive(0); timer = setInterval(function () { setActive((cur + 1) % stages.length); }, 2200); }
      else if (!e[0].isIntersecting && running) { running = false; clearInterval(timer); }
    }, { threshold: 0.35 }).observe(eng);
  }

  /* ---------- scroll driven: progress bar, scrub words, parallax ---------- */
  var par = $$('[data-parallax]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var st = window.pageYOffset, max = d.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--sp', max > 0 ? st / max : 0);
    if (header) header.classList.toggle('is-scrolled', st > 20);
    if (!live) return;
    var vh = window.innerHeight;
    if (words.length) {
      var r = scrubEl.getBoundingClientRect(), p = clamp((vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.6), 0, 1), lit = p * words.length;
      words.forEach(function (w, i) { w.style.opacity = clamp(0.18 + (lit - i) * 0.9, 0.18, 1); });
    }
    par.forEach(function (el) {
      var r = el.getBoundingClientRect(); var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      el.style.setProperty('--ps', (1.22 - p * 0.18).toFixed(3));
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll); onScroll();

  /* ---------- contact form: posts to config.formEndpoint, or opens the visitor's email app ---------- */
  $$('[data-aa-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var cfg = window.AARNA_CONFIG || {}, st = $('[data-aa-status]', f), fd = new FormData(f);
      if (cfg.formEndpoint) {
        st.textContent = 'Sending...';
        fetch(cfg.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) { throw new Error('bad'); } st.textContent = 'Thanks. We will reply within one working day.'; f.reset(); })
          .catch(function () { st.textContent = 'Something went wrong. Please email ' + cfg.email + ' instead.'; });
      } else {
        var body = ['Name: ' + fd.get('name'), 'Email: ' + fd.get('email'), 'Company: ' + (fd.get('company') || '-'), 'Service: ' + fd.get('service'), '', fd.get('message')].join('\n');
        location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Project enquiry from ' + fd.get('name')) + '&body=' + encodeURIComponent(body);
        st.textContent = 'Opening your email app...';
      }
    });
  });
}
(window.AA_READY || Promise.resolve()).then(aaInit);
