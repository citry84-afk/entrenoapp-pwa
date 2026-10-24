#!/usr/bin/env node
'use strict';

// Isolated, fictitious records only. No browser profile, storage, or network is used.
// Pin the calendar to exercise UTC/local midnight and the Madrid DST transition.
process.env.TZ = 'Europe/Madrid';
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
  'escHtml', 'lt', 'uiLabel', 'locale', 'fmtDate', 'nextWorkoutLocalDate',
  'isTimedExercise', 'isBandExercise', 'exerciseVariantName', 'exerciseHistoryEquipment',
  'recordedTimedMinutes', 'sessionSummary', 'progressTotals', 'progressHeadline',
  'exerciseProgressSeries', 'foldCard', 'toggleProgressFold', 'renderProgress', 'addBW', 'loggedWorkoutModeLabel',
  'isTimedSavedExercise', 'sessionActivityLabel', 'sessionActivityValue',
  'savedSetLabel', 'savedExerciseLine', 'sessionAlternativeSummary',
  'renderHistory', 'toggleHistorySession', 'toggleHistorySessionAt', 'confirmClear',
  'bandResistanceLabel', 'bandOptions', 'jsAttrArg', 'workoutNumber',
  'validWorkoutSet', 'recordedReferenceSet', 'compactPreviousLabel',
  'compactSetInput', 'renderCompactSetTable', 'stepperControl', 'restPanel',
  'workoutModeNote', 'workoutNextHeadline', 'liveExerciseFeedback',
];
const translations = source.slice(source.indexOf('const EN={'), source.indexOf('const textOrigins='));
const context = vm.createContext({ console, Date, Math, Map, Set });
vm.runInContext([
  ...['DB', 'EQ_LABELS', 'ALT_REASONS'].map(name => declaration('const', name)),
  translations,
  ...functions.map(name => declaration('function', name)),
].join('\n'), context, { filename: 'app-history-progress-functions.js' });
vm.runInContext(`
  let S,UI,W,WD,nodes,charts,chartConfigs,messages,persistResult,persistCalls,renderCalls,frames,confirmResult,prompts,previousMetrics;
  const document={getElementById(id){return nodes[id]||(nodes[id]={id,innerHTML:'',value:''});}};
  function currentLang(){return S.lang;}
  function requestAnimationFrame(callback){frames.push(callback);}
  function flushFrames(){while(frames.length)frames.shift()();}
  function Chart(node,config){chartConfigs.push({id:node.id,config});this.destroy=()=>{};}
  function mentalStats(){return {week:0};}
  function renderWeeklyCheckinProgress(){return '';}
  function renderMentalProgress(){return '';}
  function renderReadinessCard(){return '';}
  function renderAlternativeSignals(){return '';}
  function renderExternalActivityProgress(){return '';}
  function pushAd(){}
  function localizeTree(){}
  function weekly(){return S.sessions.length;}
  function lastSessionDays(){return S.sessions.length?0:null;}
  function readinessInsight(){throw new Error('A saved-record headline must not infer readiness or load.');}
  function lastExerciseRecord(){return null;}
  function exerciseRest(){return 90;}
  function confirm(message){prompts.push(message);return confirmResult;}
  function displayExerciseName(ex){return ex.name;}
  function exKey(ex,index){return ex.id+'_'+index;}
  function exDone(key){return WD[key]?.length&&WD[key].every(set=>set.done);}
  function nextSetIndex(key){return (WD[key]||[]).findIndex(set=>!set.done);}
  function nextSetLabel(){return currentLang()==='en'?'Next: set 2 · 40 kg × 8 reps':'Siguiente: serie 2 · 40 kg × 8 reps';}
  function workoutExerciseReference(ex){return ex;}
  function priorExerciseMetrics(){return previousMetrics;}
  function exMetrics(ex){return {volume:ex.sets.reduce((sum,set)=>sum+set.kg*set.reps,0),bestSet:{kg:ex.sets[0]?.kg||0,reps:ex.sets[0]?.reps||0,score:(ex.sets[0]?.kg||0)*(ex.sets[0]?.reps||0)}};}
  function toast(message){messages.push(message);}
  function persist(){persistCalls++;return persistResult;}
  function strength(sets=[{kg:40,reps:8,done:true}],extra={}){
    return {id:'qa_press',name:'QA press',type:'strength',equipment:'gym',sets,...extra};
  }
  function timed(minutes,done=true,extra={}){
    return {id:'walk_main',name:'QA walk',type:'walk',durationMin:minutes,sets:[{kg:0,reps:minutes,done}],...extra};
  }
  function session(exercises=[strength()],extra={}){
    return {id:'qa-session',date:'2026-10-21T10:00:00.000Z',dayName:'QA workout',mode:'normal',durationMin:12,exercises,...extra};
  }
  function reset(){
    S={lang:'es',sessions:[],bodyWeights:[],profile:{equipment:'gym',days:'3'}};
    UI={historyOpen:{},progressOpen:{}};W={active:true,notes:'QA in-progress note'};
    WD={qa:[{kg:73,reps:9,done:true}]};nodes={};charts={};chartConfigs=[];
    messages=[];persistResult=true;persistCalls=0;renderCalls=0;frames=[];
    confirmResult=true;prompts=[];previousMetrics={volume:0,bestSet:{score:0}};
  }
  reset();
`, context, { filename: 'history-progress-stubs.js' });

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
function html() { return run('nodes.content.innerHTML'); }
function snapshot() { return run('JSON.stringify({S,W,WD})'); }
let passed = 0, failed = 0;
function test(name, callback) {
  run('reset();');
  try { callback();passed++;console.log(`✓ ${name}`); }
  catch (error) { failed++;console.error(`✗ ${name}\n  ${error.stack}`); }
}
function inBothLanguages(name, callback) {
  for (const lang of ['es', 'en']) test(`${name} (${lang})`, () => {
    run(`S.lang=${JSON.stringify(lang)}`);
    callback(lang);
  });
}

