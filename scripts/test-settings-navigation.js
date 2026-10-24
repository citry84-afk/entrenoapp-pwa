#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

function fixture() {
  const context = vm.createContext({ console, Date, Math, Set });
  vm.runInContext([
    'initWD', 'setPref', 'setExperience', 'regenRoutine', 'switchToGuidedRoutine',
    'setLanguage', 'soundDefault', 'soundState', 'setSoundPref',
    'reminderDefault', 'reminderState', 'setReminderTime', 'toggleReminderDay',
  ].map(declaration).join('\n'), context);
  vm.runInContext(`
    let generated = 0, rendered = 0, navigated = [], messages = [], stored = {}, scheduled = 0;
    let S = {
      profile: {mode:'musculacion',priority:'musculo',equipment:'gym',time:'40',days:'3',experience:'intermedio'},
      routine:[{name:'Original routine',exercises:[{id:'bench',name:'Bench press',sets:3,rr:'8-12'}]}],
      sessions:[{id:'saved-session',date:'2026-10-21',exercises:[{name:'Bench press',sets:[{kg:60,reps:10,done:true}]}]}],
      bodyWeights:[{date:'2026-10-21',weight:75}], curDay:0, manualToday:false, screen:'settings',
    };
    let WD = {bench_0:[{kg:73,reps:9,done:true},{kg:73,reps:8,done:false}]};
    let W = {
      active:true, draftId:'ongoing-workout', dayIndex:0, notes:'Do not lose this note',
      baseDay:JSON.parse(JSON.stringify(S.routine[0])), sessionDay:JSON.parse(JSON.stringify(S.routine[0])),
      startedAt:1700000000000, mode:'normal',
    };
    const localStorage={setItem(key,value){stored[key]=String(value);}};
    const document={};
    function currentLang(){return S.lang||'es';}
    function normalizeProfile(profile){return {...profile,normalized:true};}
    function genRoutine(profile){generated++;return [{name:'Updated '+profile.mode,exercises:[{id:'updated',name:'Updated exercise',sets:2,rr:'8-12'}]}];}
    function todayDay(day){return day;}
    function clearGpsWatcher(){}
    function stopWodTimer(){}
    function exKey(ex,i){return ex.key||ex.id+'_'+i;}
    function isTimedExercise(){return false;}
    function isBandExercise(){return false;}
    function defaultSetKg(){return 0;}
    function persist(){stored.ea6=JSON.stringify(S);return true;}
    function renderSettings(){rendered++;}
    function toast(message){messages.push(message);}
    function lt(value){return value;}
    function localizeTree(){}
    function nav(screen){navigated.push(screen);S.screen=screen;}
    function updateOnboardingCta(){}
    function scheduleWorkoutReminders(){scheduled++;return Promise.resolve(false);}
    function confirm(){return true;}
    function openRoutineBuilder(){throw new Error('Manual routine must not be regenerated');}
  `, context);
  return {
    run(code) { return vm.runInContext(code, context); },
    plain(code) { return JSON.parse(JSON.stringify(vm.runInContext(code, context))); },
  };
}

let passed = 0;
let failed = 0;
function test(name, callback) {
  try {
    callback(fixture());
    passed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${name}\n  ${error.stack || error.message}`);
  }
}

function workoutSnapshot(f) {
  return f.run('JSON.stringify({W,WD,sessions:S.sessions,bodyWeights:S.bodyWeights})');
}

for (const [field, value] of [['mode','caminar'], ['priority','fuerza'], ['equipment','bandas'], ['time','20'], ['days','5']]) {
  test(`Changing ${field} updates the plan without touching an active workout or history`, f => {
    const before = workoutSnapshot(f);
    f.run(`setPref(${JSON.stringify(field)},${JSON.stringify(value)});`);
    assert.equal(workoutSnapshot(f), before);
    assert.equal(f.run('generated'), 1);
    assert.equal(f.run('rendered'), 1);
    assert.equal(f.run('S.profile.normalized'), true);
    assert.equal(f.run('JSON.parse(stored.ea6).sessions[0].id'), 'saved-session');
  });
}

test('Changing experience keeps active sets, notes, start time and saved sessions', f => {
  const before = workoutSnapshot(f);
  f.run("setExperience('principiante');");
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('S.profile.experience'), 'principiante');
  assert.equal(f.run('generated'), 1);
});

test('Explicit regeneration keeps the active workout snapshot and history', f => {
  const before = workoutSnapshot(f);
  f.run('regenRoutine();');
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('generated'), 1);
});

test('Switching from a manual to guided plan preserves the current workout and history', f => {
  const before = workoutSnapshot(f);
  f.run('S.profile.manualRoutine=true;switchToGuidedRoutine();');
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('S.profile.manualRoutine'), undefined);
  assert.equal(f.run('generated'), 1);
});

test('Manual routines reject guided preference and level mutations', f => {
  f.run('S.profile.manualRoutine=true;');
  const before = f.run('JSON.stringify({S,W,WD})');
  f.run("setPref('equipment','bandas');setExperience('principiante');");
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  assert.equal(f.run('generated'), 0);
  assert.equal(f.run('rendered'), 0);
});

test('Without an active workout, updated preferences prepare the new routine', f => {
  f.run("W.active=false;setPref('time','20');");
  assert.equal(f.run('W.sessionDay.name'), 'Updated musculacion');
  assert.equal(f.run('W.active'), false);
  assert.equal(f.run('WD.updated_0.length'), 2);
  assert.equal(f.run('S.sessions[0].id'), 'saved-session');
});

test('Language changes retain the current screen, active workout and history', f => {
  const before = workoutSnapshot(f);
  f.run("setLanguage('en');");
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('S.lang'), 'en');
  assert.equal(f.run('stored.ea_lang'), 'en');
  assert.deepEqual(f.plain('navigated'), []);
  assert.equal(f.run('rendered'), 1, 'Language refreshes Settings without a navigation scroll reset');
});

test('Sound preferences preserve the active workout and saved history', f => {
  const before = workoutSnapshot(f);
  f.run("setSoundPref('vibration',false);");
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('S.sound.vibration'), false);
  assert.equal(f.run('rendered'), 1);
});

test('Reminder day and time changes retain the active workout and history', f => {
  const before = workoutSnapshot(f);
  f.run("S.reminder={enabled:true,time:'19:30',days:[1,3,5]};setReminderTime('18:45');toggleReminderDay(2);");
  assert.equal(workoutSnapshot(f), before);
  assert.equal(f.run('S.reminder.time'), '18:45');
  assert.equal(f.run('S.reminder.days.includes(2)'), true);
  assert.equal(f.run('scheduled'), 2);
});

test('At least one reminder day remains selected', f => {
  f.run('S.reminder={enabled:false,time:"19:30",days:[3]};toggleReminderDay(3);');
  assert.deepEqual(f.plain('S.reminder.days'), [3]);
});

console.log(`\n${passed} settings navigation tests passed${failed ? `, ${failed} failed` : ''}.`);
if (failed) process.exitCode = 1;
