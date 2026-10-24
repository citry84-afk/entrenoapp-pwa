#!/usr/bin/env node
'use strict';

// Render the real static-SVG module in an isolated VM. Browser/network/timer IO
// are deliberately unavailable: generating an illustration must be pure markup.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const modulePath=path.join(root,'assets/js/exercise-illustrations.js');
const context=vm.createContext({});
vm.runInContext(`
  const forbidden=()=>{throw Error('Static illustration attempted browser, network or timer IO');};
  const fetch=forbidden,XMLHttpRequest=forbidden,Image=forbidden;
  const setInterval=forbidden,setTimeout=forbidden,requestAnimationFrame=forbidden;
  const document=new Proxy({}, {get:forbidden}),window=new Proxy({}, {get:forbidden});
`,context);
vm.runInContext(fs.readFileSync(modulePath,'utf8'),context,{filename:'exercise-illustrations.js'});
const run=code=>vm.runInContext(code,context);
const plain=code=>JSON.parse(JSON.stringify(run(code)));
const render=(entry,lang='es')=>run(`exerciseIllustrationHtml(${JSON.stringify(entry)},${JSON.stringify(lang)})`);
const poseKeys=plain('exerciseIllustrationPoseKeys()');
let passed=0,failed=0;
function test(name,callback){
  try{callback();passed++;console.log('✓ '+name);}
  catch(error){failed++;console.error('✗ '+name+'\n'+error.stack);}
}
function svgIds(html){return [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);}
function assertAccessible(html,label){
  assert.match(html,/^<svg\b[^>]*class="exercise-reference-illustration"/);
  assert.match(html,/\bviewBox="0 0 320 220"/);
  assert.match(html,/\brole="img"/);
  assert.match(html,/\bfocusable="false"/);
  assert.match(html,/<title\b[^>]*>[^<]+<\/title>/);
  assert.match(html,/<desc\b[^>]*>[^<]+<\/desc>/);
  if(label)assert.ok(html.includes('>'+label+'</title>'));
  const refs=html.match(/\baria-labelledby="([^"]+)"/)?.[1].split(/\s+/);
  assert.equal(refs?.length,2);
  const ids=svgIds(html);
  assert.equal(new Set(ids).size,ids.length);
  for(const ref of refs)assert.ok(ids.includes(ref),`Accessible label ${ref} is missing`);
  for(const match of html.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(match[1]),`Missing SVG paint reference ${match[1]}`);
  assert.doesNotMatch(html,/\b(?:NaN|Infinity|undefined|null)\b/);
}
function assertStaticLocal(html){
  assert.doesNotMatch(html,/<(?:script|foreignObject|image|video|audio|iframe|animate|animateTransform|animateMotion|set)\b/i);
  assert.doesNotMatch(html,/\b(?:href|xlink:href|src|onload|onclick|onerror)\s*=/i);
  assert.doesNotMatch(html,/@(?:import|keyframes)|\banimation\s*:|\btransition\s*:/i);
  assert.doesNotMatch(html,/(?:data:|javascript:|https?:\/\/)(?!www\.w3\.org\/2000\/svg)/i);
  assert.doesNotMatch(html,/Everkinetic|exercise-media|\.png|\.gif|\.webp|\.mp4/i);
}
function lines(html){
  return [...html.matchAll(/<polyline\b[^>]*\bpoints="([^"]+)"/g)].map(match=>match[1].trim().split(/\s+/).map(point=>point.split(',').map(Number)));
}
function geometry(pose,tool='bodyweight'){
  const html=render({pose,tool,label:pose}),polylines=lines(html);
  assert.ok(polylines.length>=3,'Expected two articulated legs and a torso');
  return {html,legs:polylines.slice(0,2),shoulders:polylines[2][0],pelvis:polylines[2][1]};
}
const allIds=new Set();
test('The public pose allowlist contains exactly 77 unique supported keys',()=>{
  assert.equal(poseKeys.length,77);
  assert.equal(new Set(poseKeys).size,77);
  for(const key of poseKeys)assert.match(key,/^[a-z_]+$/);
  for(const key of ['leg_extension','leg_curl','hip_thrust','goblet','walk','run','march','chair_squat','circuit','choice','custom'])assert.ok(poseKeys.includes(key));
});
for(const pose of poseKeys)test('Accessible static illustration: '+pose,()=>{
  for(const lang of ['es','en']){
    const html=render({pose,tool:'bodyweight',label:'Exercise '+pose},lang);
    assertAccessible(html,'Exercise '+pose);
    assertStaticLocal(html);
    assert.match(html,new RegExp(`data-exercise-pose="${pose}"`));
    assert.match(html,/data-exercise-tool="bodyweight"/);
    for(const id of svgIds(html)){
      assert.ok(!allIds.has(id),`SVG ID ${id} was reused across illustrations`);
      allIds.add(id);
    }
  }
});
test('Callers receive a fresh pose list and cannot mutate the module allowlist',()=>{
  run("const changedPoses=exerciseIllustrationPoseKeys();changedPoses[0]='injected';changedPoses.push('unsafe');");
  assert.deepEqual(plain('exerciseIllustrationPoseKeys()'),poseKeys);
});
test('The static limitation is visible and accessible in both languages',()=>{
  const es=render({pose:'squat'}),en=render({pose:'squat'},'en');
  assert.match(es,/<desc[^>]*>[^<]*Orientación estática, no una demostración completa del movimiento\./);
  assert.match(es,/<text[^>]*>ESQUEMA ESTÁTICO · NO ES UNA DEMOSTRACIÓN COMPLETA<\/text>/);
  assert.match(en,/<desc[^>]*>[^<]*A static orientation, not a complete movement demonstration\./);
  assert.match(en,/<text[^>]*>STATIC SCHEMATIC · NOT A FULL DEMONSTRATION<\/text>/);
  assert.match(render(null),/<title[^>]*>Tu ejercicio<\/title>/);
  assert.match(render(null,'en'),/<title[^>]*>Your exercise<\/title>/);
});
test('Labels escape all XML delimiters without introducing elements or attributes',()=>{
  const html=render({pose:'squat',tool:'bodyweight',label:'<img src="x" onerror="evil()"> & \'name\''});
  assert.ok(html.includes('&lt;img src=&quot;x&quot; onerror=&quot;evil()&quot;&gt; &amp; &#39;name&#39;'));
  assert.doesNotMatch(html,/<img|<script|onerror="evil/);
  assertAccessible(html);
});
test('Unknown, inherited and injected poses/tools become generic safe sketches',()=>{
  for(const value of ['unknown','__proto__','constructor','toString','<script>','squat" onload="evil()']){
    const html=render({pose:value,tool:value,label:'Safe'});
    assert.match(html,/data-exercise-pose="custom"/);
    assert.match(html,/data-exercise-tool="none"/);
    assertAccessible(html,'Safe');assertStaticLocal(html);
  }
  for(const entry of [null,0,42,'squat',[],{},true]){
    const html=render(entry);
    assert.match(html,/data-exercise-pose="custom"/);
    assertAccessible(html);assertStaticLocal(html);
  }
});
test('Pose and tool allowlists require strings, not coerced arrays or objects',()=>{
  for(const pose of [['squat'],['hip_thrust'],{},42,true]){
    const html=render({pose,tool:['barbell']});
    assert.match(html,/data-exercise-pose="custom"/);
    assert.match(html,/data-exercise-tool="none"/);
  }
});
test('Locale selection cannot inject markup and defaults safely to Spanish',()=>{
  const html=render({pose:'walk'},'en"><script>evil()</script>');
  assert.match(html,/ESQUEMA ESTÁTICO/);
  assert.doesNotMatch(html,/<script|evil\(\)/);
});
test('Every explicit material is preserved and unsafe materials are excluded',()=>{
  for(const tool of ['barbell','dumbbell','kettlebell','band','machine','chair','towel','slider','bodyweight','ball','sled','ergometer','none']){
    const html=render({pose:'squat',tool});
    assert.match(html,new RegExp(`data-exercise-tool="${tool}"`));
    assertStaticLocal(html);
  }
  for(const tool of ['gym','mancuernas','bandas','kettlebells','https://evil.test/tool.svg']){
    assert.match(render({pose:'squat',tool}),/data-exercise-tool="none"/);
  }
});
test('Band, kettlebell and dumbbell drawings are distinct original equipment, never borrowed assets',()=>{
  const band=render({pose:'curl',tool:'band'}),kb=render({pose:'curl',tool:'kettlebell'}),db=render({pose:'curl',tool:'dumbbell'});
  assert.match(band,/stroke="#f6bb77"/);
  assert.doesNotMatch(band,/<g transform="translate\(/);
  assert.match(kb,/<rect[^>]*rx="6"/);assert.match(kb,/<circle[^>]*r="12"[^>]*fill="#3269a8"/);
  assert.doesNotMatch(db,/<circle[^>]*r="12"[^>]*fill="#3269a8"/);
  assert.match(db,/stroke-width="7"/);
  for(const html of [band,kb,db])assertStaticLocal(html);
});
test('Leg extension, leg curl and hip thrust have mechanically distinct lower-body postures',()=>{
  const extension=geometry('leg_extension','machine'),curl=geometry('leg_curl','machine'),thrust=geometry('hip_thrust','barbell');
  for(const leg of extension.legs)assert.ok(leg[2][0]>leg[1][0]+20,'Extension must extend the lower leg forward');
  for(const leg of curl.legs)assert.ok(leg[2][0]<leg[1][0]-10,'Seated curl must bend the lower leg back');
  assert.ok(Math.abs(thrust.shoulders[1]-thrust.pelvis[1])<20,'Hip thrust torso must be approximately horizontal');
  assert.ok(extension.pelvis[1]-extension.shoulders[1]>40,'Leg extension remains seated upright');
  assert.notDeepEqual(extension.legs,curl.legs);
  assert.notDeepEqual(curl.legs,thrust.legs);
});
test('Hip-thrust and bridge barbell load is drawn at the pelvis, not on hands near the floor',()=>{
  for(const pose of ['hip_thrust','bridge','single_bridge']){
    const {html,pelvis}=geometry(pose,'barbell');
    const barY=Number(html.match(/<g stroke="#70adff"[^>]*><path d="M[-\d.]+ ([-\d.]+)h98"/)?.[1]);
    assert.ok(Number.isFinite(barY),'The barbell position must be identifiable');
    assert.ok(Math.abs(barY-pelvis[1])<=15,`${pose}: bar y=${barY}, pelvis y=${pelvis[1]}`);
  }
});
test('Dumbbell and kettlebell hip loads remain at the pelvis with one central weight',()=>{
  for(const pose of ['hip_thrust','bridge','single_bridge'])for(const tool of ['dumbbell','kettlebell']){
    const {html,pelvis}=geometry(pose,tool);
    const weights=[...html.matchAll(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)[^"]*" stroke="#70adff"/g)];
    assert.equal(weights.length,1,`${pose} ${tool} must have one central load`);
    const x=Number(weights[0][1]),y=Number(weights[0][2])+(tool==='kettlebell'?13:0);
    assert.ok(Math.abs(x-pelvis[0])<=10&&Math.abs(y-pelvis[1])<=15,`${pose} ${tool} load should stay near the pelvis`);
  }
});
test('A split squat elevates the rear foot instead of drawing it through the bench',()=>{
  const {legs}=geometry('split_squat');
  const footYs=legs.map(leg=>leg[2][1]);
  assert.ok(Math.max(...footYs)-Math.min(...footYs)>=20,'The rear foot should be visibly elevated above the front foot');
});
test('A dumbbell goblet squat shows one central weight rather than two overlapping dumbbells',()=>{
  const html=render({pose:'goblet',tool:'dumbbell'});
  const weights=[...html.matchAll(/<g transform="translate\([^"]+\)" stroke="#70adff" stroke-linecap="round">/g)];
  assert.equal(weights.length,1);
});
test('Mixed circuits and choices keep their identity without inventing a single body posture',()=>{
  for(const pose of ['circuit','choice','custom']){
    const html=render({pose,tool:'band'});
    assert.match(html,new RegExp(`data-exercise-pose="${pose}"`));
    assert.equal(lines(html).length,0);
    assert.doesNotMatch(html,/<polyline\b/);
    assert.match(html,/<rect x="75" y="46" width="171" height="132"/);
  }
});
test('Floor pullover and standing press/fly drawings do not borrow a bench or chair',()=>{
  const benchPaths=['M74 125H184M86 126V185M174 126V185','M81 83L177 141M121 110V184M175 141V184','M109 74V146H170M120 146V190M160 146V190'];
  for(const pose of ['floor_pullover','standing_press','band_incline_press','standing_fly']){
    const {html,shoulders,pelvis}=geometry(pose,pose==='floor_pullover'?'kettlebell':'band');
    for(const benchPath of benchPaths)assert.ok(!html.includes(benchPath),`${pose} must not show bench seating`);
    if(pose==='floor_pullover'){
      assert.ok(shoulders[1]>=175&&pelvis[1]>=175,'A floor pullover lies near the floor');
      assert.ok(html.includes('M39 195H274'));
    }else assert.ok(pelvis[1]-shoulders[1]>40,'A standing press/fly remains upright');
  }
});
test('Wall sit uses the wall without drawing an invented chair seat',()=>{
  const html=render({pose:'wall_sit',tool:'bodyweight'});
  assert.ok(html.includes('M119 23V196'));
  assert.ok(!html.includes('M109 74V146H170M120 146V190M160 146V190'));
});
test('The step-up front foot meets the platform top instead of floating above it',()=>{
  const {html,legs}=geometry('step_up');
  const platform=html.match(/<path d="M([\d.]+) ([\d.]+)H([\d.]+)V196H172Z"/);
  assert.ok(platform,'A step platform must be present');
  const [,left,top,right]=platform.map(Number),foot=legs[0][2];
  assert.ok(foot[0]>=left&&foot[0]+12<=right);
  assert.equal(foot[1]+3,top,'The six-pixel foot stroke should touch the platform');
});
test('Calf raise feet slope from raised heels down to grounded toes',()=>{
  const html=render({pose:'calf',tool:'bodyweight'}),feet=lines(html).slice(6,8);
  assert.equal(feet.length,2);
  for(const [heel,toe] of feet){
    assert.ok(toe[0]>heel[0]&&toe[1]>heel[1]+5,'Calf raise needs visibly raised heels');
    assert.ok(Math.abs(toe[1]+3-200)<=1,'Toe stroke should reach the floor line');
  }
});
test('Single-leg bridge and calf variants visibly lift one foot rather than copying bilateral support',()=>{
  for(const pose of ['single_bridge','single_calf']){
    const {legs}=geometry(pose),feet=legs.map(leg=>leg[2]);
    assert.ok(Math.abs(feet[0][1]-feet[1][1])>=30,`${pose} must show one raised leg`);
  }
  const raised=lines(render({pose:'single_calf',tool:'bodyweight'})).slice(6,8);
  assert.equal(raised[0][1][1],196,'Standing foot toe stays grounded');
  assert.ok(raised[1][1][1]<180,'Raised foot must not be extended down to the floor');
});
test('A supported one-arm row uses its support hand and only one working-hand weight',()=>{
  const entry={pose:'row',tool:'dumbbell',support:true,unilateral:true,toolCount:1};
  const html=render(entry),polylines=lines(html);
  assert.match(html,/data-sketch-support="row"/);
  assert.deepEqual(polylines[4].at(-1),[95,137],'The non-working hand should meet the support');
  const weights=[...html.matchAll(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)" stroke="#70adff" stroke-linecap="round">/g)];
  assert.equal(weights.length,1);
  assert.deepEqual([Number(weights[0][1]),Number(weights[0][2])],polylines[5].at(-1));
  assert.doesNotMatch(render({...entry,support:false}),/data-sketch-support="row"/);
  assert.doesNotMatch(render({pose:'curl',tool:'dumbbell',support:true}),/data-sketch-support="row"/);
});
test('Hands-on-thighs hinge is distinct from an unsupported free-hanging hinge',()=>{
  const hands=lines(render({pose:'hinge_hands_thighs',tool:'bodyweight'})).slice(4,6).map(arm=>arm.at(-1));
  const hanging=lines(render({pose:'hinge',tool:'bodyweight'})).slice(4,6).map(arm=>arm.at(-1));
  assert.notDeepEqual(hands,hanging);
  assert.ok(hands.every(hand=>hand[0]>=165&&hand[1]>=130&&hand[1]<=150));
});
test('Band bridge, hinge and chest presses use the correct anchor family',()=>{
  for(const pose of ['bridge','hip_thrust']){
    const html=render({pose,tool:'band'});
    assert.match(html,/<ellipse data-band-anchor="knees"/);
    assert.doesNotMatch(html,/<polyline[^>]*stroke="#f6bb77"/);
  }
  const hinge=render({pose:'hinge',tool:'band'});
  assert.match(hinge,/data-band-anchor="feet-back"/);
  for(const pose of ['standing_press','band_incline_press']){
    const html=render({pose,tool:'band'});
    const bands=[...html.matchAll(/<polyline\b[^>]*points="([^"]+)"[^>]*stroke="#f6bb77"/g)].map(match=>match[1]);
    assert.equal(bands.length,2);
    for(const points of bands)assert.match(points,/^136,88 /);
    assert.doesNotMatch(html,/<polyline[^>]*points="151,191 [^"]*"[^>]*stroke="#f6bb77"/);
  }
});
test('Support chair is scoped to balance or explicitly supported calf, hinge and march sketches',()=>{
  const supportChair='M223 78V149H258M232 149V193M251 149V193';
  assert.ok(render({pose:'balance',tool:'bodyweight'}).includes(supportChair));
  for(const pose of ['calf','hinge','march']){
    assert.ok(!render({pose,tool:'bodyweight'}).includes(supportChair));
    assert.ok(!render({pose,tool:'bodyweight',support:false}).includes(supportChair));
    assert.ok(render({pose,tool:'bodyweight',support:true}).includes(supportChair));
  }
  for(const pose of ['walk','run','squat','curl','custom']){
    assert.ok(!render({pose,tool:'bodyweight',support:true}).includes(supportChair));
  }
});
test('Rendering never mutates the caller entry or depends on global saved workout data',()=>{
  run("const userEntry=Object.freeze({pose:'hinge',tool:'bodyweight',support:true,label:'Keep this'});const entryBefore=JSON.stringify(userEntry);exerciseIllustrationHtml(userEntry);if(JSON.stringify(userEntry)!==entryBefore)throw Error('Input changed');");
  assert.doesNotMatch(fs.readFileSync(modulePath,'utf8'),/\b(?:localStorage|sessionStorage|indexedDB|WD|saveSession|renderWorkout)\b/);
});

// Independently enumerate the current app DB, generators, material adaptations
// and alternatives. Do not use the static catalogue as its own coverage oracle.
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/exercise-visual-catalogue.js'),'utf8'),context,{filename:'exercise-visual-catalogue.js'});
const inventory=JSON.parse(execFileSync(process.execPath,[path.join(__dirname,'exercise-visual-inventory.js'),'--json'],{encoding:'utf8',maxBuffer:16*1024*1024}));
const catalogue=plain('exerciseIllustrationCatalogue()');
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const identity=entry=>JSON.stringify([normalize(entry.id),normalize(entry.name),normalize(entry.equipment)]);
const lookup=entry=>plain(`exerciseIllustrationProfile(${JSON.stringify(entry)})`);
const profileFields=entry=>{
  const {id,name,equipment,...profile}=entry;
  return profile;
};
const inventoryIdentities=new Set(inventory.variants.map(identity));
test('The 304-entry illustration catalogue exactly covers the real current app inventory',()=>{
  assert.equal(inventory.variants.length,304,'The independently generated app inventory changed; review the explicit catalogue');
  assert.equal(catalogue.length,304);
  assert.equal(inventoryIdentities.size,304);
  const identities=new Set(catalogue.map(identity));
  assert.equal(identities.size,304);
  assert.deepEqual([...identities].sort(),[...inventoryIdentities].sort());
});
test('Every real inventory variant resolves to a valid profile and accessible ES/EN SVG',()=>{
  for(const reference of inventory.variants){
    const entry=catalogue.find(item=>identity(item)===identity(reference));
    assert.ok(entry,`Missing catalogue entry for ${reference.id}: ${reference.name} (${reference.equipment})`);
    const profile=lookup({id:reference.id,name:reference.name,equipment:reference.equipment});
    assert.deepEqual(profile,profileFields(entry),reference.key);
    assert.equal(profile.known,true);
    assert.ok(poseKeys.includes(profile.pose),`Unsupported pose ${profile.pose}`);
    assert.equal(typeof profile.support,'boolean');
    assert.equal(typeof profile.label,'string');assert.ok(profile.label.trim());
    assert.ok(['barbell','dumbbell','kettlebell','band','machine','chair','towel','slider','bodyweight','ball','sled','ergometer','none'].includes(profile.tool));
    if(profile.mediaKey)assert.match(profile.mediaKey,/^[a-z0-9_]+$/);
    for(const lang of ['es','en']){
      const html=render(profile,lang);assertAccessible(html);assertStaticLocal(html);
      assert.match(html,new RegExp(`data-exercise-pose="${profile.pose}"`));
      for(const id of svgIds(html)){
        assert.ok(!allIds.has(id),`SVG ID ${id} was reused while rendering the catalogue`);
        allIds.add(id);
      }
    }
  }
});
test('Complete triplets tolerate only case, accents and whitespace normalization',()=>{
  for(const entry of catalogue){
    const changed=Object.fromEntries(['id','name','equipment'].map(field=>[field,`  ${entry[field].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/ /g,'   ')}  `]));
    assert.deepEqual(lookup(changed),profileFields(entry),entry.name);
  }
});
test('Every custom ID, modified name or unrecognized material remains unmatched',()=>{
  for(const entry of catalogue){
    const ex={id:entry.id,name:entry.name,equipment:entry.equipment};
    for(const changed of [{...ex,id:'custom_unreviewed_'+entry.id},{...ex,name:entry.name+' · mi variante'},{...ex,equipment:'unreviewed_equipment'}]){
      assert.equal(lookup(changed),null,JSON.stringify(changed));
    }
  }
});
test('Changing material matches only another explicitly inventoried complete triplet',()=>{
  const materials=[...new Set(catalogue.map(entry=>entry.equipment))];
  for(const entry of catalogue)for(const equipment of materials){
    const changed={id:entry.id,name:entry.name,equipment};
    const result=lookup(changed);
    if(inventoryIdentities.has(identity(changed)))assert.ok(result?.known,JSON.stringify(changed));
    else assert.equal(result,null,JSON.stringify(changed));
  }
});
test('Missing, inherited or non-string identity fields cannot borrow a known catalogue entry',()=>{
  for(const entry of catalogue){
    const ex={id:entry.id,name:entry.name,equipment:entry.equipment};
    for(const field of ['id','name','equipment']){
      const missing={...ex};delete missing[field];assert.equal(lookup(missing),null);
      for(const value of [null,42,[],[ex[field]],{}])assert.equal(lookup({...ex,[field]:value}),null);
    }
  }
  assert.equal(run("exerciseIllustrationProfile(Object.create({id:'pb',name:'Press de banca',equipment:'gym'}))"),null);
  for(const ex of [null,[],42,'Press de banca',{id:'pb',name:'Mi ejercicio',equipment:'gym',hint:'Press de banca'},
    {id:'pb',name:'Press de banca',equipment:'__proto__'},{id:'pb',name:'Press de banca',equipment:'dumbbells'}])assert.equal(lookup(ex),null);
});
test('Explicit unknown material stays distinct from omitted material or a guessed implement',()=>{
  const unknown=catalogue.filter(entry=>entry.equipment==='');
  assert.ok(unknown.length>0);
  for(const entry of unknown){
    assert.ok(lookup({id:entry.id,name:entry.name,equipment:''}));
    assert.equal(lookup({id:entry.id,name:entry.name}),null);
  }
  assert.equal(lookup({id:'goblet',name:'Goblet squat',equipment:''}).tool,'none');
  assert.equal(lookup({id:'goblet',name:'Goblet squat',equipment:''}).pose,'choice');
});
test('Returned catalogue rows and profiles are fresh clones, never mutable source records',()=>{
  const first=catalogue[0],expected=lookup(first);
  run(`const mutableCatalogue=exerciseIllustrationCatalogue();mutableCatalogue[0].name='Changed';mutableCatalogue[0].pose='unsafe';mutableCatalogue.splice(1);const mutableProfile=exerciseIllustrationProfile(${JSON.stringify(first)});mutableProfile.pose='unsafe';mutableProfile.label='<script>';mutableProfile.support=!mutableProfile.support;`);
  assert.deepEqual(plain('exerciseIllustrationCatalogue()'),catalogue);
  assert.deepEqual(lookup(first),expected);
});
test('Material-specific catalogue regressions never borrow another implement or unconfirmed posture',()=>{
  for(const entry of catalogue.filter(entry=>entry.equipment==='bandas'))assert.equal(entry.tool,'band',entry.name);
  for(const entry of catalogue.filter(entry=>entry.equipment==='kettlebell'))assert.equal(entry.tool,'kettlebell',entry.name);
  for(const ex of [
    {id:'cf',name:'Curl femoral con banda',equipment:'bandas'},
    {id:'band_legcurl',name:'Curl femoral banda',equipment:'bandas'},
    {id:'sq',name:'Sentadilla con banda',equipment:'bandas'}
  ]){
    const result=lookup(ex);assert.equal(result.pose,'choice');assert.equal(result.tool,'band');assert.ok(!result.mediaKey);
  }
  assert.equal(lookup({id:'pb',name:'Press de pecho con banda',equipment:'bandas'}).pose,'standing_press');
  assert.equal(lookup({id:'ht',name:'Puente glúteo con banda',equipment:'bandas'}).pose,'bridge');
  for(const ex of [
    {id:'pm',name:'Peso muerto rumano con mancuernas',equipment:'mancuernas'},
    {id:'cf',name:'Peso muerto rumano a una pierna',equipment:'mancuernas'}
  ]){
    const result=lookup(ex);assert.equal(result.tool,'dumbbell');assert.ok(!result.mediaKey,'Dumbbell deadlift pictures must not become RDL media');
  }
  const flat=lookup({id:'pim',name:'Press con mancuernas',equipment:'mancuernas'});
  const incline=lookup({id:'pim',name:'Press inclinado mancuernas',equipment:'mancuernas'});
  assert.notEqual(flat.pose,incline.pose);assert.notEqual(flat.mediaKey,incline.mediaKey);
});
test('Catalogue single-weight flags render one load, including supported rows and kettlebell entries',()=>{
  const flagged=catalogue.filter(entry=>entry.toolCount===1);
  assert.ok(flagged.length>20);
  for(const entry of flagged){
    const html=render(lookup(entry));
    if(entry.tool==='kettlebell'){
      assert.equal([...html.matchAll(/<circle\b[^>]*fill="#3269a8"/g)].length,1,entry.name);
    }else if(entry.tool==='dumbbell'){
      assert.equal([...html.matchAll(/<g transform="translate\([^"]+\)" stroke="#70adff" stroke-linecap="round">/g)].length,1,entry.name);
    }
    if(entry.pose==='row'&&entry.support){
      assert.match(html,/data-sketch-support="row"/);
      assert.equal(entry.unilateral,true);
    }
  }
});
test('Kettlebell unilateral floor/overhead presses load the raised working hand, not the resting arm',()=>{
  for(const reference of [
    {id:'kb_floor_press',name:'Kettlebell floor press unilateral',equipment:'kettlebell'},
    {id:'kb_press',name:'Kettlebell press',equipment:'kettlebell'}
  ]){
    const profile=lookup(reference);assert.equal(profile.unilateral,true);assert.equal(profile.toolCount,1);
    const html=render(profile),arms=lines(html).slice(4,6),raised=arms.map(arm=>arm.at(-1)).sort((a,b)=>a[1]-b[1])[0];
    const weight=html.match(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)" stroke="#70adff" stroke-width="3">/);
    assert.ok(weight);assert.deepEqual([Number(weight[1]),Number(weight[2])],raised);
  }
  const close=lookup({id:'kb_close_press',name:'Kettlebell press cerrado en suelo',equipment:'kettlebell'});
  assert.equal(close.closeGrip,true);assert.equal(close.toolCount,1);
  const html=render(close),hands=lines(html).slice(4,6).map(arm=>arm.at(-1));
  const weight=html.match(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)" stroke="#70adff" stroke-width="3">/);
  assert.deepEqual([Number(weight[1]),Number(weight[2])],[(hands[0][0]+hands[1][0])/2,(hands[0][1]+hands[1][1])/2]);
});
test('Catalogue unilateral and hands-on-thighs records select their specific available poses',()=>{
  for(const [reference,pose] of [
    [{id:'ht',name:'Puente glúteo unilateral',equipment:'nada'},'single_bridge'],
    [{id:'et',name:'Elevación de talones a una pierna',equipment:'nada'},'single_calf'],
    [{id:'calf_single',name:'Gemelo unilateral',equipment:'nada'},'single_calf'],
    [{id:'vital_hip_hinge',name:'Bisagra de cadera con manos en muslos',equipment:'vital'},'hinge_hands_thighs']
  ])assert.equal(lookup(reference).pose,pose);
  const reference={id:'vital_row',name:'Remo con mancuerna apoyado',equipment:'mancuernas'};
  const saved=lookup(reference);
  run(`const changedFlags=exerciseIllustrationProfile(${JSON.stringify(reference)});changedFlags.toolCount=99;changedFlags.unilateral=false;changedFlags.support=false;`);
  assert.deepEqual(lookup(reference),saved);
});

console.log(`\n${passed} exercise illustration checks passed${failed?`, ${failed} failed`:'.'}`);
if(failed)process.exitCode=1;
