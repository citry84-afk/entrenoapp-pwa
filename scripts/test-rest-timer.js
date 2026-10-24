#!/usr/bin/env node
'use strict';

// Test the real timer functions with an isolated DOM and deterministic clock.
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
  let clock=100000,sequence=0,jobs=new Map(),nodes={},listeners={},tones=[],vibrations=[],wristRenders=0;
  let tmrInt=null,tmrLeft=0,tmrTotal=0,tmrWarned=null,tmrPaused=false,tmrNext='';
  const Date={now:()=>clock};
  function node(id){
    if(!nodes[id]){
      const classes=new Set();
      nodes[id]={textContent:'',style:{},classList:{
        add(...names){names.forEach(name=>classes.add(name));},
        remove(...names){names.forEach(name=>classes.delete(name));},
        contains(name){return classes.has(name);},
        toggle(name,on){if(on===undefined)on=!classes.has(name);on?classes.add(name):classes.delete(name);}
      }};
    }
    return nodes[id];
  }
  const document={hidden:false,getElementById:node,addEventListener(name,fn){listeners[name]=fn;}};
  const window={addEventListener(name,fn){listeners[name]=fn;}};
  const navigator={vibrate(pattern){vibrations.push(pattern);}};
  function setInterval(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:true});return id;}
  function setTimeout(fn,delay){const id=++sequence;jobs.set(id,{fn,delay,at:clock+delay,interval:false});return id;}
  function clearInterval(id){jobs.delete(id);}
  function clearTimeout(id){jobs.delete(id);}
  function lt(value){return value;}
  function soundState(){return {enabled:true,countdown:true,vibration:true};}
  function unlockAudio(){}
  function tone(frequency){tones.push({frequency,at:clock});}
  function renderWristMode(){wristRenders++;}
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
  function foreground(){document.hidden=false;listeners.visibilitychange();}
  function flush(){advance(0);}
