(function(){
  const STORE_URLS={
    ios:'https://apps.apple.com/es/app/entrenoapp/id6749792687',
    android:'https://play.google.com/store/apps/details?id=com.lipastudios.entrenoapp',
    web:'/app',
    youtube:'https://www.youtube.com/@entrenoapp'
  };
  function eventName(el){
    if(el.dataset.growthEvent)return el.dataset.growthEvent;
    const href=el.getAttribute('href')||'';
    if(href.includes('apps.apple.com'))return'app_store_click';
    if(href.includes('play.google.com'))return'google_play_click';
    if(href.includes('youtube.com')||href.includes('youtu.be'))return'youtube_click';
    if(href==='/app'||href==='/app.html'||href.includes('/app'))return'web_app_click';
    return'cta_click';
  }
  function source(el){
    return el.dataset.growthSource||document.body?.dataset?.page||location.pathname;
  }
  window.EntrenoGrowth={
    track(name,params={}){
      try{if(typeof gtag==='function')gtag('event',name,{event_category:'growth',...params});}catch(e){}
    },
    urls:STORE_URLS
  };
  document.addEventListener('click',function(e){
    const el=e.target.closest?.('a[data-growth],button[data-growth]');
    if(!el)return;
    window.EntrenoGrowth.track(eventName(el),{
      source:source(el),
      label:(el.dataset.growthLabel||el.textContent||'').trim().slice(0,80),
      destination:el.getAttribute('href')||el.dataset.href||''
    });
  },{capture:true});
})();
