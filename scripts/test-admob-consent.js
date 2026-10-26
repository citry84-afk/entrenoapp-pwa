#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','app.html'),'utf8');
const start=source.indexOf('async function initAdMob(){');
const end=source.indexOf('\nasync function showQuietBanner',start);
assert.ok(start>0&&end>start);
function fixture(){
  const context=vm.createContext({console:{...console,warn(){}}});
  vm.runInContext(`
    const Ads={ready:false,initing:false,consent:false};
    let events=[],platform='ios',tracking={status:'denied'},info={status:'NOT_REQUIRED',canRequestAds:true},form={status:'OBTAINED',canRequestAds:true};
    let failConsent=false,failForm=false,failInitialize=false;
    const plugin={async requestConsentInfo(){events.push('consent');if(failConsent)throw Error('consent unavailable');return info;},async showConsentForm(){events.push('form');if(failForm)throw Error('form unavailable');return form;},async initialize(){events.push('initialize');if(failInitialize)throw Error('SDK unavailable');}};
    function getAdMob(){return plugin;}
    function canUseAdMob(){return true;}
    async function ensureNativeTrackingAuthorization(){events.push('tracking');return tracking;}
    function nativePlatform(){return platform;}
    function markAdMob(){}
    function setupAdMobListeners(){events.push('listeners');}
    function syncAdPrivacyOptionsButtons(){}
  `+source.slice(start,end),context);
  return {run(code){return vm.runInContext(code,context);},plain(code){return JSON.parse(JSON.stringify(vm.runInContext(code,context)));}};
}
const tests=[
  ['ATT resolved and UMP permits ads before SDK initialization',async f=>{assert.equal(await f.run('initAdMob()'),true);assert.deepEqual(f.plain('events'),['tracking','consent','listeners','initialize']);assert.equal(f.run('Ads.ready&&Ads.consent&&!Ads.initing'),true);}],
  ['Required consent form is completed before initialization',async f=>{f.run('info={status:"REQUIRED",isConsentFormAvailable:true,canRequestAds:false};');assert.equal(await f.run('initAdMob()'),true);assert.deepEqual(f.plain('events'),['tracking','consent','form','listeners','initialize']);}],
  ['Denied UMP request permission never initializes advertising',async f=>{f.run('info.canRequestAds=false;');assert.equal(await f.run('initAdMob()'),false);assert.equal(f.run('Ads.ready||Ads.consent||Ads.initing'),false);assert.ok(!f.plain('events').includes('initialize'));}],
  ['A consent network failure leaves ads disabled and retryable',async f=>{f.run('failConsent=true;');assert.equal(await f.run('initAdMob()'),false);assert.equal(f.run('Ads.ready||Ads.initing'),false);f.run('failConsent=false;');assert.equal(await f.run('initAdMob()'),true);}],
  ['A required form error cannot fall through into advertising',async f=>{f.run('info={status:"REQUIRED",isConsentFormAvailable:true,canRequestAds:false};failForm=true;');assert.equal(await f.run('initAdMob()'),false);assert.ok(!f.plain('events').includes('initialize'));}],
  ['Missing canRequestAds is not interpreted as permission',async f=>{f.run('info={status:"UNKNOWN"};');assert.equal(await f.run('initAdMob()'),false);assert.ok(!f.plain('events').includes('initialize'));}],
  ['Unresolved iOS ATT does not request consent or initialize',async f=>{f.run('tracking={status:"unavailable"};');assert.equal(await f.run('initAdMob()'),false);assert.deepEqual(f.plain('events'),['tracking']);}],
  ['Android does not require iOS ATT status',async f=>{f.run('platform="android";tracking={status:"notApplicable"};');assert.equal(await f.run('initAdMob()'),true);}],
  ['An initialized SDK is not initialized a second time',async f=>{await f.run('initAdMob()');await f.run('initAdMob()');assert.equal(f.plain('events').filter(x=>x==='initialize').length,1);}],
];
(async()=>{let failures=0;for(const [name,fn] of tests){try{await fn(fixture());console.log('✓ '+name);}catch(error){failures++;console.error('✗ '+name+'\n'+error.stack);}}console.log(`AdMob consent: ${tests.length-failures}/${tests.length} passed.`);if(failures)process.exitCode=1;})();
