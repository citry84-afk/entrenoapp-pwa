#!/usr/bin/env node
'use strict';

process.env.TZ = 'Europe/Madrid';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');
const fixedNow = new Date('2026-10-24T12:00:00+02:00').getTime();
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [fixedNow])); }
  static now() { return fixedNow; }
}

function declaration(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

function fixture() {
  const context = vm.createContext({ console, Date: FixedDate, Math, Set });
  vm.runInContext([
    'escHtml', 'nextWorkoutLocalDate', 'parseNextWorkoutDate', 'shiftNextWorkoutDate',
    'workoutDayKey', 'normalizeNextWorkout', 'getNextWorkout', 'lastSessionIndex',
    'suggestedIndex', 'nextWorkoutCandidate', 'nextWorkoutDateLabel',
    'chooseNextWorkoutDate', 'renderNextWorkoutCard', 'saveSession',
    'workoutNumber', 'validWorkoutSet', 'validatePendingWorkoutSets',
    'focusPartLabel', 'focusWorkoutParts',
  ].map(declaration).join('\n'), context, { filename: 'app-next-workout-functions.js' });
  vm.runInContext(`
    let messages=[],events=[],stored=null,persisted=0,persistResult=true,rendered=0,permissions=0,saved=0;
    let dateInputs={};
    const S={
      lang:'es',screen:'home',curDay:0,
      routine:[
        {name:'Día A · Fuerza',exercises:[{id:'squat',name:'Squat',sets:3,rr:'8-12'}]},
        {name:'Día B · Fuerza',exercises:[{id:'row',name:'Row',sets:3,rr:'8-12'}]},
        {name:'Día C · Fuerza',exercises:[{id:'press',name:'Press',sets:3,rr:'8-12'}]},
      ],
      sessions:[],bodyWeights:[],achievements:[],manualToday:false,nextWorkout:null,
      reminder:{on:false,hour:19,minute:30,days:[1,3,5]},
    };
    S.sessions=[{id:101,date:'2026-10-24T09:00:00.000Z',dayName:S.routine[0].name,
      routineDayIndex:0,routineDayKey:workoutDayKey(S.routine[0])}];
    const W={active:true,dayIndex:0,baseDay:JSON.parse(JSON.stringify(S.routine[0])),
      sessionDay:JSON.parse(JSON.stringify(S.routine[0])),draftId:'active-draft',
      startedAt:Date.now()-60000,notes:'Keep this draft',mode:'normal',bw:'',feel:'normal',welcome:false};
    let WD={squat_0:[{kg:73,reps:9,done:true},{kg:73,reps:8,done:false}]};
    const UI={homeOpen:{}};
    const document={getElementById(id){
      if(id.startsWith('next-workout-date-'))return {value:dateInputs[id]||''};
      return {textContent:'',innerHTML:'',className:'',querySelectorAll(){return[];}};
    }};
    const localStorage={setItem(){}};
    function currentLang(){return S.lang;}
    function lt(value){return value;}
    function uiLabel(value){return value;}
    function shortDayName(day){return day?.name||'';}
    function dayKind(){return 'strength';}
    function dayIcon(){return '🏋️';}
    function todayDay(day){return W.active&&W.sessionDay?W.sessionDay:day;}
    function persist(){persisted++;if(!persistResult)return false;stored=JSON.stringify(S);return true;}
    function toast(message){messages.push(message);}
    function track(name,data){events.push({name,data});}
    function trackOnce(name,data,key){events.push({name,data,key});}
    function renderHome(){rendered++;}
    function renderNextWorkoutCards(){rendered++;}
    function refreshNextWorkoutCards(){rendered++;}
    function renderSettings(){rendered++;}
    function localizeTree(){}
    function nav(){rendered++;}
    function showSessionSummary(){saved++;}
    function showWelcomeWorkoutComplete(){saved++;}
    function requestNotificationPermission(){permissions++;}
    function ensureNotificationPermission(){permissions++;}
    function scheduleWorkoutReminders(){permissions++;}
    function exKey(ex,index){return ex.id+'_'+index;}
    function workoutExerciseReference(ex){return ex;}
    function serializeGps(){return null;}
    function isTimedExercise(){return false;}
    function isWodExercise(){return false;}
    function calcSessionStats(exercises){
      const sets=exercises.flatMap(ex=>ex.sets),done=sets.filter(set=>set.done).length;
      return {done,total:sets.length,pct:sets.length?Math.round(done/sets.length*100):0};
    }
    function detectSessionPRs(){return [];}
    function workoutDurationMin(){return 1;}
    function unlockAchievements(){return [];}
    function streak(){return 1;}
    function productAnalyticsCohort(){return {eligible:false};}
    function stopWorkoutCoachLoop(){}
    function stopTimer(){}
    function clearGpsWatcher(){}
    function disableWakeLock(){}
    function clearWorkoutDraft(){W.active=false;}
    function saveWorkoutDraft(){}
    function renderWorkout(){rendered++;}
    function setTimeout(){}
    function plan(index=1,date='2026-10-25'){
      return {version:1,afterSessionId:String(S.sessions.at(-1).id),dayIndex:index,
        dayKey:workoutDayKey(S.routine[index]),date};
    }
  `, context);
  return {
    run(code) { return vm.runInContext(code, context); },
    plain(code) { return JSON.parse(JSON.stringify(vm.runInContext(code, context))); },
  };
}

let passed = 0, failed = 0;
function test(name, callback) {
  try { callback(fixture());passed++;console.log(`✓ ${name}`); }
  catch (error) { failed++;console.error(`✗ ${name}\n  ${error.stack || error.message}`); }
}
function draftSnapshot(f) { return f.run('JSON.stringify({W,WD,curDay:S.curDay,reminder:S.reminder,sessions:S.sessions})'); }

test('Local date keys use Madrid calendar dates rather than UTC', f => {
  assert.equal(f.run("nextWorkoutLocalDate(new Date('2026-10-24T22:30:00Z'))"), '2026-10-25');
  assert.equal(f.run("nextWorkoutLocalDate(new Date('2026-03-29T22:30:00Z'))"), '2026-03-30');
  assert.equal(f.run('nextWorkoutLocalDate()'), '2026-10-24');
});

test('Valid custom dates parse at local noon', f => {
  assert.deepEqual(f.plain("(()=>{const d=parseNextWorkoutDate('2028-02-29');return [d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes()];})()"), [2028,1,29,12,0]);
});

for (const value of ['2026-02-29','2026-04-31','2026-13-01','2026-00-01','2026-10-00','2026-1-02','2026-10-24T00:00:00Z','',null,42]) {
  test(`Invalid date ${JSON.stringify(value)} is rejected without normalization`, f => {
    assert.equal(f.run(`parseNextWorkoutDate(${JSON.stringify(value)})`), null);
  });
}

test('Calendar-day shifts remain stable across the spring DST transition', f => {
  assert.equal(f.run("shiftNextWorkoutDate(1,new Date('2026-03-28T23:30:00+01:00'))"), '2026-03-29');
  assert.equal(f.run("shiftNextWorkoutDate(2,new Date('2026-03-28T23:30:00+01:00'))"), '2026-03-30');
});

test('Calendar-day shifts remain stable across the autumn DST transition', f => {
  assert.equal(f.run("shiftNextWorkoutDate(1,new Date('2026-10-24T23:30:00+02:00'))"), '2026-10-25');
  assert.equal(f.run("shiftNextWorkoutDate(2,new Date('2026-10-24T23:30:00+02:00'))"), '2026-10-26');
});

test('Day signatures are deterministic and distinguish exercise prescriptions', f => {
  assert.equal(f.run('workoutDayKey(S.routine[0])'), f.run('workoutDayKey(JSON.parse(JSON.stringify(S.routine[0])))'));
  assert.notEqual(f.run('workoutDayKey(S.routine[0])'), f.run('workoutDayKey({...S.routine[0],exercises:S.routine[1].exercises})'));
});

test('Changing a repetition range invalidates the old prescription signature', f => {
  const before = f.run('workoutDayKey(S.routine[1])');
  f.run("S.routine[1].exercises[0].rr='3-5';");
  assert.notEqual(f.run('workoutDayKey(S.routine[1])'), before);
});

test('A valid plan is normalized without mutating any source data', f => {
  f.run('S.nextWorkout=plan();');
  const before = f.run('JSON.stringify(S)');
  assert.deepEqual(f.plain('getNextWorkout()'), f.plain('plan()'));
  assert.equal(f.run('JSON.stringify(S)'), before);
});

test('A plan may deliberately have no selected date', f => {
  assert.equal(f.run('normalizeNextWorkout(plan(1,null),S.routine,S.sessions).date'), null);
});

test('A stale plan is rejected after a newer session has been saved', f => {
  f.run('S.nextWorkout=plan();S.sessions.push({id:102});');
  assert.equal(f.run('getNextWorkout()'), null);
});

for (const mutation of ['version:2','dayIndex:-1','dayIndex:1.5','dayKey:"unknown"','afterSessionId:"wrong"','date:"2026-02-30"']) {
  test(`Malformed plan field ${mutation} is rejected`, f => {
    assert.equal(f.run(`normalizeNextWorkout({...plan(),${mutation}},S.routine,S.sessions)`), null);
  });
}

test('No plan is accepted without a saved session or routine', f => {
  assert.equal(f.run('normalizeNextWorkout(plan(),S.routine,[])'), null);
  assert.equal(f.run('normalizeNextWorkout(plan(),[],S.sessions)'), null);
});

test('A uniquely identified day follows a routine reorder', f => {
  f.run('S.nextWorkout=plan();S.routine=[S.routine[1],S.routine[0],S.routine[2]];');
  assert.equal(f.run('getNextWorkout().dayIndex'), 0);
  assert.equal(f.run('getNextWorkout().dayKey'), f.run('workoutDayKey(S.routine[0])'));
});

test('A changed exercise plan invalidates a stored suggestion', f => {
  f.run("S.nextWorkout=plan();S.routine[1].exercises=[{id:'deadlift',name:'Deadlift',sets:4,rr:'5'}];");
  assert.equal(f.run('getNextWorkout()'), null);
});

test('An exact duplicate day is accepted only at its still-valid recorded index', f => {
  f.run('S.routine=[S.routine[0],S.routine[1],JSON.parse(JSON.stringify(S.routine[1]))];S.nextWorkout=plan(1);');
  assert.equal(f.run('getNextWorkout().dayIndex'), 1);
  f.run("S.routine=[S.routine[1],S.routine[0],S.routine[2]];");
  assert.equal(f.run('getNextWorkout()'), null);
});

test('A single-day routine always rotates back to its only day', f => {
  f.run('S.routine=[S.routine[0]];');
  assert.equal(f.run('suggestedIndex()'), 0);
});

test('A two-day routine rotates without skipping either day', f => {
  f.run('S.routine=S.routine.slice(0,2);');
  assert.equal(f.run('suggestedIndex()'), 1);
  f.run('S.sessions[0]={id:101,dayName:S.routine[1].name,routineDayIndex:1,routineDayKey:workoutDayKey(S.routine[1])};');
  assert.equal(f.run('suggestedIndex()'), 0);
});

test('New session indices disambiguate identical names and signatures', f => {
  f.run('S.routine=[S.routine[0],JSON.parse(JSON.stringify(S.routine[0])),S.routine[2]];S.sessions[0]={id:101,dayName:S.routine[1].name,routineDayIndex:1,routineDayKey:workoutDayKey(S.routine[1])};');
  assert.equal(f.run('lastSessionIndex()'), 1);
  assert.equal(f.run('suggestedIndex()'), 2);
});

test('A welcome workout starts the normal routine at day zero', f => {
  f.run('S.sessions[0].welcomeWorkout=true;S.curDay=2;');
  assert.equal(f.run('suggestedIndex()'), 0);
});

test('A valid saved plan takes priority over the automatic rotation', f => {
  f.run('S.nextWorkout=plan(2);');
  assert.equal(f.run('nextWorkoutCandidate().index'), 2);
  assert.equal(f.run('nextWorkoutCandidate().day'), f.run('S.routine[2]'));
});

test('Without a valid plan the normal rotation remains available', f => {
  f.run('S.nextWorkout={version:1,afterSessionId:"stale"};');
  assert.equal(f.run('nextWorkoutCandidate().index'), 1);
});

for (const [choice,expected] of [['tomorrow','2026-10-25'],['two_days','2026-10-26']]) {
  test(`Choosing ${choice} persists a local date without changing the active draft`, f => {
    const before = draftSnapshot(f);
    f.run(`chooseNextWorkoutDate('${choice}');`);
    assert.equal(f.run('S.nextWorkout.date'), expected);
    assert.equal(f.run('S.nextWorkout.afterSessionId'), '101');
    assert.equal(f.run('S.nextWorkout.dayIndex'), 1);
    assert.equal(f.run('JSON.parse(stored).nextWorkout.date'), expected);
    assert.equal(f.run('persisted'), 1);
    assert.equal(draftSnapshot(f), before);
    assert.equal(f.run('permissions'), 0);
  });
}

test('Choosing no date keeps an explicit date-free next step', f => {
  f.run("S.nextWorkout=plan();chooseNextWorkoutDate('none');");
  assert.equal(f.run('S.nextWorkout.date'), null);
  assert.equal(f.run('S.nextWorkout.dayIndex'), 1);
  assert.equal(f.run('JSON.parse(stored).nextWorkout.date'), null);
  assert.equal(f.run('permissions'), 0);
});

test('Custom dates are read from the specified card context', f => {
  f.run("dateInputs['next-workout-date-home']='2026-11-02';chooseNextWorkoutDate('custom','home');");
  assert.equal(f.run('S.nextWorkout.date'), '2026-11-02');
  assert.equal(f.run('JSON.parse(stored).nextWorkout.date'), '2026-11-02');
});

for (const value of ['', '2026-02-30', '2026-10-23', '2027-10-25']) {
  test(`Custom date ${JSON.stringify(value)} does not replace a valid plan`, f => {
    f.run(`S.nextWorkout=plan();dateInputs['next-workout-date-summary']=${JSON.stringify(value)};`);
    const before = f.run('JSON.stringify({S,W,WD})');
    f.run("chooseNextWorkoutDate('custom');");
    assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
    assert.equal(f.run('persisted'), 0);
    assert.ok(f.run('messages.length') > 0);
  });
}

test('The last allowed custom date is today plus 365 local days', f => {
  f.run("dateInputs['next-workout-date-summary']='2027-10-24';chooseNextWorkoutDate('custom');");
  assert.equal(f.run('S.nextWorkout.date'), '2027-10-24');
});

test('Today is an allowed optional custom date', f => {
  f.run("dateInputs['next-workout-date-summary']='2026-10-24';chooseNextWorkoutDate('custom');");
  assert.equal(f.run('S.nextWorkout.date'), '2026-10-24');
});

test('Unknown date choices do not write data or emit planning events', f => {
  const before = f.run('JSON.stringify({S,W,WD})');
  assert.equal(f.run("chooseNextWorkoutDate('unknown')"), false);
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  assert.equal(f.run('persisted'), 0);
  assert.equal(f.run('events.length'), 0);
});

test('Planning analytics include the choice but never the selected date', f => {
  f.run("dateInputs['next-workout-date-summary']='2026-11-02';chooseNextWorkoutDate('custom');");
  const event = f.plain("events.find(event=>event.name==='next_workout_planned')");
  assert.equal(event.data.plan, 'custom');
  assert.doesNotMatch(JSON.stringify(event), /2026-11-02|dayKey|afterSessionId/);
  assert.equal(f.run('permissions'), 0);
});

test('Failed persistence restores the old plan and leaves the draft untouched', f => {
  f.run('S.nextWorkout=plan(2);persistResult=false;');
  const before = f.run('JSON.stringify({S,W,WD})');
  f.run("chooseNextWorkoutDate('tomorrow');");
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  assert.equal(f.run('stored'), null);
  assert.equal(f.run('persisted'), 1);
  assert.equal(f.run('permissions'), 0);
  assert.ok(f.run('messages.length') > 0);
  assert.equal(f.run('events.length'), 0);
});

test('Failed persistence restores an originally missing plan', f => {
  f.run('delete S.nextWorkout;persistResult=false;');
  f.run("chooseNextWorkoutDate('tomorrow');");
  assert.equal(f.run('S.nextWorkout == null'), true);
  assert.equal(f.run('permissions'), 0);
});

test('Saving a workout records routine identity and consumes its old plan', f => {
  f.run('S.nextWorkout=plan();saveSession();');
  assert.equal(f.run('S.sessions.length'), 2);
  assert.equal(f.run('S.sessions.at(-1).routineDayIndex'), 0);
  assert.equal(f.run('S.sessions.at(-1).routineDayKey'), f.run('workoutDayKey(S.routine[0])'));
  assert.equal(f.run('S.nextWorkout == null'), true);
  assert.equal(f.run('JSON.parse(stored).nextWorkout == null'), true);
  assert.equal(f.run('saved'), 1);
});

test('Failed workout saving restores the plan, history and completed sets', f => {
  f.run('S.nextWorkout=plan();persistResult=false;');
  const before = f.run('JSON.stringify({plan:S.nextWorkout,sessions:S.sessions,WD})');
  f.run('saveSession();');
  assert.equal(f.run('JSON.stringify({plan:S.nextWorkout,sessions:S.sessions,WD})'), before);
  assert.equal(f.run('W.active'), true);
  assert.equal(f.run('W.saveError'), true);
  assert.equal(f.run('saved'), 0);
});

test('Saving an active snapshot after regeneration never tags an unrelated day', f => {
  f.run("S.routine=[{name:'New plan',exercises:[{id:'deadlift',sets:2,rr:'5'}]}];saveSession();");
  const index = f.run('S.sessions.at(-1).routineDayIndex');
  const key = f.run('S.sessions.at(-1).routineDayKey');
  assert.ok(index == null || index === -1 || key !== f.run('workoutDayKey(S.routine[0])'));
  assert.equal(f.run('S.sessions.at(-1).dayName'), 'Día A · Fuerza');
});

test('Date labels are friendly, localized and do not frame past plans as failure', f => {
  assert.match(f.run("nextWorkoutDateLabel('2026-10-25')"), /mañana/i);
  assert.match(f.run("nextWorkoutDateLabel('2026-10-24')"), /hoy/i);
  assert.doesNotMatch(f.run("nextWorkoutDateLabel('2026-10-23')"), /retras|perdid|incumpl|fall|deber/i);
  f.run("S.lang='en';");
  assert.match(f.run("nextWorkoutDateLabel('2026-10-25')"), /tomorrow/i);
  assert.match(f.run("nextWorkoutDateLabel('2026-10-24')"), /today/i);
  assert.doesNotMatch(f.run("nextWorkoutDateLabel('2026-10-23')"), /overdue|missed|fail|should have/i);
});

test('Spanish and English planning cards expose optional date controls', f => {
  const before = draftSnapshot(f);
  const es = f.run("renderNextWorkoutCard(S.sessions.at(-1),'summary')");
  assert.match(es, /mañana/i);
  assert.match(es, /next-workout-date-summary/);
  assert.match(es, /chooseNextWorkoutDate\('none'/);
  assert.match(es, /Día B/);
  f.run("S.lang='en';");
  const en = f.run("renderNextWorkoutCard(S.sessions.at(-1),'planner')");
  assert.match(en, /tomorrow/i);
  assert.match(en, /next-workout-date-planner/);
  assert.match(en, /chooseNextWorkoutDate\('none'/);
  assert.doesNotMatch(en, /Mañana|Elige una fecha|Sin fecha|Próxim[oa]/);
  assert.equal(draftSnapshot(f), before);
  assert.equal(f.run('persisted'), 0);
  assert.equal(f.run('permissions'), 0);
});

test('Home next-step cards appear only for a saved plan without an active draft', f => {
  assert.equal(f.run("renderNextWorkoutCard(S.sessions.at(-1),'home')"), '');
  f.run('S.nextWorkout=plan();');
  assert.equal(f.run("renderNextWorkoutCard(S.sessions.at(-1),'home')"), '');
  f.run('W.active=false;');
  assert.match(f.run("renderNextWorkoutCard(S.sessions.at(-1),'home')"), /Mañana/);
  f.run("S.lang='en';");
  const html=f.run("renderNextWorkoutCard(S.sessions.at(-1),'home')");
  assert.match(html, /Tomorrow/);
  assert.match(html, /Change date/);
  assert.doesNotMatch(html, /Cambiar fecha|Tu siguiente paso/);
});

test('Saving a first date inserts the Home card even when no previous card exists', f => {
  // Exercise the real DOM refresh helper rather than the isolated fixture stub.
  f.run(declaration('refreshNextWorkoutCards'));
  f.run(`
    W.active=false;
    const cardNodes={
      'next-workout-summary':{outerHTML:'<section id="next-workout-summary"></section>'},
      'next-workout-home-slot':{innerHTML:''},
    };
    document.getElementById=id=>cardNodes[id]||null;
  `);
  assert.equal(f.run("document.getElementById('next-workout-home')"), null);
  assert.equal(f.run("cardNodes['next-workout-home-slot'].innerHTML"), '');
  assert.equal(f.run("chooseNextWorkoutDate('tomorrow')"), true);
  const home=f.run("cardNodes['next-workout-home-slot'].innerHTML");
  assert.match(home, /id="next-workout-home"/);
  assert.match(home, /Día B/);
  assert.match(home, /Mañana/);
  assert.match(f.run("cardNodes['next-workout-summary'].outerHTML"), /Guardado: Mañana/);
  assert.equal(f.run('JSON.parse(stored).nextWorkout.date'), '2026-10-25');
  assert.equal(f.run('permissions'), 0);
});

test('Next-step cards escape routine labels rather than injecting HTML', f => {
  f.run("S.routine[1].name='<img src=x onerror=alert(1)>'; ");
  const html = f.run("renderNextWorkoutCard(S.sessions.at(-1),'summary')");
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
});

test('Untrusted duration values never become HTML in planning or Home cards', f => {
  f.run(`
    S.routine[1].estimatedMin='<img src=x onerror=alert(1)>';
    S.profile={time:'<svg onload=alert(1)>'};
    S.nextWorkout=plan();W.active=false;
  `);
  for (const location of ['summary','home']) {
    const html=f.run(`renderNextWorkoutCard(S.sessions.at(-1),'${location}')`);
    assert.doesNotMatch(html, /<img|<svg|onerror|onload/);
    assert.match(html, /40 min/);
  }
  f.run('S.routine[1].estimatedMin=-20;');
  assert.match(f.run("renderNextWorkoutCard(S.sessions.at(-1),'summary')"), /1 min/);
  f.run('S.routine[1].estimatedMin=100000;');
  assert.match(f.run("renderNextWorkoutCard(S.sessions.at(-1),'summary')"), /1440 min/);
});

test('No next-step action is produced without any saved session', f => {
  f.run('S.sessions=[];');
  const before = f.run('JSON.stringify({S,W,WD})');
  f.run("chooseNextWorkoutDate('tomorrow');");
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  assert.equal(f.run('persisted'), 0);
  assert.equal(f.run('permissions'), 0);
});

test('Manual workout focus shows at most four real exercise names', f => {
  f.run(`
    S.profile={manualRoutine:true};
    S.routine[0].desc='Rutina creada por ti';
    S.routine[0].exercises=['Sentadilla','Remo','Press','Plancha','Zancadas']
      .map((name,index)=>({id:'manual-'+index,name}));
  `);
  assert.deepEqual(f.plain('focusWorkoutParts(S.routine[0])'), ['Sentadilla','Remo','Press','Plancha']);
  assert.doesNotMatch(f.run('focusWorkoutParts(S.routine[0]).join(" · ")'), /Rutina creada por ti|Zancadas/);
});

test('Guided workout focus keeps its description-based split', f => {
  f.run(`
    S.profile={manualRoutine:false};
    S.routine[0].desc='Pecho + Espalda · Hombros, Core y Movilidad';
  `);
  assert.deepEqual(f.plain('focusWorkoutParts(S.routine[0])'), ['Pecho','Espalda','Hombros','Core']);
  f.run("S.lang='en';S.routine[0].desc='Chest and Back + Shoulders · Core, Mobility';");
  assert.deepEqual(f.plain('focusWorkoutParts(S.routine[0])'), ['Chest','Back','Shoulders','Core']);
});

test('Reading manual or guided workout focus never mutates the plan or draft', f => {
  f.run("S.profile={manualRoutine:true};S.routine[0].desc='Rutina creada por ti';");
  let before=f.run('JSON.stringify({S,W,WD})');
  f.run('focusWorkoutParts(S.routine[0]);');
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  f.run("S.profile.manualRoutine=false;S.routine[0].desc='Fuerza + Core';");
  before=f.run('JSON.stringify({S,W,WD})');
  f.run('focusWorkoutParts(S.routine[0]);');
  assert.equal(f.run('JSON.stringify({S,W,WD})'), before);
  assert.equal(f.run('persisted'), 0);
});

console.log(`\n${passed} next workout tests passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
