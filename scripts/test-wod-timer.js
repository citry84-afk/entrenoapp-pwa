#!/usr/bin/env node
'use strict';

// Exercise the real WOD timer and renderer with a deterministic clock/DOM.
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
const context = vm.createContext({ console, Math, Set, Map });
vm.runInContext(`
  let clock=100000,sequence=0,jobs=new Map(),nodes={},listeners={},tones=[],vibrations=[],messages=[],draftSaves=0,renders=0;
  let wodInt=null,tmrLeft=0,tmrWarned=new Set(),W,WD,meta,sound;
  const Date={now:()=>clock};
  function makeNode(id){
    const classes=new Set(),attrs={};
    return nodes[id]={textContent:'',innerHTML:'',style:{},contains(){return false;},
      getAttribute(name){return attrs[name]??null;},setAttribute(name,value){attrs[name]=String(value);},
      classList:{toggle(name,on){on?classes.add(name):classes.delete(name);},contains(name){return classes.has(name);}}};
  }
  const document={hidden:false,activeElement:null,getElementById(id){return nodes[id]||null;},addEventListener(name,fn){listeners['document:'+name]=fn;}};
  const window={addEventListener(name,fn){listeners['window:'+name]=fn;}};
  const navigator={vibrate(pattern){vibrations.push({pattern,at:clock});}};
  function setInterval(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:true});return id;}
  function setTimeout(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:false});return id;}
  function clearInterval(id){jobs.delete(id);}
  function clearTimeout(id){jobs.delete(id);}
  function advance(ms){
    const target=clock+ms;
    for(let guard=0;guard<10000;guard++){
      let first=null;
      for(const [id,job] of jobs)if(job.at<=target&&(!first||job.at<first[1].at))first=[id,job];
      if(!first){clock=target;return;}
      const [id,job]=first;clock=Math.max(clock,job.at);
      if(job.interval)job.at=clock+job.delay;else jobs.delete(id);
      job.fn();
    }
    throw Error('Fake timer loop exceeded limit');
  }
  function suspend(ms){clock+=ms;}
  function foreground(){document.hidden=false;listeners['document:visibilitychange']();}
  function flush(){advance(0);}
  function dayWodMeta(){return meta;}
  function soundState(){return {...sound};}
  function unlockAudio(){}
  function tone(frequency){tones.push({frequency,at:clock});}
  function toast(message){messages.push(message);}
  function saveWorkoutDraft(){draftSaves++;}
  function localizeTree(){}
  function wodLocalLeaderboard(){return {best:'',count:0};}
  function updateProgressUI(){}
  function handleExerciseCompleted(){}
  function renderWorkout(){renders++;mount('wod_0');}
  function mount(key='wod_0'){
    const html=wodExercisePanel({id:key,name:'QA WOD',durationMin:15,hint:''},key);
    for(const part of ['clock','label','fill','actions'])makeNode('wod-'+part+'-'+key);
    nodes['wod-actions-'+key].innerHTML=wodTimerActions(key,15);
    nodes['wod-actions-'+key].setAttribute('data-wod-action-state',wodTimerActionState(key));
    updateWodTimerDom();return html;
  }
  function reset(){
    clock=100000;sequence=0;jobs.clear();nodes={};tones=[];vibrations=[];messages=[];draftSaves=0;renders=0;wodInt=null;tmrLeft=0;tmrWarned=new Set();document.hidden=false;
    W={active:true,notes:'Keep workout note',wodMarks:{wod_0:{rounds:'4',reps:'7',notes:'Keep WOD note'}}};
    WD={wod_0:[{kg:0,reps:15,done:false}],other_0:[{kg:42.5,reps:9,done:false}]};
    meta={wodFormat:'EMOM',wodId:'qa-emom',programWod:3,structure:[['Min 1: 8 Power Cleans','Control'],['Min 2: 12 Box Step-ups','Control'],['Min 3: 12/10 cal Assault Bike','Control']]};
    sound={enabled:true,countdown:true,vibration:true};mount();
  }
`, context);
const functions = [
  'wodMark','setWodMark','wodTimeText','currentWodTimer','normalizeWodTimer','wodElapsedSeconds',
  'wodTimerClock','wodTimerLabel','wodTimerActionState','wodTimerActions','updateWodTimerDom',
  'wodIntervalLabel','invalidateWodCallbacks','wodTimerCue','wodIntervalCue','announceWodFinish',
  'finishWodTimer','resumeWodTimer','syncWodTimer','runWodTicker','wodFinishForTime','startWodTimer',
  'toggleWodTimer','stopWodTimer','finishWodExercise','wodExercisePanel','jsAttrArg','escHtml',
];
vm.runInContext([declaration('let', 'wodGeneration'), ...functions.map(name=>declaration('function',name))].join('\n'), context);
function run(code){return vm.runInContext(code,context);}
function plain(code){return JSON.parse(JSON.stringify(run(code)));}
function toneCount(frequency){return run(`tones.filter(t=>t.frequency===${frequency}).length`);}
let passed=0;
function test(name,callback){run('invalidateWodCallbacks();reset();');callback();passed++;console.log('✓ '+name);}