inBothLanguages('Saved mode labels cover welcome, combined mode, legacy and unknown values', lang => {
  const labels = plain("['normal','express','suave','welcome','express_suave','future-mode',undefined].map(loggedWorkoutModeLabel)");
  assert.ok(labels.every(label => typeof label === 'string' && label.trim()));
  assert.ok(labels.every(label => !/undefined|null/.test(label)));
  assert.match(labels[1], /express/i);
  assert.match(labels[3], lang === 'en' ? /welcome|first|intro/i : /bienvenida|primer|inicio/i);
  assert.match(labels[4], /express/i);
  assert.match(labels[4], lang === 'en' ? /gentle|easy/i : /suave/i);
  assert.equal(labels[5], lang === 'en' ? 'Workout' : 'Entrenamiento', 'Unknown saved modes use a generic translated label, not untrusted text.');
  assert.equal(labels[6], labels[0], 'Missing legacy modes use the normal label.');
});

inBothLanguages('Saved strength and band lines include recorded sets, not unperformed ones', lang => {
  run("S.sessions=[session([strength([{kg:40,reps:8,done:true},{kg:999,reps:99,done:false},{kg:42,reps:7}])])]");
  const before = snapshot();
  const line = run('savedExerciseLine(S.sessions[0].exercises[0])');
  assert.equal(typeof line, 'string');
  assert.match(line, /40.*8/);
  assert.match(line, /42.*7/);
  assert.doesNotMatch(line, /999|99/);
  const band = run("savedSetLabel({kg:0,reps:12,band:'Media',done:true})");
  assert.equal(typeof band, 'string');
  assert.match(band, lang === 'en' ? /Medium/ : /Media/);
  assert.match(band, /12/);
  assert.equal(typeof run('savedSetLabel({kg:0,reps:10})'), 'string');
  assert.equal(snapshot(), before);
});

inBothLanguages('Saved timed lines use measured activity and localize pending targets', lang => {
  assert.match(run('savedExerciseLine(timed(6,true,{targetMin:30}))'), /^6 min/);
  assert.match(run('savedExerciseLine(timed(20,false,{gps:{durationMin:7,distanceKm:.65}}))'), /7 min.*0\.65 km/);
  const pending = run('savedExerciseLine(timed(0,false,{targetMin:20}))');
  assert.match(pending, lang === 'en' ? /Not completed.*target 20 min/ : /No completado.*objetivo 20 min/);
  const wod = run("savedExerciseLine(strength([],{wodMark:{rounds:3,reps:5,time:'8:12'}}))");
  assert.match(wod, lang === 'en' ? /3 rounds/ : /3 rondas/);
  assert.match(wod, lang === 'en' ? /time 8:12/ : /tiempo 8:12/);
});

