#!/usr/bin/env node
'use strict';

// Execute the actual media, reviewed muscle-profile and visual modules in a VM.
// This small DOM/clock replaces only browser IO; no saved app profile is read.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const mediaSource=fs.readFileSync(path.join(root,'assets/js/exercise-media.js'),'utf8');
const muscleSource=fs.readFileSync(path.join(root,'assets/js/exercise-muscles.js'),'utf8');
const cataloguePath=path.join(root,'assets/js/exercise-visual-catalogue.js');
const catalogueSource=fs.existsSync(cataloguePath)?fs.readFileSync(cataloguePath,'utf8'):'';
const illustrationSource=fs.readFileSync(path.join(root,'assets/js/exercise-illustrations.js'),'utf8');
const visualSource=fs.readFileSync(path.join(root,'assets/js/exercise-visuals.js'),'utf8');
const appSource=fs.readFileSync(path.join(root,'app.html'),'utf8');

function appFunction(name){
  const start=appSource.search(new RegExp(`^function ${name}\\b`,'m'));
  assert.notEqual(start,-1,`Missing app function: ${name}`);
  const end=appSource.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return appSource.slice(start,end<0?appSource.length:start+1+end);
}

function fixture(){
  const context=vm.createContext({console,URL});
  vm.runInContext(`
    let clock=0,nextJob=0,lang='es',reduced=false,saveData=false,webpSupported=true,appRenders=0,focused='',requests=[],cleared=[];
    let workoutUiInt=null,workoutLiveUpdates=0;
    const jobs=new Map(),roots=new Map(),listeners=new Map(),motionListeners=[];
    const S={screen:'workout',sessions:[{id:'kept-session'}],profile:{equipment:'gym'}};
    const W={active:true,notes:'keep this note',presentation:'guided',alt:{pb:'pim'}};
    const WD={pb_0:[{kg:42.5,reps:9,done:true},{kg:42.5,reps:8,done:false}]};
    let tmrInt=800,tmrLeft=75,tmrTotal=90,tmrPaused=false,tmrDeadline=75000,tmrRemainingMs=75000,tmrNext='Keep rest';
    const restRing={style:{}},restOrbit={attributes:{},setAttribute(name,value){this.attributes[name]=String(value);}};
    const restCard={isConnected:true,className:'',classList:{remove(){},add(){}}};
    function snapshot(){return JSON.stringify({S,W,WD,tmrInt,tmrLeft,tmrTotal,tmrPaused,tmrDeadline,tmrRemainingMs,tmrNext});}
    function currentLang(){return lang;}
    function renderWorkout(){appRenders++;throw Error('Visual interaction must not rerender the workout');}
    function updateWorkoutLiveStats(){workoutLiveUpdates++;}
    function setInterval(fn,delay){const id=++nextJob;jobs.set(id,{fn,delay,at:clock+delay,interval:true});return id;}
    function setTimeout(fn,delay){const id=++nextJob;jobs.set(id,{fn,delay,at:clock+delay,interval:false});return id;}
    function clearInterval(id){cleared.push(id);jobs.delete(id);}
    function clearTimeout(id){cleared.push(id);jobs.delete(id);}
    function requestAnimationFrame(fn){fn(clock);return 0;}
    function advance(ms){
      const target=clock+ms;
      for(let guard=0;guard<1000;guard++){
        let first=null;for(const pair of jobs)if(pair[1].at<=target&&(!first||pair[1].at<first[1].at))first=pair;
        if(!first){clock=target;return;}
        const [id,job]=first;clock=job.at;if(job.interval)job.at+=job.delay;else jobs.delete(id);job.fn();
      }
      throw Error('Fake visual clock exceeded its limit');
    }
    function attrs(text){return Object.fromEntries([...text.matchAll(/([\\w-]+)="([^"]*)"/g)].map(match=>[match[1],match[2]]));}
    function node(attributes={}){
      const item={attributes:{...attributes},className:attributes.class||'',textContent:'',style:{},isConnected:true};
      item.getAttribute=name=>item.attributes[name]??null;
      item.setAttribute=(name,value)=>{item.attributes[name]=String(value);if(name==='class')item.className=String(value);};
      item.removeAttribute=name=>{delete item.attributes[name];};
      item.focus=()=>{focused=item.attributes['data-visual-action']||'';};
      item.classList={
        contains(name){return item.className.split(/\\s+/).includes(name);},
        add(name){if(!this.contains(name))item.className=(item.className+' '+name).trim();},
        remove(name){item.className=item.className.split(/\\s+/).filter(value=>value!==name).join(' ');},
        toggle(name,on){if(on===undefined)on=!this.contains(name);on?this.add(name):this.remove(name);return on;}
      };
      return item;
    }
    function image(attributes,selectedSource=''){
      const item=node(attributes);let src=attributes.src||'';
      item.complete=!!src;item.naturalWidth=src?120:0;
      item.currentSrc=selectedSource||src;
      if(item.currentSrc)requests.push(item.currentSrc);
      Object.defineProperty(item,'src',{get(){return src;},set(value){src=String(value);item.attributes.src=src;item.currentSrc=src;requests.push(src);item.complete=true;item.naturalWidth=120;}});
      return item;
    }
    function mount(html){
      const match=html.match(/^<section\\b([^>]*)>([\\s\\S]*)<\\/section>$/);if(!match)return null;
      const outer=node(attrs(match[1]));outer.visible=true;outer.getClientRects=()=>outer.visible?[{}]:[];
      Object.defineProperty(outer,'innerHTML',{get(){return outer.html||'';},set(value){
        outer.html=String(value);
        outer.images=[...outer.html.matchAll(/<img\\b([^>]*)>/g)].map(match=>{
          const prefix=outer.html.slice(0,match.index),pictureStart=prefix.lastIndexOf('<picture');
          const source=pictureStart>prefix.lastIndexOf('</picture>')?[...prefix.slice(pictureStart).matchAll(/<source\\b([^>]*)>/g)].map(item=>attrs(item[1])).find(item=>item.type==='image/webp'):null;
          return image(attrs(match[1]),webpSupported&&source?.srcset?source.srcset:'');
        });
        outer.buttons=[...outer.html.matchAll(/<button\\b([^>]*)>([\\s\\S]*?)<\\/button>/g)].map(match=>{const item=node(attrs(match[1]));item.textContent=match[2];return item;});
        outer.phase=outer.html.includes('data-visual-phase')?node():null;
      }});
      outer.querySelectorAll=selector=>selector==='img[data-src]'?outer.images.filter(item=>item.getAttribute('data-src')):selector==='[data-visual-frame]'?outer.images:[];
      outer.querySelector=selector=>{
        if(selector==='[data-visual-phase]')return outer.phase;
        const action=selector.match(/^\\[data-visual-action="([^"]+)"\\]$/)?.[1];
        return action?outer.buttons.find(item=>item.getAttribute('data-visual-action')===action)||null:null;
      };
      outer.innerHTML=match[2];roots.set(Number(outer.getAttribute('data-exercise-visual')),outer);return outer;
    }
    function detach(id){const item=roots.get(Number(id));if(item)item.isConnected=false;roots.delete(Number(id));}
    const document={
      hidden:false,
      querySelector(selector){const id=selector.match(/^\\[data-exercise-visual="(\\d+)"\\]$/)?.[1];return id?roots.get(Number(id))||null:null;},
      getElementById(id){return id==='daily-delight-progress'?restRing:id==='daily-delight-orbit'?restOrbit:id==='daily-guided'?restCard:null;},
      addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);}
    };
    function dispatch(name){for(const fn of listeners.get(name)||[])fn();}
    const preference={get matches(){return reduced;},addEventListener(name,fn){if(name==='change')motionListeners.push(fn);},addListener(fn){motionListeners.push(fn);}};
    const window={matchMedia(){return preference;}};
    const navigator={connection:{get saveData(){return saveData;}}};
    function setReduced(value){reduced=value;for(const fn of motionListeners)fn({matches:value});}
  `,context);
  vm.runInContext(mediaSource,context,{filename:'exercise-media.js'});
  vm.runInContext(muscleSource,context,{filename:'exercise-muscles.js'});
  if(catalogueSource)vm.runInContext(catalogueSource,context,{filename:'exercise-visual-catalogue.js'});
  vm.runInContext(illustrationSource,context,{filename:'exercise-illustrations.js'});
  vm.runInContext(visualSource,context,{filename:'exercise-visuals.js'});
  vm.runInContext(['stopWorkoutUiTicker','startWorkoutUiTicker'].map(appFunction).join('\n'),context,{filename:'app-workout-ui-ticker.js'});
  vm.runInContext(`
    const bench={id:'pb',name:'Press de banca',equipment:'gym'};
    function show(ex=bench,options={}){const html=renderExerciseVisual(ex,options);const element=mount(html);return element?Number(element.getAttribute('data-exercise-visual')):0;}
    function html(id){return exerciseVisualRoot(id)?.innerHTML||'';}
    function state(id){return exerciseVisualStates.get(id);}
    function playingCount(){return [...exerciseVisualStates.values()].filter(item=>item.playing).length;}
  `,context);
  return {run:code=>vm.runInContext(code,context),plain:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context)))};
}

