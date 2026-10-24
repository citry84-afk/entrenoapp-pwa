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
  const context = vm.createContext({ console: { ...console, warn() {} }, Date, Math, Set });
  vm.runInContext([
    'nextWorkoutLocalDate', 'parseNextWorkoutDate', 'workoutDayKey', 'normalizeNextWorkout',
    'backupObject', 'backupStateSnapshot', 'validateBackupDraft', 'createBackupPayload',
    'validateBackupPayload', 'writeBackupStorage', 'applyImportedBackup', 'syncImportedBackupNotifications', 'exportData', 'importData',
  ].map(declaration).join('\n'), context);
  vm.runInContext(`
    const day={name:'Original plan',exercises:[{id:'bench',name:'Bench press',sets:2,rr:'8-12'}]};
    let S={profile:{mode:'musculacion'},routine:[day],sessions:[{id:'saved-one',date:'2026-10-21T10:00:00.000Z',exercises:[{name:'Bench press',sets:[{kg:60,reps:8,done:true}]}]}],bodyWeights:[{weight:75}],sound:{enabled:false,countdown:true,vibration:false},lang:'en',curDay:0,screen:'settings'};
    let W={active:true,draftId:'draft-one',dayIndex:0,baseDay:day,sessionDay:day,startedAt:1700000000000,notes:'Keep my note',mode:'normal',gps:{},wodTimer:null};
    let WD={bench_0:[{kg:73,reps:9,done:true},{kg:73,reps:8,done:false}]};
    let workoutDraft=null,workoutDraftWarning=false;
    let stored={ea6:JSON.stringify(S),ea_workout_draft_v1:'previous-draft-bytes'},writeCalls=0,failWrites=new Set(),dropWrites=new Set(),failAllWrites=false;
    let messages=[],confirms=[],confirmResult=true,downloadText='',downloadName='',stopCount=0,navigated=[],readFails=false;
    let notificationCalls=[],cancelWorkoutFails=false,cancelNudgesFails=false,restoreFails=false;
    const originalS=S,originalW=W,originalWD=WD;
    const originalStorage=JSON.stringify(stored);
    const localStorage={
      getItem(key){return Object.hasOwn(stored,key)?stored[key]:null;},
      setItem(key,value){writeCalls++;if(failAllWrites||failWrites.has(writeCalls))throw new Error('Quota exceeded');if(!dropWrites.has(writeCalls))stored[key]=String(value);},
      removeItem(key){writeCalls++;if(failAllWrites||failWrites.has(writeCalls))throw new Error('Storage blocked');if(!dropWrites.has(writeCalls))delete stored[key];}
    };
    const document={createElement(){return {set href(value){},set download(value){downloadName=value;},click(){}};},getElementById(){return {style:{}};}};
    class Blob {constructor(parts){downloadText=parts.join('');}}
    const URL={createObjectURL(){return 'blob:test';},revokeObjectURL(){}};
    class FileReader {readAsText(file){if(readFails)this.onerror();else{this.result=file.text;this.onload();}}}
    function setTimeout(callback){callback();}
    function currentLang(){return S.lang||'es';}
    function exKey(ex,i){return ex.key||ex.id+'_'+i;}
    function genRoutine(){return [{name:'Generated legacy plan',exercises:[{id:'walk',name:'Walk',sets:1}]}];}
    function toast(message){messages.push(message);}
    function confirm(message){confirms.push(message);return confirmResult;}
    function closeSummary(){}
    function nav(screen){navigated.push(screen);S.screen=screen;}
    function clearGpsWatcher(){stopCount++;}
    function stopWodTimer(){stopCount++;}
    function stopTimer(){stopCount++;}
    function stopWorkoutCoachLoop(){stopCount++;}
    function stopWorkoutUiTicker(){stopCount++;}
    async function disableWakeLock(){}
    async function cancelWorkoutReminders(){notificationCalls.push('cancel-workout');if(cancelWorkoutFails)throw new Error('Workout cancellation failed');}
    async function cancelDailyNudges(){notificationCalls.push('cancel-nudges');if(cancelNudgesFails)throw new Error('Nudge cancellation failed');}
    async function restoreNotificationSchedules(){notificationCalls.push('restore-existing-permission');if(restoreFails)throw new Error('Permission unavailable');}
    function incoming(){return {backupVersion:2,profile:{mode:'caminar'},routine:[{name:'Imported plan',exercises:[{id:'walk',name:'Walk',sets:1}]}],sessions:[{id:'imported-one',date:'2026-10-21T11:00:00.000Z',exercises:[{name:'Walk',sets:[{kg:0,reps:10,done:true}]}]}],sound:{enabled:true,vibration:true},lang:'es'};}
    function stateUnchanged(){return S===originalS&&W===originalW&&WD===originalWD;}
    function storageUnchanged(){return JSON.stringify(stored)===originalStorage;}
  `, context);
  return {
    run(code) { return vm.runInContext(code, context); },
    plain(code) { return JSON.parse(JSON.stringify(vm.runInContext(code, context))); },
  };
}

