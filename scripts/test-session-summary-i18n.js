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

function fixture() {
  const context = vm.createContext({ console, Date, Math, Number, Map });
  vm.runInContext([
    'escHtml', 'workoutFeelingLabel', 'sessionPrDisplay', 'sessionAchievementLabel',
    'sessionSummaryIndex', 'sessionAdvice', 'sessionMotivation', 'sessionComparison',
    'dailyFinishField', 'dailyFinishFeel', 'openFinishWorkout', 'dailySummaryCounts', 'dailySummaryOptionalOpen', 'dailySummaryMarkup', 'reviewPromptEligible', 'reviewPromptHtml',
    'dismissReviewPromptAt', 'dismissReviewPrompt', 'showSessionSummary',
    'showVitalSessionSummary', 'setSessionRecoveryFeelAt', 'setSessionRecoveryFeel',
  ].map(declaration).join('\n'), context, { filename: 'app-session-summary-functions.js' });
  vm.runInContext(`
    const sheet={innerHTML:'',className:'summary-sheet finish-workout-sheet',scrollTop:9};
    const modal={shown:false,classList:{add(){modal.shown=true;}}};
    const finishDetails={open:false},summaryDetails={open:false};
    const document={getElementById(id){if(id==='summary-sheet')return sheet;if(id==='summary-modal')return modal;if(id==='daily-finish-optional')return sheet.innerHTML.includes('id="daily-finish-optional"')?finishDetails:null;if(id==='daily-summary-details')return sheet.innerHTML.includes('id="daily-summary-details"')?summaryDetails:null;return null;}};
    let S={lang:'es',profile:{priority:'musculo'},routine:[{name:'My own workout'}],curDay:0,sessions:[]};
    let W={feel:'normal',bw:'',notes:''};
    let stats={done:1,total:3,pct:33,volume:80,reps:8,activeMin:0,distanceKm:0};
    let notices=[],events=[],persistCalls=0,draftCalls=0,native=false;
    const storage=new Map();
    const localStorage={getItem(key){return storage.get(key)||null;},setItem(key,value){storage.set(key,String(value));},removeItem(key){storage.delete(key);}};
    function currentLang(){return S.lang;}
    function lt(value){return value==='Hoy'?'Today':value;}
    function todayDay(day){return day;}
    function liveWorkoutMetrics(){return stats;}
    function workoutClockLabel(){return '00:42';}
    function workoutVolumeLabel(value){return value+' kg';}
    function renderNextWorkoutCard(){return '<section>Next step</section>';}
    function isNativeNotificationsAvailable(){return native;}
    function reminderState(){return {enabled:false};}
    function sessionSummary(session){return session.summary||{sets:0,volume:0,pct:0};}
    function calcSessionStats(){return stats;}
    function persist(){persistCalls++;return true;}
    function saveWorkoutDraft(){draftCalls++;}
    function toast(message){notices.push(message);}
    function track(name,data){events.push({name,data});}
    function session(extra={}){return {id:101,dayName:'My own workout',durationMin:12,feel:'normal',recoveryFeel:null,mode:'normal',exercises:[],prs:[],...extra};}
    function useSession(extra={}){const value=session(extra);S.sessions=[value];return value;}
  `, context, { filename: 'session-summary-stubs.js' });
  return context;
}

let passed = 0, failed = 0;
function test(name, callback) {
  const context = fixture();
  const run = code => vm.runInContext(code, context);
  try { callback(run); passed++; console.log(`✓ ${name}`); }
  catch (error) { failed++; console.error(`✗ ${name}\n  ${error.stack}`); }
}

test('Feeling labels translate independently from their stable saved values', run => {
  assert.equal(run("workoutFeelingLabel('muy_flojo')"), 'Muy flojo');
  run("S.lang='en'");
  assert.equal(run("workoutFeelingLabel('muy_flojo')"), 'Very low energy');
  assert.equal(run("workoutFeelingLabel('bien',{emoji:true})"), '💪 Good');
  assert.equal(run("workoutFeelingLabel('flojo',{vital:true})"), 'It was difficult');
  assert.equal(run("workoutFeelingLabel('missing')"), 'Okay');
});