let passed=0,failed=0;
function test(name,fn){try{fn(fixture());passed++;console.log('✓ '+name);}catch(error){failed++;console.error('✗ '+name+'\n'+error.stack);}}
const generatedPositions={file:'generated/bench-press-barbell-v1.webp',alt:{es:'Press de banca con barra: dos posiciones sobre un banco plano.',en:'Barbell bench press: two positions on a flat bench.'},kind:'positions',source:'generated',status:'reviewed'};
function installGenerated(f,asset=generatedPositions,ex={id:'pb',name:'Press de banca',equipment:'gym'}){
  f.run('var generatedRecord='+JSON.stringify(asset)+',generatedExpected='+JSON.stringify(ex)+',originalReviewedLookup=exerciseIllustrationProfile;exerciseGeneratedMedia=key=>key==="fixture_reference"?generatedRecord:null;exerciseIllustrationProfile=ex=>{const entry=originalReviewedLookup(ex);return entry&&["id","name","equipment"].every(field=>ex[field]===generatedExpected[field])?{...entry,generatedMediaKey:"fixture_reference"}:entry;};');
}

test('Media sources are local allowlisted PNG pairs with credits and license',f=>{
  const pairs=f.plain('EXERCISE_MEDIA.pairs');
  assert.equal(pairs.length,40);
  assert.equal(pairs.flatMap(pair=>pair.files).length,80);
  for(const pair of pairs){
    assert.equal(pair.files.length,2);
    assert.ok(['full','detail'].includes(pair.scope));
    assert.equal(pair.source,'licensed');assert.equal(pair.kind,'sequence');assert.equal(pair.author,'Everkinetic / Greg Priday');
    assert.match(pair.sourceUrl,/^https:\/\/github\.com\/everkinetic\/data/);assert.equal(pair.license,'CC BY-SA 4.0');
    for(const filename of pair.files){
      const asset=f.run(`exerciseVisualSafeAsset(${JSON.stringify(filename)})`);
      assert.match(asset,/^assets\/exercise-media\/[a-z0-9-]+-[1-3]\.png$/);
      assert.ok(fs.statSync(path.join(root,asset)).size>0,asset);
    }
  }
  const credits=fs.readFileSync(path.join(root,'assets/exercise-media/CREDITS.md'),'utf8');
  assert.match(credits,/Everkinetic/);assert.match(credits,/Attribution-ShareAlike 4\.0/);
  assert.equal(f.run('EXERCISE_MEDIA.license'),'CC BY-SA 4.0');
  assert.match(f.run('EXERCISE_MEDIA.licenseUrl'),/^https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//);
});

test('Asset and external-link guards reject unsafe paths or schemes',f=>{
  for(const value of ['https://example.com/x-1.png','//evil.test/x-1.png','../x-1.png','x-4.png','x-1.svg','x-1.png?x=1','x" onerror="alert(1)-1.png','/assets/x-1.png',null])assert.equal(f.run(`exerciseVisualSafeAsset(${JSON.stringify(value)})`),'');
  for(const value of ['javascript:alert(1)','data:text/html,x','http://example.com/','/local'])assert.equal(f.run(`exerciseVisualSafeLink(${JSON.stringify(value)})`),'');
  assert.equal(f.run("exerciseVisualSafeLink('https://example.com/reference')"),'https://example.com/reference');
});

test('Rendered movement keeps both sources local and initially defers its second pose',f=>{
  f.run('var id=show();');
  const html=f.run('html(id)');
  assert.match(html,/src="assets\/exercise-media\/bench-press-1\.png"/);
  assert.match(html,/data-src="assets\/exercise-media\/bench-press-2\.png"/);
  assert.equal(f.run('requests.length'),1);
  assert.doesNotMatch(html,/<video|autoplay|src="https?:/);
  assert.match(html,/loading="lazy" decoding="async"/);
  assert.match(html,/Dos posiciones de referencia, no un vídeo continuo/);
});

test('A malformed media-pair path retains a static visual without fetching it',f=>{
  f.run(`EXERCISE_MEDIA.pairs.find(pair=>pair.key==='bench_barbell').files[1]='https://untrusted.example/pose.png';var id=show();`);
  assert.equal(f.run('state(id).demo'),null);
  assert.match(f.run('html(id)'),/exercise-muscle-map|data-visual-placeholder/);
  assert.doesNotMatch(f.run('html(id)'),/<img|untrusted\.example/);
  assert.equal(f.run('requests.length'),0);
});

test('Flat dumbbell media cannot be reused for an incline bench',f=>{
  assert.equal(f.run("exerciseMuscleProfile({equipment:'mancuernas',name:'Press con mancuernas'}).key"),'bench_dumbbell_flat');
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'mancuernas',name:'Press con mancuernas'})).key"),'bench_dumbbell_flat');
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'mancuernas',name:'Press inclinado con mancuernas'})).key"),'bench_dumbbell_incline');
});

test('Pulldown profiles never inherit the excluded wide-grip reference pictures',f=>{
  const profile=f.plain("exerciseMuscleProfile({equipment:'gym',name:'Jalón agarre ancho'})");
  assert.ok(profile);
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'gym',name:'Jalón agarre ancho'}))"),null);
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'gym',name:'Jalón agarre cerrado'}))"),null);
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'gym',name:'Jalón agarre neutro'}))"),null);
});