inBothLanguages('Alternative summaries escape stored names and keep history unchanged', lang => {
  run(`S.sessions=[session([strength(undefined,{alternative:true,alternativeReason:'occupied',baseName:'<img src=x onerror=alert(1)>',name:'<script>alert(2)</script> & "QA"'})])];`);
  const before = snapshot();
  const summary = run('sessionAlternativeSummary(S.sessions[0])');
  assert.match(summary, lang === 'en' ? /Alternatives/ : /Alternativas/);
  assert.match(summary, /&lt;img/);
  assert.match(summary, /&lt;script/);
  assert.match(summary, /&amp;/);
  assert.doesNotMatch(summary, /<img|<script/);
  assert.equal(snapshot(), before);
});

inBothLanguages('Empty history is translated and has no undefined content', lang => {
  run('renderHistory()');
  assert.match(html(), lang === 'en' ? /No saved (?:sessions|workouts)|No (?:sessions|workouts) saved/ : /Aún no hay sesiones guardadas/);
  assert.doesNotMatch(html(), /undefined|null/);
});

inBothLanguages('History escapes stored text and uses numeric callbacks instead of IDs', lang => {
  const hostileId = `x' onclick="globalThis.pwned=1" data-x="`;
  run(`S.sessions=[
    session([strength([{kg:40,reps:8,done:true},{kg:999,reps:99,done:false}])],{id:'older',mode:'welcome'}),
    session([strength(undefined,{name:'<img src=x onerror=alert(1)>',alternative:true,baseName:'<svg onload=alert(2)>',alternativeReason:'occupied'})],{id:${JSON.stringify(hostileId)},dayName:'<script>alert(3)</script>',notes:'<img src=x onerror=alert(4)> & QA',bodyWeight:'<svg onload=alert(5)>',mode:'express_suave'})
  ];`);
  const before = snapshot();
  run('renderHistory()');
  assert.equal(snapshot(), before);
  const output = html();
  assert.doesNotMatch(output, /<script|<img|<svg|undefined/);
  assert.match(output, /&lt;script/);
  assert.match(output, /&lt;img/);
  assert.match(output, /&amp; QA/);
  assert.doesNotMatch(output, /999|99/);
  assert.match(output, lang === 'en' ? /Latest (?:sessions|workouts)|Recent (?:sessions|workouts)/ : /Últimas sesiones/);
  const buttons = output.match(/<button\b[^>]*>/g) || [];
  const historyButtons = buttons.filter(button => /toggleHistorySessionAt/.test(button));
  assert.equal(historyButtons.length, 2);
  for (const button of historyButtons) {
    assert.match(button, /onclick="toggleHistorySessionAt\(\d+\)"/);
    assert.match(button, /aria-expanded="false"/);
    const controls = button.match(/aria-controls="([^"]+)"/);
    assert.ok(controls, 'Every session toggle announces its controlled detail region.');
    assert.ok(output.includes(`id="${controls[1]}"`));
    assert.doesNotMatch(button, /globalThis|onclick=&quot;|data-x=/);
  }
});

test('History session toggles target the displayed saved row without changing records', () => {
  run("S.sessions=[session(undefined,{id:'first'}),session(undefined,{id:'second'})];renderHistory()");
  const before = snapshot();
  const callback = html().match(/onclick="(toggleHistorySessionAt\(\d+\))"/)[1];
  run(callback);
  assert.equal(snapshot(), before);
  assert.equal(run('UI.historyOpen.second'), true);
  assert.match(html().match(/<button\b[^>]*toggleHistorySessionAt[^>]*>/)[0], /aria-expanded="true"/);
  run(callback);
  assert.equal(run('UI.historyOpen.second'), false);
  const uiBefore = run('JSON.stringify(UI)');
  run('toggleHistorySessionAt(-1);toggleHistorySessionAt(999);toggleHistorySessionAt("0");toggleHistorySessionAt(0.5)');
  assert.equal(run('JSON.stringify(UI)'), uiBefore);
  assert.equal(snapshot(), before);
});

