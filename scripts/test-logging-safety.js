#!/usr/bin/env node
'use strict';

// Exercise the actual logging functions without booting the app or touching real user data.
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
  'workoutNumber', 'validWorkoutSet', 'recordedReferenceSet', 'validatePendingWorkoutSets',
  'copyReferenceSets', 'updSet', 'copyPrevSet', 'copyFirstToAll', 'applyLastExercise',
  'exerciseVariantName', 'exerciseHistoryEquipment', 'workoutExerciseReference',
  'compatibleExerciseRecord', 'exerciseHistory', 'lastExerciseRecord', 'defaultSetKg',
  'bandResistanceLabel', 'compactPreviousLabel', 'loadLast', 'tDone', 'completeExercise', 'wristMark',
  'bestSetLabel', 'exerciseRefs',
  'isTimedExercise', 'isBodyweightExercise', 'exDone', 'exKey', 'escHtml',
];
const context = vm.createContext({ console, Date, Math, Set, Map });
vm.runInContext([
  declaration('const', 'DB'),
  ...functions.map(name => declaration('function', name)),
].join('\n'), context, { filename: 'app-logging-safety-functions.js' });
vm.runInContext(`
  let S,W,WD,lang,messages,saves,renders,events,completed,coached,currentWrist;
  const press={id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:3,rr:'8-12'};
  const row={id:'custom_row',name:'Mi remo',type:'strength',equipment:'custom',sets:3,rr:'8-12'};
  function currentLang(){return lang;}
  function fmtDate(date){return date;}
  function todayDay(day){return W.sessionDay||day;}
  function selectedAlt(ex){return {id:ex.id,name:ex.name};}
  function toast(message){messages.push(message);}
  function saveWorkoutDraft(){saves++;}
  function renderWorkout(){renders++;saveWorkoutDraft();}
  function nextPendingExerciseKey(){return null;}
  function updateProgressUI(){}
  function trackOnce(name){events.push(name);}
  function coachPush(){coached++;}
  function coachRoundMessage(){return '';}
  function autoStartRest(){}
  function scheduleLiveCoachNotification(){}
  function handleExerciseCompleted(){completed++;}
  function renderWristMode(){}
  function focusExerciseCard(){}
  function wristCurrent(){return currentWrist;}
  function saved(ex,sets){return {...ex,sets};}
  function session(exercises,extra={}){return {dayName:'Día A',date:'2026-10-20T10:00:00.000Z',exercises,...extra};}
  function reset(){
    S={curDay:0,routine:[{name:'Día A',exercises:[press,row]}],sessions:[]};
    W={notes:'Nota de hoy',feel:'muy_bien',bw:'77',alt:{}};
    WD={pb_0:[{kg:71,reps:9,band:'',done:true},{kg:63,reps:8,band:'',done:false},{kg:62,reps:7,band:'',done:false}],custom_row_1:[{kg:30,reps:8,band:'',done:false}]};
    lang='es';messages=[];saves=0;renders=0;events=[];completed=0;coached=0;currentWrist=null;
  }
  reset();
`, context);

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
let passed = 0;
function test(name, callback) {
  run('reset();');
  callback();
  passed++;
  console.log(`✓ ${name}`);
}

test('Decimal comma is normalized without truncation', () => {
  run(`updSet('pb_0',1,'kg','72,5');`);
  assert.equal(run('WD.pb_0[1].kg'), 72.5);
  assert.equal(run('saves'), 1);
});

test('Dot decimals, leading decimals and finite scientific notation remain usable', () => {
  assert.equal(run(`workoutNumber('72.5')`), 72.5);
  assert.equal(run(`workoutNumber(',5')`), 0.5);
  assert.equal(run(`workoutNumber('1e2')`), 100);
});

test('Malformed numbers are not silently truncated or treated as a valid zero load', () => {
  for (const value of ['72,5,0', '72.5kg', '1,000.5', 'Infinity', 'NaN', '--3']) {
    assert.equal(run(`Number.isNaN(workoutNumber(${JSON.stringify(value)}))`), true);
    run(`updSet('pb_0',1,'kg',${JSON.stringify(value)});tDone('pb_0',1);`);
    assert.equal(run('WD.pb_0[1].done'), false);
  }
});