test('Seated shoulder-press media cannot imply the standing variant',f=>{
  const seated=f.plain("exerciseMuscleProfile({equipment:'mancuernas',name:'Press hombros mancuernas sentado'})");
  assert.ok(seated,'An explicitly seated profile must exist');
  assert.equal(seated.key,'overhead_dumbbell_seated');
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'mancuernas',name:'Press hombros mancuernas sentado'})).key"),'overhead_dumbbell_seated');
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'mancuernas',name:'Press hombro con mancuernas'}))"),null);
});

test('Band squat has a material-specific map, without the cropped reference pictures',f=>{
  assert.equal(f.run("exerciseMuscleProfile({equipment:'bandas',name:'Sentadilla con banda'}).key"),'band_squat');
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'bandas',name:'Sentadilla con banda'}))"),null);
  assert.equal(f.run("exerciseVisualDemo(exerciseMuscleProfile({equipment:'nada',name:'Sentadilla tempo'}))"),null);
});

test('Step-up uses the inspected original positions 1 and 3 without renaming them',f=>{
  const pair=f.plain("exerciseVisualDemo({key:'step_up_dumbbell'})");
  assert.deepEqual(pair.files,['step-ups-with-dumbbells-1.png','step-ups-with-dumbbells-3.png']);
  assert.equal(f.run("exerciseVisualSafeAsset('step-ups-with-dumbbells-3.png')"),'assets/exercise-media/step-ups-with-dumbbells-3.png');
  assert.ok(pair.files.every(file=>fs.statSync(path.join(root,'assets/exercise-media',file)).size>0));
});

test('Rejected behind-neck, cropped band-squat and calf images stay out of the manifest',f=>{
  assert.doesNotMatch(f.run('JSON.stringify(EXERCISE_MEDIA.pairs)'),/wide-grip-lat-pull-down|squats-with-exercise-bands|standing-barbell-calf|standing-calf-raises-using-machine|donkey-calf/);
});

test('Detail references explicitly avoid claiming complete standing posture',f=>{
  f.run("var id=show({id:'cb',name:'Curl bíceps barra',equipment:'gym'});");
  assert.equal(f.run('state(id).demo?.scope'),'detail');
  let html=f.run('html(id)');assert.match(html,/Detalle del movimiento/);assert.match(html,/no de la postura completa/);
  f.run("lang='en';var english=show({id:'cb',name:'Curl bíceps con mancuernas',equipment:'mancuernas'});");
  assert.equal(f.run('state(english).demo?.scope'),'detail');
  html=f.run('html(english)');assert.match(html,/Movement detail/);assert.match(html,/not a full-posture demonstration/);
});

test('Unknown or misleading custom exercise names do not invent demonstrations',f=>{
  for(const ex of [{id:'pb',name:'Mi ejercicio',equipment:'gym'},{id:'custom_1',name:'Press de banca',equipment:'custom'},{name:'Press de banca',equipment:'bandas'}]){
    const id=f.run(`show(${JSON.stringify(ex)})`),html=f.run(`html(${id})`);
    assert.match(html,/data-visual-placeholder/);
    assert.doesNotMatch(html,/exercise-reference-illustration/);
    assert.match(html,/Ejercicio personalizado: sin demostración revisada/);
    assert.doesNotMatch(html,/<img|data-visual-action="movement"|data-visual-action="muscles"/);
    assert.equal(f.run(`state(${id}).illustration.known`),false);
  }
  assert.equal(f.run('requests.length'),0);
});

test('Known entries without images start with a reviewed muscle map, never a basic sketch',f=>{
  f.run("var id=show({id:'rb',name:'Remo con banda',equipment:'bandas'});");
  let html=f.run('html(id)');
  assert.match(html,/exercise-muscle-map/);
  assert.doesNotMatch(html,/exercise-reference-illustration/);
  assert.doesNotMatch(html,/<img|data-visual-action="movement"|data-visual-action="play"/);
  assert.equal(f.run('requests.length'),0);
  f.run('exerciseVisualSelect(id,"muscles");');html=f.run('html(id)');
  assert.match(html,/exercise-muscle-map/);assert.match(html,/Zonas orientativas, no activación medida/);
});

test('Local demonstrations visibly attribute author, license and full credits',f=>{
  f.run('var id=show();');const html=f.run('html(id)');
  assert.match(html,/>Everkinetic \/ Greg Priday<\/a>/);assert.match(html,/>CC BY-SA 4\.0<\/a>/);
  assert.match(html,/href="assets\/exercise-media\/CREDITS\.md"/);
  assert.match(html,/rel="noopener noreferrer"/);
});

test('Play and pause change presentation only, never workout data or rest state',f=>{
  f.run('var id=show();');const before=f.run('snapshot()');
  f.run('exerciseVisualToggle(id);advance(1800);exerciseVisualToggle(id);');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('snapshot()'),before);assert.equal(f.run('appRenders'),0);
  assert.equal(f.run('cleared.includes(800)'),false);
});

test('Automatic introduction stops after four pose changes, not an endless loop',f=>{
  f.run('var id=show();initExerciseVisuals();');
  assert.equal(f.run('state(id).playing'),true);
  f.run('advance(1800*3);');assert.equal(f.run('state(id).playing'),true);assert.equal(f.run('state(id).frame'),1);
  f.run('advance(1800);');assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('state(id).frame'),0);
  assert.equal(f.run('jobs.size'),0);
  f.run('initExerciseVisuals();');assert.equal(f.run('jobs.size'),0);
});

test('Render/nav ticker restarts preserve the active automatic introduction',f=>{
  const before=f.run('snapshot()');
  // renderWorkout starts the UI ticker and intro; nav then restarts the ticker.
  f.run('startWorkoutUiTicker();var id=show();initExerciseVisuals("guided");var firstTicker=workoutUiInt;startWorkoutUiTicker();');
  assert.equal(f.run('state(id).playing'),true);
  assert.equal(f.run('state(id).autoTried'),true);
  assert.equal(f.run('jobs.has(firstTicker)'),false);
  assert.notEqual(f.run('workoutUiInt'),f.run('firstTicker'));
  assert.equal(f.run('jobs.size'),2,'One UI ticker and one visual timer must remain');
  f.run('advance(1800);');
  assert.equal(f.run('state(id).frame'),1);
  assert.equal(f.run('state(id).playing'),true);
  assert.equal(f.run('workoutLiveUpdates'),3);
  assert.equal(f.run('snapshot()'),before);
  f.run('stopWorkoutUiTicker();');
  assert.equal(f.run('state(id).playing'),false);
  assert.equal(f.run('workoutUiInt'),null);
  assert.equal(f.run('jobs.size'),0);
});

test('A normal UI ticker stop pauses visual playback even without a running UI ticker',f=>{
  f.run('var id=show();initExerciseVisuals("guided");');
  const before=f.run('snapshot()');
  assert.equal(f.run('workoutUiInt'),null);
  assert.equal(f.run('state(id).playing'),true);
  f.run('stopWorkoutUiTicker();');
  assert.equal(f.run('state(id).playing'),false);
  assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('snapshot()'),before);
});