test('Finish sheet presents the complete and partial actions in English', run => {
  run("S.lang='en';openFinishWorkout()");
  assert.match(run('sheet.innerHTML'), /Finish workout/);
  assert.match(run('sheet.innerHTML'), /Save partial workout/);
  assert.match(run('sheet.innerHTML'), /placeholder="75\.5 kg"/);
  run('stats.done=3;stats.pct=100;openFinishWorkout()');
  assert.match(run('sheet.innerHTML'), /Save completed workout/);
  assert.doesNotMatch(run('sheet.innerHTML'), /Save partial workout/);
});

test('Finish feeling controls expose translated accessible names and selected state', run => {
  run("S.lang='en';W.feel='bien';openFinishWorkout()");
  const html = run('sheet.innerHTML');
  assert.match(html, /role="group" aria-labelledby="finish-feeling-label"/);
  assert.match(html, /aria-label="Good" aria-pressed="true"/);
  assert.match(html, /aria-label="Low energy" aria-pressed="false"/);
  assert.equal((html.match(/class="finish-feel /g)||[]).length, 5);
  assert.doesNotMatch(html, /aria-label="(?:muy_|flojo|bien)/);
});

test('Finish sheet escapes custom names and notes without translating them', run => {
  run(`S.lang='en';S.routine[0].name='Hoy <img src=x onerror=alert(1)>';W.notes='</textarea><img src=x>';W.bw='" autofocus="yes';openFinishWorkout()`);
  const html = run('sheet.innerHTML');
  assert.match(html, /Hoy &lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;\/textarea&gt;&lt;img src=x&gt;/);
  assert.match(html, /value="&quot; autofocus=&quot;yes"/);
  assert.doesNotMatch(html, /<img/);
  assert.doesNotMatch(html, /Today &lt;img/);
});

test('Finish sheet preserves Spanish, form values and the workout draft', run => {
  run("W.bw='73.5';W.notes='Con calma';W.feel='flojo'");
  const before = run('JSON.stringify({S,W})');
  run('openFinishWorkout()');
  assert.match(run('sheet.innerHTML'), /Guardar sesión parcial/);
  assert.match(run('sheet.innerHTML'), /aria-label="Flojo" aria-pressed="true"/);
  assert.match(run('sheet.innerHTML'), /placeholder="75,5 kg"/);
  assert.equal(run('JSON.stringify({S,W})'), before);
});

test('Finish prioritizes saving before a closed native optional disclosure', run => {
  run('openFinishWorkout()');
  const html = run('sheet.innerHTML');
  assert.ok(html.indexOf('onclick="finishWorkoutFromSheet()"') < html.indexOf('<details'));
  assert.match(html, /<details id="daily-finish-optional" class="daily-finish-optional" >/);
  assert.match(html, /<summary>Sensación, peso o nota · opcional<\/summary>/);
  assert.match(html, /<label for="daily-finish-weight">/);
  assert.match(html, /<label for="daily-finish-notes">/);
  assert.doesNotMatch(html, /required/);
  run("S.lang='en';openFinishWorkout()");
  assert.match(run('sheet.innerHTML'), /remaining sets will not count as completed/);
});

test('Finish field edits autosave only allowed fields and preserve them through reopen', run => {
  run("dailyFinishField('bw','72.5');dailyFinishField('notes','Una nota <literal>');dailyFinishField('active',false);openFinishWorkout();openFinishWorkout()");
  assert.equal(run('W.bw'), '72.5');
  assert.equal(run('W.notes'), 'Una nota <literal>');
  assert.equal(run('W.active'), undefined);
  assert.equal(run('draftCalls'), 2);
  assert.match(run('sheet.innerHTML'), /value="72\.5"/);
  assert.match(run('sheet.innerHTML'), /Una nota &lt;literal&gt;/);
});

test('Changing feeling keeps optional controls open and does not lose weight or note', run => {
  run("W.bw='70';W.notes='Con calma';openFinishWorkout();finishDetails.open=true;sheet.scrollTop=215;dailyFinishFeel('bien')");
  assert.equal(run('W.feel'), 'bien');
  assert.equal(run('W.bw'), '70');
  assert.equal(run('W.notes'), 'Con calma');
  assert.match(run('sheet.innerHTML'), /class="daily-finish-optional" open/);
  assert.match(run('sheet.innerHTML'), /aria-label="Bien" aria-pressed="true"/);
  assert.equal(run('sheet.scrollTop'), 215);
  assert.equal(run('draftCalls'), 1);
  run("dailyFinishFeel('bad')");
  assert.equal(run('draftCalls'), 1);
  assert.equal(run('W.feel'), 'bien');
});

for (const [type, text, expected] of [
  ['peso', 'Nuevo peso máximo: 82.5 kg antes 80 kg.', 'New maximum weight: 82.5 kg (previously 80 kg).'],
  ['peso', 'Nuevo peso máximo: 20 kg.', 'New maximum weight: 20 kg.'],
  ['serie', 'Mejor serie: 30 kg × 12.', 'Best set: 30 kg × 12.'],
  ['volumen', 'Más volumen que tu mejor registro: 1440 kg movidos.', 'More volume than your previous best: 1440 kg lifted.'],
  ['reps', 'Más repeticiones totales: 36 reps.', 'More total repetitions: 36 reps.'],
]) {
  test(`Legacy ${type} personal best is presented in EN without changing the record`, run => {
    run(`S.lang='en';const record=${JSON.stringify({type,text})};const before=JSON.stringify(record);`);
    assert.equal(run('sessionPrDisplay(record)'), expected);
    assert.equal(run('JSON.stringify(record)'), run('before'));
    run("S.lang='es'");
    assert.equal(run('sessionPrDisplay(record)'), text);
  });
}

test('Unrecognized personal-best text uses a truthful fallback without invented values', run => {
  run("S.lang='en'");
  assert.equal(run("sessionPrDisplay({type:'peso',text:'unexpected 999 kg'})"), 'Personal best saved. Check your workout history for the recorded sets.');
  assert.doesNotMatch(run("sessionPrDisplay({type:'peso',text:'unexpected 999 kg'})"), /999/);
});

test('Known achievements translate by ID and custom labels remain literal', run => {
  run("S.lang='en'");
  assert.equal(run("sessionAchievementLabel({id:'first',label:'Primera sesión'})"), 'First workout');
  assert.equal(run("sessionAchievementLabel({id:'custom',label:'Mi nombre'})"), 'Mi nombre');
});

for (const [label, sessionValues, percentage, expected] of [
  ['personal best', {prs:[{type:'peso'}]}, 100, 'Progress recorded'],
  ['complete normal', {feel:'bien'}, 100, 'Great workout'],
  ['express', {mode:'express'}, 80, 'You made your time count'],
  ['gentle', {mode:'suave'}, 100, 'A good decision to adapt'],
  ['short gentle', {mode:'express_suave'}, 100, 'A good decision to adapt'],
  ['low energy', {feel:'flojo'}, 70, 'A good decision to adapt'],
  ['partial', {}, 30, 'A partial workout still counts'],
  ['steady', {}, 70, 'Good work'],
]) {
  test(`Advice translates the ${label} branch`, run => {
    run(`S.lang='en';const item=session(${JSON.stringify(sessionValues)});stats.pct=${percentage}`);
    assert.equal(run('sessionAdvice(item,stats).title'), expected);
    run("S.lang='es'");
    assert.notEqual(run('sessionAdvice(item,stats).title'), expected);
  });
}

test('All motivation branches return English copy', run => {
  run("S.lang='en'");
  assert.match(run("sessionMotivation(session({prs:[{}]}),stats).title"), /clear sign of progress/);
  assert.match(run('sessionMotivation(session(),{pct:100}).title'), /Workout done/);
  assert.match(run('sessionMotivation(session(),{pct:70}).title'), /workout that counts/);
  assert.match(run('sessionMotivation(session(),{pct:30}).title'), /deserves credit/);
});

test('Comparison handles first reference, improvements and English singular plurals', run => {
  run("S.lang='en';const current=useSession()");
  assert.equal(run('sessionComparison(current,stats).title'), 'Your first reference is saved');
  run("S.sessions.unshift(session({id:100,summary:{sets:0,volume:80,pct:32}}))");
  assert.match(run('sessionComparison(current,stats).text'), /1 more set · 1 percentage point more completed/);
  run('stats.done=2;stats.pct=35');
  assert.match(run('sessionComparison(current,stats).text'), /2 more sets · 3 percentage points more completed/);
});

test('Comparison translates volume, stable and adapted results without mutating sessions', run => {
  run("S.lang='en';const current=useSession();S.sessions.unshift(session({id:100,summary:{sets:1,volume:60,pct:33}}));const before=JSON.stringify(S.sessions)");
  assert.match(run('sessionComparison(current,stats).text'), /20 kg more volume/);
  run('stats.volume=60');
  assert.equal(run('sessionComparison(current,stats).title'), 'You maintained your progress');
  run('stats.pct=20');
  assert.equal(run('sessionComparison(current,stats).title'), 'Today called for adapting');
  assert.equal(run('JSON.stringify(S.sessions)'), run('before'));
});

test('Standard summary is fully English after a direct render, not only navigation', run => {
  run("S.lang='en';native=true;showSessionSummary(useSession(),stats,[{id:'first',label:'Primera sesión'}])");
  const html = run('sheet.innerHTML');
  for (const text of ['Partial workout saved','Duration','Sets completed','Completed','kg lifted','First workout','How do you feel after the workout?','Set up reminders','Back to Today','View progress','Details and next workout · optional']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /Sesión parcial guardada|Series hechas|¿Cómo te ha sentado\?|Ver progreso|Primera sesión/);
  assert.equal(run('sheet.className'), 'summary-sheet daily-summary');
  assert.equal(run('modal.shown'), true);
});

test('Saved summary leads with one accurate result and one exit before closed details', run => {
  run("S.lang='en';stats.done=1;stats.total=9;stats.pct=100;showSessionSummary(useSession(),stats,[{id:'first'}])");
  const html = run('sheet.innerHTML'), lead = html.slice(0, html.indexOf('<details'));
  assert.match(lead, /Partial workout saved/);
  assert.match(lead, /1 of 9 sets completed/);
  assert.doesNotMatch(lead, /Completed workout saved|100%|9\/9|Personal best|Next step|First workout|adjust your next suggestion/);
  assert.equal((lead.match(/<button /g)||[]).length, 1);
  assert.match(lead, /Back to Today/);
  assert.match(html, /class="daily-summary-details" ontoggle="dailySummaryOptionalOpen\(this,0\)" >/);
  assert.match(html, /11%/);
  assert.ok(html.indexOf('Next step') > html.indexOf('<details'));
  assert.ok(html.indexOf('How do you feel after the workout?') > html.indexOf('<details'));
});

test('Completion confirmation follows counts rather than a rounded percentage', run => {
  run("S.lang='en';const current=useSession();stats.done=8;stats.total=9;stats.pct=100;showSessionSummary(current,stats)");
  assert.match(run('sheet.innerHTML'), /Partial workout saved/);
  assert.match(run('sheet.innerHTML'), /8 of 9 sets completed/);
  run('stats.done=9;stats.pct=10;showSessionSummary(current,stats)');
  assert.match(run('sheet.innerHTML'), /Completed workout saved/);
  assert.match(run('sheet.innerHTML'), /9 of 9 sets completed/);
  run('stats.done=0;stats.total=0;stats.pct=100;showSessionSummary(current,stats)');
  assert.match(run('sheet.innerHTML'), /Partial workout saved/);
  assert.doesNotMatch(run('sheet.innerHTML'), /Completed workout saved/);
});

test('Summary optional details stay open after recovery feedback rerenders', run => {
  run("S.lang='en';const current=useSession();showSessionSummary(current,stats);summaryDetails.open=true;setSessionRecoveryFeelAt(0,'bien')");
  assert.match(run('sheet.innerHTML'), /class="daily-summary-details" ontoggle="dailySummaryOptionalOpen\(this,0\)" open/);
  assert.match(run('sheet.innerHTML'), /aria-label="Good" aria-pressed="true"/);
  assert.equal(run('persistCalls'), 1);
});

test('Saved note stays literal inside optional detail, not in the short result', run => {
  run(`const current=useSession({notes:'<img src=x> & descanso'});showSessionSummary(current,stats)`);
  const html = run('sheet.innerHTML'), lead = html.slice(0, html.indexOf('<details'));
  assert.doesNotMatch(lead, /descanso/);
  assert.match(html, /&lt;img src=x&gt; &amp; descanso/);
  assert.doesNotMatch(html, /<img/);
});

test('Standard summary switches ES to EN to ES without changing persisted content', run => {
  run("const current=useSession({dayName:'Hoy',prs:[{type:'peso',exercise:'Mi ejercicio',text:'Nuevo peso máximo: 40 kg antes 35 kg.'}]});const before=JSON.stringify(current);showSessionSummary(current,stats)");
  assert.match(run('sheet.innerHTML'), /Sesión parcial guardada/);
  run("S.lang='en';showSessionSummary(current,stats)");
  assert.match(run('sheet.innerHTML'), /Hoy · 😐 Okay/);
  assert.match(run('sheet.innerHTML'), /New maximum weight: 40 kg \(previously 35 kg\)/);
  run("S.lang='es';showSessionSummary(current,stats)");
  assert.match(run('sheet.innerHTML'), /Nuevo peso máximo: 40 kg antes 35 kg/);
  assert.equal(run('JSON.stringify(current)'), run('before'));
});

test('Summary escapes custom day, PR exercise, text and achievement labels', run => {
  run(`const current=useSession({dayName:'<img src=x>',prs:[{type:'custom',exercise:'<script>evil()</script>',text:'<img src=y>'}]});showSessionSummary(current,stats,[{id:'custom',label:'<img src=z>'}])`);
  const html = run('sheet.innerHTML');
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /&lt;script&gt;evil\(\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=y&gt;/);
  assert.match(html, /&lt;img src=z&gt;/);
  assert.doesNotMatch(html, /<img|<script/);
});

test('Summary metric variants translate distance, active minutes and reps', run => {
  run("S.lang='en';const current=useSession();stats.distanceKm=1.25;showSessionSummary(current,stats)");
  assert.match(run('sheet.innerHTML'), /1\.25 km/);
  assert.match(run('sheet.innerHTML'), />distance</);
  run('stats.distanceKm=0;stats.volume=0;stats.activeMin=7;showSessionSummary(current,stats)');
  assert.match(run('sheet.innerHTML'), />active minutes</);
  run('stats.activeMin=0;showSessionSummary(current,stats)');
  assert.match(run('sheet.innerHTML'), />reps</);
});

test('Recovery controls use safe indexes rather than interpolating imported session IDs', run => {
  run(`S.lang='en';const current=useSession({id:'101);alert("unsafe")//'});showSessionSummary(current,stats)`);
  const html = run('sheet.innerHTML');
  assert.match(html, /onclick="setSessionRecoveryFeelAt\(0,'bien'\)"/);
  assert.doesNotMatch(html, /unsafe|alert/);
  assert.match(html, /aria-label="Good" aria-pressed="false"/);
});

test('Recovery feedback rerenders English and selected state with legacy string IDs', run => {
  run("S.lang='en';const current=useSession({id:'legacy-uuid'});setSessionRecoveryFeelAt(0,'muy_bien')");
  assert.equal(run('current.feel'), 'muy_bien');
  assert.equal(run('current.recoveryFeel'), 'muy_bien');
  assert.match(run('sheet.innerHTML'), /aria-label="Very good" aria-pressed="true"/);
  assert.equal(run('notices.at(-1)'), 'Thank you. We will adjust your next suggestion.');
  assert.equal(run('persistCalls'), 1);
  run("setSessionRecoveryFeel('legacy-uuid','normal')");
  assert.equal(run('current.feel'), 'normal');
});

test('Invalid recovery indexes or values are ignored', run => {
  run("const current=useSession();const before=JSON.stringify(current);setSessionRecoveryFeelAt(-1,'bien');setSessionRecoveryFeelAt(0.5,'bien');setSessionRecoveryFeelAt(9,'bien');setSessionRecoveryFeelAt(0,'bad');");
  assert.equal(run('JSON.stringify(current)'), run('before'));
  assert.equal(run('persistCalls'), 0);
});

test('Vital partial summary translates the one-step state and preserves measured progress', run => {
  run("S.lang='en';S.profile.priority='vital';const current=useSession({feel:'flojo'});showSessionSummary(current,stats)");
  const html = run('sheet.innerHTML');
  for (const text of ['Partial workout saved','It was difficult','1 step marked','For next time','Remember','Back to Today','View progress']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /pasos marcados|Ver progreso|Sesión parcial guardada/);
  assert.equal(run('stats.done'), 1);
});

test('Vital complete, multiple-step and zero-step states have accurate translated copy', run => {
  run("S.lang='en';stats.done=3;showVitalSessionSummary(useSession(),stats)");
  assert.match(run('sheet.innerHTML'), /Completed workout saved/);
  assert.match(run('sheet.innerHTML'), /3 steps marked/);
  run('stats.done=0;stats.total=0;showVitalSessionSummary(S.sessions[0],stats)');
  assert.match(run('sheet.innerHTML'), /Partial workout saved/);
  assert.doesNotMatch(run('sheet.innerHTML'), /Completed workout saved/);
});

test('Review invitation keeps eligibility rules and safe callbacks for imported IDs', run => {
  run(`S.lang='en';const current=useSession({id:'" ); alert(1)//',feel:'bien'});S.sessions.unshift(session({id:1}),session({id:2}));stats.pct=100;showSessionSummary(current,stats)`);
  assert.doesNotMatch(run('sheet.innerHTML'), /Rate EntrenoApp/);
  assert.equal(run('events.filter(event=>event.name==="review_prompt_shown").length'), 0);
  run('summaryDetails.open=true;showSessionSummary(current,stats)');
  assert.match(run('sheet.innerHTML'), /Rate EntrenoApp/);
  assert.match(run('sheet.innerHTML'), /onclick="dismissReviewPromptAt\(2\)"/);
  assert.doesNotMatch(run('sheet.innerHTML'), /alert\(1\)/);
  assert.equal(run('events.filter(event=>event.name==="review_prompt_shown").length'), 1);
  run('showSessionSummary(current,stats)');
  assert.equal(run('events.filter(event=>event.name==="review_prompt_shown").length'), 1);
});

test('Dismissing review by index supports legacy IDs and leaves the summary in English', run => {
  run("S.lang='en';const current=useSession({id:'legacy-review',feel:'bien'});storage.set('ea_review_prompt_session',current.id);dismissReviewPromptAt(0)");
  assert.match(run('sheet.innerHTML'), /Partial workout saved/);
  assert.doesNotMatch(run('sheet.innerHTML'), /Rate EntrenoApp/);
  assert.equal(run('storage.has("ea_review_prompt_session")'), false);
  assert.equal(run('events.at(-1).data.session_id'), 'legacy-review');
  assert.ok(run('Number(storage.get("ea_review_snooze_until"))>Date.now()'));
});

test('Opening optional detail invites review only when visible and uses a safe session index', run => {
  run("S.lang='en';const current=useSession({feel:'bien'});S.sessions.unshift(session({id:1}),session({id:2}));stats.pct=100;const slot={innerHTML:''};const detail={open:false,querySelector(){return slot;}};dailySummaryOptionalOpen(detail,2)");
  assert.equal(run('slot.innerHTML'), '');
  assert.equal(run('events.length'), 0);
  run('detail.open=true;dailySummaryOptionalOpen(detail,2)');
  assert.match(run('slot.innerHTML'), /Rate EntrenoApp/);
  assert.match(run('slot.innerHTML'), /dismissReviewPromptAt\(2\)/);
  assert.equal(run('events.filter(event=>event.name==="review_prompt_shown").length'), 1);
  run('dailySummaryOptionalOpen(detail,-1);dailySummaryOptionalOpen(detail,0.5);dailySummaryOptionalOpen(detail,99);dailySummaryOptionalOpen(detail,2)');
  assert.equal(run('events.filter(event=>event.name==="review_prompt_shown").length'), 1);
});

console.log(`\n${passed} session-summary/i18n checks passed${failed?`, ${failed} failed`:''}.`);
if (failed) process.exitCode = 1;