const tests = [];
function test(name, callback) {
  tests.push([name, callback]);
}

test('The backup includes language, sound and complete saved history', f => {
  const payload = f.plain('createBackupPayload()');
  assert.equal(payload.backupVersion, 2);
  assert.equal(payload.lang, 'en');
  assert.deepEqual(payload.sound, { enabled: false, countdown: true, vibration: false });
  assert.equal(payload.sessions[0].id, 'saved-one');
  assert.equal(payload.bodyWeights[0].weight, 75);
});

test('The next workout survives export and validated import with its local date', f => {
  f.run("S.nextWorkout={version:1,afterSessionId:'saved-one',dayIndex:0,dayKey:workoutDayKey(day),date:'2026-10-25'};");
  const exported=f.plain('createBackupPayload().nextWorkout');
  assert.equal(exported.date,'2026-10-25');
  assert.deepEqual(f.plain('validateBackupPayload(createBackupPayload()).state.nextWorkout'),exported);
});

test('Old backups omit next workout safely and malformed plans never replace data', f => {
  assert.equal(f.run('validateBackupPayload(incoming()).state.nextWorkout'),null);
  for(const change of ["data.nextWorkout={};", "data.nextWorkout={version:1,afterSessionId:'imported-one',dayIndex:0,dayKey:workoutDayKey(data.routine[0]),date:'2026-02-30'};", "data.nextWorkout={version:1,afterSessionId:'other-session',dayIndex:0,dayKey:workoutDayKey(data.routine[0]),date:null};"]){
    assert.throws(()=>f.run(`{const data=incoming();${change}validateBackupPayload(data);}`));
  }
  assert.equal(f.run('stateUnchanged()'),true);
  assert.equal(f.run('writeCalls'),0);
});

test('An active workout is backed up directly from memory with its snapshot, notes and rows', f => {
  const draft = f.plain('createBackupPayload().workoutDraft');
  assert.equal(draft.state.notes, 'Keep my note');
  assert.equal(draft.state.sessionDay.name, 'Original plan');
  assert.deepEqual(draft.sets.bench_0[0], { kg: 73, reps: 9, done: true });
  assert.equal(f.run('writeCalls'), 0);
});

test('Export still downloads the in-memory workout when device storage refuses all writes', f => {
  f.run('failAllWrites=true;exportData();');
  assert.equal(f.run('downloadName'), 'entrenoapp-backup.json');
  assert.equal(f.run('JSON.parse(downloadText).workoutDraft.sets.bench_0[0].kg'), 73);
  assert.equal(f.run('writeCalls'), 0);
  assert.equal(f.run('stateUnchanged()'), true);
});

test('Export pauses timers and stops recovered GPS without altering the running workout', f => {
  f.run('W.wodTimer={paused:false,left:120};W.gps={bench_0:{status:"recording",startedAt:1700000000000}};');
  const draft = f.plain('createBackupPayload().workoutDraft');
  assert.equal(draft.state.wodTimer.paused, true);
  assert.equal(draft.state.gps.bench_0.status, 'stopped');
  assert.equal(f.run('W.wodTimer.paused'), false);
  assert.equal(f.run('W.gps.bench_0.status'), 'recording');
});

test('Export does not include unrelated account or authorization fields', f => {
  f.run('S.accessToken="do-not-export";S.plusAccount={token:"private"};');
  const payload = f.plain('createBackupPayload()');
  assert.equal(payload.accessToken, undefined);
  assert.equal(payload.plusAccount, undefined);
});

test('Legacy backups remain valid and keep the current language when none was stored', f => {
  f.run('let legacy=incoming();delete legacy.backupVersion;delete legacy.sound;delete legacy.lang;');
  assert.equal(f.run('validateBackupPayload(legacy,"en").state.lang'), 'en');
  assert.equal(f.run('validateBackupPayload(legacy,"en").state.sound'), null);
  assert.equal(f.run('validateBackupPayload(legacy,"en").draft'), null);
});

