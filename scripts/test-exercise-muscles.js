#!/usr/bin/env node
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','assets/js/exercise-muscles.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
const plain=code=>JSON.parse(JSON.stringify(run(code)));
let passed=0;
function test(name,callback){callback();passed++;console.log('✓ '+name);}
const cases=[
  ['squat_barbell','sq','Sentadilla con barra','gym'],
  ['squat_bodyweight','starter_squat','Sentadilla lenta','nada'],
  ['goblet_squat','sq','Sentadilla goblet','mancuernas'],
  ['bench_barbell','pb','Press de banca','gym'],
  ['bench_dumbbell_flat','pim','Press con mancuernas','mancuernas'],
  ['bench_dumbbell_incline','pim','Press inclinado mancuernas','mancuernas'],
  ['barbell_row','rb','Remo con barra','gym'],
  ['cable_row','rc','Remo cable bajo','gym'],
  ['rdl_barbell','pmr','Peso muerto rumano','gym'],
  ['rdl_dumbbell','pm','Peso muerto rumano con mancuernas','mancuernas'],
  ['lat_pulldown','jl','Jalón al pecho','gym'],
  ['overhead_barbell','ph','Press hombros barra','gym'],
  ['overhead_dumbbell','ph','Press hombro con mancuernas','mancuernas'],
  ['lateral_raise','el','Elevaciones laterales','mancuernas'],
  ['biceps_curl_barbell','cb','Curl bíceps barra','gym'],
  ['biceps_curl_dumbbell','cb','Curl bíceps con mancuernas','mancuernas'],
  ['push_up','pb','Flexiones','nada'],
  ['band_chest_press','pb','Press de pecho con banda','bandas'],
  ['band_row','rm','Remo con banda','bandas'],
  ['band_pulldown','jl','Jalón con banda','bandas'],
  ['leg_extension','ec','Extensión cuádriceps','gym'],
  ['leg_curl','cf','Curl femoral','gym'],
  ['hip_thrust','ht','Hip thrust barra','gym'],
  ['band_squat','sq','Sentadilla con banda','bandas'],
  ['hammer_curl','cm','Curl martillo','mancuernas'],
  ['chest_supported_row','rm','Remo máquina pecho','gym'],
  ['overhead_dumbbell_seated','custom_seated_press','Press hombros sentado con mancuernas','mancuernas']
];
for(const [key,id,name,equipment] of cases)test('Reviewed variant '+key,()=>{
  const ex={id,name,equipment};
  const result=plain(`exerciseMuscleProfile(${JSON.stringify(ex)})`);
  assert.equal(result.key,key);
  assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify(ex)})`),key);
  assert.ok(result.primary.length>0);
  assert.ok(result.sources.length>0&&result.sources.every(url=>url.startsWith('https://')));
  assert.ok(result.cue.es&&result.cue.en);
  assert.equal(new Set([...result.primary,...result.secondary]).size,result.primary.length+result.secondary.length);
  for(const zone of [...result.primary,...result.secondary])assert.ok(run(`exerciseMuscleLabel(${JSON.stringify(zone)})`));
});
test('Exact normalization supports accents, case and whitespace without substring guesses',()=>{
  assert.equal(run("exerciseVisualVariantKey({name:'  PRESS  de BÁNCA ',equipment:'gym'})"),'bench_barbell');
  assert.equal(run("exerciseVisualVariantKey({name:'Mi press de banca nuevo',equipment:'gym'})"),null);
  assert.equal(run("exerciseVisualVariantKey({name:'Press de banca seguro para lesión',equipment:'gym'})"),null);
});
test('An ID or hint alone never establishes a reviewed fingerprint',()=>{
  for(const ex of [{id:'pb',equipment:'gym'},{id:'pb',name:'Mi ejercicio',equipment:'gym',hint:'Press de banca'},
    {id:'custom_pb',name:'Mi press',equipment:'gym',hint:'Pecho y tríceps'},
    {name:'Press de banca',equipment:'custom'},{name:'Press de banca'},null,[],42]){
    assert.equal(run(`exerciseMuscleProfile(${JSON.stringify(ex)})`),null);
  }
});
test('The real name and material win over reused IDs',()=>{
  assert.equal(run("exerciseVisualVariantKey({id:'pb',name:'Flexiones',equipment:'nada'})"),'push_up');
  assert.equal(run("exerciseVisualVariantKey({id:'pim',name:'Press con mancuernas',equipment:'mancuernas'})"),'bench_dumbbell_flat');
  assert.equal(run("exerciseVisualVariantKey({id:'pim',name:'Press inclinado mancuernas',equipment:'mancuernas'})"),'bench_dumbbell_incline');
  assert.equal(run("exerciseVisualVariantKey({id:'phm',name:'Press en máquina',equipment:'gym'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'phm',name:'Press inclinado máquina',equipment:'gym'})"),null);
  // The gym catalogue describes dumbbells explicitly but stores availability as gym.
  assert.equal(run("exerciseVisualVariantKey({id:'pim',name:'Press inclinado mancuernas',equipment:'gym'})"),'bench_dumbbell_incline');
});
for(const [name,id,key] of [
  ['Sentadilla','sq','squat_barbell'],
  ['Press hombros','ph','overhead_barbell'],
  ['Curl bíceps','cb','biceps_curl_barbell']
])test('Generic gym '+name+' requires its exact catalogue identity',()=>{
  assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify({id,name,equipment:'gym'})})`),key);
  const normalized={id,name:`  ${name.toUpperCase()}  `,equipment:'gym'};
  assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify(normalized)})`),key);
  for(const ambiguousId of [undefined,`custom_${id}`,'other',id.toUpperCase(),null,42]){
    const ex={id:ambiguousId,name,equipment:'gym'};
    assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify(ex)})`),null);
    assert.equal(run(`exerciseMuscleProfile(${JSON.stringify(ex)})`),null);
  }
});
test('Explicit barbell names do not require a catalogue ID',()=>{
  for(const [name,key] of [
    ['Sentadilla con barra','squat_barbell'],
    ['Press hombros barra','overhead_barbell'],
    ['Curl bíceps barra','biceps_curl_barbell'],
    ['Curl bíceps con barra','biceps_curl_barbell']
  ])for(const id of [undefined,'custom_exercise']){
    assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify({id,name,equipment:'gym'})})`),key);
  }
});
test('Generic gym restrictions do not alter other materials or explicit adaptations',()=>{
  for(const [name,id] of [['Sentadilla','sq'],['Press hombros','ph'],['Curl bíceps','cb']]){
    for(const equipment of ['mancuernas','bandas','nada']){
      assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify({id,name,equipment})})`),null);
    }
  }
  for(const [name,equipment,key] of [
    ['Sentadilla lenta','nada','squat_bodyweight'],
    ['Sentadilla goblet','mancuernas','goblet_squat'],
    ['Sentadilla con banda','bandas','band_squat'],
    ['Press hombro con mancuernas','mancuernas','overhead_dumbbell'],
    ['Curl bíceps con mancuernas','mancuernas','biceps_curl_dumbbell']
  ])assert.equal(run(`exerciseVisualVariantKey(${JSON.stringify({id:'custom_exercise',name,equipment})})`),key);
});
test('Curl femoral, RDL and overhead adaptations cannot borrow another pattern',()=>{
  for(const ex of [{id:'cf',name:'Peso muerto rumano a una pierna',equipment:'mancuernas'},
    {id:'jl',name:'Pullover con mancuerna',equipment:'mancuernas'},
    {id:'ph',name:'Pike push-up',equipment:'nada'},
    {id:'el',name:'Kettlebell halo ligero',equipment:'kettlebell'},
    {id:'pmr',name:'Buenos días con banda',equipment:'bandas'}])assert.equal(run(`exerciseMuscleProfile(${JSON.stringify(ex)})`),null);
  assert.deepEqual(plain("exerciseMuscleProfile({id:'pmr',name:'Peso muerto rumano',equipment:'gym'}).primary"),['hamstrings','glutes']);
  assert.deepEqual(plain("exerciseMuscleProfile({id:'ph',name:'Press hombros barra',equipment:'gym'}).primary"),['front_delts','side_delts']);
  assert.deepEqual(plain("exerciseMuscleProfile({id:'cf',name:'Curl femoral',equipment:'gym'}).primary"),['hamstrings']);
  assert.deepEqual(plain("exerciseMuscleProfile({id:'cb',name:'Curl bíceps barra',equipment:'gym'}).primary"),['biceps']);
});
test('Machine support, seated overhead and material need explicit reviewed fingerprints',()=>{
  assert.equal(run("exerciseVisualVariantKey({id:'rm',name:'Remo máquina',equipment:'gym'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'rm',name:'Remo máquina pecho',equipment:'mancuernas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'ec',name:'Extensión cuádriceps',equipment:'nada'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'ht',name:'Hip thrust',equipment:'mancuernas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'cm',name:'Curl martillo',equipment:'bandas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'ph',name:'Press hombro con mancuernas',equipment:'mancuernas'})"),'overhead_dumbbell');
  assert.equal(run("exerciseVisualVariantKey({id:'ph',name:'Press hombro con mancuernas sentado',equipment:'mancuernas'})"),'overhead_dumbbell_seated');
});
test('Lower-body aliases remain explicit and do not match unilateral or band adaptations',()=>{
  assert.equal(run("exerciseVisualVariantKey({id:'ht',name:'Hip thrust',equipment:'gym'})"),'hip_thrust');
  assert.equal(run("exerciseVisualVariantKey({id:'ec',name:'Extensión de cuádriceps',equipment:'gym'})"),'leg_extension');
  assert.equal(run("exerciseVisualVariantKey({id:'cf',name:'Curl femoral con banda',equipment:'bandas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'ht',name:'Hip thrust con mancuerna',equipment:'mancuernas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({id:'rm',name:'Remo en máquina con pecho apoyado',equipment:'gym'})"),'chest_supported_row');
});
test('An unsupported material never reuses the visual of another implement',()=>{
  assert.equal(run("exerciseVisualVariantKey({name:'Press de banca',equipment:'mancuernas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({name:'Sentadilla goblet',equipment:'kettlebell'})"),null);
  assert.equal(run("exerciseVisualVariantKey({name:'Curl bíceps con mancuernas',equipment:'bandas'})"),null);
  assert.equal(run("exerciseVisualVariantKey({name:'Press de banca',equipment:['gym']})"),null);
});
test('Caller mutations cannot change reviewed profiles or subsequent maps',()=>{
  run("const changed=exerciseMuscleProfile({name:'Press de banca',equipment:'gym'});changed.primary.push('quads');changed.sources[0]='javascript:evil()';changed.cue.es='<script>x</script>';");
  const clean=plain("exerciseMuscleProfile({name:'Press de banca',equipment:'gym'})");
  assert.deepEqual(clean.primary,['chest']);
  const html=run("exerciseMuscleMapHtml(changed)");
  assert.doesNotMatch(html,/javascript:|<script|class="muscle-zone principal" data-muscle-zone="quads"/);
});
test('Front and back SVGs are original, accessible and have unique label IDs',()=>{
  const front=run("exerciseMuscleMapHtml(exerciseMuscleProfile({name:'Press de banca',equipment:'gym'}),'front','es')");
  const back=run("exerciseMuscleMapHtml(exerciseMuscleProfile({name:'Peso muerto rumano',equipment:'gym'}),'back','en')");
  assert.match(front,/<svg[^>]*role="img"[^>]*aria-labelledby="[^"]+-title [^"]+-desc"/);
  assert.match(front,/<title[^>]*>Vista frontal/);
  assert.match(back,/<title[^>]*>Back view/);
  assert.match(front,/class="muscle-zone principal" data-muscle-zone="chest"/);
  assert.match(front,/class="muscle-zone apoyo" data-muscle-zone="front_delts"/);
  assert.match(back,/class="muscle-zone principal" data-muscle-zone="hamstrings"/);
  assert.match(back,/class="muscle-zone principal" data-muscle-zone="glutes"/);
  assert.notEqual(front.match(/<title id="([^"]+)"/)[1],back.match(/<title id="([^"]+)"/)[1]);
  assert.doesNotMatch(front+back,/<image|(?:href|src)=["']https?:|<script|<foreignObject|onload=/);
  assert.doesNotMatch(front+back,/%|recovery|recuperaci[oó]n|activaci[oó]n/);
  assert.match(back,/not measured muscle activity/);
});
test('SVG input is restricted to known reviewed profiles and view/locale allowlists',()=>{
  assert.equal(run("exerciseMuscleMapHtml(null)"),'');
  assert.equal(run("exerciseMuscleMapHtml({key:'<svg onload=alert(1)>'})"),'');
  const html=run("exerciseMuscleMapHtml({key:'bench_barbell',primary:['<script>']},'<script>','<img>')");
  assert.match(html,/data-muscle-view="front"/);
  assert.doesNotMatch(html,/<script|<img/);
});
test('Labels are localized and unknown zones are not exposed as technical keys',()=>{
  assert.equal(run("exerciseMuscleLabel('hamstrings','es')"),'Isquiotibiales');
  assert.equal(run("exerciseMuscleLabel('hamstrings','en')"),'Hamstrings');
  assert.equal(run("exerciseMuscleLabel('__proto__','en')"),'');
  assert.equal(run("exerciseMuscleLabel('not_reviewed','es')"),'');
});
console.log(`\n${passed} exercise muscle profile/map checks passed.`);