test('Start immediately replaces stale idle actions without rerendering the workout',()=>{
  const before=plain('({WD,notes:W.notes,marks:W.wodMarks})');
  assert.equal(run("startWodTimer('wod_0',15)"),true);
  const actions=run("nodes['wod-actions-wod_0'].innerHTML");
  assert.match(actions,/>Pausar</);assert.match(actions,/>Detener</);assert.doesNotMatch(actions,/Iniciar reloj|Marcar hecho/);
  assert.equal(run("nodes['wod-actions-wod_0'].getAttribute('data-wod-action-state')"),'running');
  assert.equal(run('renders'),0);assert.equal(run('W.wodTimer.total'),900);
  assert.deepEqual(plain('({WD,notes:W.notes,marks:W.wodMarks})'),before);
});

test('Repeated start clicks and renders never reset a running or paused 15-minute WOD',()=>{
  run("startWodTimer('wod_0',15);const original=W.wodTimer,deadline=original.deadline;advance(42500);");
  assert.equal(run("startWodTimer('wod_0',20)"),false);
  run("mount();mount();");
  assert.equal(run('W.wodTimer===original'),true);assert.equal(run('W.wodTimer.deadline===deadline'),true);
  assert.equal(run('W.wodTimer.remainingMs'),857500);assert.equal(run('[...jobs.values()].filter(j=>j.interval).length'),1);
  run("toggleWodTimer('wod_0');const pausedLeft=W.wodTimer.remainingMs;startWodTimer('wod_0',15);mount();advance(5000);");
  assert.equal(run('W.wodTimer.paused'),true);assert.equal(run('W.wodTimer.remainingMs===pausedLeft'),true);
  assert.match(run("nodes['wod-actions-wod_0'].innerHTML"),/>Continuar</);
});

test('EMOM minute changes and 3-2-1 cues do not depend on the rest timer',()=>{
  run("startWodTimer('wod_0',15);advance(60150);");
  assert.equal(run('tmrLeft'),0);assert.equal(run('tmrWarned.size'),0);
  assert.equal(run('W.wodTimer.left'),840);assert.equal(toneCount(660),3);assert.equal(toneCount(880),1);assert.equal(toneCount(1175),1);
  assert.equal(run("nodes['wod-label-wod_0'].textContent"),'Minuto 2 de 15 · 12 Box Step-ups');
  assert.equal(run('vibrations.length'),1);
  run('syncWodTimer();syncWodTimer();');assert.equal(toneCount(880),1);
});