test('A position cannot replace the current image until its PNG has loaded',f=>{
  f.run(`var id=show();var visualRoot=exerciseVisualRoot(id);visualRoot.phase.textContent='Posición 1 de 2';state(id).frame=1;exerciseVisualUpdateFrame(state(id));`);
  assert.equal(f.run('exerciseVisualRoot(id).images[0].classList.contains("is-visible")'),true);
  assert.equal(f.run('exerciseVisualRoot(id).images[1].classList.contains("is-visible")'),false);
  assert.equal(f.run('exerciseVisualRoot(id).phase.textContent'),'Posición 1 de 2');
  f.run('exerciseVisualLoadFrames(state(id));exerciseVisualImageReady(id);');
  assert.equal(f.run('exerciseVisualRoot(id).images[1].classList.contains("is-visible")'),true);
  assert.equal(f.run('exerciseVisualRoot(id).phase.textContent'),'Posición 2 de 2');
});

test('Manual replay remains optional after the short introduction finishes',f=>{
  f.run('var id=show();initExerciseVisuals();advance(7200);exerciseVisualToggle(id);advance(9000);');
  assert.equal(f.run('state(id).playing'),true);
  f.run('exerciseVisualPause(id);');assert.equal(f.run('jobs.size'),0);
});

test('Reduced motion prevents automatic playback and supports manual position changes',f=>{
  f.run('setReduced(true);var id=show();initExerciseVisuals();');
  assert.equal(f.run('jobs.size'),0);assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('requests.length'),1);
  assert.match(f.run('html(id)'),/Ver la otra posición/);
  f.run('exerciseVisualToggle(id);');assert.equal(f.run('state(id).frame'),1);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('exerciseVisualRoot(id).querySelector(\'[data-visual-action="play"]\').getAttribute("aria-label")'),'Ver la otra posición');
  f.run('exerciseVisualToggle(id);');assert.equal(f.run('state(id).frame'),0);assert.equal(f.run('jobs.size'),0);
});

test('Turning reduced motion on immediately pauses an existing sequence',f=>{
  f.run('var id=show();exerciseVisualToggle(id);setReduced(true);');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
});

test('SaveData avoids automatic animation and downloading the second pose',f=>{
  f.run('saveData=true;var id=show();initExerciseVisuals();');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('requests.length'),1,'Automatic SaveData setup must keep the second PNG deferred');
  f.run('exerciseVisualToggle(id);');assert.equal(f.run('state(id).playing'),true);assert.equal(f.run('requests.length'),2);
});

test('Document visibility pauses immediately and never restarts by itself',f=>{
  f.run('var id=show();exerciseVisualToggle(id);document.hidden=true;dispatch("visibilitychange");');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  f.run('document.hidden=false;dispatch("visibilitychange");');assert.equal(f.run('jobs.size'),0);
});

test('Only the current guided or sheet context can run its introduction',f=>{
  f.run('var guided=show();initExerciseVisuals("guided");var sheet=show(bench,{context:"sheet"});initExerciseVisuals("sheet");');
  assert.equal(f.run('state(guided).playing'),false);assert.equal(f.run('state(sheet).playing'),true);
  f.run('pauseExerciseVisuals("sheet");');assert.equal(f.run('playingCount()'),0);assert.equal(f.run('jobs.size'),0);
});

test('Starting rest pauses media while preserving the actual rest timer variables',f=>{
  f.run('var id=show();exerciseVisualToggle(id);');const before=f.run('snapshot()');
  f.run('syncExerciseVisualRest(45,90,true);');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('restRing.style.strokeDashoffset'),'50');assert.equal(f.run('restOrbit.attributes["data-paused"]'),'true');
  assert.equal(f.run('snapshot()'),before);assert.equal(f.run('cleared.includes(800)'),false);
  f.run('syncExerciseVisualRest(0,90,false);');assert.equal(f.run('jobs.size'),0);
});

test('Offscreen or removed DOM cannot leave a continuing animation job',f=>{
  f.run('var id=show();exerciseVisualToggle(id);exerciseVisualRoot(id).visible=false;advance(1800);');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  f.run('exerciseVisualRoot(id).visible=true;exerciseVisualToggle(id);detach(id);advance(1800);initExerciseVisuals();');
  assert.equal(f.run('jobs.size'),0);assert.equal(f.run('exerciseVisualStates.size'),0);
});

test('A guide hidden during rest keeps its introduction available when revealed',f=>{
  f.run('var id=show();exerciseVisualRoot(id).visible=false;initExerciseVisuals();');
  assert.equal(f.run('state(id).autoTried'),false);
  assert.equal(f.run('jobs.size'),0);
  f.run('exerciseVisualRoot(id).visible=true;initExerciseVisuals();');
  assert.equal(f.run('state(id).playing'),true);
  assert.equal(f.run('state(id).autoTried'),true);
});

test('A media failure pauses playback and retains a useful map without throwing',f=>{
  f.run('var id=show();exerciseVisualToggle(id);exerciseVisualMediaFailed(id);exerciseVisualMediaFailed(id);');
  assert.equal(f.run('state(id).error'),true);assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  const html=f.run('html(id)');assert.match(html,/exercise-muscle-map/);assert.match(html,/Referencia no disponible/);
  assert.doesNotMatch(html,/<img|data-visual-action="play"/);
  f.run('exerciseVisualSelect(id,"movement");');assert.equal(f.run('state(id).tab'),'muscles');
  assert.equal(f.run('appRenders'),0);
});

test('A known demonstration without a muscle profile falls back to written guidance',f=>{
  f.run('exerciseMuscleProfile=()=>null;var id=show();');
  assert.equal(f.run('state(id).demo?.key'),'bench_barbell');
  f.run('exerciseVisualToggle(id);exerciseVisualMediaFailed(id);');
  assert.equal(f.run('state(id).profile'),null);
  assert.equal(f.run('state(id).error'),true);
  assert.equal(f.run('state(id).tab'),'illustration');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('jobs.size'),0);
  const html=f.run('html(id)');assert.match(html,/data-visual-placeholder/);assert.match(html,/Conservamos las indicaciones/);
  assert.doesNotMatch(html,/exercise-reference-illustration/);
  assert.doesNotMatch(html,/<img|data-visual-action="muscles"|data-visual-action="play"/);
});

test('Custom fallback keeps guide controls but cannot invent an illustration or muscle tab',f=>{
  f.run("var id=show({id:'custom_1',name:'Mi ejercicio de prueba',equipment:'custom'});");
  assert.equal(f.run('state(id).profile'),null);
  const before=f.run('snapshot()');
  f.run('exerciseVisualSelect(id,"muscles");exerciseVisualFlip(id);');
  assert.equal(f.run('state(id).tab'),'illustration');
  f.run('exerciseVisualSelect(id,"illustration");exerciseVisualExpand(id);');
  assert.equal(f.run('focused'),'expand');assert.equal(f.run('state(id).expanded'),true);
  assert.equal(f.run('snapshot()'),before);
  assert.match(f.run('html(id)'),/data-visual-placeholder/);
  assert.doesNotMatch(f.run('html(id)'),/exercise-reference-illustration|<svg/);
  assert.doesNotMatch(f.run('html(id)'),/data-visual-action="movement"|data-visual-action="muscles"/);
});

