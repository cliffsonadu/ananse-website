/* ── ANANSÉ CREATIVE HAUS — main.js ── */

document.addEventListener('DOMContentLoaded', () => {

  /* Pointer-driven custom cursor is meaningless on touch devices, and the
     matching CSS restores the native cursor there. Gate the JS on the same
     query so we don't attach listeners we can't honour. */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── CURSOR ── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && finePointer && !reducedMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
    const hovers = 'button, a, .wcard, .svc-item, .brand-slot, .ghost-link, .filter-btn, .team-card, .proc-item, .gallery-item, .masonry-item';
    document.querySelectorAll(hovers).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
    });
  } else if (dot && ring) {
    dot.remove();
    ring.remove();
  }

  /* ── NAV SCROLL ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MOBILE NAV DRAWER ── */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    const focusables = () => drawer.querySelectorAll('a[href]');

    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        const first = focusables()[0];
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    drawer.addEventListener('click', e => { if (e.target.tagName === 'A') setOpen(false); });

    document.addEventListener('keydown', e => {
      if (!drawer.classList.contains('open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      /* Keep tab focus inside the drawer while it covers the page. */
      if (e.key === 'Tab') {
        const items = [toggle, ...focusables()];
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });

    /* Resizing past the breakpoint must not strand the page in nav-open state. */
    window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
      if (e.matches && drawer.classList.contains('open')) setOpen(false);
    });
  }

  /* ── ACTIVE NAV LINK ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ── SCROLL REVEAL ── */
  const revealables = document.querySelectorAll('.rv');
  if (reducedMotion) {
    revealables.forEach(el => el.classList.add('on'));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealables.forEach(el => obs.observe(el));
  }


  /* ── MASONRY ──
     Balances tiles of differing native heights into columns, shortest-column
     first, so nothing has to be cropped to a common shape. Ratios come from
     each image's width/height attributes, so no layout waits on a download. */
  document.querySelectorAll('.masonry').forEach(grid => {
    const tiles = [...grid.children];
    if (!tiles.length) return;

    const ratioOf = el => {
      const img = el.querySelector('img');
      const w = +(img && img.getAttribute('width'));
      const h = +(img && img.getAttribute('height'));
      return (w && h) ? h / w : 1.5;        /* height per unit width */
    };
    const ratios = tiles.map(ratioOf);

    const colCount = () =>
      window.innerWidth <= 560 ? 1 : window.innerWidth <= 900 ? 2 : 3;

    let current = 0;
    const layout = () => {
      const n = colCount();
      if (n === current) return;
      current = n;

      grid.classList.add('is-columns');
      grid.textContent = '';
      const cols = [];
      const heights = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'masonry-col';
        grid.appendChild(c);
        cols.push(c);
      }
      tiles.forEach((tile, i) => {
        const shortest = heights.indexOf(Math.min(...heights));
        cols[shortest].appendChild(tile);
        heights[shortest] += ratios[i];
      });
    };

    layout();
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(layout, 180);
    });

    /* Filter buttons hide tiles; rebalance so no column is left hanging. */
    grid.addEventListener('masonry:refresh', () => { current = 0; layout(); });
  });

  /* ── FOOTER YEAR ── */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ── GALLERY FILTER ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        const cat = btn.dataset.filter;
        galleryItems.forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.style.opacity = '0';
          item.style.transform = 'translateY(16px)';
          setTimeout(() => {
            item.style.display = show ? 'block' : 'none';
            if (show) {
              requestAnimationFrame(() => {
                item.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              });
            }
            const grid = item.closest('.masonry');
            if (grid) grid.dispatchEvent(new Event('masonry:refresh'));
          }, reducedMotion ? 0 : 200);
        });
      });
    });
  }

  /* ── CONTACT FORM ── */
  const CONTACT_EMAIL = 'info@ananse.agency';
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = n => {
        const f = form.querySelector(`[name="${n}"]`);
        return f ? f.value.trim() : '';
      };
      const name    = val('name');
      const email   = val('email');
      const company = val('company');
      const type    = val('type');
      const budget  = val('budget');
      const message = val('message');

      const missing = [];
      if (!name)    missing.push('name');
      if (!email)   missing.push('email');
      if (!message) missing.push('message');

      form.querySelectorAll('[name]').forEach(f => f.removeAttribute('aria-invalid'));
      if (missing.length) {
        missing.forEach(n => {
          const f = form.querySelector(`[name="${n}"]`);
          if (f) f.setAttribute('aria-invalid', 'true');
        });
        showFormMsg('Please fill in your name, email, and a short message.', 'error');
        const first = form.querySelector(`[name="${missing[0]}"]`);
        if (first) first.focus();
        return;
      }
      /* Cheap format check — the field is type=email but the form is novalidate. */
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        const f = form.querySelector('[name="email"]');
        if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); }
        showFormMsg('That email address does not look right.', 'error');
        return;
      }

      const subject = encodeURIComponent(`New Project Enquiry — ${company || name}`);
      const body    = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Company: ${company || '—'}\n` +
        `Project Type: ${type || '—'}\n` +
        `Budget: ${budget || '—'}\n\n` +
        `Message:\n${message}`
      );

      showFormMsg('Opening your email client…', 'success');
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

      /* A mailto: handoff fails silently when no mail client is registered —
         common on desktop Chrome. If we're still here and visible, say so
         rather than leaving a false "sent" impression. */
      setTimeout(() => {
        if (!document.hidden) {
          showFormMsg(
            `If your email client didn't open, write to ${CONTACT_EMAIL} directly — ` +
            `your message is ready to copy from the field above.`,
            'error'
          );
        }
      }, 2000);
    });
  }

  function showFormMsg(msg, type) {
    const target = document.getElementById('contact-form');
    if (!target) return;
    let el = document.getElementById('form-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'form-msg';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      target.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'form-msg ' + type;
  }

});
