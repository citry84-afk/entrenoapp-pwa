const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app.html'),'utf8');
function declaration(kind,name){const start=html.search(new RegExp(`^${kind} ${name}\\b`,'m'));assert(start>=0,name);const end=html.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>|\/\/ ═)/m);return html.slice(start,start+1+end);}
const ctx=vm.createContext({console});
vm.runInContext(['TIMING','CROSS_PROGRAM_WEEKS','CROSS_PROGRAM','CROSS_SCALE'].map(x=>declaration('const',x)).concat(['timeBlock','estimateExerciseSec','estimateDayMin','addTiming','crossScaleFor','crossProgramFormat','crossProgramDay','crossProgramWeek','advanceCrossProgram','genCrossRoutine'].map(x=>declaration('function',x))).join('\n')+';var S={};',ctx);
const run=code=>vm.runInContext(code,ctx);
assert.equal(run('CROSS_PROGRAM.length'),50);
assert.equal(run('CROSS_PROGRAM_WEEKS.length'),10);
for(let i=0;i<50;i++){
  const d=run(`crossProgramDay(${i})`);
  assert.equal(d.programWod,i+1);assert.equal(d.programWeek,Math.floor(i/5)+1);
  assert.equal(d.exercises.length,1);assert.equal(d.exercises[0].durationMin,15);
  assert.match(d.exercises[0].id,/^time_wod_program_/);
  assert(['AMRAP','EMOM','FOR TIME','CICLOS'].includes(d.wodFormat),d.name);
  if(d.wodFormat==='EMOM')assert.equal(d.structure.length,3,d.name);
  assert(d.structure.every(([main,sub])=>main&&sub),d.name);
}
assert.match(run('crossProgramDay(1).desc'),/5 rondas · For Time/);
assert.equal(run('crossProgramDay(2).structure[2][0]'),'Min 3: 12/10 cal Assault Bike');
assert.equal(run("crossScaleFor('40 Double Unders')"),'Saltos simples: el doble de repeticiones');
assert.equal(run("crossScaleFor('10 DB Hang Power Cleans')"),'Mancuernas más ligeras');
assert.equal(run("crossScaleFor('8 Hang Power Snatches')"),'Snatch con mancuerna a una mano, alternando');
// Routine and weekly progression
run("S={profile:{mode:'cross',priority:'cross_program',time:'20'},routine:[],curDay:3,manualToday:true};S.routine=genCrossRoutine(S.profile);");
assert.equal(run('S.routine.map(d=>d.programWod).join()'),'[1,2,3,4,5]'.slice(1,-1));
assert.equal(run('advanceCrossProgram(S.routine[3])'),false);
assert.equal(run('advanceCrossProgram(S.routine[4])'),true);
assert.equal(run('S.routine.map(d=>d.programWod).join()'),'[6,7,8,9,10]'.slice(1,-1));
assert.equal(run('S.curDay'),0);assert.equal(run('S.profile.wodWeek'),2);
run("S.profile.wodWeek=10;S.routine=genCrossRoutine(S.profile);advanceCrossProgram(S.routine[4]);");
assert.equal(run('S.routine.map(d=>d.programWod).join()'),'[1,2,3,4,5]'.slice(1,-1));
// Other cross priorities keep their routine
run("S.profile={mode:'cross',priority:'cross_beginner',time:'20',days:'3'};");
assert.equal(run('advanceCrossProgram({programWod:5,programWeek:1})'),false);
console.log('PASS: 50 program WODs over 10 weeks, EMOM minutes, scaling and weekly progression.');
