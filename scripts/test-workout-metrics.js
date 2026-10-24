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
  'isTimedExercise', 'isBandExercise', 'exerciseVariantName', 'exerciseHistoryEquipment',
  'recordedTimedMinutes', 'calcSessionStats', 'sessionSummary', 'exerciseProgressSeries',
  'escHtml', 'renderProgress',
];
const context = vm.createContext({ console, Date, Math, Map, Set });
vm.runInContext([
  ...['DB', 'EQ_LABELS'].map(name => declaration('const', name)),
  ...functions.map(name => declaration('function', name)),
].join('\n'), context, { filename: 'app-metrics-functions.js' });
vm.runInContext(`
  let S={sessions:[],bodyWeights:[]},charts={},chartConfigs=[],nodes={};
  const document={getElementById(id){return nodes[id]||(nodes[id]={id,innerHTML:''});}};
  function requestAnimationFrame(callback){callback();}
  function Chart(node,config){chartConfigs.push({id:node.id,config});this.destroy=()=>{};}
  function progressTotals(){return {days:0,runMin:0,volume:0,avg:0};}
  function progressHeadline(){return '';}
  function mentalStats(){return {week:0};}
  function foldCard(id,title,subtitle,body){return body;}
  function renderWeeklyCheckinProgress(){return '';}
  function renderMentalProgress(){return '';}
  function renderReadinessCard(){return '';}
  function renderAlternativeSignals(){return '';}
  function renderExternalActivityProgress(){return '';}
  function pushAd(){}
  function fmtDate(date){return date;}
  function currentLang(){return 'es';}
  function lt(value){return value;}
  function timed(minutes,done,extra={}){
    return {id:'walk_main',type:'walk',durationMin:minutes,sets:[{reps:minutes,kg:0,done}],...extra};
  }
  function strength(kg,extra={}){
    return {id:'press',name:'Press',type:'strength',equipment:'gym',sets:[{kg,reps:8,done:true}],...extra};
  }
  function session(exercises,date='2026-10-20T10:00:00.000Z'){return {date,exercises};}
`, context);

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
let passed = 0;
function test(name, callback) {
  run('S={sessions:[],bodyWeights:[]};charts={};chartConfigs=[];nodes={};');
  callback();
  passed++;
  console.log(`✓ ${name}`);
}

test('An unperformed planned block contributes no active minutes', () => {
  assert.equal(run('calcSessionStats([timed(20,false)]).activeMin'), 0);
  assert.equal(run('sessionSummary(session([timed(20,false)])).runMin'), 0);
});

test('A partial timed session counts only its completed blocks', () => {
  run('const partial=[timed(5,true),timed(20,false,{id:"walk_finish"})];');
  assert.equal(run('calcSessionStats(partial).activeMin'), 5);
  assert.equal(run('calcSessionStats(partial).pct'), 50);
  assert.equal(run('sessionSummary(session(partial)).runMin'), 5);
});

test('A partial GPS recording counts measured time rather than the plan', () => {
  run('const gpsPartial=timed(20,false,{gps:{durationMin:7,distanceKm:.6}});');
  assert.equal(run('calcSessionStats([gpsPartial]).activeMin'), 7);
  assert.equal(run('sessionSummary(session([gpsPartial])).runMin'), 7);
  assert.equal(run('calcSessionStats([gpsPartial]).pct'), 0);
});

test('A completed block uses recorded minutes rather than target minutes', () => {
  assert.equal(run('calcSessionStats([timed(8,true,{targetMin:20})]).activeMin'), 8);
  assert.equal(run('sessionSummary(session([timed(8,true,{targetMin:20})])).runMin'), 8);
});

test('Legacy saved sets without done stay readable without completing live sets', () => {
  run('const legacy=timed(12,undefined);delete legacy.sets[0].done;');
  assert.equal(run('sessionSummary(session([legacy])).runMin'), 12);
  assert.equal(run('calcSessionStats([legacy]).activeMin'), 0);
});

