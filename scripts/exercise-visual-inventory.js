#!/usr/bin/env node
'use strict';

// Read-only catalogue inspection. Executes only extracted pure app functions in a VM.
// No hydration, localStorage, real profile, browser, network, or filesystem writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const inputs={app:'app.html',muscles:'assets/js/exercise-muscles.js',media:'assets/js/exercise-media.js'};
const sources=Object.fromEntries(Object.entries(inputs).map(([key,file])=>[key,fs.readFileSync(path.join(root,file),'utf8')]));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
function declaration(kind,name){
  const start=sources.app.search(new RegExp(`^${kind} ${name}\\b`,'m'));
  assert.notEqual(start,-1,`Missing app declaration: ${name}`);
  const end=sources.app.slice(start+1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return sources.app.slice(start,end<0?sources.app.length:start+1+end);
}
function location(name){const match=sources.app.search(new RegExp(`^(?:const|function) ${name}\\b`,'m'));return {file:'app.html',line:sources.app.slice(0,match).split('\n').length};}
const constants=['DB','ALT','ALT_EXTRA','SMART_ALT','TIMING','HEAVY_IDS','KB_ID'];
const functions=['normalizeProfile','genRoutine','vitalEx','starterEx','vitalVariant','genVitalRoutine','genStarterRoutine',
  'genStrengthRoutine','runBlock','walkBlock','timeBlock','stationBlock','wodDay','genCrossRoutine',
  'hyroxStation','hyroxStations','genHyroxRoutine','genWalkRoutine','genRunRoutine','genHybridRoutine',
  'baseSets','adaptExercise','estimateExerciseSec','estimateDayMin','fitToBudget','fitTimedToBudget','addTiming',
  'dateKey','alternativesFor','selectedAlt','exerciseVariantName','exerciseHistoryEquipment','workoutExerciseReference',
  'vitalFriendlyCopy','displayExerciseName','isTimedExercise'];
const context=vm.createContext({});
vm.runInContext(`const W={alt:{}};function currentLang(){return 'es';}`,context);
vm.runInContext([...constants.map(name=>declaration('const',name)),...functions.map(name=>declaration('function',name))].join('\n'),context);
vm.runInContext(sources.muscles+'\n'+sources.media,context);
// Introspection clones expose local declaration tables, without changing production functions.
vm.runInContext(declaration('function','adaptExercise').replace('function adaptExercise(','function inventoryAdaptMaps(').replace('  const repByEq=','  return maps;\n  const repByEq='),context);
vm.runInContext(declaration('function','wodDay').replace('function wodDay(','function inventoryWodTemplates(').replace('  const wod={','  return templates;\n  const wod={'),context);
const run=code=>vm.runInContext(code,context,{timeout:30000});
const plain=code=>JSON.parse(JSON.stringify(run(code)));
const norm=value=>String(value??'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('es');
const variants=new Map();
const seedRecords=new Map();
const scenarios={};
const equipment=['gym','mancuernas','kettlebell','bandas','nada'];
function add(ex,source,profileEquipment=null,alternative=null,availability='reachable'){
  assert.ok(ex&&ex.id&&ex.name,`Incomplete exercise from ${source}`);
  context.inventoryExercise=ex;
  context.inventoryAlternative=alternative;
  run('W.alt={};if(inventoryAlternative)W.alt[inventoryExercise.id]=inventoryAlternative.id;');
  const reference=plain('workoutExerciseReference(inventoryExercise)');
  const key=JSON.stringify([reference.id,norm(reference.name),reference.equipment||'']);
  let item=variants.get(key);
  if(!item){
    context.inventoryReference=reference;
    const profile=plain('exerciseMuscleProfile(inventoryReference)');
    const media=profile?plain(`EXERCISE_MEDIA.pairs.find(pair=>pair.key===${JSON.stringify(profile.key)})||null`):null;
    const files=(media?.files||[]).map(file=>'assets/exercise-media/'+file);
    item={key:hash(key).slice(0,16),id:reference.id,name:reference.name,equipment:reference.equipment||'',types:new Set(),rawForms:new Map(),sources:new Set(),profileEquipment:new Set(),hints:new Set(),availability:new Set(),displayNames:new Set(),
      coverage:{muscleProfile:profile?.key||null,muscleMap:!!profile,referencePair:!!media,mediaFiles:files,missingMediaFiles:files.filter(file=>!fs.existsSync(path.join(root,file)))}};
    variants.set(key,item);
  }
  item.types.add(reference.type||'strength');item.sources.add(source);item.availability.add(availability);
  if(profileEquipment)item.profileEquipment.add(profileEquipment);
  if(reference.hint)item.hints.add(reference.hint);
  context.inventoryReference=reference;item.displayNames.add(run('displayExerciseName(inventoryReference)'));
  const raw={id:ex.id,name:ex.name,equipment:ex.equipment||'',type:ex.type||'strength',alternative:alternative?{id:alternative.id,name:alternative.name}:null};
  item.rawForms.set(JSON.stringify(raw),raw);
  if(!alternative&&availability==='reachable')seedRecords.set(JSON.stringify([ex.id,ex.name,ex.equipment||'',ex.type||'strength']),{ex,source,profileEquipment});
}
function routine(days,source,eq){scenarios[source]=(scenarios[source]||0)+1;for(const day of days)for(const ex of day.exercises||[])add(ex,source,eq);}
const db=plain('DB');
for(const [goal,groups] of Object.entries(db.gym))for(const [group,rows] of Object.entries(groups))for(const ex of rows){
  add(ex,`DB.gym.${goal}.${group}`,'gym');
  for(const eq of equipment){context.inventoryExercise=ex;context.inventoryProfile={equipment:eq,goal,experience:'intermedio',time:60,days:5};add(plain('adaptExercise(inventoryExercise,inventoryProfile)'),`adaptExercise:${goal}.${group}`,eq);}
}
// Include every declared material mapping, even if a future seed uses an ID absent from DB today.
const maps=plain('inventoryAdaptMaps()');
const mappedOnly=[];
for(const [eq,table] of Object.entries(maps))for(const [id,mapping] of Object.entries(table)){
  const original=[...seedRecords.values()].find(item=>item.ex.id===id&&item.profileEquipment==='gym');
  if(!original){
    const seed={id,name:id,hint:'',sets:1,rr:'8-12',rest:60};context.inventoryExercise=seed;context.inventoryProfile={equipment:eq,goal:'fitness',experience:'intermedio',time:60};
    add(plain('adaptExercise(inventoryExercise,inventoryProfile)'),`adaptExercise:declared-map:${id}`,eq,null,'declared-map-only');mappedOnly.push({id,equipment:eq,name:mapping[0]});
  }
}
for(const eq of equipment){
  context.inventoryProfile={equipment:eq,goal:'vital',priority:'vital',experience:'principiante',days:4,time:60};
  routine(plain('genVitalRoutine(inventoryProfile)'),'genVitalRoutine',eq);
  routine(plain('hyroxStations(inventoryProfile).map(ex=>({exercises:[ex]}))'),'hyroxStations',eq);
  for(const priority of ['hyrox_start','hyrox_race']){
    context.inventoryProfile={equipment:eq,priority,days:5,time:60};routine(plain('genHyroxRoutine(inventoryProfile)'),`genHyroxRoutine:${priority}`,eq);
  }
}
context.inventoryProfile={equipment:'nada',audience:'starter',experience:'principiante',days:3,time:60};
routine(plain('genStarterRoutine(inventoryProfile)'),'genStarterRoutine','nada');
for(const priority of ['walk_start','walk_progress','run_start','run_pace','run_race','run_half','run_marathon']){
  context.inventoryProfile={equipment:'nada',priority,days:5,time:60};
  routine(plain(`${priority.startsWith('walk')?'genWalkRoutine':'genRunRoutine'}(inventoryProfile)`),`${priority.startsWith('walk')?'genWalkRoutine':'genRunRoutine'}:${priority}`,'nada');
}
const wodTemplates=plain('inventoryWodTemplates(new Date("2026-10-24T12:00:00.000Z"))');
for(const day of wodTemplates)routine([day],`wodDay:${day.name}`,null);
// Replaying a fixed date avoids a date-sensitive inventory. All six WODs are separately captured above.
run('const InventoryDate=Date;Date=class extends InventoryDate{constructor(...args){super(...(args.length?args:["2026-10-24T12:00:00.000Z"]));}static now(){return 1792843200000;}};');
for(const eq of equipment){
  context.inventoryProfile={equipment:eq,priority:'cross_wod',days:5,time:60};routine(plain('genCrossRoutine(inventoryProfile)'),'genCrossRoutine',eq);
  for(const priority of ['hybrid_muscle','hybrid_balanced','hybrid_event']){
    context.inventoryProfile={equipment:eq,priority,goal:'fitness',experience:'intermedio',days:5,time:60};routine(plain('genHybridRoutine(inventoryProfile)'),`genHybridRoutine:${priority}`,eq);
  }
}
// Exercise alternatives are applied exactly as the app applies them, including inferred/unknown material.
for(const {ex,source,profileEquipment} of [...seedRecords.values()]){
  context.inventoryExercise=ex;run('W.alt={};');
  for(const alt of plain('alternativesFor(inventoryExercise)').filter(alt=>alt.id!==ex.id))add(ex,`alternativesFor:${source}`,profileEquipment,alt);
}
const alternateDeclarations=plain('({ALT,ALT_EXTRA,SMART_ALT})');
const usedAlternates=new Set([...variants.values()].flatMap(item=>[...item.rawForms.values()].filter(raw=>raw.alternative).map(raw=>JSON.stringify([raw.alternative.id,raw.alternative.name]))));
const extraOnly=Object.entries(alternateDeclarations.ALT_EXTRA).filter(([id,name])=>!usedAlternates.has(JSON.stringify([id,name]))).map(([id,name])=>({id,name,source:'ALT_EXTRA',status:'label declaration only; not an independent selectable record'}));
function sorted(set){return [...set].sort((a,b)=>String(a).localeCompare(String(b),'es'));}
const records=[...variants.values()].map(item=>({...item,types:sorted(item.types),rawForms:[...item.rawForms.values()],sources:sorted(item.sources),profileEquipment:sorted(item.profileEquipment),hints:sorted(item.hints),availability:sorted(item.availability),displayNames:sorted(item.displayNames)})).sort((a,b)=>(a.equipment||'unknown').localeCompare(b.equipment||'unknown')||a.name.localeCompare(b.name,'es')||a.id.localeCompare(b.id));
function totals(list){return {variants:list.length,withReferencePair:list.filter(item=>item.coverage.referencePair).length,mapOnly:list.filter(item=>item.coverage.muscleMap&&!item.coverage.referencePair).length,noReviewedVisual:list.filter(item=>!item.coverage.muscleMap).length};}
const byEquipment=Object.fromEntries(sorted(new Set(records.map(item=>item.equipment||'unknown'))).map(eq=>[eq,totals(records.filter(item=>(item.equipment||'unknown')===eq))]));
const byType=Object.fromEntries(sorted(new Set(records.flatMap(item=>item.types))).map(type=>[type,totals(records.filter(item=>item.types.includes(type)))]));
const result={schemaVersion:1,asOf:'2026-10-24',scope:'Finite built-in catalogue and all material/alternative variants; no user data.',sourceFiles:Object.fromEntries(Object.entries(inputs).map(([key,file])=>[file,{sha256:hash(sources[key])}])),
  identity:['actual reference id','NFC lowercase/whitespace-normalized actual reference name','actual reference equipment (empty stays unknown)'],
  generationSources:Object.fromEntries([...constants,...functions].map(name=>[name,location(name)])),
  dimensions:{equipment,dbGoals:Object.keys(db.gym),days:[3,4,5],timeMinutes:[20,40,60],experience:['principiante','intermedio','avanzado'],note:'All DB/adapt mappings are enumerated directly, independent of budget filtering. Generator families are exercised at five days/60 min (vital four, starter three); all WOD templates and Hyrox stations are enumerated before filtering. Time/experience alter prescriptions/hints, not variant identity.'},
  summary:{...totals(records),reachableVariants:records.filter(item=>item.availability.includes('reachable')).length,declaredMapOnly:mappedOnly.length,uniqueReferencePairs:new Set(records.filter(item=>item.coverage.referencePair).map(item=>item.coverage.muscleProfile)).size,byEquipment,byType},
  limitations:['Manual exercise names and imported personal routines are unbounded and intentionally not read.','A time/WOD block may contain several movements in its instructions; it is one actual app record, not a fictitious single movement. Raw WOD structure is retained separately.','Material is resolved by the real workoutExerciseReference/exerciseHistoryEquipment code; no missing material is invented.','A reviewed muscle map is not an exercise demonstration. Exact media coverage requires its actual profile plus local manifest files.','ALT_EXTRA labels not linked by alternativesFor are listed separately rather than promoted to selectable exercises.'],
  scenarioCounts:scenarios,declaredMapOnly:mappedOnly,unlinkedAlternativeLabels:extraOnly,
  compoundWodTemplates:wodTemplates.map(day=>({name:day.name,exerciseIds:day.exercises.map(ex=>ex.id),rx:day.rx,scale:day.scale,structure:day.structure})),
  manualExamples:{source:location('addManualExample'),names:['Press con mancuernas','Remo con banda','Caminar suave'],note:'Examples of the unbounded manual builder, not an exhaustive finite catalogue; custom/time IDs are generated from user text plus timestamp.'},
  variants:records};
const json=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--json'))process.stdout.write(json);
else if(process.argv.includes('--length'))process.stdout.write(String(json.length));
else if(process.argv.some(arg=>arg.startsWith('--page='))){const index=Number(process.argv.find(arg=>arg.startsWith('--page=')).slice(7));assert.ok(Number.isInteger(index)&&index>=0);process.stdout.write(json.slice(index*16000,(index+1)*16000));}
else console.log(JSON.stringify({summary:result.summary,unlinkedAlternativeLabels:extraOnly,generationSources:result.generationSources,output:'--json emits the complete inventory to stdout; this script never writes files.'},null,2));