test('Clearing reps leaves the set pending when completion is requested', () => {
  run(`updSet('pb_0',1,'reps','');tDone('pb_0',1);`);
  assert.equal(run('WD.pb_0[1].reps'), 0);
  assert.equal(run('WD.pb_0[1].done'), false);
  assert.match(run('messages.at(-1)'), /mayor que 0/);
  assert.equal(run('events.length'), 0);
});

test('Zero and negative reps cannot be marked complete', () => {
  for (const value of [0, -1]) {
    run(`WD.pb_0[1].reps=${value};tDone('pb_0',1);`);
    assert.equal(run('WD.pb_0[1].done'), false);
  }
});

test('Negative, infinite and NaN loads cannot be marked complete', () => {
  for (const value of ['-1', 'Infinity', 'NaN']) {
    run(`WD.pb_0[1].kg=${value};tDone('pb_0',1);`);
    assert.equal(run('WD.pb_0[1].done'), false);
  }
});

test('A valid set is marked and triggers normal completion side effects', () => {
  run(`tDone('pb_0',1);`);
  assert.equal(run('WD.pb_0[1].done'), true);
  assert.deepEqual(plain('events'), ['first_set_completed']);
  assert.equal(run('coached'), 1);
});

test('Zero added weight remains valid for bodyweight exercises', () => {
  run(`WD.pb_0[1]={kg:0,reps:10,done:false};tDone('pb_0',1);`);
  assert.equal(run('WD.pb_0[1].done'), true);
});

test('Positive timed durations remain valid without a load', () => {
  run(`WD.pb_0=[{kg:0,reps:2.5,done:false}];tDone('pb_0',0);`);
  assert.equal(run('WD.pb_0[0].done'), true);
  assert.equal(run('completed'), 1);
});

test('Band sets remain valid without a numeric load', () => {
  run(`WD.pb_0[1]={kg:0,reps:12,band:'Media',done:false};tDone('pb_0',1);`);
  assert.equal(run('WD.pb_0[1].done'), true);
});

test('Unmarking is always allowed even when completed values are invalid', () => {
  run(`WD.pb_0[0]={kg:-1,reps:0,done:true};tDone('pb_0',0);`);
  assert.equal(run('WD.pb_0[0].done'), false);
  assert.equal(run('messages.length'), 0);
});

test('Complete exercise validates pending sets atomically', () => {
  run(`WD.pb_0[2].reps=0;completeExercise('pb_0');`);
  assert.deepEqual(plain('WD.pb_0.map(set=>set.done)'), [true, false, false]);
  assert.equal(run('completed'), 0);
  assert.equal(run('renders'), 0);
});

test('Complete exercise preserves an existing completed set and marks valid pending sets', () => {
  const before = run('JSON.stringify(WD.pb_0[0])');
  run(`completeExercise('pb_0');`);
  assert.deepEqual(plain('WD.pb_0.map(set=>set.done)'), [true, true, true]);
  assert.equal(run('JSON.stringify(WD.pb_0[0])'), before);
  assert.equal(run('completed'), 1);
});

test('The wrist shortcut uses the same validation', () => {
  run(`WD.pb_0[1].reps=0;currentWrist={key:'pb_0',setIndex:1,set:WD.pb_0[1]};wristMark();`);
  assert.equal(run('WD.pb_0[1].done'), false);
  assert.match(run('messages.at(-1)'), /mayor que 0/);
});

test('Validation feedback is bilingual', () => {
  run(`lang='en';WD.pb_0[1].kg=-2;tDone('pb_0',1);`);
  assert.match(run('messages.at(-1)'), /Check set 2.*non-negative load/);
});

test('Copying the first set only changes pending destination sets', () => {
  run(`WD.pb_0[2]={kg:65,reps:6,band:'',done:true};copyFirstToAll('pb_0');`);
  assert.deepEqual(plain('WD.pb_0'), [
    { kg: 71, reps: 9, band: '', done: true },
    { kg: 71, reps: 9, band: '', done: false },
    { kg: 65, reps: 6, band: '', done: true },
  ]);
  assert.match(run('messages.at(-1)'), /pendientes.*Conservamos/);
});

