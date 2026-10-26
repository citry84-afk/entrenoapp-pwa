#!/usr/bin/env node
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','app.html'),'utf8');
function declaration(kind,name){
  const start=source.search(new RegExp(`^${kind} ${name}\\b`,'m'));
  assert.notEqual(start,-1,`Missing ${name}`);
  const end=source.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start,end<0?source.length:start+1+end);
}
function fixture(){
  const context=vm.createContext({console:{...console,warn(){}},Promise,Set});
  vm.runInContext(`
    let wakeLock=null,wakeWanted=false,nativeWakeActive=false,platform='web',lang='es',plugin=null;
    let messages=[],jobs=new Map(),sequence=0,requests=0,releases=0;
    const button={innerHTML:'',attrs:{},on:false,classList:{toggle(name,value){button.on=value;}},setAttribute(key,value){this.attrs[key]=value;}};
    const document={visibilityState:'visible',querySelectorAll(){return [button];},addEventListener(){}};
    const window={Capacitor:{Plugins:{get KeepAwake(){return plugin;}}}};
    const navigator={};
    function nativePlatform(){return platform;}
    function currentLang(){return lang;}
    function toast(value){messages.push(value);}
    function setTimeout(fn){const id=++sequence;jobs.set(id,fn);return id;}
    function clearTimeout(id){jobs.delete(id);}
    function flushTimers(){const current=[...jobs.values()];jobs.clear();current.forEach(fn=>fn());}
    function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
    function sentinel(){let listener;return {released:false,addEventListener(name,fn){listener=fn;},async release(){this.released=true;releases++;listener?.();},expire(){this.released=true;listener?.();}};}
    function web(){navigator.wakeLock={async request(){requests++;return sentinel();}};}
    function native(){platform='ios';let active=false;plugin={async isSupported(){return {isSupported:true};},async keepAwake(){requests++;active=true;},async isKeptAwake(){return {isKeptAwake:active};},async allowSleep(){releases++;active=false;}};}
  `,context);
  const functions=['wakeIsActive','wakeButtonHtml','renderWakeButtons','getKeepAwake','queueWakeTask','tryNativeWakeLock','enableWakeLock','disableWakeLock','toggleWakeLock','resumeWakeLock'];
  vm.runInContext([declaration('let','wakeGeneration'),...functions.map(name=>declaration(name==='tryNativeWakeLock'?'async function':'function',name))].join('\n'),context);
  return {run(code){return vm.runInContext(code,context);},async settle(){for(let i=0;i<20;i++)await Promise.resolve();}};
}
const tests=[];
function test(name,fn){tests.push([name,fn]);}
test('Unsupported devices do not claim an active screen or retain intent',async f=>{
  assert.equal(await f.run('enableWakeLock()'),false);
  assert.equal(f.run('wakeWanted||wakePending||wakeIsActive()'),false);
  assert.equal(f.run('wakeFailed'),true);
  assert.match(f.run('button.innerHTML'),/no disponible/);
  assert.equal(f.run('button.attrs["aria-pressed"]'),'false');
});
test('Web lock becomes active only after acquisition and releases on disable',async f=>{
  f.run('web();');
  assert.equal(await f.run('enableWakeLock()'),true);
  assert.equal(f.run('wakeIsActive()'),true);
  assert.equal(f.run('button.attrs["aria-pressed"]'),'true');
  await f.run('disableWakeLock(true)');
  assert.equal(f.run('wakeIsActive()||wakeWanted'),false);
  assert.equal(f.run('releases'),1);
  assert.equal(f.run('jobs.size'),0);
});
test('Concurrent enables share one acquisition and show pending, not active',async f=>{
  f.run('web();const gate=deferred();navigator.wakeLock.request=()=>{requests++;return gate.promise;};const first=enableWakeLock();const second=enableWakeLock();');
  assert.equal(f.run('first===second'),true);
  assert.equal(f.run('wakeIsActive()'),false);
  assert.match(f.run('button.innerHTML'),/Activando/);
  await f.settle();f.run('gate.resolve(sentinel());');
  assert.equal(await f.run('first'),true);
  assert.equal(f.run('requests'),1);
});
test('Disable during a pending web request releases its stale sentinel',async f=>{
  f.run('web();const gate=deferred();navigator.wakeLock.request=()=>gate.promise;const first=enableWakeLock();');
  await f.settle();f.run('const disabled=disableWakeLock(true);gate.resolve(sentinel());');
  assert.equal(await f.run('first'),false);await f.run('disabled');
  assert.equal(f.run('wakeIsActive()||wakePending||wakeWanted'),false);
  assert.equal(f.run('releases'),1);
});
test('Native activation is verified and disabled safely even when pending',async f=>{
  f.run('native();const gate=deferred();plugin.keepAwake=()=>{requests++;return gate.promise;};const first=enableWakeLock();');
  await f.settle();f.run('const disabled=disableWakeLock(true);gate.resolve();');
  assert.equal(await f.run('first'),false);await f.run('disabled');
  assert.equal(f.run('wakeIsActive()||wakePending||wakeWanted'),false);
  assert.ok(f.run('releases')>=1);
});
test('Native false status never displays active',async f=>{
  f.run('native();plugin.isKeptAwake=async()=>({isKeptAwake:false});');
  assert.equal(await f.run('enableWakeLock()'),false);
  assert.equal(f.run('wakeIsActive()||wakeWanted'),false);
  assert.equal(f.run('releases'),1);
});
test('Rejected native calls recover and can be retried',async f=>{
  f.run('native();plugin.keepAwake=async()=>{throw Error("not available");};');
  assert.equal(await f.run('enableWakeLock()'),false);
  f.run('native();');assert.equal(await f.run('enableWakeLock()'),true);
  assert.equal(f.run('wakeFailed'),false);
});
test('A disable followed immediately by enable ends with the latest intent',async f=>{
  f.run('native();const first=enableWakeLock();const disabled=disableWakeLock(true);const latest=enableWakeLock();');
  await f.run('first');await f.run('disabled');assert.equal(await f.run('latest'),true);
  assert.equal(f.run('wakeIsActive()&&wakeWanted'),true);
});
test('Foreground rechecks native state without user toasts',async f=>{
  f.run('native();');await f.run('enableWakeLock()');
  f.run('messages=[];document.visibilityState="hidden";resumeWakeLock();');
  assert.equal(f.run('requests'),1);
  f.run('document.visibilityState="visible";resumeWakeLock();');await f.settle();
  assert.equal(f.run('requests'),2);
  assert.equal(f.run('wakeIsActive()'),true);
  assert.equal(f.run('messages.length'),0);
});
test('Browser release reacquires once and stale releases cannot clear a new lock',async f=>{
  f.run('web();');await f.run('enableWakeLock()');f.run('const old=wakeLock;old.expire();flushTimers();');await f.settle();
  assert.equal(f.run('requests'),2);
  f.run('old.expire();');assert.equal(f.run('wakeIsActive()'),true);
  await f.run('disableWakeLock(true)');f.run('flushTimers();');await f.settle();
  assert.equal(f.run('requests'),2);
});
test('Hidden acquisitions remain pending in intent only and resume on foreground',async f=>{
  f.run('web();document.visibilityState="hidden";');assert.equal(await f.run('enableWakeLock(true)'),false);
  assert.equal(f.run('wakeWanted'),true);assert.equal(f.run('wakePending||wakeIsActive()'),false);
  f.run('document.visibilityState="visible";resumeWakeLock();');await f.settle();
  assert.equal(f.run('wakeIsActive()'),true);
});
test('Hiding while browser permission resolves releases it and allows foreground retry',async f=>{
  f.run('web();const gate=deferred();navigator.wakeLock.request=()=>gate.promise;const first=enableWakeLock(true);');
  await f.settle();f.run('document.visibilityState="hidden";gate.resolve(sentinel());');await f.run('first');
  assert.equal(f.run('wakePending||wakeIsActive()'),false);
  f.run('web();document.visibilityState="visible";resumeWakeLock();');await f.settle();assert.equal(f.run('wakeIsActive()'),true);
});
test('English labels and failure state are truthful',async f=>{
  f.run('lang="en";');await f.run('enableWakeLock()');assert.match(f.run('button.innerHTML'),/unavailable/);
  f.run('web();');await f.run('enableWakeLock()');assert.match(f.run('button.innerHTML'),/Screen awake/);
});
test('Discard and successful save explicitly release screen-awake mode',async()=>{
  assert.match(declaration('function','discardWorkoutDraft'),/disableWakeLock\(true\)/);
  assert.match(declaration('function','saveSession'),/disableWakeLock\(true\)/);
});
(async()=>{
  let failed=0;
  for(const [name,fn] of tests){try{await fn(fixture());console.log(`✓ ${name}`);}catch(error){failed++;console.error(`✗ ${name}\n${error.stack}`);}}
  console.log(`Keep-awake: ${tests.length-failed}/${tests.length} passed.`);
  if(failed)process.exitCode=1;
})();
