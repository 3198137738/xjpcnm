// XJPCNM 站点交互：导航、产品展示切换、代码示例、价格切换、滚动动画、FAQ、表单
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero 背景：两侧升起的波浪线曲面，中间凹陷，带蓝紫色渐变
  const canvas = $('#waves');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const LINES = 34;
    let w = 0, h = 0, t = 0, running = false, raf = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const c = w / 2;
      const base = Math.min(h * 0.55, 720);
      const rise = Math.min(h * 0.32, 440);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.3, 'rgba(120,140,255,0.9)');
      grad.addColorStop(0.5, 'rgba(160,120,255,0.25)');
      grad.addColorStop(0.7, 'rgba(120,140,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0.9)');
      ctx.strokeStyle = grad;
      for (let i = 0; i < LINES; i++) {
        const k = i / (LINES - 1);
        ctx.globalAlpha = 0.05 + 0.22 * Math.pow(1 - Math.abs(k - 0.35), 3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 8) {
          const d = Math.abs(x - c) / c;
          const env = Math.pow(d, 2.2);
          const y = base + k * 220 * (0.4 + 0.6 * d)
            - rise * env * (1 - k * 0.55)
            + Math.sin(x * 0.0045 + t * 0.6 + k * 4) * 16 * env
            + Math.sin(x * 0.011 - t * 0.4 + k * 2) * 5 * env;
          x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 0.012;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    addEventListener('resize', () => { resize(); draw(); });
    if (!reduceMotion) {
      // 仅在 Hero 可见时动画，节省性能
      new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (running) loop();
      }).observe(canvas);
    }
  }

  // 导航：滚动阴影 + 下滑隐藏 / 上滑显示
  const nav = $('#nav');
  const links = $('#navLinks');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 20);
    nav.classList.toggle('hidden', y > 400 && y > lastY && !links.classList.contains('open'));
    lastY = y;
  }, { passive: true });

  // 移动端菜单
  const menuBtn = $('#menuBtn');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  // 通用 tab 组：点击 + 左右方向键切换
  const tabGroup = (tabs, onSelect) => {
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onSelect(tab);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) select(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    return select;
  };

  // 产品展示切换（仅首页）
  const segTabs = $$('.seg [role=tab]');
  const ind = $('.seg-ind');
  const stage = $('.stage');
  if (stage) {
  const urls = { one: 'app.xjpcnm.com/one', flow: 'app.xjpcnm.com/flow/triage-tickets', cloud: 'console.xjpcnm.com/gateway' };
  const moveInd = (tab) => {
    ind.style.width = `${tab.offsetWidth}px`;
    ind.style.transform = `translateX(${tab.offsetLeft - 4}px)`;
  };
  let userPicked = false;
  const selectSeg = tabGroup(segTabs, (tab) => {
    const key = tab.dataset.tab;
    moveInd(tab);
    stage.dataset.active = key;
    $('#appUrl').textContent = urls[key];
    $$('.panel', stage).forEach((p) => (p.hidden = p.id !== `pv-${key}`));
  });
  segTabs.forEach((t) => t.addEventListener('click', () => (userPicked = true)));
  moveInd(segTabs[0]);
  addEventListener('resize', () => moveInd($('.seg [aria-selected=true]')));

  // 未手动切换前，自动轮播（仅在可见时）
  if (!reduceMotion) {
    let visible = false;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 }).observe(stage);
    const timer = setInterval(() => {
      if (userPicked) return clearInterval(timer);
      if (!visible || document.hidden) return;
      const i = segTabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      selectSeg(segTabs[(i + 1) % segTabs.length]);
    }, 6000);
  }
  }

  // 柱状图依次生长的延迟
  $$('.bars i').forEach((bar, i) => bar.style.setProperty('--i', i));

  // 代码示例切换 + 复制
  const codeTabs = $$('.code-tabs [role=tab]');
  tabGroup(codeTabs, (tab) => {
    $$('.code-body').forEach((b) => (b.hidden = b.dataset.lang !== tab.dataset.code));
  });
  const copyBtn = $('#copyBtn');
  copyBtn?.addEventListener('click', async () => {
    const code = $('.code-body:not([hidden])').innerText;
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = 'Copied';
    } catch {
      copyBtn.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1600);
  });

  // 价格：月付 / 年付
  const billBtns = $$('.toggle button');
  billBtns.forEach((btn) => btn.addEventListener('click', () => {
    const mode = btn.dataset.bill;
    billBtns.forEach((b) => b.classList.toggle('on', b === btn));
    $$('[data-monthly]').forEach((el) => (el.textContent = el.dataset[mode]));
  }));

  // 进入视口时显示
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    // 同一网格内的元素错开出现
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  // 法律页面目录：高亮当前阅读的章节
  const tocLinks = $$('.toc a');
  if (tocLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.toggle('on', a.hash === `#${e.target.id}`));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    tocLinks.forEach((a) => { const s = $(a.hash); if (s) spy.observe(s); });
  }

  // FAQ：一次只展开一个
  const faqs = $$('.faq-list details');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
  }));

  // 联系表单（前端校验，暂未接入后端）
  const form = $('#contactForm');
  const msg = $('#formMsg');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    const products = $$('input[name=product]:checked', form);
    let ok = true;
    [name, email].forEach((f) => {
      const valid = f.value.trim() && f.checkValidity();
      f.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok || !products.length) {
      msg.className = 'form-msg err';
      msg.textContent = !ok ? 'Please enter your name and a valid work email.' : 'Please select at least one area of interest.';
      return;
    }
    msg.className = 'form-msg';
    msg.textContent = `Thanks, ${name.value.trim()}. Our team will reach out within one business day.`;
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