test('Final 3-2-1, completion actions and finish announcement occur exactly once',()=>{
  run("meta.wodFormat='AMRAP';startWodTimer('wod_0',5/60);advance(5150);");
  assert.equal(run('W.wodTimer.finished'),true);assert.equal(run('W.wodTimer.left'),0);assert.equal(run('wodInt'),null);
  assert.equal(toneCount(660),3);assert.equal(toneCount(880),1);assert.equal(toneCount(1175),1);
  const actions=run("nodes['wod-actions-wod_0'].innerHTML");
  assert.match(actions,/Marcar hecho/);assert.doesNotMatch(actions,/Iniciar reloj|Pausar|Detener/);
  assert.equal(run("nodes['wod-clock-wod_0'].textContent"),'¡Tiempo!');
  run("advance(5000);foreground();listeners['window:pageshow']();startWodTimer('wod_0',15);mount();");
  assert.equal(toneCount(880),1);assert.equal(run('messages.length'),1);assert.equal(run('WD.wod_0[0].done'),false);
});

test('Suspension catches up to the deadline without replaying missed EMOM cues',()=>{
  run("startWodTimer('wod_0',15);advance(10000);document.hidden=true;suspend(115000);foreground();flush();");
  assert.equal(run('W.wodTimer.left'),775);assert.equal(run("nodes['wod-label-wod_0'].textContent"),'Minuto 3 de 15 · 12/10 cal Assault Bike');
  assert.equal(run('tones.length'),0);assert.equal(run('vibrations.length'),0);
  run('advance(55000);');assert.equal(run('W.wodTimer.left'),720);assert.equal(toneCount(660),3);assert.equal(toneCount(880),1);
});

test('Delayed callbacks catch up without visibility events and suppress stale cues',()=>{
  run("startWodTimer('wod_0',15);suspend(60500);flush();");
  assert.equal(run('W.wodTimer.left'),840);assert.equal(run('tones.length'),0);
  run('advance(500);');assert.equal(run('W.wodTimer.left'),839);assert.equal(run('tones.length'),0);
});

test('Return after expiry announces one finish, never a burst of old countdowns',()=>{
  run("startWodTimer('wod_0',10/60);document.hidden=true;suspend(60000);foreground();flush();listeners['window:pageshow']();foreground();");
  assert.equal(run('W.wodTimer.left'),0);assert.equal(toneCount(660),0);assert.equal(toneCount(880),1);assert.equal(run('vibrations.length'),1);
  run('advance(1000);foreground();');assert.equal(toneCount(880),1);
});

test('Hidden completion defers its single announcement until the app is visible',()=>{
  run("startWodTimer('wod_0',3/60);document.hidden=true;advance(5000);");
  assert.equal(run('W.wodTimer.finished'),true);assert.equal(run('tones.length'),0);assert.equal(run('messages.length'),0);
  run('foreground();foreground();advance(130);');assert.equal(toneCount(880),1);assert.equal(toneCount(1175),1);assert.equal(run('messages.length'),1);
});

test('Pause and continue preserve exact remaining milliseconds through background suspension',()=>{
  run("startWodTimer('wod_0',10/60);advance(1250);toggleWodTimer('wod_0');document.hidden=true;suspend(60000);foreground();");
  assert.equal(run('W.wodTimer.remainingMs'),8750);assert.equal(run('W.wodTimer.left'),9);assert.equal(run('W.wodTimer.paused'),true);
  assert.match(run("nodes['wod-actions-wod_0'].innerHTML"),/>Continuar</);assert.equal(run('tones.length'),0);
  run("toggleWodTimer('wod_0');advance(8500);");assert.equal(run('W.wodTimer.left'),1);
  assert.match(run("nodes['wod-actions-wod_0'].innerHTML"),/>Pausar</);
  run('advance(250);');assert.equal(run('W.wodTimer.finished'),true);assert.equal(toneCount(880),1);
});

test('Pause after an overdue deadline finishes instead of freezing stale time',()=>{
  run("startWodTimer('wod_0',10/60);suspend(20000);toggleWodTimer('wod_0');");
  assert.equal(run('W.wodTimer.finished'),true);assert.equal(run('W.wodTimer.paused'),false);assert.equal(run('wodInt'),null);assert.equal(toneCount(880),1);
});

