/* Academy uses native GV preferences and one explicit catalog reset. No content depends on motion. */
(()=>{
  const root=document.documentElement,theme=document.querySelector('#academy-theme');
  const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  const apply=value=>{root.dataset.theme=value==='light'?'light':'dark';theme.setAttribute('aria-label',root.dataset.theme==='dark'?'Activar tema claro':'Activar tema oscuro');theme.setAttribute('aria-pressed',String(root.dataset.theme==='light'));};
  apply(read('gv-cc-theme'));
  theme.addEventListener('click',()=>{apply(root.dataset.theme==='dark'?'light':'dark');try{localStorage.setItem('gv-cc-theme',root.dataset.theme);}catch{}});
  addEventListener('storage',event=>{if(event.key==='gv-cc-theme')apply(event.newValue);});
  const menu=document.querySelector('#academy-menu'),navigation=document.querySelector('#academy-navigation');
  function closeMenu(){navigation.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
  menu.addEventListener('click',()=>{const open=navigation.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
  navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('click',event=>{if(!event.target.closest('.academy-topbar'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('is-open')){closeMenu();menu.focus();}});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),top=document.querySelector('#academy-top');
  top.addEventListener('click',()=>scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
  const visibility=()=>{top.hidden=scrollY<600;};addEventListener('scroll',visibility,{passive:true});visibility();
  const hero=document.querySelector('.academy-hero');let frame=0;
  hero.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch'||frame)return;
    const x=event.clientX,y=event.clientY;
    frame=requestAnimationFrame(()=>{const b=hero.getBoundingClientRect();hero.style.setProperty('--light-x',(x-b.left)/b.width*100+'%');hero.style.setProperty('--light-y',(y-b.top)/b.height*100+'%');frame=0;});
  });
})();
