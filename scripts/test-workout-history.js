#!/usr/bin/env node
'use strict';

// Run real app functions in an isolated VM: node scripts/test-workout-history.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(kind, name) {
  const start = source.search(new RegExp(`^${kind} ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app declaration: ${name}`);
  const remaining = source.slice(start + 1);
  const end = remaining.search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

const names = [
  'normalizeProfile', 'baseSets', 'adaptExercise', 'exKey', 'isTimedExercise',
  'isBodyweightExercise', 'isBandExercise', 'defaultSetKg', 'alternativesFor',
  'selectedAlt', 'exerciseVariantName', 'exerciseHistoryEquipment',
  'workoutExerciseReference', 'compatibleExerciseRecord', 'exerciseHistory',
  'workoutNumber', 'validWorkoutSet', 'recordedReferenceSet', 'copyReferenceSets', 'validatePendingWorkoutSets',
  'lastExerciseRecord', 'changeExerciseAlternative', 'exMetrics',
  'priorExerciseMetrics', 'detectSessionPRs', 'loadLast', 'exerciseRefs',
  'bestSetLabel', 'applyLastExercise', 'workoutDayKey', 'saveSession',
];
const script = [
  ...['DB', 'ALT', 'ALT_EXTRA', 'SMART_ALT', 'KB_ID', 'TIMING', 'HEAVY_IDS'].map(name => declaration('const', name)),
  ...names.map(name => declaration('function', name)),
].join('\n');
const context = vm.createContext({ console, Date, Math, Set, Map });
vm.runInContext(script, context, { filename: 'app-history-functions.js' });
vm.runInContext(`
  let S={sessions:[],routine:[],curDay:0,bodyWeights:[]},W={alt:{}},WD={};
  let messages=[],confirmResult=true,confirmCalls=0;
  function todayDay(day){return day;}
  function toast(message){messages.push(message);}
  function renderWorkout(){}
  function confirm(){confirmCalls++;return confirmResult;}
  function currentLang(){return 'es';}
  function fmtDate(date){return date;}
  const document={getElementById(){return {textContent:''};}};
  const localStorage={setItem(){}};
  function serializeGps(){return null;}
  function isWodExercise(){return false;}
  function calcSessionStats(exercises){const sets=exercises.flatMap(ex=>ex.sets||[]),done=sets.filter(set=>set.done).length;return {done,total:sets.length,pct:sets.length?Math.round(done/sets.length*100):0};}
  function workoutDurationMin(){return 10;}
  function dayKind(){return 'strength';}
  function unlockAchievements(){return [];}
  let persistResult=true;
  function persist(){return persistResult;}
  function saveWorkoutDraft(){}
  function streak(){return 0;}
  function track(){}
  function trackOnce(){}
  function productAnalyticsCohort(){return {eligible:false};}
  function stopWorkoutCoachLoop(){}
  function stopTimer(){}
  function clearGpsWatcher(){}
  function clearWorkoutDraft(){W.active=false;}
  function nav(){}
  function disableWakeLock(){}
  function showSessionSummary(){}
  function initWD(){}
`, context);

function run(code) { return vm.runInContext(code, context); }
function reset() {
  run(`S={sessions:[],routine:[],curDay:0,bodyWeights:[]};W={alt:{},altReason:{}};WD={};messages=[];confirmResult=true;confirmCalls=0;persistResult=true;`);
}
function test(name, callback) {
  reset();
  callback();
  console.log(`✓ ${name}`);
}

run(`
  const barbell={id:'pb',name:'Press de banca',sets:2,rr:'8-12',rest:120};
  const dumbbell=adaptExercise(barbell,normalizeProfile({priority:'musculo',equipment:'mancuernas'}));
  function record(ex,kg,extra={}){return {...ex,sets:[{kg,reps:10,done:true}],...extra};}
  function session(exercises){return {date:'2026-09-21T10:00:00.000Z',dayName:'Día A',feel:'bien',exercises};}
  function plan(exercises){S.routine=[{name:'Día A',exercises}];exercises.forEach((ex,i)=>WD[exKey(ex,i)]=[{kg:0,reps:8,done:false}]);}
`);

test('Changing gym → dumbbells does not inherit the barbell load', () => {
  run(`S.sessions=[session([record({...barbell,equipment:'gym'},80)])];`);
  assert.equal(run('defaultSetKg(dumbbell,false,false)'), 0);
  assert.equal(run('lastExerciseRecord(dumbbell)'), null);
  assert.equal(run('priorExerciseMetrics(dumbbell).maxKg'), 0);
  assert.equal(run('exerciseRefs(dumbbell)'), '');
});

test('Returning to the original equipment recovers its own load', () => {
  run(`S.sessions=[session([record({...barbell,equipment:'gym'},80)]),session([record(dumbbell,22)])];`);
  assert.equal(run('defaultSetKg(dumbbell,false,false)'), 22);
  assert.equal(run('defaultSetKg(barbell,false,false)'), 80);
  assert.equal(run('priorExerciseMetrics(barbell).maxKg'), 80);
});

test('Legacy gym records without equipment remain usable for the same variant', () => {
  run(`S.sessions=[session([record({...barbell,equipment:''},75)])];`);
  assert.equal(run('defaultSetKg(barbell,false,false)'), 75);
  assert.equal(run('defaultSetKg(dumbbell,false,false)'), 0);
});

test('Unknown legacy equipment is not guessed from the current profile', () => {
  run(`S.profile={equipment:'mancuernas'};S.sessions=[session([record({id:'legacy',name:'Ejercicio antiguo'},90)])];`);
  assert.equal(run(`defaultSetKg({id:'legacy',name:'Ejercicio antiguo',equipment:'mancuernas'},false,false)`), 0);
});

test('Distinct variants with the same ID and equipment remain separate', () => {
  run(`S.sessions=[session([record({id:'kb_floor_press',name:'Kettlebell floor press unilateral',equipment:'kettlebell'},12)])];`);
  assert.equal(run(`defaultSetKg({id:'kb_floor_press',name:'Kettlebell floor press',equipment:'kettlebell'},false,false)`), 0);
});

test('Same-name exercises with different IDs do not share a load', () => {
  run(`S.sessions=[session([record({id:'custom_a',name:'Mi press',equipment:'custom'},35)])];`);
  assert.equal(run(`defaultSetKg({id:'custom_b',name:'Mi press',equipment:'custom'},false,false)`), 0);
  assert.equal(run(`defaultSetKg({id:'custom_a',name:'Mi press',equipment:'custom'},false,false)`), 35);
});

test('An alternative never supplies its load to the base exercise', () => {
  run(`S.sessions=[session([record({id:'pim',name:'Press con mancuernas',baseId:'pb',alternative:true,equipment:'gym'},24)])];`);
  assert.equal(run('defaultSetKg(barbell,false,false)'), 0);
  run(`W.alt={pb:'pim'};`);
  assert.equal(run('lastExerciseRecord(barbell).exercise.sets[0].kg'), 24);
  assert.equal(run('workoutExerciseReference(barbell).equipment'), 'mancuernas');
});

test('Initialization ignores a previous workout’s selected alternative', () => {
  run(`S.sessions=[session([record(barbell,80),record({id:'pim',name:'Press con mancuernas',baseId:'pb',alternative:true,equipment:'gym'},24)])];W.alt={pb:'pim'};`);
  assert.equal(run('defaultSetKg(barbell,false,false)'), 80);
});

test('Uncompleted sets cannot establish an automatic load', () => {
  run(`S.sessions=[session([record(barbell,80,{sets:[{kg:200,reps:10,done:false},{kg:60,reps:10,done:true}]})])];`);
  assert.equal(run('defaultSetKg(barbell,false,false)'), 60);
});

test('Loading a session matches identity, not exercise position', () => {
  run(`const row={id:'custom_row',name:'Mi remo',equipment:'custom',sets:1,rr:'8-12'};S.sessions=[session([record(row,30),record(barbell,80)])];plan([barbell,row]);loadLast();`);
  assert.equal(run('WD.pb_0[0].kg'), 80);
  assert.equal(run('WD.custom_row_1[0].kg'), 30);
});

test('Loading the last day cannot reintroduce an incompatible equipment load', () => {
  run(`S.sessions=[session([record(barbell,80)])];plan([dumbbell]);loadLast();`);
  assert.equal(run('WD.pb_0[0].kg'), 0);
  assert.equal(run('messages.at(-1)'), 'Sin referencias compatibles con los ejercicios actuales');
});

test('Switching alternatives clears the old load and uses only compatible history', () => {
  run(`S.sessions=[session([record(barbell,80),record({id:'pim',name:'Press con mancuernas',baseId:'pb',alternative:true,equipment:'gym'},24)])];plan([barbell]);WD.pb_0[0].kg=80;changeExerciseAlternative('pb','pim');`);
  assert.equal(run('WD.pb_0[0].kg'), 24);
  assert.equal(run('WD.pb_0[0].done'), false);
  run(`changeExerciseAlternative('pb','pb');`);
  assert.equal(run('WD.pb_0[0].kg'), 80);
});

test('Changing a completed exercise requires confirmation and can be cancelled', () => {
  run(`plan([barbell]);WD.pb_0[0]={kg:80,reps:10,done:true};confirmResult=false;`);
  assert.equal(run(`changeExerciseAlternative('pb','pim')`), false);
  assert.equal(run('confirmCalls'), 1);
  assert.equal(run('WD.pb_0[0].kg'), 80);
  assert.equal(run('WD.pb_0[0].done'), true);
  assert.equal(run('selectedAlt(barbell).id'), 'pb');
});

test('New personal records compare only the same equipment and variant', () => {
  run(`S.sessions=[session([record(barbell,80)])];`);
  assert.equal(run('detectSessionPRs([record(dumbbell,90)]).length'), 0);
  assert.ok(run('detectSessionPRs([record(barbell,90)]).length') > 0);
});

test('Saving an alternative records its actual equipment without mutating old history', () => {
  run(`S.sessions=[session([record(barbell,80)])];plan([barbell]);W.alt={pb:'pim'};WD.pb_0[0]={kg:24,reps:10,done:true};`);
  const previous = run('JSON.stringify(S.sessions[0])');
  run('saveSession();');
  assert.equal(run('S.sessions.at(-1).exercises[0].id'), 'pim');
  assert.equal(run('S.sessions.at(-1).exercises[0].equipment'), 'mancuernas');
  assert.equal(run('S.sessions.at(-1).exercises[0].baseId'), 'pb');
  assert.equal(run('JSON.stringify(S.sessions[0])'), previous);
});

test('A failed history write keeps the workout and rolls back unsaved records', () => {
  run(`plan([barbell]);WD.pb_0[0]={kg:73,reps:9,done:true};W.active=true;W.bw='74';S.manualToday=true;S.achievements=['previous'];persistResult=false;`);
  run('saveSession();');
  assert.equal(run('S.sessions.length'), 0);
  assert.equal(run('S.bodyWeights.length'), 0);
  assert.equal(run('S.manualToday'), true);
  assert.equal(run('JSON.stringify(S.achievements)'), '["previous"]');
  assert.equal(run('W.active'), true);
  assert.equal(run('WD.pb_0[0].kg'), 73);
  assert.match(run('messages.at(-1)'), /No se pudo guardar la sesión/);
  run('persistResult=true;saveSession();saveSession();');
  assert.equal(run('S.sessions.length'), 1, 'Retry and double-tap save only one session');
  assert.equal(run('S.bodyWeights.length'), 1);
  assert.equal(run('W.active'), false);
});

test('A workout without completed work is not added to history', () => {
  run('plan([barbell]);W.active=true;saveSession();');
  assert.equal(run('S.sessions.length'), 0);
  assert.equal(run('W.active'), true);
  assert.match(run('messages.at(-1)'), /Completa una serie/);
});

test('A failed welcome autosave can be retried without locking its completed sets', () => {
  run('plan([barbell]);WD.pb_0[0].done=true;W.active=true;W.welcome=true;W.autoSaving=true;persistResult=false;saveSession();');
  assert.equal(run('S.sessions.length'), 0);
  assert.equal(run('W.active'), true);
  assert.equal(run('W.autoSaving'), false);
  assert.equal(run('W.saveError'), true);
  assert.equal(run('WD.pb_0[0].done'), true);
});

test('Saving rejects a completed set edited to invalid values without changing history or the draft', () => {
  for(const edit of ['WD.pb_0[0].reps=0','WD.pb_0[0].kg=-1','WD.pb_0[0].kg=Infinity']){
    reset();
    run(`plan([barbell]);WD.pb_0[0]={kg:73,reps:9,done:true};W.active=true;W.autoSaving=true;W.bw='74';W.notes='Nota intacta';S.nextWorkout={date:'2026-10-22'};${edit};`);
    const before=run('JSON.stringify({WD,sessions:S.sessions,bodyWeights:S.bodyWeights,nextWorkout:S.nextWorkout,notes:W.notes})');
    run('saveSession();');
    assert.equal(run('JSON.stringify({WD,sessions:S.sessions,bodyWeights:S.bodyWeights,nextWorkout:S.nextWorkout,notes:W.notes})'), before);
    assert.equal(run('W.active'), true);
    assert.equal(run('W.autoSaving'), false);
    assert.match(run('messages.at(-1)'), /Revisa la serie 1/);
  }
});

test('Valid completed work still saves when an unperformed pending set is empty', () => {
  run(`plan([barbell]);WD.pb_0=[{kg:0,reps:9,done:true},{kg:0,reps:0,done:false}];W.active=true;saveSession();`);
  assert.equal(run('S.sessions.length'), 1);
  assert.equal(run('S.sessions[0].exercises[0].sets[0].reps'), 9);
  assert.equal(run('S.sessions[0].exercises[0].sets[1].done'), false);
  assert.equal(run('W.active'), false);
});

console.log('20 workout history regression tests passed.');
