/* Loads components/header.html and components/footer.html into every page.
   Mark a spot with <div data-include="header"></div>. Pages inside /pages/ set <body data-root="../">.
   Works with a web server (reads components/*.html live) and by double-click (uses assets/js/components.js, made by build.js). */
(function () {
  var cfg = window.AARNA_CONFIG || {};
  var root = document.body.getAttribute('data-root') || '';
  var vars = { root: root, siteName: cfg.siteName || '', brandWord: cfg.brandWord || cfg.siteName || '', email: cfg.email || '', callout: cfg.callout || '', year: new Date().getFullYear() };
  function fill(t) { return t.replace(/\{\{(\w+)\}\}/g, function (m, k) { return k in vars ? vars[k] : m; }); }
  var slots = [].slice.call(document.querySelectorAll('[data-include]'));
  var bundle = window.AARNA_COMPONENTS || {};
  function load(name) {
    /* Opened by double-click (file://): browsers block fetch(), so use the copy bundled in components.js */
    if (location.protocol === 'file:' && bundle[name]) { return Promise.resolve(bundle[name]); }
    return fetch(root + 'components/' + name + '.html')
      .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); })
      .catch(function (e) { if (bundle[name]) { return bundle[name]; } throw e; });
  }
  window.AA_READY = Promise.all(slots.map(function (slot) {
    return load(slot.getAttribute('data-include')).then(function (html) { slot.outerHTML = fill(html); });
  })).then(function () {
    var here = location.pathname.replace(/\/index\.html$/, '/');
    [].forEach.call(document.querySelectorAll('.aa-nav__links a, .aa-footer__links a'), function (a) {
      var p = a.pathname.replace(/\/index\.html$/, '/');
      if (!a.hash && p === here) { a.setAttribute('aria-current', 'page'); a.parentNode.classList.add('current-menu-item'); }
    });
    [].forEach.call(document.querySelectorAll('[data-cfg-email]'), function (a) { a.textContent = cfg.email; a.href = 'mailto:' + cfg.email; });
  }).catch(function () {
    var n = document.createElement('div'); n.className = 'aa-setup-note';
    n.textContent = 'Header and footer could not load. Run "node build.js" to refresh assets/js/components.js (see README.md).';
    document.body.appendChild(n);
  });
})();