test('Prototype-like imported IDs remain closed until their own row is toggled', () => {
  run("S.sessions=[session(undefined,{id:'__proto__'}),session(undefined,{id:'constructor'})];renderHistory()");
  assert.equal((html().match(/aria-expanded="false"/g) || []).length, 2);
  const before = snapshot();
  run('toggleHistorySessionAt(0)');
  assert.equal(run("Object.prototype.hasOwnProperty.call(UI.historyOpen,'__proto__')"), true);
  assert.equal(run("UI.historyOpen['__proto__']"), true);
  assert.equal(run('Object.prototype.open'), undefined);
  assert.equal(snapshot(), before);
});

test('Progress aggregates saved duration separately from timed exercise minutes', () => {
  run(`S.sessions=[
    session([strength()],{durationMin:18}),
    session([timed(7,true,{targetMin:30})],{durationMin:12.5}),
    session([strength()],{durationMin:-3}),
    session([strength()],{durationMin:Infinity}),
    session([strength()],{durationMin:NaN}),
    session([strength()],{durationMin:undefined})
  ]`);
  const before = snapshot();
  const totals = plain('progressTotals()');
  assert.equal(totals.durationMin, 30.5);
  assert.equal(totals.runMin, 7);
  assert.ok(Number.isFinite(totals.durationMin));
  assert.equal(snapshot(), before);
});

test('Progress counts local calendar days across UTC midnight and Madrid DST', () => {
  assert.equal(new Date('2026-10-20T22:15:00.000Z').getDate(), 21);
  run(`S.sessions=[
    session(undefined,{date:'2026-10-20T22:15:00.000Z'}),
    session(undefined,{date:'2026-10-21T13:15:00.000Z'}),
    session(undefined,{date:'2026-10-25T00:30:00.000Z'}),
    session(undefined,{date:'2026-10-25T02:30:00.000Z'}),
    session(undefined,{date:'2026-10-26T11:00:00.000Z'})
  ]`);
  assert.equal(run('progressTotals().days'), 3);
  assert.equal(run("nextWorkoutLocalDate(new Date('2026-10-25T00:30:00.000Z'))"), '2026-10-25');
  assert.equal(run("nextWorkoutLocalDate(new Date('2026-10-25T02:30:00.000Z'))"), '2026-10-25');
});

test('Invalid saved dates do not add a phantom trained day', () => {
  run("S.sessions=[session(),session(undefined,{date:'not-a-date'}),session(undefined,{date:''})]");
  assert.equal(run('progressTotals().days'), 1);
});

inBothLanguages('Progress headline describes records without readiness or load predictions', lang => {
  const empty = run('progressHeadline(progressTotals())');
  assert.match(empty, lang === 'en' ? /first|save|record|logged/i : /primera|guardad|registr/i);
  run('S.sessions=[session()]');
  const before = snapshot();
  const headline = run('progressHeadline(progressTotals())');
  assert.match(headline, /1/);
  assert.doesNotMatch(headline, /listo para entrenar|ready to train|carga alta|high load|recuperación completa|fully recovered/i);
  assert.equal(snapshot(), before);
});

inBothLanguages('Progress reports logged time for strength, with translated first-level controls', lang => {
  run('S.sessions=[session([strength()],{durationMin:18})];renderProgress();flushFrames()');
  const output = html();
  assert.match(output, lang === 'en' ? /Logged time/ : /Tiempo registrado/);
  assert.doesNotMatch(output, /Minutos activos|Active minutes/);
  assert.match(output, /18/);
  assert.match(output, lang === 'en' ? /Saved (?:sessions|workouts)/ : /Sesiones guardadas/);
  assert.match(output, lang === 'en' ? /Body weight/ : /Peso corporal/);
  const input = (output.match(/<input\b[^>]*id="nbw"[^>]*>/) || [])[0];
  assert.ok(input);
  const explicitLabel = (output.match(/<label\b[^>]*for="nbw"[^>]*>([\s\S]*?)<\/label>/) || [])[1];
  const accessibleName = (input.match(/aria-label="([^"]+)"/) || [])[1] || explicitLabel;
  assert.ok(accessibleName, 'The weight input needs an associated label or accessible name.');
  assert.match(accessibleName, lang === 'en' ? /Body weight|Weight in kilograms/ : /Peso corporal|Peso en kilogramos/);
  const add = (output.match(/<button\b[^>]*onclick="addBW\(\)"[^>]*>/) || [])[0];
  assert.ok(add);
  assert.match(add, /type="button"/);
  assert.match(add, lang === 'en' ? /aria-label="[^"]*(?:Add|Save)[^"]*weight/i : /aria-label="[^"]*(?:Añadir|Guardar)[^"]*peso/i);
  assert.doesNotMatch(output, /undefined|null/);
});