test('A backwards wall-clock adjustment cannot increase remaining time or elapsed bounds',()=>{
  run("startWodTimer('wod_0',15);advance(10000);clock-=60000;syncWodTimer(false);");
  assert.equal(run('W.wodTimer.remainingMs'),890000);assert.equal(run('wodElapsedSeconds(W.wodTimer)'),10);
  run('advance(1000);syncWodTimer(false);');assert.equal(run('W.wodTimer.left'),889);
});

test('For Time records true active elapsed time, preserves marks and cannot restart on double click',()=>{
  run("meta.wodFormat='FOR TIME';startWodTimer('wod_0',15);advance(1250);toggleWodTimer('wod_0');suspend(60000);toggleWodTimer('wod_0');advance(1750);");
  assert.match(run("nodes['wod-actions-wod_0'].innerHTML"),/Terminé/);
  assert.equal(run("wodFinishForTime('wod_0')"),true);
  assert.deepEqual(plain('W.wodMarks.wod_0'),{rounds:'4',reps:'7',notes:'Keep WOD note',time:'00:03'});
  assert.equal(run('W.wodTimer.finished'),true);assert.equal(run('W.wodTimer.finishReason'),'forTime');assert.equal(run('WD.wod_0[0].done'),false);
  assert.equal(run("nodes['wod-clock-wod_0'].textContent"),'00:03');
  run("advance(5000);wodFinishForTime('wod_0');startWodTimer('wod_0',15);mount();");
  assert.equal(run("W.wodMarks.wod_0.time"),'00:03');assert.equal(run('wodInt'),null);assert.equal(run('tones.length'),0);
});

test('For Time catches up before recording and never exceeds the cap',()=>{
  run("meta.wodFormat='FOR TIME';startWodTimer('wod_0',15);suspend(73250);wodFinishForTime('wod_0');");
  assert.equal(run("W.wodMarks.wod_0.time"),'01:13');
  run("stopWodTimer(false);startWodTimer('wod_0',15);suspend(1000000);");
  assert.equal(run("wodFinishForTime('wod_0')"),false);assert.equal(run('wodElapsedSeconds(W.wodTimer)'),900);
  assert.equal(run("W.wodMarks.wod_0.time"),'01:13');
});

test('A stale For Time callback cannot record a time for an EMOM',()=>{
  run("startWodTimer('wod_0',15);advance(5000);");assert.equal(run("wodFinishForTime('wod_0')"),false);
  assert.equal(run("W.wodMarks.wod_0.time"),undefined);assert.equal(run('W.wodTimer.finished'),false);
});

test('Replacement and stop invalidate even already-queued interval callbacks',()=>{
  run("startWodTimer('wod_0',15);const oldTick=jobs.get(wodInt).fn;advance(1000);startWodTimer('other_0',20);const replacement=W.wodTimer;oldTick();advance(1000);");
  assert.equal(run('W.wodTimer===replacement'),true);assert.equal(run('W.wodTimer.left'),1199);
  run('stopWodTimer(false);oldTick();advance(5000);foreground();');assert.equal(run('W.wodTimer'),null);assert.equal(run('wodInt'),null);assert.equal(run('tones.length'),0);
});

test('Pause and stop suppress a queued second minute or finish tone',()=>{
  run("startWodTimer('wod_0',15);advance(60000);toggleWodTimer('wod_0');advance(1000);");
  assert.equal(toneCount(880),1);assert.equal(toneCount(1175),0);
  run("stopWodTimer(false);meta.wodFormat='AMRAP';startWodTimer('wod_0',1/60);advance(1000);stopWodTimer(false);advance(1000);");
  assert.equal(toneCount(880),2);assert.equal(toneCount(1175),0);
});

test('Replacement, muting and suspension cannot produce a late second finish tone',()=>{
  run("meta.wodFormat='AMRAP';startWodTimer('wod_0',1/60);advance(1000);startWodTimer('other_0',15);advance(130);");
  assert.equal(toneCount(1175),0);
  run("stopWodTimer(false);startWodTimer('wod_0',1/60);advance(1000);sound.enabled=false;advance(130);");assert.equal(toneCount(1175),0);
  run("stopWodTimer(false);sound.enabled=true;startWodTimer('wod_0',1/60);advance(1000);suspend(60000);foreground();flush();");assert.equal(toneCount(1175),0);
});

