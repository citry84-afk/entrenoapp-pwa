#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const plan=JSON.parse(read('audits/2026-10-24/generated-exercise-plan.json'));
let checks=0;
function check(name,fn){fn();checks++;console.log('✓ '+name);}
cp.execFileSync(process.execPath,['scripts/compile-generated-exercise-media.js','--require-complete'],{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:1024*1024});
const live=JSON.parse(cp.execFileSync(process.execPath,['scripts/exercise-visual-inventory.js','--json'],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:32*1024*1024}));
const context=vm.createContext({console,URL});
vm.runInContext(`
  const document={hidden:false,addEventListener(){},querySelector(){return null;},getElementById(){return null;}};
  const window={matchMedia(){return {matches:true,addEventListener(){}};}};
  const navigator={connection:{saveData:true}};
  function currentLang(){return lang;}let lang='es';
  const S={profile:{equipment:'gym'},sessions:[{id:'unchanged',notes:'keep'}]};
  const W={active:true,notes:'keep',alt:{pb:'pim'}};
  const WD={pb_0:[{kg:42.5,reps:9,done:true}]};
  const before=JSON.stringify({S,W,WD});
`,context);
for(const file of ['exercise-muscles','exercise-media','exercise-generated-media','exercise-visual-catalogue','exercise-visuals'])vm.runInContext(read('assets/js/'+file+'.js'),context,{filename:file+'.js'});
const catalogue=vm.runInContext('exerciseIllustrationCatalogue()',context);
const registered=vm.runInContext('exerciseGeneratedMediaCatalogue()',context);
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const identity=entry=>JSON.stringify([entry.id,entry.name,entry.equipment].map(normalize));
check('el inventario real actual coincide con todas las identidades del catálogo',()=>assert.deepEqual(new Set(live.variants.map(identity)),new Set(catalogue.map(identity))));
check('el plan conserva cada identidad exactamente una vez',()=>{
  const planned=plan.assets.flatMap(asset=>asset.identities.map(identity));assert.equal(new Set(planned).size,planned.length);assert.deepEqual(new Set(planned),new Set(catalogue.map(identity)));
});
check('cada ejercicio propuesto tiene una lámina generada revisada y el enlace exacto',()=>{
  for(const entry of catalogue){const asset=registered.find(asset=>asset.key===entry.generatedMediaKey);assert.ok(asset,identity(entry));assert.equal(asset.status,'reviewed');assert.equal(asset.source,'generated');const planned=plan.assets.find(item=>item.key===entry.generatedMediaKey);assert.ok(planned.identities.some(item=>identity(item)===identity(entry)));}
});
check('las claves desconocidas y propiedades del prototipo no reciben imágenes',()=>{
  for(const key of ['','unknown','__proto__','constructor',null,42]){context.testKey=key;assert.equal(vm.runInContext('exerciseGeneratedMedia(testKey)',context),null);}
});
check('el registro devuelve copias independientes del texto accesible',()=>{
  const key=registered[0].key;context.testKey=key;const prior=vm.runInContext('exerciseGeneratedMedia(testKey).alt.es',context);vm.runInContext('const returned=exerciseGeneratedMedia(testKey);returned.alt.es="mutated";returned.file="bad";',context);assert.equal(vm.runInContext('exerciseGeneratedMedia(testKey).alt.es',context),prior);
});
for(const lang of ['es','en'])check('todas las láminas se renderizan con alt, lazy y sin falsa animación ('+lang+')',()=>{
  context.testLang=lang;vm.runInContext('lang=testLang',context);
  for(const entry of catalogue){
    context.testExercise={id:entry.id,name:entry.name,equipment:entry.equipment};const html=vm.runInContext('renderExerciseVisual(testExercise)',context);const asset=registered.find(asset=>asset.key===entry.generatedMediaKey);
    assert.match(html,/is-generated/);assert.ok(html.includes('data-generated-kind="'+asset.kind+'"'));assert.match(html,/loading="lazy" decoding="async"/);assert.match(html,/alt="[^\"]+"/);assert.ok(html.includes(asset.file));assert.ok(html.includes(asset.fallbackFile));assert.match(html,/<picture>/);assert.match(html,/type="image\/webp"/);assert.ok(!html.includes('data-visual-action="play"'));assert.ok(!html.includes('data-visual-action="expand"'));assert.ok(!html.includes('data-visual-frame'));assert.ok(!html.includes('Everkinetic'));assert.ok(!html.includes('data-exercise-illustration'));
    const specific=entry.generatedMediaAlt;
    if(specific&&['es','en'].every(language=>typeof specific[language]==='string'&&specific[language].trim())){
      const visible=html.match(/<p\b[^>]*data-visual-specific-caption[^>]*>([\s\S]*?)<\/p>/);assert.ok(visible,'Missing visible variant description: '+identity(entry));
      context.captionText=specific[lang];assert.equal(visible[1],vm.runInContext('exerciseVisualEscape(captionText)',context));
    }else assert.ok(!html.includes('data-visual-specific-caption'));
  }
});
check('ningún render modifica el entrenamiento, series, notas o historial',()=>assert.equal(vm.runInContext('JSON.stringify({S,W,WD})===before',context),true));
check('un ejercicio personalizado no toma una ilustración de un nombre parecido',()=>{
  context.testExercise={id:'custom_1',name:'Sentadilla goblet',equipment:'mancuernas'};const html=vm.runInContext('renderExerciseVisual(testExercise)',context);assert.ok(!html.includes('data-visual-generated='));assert.ok(!html.includes('is-generated'));
});
check('la app carga el registro antes del render y no carga los SVG rechazados',()=>{
  const app=read('app.html');assert.ok(app.indexOf('src="assets/js/exercise-generated-media.js')<app.indexOf('src="assets/js/exercise-visuals.js'));assert.ok(!app.includes('src="assets/js/exercise-illustrations.js'));assert.match(app,/\.exercise-visual-card\.is-generated \.exercise-visual-stage\{height:0;padding-top:66\.666667%/);
});
console.log('\n'+checks+'/'+checks+' comprobaciones de biblioteca generada correctas · '+catalogue.length+' referencias · '+registered.length+' imágenes.');
