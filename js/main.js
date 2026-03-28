/* ── ANANSÉ CREATIVE HAUS — main.js ── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CURSOR ── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring) {
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
    const hovers = 'button, a, .wcard, .svc-item, .brand-slot, .ghost-link, .filter-btn, .team-card, .proc-item';
    document.querySelectorAll(hovers).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
    });
  }

  /* ── NAV SCROLL ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── ACTIVE NAV LINK ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── SCROLL REVEAL ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));

  /* ── GALLERY FILTER ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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
          }, 200);
        });
      });
    });
  }

  /* ── CONTACT FORM ── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.querySelector('[name="name"]').value.trim();
      const email   = form.querySelector('[name="email"]').value.trim();
      const company = form.querySelector('[name="company"]').value.trim();
      const type    = form.querySelector('[name="type"]').value;
      const message = form.querySelector('[name="message"]').value.trim();
      if (!name || !email || !message) {
        showFormMsg('Please fill in all required fields.', 'error');
        return;
      }
      const subject = encodeURIComponent(`New Project Enquiry — ${company || name}`);
      const body    = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nProject Type: ${type}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:info@ananse.agency?subject=${subject}&body=${body}`;
      showFormMsg('Opening your email client... We look forward to hearing from you.', 'success');
    });
  }

  function showFormMsg(msg, type) {
    let el = document.getElementById('form-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'form-msg';
      document.getElementById('contact-form').appendChild(el);
    }
    el.textContent = msg;
    el.className = 'form-msg ' + type;
  }

  /* ── HERO SCROLL INDICATOR ── */
  const scrollBar = document.querySelector('.scroll-bar-line');
  if (scrollBar) {
    scrollBar.style.animation = 'scrollLine 2s 2.5s infinite';
  }

});
