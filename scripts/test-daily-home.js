#!/usr/bin/env node
'use strict';

process.env.TZ='Europe/Madrid';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');
const fixedNow=new Date('2026-10-24T00:30:00+02:00').getTime();
class FixedDate extends Date {
  constructor(...args) {super(...(args.length?args:[fixedNow]));}
  static now() {return fixedNow;}
}

function declaration(name) {
  const start = source.search(new RegExp(`^function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}
function objectDeclaration(name) {
  const start=source.indexOf(`const ${name}={`),end=source.indexOf('\n};',start);
  assert.ok(start>=0&&end>start,`Missing app data: ${name}`);
  return source.slice(start,end+3);
}

function fixture() {
  const context = vm.createContext({ console,Date:FixedDate });
  vm.runInContext(['ALT','ALT_EXTRA','SMART_ALT'].map(objectDeclaration).join('\n')+'\n'+[
    'escHtml', 'completion', 'dailyHomeExerciseName', 'dailyHomeExerciseNames', 'dailyHomeDuration',
    'dailyHomeNextExerciseName', 'dailyHomeHasSavedToday', 'nextWorkoutLocalDate',
    'alternativesFor', 'selectedAlt', 'guidedTourSteps', 'renderHome',
  ].map(declaration).join('\n'), context);
  vm.runInContext(`
    const S={lang:'es',curDay:0,manualToday:false,profile:{time:40,days:3},sessions:[],routine:[
      {name:'Fuerza A',desc:'Pecho + Espalda + Core',estimatedMin:32,exercises:[
        {id:'squat',name:'Sentadilla'},{id:'row',name:'Remo'},
        {id:'press',name:'Press'},{id:'carry',name:'Paseo con carga'}
      ]},
      {name:'Fuerza B',estimatedMin:24,exercises:[{id:'hinge',name:'Peso muerto'}]}
    ]};
    const W={active:false,sessionDay:null};
    let WD={},workoutDraft=null,suggestedIndex=1,persisted=0,localized=0;
    const content={innerHTML:''};
    function currentLang(){return S.lang;}
    function lt(value){return value;}
    function nextWorkoutCandidate(){return {index:suggestedIndex};}
    function exKey(ex,index){return ex.id+'_'+index;}
    function weekly(){return 2;}
    function localizeTree(){localized++;}
    function persist(){persisted++;}
    function renderNextWorkoutCard(session,place){return '<div data-planning="'+place+'">Next date</div>';}
    function render(){renderHome(content);return content.innerHTML;}
    function activate(){
      W.active=true;W.sessionDay=JSON.parse(JSON.stringify(S.routine[0]));
      WD={squat_0:[{done:true},{done:true}],row_1:[{done:false},{done:false}],
        press_2:[{done:false}],carry_3:[{done:false}]};
    }
  `, context);
  return {
    run(code) { return vm.runInContext(code, context); },
    plain(code) { return JSON.parse(JSON.stringify(vm.runInContext(code, context))); },
  };
}

let passed=0,failed=0;
function test(name,fn) {
  try {fn(fixture());passed++;console.log('✓ '+name);}
  catch(error) {failed++;console.error('✗ '+name+'\n'+error.stack);}
}

test('Home shows the first three actual exercises for generated and own routines', f => {
  const expected=['Sentadilla','Remo','Press'];
  assert.deepEqual(f.plain('dailyHomeExerciseNames(S.routine[0])'), expected);
  f.run('S.profile.manualRoutine=true;');
  assert.deepEqual(f.plain('dailyHomeExerciseNames(S.routine[0])'), expected);
  const html=f.run('render()');
  assert.doesNotMatch(html,/Pecho|Espalda|Core|Paseo con carga/);
  assert.match(html,/4 ejercicios en orden · \+1 más/);
});

test('Ready Home has one primary start action and secondary adaptation and plan', f => {
  const html=f.run('render()');
  assert.equal((html.match(/class="daily-home-start"/g)||[]).length,1);
  assert.match(html,/Tu sesión está preparada/);
  assert.match(html,/Empezar sesión/);
  assert.match(html,/onclick="beginWorkoutDay\(0,'normal'\)"/);
  assert.match(html,/onclick="openWorkoutPreview\(0\)"/);
  assert.match(html,/onclick="openMenuPanel\('plan'\)"/);
  assert.doesNotMatch(html,/Nada más que decidir|One workout/);
});

test('An active session uses its frozen day and actual done/total state', f => {
  f.run("activate();S.routine[0].name='Changed plan';S.routine[0].exercises=[];");
  const html=f.run('render()');
  assert.match(html,/Tu sesión sigue aquí/);
  assert.match(html,/Fuerza A/);
  assert.doesNotMatch(html,/Changed plan/);
  assert.match(html,/<b>2\/6<\/b> series registradas/);
  assert.match(html,/Sigues en: Remo/);
  assert.match(html,/Continuar sesión/);
  assert.match(html,/onclick="resumeWorkout\(\)"/);
  assert.doesNotMatch(html,/beginWorkoutDay|openWorkoutPreview|openWelcomeWorkout/);
});

test('The active draft retains explicit discard confirmation and no direct delete', f => {
  f.run('activate();');
  const html=f.run('render()');
  assert.match(html,/onclick="if\(discardWorkoutDraft\(\)\)nav\('home'\)"/);
  assert.match(html,/Descartar borrador…/);
  assert.doesNotMatch(html,/discardWorkoutDraft\(false\)|clearWorkoutDraft\(/);
});

test('A completed draft directs back to finish without a nonexistent next exercise', f => {
  f.run('activate();Object.values(WD).flat().forEach(set=>set.done=true);');
  const html=f.run('render()');
  assert.match(html,/<b>6\/6<\/b> series registradas/);
  assert.match(html,/Lista para finalizar y guardar/);
  assert.doesNotMatch(html,/Sigues en:/);
  assert.match(html,/resumeWorkout\(\)/);
});

test('Routine and exercise names are escaped as data', f => {
  f.run(`S.routine[0].name='<img src=x onerror=alert(1)>';S.routine[0].exercises[0].name='<b>literal & name</b>';`);
  const html=f.run('render()');
  assert.doesNotMatch(html,/<img|<b>literal/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html,/&lt;b&gt;literal &amp; name&lt;\/b&gt;/);
});

test('Active next-exercise names are escaped too', f => {
  f.run(`activate();W.sessionDay.exercises[1].name='<svg onload=alert(1)>';`);
  const html=f.run('render()');
  assert.doesNotMatch(html,/<svg/);
  assert.match(html,/Sigues en: &lt;svg/);
});

test('An active snapshot shows its selected alternative in both list and next step', f => {
  f.run(`activate();W.sessionDay.exercises[1]={id:'pb',name:'Press de banca'};W.alt={pb:'pim'};WD.pb_1=WD.row_1;delete WD.row_1;`);
  const html=f.run('render()');
  assert.match(html,/<li>Press con mancuernas<\/li>/);
  assert.match(html,/Sigues en: Press con mancuernas/);
  assert.doesNotMatch(html,/Press de banca/);
});

test('Active alternatives never leak into a future or copied day', f => {
  f.run(`S.routine[0].exercises[0]={id:'pb',name:'Press de banca'};activate();W.alt={pb:'pim'};WD.pb_0=[{done:false}];delete WD.squat_0;`);
  assert.equal(f.run('dailyHomeExerciseNames(W.sessionDay)[0]'),'Press con mancuernas');
  assert.equal(f.run('dailyHomeNextExerciseName(W.sessionDay)'),'Press con mancuernas');
  assert.equal(f.run('dailyHomeExerciseNames(S.routine[0])[0]'),'Press de banca');
  assert.equal(f.run('dailyHomeNextExerciseName(S.routine[0])'),'');
  assert.equal(f.run('dailyHomeExerciseNames(JSON.parse(JSON.stringify(W.sessionDay)))[0]'),'Press de banca');
  assert.equal(f.run('dailyHomeNextExerciseName(JSON.parse(JSON.stringify(W.sessionDay)))'),'');
});

test('Inactive or invalid alternative state does not rename the prepared plan', f => {
  f.run(`S.routine[0].exercises[0]={id:'pb',name:'Press de banca'};W.alt={pb:'pim'};W.sessionDay=S.routine[0];`);
  assert.equal(f.run('dailyHomeExerciseNames(S.routine[0])[0]'),'Press de banca');
  assert.equal(f.run('dailyHomeNextExerciseName(S.routine[0])'),'');
  f.run('W.active=true;W.alt.pb="not-an-alternative";');
  assert.equal(f.run('dailyHomeExerciseNames(S.routine[0])[0]'),'Press de banca');
});

test('Home tour selectors target the primary start and only the adaptation action', f => {
  const steps=f.plain('guidedTourSteps()');
  assert.equal(steps[0].selector,'.daily-home-start');
  assert.equal(steps[1].selector,'[data-daily-home-adapt]');
  const html=f.run('render()');
  assert.match(html,/<button[^>]*class="daily-home-start"/);
  const adapt=html.match(/<button[^>]*data-daily-home-adapt[^>]*>/g)||[];
  assert.equal(adapt.length,1);
  assert.match(adapt[0],/onclick="openWorkoutPreview\(0\)"/);
  assert.doesNotMatch(adapt[0],/openMenuPanel/);
  f.run('activate();');
  assert.doesNotMatch(f.run('render()'),/data-daily-home-adapt/);
});

test('Duration is a bounded finite estimate and never untrusted HTML', f => {
  assert.equal(f.run('dailyHomeDuration({estimatedMin:24.4},{time:60})'),24);
  assert.equal(f.run('dailyHomeDuration({estimatedMin:0},{time:25})'),25);
  assert.equal(f.run('dailyHomeDuration({estimatedMin:-9},{time:NaN})'),40);
  assert.equal(f.run('dailyHomeDuration({estimatedMin:Infinity},{time:45})'),45);
  assert.equal(f.run('dailyHomeDuration({estimatedMin:9999},{})'),1440);
  assert.equal(f.run('dailyHomeDuration({estimatedMin:.1},{})'),1);
  f.run(`S.routine[0].estimatedMin='<img src=x>';S.profile.time='<svg>';`);
  const html=f.run('render()');
  assert.match(html,/Aprox\. 40 min/);
  assert.doesNotMatch(html,/<img|<svg/);
});

test('English Home copy covers ready, continuity and secondary actions', f => {
  f.run("S.lang='en';");
  let html=f.run('render()');
  assert.match(html,/Your session is ready/);
  assert.match(html,/Start session/);
  assert.match(html,/About 32 min/);
  assert.match(html,/4 exercises in order · \+1 more/);
  assert.match(html,/Adapt session|View my plan/);
  assert.match(html,/step-by-step help or a direct view/);
  f.run('activate();');
  html=f.run('render()');
  assert.match(html,/Your session is still here/);
  assert.match(html,/Continue session/);
  assert.match(html,/2\/6<\/b> sets recorded/);
  assert.match(html,/Next: Remo/);
  assert.match(html,/Discard draft…/);
  assert.doesNotMatch(html,/Tu sesión|series registradas|Sigues en/);
});

test('First-session help remains optional and does not appear after a saved session', f => {
  assert.match(f.run('render()'),/openWelcomeWorkout\(\)/);
  f.run('S.sessions=[{id:1}];');
  assert.doesNotMatch(f.run('render()'),/openWelcomeWorkout\(\)/);
});

test('The existing next-workout slot and rendering are retained', f => {
  const html=f.run('render()');
  assert.match(html,/id="next-workout-home-slot"/);
  assert.match(html,/data-planning="home"/);
});

test('Suggested-day selection follows the existing conditions only', f => {
  f.run('S.sessions=[{id:1}];render();');
  assert.equal(f.run('S.curDay'),1);
  f.run('S.curDay=0;S.manualToday=true;render();');
  assert.equal(f.run('S.curDay'),0);
  f.run('S.manualToday=false;activate();render();');
  assert.equal(f.run('S.curDay'),0);
});

test('Rendering an active draft does not mutate or persist workout data', f => {
  f.run('activate();');
  const before=f.run('JSON.stringify({S,W,WD})');
  f.run('render();dailyHomeExerciseNames(W.sessionDay);dailyHomeNextExerciseName(W.sessionDay);');
  assert.equal(f.run('JSON.stringify({S,W,WD})'),before);
  assert.equal(f.run('persisted'),0);
  assert.equal(f.run('localized'),1);
});

test('Walk and WOD sessions keep their block labels', f => {
  f.run("S.profile.mode='caminar';");
  assert.match(f.run('render()'),/Tu paseo está preparado|Empezar paseo/);
  f.run("S.profile.mode='normal';S.routine[0].dailyWod=true;");
  assert.match(f.run('render()'),/1 bloque guiado/);
  f.run('activate();');
  assert.match(f.run('render()'),/2\/6<\/b> bloques registrados/);
});

test('Vital sessions retain their explicit movement framing', f => {
  f.run("S.profile.priority='vital';");
  assert.match(f.run('render()'),/Tu sesión de movimiento está preparada/);
  f.run("S.lang='en';");
  assert.match(f.run('render()'),/Your movement session is ready/);
});

test('No routine shows an honest empty state and no dead start action', f => {
  f.run('S.routine=[];');
  const html=f.run('render()');
  assert.match(html,/Tu próxima sesión/);
  assert.match(html,/Todavía no hay un entrenamiento preparado/);
  assert.doesNotMatch(html,/class="daily-home-start"|beginWorkoutDay|openWorkoutPreview/);
});

test('The activity footnote describes rolling seven-day data without a fake goal', f => {
  const html=f.run('render()');
  assert.match(html,/2 sesiones guardadas en los últimos 7 días/);
  assert.doesNotMatch(html,/2\/3|racha|this week|esta semana/);
});

test('A session saved today uses local Madrid calendar dates, not its UTC date', f => {
  f.run(`S.sessions=[{id:1,date:'2026-10-23T22:10:00.000Z'}];`);
  assert.equal(f.run('dailyHomeHasSavedToday()'),true);
  const html=f.run('render()');
  assert.match(html,/Lo de hoy ya está guardado/);
  assert.match(html,/Tu próxima sesión está preparada\. Vuelve cuando te venga bien\./);
  assert.match(html,/Fuerza B/);
  assert.match(html,/onclick="beginWorkoutDay\(1,'normal'\)"/);
  assert.match(html,/Empezar sesión/);
});

test('A partial saved session is acknowledged without claiming it was completed', f => {
  f.run(`S.sessions=[{id:1,date:'2026-10-24T00:10:00+02:00',stats:{done:1,total:9,pct:11}}];`);
  const before=f.run('JSON.stringify(S.sessions)');
  const html=f.run('render()');
  assert.match(html,/Lo de hoy ya está guardado/);
  assert.doesNotMatch(html,/sesión completa|sesión terminada|todo completado/i);
  assert.equal(f.run('JSON.stringify(S.sessions)'),before);
  assert.equal(f.run('persisted'),0);
  f.run("S.lang='en';");
  const english=f.run('render()');
  assert.match(english,/Today’s activity is saved/);
  assert.match(english,/Your next session is ready\. Come back whenever it works for you\./);
  assert.match(english,/Start session/);
});

test('A previous local day or a latest older entry keeps the prepared-session copy', f => {
  f.run(`S.sessions=[{id:1,date:'2026-10-23T21:59:00.000Z'}];`);
  assert.equal(f.run('dailyHomeHasSavedToday()'),false);
  assert.match(f.run('render()'),/Tu sesión está preparada/);
  f.run(`S.sessions=[{id:1,date:'2026-10-23T22:10:00.000Z'},{id:2,date:'2026-10-22T10:00:00Z'}];`);
  assert.equal(f.run('dailyHomeHasSavedToday()'),false);
  assert.doesNotMatch(f.run('render()'),/Lo de hoy ya está guardado/);
});

test('Invalid or missing saved dates never become a saved-today state', f => {
  for(const date of ['not a date','',null,undefined,Infinity]) {
    f.run(`S.sessions=[{id:1,date:${date===undefined?'undefined':typeof date==='number'?'Infinity':JSON.stringify(date)}}];`);
    assert.equal(f.run('dailyHomeHasSavedToday()'),false);
    assert.doesNotMatch(f.run('render()'),/Lo de hoy ya está guardado/);
  }
  assert.equal(f.run('dailyHomeHasSavedToday(new Date(NaN))'),false);
});

test('A current or recoverable draft takes priority over today’s saved activity', f => {
  f.run(`S.sessions=[{id:1,date:'2026-10-23T22:10:00.000Z'}];activate();`);
  let html=f.run('render()');
  assert.match(html,/Tu sesión sigue aquí/);
  assert.match(html,/Continuar sesión/);
  assert.doesNotMatch(html,/Lo de hoy ya está guardado/);
  f.run('W.active=false;workoutDraft={id:"recoverable"};');
  html=f.run('render()');
  assert.doesNotMatch(html,/Lo de hoy ya está guardado/);
});

test('Home names its section and ordered exercise list for assistive technology', f => {
  const html=f.run('render()');
  assert.match(html,/<section class="daily-home" aria-labelledby="daily-home-title">/);
  assert.match(html,/<article class="daily-home-session" aria-labelledby="daily-home-day">/);
  assert.match(html,/<ol class="daily-home-list" aria-label="Primeros ejercicios de esta sesión">/);
  assert.doesNotMatch(html,/<button(?! type="button")/);
  assert.equal((source.match(/id="daily-home-styles"/g)||[]).length,1);
  assert.match(source,/\.daily-home button:focus-visible/);
});

console.log(`\n${passed} daily Home tests passed, ${failed} failed.`);
if(failed)process.exitCode=1;
