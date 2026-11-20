/* Jardinerías Mitre — interacciones */
(() => {
  const doc = document.documentElement;
  doc.classList.remove('no-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------------------------------------------------------
     Intro con el logo
     --------------------------------------------------------------- */
  const reveal = () => doc.classList.add('is-loaded');
  const intro = $('.intro');

  if (intro && doc.classList.contains('intro-on')) {
    try { sessionStorage.setItem('mitre-intro', '1'); } catch (e) {}

    // Partimos la marca en letras para que suban una a una
    $$('.intro__word', intro).forEach((word) => {
      const text = word.textContent;
      word.textContent = '';
      [...text].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        word.appendChild(s);
      });
    });
    $$('.intro .ch').forEach((c, i) => c.style.setProperty('--i', i));

    // Contador de años 1963 → año actual
    const yearEl = $('.intro__year b', intro);
    const from = 1963;
    const to = new Date().getFullYear();
    let t0;
    const count = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / 1300, 1);
      const e = 1 - Math.pow(1 - p, 4);
      yearEl.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(count);
    };

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      intro.classList.add('out');
      setTimeout(reveal, 520);
      setTimeout(() => { doc.classList.remove('intro-on'); intro.remove(); }, 1700);
    };

    requestAnimationFrame(() => {
      intro.classList.add('play');
      setTimeout(() => requestAnimationFrame(count), 1150);
    });
    setTimeout(finish, 3300);
    intro.addEventListener('click', finish);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); }, { once: true });
  } else {
    intro && intro.remove();
    doc.classList.remove('intro-on');
    requestAnimationFrame(() => requestAnimationFrame(reveal));
  }

  /* ---------------------------------------------------------------
     Cabecera: ocultar al bajar, mostrar al subir
     --------------------------------------------------------------- */
  const header = $('.header');
  const fab = $('.fab');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      if (!doc.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 400 && y > lastY);
    }
    fab && fab.classList.toggle('on', y > window.innerHeight * .6);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú móvil */
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => {
    const open = doc.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.mmenu a').forEach((a) => a.addEventListener('click', () => {
    doc.classList.remove('menu-open');
    burger && burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------------------------------------------------------
     Revelado al entrar en pantalla
     --------------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .05 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* ---------------------------------------------------------------
     Manifiesto: palabra a palabra según el scroll
     --------------------------------------------------------------- */
  const mani = $('.manifesto__text');
  let words = [];
  if (mani) {
    const split = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'svg') {
          split(n);
        }
      });
    };
    split(mani);
    words = $$('.w', mani);
  }

  /* ---------------------------------------------------------------
     Parallax ligero
     --------------------------------------------------------------- */
  const para = $$('[data-speed]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    if (!reduce) {
      para.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * parseFloat(el.dataset.speed)).toFixed(1)}px, 0)`;
      });
    }
    if (words.length) {
      const r = mani.getBoundingClientRect();
      const p = Math.min(Math.max((vh * .85 - r.top) / (r.height + vh * .2), 0), 1);
      const n = Math.round(p * words.length * 1.15);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
      $$('.hl', mani).forEach((h) => h.classList.toggle('on', $('.w', h) && $('.w', h).classList.contains('on')));
    }
  };
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  frame();

  /* ---------------------------------------------------------------
     Servicios: imagen que sigue al cursor
     --------------------------------------------------------------- */
  const cursor = $('.svc-cursor');
  if (cursor && finePointer) {
    const imgs = $$('img', cursor);
    let x = 0, y = 0, cx = 0, cy = 0, raf;
    const loop = () => {
      cx += (x - cx) * .14; cy += (y - cy) * .14;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    $$('.svc').forEach((row, i) => {
      row.addEventListener('mouseenter', (e) => {
        if (!cursor.classList.contains('on')) { cx = x = e.clientX; cy = y = e.clientY; }
        imgs.forEach((im, j) => im.classList.toggle('on', i === j));
        cursor.classList.add('on');
        cancelAnimationFrame(raf); loop();
      });
      row.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
      row.addEventListener('mouseleave', () => { cursor.classList.remove('on'); setTimeout(() => { if (!cursor.classList.contains('on')) cancelAnimationFrame(raf); }, 600); });
    });
  }

  /* ---------------------------------------------------------------
     Método: imagen fija que cambia con cada paso
     --------------------------------------------------------------- */
  const steps = $$('.step');
  if (steps.length) {
    const frames = $$('.method__frame img');
    const bars = $$('.method__progress i');
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = steps.indexOf(e.target);
        steps.forEach((s, j) => s.classList.toggle('on', j === i));
        frames.forEach((f, j) => f.classList.toggle('on', j === i));
        bars.forEach((b, j) => b.classList.toggle('on', j <= i));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
  }

  /* ---------------------------------------------------------------
     Galería: filtros + visor
     --------------------------------------------------------------- */
  const gallery = $('.gallery');
  if (gallery) {
    const items = $$('.g-item', gallery);
    $$('.filters button').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.filters button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
        const f = btn.dataset.filter;
        items.forEach((it) => {
          const show = f === 'all' || it.dataset.cat === f;
          it.classList.toggle('is-out', !show);
          if (show) { it.classList.remove('in'); requestAnimationFrame(() => it.classList.add('in')); }
        });
      });
    });

    const lb = $('.lightbox');
    if (lb && lb.showModal) {
      const lbImg = $('.lb-stage img', lb);
      const lbTitle = $('.lb-bottom strong', lb);
      const lbCount = $('.lb-count', lb);
      let idx = 0;
      const visible = () => items.filter((it) => !it.classList.contains('is-out'));
      const show = (i) => {
        const list = visible();
        idx = (i + list.length) % list.length;
        const it = list[idx];
        const img = $('img', it);
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
        lbTitle.textContent = $('strong', it).textContent;
        lbCount.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
      };
      items.forEach((it) => {
        it.tabIndex = 0;
        const open = () => { show(visible().indexOf(it)); lb.showModal(); };
        it.addEventListener('click', open);
        it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      });
      $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
      $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
      $('.lb-close', lb).addEventListener('click', () => lb.close());
      lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-stage')) lb.close(); });
      lb.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
      });
      let sx = 0;
      lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      });
    }
  }

  /* ---------------------------------------------------------------
     Formulario → correo
     --------------------------------------------------------------- */
  $$('.field input, .field textarea, .field select').forEach((f) => {
    const upd = () => f.parentElement.classList.toggle('filled', !!f.value);
    f.addEventListener('input', upd); f.addEventListener('change', upd); upd();
  });
  const form = $('.form');
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = `Consulta web — ${d.get('servicio') || 'Información'}`;
    const body = [
      `Nombre: ${d.get('nombre') || ''}`,
      `Teléfono: ${d.get('telefono') || ''}`,
      `Servicio: ${d.get('servicio') || ''}`,
      '',
      d.get('mensaje') || ''
    ].join('\n');
    window.location.href = `mailto:info@jardineriasmitre.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* Año en el pie */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