`, context);
const functions = ['resumeRestTimer', 'startTimer', 'syncRestTimer', 'finishRestTimer', 'updTimer',
  'addTimerSeconds', 'toggleTimerPause', 'stopTimer', 'restCue'];
vm.runInContext([declaration('let', 'tmrDeadline'), ...functions.map(name => declaration('function', name))].join('\n'), context);
function run(code) { return vm.runInContext(code, context); }
function reset() {
  run(`stopTimer();clock=100000;sequence=0;jobs.clear();nodes={};tones=[];vibrations=[];wristRenders=0;document.hidden=false;`);
}
let passed=0;
function test(name, callback) { reset();callback();passed++;console.log(`✓ ${name}`); }

test('Foreground countdown follows elapsed time and completes exactly once', () => {
  run(`startTimer(5);advance(2000);`);
  assert.equal(run('tmrLeft'),3);
  assert.equal(run(`node('td').textContent`),'00:03');
  run(`advance(3000);`);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run('tmrInt'),null);
  assert.equal(run(`node('td').textContent`),'¡Listo!');
  assert.equal(run(`tones.filter(t=>t.frequency===660).length`),3);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run('vibrations.length'),1);
  run(`advance(10000);foreground();listeners.pageshow();syncRestTimer();`);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run(`tones.filter(t=>t.frequency===1175).length`),1);
  assert.equal(run('vibrations.length'),1);
});

test('Suspension catches up to a real deadline without replaying missed seconds', () => {
  run(`startTimer(60);document.hidden=true;suspend(45000);foreground();`);
  assert.equal(run('tmrLeft'),15);
  assert.equal(run(`node('td').textContent`),'00:15');
  assert.equal(run('tones.length'),0);
  run(`advance(15000);`);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('Returning after expiry emits one finish, never a burst of countdown cues', () => {
  run(`startTimer(10);document.hidden=true;suspend(60000);foreground();flush();listeners.pageshow();foreground();`);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run(`tones.filter(t=>t.frequency===660).length`),0);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run('vibrations.length'),1);
});

test('A delayed interval catches up even without a visibility event', () => {
  run(`startTimer(10);suspend(8000);flush();`);
  assert.equal(run('tmrLeft'),2);
  assert.equal(run(`tones.filter(t=>t.frequency===660).length`),0);
  run(`advance(2000);`);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('Visible resume in the last three seconds suppresses the stale countdown cue', () => {
  run(`startTimer(10);document.hidden=true;suspend(8000);foreground();flush();`);
  assert.equal(run('tmrLeft'),2);
  assert.equal(run('tones.length'),0);
  run(`advance(1000);`);
  assert.equal(run('tmrLeft'),1);
  assert.equal(run(`tones.filter(t=>t.frequency===660).length`),1);
});

test('Pause preserves exact remaining milliseconds through suspension', () => {
  run(`startTimer(10);advance(1250);toggleTimerPause();document.hidden=true;suspend(60000);foreground();`);
  assert.equal(run('tmrPaused'),true);
  assert.equal(run('tmrRemainingMs'),8750);
  assert.equal(run('tmrLeft'),9);
  assert.equal(run('tones.length'),0);
  run(`toggleTimerPause();advance(8500);`);
  assert.equal(run('tmrLeft'),1);
  run(`advance(250);`);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('Pause after an overdue deadline completes instead of freezing stale time', () => {
  run(`startTimer(10);suspend(20000);toggleTimerPause();`);
  assert.equal(run('tmrPaused'),false);
  assert.equal(run('tmrInt'),null);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('+30 extends the real remaining duration, including a delayed tab', () => {
  run(`startTimer(60);suspend(20000);addTimerSeconds(30);`);
  assert.equal(run('tmrLeft'),70);
  assert.equal(run('tmrDeadline-Date.now()'),70000);
  run(`advance(69750);`);
  assert.equal(run('tmrLeft'),1);
  run(`advance(250);`);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('+30 while paused does not resume or consume paused time', () => {
  run(`startTimer(20);advance(2250);toggleTimerPause();addTimerSeconds(30);suspend(60000);foreground();`);
  assert.equal(run('tmrPaused'),true);
  assert.equal(run('tmrRemainingMs'),47750);
  assert.equal(run('tmrLeft'),48);
  run(`toggleTimerPause();advance(47750);`);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
});

test('Skip cancels all future effects and cannot be revived by +30', () => {
  run(`startTimer(5);advance(1000);stopTimer();addTimerSeconds(30);advance(10000);foreground();`);
  assert.equal(run('tmrInt'),null);
  assert.equal(run('tmrLeft'),0);
  assert.equal(run('tones.length'),0);
  assert.equal(run('vibrations.length'),0);
  assert.equal(run(`node('rest-timer').classList.contains('vis')`),false);
});

test('Replacing a timer invalidates even an already-queued interval callback', () => {
  run(`startTimer(5);const oldTick=jobs.get(tmrInt).fn;advance(1000);startTimer(20,'Otra serie');oldTick();advance(4000);`);
  assert.equal(run('tmrLeft'),16);
  assert.equal(run('tmrNext'),'Otra serie');
  assert.equal(run('tones.length'),0);
});

test('Replacement stays visible when the old finished timer would auto-hide', () => {
  run(`startTimer(1);advance(1000);const oldHide=jobs.get(tmrHideTimeout).fn;startTimer(30);oldHide();advance(4000);`);
  assert.equal(run(`node('rest-timer').classList.contains('vis')`),true);
  assert.equal(run('tmrLeft'),26);
  assert.equal(run(`tones.filter(t=>t.frequency===1175).length`),0);
});

test('Cancellation suppresses the pending second finish tone', () => {
  run(`startTimer(1);advance(1000);stopTimer();advance(5000);`);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run(`tones.filter(t=>t.frequency===1175).length`),0);
  assert.equal(run(`node('rest-timer').classList.contains('vis')`),false);
});

test('A finish tone delayed by suspension is not replayed as a late echo', () => {
  run(`startTimer(1);advance(1000);suspend(60000);foreground();flush();`);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run(`tones.filter(t=>t.frequency===1175).length`),0);
  assert.equal(run('vibrations.length'),1);
});

test('Adding time during the ready state starts a new timer without stale hide effects', () => {
  run(`startTimer(1);advance(1000);addTimerSeconds(30);advance(4000);`);
  assert.equal(run('tmrLeft'),26);
  assert.equal(run(`node('rest-timer').classList.contains('vis')`),true);
  assert.equal(run('tmrFinished'),false);
});

test('Hidden interval completion is not repeated on foreground resume', () => {
  run(`startTimer(3);document.hidden=true;advance(10000);foreground();listeners.pageshow();advance(1000);`);
  assert.equal(run(`tones.filter(t=>t.frequency===660).length`),0);
  assert.equal(run(`tones.filter(t=>t.frequency===880).length`),1);
  assert.equal(run('vibrations.length'),1);
});

test('Invalid and zero durations finish safely without NaN progress', () => {
  for(const value of ['NaN','Infinity','-5','0']){
    run(`stopTimer();startTimer(${value});`);
    assert.equal(run('tmrLeft'),0);
    assert.equal(run('tmrInt'),null);
    assert.equal(run(`node('tbar').style.width`),'0%');
  }
});

test('Cancelled and expired controls are removed from the hidden timer surface', () => {
  run('startTimer(2);');
  assert.equal(run("node('rest-timer').hidden"),false);
  run('stopTimer();');
  assert.equal(run("node('rest-timer').hidden"),true);
  run('startTimer(1);advance(1000);');
  assert.equal(run("node('rest-timer').hidden"),false);
  run('advance(3000);');
  assert.equal(run("node('rest-timer').hidden"),true);
});

console.log(`\n${passed} rest timer tests passed.`);
