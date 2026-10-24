#!/usr/bin/env node
'use strict';

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
  'saveWorkoutDraft', 'restoreWorkoutDraft', 'clearWorkoutDraft', 'resumeWorkout',
  'discardWorkoutDraft', 'prepareWorkout', 'initWD', 'todayDay', 'setWorkoutMode',
  'completion', 'exKey', 'isTimedExercise', 'isBandExercise', 'nav',
  'estimateExerciseSec', 'estimateDayMin',
  'exerciseDisplayHint',
  'isBodyweightExercise', 'defaultSetKg', 'alternativesFor', 'selectedAlt',
  'exerciseVariantName', 'exerciseHistoryEquipment', 'workoutExerciseReference',
  'compatibleExerciseRecord', 'exerciseHistory', 'lastExerciseRecord',
  'workoutNumber', 'validWorkoutSet', 'recordedReferenceSet',
];
const context = vm.createContext({ console: { ...console, warn() {} }, Date, Math, Set, Map });
vm.runInContext([
  ...['TIMING','DB','ALT','ALT_EXTRA','SMART_ALT'].map(name=>declaration('const',name)),
  ...functions.map(name => declaration('function', name)),
].join('\n'), context, { filename: 'app-draft-functions.js' });
vm.runInContext(`
  let S,WD,W,workoutDraft,workoutDraftWarning,stored,confirmResult,confirmCalls,messages,nodes;
  const localStorage={
    getItem(key){return stored[key]??null;},
    setItem(key,value){stored[key]=String(value);},
    removeItem(key){delete stored[key];}
  };
  function node(id){return nodes[id]||(nodes[id]={textContent:'',classList:{toggle(){},remove(){}},scrollTo(){}});}
  const document={body:{classList:{toggle(){}}},getElementById:node};
  const window={scrollTo(){}};
  function currentLang(){return 'es';}
  function lt(value){return value;}
  function confirm(){confirmCalls++;return confirmResult;}
  function toast(message){messages.push(message);}
  function clearGpsWatcher(){}
  function stopWodTimer(){}
  function stopTimer(){}
  function closeSummary(){}
  function stopWorkoutCoachLoop(){}
  function stopWorkoutUiTicker(){}
  function startWorkoutCoachLoop(){}
  function startWorkoutUiTicker(){}
  function plusActive(){return false;}
  function track(){}
  function renderHome(){}
  function renderWorkout(){}
  function renderMenu(){}
  function renderNutrition(){}
  function renderProgress(){}
  function renderHistory(){}
  function renderSettings(){}
  function localizeTree(){}
  function syncAdMobBanner(){}
  function nativePlatform(){return 'web';}
  function requestAnimationFrame(callback){callback();}
  function welcomeWorkoutDay(day){return {...day,exercises:day.exercises.slice(0,1).map(ex=>({...ex,sets:1}))};}
  function strengthDay(name='Day A',count=4,sets=4){
    return {name,exercises:Array.from({length:count},(_,i)=>({id:'ex'+i,name:'Exercise '+i,type:'strength',equipment:'gym',sets,rr:'8-12',rest:120,hint:''}))};
  }
  function reset(){
    S={profile:{equipment:'gym'},routine:[strengthDay(),strengthDay('Day B')],sessions:[],curDay:0,screen:'home'};
    WD={};W={bw:'',feel:'normal',notes:'',mode:'normal'};workoutDraft=null;workoutDraftWarning=false;
    stored={};confirmResult=true;confirmCalls=0;messages=[];nodes={};
  }
  function restartRuntime(){WD={};W={bw:'',feel:'normal',notes:'',mode:'normal'};workoutDraft=null;workoutDraftWarning=false;}
  function fillDraft(){
    WD.ex0_0[0]={kg:73,reps:9,band:'',done:true};
    W.startedAt=1700000000000;W.notes='Sesión con calma';W.alt={ex0:'dumbbell_press'};W.altReason={ex0:'equipment'};
  }
  reset();
`, context);

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
let passed = 0, failed = 0;
function test(name, callback) {
  run('reset();');
  try {
    callback();
    passed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${name}\n  ${error.message}`);
  }
}

test('Navigating away and resuming preserves entered work and session metadata', () => {
  run("prepareWorkout(0);fillDraft();nav('menu');nav('home');prepareWorkout(0);");
  assert.deepEqual(plain('WD.ex0_0[0]'), { kg: 73, reps: 9, band: '', done: true });
  assert.equal(run('W.startedAt'), 1700000000000);
  assert.equal(run('W.notes'), 'Sesión con calma');
  assert.deepEqual(plain('W.alt'), { ex0: 'dumbbell_press' });
  assert.equal(run('S.screen'), 'workout');
  assert.equal(run('confirmCalls'), 0);
});

test('Reload restores sets, clock, notes and alternative from the saved draft', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();restartRuntime();');
  assert.equal(run('restoreWorkoutDraft()'), true);
  assert.deepEqual(plain('WD.ex0_0[0]'), { kg: 73, reps: 9, band: '', done: true });
  assert.equal(run('W.startedAt'), 1700000000000);
  assert.equal(run('W.notes'), 'Sesión con calma');
  assert.deepEqual(plain('W.alt'), { ex0: 'dumbbell_press' });
  assert.equal(run('W.active'), true);
});

test('Restoration uses the workout snapshot after the current routine changes', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();S.routine=[strengthDay("New plan",1,1)];restartRuntime();restoreWorkoutDraft();resumeWorkout();');
  assert.equal(run('todayDay(S.routine[0]).name'), 'Day A');
  assert.equal(run('todayDay(S.routine[0]).exercises.length'), 4);
  assert.equal(run('completion().total'), 16);
  assert.equal(run('WD.ex0_0[0].kg'), 73);
  assert.equal(run('S.routine[0].name'), 'New plan');
});

test('Cancelling replacement leaves the active and persisted workout unchanged', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();confirmResult=false;');
  const before = run('JSON.stringify({W,WD,stored})');
  assert.equal(run('prepareWorkout(1)'), false);
  assert.equal(run('confirmCalls'), 1);
  assert.equal(run('JSON.stringify({W,WD,stored})'), before);
});

test('Confirming replacement creates a new draft for the chosen day', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();');
  const previousId = run('W.draftId');
  assert.equal(run('prepareWorkout(1)'), true);
  assert.equal(run('confirmCalls'), 1);
  assert.notEqual(run('W.draftId'), previousId);
  assert.equal(run('W.sessionDay.name'), 'Day B');
  assert.equal(run('W.dayIndex'), 1);
  assert.equal(run('completion().done'), 0);
  assert.equal(run("JSON.parse(stored.ea_workout_draft_v1).id"), run('W.draftId'));
});

test('A draft already recorded in history is removed instead of restored', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();S.sessions.push({draftId:W.draftId});restartRuntime();');
  assert.equal(run('restoreWorkoutDraft()'), false);
  assert.equal(run("localStorage.getItem('ea_workout_draft_v1')"), null);
  assert.notEqual(run('W.active'), true);
});

test('Clearing a draft prevents it from returning after reload', () => {
  run('prepareWorkout(0);fillDraft();saveWorkoutDraft();clearWorkoutDraft();restartRuntime();');
  assert.equal(run('restoreWorkoutDraft()'), false);
  assert.equal(run('workoutDraft'), null);
});

test('Invalid JSON and incomplete draft envelopes fail without crashing', () => {
  for (const value of ['{broken', 'null', '{}', '{"version":2}', '{"version":1,"id":"x","state":{},"sets":{}}']) {
    run(`stored.ea_workout_draft_v1=${JSON.stringify(value)};restartRuntime();`);
    assert.equal(run('restoreWorkoutDraft()'), false);
    assert.notEqual(run('W.active'), true);
  }
});

test('Malformed set rows cannot become an active draft', () => {
  for (const rows of ['not an array', [null], [{ kg: 70, reps: 8, done: {} }]]) {
    run('reset();prepareWorkout(0);saveWorkoutDraft();');
    const draft = plain("JSON.parse(stored.ea_workout_draft_v1)");
    draft.sets.ex0_0 = rows;
    run(`stored.ea_workout_draft_v1=${JSON.stringify(JSON.stringify(draft))};restartRuntime();`);
    assert.equal(run('restoreWorkoutDraft()'), false);
    assert.notEqual(run('W.active'), true);
  }
});

test('Restored GPS is stopped and the WOD timer resumes in pause', () => {
  run('prepareWorkout(0);W.gps={ex0_0:{status:"recording",startedAt:1700000000000}};W.wodTimer={paused:false,left:300,total:600};saveWorkoutDraft();restartRuntime();restoreWorkoutDraft();');
  assert.equal(run('W.gps.ex0_0.status'), 'stopped');
  assert.equal(run('W.gps.ex0_0.endedAt'), run('workoutDraft.updatedAt'));
  assert.equal(run('W.wodTimer.paused'), true);
});

test('A fresh Express workout converts 4 by 4 into 3 by 2 with six total sets', () => {
  run("prepareWorkout(0,{mode:'express'});");
  assert.equal(run('todayDay(S.routine[0]).exercises.length'), 3);
  assert.deepEqual(plain('Object.values(WD).map(sets=>sets.length)'), [2,2,2]);
  assert.deepEqual(plain('completion()'), { done: 0, total: 6, pct: 0 });
  run('Object.values(WD).forEach(sets=>sets.forEach(set=>set.done=true));');
  assert.equal(run('completion().pct'), 100);
});

test('Mode changes preserve completed rows, including excluded exercises', () => {
  run(`prepareWorkout(0);fillDraft();
    WD.ex0_0[3]={kg:83,reps:7,band:'',done:true};
    WD.ex3_3[3]={kg:99,reps:5,band:'',done:true};
    setWorkoutMode('express');setWorkoutMode('suave');setWorkoutMode('normal');`);
  assert.deepEqual(plain('Object.values(WD).flat().filter(set=>set.done).map(set=>set.kg).sort((a,b)=>a-b)'), [73,83,99]);
  assert.equal(run('completion().done'), 3);
  assert.equal(run('W.startedAt'), 1700000000000);
  assert.equal(run('W.notes'), 'Sesión con calma');
  assert.deepEqual(plain('W.alt'), { ex0: 'dumbbell_press' });
});

test('Expanding a mode uses the selected dumbbell reference and preserves existing rows', () => {
  run(`S.routine=[{name:'Press day',exercises:[{id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:4,rr:'8-12',rest:90,hint:''}]}];
    S.sessions=[{exercises:[
      {id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:[{kg:80,reps:8,done:true}]},
      {id:'pim',name:'Press con mancuernas',type:'strength',equipment:'mancuernas',sets:[{kg:18,reps:10,done:true}]}
    ]}];
    prepareWorkout(0,{mode:'express'});W.alt.pb='pim';W.notes='Con calma';
    WD.pb_0=[{kg:18,reps:10,band:'',done:true},{kg:21,reps:9,band:'',done:false}];
    setWorkoutMode('normal');`);
  assert.equal(run('workoutExerciseReference(W.sessionDay.exercises[0]).id'), 'pim');
  assert.deepEqual(plain('WD.pb_0.slice(0,2)'), [{kg:18,reps:10,band:'',done:true},{kg:21,reps:9,band:'',done:false}]);
  assert.deepEqual(plain('WD.pb_0.slice(2).map(set=>set.kg)'), [18,18]);
  assert.equal(run('WD.pb_0.length'), 4);
  assert.equal(run('W.notes'), 'Con calma');
  assert.equal(run('completion().done'), 1);
});

test('Expanding without a selected-variant reference never borrows the base load', () => {
  run(`S.routine=[{name:'Press day',exercises:[{id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:4,rr:'8-12',rest:90,hint:''}]}];
    S.sessions=[{exercises:[{id:'pb',name:'Press de banca',type:'strength',equipment:'gym',sets:[{kg:80,reps:8,done:true}]}]}];
    prepareWorkout(0,{mode:'express'});W.alt.pb='pim';
    WD.pb_0=[{kg:16,reps:10,band:'',done:true},{kg:16,reps:10,band:'',done:false}];
    setWorkoutMode('normal');`);
  assert.deepEqual(plain('WD.pb_0.slice(2).map(set=>set.kg)'), [0,0]);
  assert.equal(run('WD.pb_0[0].kg'), 16);
  assert.equal(run('WD.pb_0[0].done'), true);
  assert.equal(run('W.alt.pb'), 'pim');
});

test('Expanding a selected band alternative creates band rows without base kilograms', () => {
  run(`S.routine=[{name:'Row day',exercises:[{id:'rm',name:'Remo máquina',type:'strength',equipment:'gym',sets:4,rr:'10-12',rest:90,hint:''}]}];
    S.sessions=[{exercises:[{id:'rm',name:'Remo máquina',type:'strength',equipment:'gym',sets:[{kg:60,reps:10,done:true}]}]}];
    prepareWorkout(0,{mode:'express'});W.alt.rm='band_row';
    WD.rm_0=[{kg:0,reps:12,band:'Fuerte',done:true},{kg:0,reps:11,band:'Ligera',done:false}];
    setWorkoutMode('normal');`);
  assert.equal(run('workoutExerciseReference(W.sessionDay.exercises[0]).id'), 'band_row');
  assert.deepEqual(plain('WD.rm_0.slice(0,2)'), [{kg:0,reps:12,band:'Fuerte',done:true},{kg:0,reps:11,band:'Ligera',done:false}]);
  assert.deepEqual(plain('WD.rm_0.slice(2).map(({kg,band,done})=>({kg,band,done}))'), [{kg:0,band:'Media',done:false},{kg:0,band:'Media',done:false}]);
  assert.equal(run('WD.rm_0.length'), 4);
});

test('A one-set exercise stays one set in every reduced mode', () => {
  for (const mode of ['express', 'suave', 'express_suave']) {
    run(`reset();S.routine=[strengthDay('Short plan',1,1)];prepareWorkout(0,{mode:${JSON.stringify(mode)}});`);
    assert.equal(run('completion().total'), 1, mode);
    assert.equal(run('todayDay(S.routine[0]).exercises[0].sets'), 1, mode);
  }
});

test('Reduced modes never lengthen a short timed block', () => {
  for (const mode of ['express', 'suave', 'express_suave']) {
    run(`reset();S.routine=[{name:'Short walk',exercises:[{id:'walk_short',name:'Short walk',type:'walk',sets:1,durationMin:2,rr:'Easy',rest:0,hint:''}]}];prepareWorkout(0,{mode:${JSON.stringify(mode)}});`);
    assert.ok(run('todayDay(S.routine[0]).exercises[0].durationMin') <= 2, mode);
    assert.ok(run('WD.walk_short_0[0].reps') <= 2, mode);
    assert.equal(run('completion().total'), 1, mode);
  }
});

test('Passive initialization cannot overwrite an active workout', () => {
  run('prepareWorkout(0);fillDraft();');
  const before = run('JSON.stringify({W,WD})');
  run('initWD(1);');
  assert.equal(run('JSON.stringify({W,WD})'), before);
});

test('Strength tips cannot contradict the structured set and rest prescription', () => {
  assert.equal(run(`exerciseDisplayHint({type:'strength',hint:'4×10. Descanso 75s. Controla la bajada.'})`), 'Controla la bajada.');
  assert.equal(run(`exerciseDisplayHint({type:'strength',hint:'3 x 8-12. Mantén el control.'})`), 'Mantén el control.');
});

test('Timed instructions keep their interval prescription', () => {
  assert.equal(run(`exerciseDisplayHint({type:'run',hint:'4×2 minutos a ritmo cómodo.'})`), '4×2 minutos a ritmo cómodo.');
});

test('A completed welcome draft is recoverable after an interrupted autosave', () => {
  run('prepareWorkout(0,{welcome:true});Object.values(WD).flat().forEach(set=>set.done=true);W.autoSaving=true;saveWorkoutDraft();restartRuntime();restoreWorkoutDraft();');
  assert.equal(run('W.welcome'), true);
  assert.equal(run('W.autoSaving'), false);
  assert.equal(run('completion().pct'), 100);
});

console.log(`${passed} workout draft regression tests passed${failed ? `; ${failed} failed` : ''}.`);
if (failed) process.exitCode = 1;