test('Tabs, front/back and expansion retain keyboard focus on the chosen control',f=>{
  f.run('var id=show();exerciseVisualToggle(id);exerciseVisualSelect(id,"muscles");');
  assert.equal(f.run('focused'),'muscles');assert.equal(f.run('state(id).playing'),false);
  f.run('exerciseVisualFlip(id);');assert.equal(f.run('focused'),'view');assert.equal(f.run('state(id).view'),'back');
  assert.match(f.run('html(id)'),/Vista dorsal/);
  f.run('exerciseVisualExpand(id);');assert.equal(f.run('focused'),'expand');assert.equal(f.run('state(id).expanded'),true);
  assert.equal(f.run('exerciseVisualRoot(id).classList.contains("is-expanded")'),true);
  assert.match(f.run('html(id)'),/aria-expanded="true"/);
  f.run('exerciseVisualSelect(id,"movement");');assert.equal(f.run('focused'),'movement');
});

test('Expanding the second pose retains a loaded source for the visible image',f=>{
  f.run('var id=show();exerciseVisualToggle(id);advance(1800);exerciseVisualExpand(id);');
  assert.equal(f.run('state(id).frame'),1);
  assert.equal(f.run('exerciseVisualRoot(id).images[1].getAttribute("src")'),'assets/exercise-media/bench-press-2.png');
  assert.equal(f.run('exerciseVisualRoot(id).images[1].classList.contains("is-visible")'),true);
});

test('English content and accessible controls are explicit and truthful',f=>{
  f.run("lang='en';var id=show();");let html=f.run('html(id)');
  assert.match(html,/Two reference positions, not a continuous video/);assert.match(html,/See the movement/);
  assert.match(html,/Position 1 of 2/);assert.match(html,/Play reference sequence/);assert.match(html,/Enlarge guide/);
  assert.doesNotMatch(html,/Mira el movimiento|Reproducir|Posición/);
  f.run('exerciseVisualSelect(id,"muscles");');html=f.run('html(id)');
  assert.match(html,/Main: Chest/);assert.match(html,/Support: Triceps/);assert.match(html,/Front view/);
  assert.match(html,/Indicative zones, not measured activation|not measured muscle activity/);
});

