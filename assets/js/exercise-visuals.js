/* Presentation-only exercise guidance. Never writes the plan, workout rows or history. */
let exerciseVisualSequence=0;
const exerciseVisualStates=new Map();

function exerciseVisualEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function exerciseVisualLanguage(){return typeof currentLang==='function'&&currentLang()==='en'?'en':'es';}
function exerciseVisualReducedMotion(){try{return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(error){return false;}}
function exerciseVisualSafeAsset(file){return typeof file==='string'&&/^[a-z0-9][a-z0-9-]*-[1-3]\.png$/.test(file)?`assets/exercise-media/${file}`:'';}
function exerciseVisualSafeGeneratedAsset(file){return typeof file==='string'&&file.length<=180&&/^generated\/[a-z0-9][a-z0-9-]*-v[1-9][0-9]*\.(?:webp|png)$/.test(file)?`assets/exercise-media/${file}`:'';}
function exerciseVisualSafeGeneratedFallback(file,primary){return typeof file==='string'&&typeof primary==='string'&&primary.endsWith('.webp')&&!!exerciseVisualSafeGeneratedAsset(primary)&&file===primary.replace(/\.webp$/,'.jpg')?`assets/exercise-media/${file}`:'';}
function exerciseVisualSafeLink(value){
  try{const url=new URL(String(value));return url.protocol==='https:'?url.href:'';}catch(error){return '';}
}
function exerciseVisualDemo(profile){
  if(!profile||typeof EXERCISE_MEDIA==='undefined')return null;
  const pair=EXERCISE_MEDIA.pairs.find(item=>item.key===profile.key);
  return pair&&pair.files.length===2&&pair.files.every(exerciseVisualSafeAsset)?pair:null;
}
function exerciseVisualGenerated(profile){
  if(!profile||typeof profile.generatedMediaKey!=='string'||!profile.generatedMediaKey||typeof exerciseGeneratedMedia!=='function')return null;
  try{
    const asset=exerciseGeneratedMedia(profile.generatedMediaKey);
    if(!asset||asset.source!=='generated'||asset.status!=='reviewed'||!['positions','overview'].includes(asset.kind)||!exerciseVisualSafeGeneratedAsset(asset.file)||!asset.alt||!['es','en'].every(lang=>typeof asset.alt[lang]==='string'&&asset.alt[lang].trim().length>0))return null;
    const hasFallback=asset.fallbackFile!==undefined;
    if(hasFallback&&!exerciseVisualSafeGeneratedFallback(asset.fallbackFile,asset.file))return null;
    const specific=profile.generatedMediaAlt,hasSpecificAlt=!!specific&&['es','en'].every(lang=>typeof specific[lang]==='string'&&specific[lang].trim().length>0),alt=hasSpecificAlt?specific:asset.alt;
    return{key:profile.generatedMediaKey,file:asset.file,...(hasFallback?{fallbackFile:asset.fallbackFile}:{}),alt:{es:alt.es,en:alt.en},hasSpecificAlt,kind:asset.kind,source:'generated',status:'reviewed'};
  }catch(error){return null;}
}
function exerciseVisualActiveGenerated(state){return state.generated&&!state.generatedError?state.generated:null;}
function exerciseVisualHasMedia(state){return !!exerciseVisualActiveGenerated(state)||!!state.demo&&!state.error;}
function exerciseVisualRoot(id){return document.querySelector(`[data-exercise-visual="${Number(id)}"]`);}
function exerciseVisualVisible(root){return !!root&&root.isConnected!==false&&!document.hidden&&root.getClientRects().length>0;}
function renderExerciseVisual(ex,options={}){
  if(!ex||typeof ex!=='object'||Array.isArray(ex)||typeof ex.name!=='string'||!ex.name.trim())return '';
  const profile=typeof exerciseMuscleProfile==='function'?exerciseMuscleProfile(ex):null;
  const reviewed=typeof exerciseIllustrationProfile==='function'?exerciseIllustrationProfile(ex):null;
  const illustration=reviewed||{pose:'custom',tool:'none',label:ex.name,known:false};
  const demo=reviewed?exerciseVisualDemo({key:reviewed.mediaKey}):typeof exerciseIllustrationProfile==='function'?null:exerciseVisualDemo(profile),generated=exerciseVisualGenerated(reviewed),id=++exerciseVisualSequence;
  const backPrimary=['hamstrings','glutes','lats','upper_back','lower_back','rear_delts'].includes(profile?.primary?.[0]);
  const legacyIllustration=options.legacyIllustration===true;
  const state={id,profile,illustration,demo,generated,exerciseName:ex.name,legacyIllustration,lang:exerciseVisualLanguage(),context:options.context==='sheet'?'sheet':'guided',tab:generated||demo?'movement':legacyIllustration||!profile?'illustration':'muscles',view:backPrimary?'back':'front',frame:0,playing:false,timer:null,error:false,generatedError:false,expanded:!!options.expanded,autoTried:false};
  exerciseVisualStates.set(id,state);
  return `<section class="exercise-visual-card${state.expanded?' is-expanded':''}${generated?' is-generated':''}" data-exercise-visual="${id}" data-visual-tab="${state.tab}"${generated?` data-generated-kind="${generated.kind}"`:''} aria-label="${state.lang==='en'?'Exercise visual guide':'Guía visual del ejercicio'}">${exerciseVisualMarkup(state)}</section>`;
}
function exerciseVisualMarkup(state){
  const {id,profile,lang,illustration}=state,en=lang==='en',generated=exerciseVisualActiveGenerated(state),demo=state.error?null:state.demo,hasMedia=!!generated||!!demo,movement=state.tab==='movement'&&hasMedia,staticMedia=movement&&!!generated,overview=staticMedia&&generated.kind==='overview',sequence=movement&&!staticMedia,muscles=state.tab==='muscles'&&!!profile,detail=demo?.scope==='detail';
  const label=zone=>exerciseVisualEscape(exerciseMuscleLabel(zone,lang)),primary=(profile?.primary||[]).map(label).join(' · '),secondary=(profile?.secondary||[]).map(label).join(' · ');
  const cue=exerciseVisualEscape(profile?.cue?.[lang]||''),source=exerciseVisualSafeLink(profile?.sources?.[0]);
  const generatedDescription=staticMedia?exerciseVisualEscape(generated.alt[lang]):'';
  const staticCopy=staticMedia&&generated.hasSpecificAlt?`<p class="exercise-visual-cue" data-visual-specific-caption>${generatedDescription}</p>${cue&&cue!==generatedDescription?`<p class="exercise-visual-cue">${cue}</p>`:''}`:`<p class="exercise-visual-cue">${overview?generatedDescription:cue||generatedDescription}</p>`;
  const phase=en?`Position ${state.frame+1} of 2`:`Posición ${state.frame+1} de 2`;
  const playLabel=exerciseVisualReducedMotion()?(en?'Show the other position':'Ver la otra posición'):state.playing?(en?'Pause reference sequence':'Pausar secuencia de referencia'):(en?'Play reference sequence':'Reproducir secuencia de referencia');
  const expandLabel=state.expanded?(en?'Reduce guide':'Reducir guía'):(en?'Enlarge guide':'Ampliar guía');
  const controls=staticMedia?'':`<div class="exercise-visual-controls">${sequence?`<button type="button" data-visual-action="play" onclick="exerciseVisualToggle(${id})" aria-label="${playLabel}" aria-pressed="${state.playing}">${state.playing?'Ⅱ':'▶'}</button>`:''}<button type="button" data-visual-action="expand" onclick="exerciseVisualExpand(${id})" aria-label="${expandLabel}" aria-expanded="${state.expanded}">${state.expanded?'−':'⤢'}</button></div>`;
  const sketch=state.legacyIllustration&&typeof exerciseIllustrationHtml==='function'?exerciseIllustrationHtml(illustration,lang):'';
  const neutral=`<div class="exercise-visual-placeholder" data-visual-placeholder role="note"><span>${exerciseVisualEscape(state.exerciseName)}</span><p>${en?'Follow the written exercise cues.':'Sigue las indicaciones del ejercicio.'}</p></div>`;
  const generatedImage=staticMedia?`<img class="exercise-visual-image is-visible" src="${generated.fallbackFile?exerciseVisualSafeGeneratedFallback(generated.fallbackFile,generated.file):exerciseVisualSafeGeneratedAsset(generated.file)}" data-visual-generated="${generated.kind}" loading="lazy" decoding="async" alt="${exerciseVisualEscape(generated.alt[lang])}" onerror="exerciseVisualMediaFailed(${id},'generated')">`:'';
  const generatedPicture=staticMedia&&generated.fallbackFile?`<picture><source type="image/webp" srcset="${exerciseVisualSafeGeneratedAsset(generated.file)}">${generatedImage}</picture>`:generatedImage;
  const picture=staticMedia?generatedPicture:sequence?demo.files.map((file,index)=>`<img class="exercise-visual-image${index===state.frame?' is-visible':''}" ${index===0||index===state.frame?`src="${exerciseVisualSafeAsset(file)}"`:`data-src="${exerciseVisualSafeAsset(file)}"`} data-visual-frame="${index}" loading="lazy" decoding="async" alt="${exerciseVisualEscape(`${state.exerciseName}: ${en?'position':'posición'} ${index+1} ${en?'of':'de'} 2`)}" aria-hidden="${index!==state.frame}" onload="exerciseVisualImageReady(${id})" onerror="exerciseVisualMediaFailed(${id},'licensed')">`).join(''):muscles?exerciseMuscleMapHtml(profile,state.view,lang):sketch||neutral;
  const stageLabel=staticMedia?(overview?(en?'Illustrated block overview':'Vista ilustrada del bloque'):(en?'Two static reference positions':'Dos posiciones estáticas de referencia')):sequence?(detail?(en?'Detail of two movement positions, not a full-posture demonstration':'Detalle de dos posiciones del movimiento, no de la postura completa'):(en?'Two reference positions, not a continuous video':'Dos posiciones de referencia, no un vídeo continuo')):muscles?(en?'Schematic muscle map':'Mapa muscular esquemático'):(en?'Written exercise guidance':'Indicaciones del ejercicio');
  const sketchCopy=illustration.known?(en?'No reviewed image is available for this variant yet. Read the exercise cues before starting.':'Esta variante todavía no tiene una imagen revisada. Lee sus indicaciones antes de empezar.'):(en?'Custom exercise: no reviewed demonstration. Follow your routine’s written cues.':'Ejercicio personalizado: sin demostración revisada. Sigue las indicaciones de tu rutina.');
  const circuit=illustration.pose==='circuit',choice=illustration.pose==='choice';
  const sketchTitle=circuit?(en?'A block with several movements':'Bloque con varios movimientos'):choice?(en?'Variant and equipment':'Variante y material'):(en?'Exercise guidance':'Guía del ejercicio');
  const sketchDescription=circuit?(en?'Read the listed movements. This block has no single technique demonstration.':'Consulta los movimientos indicados. Este bloque no tiene una demostración única.'):choice?(en?'The posture or setup is not fully specified. Check this variant’s cues.':'La postura o el montaje no están concretados. Revisa las claves de esta variante.'):sketchCopy;
  const copy=staticMedia?`<div class="exercise-visual-label">${overview?(en?'Block overview':'Vista del bloque'):(en?'Reference positions':'Posiciones de referencia')}</div>${staticCopy}`:sequence?`<div class="exercise-visual-label">${detail?(en?'Movement detail':'Detalle del movimiento'):(en?'See the movement':'Mira el movimiento')}</div><div class="exercise-visual-phase" data-visual-phase>${phase}</div><p class="exercise-visual-cue">${cue|| (en?'Use the exercise cues below.':'Consulta las claves del ejercicio.')}</p>`:muscles?`<div class="exercise-visual-label">${state.view==='front'?(en?'Front view':'Vista frontal'):(en?'Back view':'Vista dorsal')}</div><div class="exercise-visual-muscle-tags"><span class="is-primary">${en?'Main':'Principal'}: ${primary}</span>${secondary?`<span class="is-secondary">${en?'Support':'Apoyo'}: ${secondary}</span>`:''}</div><button type="button" class="exercise-visual-view" data-visual-action="view" onclick="exerciseVisualFlip(${id})">${state.view==='front'?(en?'See back ↔':'Ver espalda ↔'):(en?'See front ↔':'Ver frente ↔')}</button>`:`<div class="exercise-visual-label">${sketchTitle}</div><p class="exercise-visual-cue">${sketchDescription}</p>`;
  const attribution=staticMedia?(en?'AI-generated illustration for EntrenoApp · indicative reference.':'Ilustración generada con IA para EntrenoApp · referencia orientativa.'):sequence?`<a href="${exerciseVisualEscape(exerciseVisualSafeLink(demo.sourceUrl))}" target="_blank" rel="noopener noreferrer">${exerciseVisualEscape(demo.author)}</a> · <a href="${exerciseVisualEscape(exerciseVisualSafeLink(demo.licenseUrl))}" target="_blank" rel="noopener noreferrer">${exerciseVisualEscape(demo.license)}</a> · <a href="assets/exercise-media/CREDITS.md" target="_blank" rel="noopener">${en?'Credits':'Créditos'}</a>`:muscles?`${en?'Indicative zones, not measured activation.':'Zonas orientativas, no activación medida.'}${source?` <a href="${exerciseVisualEscape(source)}" target="_blank" rel="noopener noreferrer">${en?'Source':'Fuente'}</a>`:''}`:(en?'Use the written cues; this guide does not assess your technique.':'Consulta las indicaciones; esta guía no evalúa tu técnica.');
  const failure=state.generatedError||state.error?(hasMedia?(en?'Image unavailable. An alternative reference is shown.':'Imagen no disponible. Mostramos una referencia alternativa.'):profile?(en?'Reference unavailable. Muscle map retained.':'Referencia no disponible. Conservamos el mapa.'):(en?'Reference unavailable. Written cues retained.':'Referencia no disponible. Conservamos las indicaciones.')):'';
  return `<div class="exercise-visual-tabs" role="group" aria-label="${en?'Guide content':'Contenido de la guía'}">
    ${hasMedia?`<button type="button" class="exercise-visual-tab" data-visual-action="movement" aria-pressed="${movement}" onclick="exerciseVisualSelect(${id},'movement')">${generated?(generated.kind==='overview'?(en?'Block overview':'Vista del bloque'):(en?'Positions':'Posiciones')):(en?'Movement':'Movimiento')}</button>`:''}${state.legacyIllustration||!hasMedia&&!profile?`<button type="button" class="exercise-visual-tab" data-visual-action="illustration" aria-pressed="${!movement&&!muscles}" onclick="exerciseVisualSelect(${id},'illustration')">${en?'Guide':'Guía'}</button>`:''}${profile?`<button type="button" class="exercise-visual-tab" data-visual-action="muscles" aria-pressed="${muscles}" onclick="exerciseVisualSelect(${id},'muscles')">${en?'Muscles':'Músculos'}</button>`:''}</div>
    <div class="exercise-visual-body"><div class="exercise-visual-stage" role="group" aria-label="${stageLabel}">${picture}</div><div class="exercise-visual-copy">${copy}${controls}</div></div>
    <div class="exercise-visual-credit">${failure?`<span role="status">${failure}</span> `:''}${attribution}</div>`;
}
function exerciseVisualPaint(state,focusAction=''){
  const root=exerciseVisualRoot(state.id);if(!root)return;
  const generated=exerciseVisualActiveGenerated(state);
  root.classList.toggle('is-expanded',state.expanded);root.classList.toggle('is-generated',state.tab==='movement'&&!!generated);root.setAttribute('data-visual-tab',state.tab);
  if(generated)root.setAttribute('data-generated-kind',generated.kind);else root.removeAttribute('data-generated-kind');
  root.innerHTML=exerciseVisualMarkup(state);
  if(focusAction)root.querySelector(`[data-visual-action="${focusAction}"]`)?.focus({preventScroll:true});
}
function exerciseVisualLoadFrames(state){
  const root=exerciseVisualRoot(state.id);if(!root)return;
  root.querySelectorAll('img[data-src]').forEach(image=>{const src=image.getAttribute('data-src');if(src&&/^assets\/exercise-media\/[a-z0-9-]+\.png$/.test(src)){image.src=src;image.removeAttribute('data-src');}});
}
function exerciseVisualUpdateFrame(state){
  if(exerciseVisualActiveGenerated(state))return;
  const root=exerciseVisualRoot(state.id);if(!root)return;
  const images=[...root.querySelectorAll('[data-visual-frame]')],target=images.find(image=>Number(image.getAttribute('data-visual-frame'))===state.frame);
  if(!target||!target.complete||!target.naturalWidth)return;
  images.forEach(image=>{image.classList.toggle('is-visible',image===target);image.setAttribute('aria-hidden',String(image!==target));});
  const phase=root.querySelector('[data-visual-phase]');if(phase)phase.textContent=state.lang==='en'?`Position ${state.frame+1} of 2`:`Posición ${state.frame+1} de 2`;
}
function exerciseVisualImageReady(id){const state=exerciseVisualStates.get(Number(id));if(state)exerciseVisualUpdateFrame(state);}
function exerciseVisualPlayLabel(button,label){button.setAttribute('aria-label',label);button.setAttribute('data-i18n-aria-label',label);}
function exerciseVisualPause(id){
  const state=exerciseVisualStates.get(Number(id));if(!state)return;
  if(state.timer)clearInterval(state.timer);state.timer=null;state.playing=false;
  const button=exerciseVisualRoot(state.id)?.querySelector('[data-visual-action="play"]');
  if(button){button.textContent='▶';button.setAttribute('aria-pressed','false');exerciseVisualPlayLabel(button,exerciseVisualReducedMotion()?(state.lang==='en'?'Show the other position':'Ver la otra posición'):(state.lang==='en'?'Play reference sequence':'Reproducir secuencia de referencia'));}
}
function pauseExerciseVisuals(context=''){exerciseVisualStates.forEach(state=>{if(!context||state.context===context)exerciseVisualPause(state.id);});}
function exerciseVisualPlay(id,automatic=false){
  const state=exerciseVisualStates.get(Number(id)),root=state&&exerciseVisualRoot(state.id);
  if(!state||exerciseVisualActiveGenerated(state)||!state.demo||state.error||state.tab!=='movement'||!exerciseVisualVisible(root))return;
  exerciseVisualPause(id);
  if(automatic&&navigator.connection?.saveData)return;
  exerciseVisualLoadFrames(state);
  if(exerciseVisualReducedMotion()){
    if(!automatic){state.frame=state.frame?0:1;exerciseVisualUpdateFrame(state);}return;
  }
  state.playing=true;let changes=0;
  const button=root.querySelector('[data-visual-action="play"]');if(button){button.textContent='Ⅱ';button.setAttribute('aria-pressed','true');exerciseVisualPlayLabel(button,state.lang==='en'?'Pause reference sequence':'Pausar secuencia de referencia');}
  state.timer=setInterval(()=>{
    if(!exerciseVisualVisible(root)||exerciseVisualReducedMotion()){exerciseVisualPause(id);return;}
    state.frame=state.frame?0:1;exerciseVisualUpdateFrame(state);changes++;
    // A short introduction, not a distracting endless loop. Replay is always optional.
    if(automatic&&changes>=4)exerciseVisualPause(id);
  },1800);
}
function exerciseVisualToggle(id){const state=exerciseVisualStates.get(Number(id));if(!state)return;state.playing?exerciseVisualPause(id):exerciseVisualPlay(id);}
function exerciseVisualSelect(id,tab){
  const state=exerciseVisualStates.get(Number(id));if(!state||!['movement','muscles','illustration'].includes(tab)||tab==='muscles'&&!state.profile||tab==='movement'&&!exerciseVisualHasMedia(state))return;
  exerciseVisualPause(id);state.tab=tab;exerciseVisualPaint(state,tab);
}
function exerciseVisualFlip(id){const state=exerciseVisualStates.get(Number(id));if(!state||!state.profile)return;state.view=state.view==='front'?'back':'front';exerciseVisualPaint(state,'view');}
function exerciseVisualExpand(id){const state=exerciseVisualStates.get(Number(id));if(!state||state.tab==='movement'&&exerciseVisualActiveGenerated(state))return;exerciseVisualPause(id);state.expanded=!state.expanded;exerciseVisualPaint(state,'expand');}
function exerciseVisualMediaFailed(id,source='licensed'){
  const state=exerciseVisualStates.get(Number(id));if(!state||source==='generated'&&state.generatedError||source!=='generated'&&state.error)return;
  exerciseVisualPause(id);state.autoTried=true;
  if(source==='generated')state.generatedError=true;else state.error=true;
  state.tab=exerciseVisualHasMedia(state)?'movement':state.profile?'muscles':'illustration';exerciseVisualPaint(state);
}
function initExerciseVisuals(context='guided'){
  exerciseVisualStates.forEach((state,id)=>{
    const root=exerciseVisualRoot(id);
    if(!root){exerciseVisualPause(id);exerciseVisualStates.delete(id);return;}
    if(state.context!==context){exerciseVisualPause(id);return;}
    if(!state.autoTried&&exerciseVisualVisible(root)){state.autoTried=true;if(!exerciseVisualReducedMotion())exerciseVisualPlay(id,true);}
  });
}
function exerciseVisualCelebrate(){
  const card=document.getElementById('daily-guided');if(!card||exerciseVisualReducedMotion())return;
  card.classList.remove('daily-delight-celebrate');
  requestAnimationFrame(()=>{if(card.isConnected!==false)card.classList.add('daily-delight-celebrate');});
  setTimeout(()=>card.classList.remove('daily-delight-celebrate'),800);
}
function syncExerciseVisualRest(left,total,paused){
  const active=Number(left)>0;if(active)pauseExerciseVisuals();
  const ring=document.getElementById('daily-delight-progress'),orbit=document.getElementById('daily-delight-orbit');
  const ratio=Number(total)>0?Math.min(1,Math.max(0,Number(left)/Number(total))):0;
  if(ring)ring.style.strokeDashoffset=String(100*(1-ratio));if(orbit)orbit.setAttribute('data-paused',paused?'true':'false');
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseExerciseVisuals();});
try{const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');if(preference?.addEventListener)preference.addEventListener('change',()=>{if(preference.matches)pauseExerciseVisuals();});else preference?.addListener?.(()=>{if(preference.matches)pauseExerciseVisuals();});}catch(error){}