test('Copying an invalid first set does not damage pending prescriptions', () => {
  const before = run(`WD.pb_0[0].reps=0;JSON.stringify(WD.pb_0)`);
  run(`copyFirstToAll('pb_0');`);
  assert.equal(run('JSON.stringify(WD.pb_0)'), before);
});

test('Copying the previous set does not overwrite a completed destination', () => {
  run(`WD.pb_0[1].done=true;copyPrevSet('pb_0',1);`);
  assert.equal(run('WD.pb_0[1].kg'), 63);
});

test('Applying a historical reference ignores omitted source rows and completed current rows', () => {
  run(`S.sessions=[session([saved(press,[{kg:200,reps:10,done:false},{kg:60,reps:10,done:true},{kg:55,reps:9,done:true}])])];applyLastExercise(0,'pb_0');`);
  assert.equal(run('WD.pb_0[0].kg'), 71);
  assert.equal(run('WD.pb_0[0].done'), true);
  assert.equal(run('WD.pb_0[1].kg'), 60);
  assert.equal(run('WD.pb_0[2].kg'), 55);
  assert.equal(run('WD.pb_0[1].done'), false);
});

test('Reference copy preserves series positions instead of compacting omitted sets', () => {
  run(`WD.pb_0[0].done=false;S.sessions=[session([saved(press,[{kg:200,reps:10,done:false},{kg:60,reps:10,done:true}])])];applyLastExercise(0,'pb_0');`);
  assert.equal(run('WD.pb_0[0].kg'), 71);
  assert.equal(run('WD.pb_0[1].kg'), 60);
  assert.equal(run('WD.pb_0[2].kg'), 62);
});

test('A later omitted exercise does not hide the last completed compatible reference', () => {
  run(`S.sessions=[session([saved(press,[{kg:75,reps:8,done:true}])]),session([saved(press,[{kg:200,reps:8,done:false}])])];`);
  assert.equal(run('lastExerciseRecord(press).exercise.sets[0].kg'), 75);
  assert.equal(run('defaultSetKg(press,false,false)'), 75);
});

test('Legacy saved references without done remain usable', () => {
  run(`S.sessions=[session([saved(press,[{kg:'70',reps:'10'}])])];`);
  assert.equal(run('defaultSetKg(press,false,false)'), 70);
  assert.equal(run(`compactPreviousLabel(S.sessions[0].exercises[0].sets[0])`), '70 kg<br>× 10');
});

test('Omitted and malformed previous rows display no recorded reference', () => {
  assert.equal(run(`compactPreviousLabel({kg:200,reps:8,done:false})`), '—');
  assert.equal(run(`compactPreviousLabel({kg:'70oops',reps:8,done:true})`), '—');
  assert.equal(run(`compactPreviousLabel({kg:70,reps:0,done:true})`), '—');
});

test('Band reference text is escaped', () => {
  assert.equal(run(`compactPreviousLabel({kg:0,reps:12,band:'<img>',done:true},'band')`), '&lt;img&gt;<br>12 reps');
});

test('Whole-day reference loading preserves today’s completed sets and metadata', () => {
  run(`S.sessions=[session([saved(press,[{kg:80,reps:10,done:true},{kg:76,reps:9,done:true}])],{bodyWeight:80,feel:'normal',notes:'Anterior'})];loadLast();`);
  assert.equal(run('WD.pb_0[0].kg'), 71);
  assert.equal(run('WD.pb_0[1].kg'), 76);
  assert.equal(run('W.notes'), 'Nota de hoy');
  assert.equal(run('W.feel'), 'muy_bien');
  assert.equal(run('W.bw'), '77');
});

test('Whole-day loading falls back per exercise when the latest partial workout omitted it', () => {
  run(`S.sessions=[session([saved(row,[{kg:35,reps:10,done:true}])]),session([saved(press,[{kg:76,reps:10,done:true}]),saved(row,[{kg:100,reps:10,done:false}])])];loadLast();`);
  assert.equal(run('WD.custom_row_1[0].kg'), 35);
});

