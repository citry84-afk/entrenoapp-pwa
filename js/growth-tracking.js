(function(){
  const ANALYTICS_ENDPOINT='/api/analytics/event';
  const ANALYTICS_VERSION='2.2.0';
  const QA=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.hostname.endsWith('.netlify.app')||new URLSearchParams(location.search).get('qa')==='1';
  const CAMPAIGN_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
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
  function safeToken(value){
    return String(value||'').trim().replace(/[^a-zA-Z0-9_.:$-]/g,'_').slice(0,64)||'unknown';
  }
  function acquisition(){
    const query=new URLSearchParams(location.search);
    let referrer='direct';
    try{if(document.referrer)referrer=new URL(document.referrer).hostname.replace(/^www\./,'');}catch(e){}
    return{
      acquisition_source:safeToken(query.get('utm_source')||query.get('source')||referrer),
      acquisition_medium:safeToken(query.get('utm_medium')||'organic_web'),
      acquisition_campaign:safeToken(query.get('utm_campaign')||'site_growth')
    };
  }
  function firstParty(name,dimensions={}){
    if(QA)return;
    const body={event:name,dimensions:{platform:'web',app_version:ANALYTICS_VERSION,language:safeToken(document.documentElement.lang||'es'),...acquisition(),...dimensions}};
    try{fetch(ANALYTICS_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});}catch(e){}
  }
  function decorateInternalLink(el,growthSource){
    const href=el.getAttribute('href')||'';
    try{
      const url=new URL(href,location.href);
      if(url.origin!==location.origin||!/^https?:$/.test(url.protocol)||!href||href.startsWith('#'))return;
      const query=new URLSearchParams(location.search);
      CAMPAIGN_KEYS.forEach(key=>{
        if(!url.searchParams.has(key)&&query.has(key))url.searchParams.set(key,query.get(key));
      });
      if(/^\/app(?:\.html)?\/?$/.test(url.pathname)){
        const campaign=acquisition();
        if(!url.searchParams.has('utm_source'))url.searchParams.set('utm_source',campaign.acquisition_source);
        if(!url.searchParams.has('utm_medium'))url.searchParams.set('utm_medium',campaign.acquisition_medium);
        if(!url.searchParams.has('utm_campaign'))url.searchParams.set('utm_campaign',campaign.acquisition_campaign);
        url.searchParams.set('cta_source',safeToken(growthSource));
      }
      el.href=`${url.pathname}${url.search}${url.hash}`;
    }catch(e){}
  }
  window.EntrenoGrowth={
    track(name,params={}){
      if(QA)return;
      try{if(typeof gtag==='function')gtag('event',name,{event_category:'growth',...params});}catch(e){}
    },
    urls:STORE_URLS
  };
  firstParty('marketing_page_view',{interaction_source:safeToken(document.body?.dataset?.page||location.pathname)});
  document.addEventListener('click',function(e){
    const el=e.target.closest?.('a[data-growth],button[data-growth]');
    if(!el)return;
    const growthEvent=eventName(el),growthSource=source(el);
    decorateInternalLink(el,growthSource);
    window.EntrenoGrowth.track(growthEvent,{
      interaction_source:safeToken(growthSource),
      label:(el.dataset.growthLabel||el.textContent||'').trim().slice(0,80),
      destination:el.getAttribute('href')||el.dataset.href||''
    });
    firstParty('marketing_cta_click',{interaction_source:safeToken(growthSource),feature:safeToken(growthEvent)});
  },{capture:true});
})();