test('Sound preferences suppress countdowns independently of minute and finish cues',()=>{
  run("sound.countdown=false;startWodTimer('wod_0',15);advance(60150);");assert.equal(toneCount(660),0);assert.equal(toneCount(880),1);
  run("stopWodTimer(false);sound.enabled=false;sound.vibration=false;startWodTimer('wod_0',15);advance(60150);");
  assert.equal(toneCount(880),1);assert.equal(run('vibrations.length'),1);
});

test('A legacy restored paused timer resumes from its saved remaining duration',()=>{
  run("W.wodTimer={key:'wod_0',total:600,left:300,paused:true,startedAt:1,finished:false};mount();suspend(60000);startWodTimer('wod_0',15);");
  assert.equal(run('W.wodTimer.paused'),true);assert.equal(run('W.wodTimer.remainingMs'),300000);assert.equal(run('wodInt'),null);
  run("toggleWodTimer('wod_0');advance(1000);");assert.equal(run('W.wodTimer.total'),600);assert.equal(run('W.wodTimer.left'),299);
});

test('A restored current timer stays paused despite a stale serialized deadline',()=>{
  run("startWodTimer('wod_0',15);advance(1250);const restored=JSON.parse(JSON.stringify(W.wodTimer));invalidateWodCallbacks();restored.paused=true;W.wodTimer=restored;suspend(120000);mount();");
  assert.equal(run('W.wodTimer.remainingMs'),898750);assert.equal(run('W.wodTimer.paused'),true);
  run("toggleWodTimer('wod_0');advance(750);");assert.equal(run('W.wodTimer.remainingMs'),898000);
});

test('Completion preserves entered marks/sets and completed WODs cannot restart',()=>{
  const before=plain('W.wodMarks');run("startWodTimer('wod_0',15);advance(5000);finishWodExercise('wod_0');");
  assert.equal(run('WD.wod_0[0].done'),true);assert.deepEqual(plain('W.wodMarks'),before);assert.equal(run('W.wodTimer'),null);
  assert.equal(run("startWodTimer('wod_0',15)"),false);assert.match(run("wodTimerActions('wod_0',15)"),/disabled>Hecho/);
});

test('Saving/discarding an active workout prevents later timer side effects',()=>{
  run("startWodTimer('wod_0',15);W.active=false;advance(250);");assert.equal(run('W.wodTimer'),null);assert.equal(run('wodInt'),null);assert.equal(run('tones.length'),0);
  run("W.active=true;startWodTimer('wod_0',15);W.savedSessionId='saved';advance(250);");assert.equal(run('W.wodTimer'),null);
});

test('Invalid starts and malformed restored timers are safely bounded',()=>{
  for(const value of ['NaN','Infinity','-1','0'])assert.equal(run(`startWodTimer('wod_0',${value})`),false);
  assert.equal(run("startWodTimer('missing',15)"),false);assert.equal(run('W.wodTimer'),undefined);
  run("startWodTimer('wod_0',1000000);");assert.equal(run('W.wodTimer.total'),86400);
  run("W.wodTimer.total=NaN;syncWodTimer();");assert.equal(run('W.wodTimer'),null);
});

test('Interval labels use the timer cap and captured workout metadata',()=>{
  run("meta.wodFormat='FOR TIME';startWodTimer('wod_0',20);advance(2000);");assert.equal(run('wodIntervalLabel(W.wodTimer)'),'Llevas 00:02 · cap 20:00');
  run("stopWodTimer(false);meta.wodFormat='EMOM';startWodTimer('wod_0',15);meta.structure=[];meta.wodFormat='AMRAP';advance(60000);");
  assert.equal(run('wodIntervalLabel(W.wodTimer)'),'Minuto 2 de 15 · 12 Box Step-ups');
});

console.log(`\n${passed} WOD timer tests passed.`);