inBothLanguages('Progress graph labels translate without merging equipment or mutating records', lang => {
  run(`S.sessions=[
    session([strength(),strength(undefined,{equipment:'mancuernas'})],{id:'first'}),
    session([strength([{kg:42,reps:8,done:true}]),strength([{kg:24,reps:10,done:true}],{equipment:'mancuernas'})],{id:'second'})
  ];S.bodyWeights=[{date:'2026-10-21T10:00:00.000Z',weight:75.5}]`);
  const before = snapshot();
  run('renderProgress();flushFrames()');
  assert.equal(snapshot(), before);
  assert.match(html(), lang === 'en' ? /Full gym|Gym/ : /Gym completo/);
  assert.match(html(), lang === 'en' ? /Dumbbells/ : /Mancuernas/);
  assert.match(html(), lang === 'en' ? /Exercise progress|Progress by exercise/ : /Progreso por ejercicio/);
  const series = plain("chartConfigs.filter(chart=>chart.id!=='ch-bw').map(chart=>chart.config.data.datasets[0].data)");
  assert.deepEqual(series, [[40,42],[40,24]]);
  assert.equal(run('new Set(chartConfigs.map(chart=>chart.id)).size'), 3);
  const canvases = html().match(/<canvas\b[^>]*>/g) || [];
  assert.equal(canvases.length, 3);
  for (const canvas of canvases) {
    assert.match(canvas, /role="img"/);
    assert.match(canvas, /aria-label="[^"]+"/);
    assert.match(canvas, lang === 'en' ? /logged weight|Logged body weight/ : /peso registrado|Peso corporal registrado/);
  }
});

test('Progress folds announce their expanded state and controlled detail regions', () => {
  run('renderProgress()');
  const before = snapshot();
  const buttons = html().match(/<button\b[^>]*toggleProgressFold[^>]*>/g) || [];
  assert.ok(buttons.length >= 5);
  for (const button of buttons) {
    assert.match(button, /type="button"/);
    assert.match(button, /aria-expanded="false"/);
    const controls = button.match(/aria-controls="([^"]+)"/);
    assert.ok(controls);
    assert.ok(html().includes(`id="${controls[1]}"`));
  }
  run("toggleProgressFold('body')");
  const bodyToggle = html().match(/<button\b[^>]*onclick="toggleProgressFold\('body'\)"[^>]*>/)[0];
  assert.match(bodyToggle, /aria-expanded="true"/);
  assert.equal(snapshot(), before);
});

inBothLanguages('Body-weight validation rejects malformed or non-finite values without persisting', lang => {
  for (const value of ['', '0', '29.9', '300.1', 'Infinity', 'NaN', '75kg', '75.5junk']) {
    run(`nodes.nbw={value:${JSON.stringify(value)}};messages=[];addBW()`);
    assert.equal(run('S.bodyWeights.length'), 0, value);
    assert.equal(run('persistCalls'), 0, value);
    assert.match(run('messages.at(-1)'), lang === 'en' ? /weight|number|between/i : /peso|número|entre/i);
  }
});

