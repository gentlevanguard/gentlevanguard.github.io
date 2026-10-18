(() => {
  'use strict';
  // Progressive enhancement: the anchored disclosure remains usable without JS.
  const privacy = document.querySelector('#privacidad');
  if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
    const dialog = document.createElement('dialog');
    dialog.className = 'gv-dialog';
    dialog.setAttribute('aria-labelledby','privacy-dialog-title');
    dialog.innerHTML = '<div class="gv-dialog-heading"><h2 id="privacy-dialog-title"></h2><button class="gv-btn gv-btn-secondary" type="button" data-i18n="privacyClose" autofocus>Cerrar</button></div>';
    const title = privacy.querySelector('summary');
    const heading = dialog.querySelector('h2');
    heading.dataset.i18n = title.dataset.i18n;
    heading.textContent = title.textContent;
    dialog.append(privacy.querySelector('p'));
    privacy.replaceChildren(dialog);
    privacy.classList.add('privacy-enhanced');
    const trigger = document.querySelector('.privacy-link');
    trigger.setAttribute('aria-haspopup','dialog');
    function openPrivacy() {
      if (!dialog.open) { dialog.showModal(); document.documentElement.classList.add('gv-modal-open'); }
    }
    trigger.addEventListener('click', event => { event.preventDefault(); openPrivacy(); });
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    let backdropPress = false;
    const outside = event => { const rect=dialog.getBoundingClientRect(); return event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom; };
    dialog.addEventListener('pointerdown', event => { backdropPress=outside(event); });
    dialog.addEventListener('click', event => { if (backdropPress && outside(event)) dialog.close(); backdropPress=false; });
    dialog.addEventListener('close', () => { document.documentElement.classList.remove('gv-modal-open'); trigger.focus({preventScroll:true}); });
    window.addEventListener('hashchange', () => { if (location.hash === '#privacidad') openPrivacy(); });
    if (location.hash === '#privacidad') openPrivacy();
  }
  const elements = [...document.querySelectorAll('[data-i18n]')];
  const spanish = Object.fromEntries(elements.map(el => [el.dataset.i18n, el.innerHTML]));
  Object.assign(spanish, {languageLabel:'Idioma',themeLabel:'Cambiar tema',menuLabel:'Alternar navegación',navLabel:'Navegación principal',openedWa:'Se abrirá WhatsApp con tu mensaje. Revisalo y envialo allí.',openedEmail:'Se abrirá tu aplicación de correo con el mensaje. Revisalo y envialo allí.',messageIntro:'¡Hola GentleVanguard! Quiero conversar sobre un proyecto.',messageName:'Nombre',messageCompany:'Organización',messageInterest:'Interés',emailSubject:'Consulta para GentleVanguard'});
  Object.assign(spanish, {siteTitle:document.title,metaDescription:document.querySelector('meta[name="description"]').content,ogDescription:document.querySelector('meta[property="og:description"]').content,opEntries:'Puntos de entrada',langHint:'Elegí el idioma del sitio'});
  const copy = () => document.documentElement.lang === 'es' ? spanish : window.GV_COPY[document.documentElement.lang];
  spanish.messageSource = 'Referencia de campaña';
  const nav = document.querySelector('#navigation');
  const menu = document.querySelector('#menu');
  function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); }
  function translate() {
    const lang = document.documentElement.lang;
    elements.forEach(el => {
      if (lang === 'es') el.innerHTML = spanish[el.dataset.i18n];
      else el.textContent = copy()[el.dataset.i18n];
    });
    [['#language','languageLabel'],['#theme','themeLabel'],['#menu','menuLabel'],['#navigation','navLabel'],['.service-tabs','navServices'],['.op-inputs','opEntries']].forEach(([selector,key]) => document.querySelector(selector).setAttribute('aria-label',copy()[key]));
    document.querySelector('.language-control').title = copy().langHint;
    document.title = copy().siteTitle;
    document.querySelector('meta[name="description"]').content = copy().metaDescription;
    document.querySelector('meta[property="og:title"]').content = copy().siteTitle;
    document.querySelector('meta[property="og:description"]').content = copy().ogDescription;
    document.querySelector('meta[property="og:locale"]').content = {es:'es_AR',en:'en_US',pt:'pt_BR'}[lang];
    document.querySelector('link[rel="manifest"]').href = lang === 'es' ? 'manifest.webmanifest' : `manifest.${lang}.webmanifest`;
    document.querySelector('#form-status').textContent = '';
    closeMenu();
  }
  window.addEventListener('gv-language', translate);
  translate();
  menu.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded',String(open)); });
  nav.addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.gv-topbar')) closeMenu(); });
  document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => { document.querySelector('#interest').value = link.dataset.interest; }));
  document.querySelector('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const params = new URLSearchParams(location.search);
    const campaign = ['utm_source','utm_campaign','utm_content'].map(key => params.get(key) || '').filter(value => /^[a-z0-9_-]{1,80}$/i.test(value)).join(' / ');
    const text = [copy().messageIntro, `${copy().messageName}: ${fields.get('name').trim()}`, fields.get('company').trim() ? `${copy().messageCompany}: ${fields.get('company').trim()}` : '', `${copy().messageInterest}: ${form.elements.interest.selectedOptions[0].textContent}`, campaign ? `${copy().messageSource}: ${campaign}` : '', '', fields.get('message').trim()].filter(line => line !== '').join('\n');
    if (event.submitter?.value === 'email') {
      document.querySelector('#form-status').textContent = copy().openedEmail;
      window.location.href = `mailto:gentlevanguard@gmail.com?subject=${encodeURIComponent(copy().emailSubject)}&body=${encodeURIComponent(text)}`;
    } else {
      document.querySelector('#form-status').textContent = copy().openedWa;
      window.open(`https://wa.me/5492645452221?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  });
})();