test('A legacy backup without a routine gets a generated plan before any mutation', f => {
  f.run('let legacy=incoming();delete legacy.routine;');
  assert.equal(f.run('validateBackupPayload(legacy).state.routine[0].name'), 'Generated legacy plan');
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('writeCalls'), 0);
});

test('Malformed history, preferences, routine and version are rejected without changing data', f => {
  for (const change of ['data.sessions={};','data.sessions[0].exercises[0].sets=[null];','data.sound=[];','data.lang="xx";','data.routine="bad";','data.backupVersion=99;']) {
    assert.throws(() => f.run(`{const data=incoming();${change}validateBackupPayload(data);}`));
  }
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
});

test('A malformed workout draft is rejected before replacement', f => {
  f.run('let data=createBackupPayload();data.workoutDraft.sets.bench_0=[null];');
  assert.throws(() => f.run('validateBackupPayload(data);'));
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('writeCalls'), 0);
});

test('Invalid history dates and missing stable identifiers are rejected without writing', f => {
  for(const change of ['delete data.sessions[0].date;','data.sessions[0].date={};','data.sessions[0].date="not-a-date";','delete data.sessions[0].id;','data.sessions[0].id={};']) {
    assert.throws(()=>f.run(`{const data=incoming();${change}validateBackupPayload(data);}`));
  }
  assert.equal(f.run('writeCalls'), 0);
  assert.equal(f.run('stateUnchanged()'), true);
});

test('Draft GPS, timer and timestamps must be restorable objects and finite numbers', f => {
  for(const change of ['data.workoutDraft.state.gps={bad:null};','data.workoutDraft.state.gps=[];','data.workoutDraft.state.wodTimer="bad";','data.workoutDraft.updatedAt="bad";','data.workoutDraft.state.startedAt=null;']) {
    assert.throws(()=>f.run(`{const data=createBackupPayload();${change}validateBackupPayload(data);}`));
  }
  assert.equal(f.run('writeCalls'), 0);
  assert.equal(f.run('stateUnchanged()'), true);
});

test('Old sessions without done flags and with numeric identifiers remain compatible', f => {
  f.run('let legacy=incoming();legacy.sessions[0].id=1700000000000;delete legacy.sessions[0].exercises[0].sets[0].done;');
  assert.equal(f.run('validateBackupPayload(legacy).state.sessions[0].id'),1700000000000);
  assert.equal(f.run('validateBackupPayload(legacy).state.sessions[0].exercises[0].sets[0].done'),undefined);
});

test('An already-saved workout is not restored as an active duplicate', f => {
  f.run('let data=createBackupPayload();data.sessions[0].draftId="draft-one";');
  assert.equal(f.run('validateBackupPayload(data).draft'), null);
});

test('Import commits and verifies history and the draft before replacing runtime state', f => {
  f.run('let data=createBackupPayload();data.lang="es";data.sessions[0].id="imported-id";applyImportedBackup(validateBackupPayload(data));');
  assert.equal(f.run('S.sessions[0].id'), 'imported-id');
  assert.equal(f.run('S.lang'), 'es');
  assert.equal(f.run('JSON.parse(stored.ea6).sessions[0].id'), 'imported-id');
  assert.equal(f.run('JSON.parse(stored.ea_workout_draft_v1).sets.bench_0[0].kg'), 73);
  assert.equal(f.run('W.active'), true);
  assert.equal(f.run('WD.bench_0[0].kg'), 73);
  assert.equal(f.run('stopCount'), 5);
});

test('A backup without an active draft removes the previous draft only after storage succeeds', f => {
  f.run('applyImportedBackup(validateBackupPayload(incoming()));');
  assert.equal(f.run('localStorage.getItem("ea_workout_draft_v1")'), null);
  assert.equal(f.run('W.active'), undefined);
  assert.deepEqual(f.plain('WD'), {});
  assert.equal(f.run('S.sessions[0].id'), 'imported-one');
});

for (const failure of [1, 2]) {
  test(`Storage failure on write ${failure} restores old bytes and keeps all previous runtime state`, f => {
    f.run(`failWrites.add(${failure});`);
    assert.throws(() => f.run('applyImportedBackup(validateBackupPayload(incoming()));'));
    assert.equal(f.run('stateUnchanged()'), true);
    assert.equal(f.run('storageUnchanged()'), true);
    assert.equal(f.run('stopCount'), 0);
  });
}