test('The legacy reps fallback ignores minutes from uncompleted sets', () => {
  run('const fallback=timed(0,true,{sets:[{reps:6,done:true},{reps:90,done:false}]});');
  assert.equal(run('calcSessionStats([fallback]).activeMin'), 6);
  assert.equal(run('sessionSummary(session([fallback])).runMin'), 6);
});

test('Strength duration metadata does not count as timed activity', () => {
  assert.equal(run('calcSessionStats([strength(40,{durationMin:20})]).activeMin'), 0);
  assert.equal(run('sessionSummary(session([strength(40,{durationMin:20})])).runMin'), 0);
});

test('Progress ignores uncompleted loads and exercises with no completed sets', () => {
  run('S.sessions=[session([strength(80,{sets:[{kg:80,reps:8,done:true},{kg:150,reps:8,done:false}]}),strength(200,{id:"unperformed",sets:[{kg:200,reps:8,done:false}]})])];');
  assert.deepEqual(plain('exerciseProgressSeries().map(ex=>ex.pts.map(p=>p.kg))'), [[80]]);
});

test('The same exercise ID stays separate by equipment and variant', () => {
  run(`S.sessions=[
    session([strength(80),strength(24,{equipment:'mancuernas'}),strength(20,{name:'Press inclinado'})]),
    session([strength(82),strength(26,{equipment:'mancuernas'}),strength(22,{name:'Press inclinado'})])
  ];`);
  assert.deepEqual(plain('exerciseProgressSeries().map(ex=>ex.pts.map(p=>p.kg))'), [[80,82],[24,26],[20,22]]);
  assert.equal(run('new Set(exerciseProgressSeries().map(ex=>ex.chartId)).size'), 3);
});

test('Unknown legacy equipment is not merged into a known equipment series', () => {
  run('S.sessions=[session([strength(50,{id:"legacy",name:"Old exercise",equipment:""})]),session([strength(55,{id:"legacy",name:"Old exercise",equipment:"gym"})])];');
  assert.equal(run('exerciseProgressSeries().length'), 2);
});

test('Legacy alternatives use inferred actual equipment consistently', () => {
  run('S.sessions=[session([strength(24,{id:"pim",name:"Press con mancuernas",equipment:"gym",alternative:true})]),session([strength(26,{id:"pim",name:"Press con mancuernas",equipment:"mancuernas"})])];');
  assert.equal(run('exerciseProgressSeries().length'), 1);
  assert.equal(run('exerciseProgressSeries()[0].equipment'), 'mancuernas');
  assert.deepEqual(plain('exerciseProgressSeries()[0].pts.map(p=>p.kg)'), [24,26]);
});

test('Repeated exercise entries in one workout are one session point', () => {
  run('S.sessions=[session([strength(70),strength(80)])];');
  assert.equal(run('exerciseProgressSeries()[0].pts.length'), 1);
  assert.equal(run('exerciseProgressSeries()[0].pts[0].kg'), 80);
});

test('The progress screen renders and routes each compatible series separately', () => {
  run(`S.sessions=[
    session([strength(80,{sets:[{kg:80,reps:8,done:true},{kg:150,reps:8,done:false}]}),strength(24,{equipment:'mancuernas'})]),
    session([strength(82),strength(26,{equipment:'mancuernas'})])
  ];renderProgress();`);
  assert.deepEqual(plain('chartConfigs.map(chart=>chart.config.data.datasets[0].data)'), [[80,82],[24,26]]);
  assert.equal(run('new Set(chartConfigs.map(chart=>chart.id)).size'), 2);
  assert.match(run('nodes.content.innerHTML'), /Press · Gym completo/);
  assert.match(run('nodes.content.innerHTML'), /Press · Mancuernas/);
});

console.log(`${passed} workout metrics regression tests passed.`);