test('Imported text is escaped and unsafe profile sources cannot produce active links',f=>{
  assert.equal(f.run('exerciseVisualEscape(\'<img x="1"> & \\\'\')'),'&lt;img x=&quot;1&quot;&gt; &amp; &#39;');
  f.run(`exerciseMuscleProfile=()=>({key:'bench_barbell',primary:['chest'],secondary:[],sources:['javascript:alert(1)'],cue:{es:'<img src=x onerror=alert(1)> & "literal"',en:''}});var id=show();`);
  let html=f.run('html(id)');assert.doesNotMatch(html,/<img src=x|href="javascript:/);assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;literal&quot;/);
  f.run('exerciseVisualSelect(id,"muscles");');html=f.run('html(id)');assert.doesNotMatch(html,/href="javascript:/);
});

test('Custom exercise names stay escaped inside their neutral written guide',f=>{
  f.run(`var id=show({id:'custom_1',name:'<img src=x onerror=alert(1)> & "custom"',equipment:'custom'});`);
  const html=f.run('html(id)');assert.doesNotMatch(html,/<img src=x|<script/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;custom&quot;/);
  assert.match(html,/Ejercicio personalizado: sin demostración revisada/);
  assert.equal(f.run('requests.length'),0);
});

test('A reviewed generated diptych takes priority over licensed pictures and has specific accessible text',f=>{
  installGenerated(f);
  f.run('var id=show();');
  const html=f.run('html(id)');
  assert.equal(f.run('state(id).generated.kind'),'positions');
  assert.match(html,/src="assets\/exercise-media\/generated\/bench-press-barbell-v1\.webp"/);
  assert.match(html,/alt="Press de banca con barra: dos posiciones sobre un banco plano\."/);
  assert.match(html,/>Posiciones<\/button>/);
  assert.match(html,/data-visual-generated="positions"/);
  assert.match(html,/loading="lazy" decoding="async"/);
  assert.match(html,/Ilustración generada con IA/);
  assert.doesNotMatch(html,/Everkinetic|CC BY-SA|<video|autoplay|data-visual-action="play"|data-visual-action="expand"|data-visual-phase|data-visual-frame|data-src=|data-visual-specific-caption/);
  assert.equal(f.run('requests.length'),1);
  assert.equal(f.run('exerciseVisualRoot(id).classList.contains("is-generated")'),true);
  assert.equal(f.run('exerciseVisualRoot(id).getAttribute("data-generated-kind")'),'positions');
});

test('Generated positions remain static during introduction, manual play, rest and reduced-motion changes',f=>{
  installGenerated(f);
  f.run('var id=show();');const before=f.run('snapshot()');
  f.run('initExerciseVisuals();exerciseVisualToggle(id);advance(12000);setReduced(true);exerciseVisualToggle(id);syncExerciseVisualRest(45,90,true);');
  assert.equal(f.run('state(id).playing'),false);assert.equal(f.run('state(id).frame'),0);
  assert.equal(f.run('jobs.size'),0);assert.equal(f.run('requests.length'),1);
  assert.equal(f.run('snapshot()'),before);assert.equal(f.run('appRenders'),0);
});

test('Generated overviews describe the block without claiming two positions or continuous movement',f=>{
  installGenerated(f,{...generatedPositions,kind:'overview',alt:{es:'Material preparado para un bloque de varios ejercicios.',en:'Equipment prepared for a block with several exercises.'}});
  f.run("lang='en';var id=show();");
  const html=f.run('html(id)');
  assert.match(html,/>Block overview<\/button>/);
  assert.match(html,/data-visual-generated="overview"/);
  assert.match(html,/alt="Equipment prepared for a block with several exercises\."/);
  assert.doesNotMatch(html,/Two static|two positions|Position 1|Reference positions|data-visual-action="play"|data-visual-action="expand"|data-visual-specific-caption/);
  f.run('initExerciseVisuals();exerciseVisualToggle(id);advance(7200);');
  assert.equal(f.run('jobs.size'),0);
});

test('Generated English alt and position labels do not leak Spanish captions',f=>{
  installGenerated(f);
  f.run("lang='en';var id=show();");
  const html=f.run('html(id)');
  assert.match(html,/>Positions<\/button>/);
  assert.match(html,/alt="Barbell bench press: two positions on a flat bench\."/);
  assert.match(html,/AI-generated illustration for EntrenoApp/);
  assert.doesNotMatch(html,/Posiciones de referencia|Ilustración generada|dos posiciones sobre/);
});

test('A complete profile-specific generated alt is visible alongside the cue, stays escaped in both languages and never mutates inputs',f=>{
  installGenerated(f);
  f.run('var specificAlt=Object.freeze({es:"Ejemplo de press con apoyo <estable>.",en:"Example of a press with <stable> & controlled support."}),profileLookup=exerciseIllustrationProfile;exerciseIllustrationProfile=ex=>{const entry=profileLookup(ex);return entry?Object.freeze({...entry,generatedMediaAlt:specificAlt}):null;};var exactProfile=exerciseIllustrationProfile(bench),profileBefore=JSON.stringify(exactProfile),assetBefore=JSON.stringify(generatedRecord),derived=exerciseVisualGenerated(exactProfile);var id=show();');
  assert.deepEqual(f.plain('derived.alt'),{es:'Ejemplo de press con apoyo <estable>.',en:'Example of a press with <stable> & controlled support.'});
  assert.equal(f.run('derived.hasSpecificAlt'),true);
  assert.match(f.run('html(id)'),/alt="Ejemplo de press con apoyo &lt;estable&gt;\."/);
  assert.match(f.run('html(id)'),/<p class="exercise-visual-cue" data-visual-specific-caption>Ejemplo de press con apoyo &lt;estable&gt;\.<\/p>/);
  assert.ok(f.run('html(id)').includes('<p class="exercise-visual-cue">'+f.run('exerciseVisualEscape(state(id).profile.cue.es)')+'</p>'));
  assert.doesNotMatch(f.run('html(id)'),/<estable>/);
  f.run('lang="en";var english=show();');
  assert.match(f.run('html(english)'),/alt="Example of a press with &lt;stable&gt; &amp; controlled support\."/);
  assert.match(f.run('html(english)'),/<p class="exercise-visual-cue" data-visual-specific-caption>Example of a press with &lt;stable&gt; &amp; controlled support\.<\/p>/);
  assert.ok(f.run('html(english)').includes('<p class="exercise-visual-cue">'+f.run('exerciseVisualEscape(state(english).profile.cue.en)')+'</p>'));
  assert.doesNotMatch(f.run('html(english)'),/<stable>|Ejemplo de press/);
  assert.equal(f.run('derived.alt===specificAlt'),false);
  assert.equal(f.run('derived.alt===generatedRecord.alt'),false);
  f.run('derived.alt.es="Mutated returned copy";');
  assert.equal(f.run('JSON.stringify(exactProfile)'),f.run('profileBefore'));
  assert.equal(f.run('JSON.stringify(generatedRecord)'),f.run('assetBefore'));
  assert.equal(f.run('exerciseVisualGenerated(exactProfile).alt.es'),'Ejemplo de press con apoyo <estable>.');
});

test('An incomplete profile-specific generated alt falls back to the complete asset pair without mixing or mutation',f=>{
  installGenerated(f);
  f.run('var id=show();');
  for(const override of [null,{}, {es:'Specific Spanish only'},{en:'Specific English only'},{es:'Specific Spanish',en:' '},{es:42,en:'Specific English'}]){
    f.run('var partialProfile={generatedMediaKey:"fixture_reference",generatedMediaAlt:'+JSON.stringify(override)+'},profileBefore=JSON.stringify(partialProfile),assetBefore=JSON.stringify(generatedRecord),derived=exerciseVisualGenerated(partialProfile);');
    assert.deepEqual(f.plain('derived.alt'),generatedPositions.alt);
    assert.equal(f.run('derived.hasSpecificAlt'),false);
    assert.doesNotMatch(f.run('exerciseVisualMarkup({...state(id),generated:derived})'),/data-visual-specific-caption|Specific Spanish|Specific English/);
    f.run('derived.alt.es="Mutated returned fallback";');
    assert.equal(f.run('JSON.stringify(partialProfile)'),f.run('profileBefore'));
    assert.equal(f.run('JSON.stringify(generatedRecord)'),f.run('assetBefore'));
    assert.deepEqual(f.plain('exerciseVisualGenerated(partialProfile).alt'),generatedPositions.alt);
  }
});

test('A specific overview caption is shown once alongside the original cue in both languages',f=>{
  installGenerated(f,{...generatedPositions,kind:'overview'});
  f.run('var specificAlt=Object.freeze({es:"Ejemplo de opciones <revisadas> & material.",en:"Example of <reviewed> options & equipment."}),profileLookup=exerciseIllustrationProfile;exerciseIllustrationProfile=ex=>{const entry=profileLookup(ex);return entry?Object.freeze({...entry,generatedMediaAlt:specificAlt}):null;};');
  for(const language of ['es','en']){
    f.run('lang='+JSON.stringify(language)+';var id=show();');
    const html=f.run('html(id)'),caption=f.run('exerciseVisualEscape(specificAlt[lang])'),cue=f.run('exerciseVisualEscape(state(id).profile.cue[lang])');
    assert.equal((html.match(/data-visual-specific-caption/g)||[]).length,1);
    assert.equal(html.split('<p class="exercise-visual-cue" data-visual-specific-caption>'+caption+'</p>').length-1,1);
    assert.ok(html.includes('<p class="exercise-visual-cue">'+cue+'</p>'));
    assert.doesNotMatch(html,/<reviewed>|<revisadas>/);
    f.run('state(id).profile={...state(id).profile,cue:{...state(id).profile.cue,[lang]:specificAlt[lang]}};exerciseVisualPaint(state(id));');
    assert.equal(f.run('html(id)').split(caption+'</p>').length-1,1);
  }
});

test('The generated asset guard only accepts versioned local PNG or WebP paths',f=>{
  for(const file of ['generated/squat-v1.webp','generated/squat-v12.png']){
    assert.equal(f.run('exerciseVisualSafeGeneratedAsset('+JSON.stringify(file)+')'),'assets/exercise-media/'+file);
  }
  for(const file of [null,'generated/squat.webp','generated/squat-v0.png','squat-v1.png','../squat-v1.webp','generated/../squat-v1.webp','generated/sub/squat-v1.webp','https://evil.test/generated/squat-v1.webp','//evil.test/squat-v1.webp','generated/squat-v1.webp?x=1','generated/squat-v1.svg','generated/squat-v1.gif','generated/squat" onerror="x-v1.png']){
    assert.equal(f.run('exerciseVisualSafeGeneratedAsset('+JSON.stringify(file)+')'),'');
  }
});

test('Generated JPEG fallback paths must share the exact local WebP basename and version',f=>{
  const webp='generated/bench-press-barbell-v1.webp',jpg='generated/bench-press-barbell-v1.jpg';
  assert.equal(f.run('exerciseVisualSafeGeneratedFallback('+JSON.stringify(jpg)+','+JSON.stringify(webp)+')'),'assets/exercise-media/'+jpg);
  for(const file of [null,'https://evil.test/bench-press-barbell-v1.jpg','//evil.test/bench-press-barbell-v1.jpg','../bench-press-barbell-v1.jpg','generated/../bench-press-barbell-v1.jpg','generated/bench-press-barbell-v2.jpg','generated/other-v1.jpg','generated/bench-press-barbell-v1.jpeg','generated/bench-press-barbell-v1.jpg?x=1','generated/bench-press-barbell-v1.png']){
    assert.equal(f.run('exerciseVisualSafeGeneratedFallback('+JSON.stringify(file)+','+JSON.stringify(webp)+')'),'');
  }
  assert.equal(f.run('exerciseVisualSafeGeneratedFallback('+JSON.stringify(jpg)+',"generated/bench-press-barbell-v1.png")'),'');
});

test('A valid JPEG fallback renders one picture with a WebP source and one accessible lazy image',f=>{
  installGenerated(f,{...generatedPositions,fallbackFile:'generated/bench-press-barbell-v1.jpg'});
  f.run('var id=show();');
  const html=f.run('html(id)');
  assert.equal(f.run('state(id).generated.fallbackFile'),'generated/bench-press-barbell-v1.jpg');
  assert.match(html,/<picture><source type="image\/webp" srcset="assets\/exercise-media\/generated\/bench-press-barbell-v1\.webp"><img/);
  assert.match(html,/src="assets\/exercise-media\/generated\/bench-press-barbell-v1\.jpg"/);
  assert.match(html,/alt="Press de banca con barra: dos posiciones sobre un banco plano\."/);
  assert.match(html,/loading="lazy" decoding="async"/);
  assert.match(html,/onerror="exerciseVisualMediaFailed\(\d+,'generated'\)"/);
  assert.equal((html.match(/<img\b/g)||[]).length,1);
  assert.equal(f.run('exerciseVisualRoot(id).images[0].currentSrc'),'assets/exercise-media/generated/bench-press-barbell-v1.webp');
  assert.deepEqual(f.plain('requests'),['assets/exercise-media/generated/bench-press-barbell-v1.webp']);
  assert.doesNotMatch(html,/data-visual-action="play"|data-visual-action="expand"/);
});

test('A browser without WebP support selects only the JPEG fallback and retains safe failure handling',f=>{
  installGenerated(f,{...generatedPositions,fallbackFile:'generated/bench-press-barbell-v1.jpg'});
  f.run('webpSupported=false;var id=show();initExerciseVisuals();');
  assert.equal(f.run('exerciseVisualRoot(id).images[0].currentSrc'),'assets/exercise-media/generated/bench-press-barbell-v1.jpg');
  assert.deepEqual(f.plain('requests'),['assets/exercise-media/generated/bench-press-barbell-v1.jpg']);
  assert.equal(f.run('jobs.size'),0);
  const before=f.run('snapshot()');
  f.run('exerciseVisualMediaFailed(id,"generated");');
  assert.match(f.run('html(id)'),/bench-press-1\.png|Everkinetic/);
  assert.doesNotMatch(f.run('html(id)'),/<picture|data-visual-generated/);
  assert.equal(f.run('snapshot()'),before);assert.equal(f.run('jobs.size'),0);
});

test('Invalid optional JPEG metadata rejects generated media rather than injecting a fallback URL',f=>{
  installGenerated(f,{...generatedPositions,fallbackFile:'https://untrusted.example/bench-press-barbell-v1.jpg'});
  f.run('var id=show();');
  assert.equal(f.run('state(id).generated'),null);
  assert.match(f.run('html(id)'),/bench-press-1\.png/);
  assert.doesNotMatch(f.run('html(id)'),/untrusted\.example|<picture/);
  f.run('generatedRecord.fallbackFile=null;var malformed=show();');
  assert.equal(f.run('state(malformed).generated'),null);
});

test('Generated media without fallback metadata retains the original single-image markup',f=>{
  installGenerated(f);
  f.run('var id=show();');
  const html=f.run('html(id)');
  assert.doesNotMatch(html,/<picture|<source/);
  assert.match(html,/src="assets\/exercise-media\/generated\/bench-press-barbell-v1\.webp"/);
  assert.equal(f.run('requests.length'),1);
});

test('Draft, incomplete, external, wrong-source or unknown-kind generated records fall back to licensed media',f=>{
  installGenerated(f);
  const invalid=[
    null,{...generatedPositions,status:'draft'},{...generatedPositions,source:'licensed'},
    {...generatedPositions,kind:'video'},{...generatedPositions,file:'https://untrusted.example/squat-v1.webp'},
    {...generatedPositions,alt:{es:'Texto'}},{...generatedPositions,alt:{es:' ',en:'Text'}}
  ];
  for(const asset of invalid){
    f.run('generatedRecord='+JSON.stringify(asset)+';var id=show();');
    assert.equal(f.run('state(id).generated'),null);
    const html=f.run('html(id)');
    assert.match(html,/src="assets\/exercise-media\/bench-press-1\.png"/);
    assert.doesNotMatch(html,/data-visual-generated|untrusted\.example/);
  }
});

test('A generated registry exception cannot stop rendering the licensed fallback',f=>{
  installGenerated(f);
  f.run('exerciseGeneratedMedia=()=>{throw Error("Unavailable registry");};var id=show();');
  assert.equal(f.run('state(id).generated'),null);
  assert.match(f.run('html(id)'),/bench-press-1\.png/);
});

test('Generated lookup is attached to an exact catalogue variant, not a matching name or custom ID',f=>{
  installGenerated(f,generatedPositions,{id:'sq',name:'Sentadilla goblet',equipment:'mancuernas'});
  f.run("var exact=show({id:'sq',name:'Sentadilla goblet',equipment:'mancuernas'});");
  assert.ok(f.run('state(exact).generated'));
  for(const ex of [{id:'kb_goblet',name:'Goblet squat',equipment:'kettlebell'},{id:'sq',name:'Sentadilla goblet',equipment:'kettlebell'},{id:'custom',name:'Sentadilla goblet',equipment:'mancuernas'}]){
    f.run('var other=show('+JSON.stringify(ex)+');');
    assert.equal(f.run('state(other).generated'),null);
    assert.doesNotMatch(f.run('html(other)'),/data-visual-generated/);
  }
});

test('A failed generated image falls back to licensed media with the correct provenance and layout',f=>{
  installGenerated(f);
  f.run('var id=show();exerciseVisualMediaFailed(id,"generated");');
  assert.equal(f.run('state(id).generatedError'),true);assert.equal(f.run('state(id).error'),false);
  assert.equal(f.run('state(id).tab'),'movement');
  assert.equal(f.run('exerciseVisualRoot(id).classList.contains("is-generated")'),false);
  assert.equal(f.run('exerciseVisualRoot(id).getAttribute("data-generated-kind")'),null);
  const html=f.run('html(id)');
  assert.match(html,/bench-press-1\.png|Everkinetic/);
  assert.match(html,/Mostramos una referencia alternativa/);
  assert.doesNotMatch(html,/data-visual-generated|Ilustración generada con IA/);
  assert.equal(f.run('jobs.size'),0,'Fallback must not start an automatic reference sequence');
  f.run('exerciseVisualToggle(id);');
  assert.equal(f.run('state(id).playing'),true,'The licensed reference remains available for optional replay');
});

test('Failures descend from generated to licensed to map, never to the rejected basic sketch',f=>{
  installGenerated(f);
  f.run('var id=show();exerciseVisualMediaFailed(id,"generated");exerciseVisualToggle(id);exerciseVisualMediaFailed(id,"licensed");');
  assert.equal(f.run('state(id).tab'),'muscles');assert.equal(f.run('state(id).playing'),false);
  assert.equal(f.run('jobs.size'),0);
  const html=f.run('html(id)');
  assert.match(html,/exercise-muscle-map|Conservamos el mapa/);
  assert.doesNotMatch(html,/<img|exercise-reference-illustration/);
});

test('A failed generated image without licensed media or a map retains neutral written cues',f=>{
  installGenerated(f,generatedPositions,{id:'sq',name:'Sentadilla goblet',equipment:'mancuernas'});
  f.run('exerciseMuscleProfile=()=>null;var id=show({id:"sq",name:"Sentadilla goblet",equipment:"mancuernas"});exerciseVisualMediaFailed(id,"generated");');
  assert.equal(f.run('state(id).tab'),'illustration');
  const html=f.run('html(id)');
  assert.match(html,/data-visual-placeholder|Conservamos las indicaciones/);
  assert.doesNotMatch(html,/<img|<svg|exercise-reference-illustration|data-visual-action="play"/);
});

test('Generated alt descriptions are escaped and cannot inject markup or handlers',f=>{
  installGenerated(f,{...generatedPositions,alt:{es:'"><script>alert(1)</script> & "descripción"',en:'Safe text'}});
  f.run('var id=show();');
  const html=f.run('html(id)');
  assert.match(html,/alt="&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;descripción&quot;"/);
  assert.doesNotMatch(html,/<script>|alt=""><script/);
});

test('Static generated media has no ineffective expand control, while its muscle map can still expand',f=>{
  installGenerated(f);
  f.run('var id=show();');const before=f.run('snapshot()');
  assert.doesNotMatch(f.run('html(id)'),/data-visual-action="expand"|exercise-visual-controls/);
  f.run('exerciseVisualExpand(id);');
  assert.equal(f.run('state(id).expanded'),false);assert.equal(f.run('focused'),'');
  f.run('exerciseVisualSelect(id,"muscles");');
  assert.equal(f.run('focused'),'muscles');assert.equal(f.run('exerciseVisualRoot(id).classList.contains("is-generated")'),false);
  assert.match(f.run('html(id)'),/data-visual-action="expand"/);
  f.run('exerciseVisualExpand(id);');
  assert.equal(f.run('focused'),'expand');assert.equal(f.run('state(id).expanded'),true);
  f.run('exerciseVisualSelect(id,"movement");');
  assert.equal(f.run('focused'),'movement');assert.equal(f.run('exerciseVisualRoot(id).classList.contains("is-generated")'),true);
  assert.doesNotMatch(f.run('html(id)'),/data-visual-action="expand"|exercise-visual-controls/);
  f.run('exerciseVisualExpand(id);');
  assert.equal(f.run('focused'),'movement');
  assert.equal(f.run('state(id).expanded'),true);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('snapshot()'),before);
});

test('Basic SVG support is opt-in for legacy checks and absent from normal known-card UI',f=>{
  f.run('var regular=show({id:"rb",name:"Remo con banda",equipment:"bandas"});var legacy=show({id:"rb",name:"Remo con banda",equipment:"bandas"},{legacyIllustration:true});');
  assert.doesNotMatch(f.run('html(regular)'),/exercise-reference-illustration/);
  assert.match(f.run('html(legacy)'),/exercise-reference-illustration/);
});

test('All 304 inventoried variants render exact media, muscle maps or neutral text without basic SVGs',f=>{
  assert.ok(catalogueSource,'The real exercise-visual-catalogue.js module is required');
  assert.equal(f.run('typeof exerciseIllustrationCatalogue'),'function');
  const before=f.run('snapshot()');
  const report=f.plain(`(()=>{
    const entries=exerciseIllustrationCatalogue(),missing=[],unreviewed=[],mismatched=[],basic=[];let png=0,maps=0,text=0;
    for(const entry of entries){
      const id=show(entry),visual=id&&state(id),markup=id&&html(id);
      if(!id||!/<(?:svg|img)\\b|data-visual-placeholder/.test(markup||''))missing.push(entry);
      if(/exercise-reference-illustration/.test(markup||''))basic.push(entry);
      if(!visual?.illustration?.known)unreviewed.push(entry);
      if(visual?.demo){png++;if(visual.demo.key!==entry.mediaKey)mismatched.push({entry,actual:visual.demo.key});}
      else if(/exercise-muscle-map/.test(markup||''))maps++;else text++;
      if(id){detach(id);initExerciseVisuals();}
    }
    return{count:entries.length,png,maps,text,missing,unreviewed,mismatched,basic};
  })()`);
  assert.equal(report.count,304);
  assert.deepEqual(report.missing,[]);
  assert.deepEqual(report.unreviewed,[]);
  assert.deepEqual(report.mismatched,[]);
  assert.deepEqual(report.basic,[]);
  assert.ok(report.png>0);assert.ok(report.maps>0);assert.ok(report.text>0);
  assert.equal(report.png+report.maps+report.text,304);
  assert.equal(f.run('snapshot()'),before);
  assert.equal(f.run('appRenders'),0);assert.equal(f.run('jobs.size'),0);
});

test('Catalogue media mappings cannot conflate incline, posture, grip or machine position',f=>{
  assert.ok(catalogueSource,'The real exercise-visual-catalogue.js module is required');
  const entries=f.plain('exerciseIllustrationCatalogue()');
  const testedKeys=new Set();
  for(const entry of entries){
    const name=String(entry.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const key=entry.mediaKey;if(!key)continue;
    testedKeys.add(key);
    if(key==='bench_dumbbell_flat')assert.doesNotMatch(name,/inclin|declin/,JSON.stringify(entry));
    if(key==='bench_dumbbell_incline')assert.match(name,/inclin/,JSON.stringify(entry));
    if(key==='overhead_dumbbell_seated'||key==='overhead_barbell_seated')assert.match(name,/sentad|seated/,JSON.stringify(entry));
    if(key==='barbell_row_supinated')assert.match(name,/supin|reverse/,JSON.stringify(entry));
    if(key==='dumbbell_row_rear_delts')assert.match(name,/posterior|rear/,JSON.stringify(entry));
    if(key==='dip_bodyweight')assert.doesNotMatch(name,/asist|lastr|weighted|assisted/,JSON.stringify(entry));
    if(key==='leg_curl_lying')assert.match(name,/tumbad|prono|lying/,JSON.stringify(entry));
    if(key==='leg_curl_seated')assert.match(name,/sentad|seated/,JSON.stringify(entry));
    if(key==='leg_curl_standing')assert.match(name,/de pie|standing/,JSON.stringify(entry));
    assert.doesNotMatch(key,/lat_pulldown_wide|band_squat|calf_cropped|behind_neck/);
  }
  assert.ok(testedKeys.has('bench_barbell'));
  assert.ok(testedKeys.has('bench_dumbbell_incline'));
});

test('Every known catalogue pose has a renderer rather than a silent custom-card fallback',f=>{
  assert.ok(catalogueSource,'The real exercise-visual-catalogue.js module is required');
  const missing=f.plain(`(()=>{const available=new Set(exerciseIllustrationPoseKeys());return [...new Set(exerciseIllustrationCatalogue().map(entry=>entry.pose).filter(pose=>!available.has(pose)))];})()`);
  assert.deepEqual(missing,[]);
});

test('Malformed exercise inputs do not create a misleading empty visual card',f=>{
  for(const value of [null,[],{}, {name:''},{name:'   '},{name:123}])assert.equal(f.run(`renderExerciseVisual(${JSON.stringify(value)})`),'');
  assert.equal(f.run('exerciseVisualStates.size'),0);
});

test('Missing roots, invalid control IDs and empty profiles are safe no-ops',f=>{
  const before=f.run('snapshot()');
  f.run('exerciseVisualToggle(999);exerciseVisualPause(999);exerciseVisualSelect(999,"movement");exerciseVisualExpand(999);exerciseVisualFlip(999);exerciseVisualMediaFailed(999);initExerciseVisuals();');
  assert.equal(f.run('snapshot()'),before);assert.equal(f.run('jobs.size'),0);
  assert.equal(f.run('exerciseVisualDemo(null)'),null);
  assert.equal(f.run('appRenders'),0);
});

console.log(`\n${passed} exercise visual tests passed, ${failed} failed.`);
if(failed)process.exitCode=1;
