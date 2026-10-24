#!/usr/bin/env node
'use strict';

// Run the real daily-workout, logging and rest-timer functions in isolation.
// Only browser UI, scheduling, storage and other IO are replaced; no user data is read.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(kind, name) {
  const start = source.search(new RegExp(`^${kind} ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app declaration: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

const functions = [
  'workoutPresentation', 'dailyGuidedAvailable', 'dailyWorkoutFocus', 'setWorkoutPresentation',
  'dailyGuidedCurrent', 'dailyChooseExercise', 'dailyCompleteSet',
  'syncDailyWorkoutRest', 'renderDailyRestScene', 'renderDailyGuidedWorkout', 'renderWorkout',
  'exKey', 'completion', 'isTimedExercise', 'isBodyweightExercise', 'isBandExercise',
  'workoutNumber', 'validWorkoutSet', 'recordedReferenceSet', 'validatePendingWorkoutSets',
  'updSet', 'exDone', 'tDone', 'completeExercise', 'nextPendingExerciseKey', 'handleExerciseCompleted',
  'exerciseForKey', 'exerciseRest', 'nextSetIndex', 'nextSetLabel', 'autoStartRest',
  'alternativesFor', 'selectedAlt', 'exerciseVariantName', 'exerciseHistoryEquipment',
  'workoutExerciseReference', 'compatibleExerciseRecord', 'exerciseHistory', 'lastExerciseRecord',
  'vitalFriendlyCopy', 'displayExerciseName', 'bandResistanceLabel', 'bandOptions',
  'jsAttrArg', 'escHtml', 'compactPreviousLabel', 'compactSetInput',
  'todayDay', 'welcomeWorkoutDay', 'estimateExerciseSec', 'estimateDayMin',
  'liveWorkoutMetrics', 'workoutClockLabel', 'workoutVolumeLabel',
  'renderWorkoutSessionBar', 'renderWorkoutWodArena', 'workoutModeNote', 'workoutFold',
  'renderVitalSavePanel', 'renderWelcomeSavePanel', 'workoutFeelingLabel', 'openFinishWorkout',
  'resumeRestTimer', 'startTimer', 'syncRestTimer', 'finishRestTimer', 'updTimer',
  'addTimerSeconds', 'toggleTimerPause', 'stopTimer',
];

function fixture() {
  const context = vm.createContext({ console, Math, Set, Map });
  vm.runInContext(`
    let S,W,WD,clock=1000000,sequence=0,jobs=new Map(),nodes=new Map(),storage=new Map();
    let messages=[],events=[],draftSaves=0,sessionSaves=0,localized=0,storageReads=0,storageWrites=0,focused=null;
    let readError=false,writeError=false,tmrInt=null,tmrLeft=0,tmrTotal=0,tmrWarned=new Set(),tmrPaused=false,tmrNext='';
    const Date={now:()=>clock};
    const press={id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:2,rr:'8-12',rest:75};
    const row={id:'custom_row',name:'Mi remo',type:'strength',equipment:'custom',sets:2,rr:'10-12',rest:60};
    const squat={id:'custom_squat',name:'Sentadilla goblet',type:'strength',equipment:'mancuernas',sets:1,rr:'10-12',rest:45};
    function element(id,owner=null){
      let html='';
      const node={id,owner,className:'',textContent:'',style:{},hidden:false,open:false,scrollTop:0,focus(){focused=id;}};
      node.classList={
        contains(name){return node.className.split(/\\s+/).includes(name);},
        add(...names){node.className=[...new Set([...node.className.split(/\\s+/).filter(Boolean),...names])].join(' ');},
        remove(...names){node.className=node.className.split(/\\s+/).filter(name=>!names.includes(name)).join(' ');},
        toggle(name,on){if(on===undefined)on=!this.contains(name);on?this.add(name):this.remove(name);return on;}
      };
      Object.defineProperty(node,'innerHTML',{get(){return html;},set(value){
        html=String(value);
        for(const [key,child] of nodes)if(child.owner===id)nodes.delete(key);
        // A minimal DOM adapter exposes actual rendered IDs for the rest-visibility logic.
        for(const match of html.matchAll(/<[a-z][a-z0-9-]*\\b([^>]*\\bid="([^"]+)"[^>]*)>/gi)){
          const child=element(match[2],id),attrs=match[1];
          child.className=attrs.match(/\\bclass="([^"]*)"/)?.[1]||'';
          child.hidden=/(?:^|\\s)hidden(?:\\s|$|=)/.test(attrs);
          child.open=/(?:^|\\s)open(?:\\s|$|=)/.test(attrs);
        }
      }});
      nodes.set(id,node);return node;
    }
    const document={hidden:false,getElementById:id=>nodes.get(id)||null,querySelector(){return null;},addEventListener(){}};
    const window={addEventListener(){}};
    const navigator={};
    const localStorage={
      getItem(key){storageReads++;if(readError)throw Error('storage unavailable');return storage.get(key)??null;},
      setItem(key,value){storageWrites++;if(writeError)throw Error('storage full');storage.set(key,String(value));}
    };
    function setInterval(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:true});return id;}
    function setTimeout(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:false});return id;}
    function requestAnimationFrame(fn){fn();}
    function clearInterval(id){jobs.delete(id);}
    function clearTimeout(id){jobs.delete(id);}
    function advance(ms){
      const target=clock+ms;
      for(let guard=0;guard<10000;guard++){
        let first=null;
        for(const [id,job] of jobs)if(job.at<=target&&(!first||job.at<first[1].at))first=[id,job];
        if(!first){clock=target;return;}
        const [id,job]=first;clock=job.at;
        if(job.interval)job.at+=job.delay;else jobs.delete(id);
        job.fn();
      }
      throw Error('Fake timer loop exceeded limit');
    }
    function currentLang(){return S.lang;}
    function lt(value){return value;}
    function toast(message){messages.push(message);}
    function saveWorkoutDraft(){draftSaves++;}
    function saveSession(){sessionSaves++;}
    function trackOnce(name,data){events.push({name,data});}
    function coachPush(){}
    function coachRoundMessage(){return '';}
    function scheduleLiveCoachNotification(){}
    function focusExerciseCard(){}
    function renderWristMode(){}
    function updateProgressUI(){syncDailyWorkoutRest();}
    function localizeTree(){localized++;}
    function initSkeletonGuides(){}
    function startWorkoutUiTicker(){syncDailyWorkoutRest();}
    function sessionSetupCard(){return '<div data-ui="session-setup"></div>';}
    function renderVitalSafetyCard(){return '<div data-ui="vital-safety"></div>';}
    function workoutNextHeadline(){return 'Existing direct-view next action';}
    function exCard(ex,index){return '<article data-existing-card="'+index+'">'+escHtml(ex.name)+'</article>';}
    function unlockAudio(){}
    function soundState(){return {enabled:false,countdown:false,vibration:false};}
    function restCue(){}
    function installDay(day,rows){
      W.baseDay=JSON.parse(JSON.stringify(day));W.sessionDay=JSON.parse(JSON.stringify(day));
      S.routine=[JSON.parse(JSON.stringify(day))];
      WD=rows||Object.fromEntries(day.exercises.map((ex,i)=>[exKey(ex,i),Array.from({length:ex.sets||1},()=>({kg:ex.equipment==='gym'?40:0,reps:10,band:'',done:false}))]));
    }
    function render(){renderWorkout();return document.getElementById('content').innerHTML;}
    function reset(){
      nodes=new Map();jobs.clear();storage.clear();clock=1000000;sequence=0;
      messages=[];events=[];draftSaves=0;sessionSaves=0;localized=0;storageReads=0;storageWrites=0;readError=false;writeError=false;focused=null;
      tmrInt=null;tmrLeft=0;tmrTotal=0;tmrWarned=new Set();tmrPaused=false;tmrNext='';
      tmrDeadline=0;tmrRemainingMs=0;tmrLastTickAt=0;tmrFinished=false;tmrHideTimeout=null;tmrGeneration=0;
      for(const id of ['content','rest-timer','td','timer-label','timer-next','timer-pause','tbar','summary-sheet','summary-modal'])element(id);
      S={lang:'es',curDay:0,screen:'workout',profile:{priority:'strength'},sessions:[],routine:[],restPrefs:{}};
      W={active:true,mode:'normal',welcome:false,notes:'Nota de hoy',bw:'77',feel:'bien',alt:{},openPanel:{},startedAt:clock-300000};
      installDay({name:'Fuerza A',exercises:[press,row,squat]});
    }
  `, context);
  vm.runInContext([
    ...['DB','ALT','ALT_EXTRA','SMART_ALT','TIMING'].map(name => declaration('const', name)),
    declaration('let', 'tmrDeadline'),
    ...functions.map(name => declaration('function', name)),
    'reset();',
  ].join('\n'), context, { filename: 'app-daily-workout-functions.js' });
  return {
    run(code) { return vm.runInContext(code, context); },
    plain(code) { return JSON.parse(JSON.stringify(vm.runInContext(code, context))); },
  };
}

let passed=0,failed=0;
function test(name,callback) {
  try {callback(fixture());passed++;console.log('✓ '+name);}
  catch(error) {failed++;console.error('✗ '+name+'\n'+error.stack);}
}

test('View defaults are guided and reject unknown persisted or draft values', f => {
  assert.equal(f.run('workoutPresentation()'),'guided');
  f.run("storage.set('ea_workout_view','unknown');W.presentation='unknown';");
  assert.equal(f.run('workoutPresentation()'),'guided');
  f.run("storage.set('ea_workout_view','direct');");
  assert.equal(f.run('workoutPresentation()'),'direct');
  f.run("W.presentation='guided';");
  assert.equal(f.run('workoutPresentation()'),'guided');
});

test('A blocked storage read safely falls back to guided', f => {
  f.run('readError=true;');
  assert.equal(f.run('workoutPresentation()'),'guided');
});

test('Changing view preserves workout identity, rows, notes, mode and alternatives', f => {
  f.run("W.mode='express_suave';W.alt={pb:'pim'};WD.pb_0[0].done=true;WD.pb_0[1].kg=42.5;W.guidedKey='custom_row_1';");
  const before=f.run('JSON.stringify({S,W,WD})');
  f.run("setWorkoutPresentation('direct');setWorkoutPresentation('guided');");
  const after=f.run('JSON.stringify({S,W:Object.fromEntries(Object.entries(W).filter(([key])=>key!=="presentation")),WD})');
  assert.equal(after,before);
  assert.equal(f.run("storage.get('ea_workout_view')"),'guided');
  assert.equal(f.run('localized'),2);
  assert.equal(f.run('draftSaves'),2);
});

test('Invalid view changes are a strict no-op', f => {
  const before=f.run('JSON.stringify({S,W,WD})');
  for(const value of ['table','',null,0])f.run(`setWorkoutPresentation(${JSON.stringify(value)});`);
  assert.equal(f.run('JSON.stringify({S,W,WD})'),before);
  assert.equal(f.run('storageWrites'),0);
  assert.equal(f.run('localized'),0);
});

test('A blocked storage write does not prevent an in-session view change', f => {
  f.run("writeError=true;setWorkoutPresentation('direct');");
  assert.equal(f.run('W.presentation'),'direct');
  assert.match(f.run("document.getElementById('content').innerHTML"),/data-existing-card="0"/);
});

test('Pending identity and first unfinished set come from WD, not the prescription', f => {
  f.run("W.sessionDay.exercises[0].key='stable-press';WD['stable-press']=WD.pb_0;delete WD.pb_0;WD['stable-press'][0].done=true;");
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'stable-press');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).setIndex'),1);
  assert.equal(f.run("dailyGuidedCurrent(W.sessionDay).set===WD['stable-press'][1]"),true);
});

test('Finished or unavailable exercises are skipped without marking anything', f => {
  f.run('WD.pb_0.forEach(set=>set.done=true);delete WD.custom_row_1;');
  const before=f.run('JSON.stringify(WD)');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'custom_squat_2');
  assert.equal(f.run('JSON.stringify(WD)'),before);
});

test('Manual exercise selection keeps the selected pending exercise across renders', f => {
  f.run('dailyChooseExercise(1);');
  assert.equal(f.run('W.guidedKey'),'custom_row_1');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).index'),1);
  assert.match(f.run("document.getElementById('content').innerHTML"),/<h2\b[^>]*>Mi remo<\/h2>/);
  f.run('WD.custom_row_1[0].done=true;render();');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).setIndex'),1);
});

test('Manual selection uses the active frozen day, not a changed routine', f => {
  f.run("S.routine[0]={name:'Changed',exercises:[]};dailyChooseExercise(2);");
  assert.equal(f.run('W.guidedKey'),'custom_squat_2');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).ex.name'),'Sentadilla goblet');
});

test('Invalid or already completed manual selections do not disturb the current step', f => {
  f.run("W.guidedKey='custom_row_1';WD.pb_0.forEach(set=>set.done=true);");
  for(const value of [-1,0,3,1.5,'1',null])f.run(`dailyChooseExercise(${JSON.stringify(value)});`);
  assert.equal(f.run('W.guidedKey'),'custom_row_1');
  assert.equal(f.run('localized'),0);
});

test('After a selected exercise finishes, selection advances then wraps to skipped work', f => {
  f.run("W.guidedKey='custom_row_1';WD.custom_row_1.forEach(set=>set.done=true);");
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'custom_squat_2');
  f.run('WD.custom_squat_2[0].done=true;');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'pb_0');
});

test('A fully marked session has no pending step and offers review and explicit save', f => {
  f.run('Object.values(WD).flat().forEach(set=>set.done=true);');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay)'),null);
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/Todas las series marcadas|Por hoy, listo/);
  assert.match(html,/onclick="openFinishWorkout\(\)"/);
  assert.match(html,/Vista directa/);
  assert.doesNotMatch(html,/dailyCompleteSet|daily-guided-rest|startTimer/);
  assert.equal(f.run('sessionSaves'),0);
});

test('A regular strength day supports guided mode; absent or empty days do not', f => {
  assert.equal(f.run('dailyGuidedAvailable(W.sessionDay)'),true);
  assert.equal(f.run('dailyGuidedAvailable(null)'),false);
  assert.equal(f.run('dailyGuidedAvailable({})'),false);
  assert.equal(f.run('dailyGuidedAvailable({exercises:[]})'),false);
});

for(const [name,exercise] of [
  ['walking',{id:'walk_test',name:'Paseo',type:'walk',durationMin:10}],
  ['running',{id:'run_test',name:'Carrera',type:'run',durationMin:10}],
  ['timed blocks',{id:'time_test',name:'Bloque',type:'time',durationMin:5}],
  ['legacy timed IDs',{id:'time_legacy',name:'Bloque',type:'strength',durationMin:5}],
  ['supersets',{id:'super_test',name:'Superserie',type:'strength',super:'A'}],
]) {
  test(`${name} retain the existing direct controls even with guided preference`, f => {
    f.run(`installDay({name:'Specific session',exercises:[${JSON.stringify(exercise)}]});W.presentation='guided';`);
    assert.equal(f.run('dailyGuidedAvailable(W.sessionDay)'),false);
    const html=f.run('render()');
    assert.match(html,/data-existing-card="0"/);
    assert.match(html,/controles adaptados de actividad, movilidad o superseries/);
    assert.doesNotMatch(html,/id="daily-guided"|class="daily-workout-view"/);
    assert.equal(f.run('W.presentation'),'guided');
  });
}

for(const extra of [{dailyWod:true},{wodType:'AMRAP'}]) {
  test(`WOD fallback is retained for ${Object.keys(extra)[0]}`, f => {
    f.run(`Object.assign(W.sessionDay,${JSON.stringify(extra)});`);
    assert.equal(f.run('dailyGuidedAvailable(W.sessionDay)'),false);
    const html=f.run('render()');
    assert.match(html,/class="wod-arena"/);
    assert.match(html,/data-existing-card="0"/);
    assert.doesNotMatch(html,/id="daily-guided"/);
  });
}

test('Band sets show resistance plus repetitions, without a load field', f => {
  f.run("installDay({name:'Bandas',exercises:[{id:'custom_band',name:'Remo con banda',type:'band',equipment:'bandas',sets:1,rr:'10-12'}]});WD.custom_band_0[0].band='Fuerte';");
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/<select[^>]*aria-label="Banda serie 1"/);
  assert.match(html,/<option value="Fuerte" selected>/);
  assert.match(html,/Repeticiones/);
  assert.doesNotMatch(html,/'kg'|<span>Kg<\/span>/);
  assert.equal((html.match(/class="compact-input"/g)||[]).length,1);
});

test('Bodyweight sets use a single repetition field and no mandatory added weight', f => {
  f.run("installDay({name:'Casa',exercises:[{id:'custom_pushup',name:'Flexiones',type:'bodyweight',equipment:'nada',sets:1,rr:'8-12'}]});");
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/daily-guided-fields single/);
  assert.doesNotMatch(html,/<span>Kg<\/span>|<select/);
  f.run("dailyCompleteSet('custom_pushup_0',0);");
  assert.equal(f.run('WD.custom_pushup_0[0].done'),true);
});

test('Vital movement keeps its specialized controls instead of forcing numeric guided fields', f => {
  f.run("S.profile.priority='vital';installDay({name:'Moverme',exercises:[{id:'vital_balance',name:'Equilibrio',type:'vital',sets:1,rr:'20-30s',rest:60}]});W.presentation='guided';");
  assert.equal(f.run('dailyGuidedAvailable(W.sessionDay)'),false);
  let html=f.run('render()');
  assert.match(html,/data-existing-card="0"/);
  assert.match(html,/class="vital-save"/);
  assert.doesNotMatch(html,/id="daily-guided"|class="daily-workout-view"/);
  assert.equal(f.run("document.getElementById('content').classList.contains('vital-workout')"),true);
  f.run("S.lang='en';");
  html=f.run('render()');
  assert.match(html,/specific activity, mobility or superset controls/);
  assert.doesNotMatch(html,/id="daily-guided"/);
});

test('The selected alternative supplies both the name and compatible historical reference', f => {
  f.run("W.alt.pb='pim';S.sessions=[{exercises:[{id:'pim',name:'Press con mancuernas',type:'strength',equipment:'mancuernas',sets:[{kg:18,reps:10,done:true}]}]}];");
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/<h2\b[^>]*>Press con mancuernas<\/h2>/);
  assert.match(html,/Última vez, esta serie: 18 kg(?:<br>|\s)× 10/);
  assert.doesNotMatch(html,/<h2\b[^>]*>Press de banca<\/h2>/);
});

test('Historical references keep series positions and omit unperformed source rows', f => {
  f.run('S.sessions=[{exercises:[{...press,sets:[{kg:150,reps:12,done:false},{kg:42,reps:9,done:true}]}]}];');
  assert.match(f.run('renderDailyGuidedWorkout(W.sessionDay)'),/Primera vez con esta serie/);
  f.run('WD.pb_0[0].done=true;');
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/Última vez, esta serie: 42 kg(?:<br>|\s)× 9/);
  assert.doesNotMatch(html,/150 kg/);
});

test('Spanish and English guided copy includes set progress, tools and review', f => {
  const es=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(es,/Ejercicio 1\/3 · sesión 0\/5 series/);
  assert.match(es,/Serie 1 de 2/);
  assert.match(es,/Cómo hacerlo \/ cambiar|Revisar \/ corregir todas las series/);
  f.run("S.lang='en';");
  const en=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(en,/Exercise 1\/3 · session 0\/5 sets/);
  assert.match(en,/Set 1 of 2/);
  assert.match(en,/Repetitions|Set done|How to \/ change exercise|Review \/ edit every set/);
  assert.doesNotMatch(en,/Última vez|Repeticiones|Serie hecha|Después:/);
});

test('A voluntary rest never claims that an unrecorded set was completed', f => {
  const empty=f.run("renderDailyRestScene(false,'Press',0,{done:0,total:6})");
  assert.match(empty,/A tu ritmo · 0\/6/);
  assert.doesNotMatch(empty,/Una más, hecha|One more, done/);
  const recorded=f.run("renderDailyRestScene(true,'Press',1,{done:2,total:6})");
  assert.match(recorded,/What you did counts · 2\/6/);
});

test('Exercise names, prescriptions and stable keys are escaped in markup and handlers', f => {
  f.run(`const hostile={...press,key:'key"<&\\\'test',name:'<img src=x onerror=alert(1)> & "name"',rr:'<svg onload=alert(1)>'};installDay({name:'Safe day',exercises:[hostile]});`);
  const html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  // The rest ring is an intentional SVG; hostile exercise markup must stay text.
  assert.doesNotMatch(html,/<img|<svg\s+onload=/);
  assert.equal((html.match(/<svg\b/g)||[]).length,1);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;name&quot;/);
  assert.match(html,/&lt;svg onload=alert\(1\)&gt;/);
  assert.match(html,/data-ex-key="key&quot;&lt;&amp;&#39;test"/);
  assert.match(html,/dailyCompleteSet\(&quot;key/);
});

test('Band reference labels remain escaped and English resistance labels are translated', f => {
  f.run("installDay({name:'Bandas',exercises:[{id:'custom_band',name:'Remo banda',type:'band',equipment:'bandas',sets:1,rr:'10-12'}]});S.sessions=[{exercises:[{...W.sessionDay.exercises[0],sets:[{kg:0,reps:12,band:'<img src=x>',done:true}]}]}];");
  let html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/&lt;img src=x&gt;(?:<br>|\s)12 reps/);
  assert.doesNotMatch(html,/<img/);
  f.run("S.lang='en';WD.custom_band_0[0].band='Fuerte';");
  html=f.run('renderDailyGuidedWorkout(W.sessionDay)');
  assert.match(html,/<option value="Fuerte" selected>Strong<\/option>/);
});

test('Invalid completion keeps the existing rest and all workout data untouched', f => {
  f.run("render();startTimer(30);WD.pb_0[0].reps=0;");
  const before=f.run('JSON.stringify({W,WD})');
  const generation=f.run('tmrGeneration');
  f.run("dailyCompleteSet('pb_0',0);");
  assert.equal(f.run('JSON.stringify({W,WD})'),before);
  assert.equal(f.run('tmrLeft'),30);
  assert.equal(f.run('tmrGeneration'),generation);
  assert.match(f.run('messages.at(-1)'),/mayor que 0/);
  assert.equal(f.run('events.length'),0);
});

test('Repeated completion never unmarks or restarts an already recorded set', f => {
  f.run("dailyCompleteSet('pb_0',0);");
  const generation=f.run('tmrGeneration');
  const eventCount=f.run('events.length');
  f.run("dailyCompleteSet('pb_0',0);dailyCompleteSet('missing',0);dailyCompleteSet('pb_0',99);");
  assert.equal(f.run('WD.pb_0[0].done'),true);
  assert.equal(f.run('tmrGeneration'),generation);
  assert.equal(f.run('events.length'),eventCount);
});

test('The weight of a completed set carries to an empty next set but never overwrites one', f => {
  f.run("WD.pb_0[0].kg=62.5;WD.pb_0[1].kg='';dailyCompleteSet('pb_0',0);");
  assert.equal(f.run('WD.pb_0[1].kg'),62.5);
  f.run("stopTimer();WD.pb_0[0].done=false;WD.pb_0[1].kg=80;dailyCompleteSet('pb_0',0);");
  assert.equal(f.run('WD.pb_0[1].kg'),80);
});

test('Completing a set starts one rest and focuses the next pending set', f => {
  f.run("dailyCompleteSet('pb_0',0);");
  assert.equal(f.run('WD.pb_0[0].done'),true);
  assert.equal(f.run('WD.pb_0[1].done'),false);
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).setIndex'),1);
  assert.equal(f.run('tmrLeft'),75);
  assert.equal(f.run('tmrGeneration'),2); // One stop, then one start; no duplicate rest.
  assert.equal(f.run("document.getElementById('daily-guided-rest').hidden"),false);
  assert.equal(f.run("document.getElementById('daily-guided-form').hidden"),true);
  assert.equal(f.run('sessionSaves'),0);
});

test('Finishing an exercise rests before the next exercise rather than stopping the flow', f => {
  f.run("WD.pb_0[0].done=true;dailyCompleteSet('pb_0',1);");
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'custom_row_1');
  assert.equal(f.run('tmrLeft'),75);
  assert.equal(f.run('tmrNext'),'Siguiente: Mi remo');
  assert.equal(f.run("document.getElementById('daily-guided-form').hidden"),true);
});

test('The final set stops a previous timer and does not introduce another rest or auto-save', f => {
  f.run("Object.values(WD).flat().forEach(set=>set.done=true);WD.custom_squat_2[0].done=false;render();startTimer(30);dailyCompleteSet('custom_squat_2',0);");
  assert.equal(f.run('completion().done'),5);
  assert.equal(f.run('tmrLeft'),0);
  assert.equal(f.run('tmrInt'),null);
  assert.equal(f.run('sessionSaves'),0);
  assert.match(f.run("document.getElementById('content').innerHTML"),/Todas las series marcadas|Finalizar y guardar/);
  assert.equal(f.run("document.getElementById('daily-guided-rest')"),null);
});

test('Direct marking of the final set also cancels an existing rest', f => {
  f.run("W.presentation='direct';Object.values(WD).flat().forEach(set=>set.done=true);WD.custom_squat_2[0].done=false;render();startTimer(45);tDone('custom_squat_2',0);");
  assert.equal(f.run('completion().done'),5);
  assert.equal(f.run('tmrLeft'),0);
  assert.equal(f.run('tmrInt'),null);
  assert.equal(f.run("document.getElementById('daily-direct-rest').hidden"),true);
  assert.equal(f.run('sessionSaves'),0);
});

test('Completing the final exercise from its menu cancels rest without auto-saving', f => {
  f.run("W.presentation='direct';WD.pb_0.forEach(set=>set.done=true);WD.custom_row_1.forEach(set=>set.done=true);render();startTimer(45);completeExercise('custom_squat_2');");
  assert.equal(f.run('completion().done'),5);
  assert.equal(f.run('tmrLeft'),0);
  assert.equal(f.run('tmrInt'),null);
  assert.equal(f.run("document.getElementById('daily-direct-rest').hidden"),true);
  assert.equal(f.run('sessionSaves'),0);
});

test('Guided rest expiry returns to the form without marking another series', f => {
  f.run("dailyCompleteSet('pb_0',0);advance(75000);");
  assert.equal(f.run('tmrLeft'),0);
  assert.equal(f.run('completion().done'),1);
  assert.equal(f.run("document.getElementById('daily-guided-rest').hidden"),true);
  assert.equal(f.run("document.getElementById('daily-guided-form').hidden"),false);
});

test('Skipping the rest reveals the pending series without completing it', f => {
  f.run("dailyCompleteSet('pb_0',0);stopTimer();");
  assert.equal(f.run('completion().done'),1);
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).setIndex'),1);
  assert.equal(f.run("document.getElementById('daily-guided-form').hidden"),false);
});

test('Switching guided/direct views keeps rest inline and never resets the timer', f => {
  f.run("dailyCompleteSet('pb_0',0);advance(5000);toggleTimerPause();");
  const before=f.plain('({left:tmrLeft,remaining:tmrRemainingMs,paused:tmrPaused,generation:tmrGeneration})');
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),true);
  f.run("setWorkoutPresentation('direct');");
  assert.equal(f.run("document.getElementById('daily-guided')"),null);
  assert.equal(f.run("document.getElementById('daily-direct-rest').hidden"),false);
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),true);
  f.run("setWorkoutPresentation('guided');");
  assert.deepEqual(f.plain('({left:tmrLeft,remaining:tmrRemainingMs,paused:tmrPaused,generation:tmrGeneration})'),before);
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),true);
  assert.equal(f.run("document.getElementById('daily-guided-rest').hidden"),false);
  assert.equal(f.run("document.getElementById('daily-guided-clock').textContent"),'01:10');
});

test('Inline rest labels reflect pause and language, and other screens restore floating visibility', f => {
  f.run("render();startTimer(65);toggleTimerPause();S.lang='en';syncDailyWorkoutRest();");
  assert.equal(f.run("document.getElementById('daily-guided-pause').textContent"),'Resume');
  assert.equal(f.run("document.getElementById('daily-guided-rest-title').textContent"),'Rest paused');
  f.run("toggleTimerPause();syncDailyWorkoutRest();");
  assert.equal(f.run("document.getElementById('daily-guided-pause').textContent"),'Pause');
  assert.equal(f.run("document.getElementById('daily-guided-rest-title').textContent"),'Take a breather');
  f.run("S.screen='home';syncDailyWorkoutRest();");
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),false);
  assert.equal(f.run('tmrLeft'),65);
});

test('Manual selection during rest preserves recorded values, notes and the active countdown', f => {
  f.run("dailyCompleteSet('pb_0',0);");
  const before=f.run('JSON.stringify({WD,notes:W.notes,mode:W.mode,tmrLeft,tmrGeneration})');
  f.run('dailyChooseExercise(2);');
  assert.equal(f.run('dailyGuidedCurrent(W.sessionDay).key'),'custom_squat_2');
  assert.equal(f.run('JSON.stringify({WD,notes:W.notes,mode:W.mode,tmrLeft,tmrGeneration})'),before);
  assert.equal(f.run("document.getElementById('daily-guided-form').hidden"),true);
});

test('Partial finishing explicitly labels the save and never manufactures completed sets', f => {
  f.run('WD.pb_0[0].done=true;');
  const before=f.run('JSON.stringify({W,WD})');
  f.run('openFinishWorkout();');
  const html=f.run("document.getElementById('summary-sheet').innerHTML");
  assert.match(html,/<b>1\/5<\/b>/);
  assert.match(html,/Guardar sesión parcial/);
  assert.match(html,/Las series pendientes no contarán como realizadas/);
  assert.doesNotMatch(html,/Guardar entrenamiento<|Todas las series marcadas|Próxima sesión/);
  assert.equal(f.run('JSON.stringify({W,WD})'),before);
  assert.equal(f.run('S.sessions.length'),0);
  assert.equal(f.run('sessionSaves'),0);
});

test('English partial finish copy distinguishes it from a completed workout', f => {
  f.run("S.lang='en';WD.pb_0[0].done=true;openFinishWorkout();");
  let html=f.run("document.getElementById('summary-sheet').innerHTML");
  assert.match(html,/Save partial workout/);
  assert.match(html,/remaining sets will not count as completed/);
  f.run('Object.values(WD).flat().forEach(set=>set.done=true);openFinishWorkout();');
  html=f.run("document.getElementById('summary-sheet').innerHTML");
  assert.match(html,/Save completed workout/);
  assert.doesNotMatch(html,/Save partial workout/);
});

test('Marking only part of the workout never schedules welcome completion or saving', f => {
  f.run("W.welcome=true;dailyCompleteSet('pb_0',0);advance(1000);");
  assert.equal(f.run('completion().done'),1);
  assert.equal(f.run('W.autoSaving'),undefined);
  assert.equal(f.run('sessionSaves'),0);
  assert.equal(f.run("messages.some(message=>/Sesión completada|Session complete/.test(message))"),false);
});

test('Vital per-side prescriptions also stay on the specialized fallback', f => {
  f.run("installDay({name:'Moverme',exercises:[{id:'vital_heel_raise',name:'Talones',type:'vital',sets:1,rr:'6/lado',rest:60}]});");
  assert.equal(f.run('dailyGuidedAvailable(W.sessionDay)'),false);
  const html=f.run('render()');
  assert.match(html,/data-existing-card="0"/);
  assert.doesNotMatch(html,/id="daily-guided"/);
});

test('A complete guided panel without rest controls never hides an active floating timer', f => {
  f.run('Object.values(WD).flat().forEach(set=>set.done=true);render();startTimer(20);');
  assert.equal(f.run("document.getElementById('daily-guided-rest')"),null);
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),false);
  assert.equal(f.run('tmrLeft'),20);
});

test('Direct rest is absent for specialized sessions and floating controls stay available', f => {
  f.run("installDay({name:'Paseo',exercises:[{id:'walk_test',name:'Paseo',type:'walk',sets:1,durationMin:10}]});render();startTimer(30);");
  assert.equal(f.run("document.getElementById('daily-direct-rest')"),null);
  assert.equal(f.run("document.getElementById('rest-timer').classList.contains('daily-rest-inline-hidden')"),false);
});

test('Step changes focus the current heading and announce recorded progress', f => {
  f.run('dailyChooseExercise(1);');
  assert.equal(f.run('focused'),'daily-guided-title');
  assert.equal(f.run("document.getElementById('daily-workout-status').textContent"),'Mi remo');
  f.run("dailyCompleteSet('custom_row_1',0);");
  assert.equal(f.run('focused'),'daily-guided-rest-title');
  assert.match(f.run("document.getElementById('daily-workout-status').textContent"),/Serie registrada/);
  f.run("S.lang='en';stopTimer();dailyCompleteSet('custom_row_1',1);");
  assert.match(f.run("document.getElementById('daily-workout-status').textContent"),/Set recorded/);
});

test('Rest expiry moves focus out of hidden controls and announces the next set once', f => {
  f.run(`render();dailyCompleteSet('pb_0',0);const restNode=document.getElementById('daily-guided-rest');
    document.activeElement=document.getElementById('daily-guided-pause');
    restNode.contains=node=>node===document.activeElement;
    advance(120000);`);
  assert.equal(f.run('focused'),'daily-guided-title');
  assert.equal(f.run("document.getElementById('daily-guided-rest').hidden"),true);
  assert.match(f.run("document.getElementById('daily-workout-status').textContent"),/Descanso terminado/);
  f.run("document.getElementById('daily-workout-status').textContent='unchanged';syncDailyWorkoutRest();");
  assert.equal(f.run("document.getElementById('daily-workout-status').textContent"),'unchanged');
});

test('A failed welcome autosave retains its explicit storage warning and retry action', f => {
  const html=f.run('W.welcome=true;W.saveError=true;Object.values(WD).flat().forEach(set=>set.done=true);render();');
  assert.match(html,/Reintentar guardado/);
  assert.match(html,/Libera espacio/);
  assert.equal(f.run('sessionSaves'),0);
});

console.log(`\n${passed} daily workout tests passed, ${failed} failed.`);
if(failed)process.exitCode=1;
