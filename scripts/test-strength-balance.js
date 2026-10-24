const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app.html'),'utf8');
function declaration(kind,name){const start=html.search(new RegExp(`^${kind} ${name}\\b`,'m'));assert(start>=0,name);const end=html.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>|\/\/ ═)/m);return html.slice(start,start+1+end);}
const fns=['estimateExerciseSec','estimateDayMin','fitToBudget','addTiming','baseSets','adaptExercise','alternatePushPull','isHingeExercise','upperPullExercises','upperBPushExercises','lowerBExercises','genStrengthRoutine'];
const ctx=vm.createContext({console});
vm.runInContext(['TIMING','HEAVY_IDS','KB_ID','DB'].map(x=>declaration('const',x)).concat(fns.map(x=>declaration('function',x))).join('\n'),ctx);
const PULL=/remo|jalón|dominada|face pull|pull-up|tracción/i, PUSH=/press|aperturas|fondos|flexion/i;
let checked=0;
for(const goal of ['musculo','fuerza','adelgazar','fitness'])for(const time of [40,60]){
  ctx.profile={goal,time:String(time),days:'4',equipment:'gym',experience:'intermedio'};
  const days=vm.runInContext('genStrengthRoutine(profile)',ctx);
  for(const day of days.filter(d=>/Upper/.test(d.name))){
    const names=day.exercises.map(e=>e.name);
    assert(names.some(n=>PULL.test(n)),`${goal} ${time} ${day.name} sin tirón: ${names}`);
    assert(names.some(n=>PUSH.test(n)),`${goal} ${time} ${day.name} sin empuje: ${names}`);
    assert(!names.some(n=>/^peso muerto$/i.test(n)),`${goal} ${time} ${day.name} con peso muerto: ${names}`);
    const pulls=names.filter(n=>PULL.test(n)).length;assert(pulls>=2,`${goal} ${time} ${day.name} solo ${pulls} tirón: ${names}`);
    checked++;
  }
  const lowerB=days.find(d=>/Lower B/.test(d.name));
  assert(lowerB.exercises.some(e=>/peso muerto/i.test(e.name)),`${goal} ${time} Lower B sin peso muerto: ${lowerB.exercises.map(e=>e.name)}`);
  assert.equal(lowerB.exercises.filter(e=>/peso muerto/i.test(e.name)).length,1);
}
console.log(`PASS: ${checked} upper days mix push and pull; every Lower B includes one deadlift variant.`);
