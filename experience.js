// Cinematic composition: a bounded focal sequence and explicit motion control.
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('.motion-toggle');
  const svg = document.querySelector('.hero-signature svg');
  const backTop = document.querySelector('.back-to-top');
  let paused = reduced.matches;
  function updateMotion() {
    root.dataset.motion = paused || reduced.matches ? 'paused' : document.hidden ? 'suspended' : 'playing';
    motion.setAttribute('aria-pressed', String(paused || reduced.matches));
    const key = reduced.matches ? 'reducedMotion' : paused ? 'resumeMotion' : 'pauseMotion';
    const spanish = {pauseMotion:'Pausar movimiento',resumeMotion:'Activar movimiento',reducedMotion:'Movimiento reducido'};
    motion.textContent = root.lang === 'es' ? spanish[key] : window.GV_COPY[root.lang][key];
    motion.disabled = reduced.matches;
    if (root.dataset.motion === 'playing' && !document.querySelector('.hero').classList.contains('motion-outside')) svg?.unpauseAnimations?.();
    else svg?.pauseAnimations?.();
  }
  motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  reduced.addEventListener('change', updateMotion);
  window.addEventListener('gv-language', updateMotion);
  updateMotion();

  const tabs = [...document.querySelectorAll('.service-tab')];
  const panels = [...document.querySelectorAll('.service-row')];
  let active = 'software';
  function selectService(name, focus = false) {
    active = name;
    document.querySelector('.service-explorer').dataset.active = name;
    tabs.forEach(tab => {
      const selected = tab.dataset.service === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach(panel => {
      const selected = panel.id === `panel-${name}`;
      panel.hidden = !selected;
      if (selected && !reduced.matches) panel.animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:280,easing:'cubic-bezier(0.19, 1, 0.22, 1)'});
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab.dataset.service));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); selectService(tabs[target].dataset.service, true); }
    });
  });
  selectService(active);
  const frame = document.querySelector('.service-panels');
  // Pause moving artwork outside the viewport; no RAF loop or GPU-heavy runtime.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('motion-outside', !entry.isIntersecting);
      if (entry.target.matches('.hero')) updateMotion();
      if (entry.target.matches('.steps li') && entry.isIntersecting) entry.target.classList.add('is-active');
    });
  }, {threshold:.08});
  document.querySelectorAll('.hero,.connections,.steps li').forEach(el => observer.observe(el));
  if (frame) observer.observe(frame);
  const links = [...document.querySelectorAll('#navigation a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => links.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }));
  }, {rootMargin:'-15% 0px -60% 0px'});
  links.forEach(link => { const target=document.querySelector(link.hash); if(target)sectionObserver.observe(target); });
  let scheduled = false;
  function progress() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const scrollable = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--page-progress', String(scrollable > 0 ? window.scrollY / scrollable : 0));
      backTop.hidden = window.scrollY < window.innerHeight * .6;
      scheduled = false;
    });
  }
  window.addEventListener('scroll', progress, {passive:true});
  window.addEventListener('resize', progress);
  progress();
  backTop.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.gv-topbar .gv-brand').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:reduced.matches ? 'instant' : 'smooth'});
  });
  function translatedControls() {
    backTop.setAttribute('aria-label', root.lang === 'es' ? 'Volver arriba' : window.GV_COPY[root.lang].backTop);
    // One SVG icon vocabulary for actions, including translated labels.
    document.querySelectorAll('a,button').forEach(control => {
      const last = control.lastChild;
      const glyph = last?.textContent?.trim().slice(-1);
      if (!['↗','→'].includes(glyph)) return;
      if (last.nodeType === Node.TEXT_NODE) last.textContent = last.textContent.replace(/[↗→]\s*$/, '').trimEnd();
      else if (last instanceof HTMLElement && last.getAttribute('aria-hidden') === 'true') last.textContent = '';
      else return;
      const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('class','ui-icon'); icon.setAttribute('viewBox','0 0 24 24'); icon.setAttribute('aria-hidden','true');
      icon.innerHTML = `<path d="${glyph === '↗' ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'}"/>`;
      control.appendChild(icon);
    });
  }
  translatedControls();
  window.addEventListener('gv-language', translatedControls);
  function themeIcon() {
    const light = root.dataset.theme === 'light';
    document.querySelector('#theme svg').innerHTML = light ? '<path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
  }
  themeIcon(); window.addEventListener('gv-theme', themeIcon);
  const precise = matchMedia('(hover:hover) and (pointer:fine)');
  let pointerFrame = false;
  document.addEventListener('pointermove', event => {
    if (!precise.matches || reduced.matches || root.dataset.motion !== 'playing' || pointerFrame) return;
    const card = event.target.closest('.spotlight-card');
    const hero = event.target.closest('.hero');
    if (!card && !hero) return;
    pointerFrame = true;
    requestAnimationFrame(() => {
      const target = card || hero, rect = target.getBoundingClientRect();
      const x = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
      const y = Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
      target.style.setProperty('--mx',`${x*100}%`); target.style.setProperty('--my',`${y*100}%`);
      if (card?.matches('.service-aside')) { card.style.setProperty('--scene-rx',`${(y-.5)*-5}deg`); card.style.setProperty('--scene-ry',`${(x-.5)*7}deg`); }
      if (hero) { hero.style.setProperty('--hero-x',`${(x-.5)*8}px`); hero.style.setProperty('--hero-y',`${(y-.5)*6}px`); }
      pointerFrame = false;
    });
  },{passive:true});
  document.addEventListener('pointerout', event => {
    const target = event.target.closest('.service-aside,.hero');
    if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
    ['--scene-rx','--scene-ry','--hero-x','--hero-y'].forEach(key=>target.style.removeProperty(key));
  });
  const questions = [...document.querySelectorAll('.faq details')];
  document.addEventListener('click', event => {
    const selected = event.target.closest('.faq summary')?.closest('details');
    questions.forEach(question => { if (question !== selected) question.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') questions.forEach(question => { question.open = false; });
  });
  const operation = document.querySelector('.operation-network');
  const entries = [...operation.querySelectorAll('[data-entry]')];
  function selectEntry(name) {
    operation.dataset.entry = name;
    entries.forEach(entry => entry.setAttribute('aria-pressed',String(entry.dataset.entry === name)));
    operation.querySelectorAll('[data-op-description]').forEach(description => { description.hidden = description.dataset.opDescription !== name; });
  }
  entries.forEach((entry, index) => {
    entry.addEventListener('click', () => selectEntry(entry.dataset.entry));
    entry.addEventListener('keydown', event => {
      let next;
      if (['ArrowDown','ArrowRight'].includes(event.key)) next=(index+1)%entries.length;
      if (['ArrowUp','ArrowLeft'].includes(event.key)) next=(index-1+entries.length)%entries.length;
      if (next !== undefined) { event.preventDefault(); entries[next].focus(); selectEntry(entries[next].dataset.entry); }
    });
  });
})();
