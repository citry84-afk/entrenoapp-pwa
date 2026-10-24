#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(name) {
  const start = source.search(new RegExp(`^function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

const context = vm.createContext({ console, Date });
vm.runInContext([
  'escHtml', 'exKey', 'completion', 'liveWorkoutMetrics', 'workoutClockLabel',
  'renderWorkoutSessionBar', 'renderWelcomeSavePanel', 'handleExerciseCompleted', 'saveSession',
  'workoutNumber', 'validWorkoutSet', 'validatePendingWorkoutSets',
].map(declaration).join('\n'), context, { filename: 'app-welcome-functions.js' });
vm.runInContext(`
  let S,W,WD,lang,timers,saved,messages,events;
  function currentLang(){return lang;}
  function lt(value){return value;}
  function todayDay(day){return day;}
  function toast(message){messages.push(message);}
  function trackOnce(name,data,key){events.push({name,data,key});}
  function setTimeout(callback,delay){timers.push({callback,delay});}
  const document={getElementById(){return {textContent:''};}};
  const localStorage={setItem(){}};
  function workoutExerciseReference(ex){return ex;}
  function serializeGps(){return null;}
  function isTimedExercise(){return false;}
  function isWodExercise(){return false;}
  function calcSessionStats(exercises){const sets=exercises.flatMap(ex=>ex.sets),done=sets.filter(set=>set.done).length;return {done,total:sets.length,pct:sets.length?Math.round(done/sets.length*100):0};}
  function detectSessionPRs(){return [];}
  function workoutDurationMin(){return 1;}
  function dayKind(){return 'strength';}
  function workoutDayKey(day){return JSON.stringify(day);}
  function unlockAchievements(){return [];}
  function persist(){return true;}
  function streak(){return 1;}
  function track(){}
  function productAnalyticsCohort(){return {eligible:false};}
  function stopWorkoutCoachLoop(){}
  function stopTimer(){}
  function clearGpsWatcher(){}
  function disableWakeLock(){}
  function clearWorkoutDraft(){W.active=false;}
  function showWelcomeWorkoutComplete(){saved++;}
  function showSessionSummary(){saved++;}
  function nav(){}
  function progress(done){Object.values(WD).forEach((sets,index)=>sets[0].done=index<done);}
  function reset(){
    S={routine:[{name:'Welcome day',exercises:[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}]}],curDay:0,sessions:[],bodyWeights:[],achievements:[]};
    W={welcome:true,active:true,autoSaving:false,saveError:false,mode:'normal',startedAt:Date.now()};
    WD={a_0:[{kg:0,reps:8,done:false}],b_1:[{kg:0,reps:8,done:false}],c_2:[{kg:0,reps:8,done:false}]};
    lang='es';timers=[];saved=0;messages=[];events=[];
  }
  reset();
`, context);

function run(code) { return vm.runInContext(code, context); }
let passed = 0, failed = 0;
function test(name, callback) {
  run('reset();');
  try { callback();passed++;console.log(`✓ ${name}`); }
  catch (error) { failed++;console.error(`✗ ${name}\n  ${error.stack}`); }
}

test('Zero completed welcome steps has no save action and Finish is disabled', () => {
  const panel = run('renderWelcomeSavePanel(completion())');
  const bar = run('renderWorkoutSessionBar(S.routine[0])');
  assert.doesNotMatch(panel, /<button\b/);
  assert.match(panel, /Puedes guardar desde el primer paso/);
  assert.match(bar, /<button[^>]*onclick="openFinishWorkout\(\)"[^>]*\bdisabled/);
  assert.match(bar, /0\/3/);
});

test('One completed welcome step exposes Guardar lo hecho and enables Finish', () => {
  run('progress(1)');
  assert.match(run('renderWelcomeSavePanel(completion())'), /onclick="saveSession\(\)"[^>]*>Guardar lo hecho/);
  const bar = run('renderWorkoutSessionBar(S.routine[0])');
  assert.doesNotMatch(bar, /\bdisabled/);
  assert.match(bar, /1\/3/);
});

test('Three completed steps retain a manual save without rendering any new timer', () => {
  run('progress(3)');
  assert.match(run('renderWelcomeSavePanel(completion())'), />Guardar lo hecho<\/button>/);
  run('renderWelcomeSavePanel(completion());renderWorkoutSessionBar(S.routine[0]);');
  assert.equal(run('timers.length'), 0);
  assert.equal(run('saved'), 0);
  assert.equal(run('W.autoSaving'), false);
});

test('Storage failure shows an explicit retry action and keeps completed work intact', () => {
  run('progress(1);W.saveError=true;');
  const before = run('JSON.stringify({S,W,WD})');
  const panel = run('renderWelcomeSavePanel(completion())');
  assert.match(panel, /onclick="saveSession\(\)"[^>]*>Reintentar guardado/);
  assert.match(panel, /Libera espacio/);
  assert.equal(run('JSON.stringify({S,W,WD})'), before);
});

test('Welcome render functions never modify profile, workout or logged sets', () => {
  run('progress(1)');
  const before = run('JSON.stringify({S,W,WD})');
  run('renderWelcomeSavePanel(completion());renderWorkoutSessionBar(S.routine[0]);');
  assert.equal(run('JSON.stringify({S,W,WD})'), before);
});

test('Partial exercise completion never schedules an automatic save', () => {
  run("progress(1);handleExerciseCompleted('a_0')");
  assert.equal(run('timers.length'), 0);
  assert.equal(run('saved'), 0);
  assert.equal(run('W.autoSaving'), false);
});

test('Completing every welcome step uses the existing single autosave timer', () => {
  run("progress(3);handleExerciseCompleted('c_2');handleExerciseCompleted('c_2');");
  assert.equal(run('timers.length'), 1);
  assert.equal(run('timers[0].delay'), 650);
  assert.equal(run('W.autoSaving'), true);
  run('timers.shift().callback()');
  assert.equal(run('saved'), 1);
});

test('Manual save before the pending autosave cannot save the welcome twice', () => {
  run("progress(3);handleExerciseCompleted('c_2');saveSession();timers.shift().callback();");
  assert.equal(run('saved'), 1);
  assert.equal(run('S.sessions.length'), 1);
  assert.equal(run('W.active'), false);
});

test('The real save function accepts one completed step and rejects an empty welcome', () => {
  run('saveSession()');
  assert.equal(run('S.sessions.length'), 0);
  assert.equal(run('W.active'), true);
  run('progress(1);saveSession();saveSession();');
  assert.equal(run('S.sessions.length'), 1);
  assert.equal(run('S.sessions[0].summary.done'), 1);
  assert.equal(run('S.sessions[0].summary.total'), 3);
  assert.equal(run('S.sessions[0].welcomeWorkout'), true);
});

test('Unmarking before the autosave cancels its save and releases the guard', () => {
  run("progress(3);handleExerciseCompleted('c_2');progress(2);timers.shift().callback();");
  assert.equal(run('saved'), 0);
  assert.equal(run('W.autoSaving'), false);
});

test('Normal workouts keep Finish enabled before completing any sets', () => {
  run('W.welcome=false');
  const bar = run('renderWorkoutSessionBar(S.routine[0])');
  assert.doesNotMatch(bar, /\bdisabled/);
  assert.match(bar, /Entrenamiento en curso/);
  assert.match(bar, /series/);
});

test('Spanish and English both expose partial save, finish and retry clearly', () => {
  run("lang='en'");
  assert.match(run('renderWelcomeSavePanel(completion())'), /You can save after the first step/);
  assert.match(run('renderWorkoutSessionBar(S.routine[0])'), />Finish<\/button>/);
  run('progress(1)');
  assert.match(run('renderWelcomeSavePanel(completion())'), />Save what I did<\/button>/);
  assert.match(run('renderWorkoutSessionBar(S.routine[0])'), /Welcome workout/);
  run('W.saveError=true');
  assert.match(run('renderWelcomeSavePanel(completion())'), />Retry saving<\/button>/);
});

console.log(`\n${passed} welcome workout tests passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
