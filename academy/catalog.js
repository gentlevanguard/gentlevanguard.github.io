/* Progressive catalog navigation and native product preview. All product facts remain in HTML. */
(function(){
  'use strict';
  const columns=()=>innerWidth<600?1:innerWidth<900?2:innerWidth<1200?3:4;
  let filtering=false;
  const grids=[];
  const empty=document.createElement('div');empty.className='catalog-empty';empty.hidden=true;empty.setAttribute('role','status');
  empty.innerHTML='<h2>No encontramos materiales con esos filtros.</h2><p>Probá otro tema o volvé a explorar el catálogo completo.</p><button class="btn btn-ghost" type="button">Limpiar filtros</button>';
  document.querySelector('#filter-bar').after(empty);
  empty.querySelector('button').addEventListener('click',()=>document.querySelector('#filter-clear').click());
  document.querySelectorAll('.product-section .grid').forEach((grid,index)=>{
    const cards=Array.from(grid.children).filter(el=>el.classList.contains('card'));
    if(!cards.length)return;
    grid.id=grid.id||'catalog-grid-'+index;
    const controls=document.createElement('div');controls.className='catalog-navigation';
    const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const buttons=document.createElement('div');buttons.className='catalog-buttons';
    const more=document.createElement('button'),less=document.createElement('button');
    for(const button of [more,less]){button.type='button';button.className='btn btn-ghost';button.setAttribute('aria-controls',grid.id);buttons.append(button);}
    less.textContent='Ver menos';controls.append(status,buttons);grid.after(controls);
    const state={grid,cards,status,more,less,extraRows:0,controls};grids.push(state);
    more.addEventListener('click',()=>{state.extraRows+=2;render(state);});
    less.addEventListener('click',()=>{
      state.extraRows=0;render(state);
      const section=grid.closest('section');section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      section.querySelector('.section-title').setAttribute('tabindex','-1');section.querySelector('.section-title').focus({preventScroll:true});
    });
  });
  function render(state){
    const size=columns(),initial=size===1?3:size*2;
    const limit=filtering?Infinity:initial+size*state.extraRows;
    const matching=state.cards.filter(card=>!card.classList.contains('card-hidden'));
    let seen=0;
    state.cards.forEach(card=>{
      const match=!card.classList.contains('card-hidden');
      card.classList.toggle('card-collapsed',match&&seen>=limit);
      if(match)seen++;
    });
    const shown=Math.min(matching.length,limit),remaining=matching.length-shown;
    state.status.textContent='Mostrando '+shown+' de '+matching.length+' materiales';
    state.more.hidden=filtering||remaining<=0;
    state.less.hidden=filtering||shown<=initial;
    state.more.textContent='Ver '+Math.min(size*2,remaining)+' más';
    state.more.setAttribute('aria-expanded',String(shown>initial));
    state.controls.hidden=matching.length===0;
  }
  function refresh(){grids.forEach(render);empty.hidden=!filtering||grids.some(state=>state.grid.closest('section').id!=='sec-destacados'&&state.cards.some(card=>!card.classList.contains('card-hidden')));}
  document.addEventListener('gv:catalog-filter',event=>{filtering=!!event.detail.active;refresh();});
  let resizing;
  addEventListener('resize',()=>{clearTimeout(resizing);resizing=setTimeout(refresh,120);});
  document.querySelectorAll('.tabbar .tab').forEach(tab=>{
    tab.setAttribute('aria-pressed',String(tab.classList.contains('active')));
    tab.addEventListener('click',()=>queueMicrotask(()=>{
      document.querySelectorAll('.tabbar .tab').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('active'))));
      refresh();
    }));
  });
  refresh();

  if(typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return;
  const dialog=document.createElement('dialog');dialog.className='product-dialog';dialog.setAttribute('aria-labelledby','product-preview-title');
  dialog.innerHTML='<header class="product-dialog-header"><p>GentleVanguard Academy · Contenido del material</p><button class="product-dialog-close" type="button" aria-label="Cerrar detalle"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="product-dialog-layout"></div>';
  document.body.append(dialog);
  let trigger=null;
  const close=()=>dialog.close();
  dialog.querySelector('.product-dialog-close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}});
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('catalog-preview-open');if(trigger&&trigger.isConnected)trigger.focus({preventScroll:true});});
  document.addEventListener('click',event=>{
    const summary=event.target.closest('.product-details>summary');if(!summary)return;
    event.preventDefault();trigger=summary;
    const card=summary.closest('.card'),body=dialog.querySelector('.product-dialog-layout');body.replaceChildren();
    const image=card.querySelector('.card-cover img').cloneNode(true);image.className='product-dialog-cover';image.removeAttribute('loading');body.append(image);
    const content=document.createElement('div');const title=document.createElement('h2');title.id='product-preview-title';title.textContent=card.querySelector('h3').textContent;
    content.append(title,card.querySelector('.details-body').cloneNode(true),card.querySelector('.card-price').cloneNode(true));
    const actions=card.querySelector('.card-actions').cloneNode(true);
    actions.querySelectorAll('a').forEach((anchor,index)=>{
      const original=card.querySelectorAll('.card-actions a')[index];
      if(original.classList.contains('btn-checkout'))anchor.addEventListener('click',event=>{event.preventDefault();close();original.click();});
    });
    content.append(actions);body.append(content);dialog.showModal();document.documentElement.classList.add('catalog-preview-open');
  });
})();
