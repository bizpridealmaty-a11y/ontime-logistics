(function(){
  /* ── 1. Scroll progress bar (rAF-throttled) ── */
  const bar = document.getElementById('scroll-bar');
  if (bar) {
    let barTicking = false;
    window.addEventListener('scroll', () => {
      if (barTicking) return;
      barTicking = true;
      requestAnimationFrame(() => {
        const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
        bar.style.width = Math.min(pct, 100) + '%';
        barTicking = false;
      });
    }, {passive:true});
  }

  /* ── 2. Cursor glow (desktop only, no hover = no listener) ── */
  const glow = document.getElementById('cursor-glow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, {passive:true});
  } else if (glow) {
    glow.style.display = 'none';
  }

  /* ── 3. Parallax hero video on scroll (only while hero in view) ── */
  const vid = document.querySelector('.hero-video');
  if (vid) {
    let scrollTicking = false;
    let heroVisible = true;
    const onScroll = () => {
      if (!heroVisible || scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        vid.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`;
        scrollTicking = false;
      });
    };
    const heroObs = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
    }, { rootMargin: '200px' });
    const heroSection = vid.closest('.hero') || vid.parentElement;
    if (heroSection) heroObs.observe(heroSection);
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ── 4. Fade-in observer ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade').forEach(f => obs.observe(f));

  /* ── 5. Counter animation for hero stats ── */
  function animateCounter(el, target, suffix) {
    const dur = 1800;
    const start = performance.now();
    el.classList.add('counting');
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(ease * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.classList.remove('counting');
    };
    requestAnimationFrame(tick);
  }
  function initCounters() {
    document.querySelectorAll('.stat-n').forEach(el => {
      const txt = el.textContent.trim();
      const num = parseFloat(txt);
      const suffix = txt.replace(/[\d.]/g,'');
      if (!isNaN(num) && !el.dataset.counted) {
        el.dataset.counted = '1';
        const obs2 = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) { animateCounter(el, num, suffix); obs2.disconnect(); }
        }, {threshold:.5});
        obs2.observe(el);
      }
    });
  }
  initCounters();

  /* ── Loop counters (about section) ── */
  function initLoopCounters() {
    document.querySelectorAll('.info-card[data-from]').forEach(card => {
      if (card.dataset.looping) return;
      card.dataset.looping = '1';
      const from   = parseInt(card.dataset.from);
      const to     = parseInt(card.dataset.to);
      const suffix = card.dataset.suffix || '';
      const valEl  = card.querySelector('.metric-val');
      let cur = from;
      setInterval(() => {
        cur = cur >= to ? from : cur + 1;
        valEl.style.animation = 'none';
        valEl.offsetHeight; // reflow
        valEl.style.animation = 'numTick .35s ease';
        valEl.textContent = cur + suffix;
      }, 2000);
    });
  }
  initLoopCounters();

  /* ── 3D scroll reveal ── */
  function initReveal3D() {
    const obs3 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs3.unobserve(e.target); }
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -20px 0px'});
    document.querySelectorAll('.reveal-3d').forEach(el => {
      if (!el.dataset.r3d) { el.dataset.r3d = '1'; obs3.observe(el); }
    });
  }
  initReveal3D();

  /* ── Page icon parallax float ── */
  function initPageParallax() {
    const icon = document.querySelector('.page-icon');
    if (!icon) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        icon.style.transform = `translateY(${window.scrollY * 0.12}px)`;
        raf = null;
      });
    };
    setTimeout(() => window.addEventListener('scroll', onScroll, {passive: true}), 900);
  }
  initPageParallax();

  /* ── 3D card tilt ── */
  function initTilt() {
    document.querySelectorAll('.card').forEach(card => {
      if (card.dataset.tilt) return;
      card.dataset.tilt = '1';
      const shine = document.createElement('div');
      shine.className = 'card-tilt-shine';
      card.appendChild(shine);
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - .5;
        const y = (e.clientY - r.top)  / r.height - .5;
        card.style.transform = `perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.02)`;
        shine.style.background = `radial-gradient(circle at ${e.clientX-r.left}px ${e.clientY-r.top}px, rgba(255,255,255,.08), transparent 60%)`;
      }, {passive:true});
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        shine.style.background = '';
      });
    });
  }
  initTilt();

  /* ── Magnetic buttons ── */
  function initMagnetic() {
    document.querySelectorAll('.btn-gold,.nav-cta').forEach(btn => {
      if (btn.dataset.mag) return;
      btn.dataset.mag = '1';
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2)  * .25;
        const y = (e.clientY - r.top  - r.height/2) * .25;
        btn.style.transform = `translate(${x}px,${y}px) translateY(-1px)`;
      }, {passive:true});
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
  initMagnetic();

  /* ── Ripple on button click ── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-gold,.nav-cta');
    if (!btn) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    btn.style.position = 'relative';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });

  /* ── Blog TOC auto-generate ── */
  function initBlogTOC() {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;
    const headings = document.querySelectorAll('.article-content h2');
    if (!headings.length) {
      const tocEl = document.getElementById('blog-toc');
      if (tocEl) tocEl.style.display = 'none';
      return;
    }
    tocList.innerHTML = Array.from(headings).map((h, i) => {
      if (!h.id) h.id = 'section-' + i;
      return `<li><a href="#${h.id}" onclick="event.preventDefault();document.getElementById('${h.id}')?.scrollIntoView({behavior:'smooth'})">${h.textContent}</a></li>`;
    }).join('');
  }
  setTimeout(initBlogTOC, 100);

  /* ── FAQ toggle ── */
  document.addEventListener('click', e => {
    const q = e.target.closest('.blog-faq-q');
    if (!q) return;
    const item = q.closest('.blog-faq-item');
    const a = item?.querySelector('.blog-faq-a');
    if (!a) return;
    const isOpen = a.style.display === 'block';
    a.style.display = isOpen ? 'none' : 'block';
    const sign = q.querySelector('span[style]');
    if (sign) sign.textContent = isOpen ? '+' : '−';
  });

  /* ── Nav scroll effect ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) nav.classList.add('solid');
      else nav.classList.add('solid'); // always solid in SSG
    }, {passive:true});
  }

  /* ── Active nav link based on current path ── */
  const path = window.location.pathname;
  document.querySelectorAll('[data-nav-path]').forEach(el => {
    if (el.dataset.navPath && path.startsWith(el.dataset.navPath)) {
      el.classList.add('active');
    }
  });

})();

/* ── Contact Form Submit ── */
async function submitContactForm() {
  const name    = document.getElementById('cf_name')?.value.trim();
  const phone   = document.getElementById('cf_phone')?.value.trim();
  const from    = document.getElementById('cf_from')?.value.trim();
  const to      = document.getElementById('cf_to')?.value.trim();
  const cargo   = document.getElementById('cf_cargo')?.value;
  const weight  = document.getElementById('cf_weight')?.value.trim();
  const comment = document.getElementById('cf_comment')?.value.trim();
  const btn     = document.getElementById('cf_btn');

  let ok = true;
  ['cf_name','cf_phone'].forEach(id => {
    const el = document.getElementById(id);
    if (!el?.value.trim()) { el.style.borderColor = '#c94c4c'; ok = false; }
    else el.style.borderColor = '';
  });
  if (!ok) return;

  btn.disabled = true;
  btn.textContent = 'Отправка...';

  const params = new URLSearchParams();
  params.append('form-name', 'zayavka');
  params.append('name',      name);
  params.append('phone',     phone);
  params.append('from',      from || 'не указано');
  params.append('to',        to   || 'не указано');
  params.append('cargo_type',cargo);
  params.append('weight',    weight || 'не указан');
  params.append('comment',   comment || 'нет');

  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (res.ok) {
      document.getElementById('cf-form').style.display = 'none';
      document.getElementById('cf-success').style.display = 'block';
    } else {
      throw new Error('server');
    }
  } catch(e) {
    btn.disabled = false;
    btn.innerHTML = '⚠ Ошибка — попробуйте ещё раз';
    btn.style.background = '#7a2a2a';
    setTimeout(() => {
      btn.innerHTML = '→ Отправить заявку';
      btn.style.background = '';
    }, 3000);
  }
}