test('Whole-day loading does not borrow a reference from a differently named day', () => {
  run(`S.sessions=[session([saved(row,[{kg:35,reps:10,done:true}])],{dayName:'Día B'})];loadLast();`);
  assert.equal(run('WD.custom_row_1[0].kg'), 30);
});

test('Whole-day loading matches compatible exercise identity rather than position', () => {
  run(`S.sessions=[session([saved(row,[{kg:35,reps:10,done:true}]),saved(press,[{kg:80,reps:10,done:true},{kg:76,reps:9,done:true}])])];loadLast();`);
  assert.equal(run('WD.pb_0[1].kg'), 76);
  assert.equal(run('WD.custom_row_1[0].kg'), 35);
});

test('Reference loading cannot borrow a load from different equipment', () => {
  run(`S.sessions=[session([saved({...press,equipment:'mancuernas'},[{kg:24,reps:10,done:true},{kg:22,reps:10,done:true}])])];loadLast();`);
  assert.equal(run('WD.pb_0[1].kg'), 63);
  assert.equal(run('lastExerciseRecord(press)'), null);
});

test('GPS measurements remain a valid reference even when their planned set was not marked', () => {
  run(`const walk={id:'walk_test',name:'Paseo',type:'walk',durationMin:10,sets:[{kg:0,reps:10,done:false}],gps:{durationMin:3,distanceKm:.2}};S.sessions=[session([walk])];`);
  assert.equal(run(`lastExerciseRecord({id:'walk_test',name:'Paseo',type:'walk'}).exercise.gps.durationMin`), 3);
});

test('A timed block with only unperformed planned minutes is not a recorded reference', () => {
  run(`S.sessions=[session([{id:'walk_test',name:'Paseo',type:'walk',durationMin:10,sets:[{kg:0,reps:10,done:false}]}])];`);
  assert.equal(run(`lastExerciseRecord({id:'walk_test',name:'Paseo',type:'walk'})`), null);
});

test('Exercise reference chips skip an omitted latest workout', () => {
  run(`S.sessions=[session([saved(press,[{kg:75,reps:8,done:true}])]),session([saved(press,[{kg:200,reps:10,done:false}])])];`);
  const html = run('exerciseRefs(press)');
  assert.match(html, /Última vez: 75kg × 8/);
  assert.match(html, /Mejor: 75kg × 8/);
  assert.doesNotMatch(html, /200/);
});

test('An unperformed high load cannot become the Best chip', () => {
  run(`S.sessions=[session([saved(press,[{kg:200,reps:10,done:false},{kg:60,reps:10,done:true}])])];`);
  const html = run('exerciseRefs(press)');
  assert.match(html, /Mejor: 60kg × 10/);
  assert.doesNotMatch(html, /200/);
});

test('Exercise reference chips are explicitly bilingual', () => {
  run(`lang='en';S.sessions=[session([saved(press,[{kg:75,reps:8,done:true}])])];`);
  const html = run('exerciseRefs(press)');
  assert.match(html, /Last time: 75kg × 8/);
  assert.match(html, /Best: 75kg × 8/);
  assert.doesNotMatch(html, /Última vez|Mejor/);
});

test('Timed chips show measured time rather than the unperformed planned target', () => {
  run(`const measuredWalk={id:'walk_measured',name:'Paseo medido',type:'walk',durationMin:20,sets:[{kg:0,reps:20,done:false}],gps:{durationMin:3,distanceKm:.2}};S.sessions=[session([measuredWalk])];`);
  const html = run(`exerciseRefs({id:'walk_measured',name:'Paseo medido',type:'walk',durationMin:20})`);
  assert.match(html, /3 min/);
  assert.doesNotMatch(html, /20 min/);
});

test('All-completed destination sets and old history remain byte-for-byte unchanged', () => {
  run(`WD.pb_0.forEach(set=>set.done=true);S.sessions=[session([saved(press,[{kg:80,reps:10,done:true},{kg:76,reps:9,done:true}])])];`);
  const before = run('JSON.stringify({WD,sessions:S.sessions,W})');
  run(`copyFirstToAll('pb_0');applyLastExercise(0,'pb_0');loadLast();`);
  assert.equal(run('JSON.stringify({WD,sessions:S.sessions,W})'), before);
});

console.log(`${passed} logging safety regression tests passed.`);
