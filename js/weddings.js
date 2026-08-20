/* ── ANANSÉ WEDDINGS ──
   The wedding pages carry their own nav (mark centred, inverting over the
   hero), so they wire that themselves rather than reusing .nav from the dark
   site. main.js still handles the cursor, scroll reveal, footer year and the
   enquiry form — this file only adds what is specific to these pages. */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV ── */
  const nav = document.getElementById('wed-nav');
  if (nav) {
    /* Invert once the nav has left the hero image, not at a fixed offset —
       the hero is 100vh on the landing page and 76vh on a project page. */
    const hero = document.querySelector('.wed-hero, .wed-proj-hero');
    const trigger = () => (hero ? hero.offsetHeight - nav.offsetHeight - 8 : 40);
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > trigger());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ── MOBILE DRAWER ── */
  const toggle = document.getElementById('wed-toggle');
  const drawer = document.getElementById('wed-drawer');
  if (toggle && drawer) {
    const links = () => drawer.querySelectorAll('a[href]');
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('nav-open', open);
      if (open) { const f = links()[0]; if (f) f.focus(); } else { toggle.focus(); }
    };
    toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    drawer.addEventListener('click', e => { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', e => {
      if (!drawer.classList.contains('open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Tab') {
        const items = [toggle, ...links()];
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
      if (e.matches && drawer.classList.contains('open')) setOpen(false);
    });
  }

  /* ── LIGHTBOX ── project galleries only ── */
  const lb = document.getElementById('wed-lb');
  const tiles = [...document.querySelectorAll('.wed-tile')];
  if (lb && tiles.length) {
    const img     = lb.querySelector('img');
    const counter = lb.querySelector('.wed-lb-count');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0, lastFocus = null;

    /* Each tile knows its own full-size source and dimensions, so the
       lightbox never has to guess a shape or crop anything. */
    const show = i => {
      current = (i + tiles.length) % tiles.length;
      const t = tiles[current];
      img.src    = t.dataset.full;
      img.alt    = t.dataset.alt || '';
      img.width  = t.dataset.w;
      img.height = t.dataset.h;
      counter.textContent = `${current + 1} / ${tiles.length}`;
    };
    const open = i => {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('active');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      lb.querySelector('.wed-lb-close').focus();
    };
    const close = () => {
      lb.classList.remove('active');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      setTimeout(() => { img.src = ''; }, reduced ? 0 : 250);
      if (lastFocus) lastFocus.focus();
    };

    tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
    lb.querySelector('.wed-lb-close').addEventListener('click', close);
    lb.querySelector('.wed-lb-prev').addEventListener('click', () => show(current - 1));
    lb.querySelector('.wed-lb-next').addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        /* Keep focus inside the lightbox while it covers the page. */
        const f = [...lb.querySelectorAll('button')];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

});
