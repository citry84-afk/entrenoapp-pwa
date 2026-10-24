#!/usr/bin/env node
'use strict';
// Deterministic build from individually reviewed image records. No API calls.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const fsp=fs.promises;
async function main(){
const root=path.resolve(__dirname,'..');
const audit=path.join(root,'audits/2026-10-24');
const plan=JSON.parse(await fsp.readFile(path.join(audit,'generated-exercise-plan.json'),'utf8'));
const assets=Array.isArray(plan)?plan:plan.assets;
if(!Array.isArray(assets)||!assets.length)throw new Error('Missing planned assets');
const recordDir=path.join(audit,'generated-image-records');
const records=fs.existsSync(recordDir)?await Promise.all((await fsp.readdir(recordDir)).filter(file=>file.endsWith('.json')).sort().map(async file=>JSON.parse(await fsp.readFile(path.join(recordDir,file),'utf8')))):[];
const byKey=new Map();
const seenKeys=new Set();
const definitions={};
async function validateRecord(record){
  const planned=assets.find(asset=>asset.key===record.key);
  if(!planned)throw new Error('Unplanned image record: '+record.key);
  if(seenKeys.has(record.key))throw new Error('Duplicate record: '+record.key);
  seenKeys.add(record.key);
  if(record.status!=='reviewed'||record.source!=='generated'||!['positions','overview'].includes(record.kind)||record.kind!==planned.kind)throw new Error('Unreviewed or inconsistent record: '+record.key);
  if(!/^generated\/[a-z0-9][a-z0-9-]*-v[1-9][0-9]*\.webp$/.test(record.file))throw new Error('Unsafe asset path');
  if(!record.alt||!['es','en'].every(lang=>typeof record.alt[lang]==='string'&&record.alt[lang].length>=12))throw new Error('Missing bilingual description');
  if(typeof record.prompt!=='string'||record.prompt.length<100||typeof record.visualReview!=='string'||record.visualReview.length<30)throw new Error('Missing generation/review provenance');
  const file=path.join(root,'assets/exercise-media',record.file);
  const data=await fsp.readFile(file);
  if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP')throw new Error('Not a WebP: '+record.file);
  const sha256=crypto.createHash('sha256').update(data).digest('hex');
  if(sha256!==record.sha256||data.length!==record.bytes)throw new Error('Asset changed after review: '+record.key);
  if(data.length>600000)throw new Error('Optimise asset over 600 KB: '+record.key);
  if(!record.fallbackFile||!/^generated\/[a-z0-9][a-z0-9-]*-v[1-9][0-9]*\.jpg$/.test(record.fallbackFile)||record.fallbackFile!==record.file.replace(/\.webp$/,'.jpg'))throw new Error('Missing or mismatched JPEG fallback: '+record.key);
  const fallback=await fsp.readFile(path.join(root,'assets/exercise-media',record.fallbackFile));
  if(fallback[0]!==255||fallback[1]!==216||fallback.length!==record.fallbackBytes||crypto.createHash('sha256').update(fallback).digest('hex')!==record.fallbackSha256)throw new Error('JPEG changed after conversion: '+record.key);
  if(fallback.length>600000)throw new Error('Optimise JPEG over 600 KB: '+record.key);
  return{file:record.file,fallbackFile:record.fallbackFile,alt:record.alt,kind:record.kind,source:'generated',status:'reviewed'};
}
// Asynchronous reads use Node's bounded filesystem pool. Keep output order stable.
const validated=await Promise.all(records.map(validateRecord));
for(let index=0;index<records.length;index++){
  byKey.set(records[index].key,records[index]);
  definitions[records[index].key]=validated[index];
}
const missing=assets.filter(asset=>!byKey.has(asset.key));
if(process.argv.includes('--require-complete')&&missing.length)throw new Error('Incomplete image library: '+missing.length+' missing');
if(process.argv.includes('--update-plan')){
  for(const asset of assets){
    const record=byKey.get(asset.key);if(!record)continue;
    asset.generationStatus='generated';asset.reviewStatus='reviewed';asset.plannedFile=record.file;asset.alt={...record.alt};asset.prompt=record.prompt;
    const brief=record.prompt.match(/Movement-specific brief:\n([\s\S]*?)\n\nPresentation:/);if(brief)asset.instructions=brief[1];
  }
  if(!Array.isArray(plan)){
    plan.status=missing.length?'in_progress':'reviewed';
    plan.summary={...plan.summary,identities:assets.reduce((sum,asset)=>sum+asset.identities.length,0),reusableAssets:assets.length,positions:assets.filter(asset=>asset.kind==='positions').length,overview:assets.filter(asset=>asset.kind==='overview').length,reviewedAssets:records.length};
  }
  fs.writeFileSync(path.join(audit,'generated-exercise-plan.json'),JSON.stringify(plan,null,2)+'\n');
}
if(process.argv.includes('--write')){
  const code='/* Generated from visually reviewed image records. Run scripts/compile-generated-exercise-media.js --write.\n * Original EntrenoApp AI illustrations; not Everkinetic media or a continuous video.\n * Prompts and review provenance: audits/2026-10-24/generated-image-records/.\n */\n(function(root){\n  \'use strict\';\n  const entries='+JSON.stringify(definitions,null,2)+';\n  const clone=asset=>asset?{...asset,alt:{...asset.alt}}:null;\n  function media(key){return typeof key===\'string\'&&Object.prototype.hasOwnProperty.call(entries,key)?clone(entries[key]):null;}\n  function catalogue(){return Object.entries(entries).map(([key,asset])=>({key,...clone(asset)}));}\n  root.exerciseGeneratedMedia=media;\n  root.exerciseGeneratedMediaCatalogue=catalogue;\n})(globalThis);\n';
  fs.writeFileSync(path.join(root,'assets/js/exercise-generated-media.js'),code);
}
const totalBytes=records.reduce((sum,record)=>sum+record.bytes+(record.fallbackBytes||0),0);
process.stdout.write(JSON.stringify({planned:assets.length,reviewed:records.length,remaining:missing.length,totalBytes,missing:process.argv.includes('--list-missing')?missing.map(asset=>asset.key):undefined})+'\n');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