inBothLanguages('Failed body-weight persistence rolls back state and offers a truthful error', lang => {
  run("S.bodyWeights=[{date:'2026-10-20T10:00:00.000Z',weight:75}];nodes.nbw={value:'75.5'};persistResult=false");
  const before = snapshot();
  run('addBW()');
  assert.equal(snapshot(), before);
  assert.equal(run('persistCalls'), 1);
  assert.match(run('messages.at(-1)'), lang === 'en' ? /could not|couldn't|not saved|unable/i : /no se pudo|no se ha|sin guardar/i);
  assert.doesNotMatch(run('messages.at(-1)'), /^(?:Peso guardado|Weight saved)/i);
});

inBothLanguages('Valid body weight is saved once without altering history or a live workout', lang => {
  run("S.sessions=[session()];nodes.nbw={value:'75.5'}");
  const before = run('JSON.stringify({sessions:S.sessions,W,WD})');
  run('addBW();flushFrames()');
  assert.equal(run('JSON.stringify({sessions:S.sessions,W,WD})'), before);
  assert.equal(run('S.bodyWeights.length'), 1);
  assert.equal(run('S.bodyWeights[0].weight'), 75.5);
  assert.equal(run('persistCalls'), 1);
  assert.match(run('messages.at(-1)'), lang === 'en' ? /weight saved/i : /peso guardado/i);
});

inBothLanguages('Compact inputs and steppers translate labels and escape exercise keys', lang => {
  const input = run("compactSetInput('qa\\\"<key>',1,'reps',8,'Repeticiones')");
  assert.match(input, lang === 'en' ? /aria-label="Repetitions set 2"/ : /aria-label="Repeticiones serie 2"/);
  assert.match(input, /inputmode="numeric"/);
  assert.match(input, /&lt;key>/);
  const stepper = run("stepperControl('qa_key',0,'reps',8,1,0,'','Repeticiones')");
  assert.match(stepper, lang === 'en' ? /aria-label="Decrease Repetitions"/ : /aria-label="Bajar Repeticiones"/);
  assert.match(stepper, lang === 'en' ? /aria-label="Increase Repetitions"/ : /aria-label="Subir Repeticiones"/);
  assert.match(stepper, lang === 'en' ? /aria-label="Repetitions set 1"/ : /aria-label="Repeticiones serie 1"/);
});

inBothLanguages('Compact tables announce completion state in every logging mode', lang => {
  for (const kind of ['weight', 'body', 'band']) {
    run("WD.qa=[{kg:40,reps:8,band:'Media',done:true},{kg:42,reps:7,band:'Fuerte',done:false}]");
    const before = snapshot();
    const output = run(`renderCompactSetTable(strength(),'qa',WD.qa,${JSON.stringify(kind)})`);
    assert.match(output, lang === 'en' ? /Log sets/ : /Registro de series/);
    assert.match(output, lang === 'en' ? />Previous</ : />Anterior</);
    assert.match(output, /aria-pressed="true"/);
    assert.match(output, /aria-pressed="false"/);
    assert.match(output, lang === 'en' ? /aria-label="Unmark set 1"/ : /aria-label="Desmarcar serie 1"/);
    assert.match(output, lang === 'en' ? /aria-label="Complete set 2"/ : /aria-label="Completar serie 2"/);
    if (kind === 'band') assert.match(output, lang === 'en' ? /aria-label="Band set 1"/ : /aria-label="Banda serie 1"/);
    assert.equal(snapshot(), before);
  }
});

inBothLanguages('Band display labels localize while persisted Spanish resistance values stay stable', lang => {
  const options = run("bandOptions('Media')");
  assert.deepEqual([...options.matchAll(/value="([^"]+)"/g)].map(match => match[1]), ['Ligera','Media','Fuerte','Muy fuerte']);
  assert.match(options, /value="Media" selected/);
  assert.match(options, lang === 'en' ? />Medium</ : />Media</);
  assert.match(options, lang === 'en' ? />Extra strong</ : />Muy fuerte</);
});

inBothLanguages('Previous band references translate without changing saved resistance values', lang => {
  run("S.sessions=[session([strength([{kg:0,reps:12,band:'Media',done:true}])])]");
  const before = snapshot();
  const output = run("compactPreviousLabel(S.sessions[0].exercises[0].sets[0],'band')");
  assert.match(output, lang === 'en' ? /Medium/ : /Media/);
  assert.match(output, /12 reps/);
  assert.equal(snapshot(), before);
});

inBothLanguages('Rest controls translate titles and accessible actions', lang => {
  const output = run("restPanel(strength(),'qa')");
  assert.match(output, lang === 'en' ? /Automatic rest/ : /Descanso automático/);
  assert.match(output, lang === 'en' ? /aria-label="Subtract 15 seconds"/ : /aria-label="Restar 15 segundos"/);
  assert.match(output, lang === 'en' ? /aria-label="Add 15 seconds"/ : /aria-label="Añadir 15 segundos"/);
  assert.match(output, lang === 'en' ? />Start</ : />Iniciar</);
  assert.match(run("restPanel(strength(),'qa','Pausa tranquila')"), lang === 'en' ? /Take a break/ : /Pausa tranquila/);
});

inBothLanguages('Clearing history can be cancelled without any data or storage change', lang => {
  run("S.sessions=[session()];S.bodyWeights=[{value:70}];S.nextWorkout={date:'2026-10-23'};confirmResult=false");
  const before=snapshot();
  assert.equal(run('confirmClear()'),false);
  assert.equal(snapshot(),before);
  assert.equal(run('persistCalls'),0);
  assert.match(run('prompts[0]'),lang==='en'?/body weights.*next-workout date.*current workout will stay/:/pesos corporales.*próxima sesión.*curso se conserva/);
});

inBothLanguages('Clearing history keeps the active workout and unrelated preferences', lang => {
  run("S.sessions=[session()];S.bodyWeights=[{value:70}];S.nextWorkout={date:'2026-10-23'}");
  const active=run('JSON.stringify({W,WD,profile:S.profile})');
  assert.equal(run('confirmClear()'),true);
  assert.equal(run('S.sessions.length+S.bodyWeights.length'),0);
  assert.equal(run('S.nextWorkout'),null);
  assert.equal(run('JSON.stringify({W,WD,profile:S.profile})'),active);
  assert.match(run('messages.at(-1)'),lang==='en'?/History cleared/:/Historial borrado/);
});

inBothLanguages('Failed history persistence restores all records and next-workout date', lang => {
  run("S.sessions=[session()];S.bodyWeights=[{value:70}];S.nextWorkout={date:'2026-10-23'};persistResult=false");
  const before=snapshot();
  assert.equal(run('confirmClear()'),false);
  assert.equal(snapshot(),before);
  assert.match(run('messages.at(-1)'),lang==='en'?/records were kept/:/Conservamos tus registros/);
});

inBothLanguages('Workout guidance localizes all modes without changing prescriptions', lang => {
  const before=run('JSON.stringify(WD)');
  for(const priority of ['musculo','vital']) for(const mode of ['normal','express','suave','express_suave']){
    run(`S.profile.priority=${JSON.stringify(priority)};W.mode=${JSON.stringify(mode)}`);
    assert.match(run('workoutModeNote()'),lang==='en'?/mode|gentle|exercises|easiest|consistency/i:/modo|suave|ejercicios|fácil|constancia/i);
  }
  run("S.profile.priority='musculo'");
  assert.equal(run('JSON.stringify(WD)'),before);
});

inBothLanguages('Next-exercise headline is localized and escapes exercise names', lang => {
  run("WD.qa_0=[{kg:40,reps:8,done:false}];var qaDay={exercises:[{id:'qa',name:'<img src=x>'}]}");
  const output=run('workoutNextHeadline(qaDay)');
  assert.match(output,/&lt;img src=x&gt;/);
  assert.doesNotMatch(output,/<img|Next:|Siguiente:/);
  assert.match(output,lang==='en'?/Now:.*set 2.*Open the exercise/:/Ahora:.*serie 2.*Abre el ejercicio/);
  run('WD.qa_0[0].done=true');
  assert.match(run('workoutNextHeadline(qaDay)'),lang==='en'?/Everything marked/:/Todo marcado/);
});

inBothLanguages('Live timed feedback shows marked minutes rather than the planned target', lang => {
  run('WD.qa=[{kg:0,reps:6,done:true},{kg:0,reps:20,done:false}]');
  const before=snapshot();
  const output=run("liveExerciseFeedback({id:'walk_qa',type:'walk',durationMin:20},'qa')");
  assert.match(output,/6 min/);
  assert.doesNotMatch(output,/20 min/);
  assert.match(output,lang==='en'?/marked as completed/:/marcados como realizados/);
  assert.equal(snapshot(),before);
});

inBothLanguages('Live strength and band feedback uses the selected language', lang => {
  run('WD.qa=[{kg:40,reps:8,done:false}]');
  assert.match(run("liveExerciseFeedback(strength(),'qa')"),lang==='en'?/No sets marked/:/Aún sin series/);
  run('WD.qa[0].done=true');
  assert.match(run("liveExerciseFeedback(strength(),'qa')"),lang==='en'?/Creating a reference/:/Creando referencia/);
  assert.match(run("liveExerciseFeedback({id:'qa',type:'band'},'qa')"),lang==='en'?/Band sets completed/:/Bandas completadas/);
});

console.log(`\n${passed} history/progress UI tests passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