test('A silently ignored storage write is caught by read-back verification', f => {
  f.run('dropWrites.add(1);');
  assert.throws(() => f.run('applyImportedBackup(validateBackupPayload(incoming()));'));
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
});

test('Blocked writes do not claim rollback failure when original bytes are verifiably unchanged', f => {
  f.run('failAllWrites=true;let failure;try{applyImportedBackup(validateBackupPayload(incoming()));}catch(error){failure=error;}');
  assert.equal(f.run('failure.backupRollbackFailed'), false);
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
});

test('Failure to restore changed storage is reported and the previous in-memory data remains available', f => {
  f.run('failWrites=new Set([2,3]);let failure;try{applyImportedBackup(validateBackupPayload(incoming()));}catch(error){failure=error;}');
  assert.equal(f.run('failure.backupRollbackFailed'), true);
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('stopCount'), 0);
});

test('Cancelling import preserves storage and memory and names history plus the in-progress workout', f => {
  f.run('confirmResult=false;importData({text:JSON.stringify(incoming())});');
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
  assert.match(f.run('confirms[0]'), /saved history.*workout in progress/);
});

test('Invalid JSON is rejected before asking to replace any data', f => {
  f.run('importData({text:"{broken"});');
  assert.equal(f.run('confirms.length'), 0);
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
});

test('An unsuccessful import never emits a success message', f => {
  f.run('failWrites.add(2);importData({text:JSON.stringify(incoming())});');
  assert.equal(f.run('messages.some(message=>/Backup imported|Copia importada/.test(message))'), false);
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
});

test('File read failure leaves saved history and the active workout intact', f => {
  f.run('readFails=true;importData({text:"unused"});');
  assert.equal(f.run('stateUnchanged()'), true);
  assert.equal(f.run('storageUnchanged()'), true);
  assert.match(f.run('messages[0]'), /could not be read/);
});

test('Import resets device-specific permissions but preserves chosen reminder days, times and toggles', f => {
  f.run(`let data=incoming();
    data.reminder={enabled:true,time:'18:45',days:[2,5],native:true};
    data.nudges={mind:{enabled:true,time:'09:15'},reto:{enabled:false,time:'18:00'},native:true};
    data.health={interested:true,steps:true,heart:false,connected:true,source:'ios'};
    let prepared=validateBackupPayload(data);`);
  assert.deepEqual(f.plain('prepared.state.reminder'),{enabled:true,time:'18:45',days:[2,5],native:false});
  assert.deepEqual(f.plain('prepared.state.nudges'),{mind:{enabled:true,time:'09:15'},reto:{enabled:false,time:'18:00'},native:false});
  assert.deepEqual(f.plain('prepared.state.health'),{interested:true,steps:true,heart:false,connected:false,source:null});
  assert.equal(f.run('data.reminder.native'),true);
});

test('A committed import cancels both old notification groups before restoring existing permissions', async f => {
  await f.run('applyImportedBackup(validateBackupPayload(incoming()));');
  assert.deepEqual(f.plain('notificationCalls'),['cancel-workout','cancel-nudges','restore-existing-permission']);
  assert.equal(f.run('S.sessions[0].id'),'imported-one');
});

test('Notification synchronization errors never undo or reject a successfully imported backup', async f => {
  f.run('cancelWorkoutFails=true;restoreFails=true;');
  await f.run('applyImportedBackup(validateBackupPayload(incoming()));');
  assert.deepEqual(f.plain('notificationCalls'),['cancel-workout','cancel-nudges','restore-existing-permission']);
  assert.equal(f.run('S.sessions[0].id'),'imported-one');
  assert.equal(f.run('JSON.parse(stored.ea6).sessions[0].id'),'imported-one');
});

test('An obsolete notification restore does not apply to a newer runtime state', async f => {
  await f.run('let previous=S;let pending=syncImportedBackupNotifications(previous);S={...S};pending;');
  assert.deepEqual(f.plain('notificationCalls'),['cancel-workout','cancel-nudges']);
});

(async()=>{
  let passed=0,failed=0;
  for(const [name,callback] of tests){
    try{await callback(fixture());passed++;console.log(`✓ ${name}`);}
    catch(error){failed++;console.error(`✗ ${name}\n  ${error.stack||error.message}`);}
  }
  console.log(`\n${passed} backup tests passed${failed?`, ${failed} failed`:''}.`);
  if(failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
