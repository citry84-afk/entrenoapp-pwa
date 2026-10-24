const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app.html'),'utf8');
function declaration(kind,name){const start=html.search(new RegExp(`^${kind} ${name}\\b`,'m'));assert(start>=0,name);const end=html.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);return html.slice(start,start+1+end);}
const names=['runBlock','walkBlock','genWalkRoutine','genRunRoutine','estimateExerciseSec','estimateDayMin','fitTimedToBudget','addTiming','baseSets','adaptExercise'];
const ctx=vm.createContext({console});
vm.runInContext(['TIMING','HEAVY_IDS','KB_ID'].map(x=>declaration('const',x)).concat(names.map(x=>declaration('function',x))).join('\n'),ctx);
let count=0;
for(const time of [20,40,60])for(const days of [3,4,5])for(const priority of ['run_start','run_pace','run_race','run_half','run_marathon','walk_start','walk_progress']){
  ctx.profile={time,days,priority};
  const result=vm.runInContext("profile.priority.startsWith('walk')?genWalkRoutine(profile):genRunRoutine(profile)",ctx);
  assert.equal(result.length,days);
  for(const day of result){assert(day.estimatedMin<=time,`${priority} ${day.name}: ${day.estimatedMin}>${time}`);assert(day.exercises.every(ex=>ex.durationMin>=1));count++;}
}
for(const [equipment,id,oldName,forbidden] of [['bandas','pim','Press inclinado mancuernas',/mancuerna/],['bandas','pa','Press Arnold',/arnold/],['nada','pa','Press Arnold',/arnold/],['mancuernas','ap','Aperturas polea',/polea/]]){
  ctx.ex={id,name:oldName,hint:'',rr:'8-12'};ctx.profile={equipment,time:40,experience:'intermedio'};
  const out=vm.runInContext('adaptExercise(ex,profile)',ctx);assert(!forbidden.test(out.name.toLowerCase()));assert.equal(out.equipment,equipment);
}
console.log(`PASS: ${count} walking/running days fit their budget; 4 missing equipment substitutions covered.`);
