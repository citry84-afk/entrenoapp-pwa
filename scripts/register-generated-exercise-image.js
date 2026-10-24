#!/usr/bin/env node
'use strict';
// Import a visually checked built-in image_gen result, optimise it and retain its prompt.
// It never calls a paid API and never changes a source image or an existing asset.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const audit=path.join(root,'audits/2026-10-24');
function arg(name){const i=process.argv.indexOf('--'+name);return i<0?null:process.argv[i+1];}
function fail(message){throw new Error(message);}
const key=arg('key');
if(!key||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key))fail('Use --key with an exact planned asset slug');
const plan=JSON.parse(fs.readFileSync(path.join(audit,'generated-exercise-plan.json'),'utf8'));
const entries=Array.isArray(plan)?plan:(plan.assets||plan.illustrations||plan.groups||[]);
const item=entries.find(entry=>entry.key===key);
if(!item)fail('Unknown planned key: '+key);
const style=fs.readFileSync(path.join(audit,'generated-image-style.md'),'utf8').split('## Prompt base\n\n')[1].split('\n## Revisión')[0].trim();
const brief=item.instructions||item.brief||item.prompt||item.generationBrief;
if(!brief)fail('The planned item needs a movement-specific brief');
const instructions=typeof brief==='string'?brief:JSON.stringify(brief);
const kind=item.kind||'positions';
const promptFile=arg('prompt-file');
const prompt=promptFile?fs.readFileSync(path.resolve(promptFile),'utf8'):style+'\n\nMovement-specific brief:\n'+instructions+'\n\nPresentation: '+(kind==='overview'?'This is an indicative overview of the stated block/options, NOT two phases of a single exercise. Do not silently select one unspecified load or technique.':'Two separate side-by-side key positions of this exact exercise; these are static instructional illustrations, not frames of a continuous animation.');
if(prompt.length<100)fail('The exact generation prompt must be recorded');
if(process.argv.includes('--prompt')){process.stdout.write(prompt+'\n');process.exit(0);}
const source=arg('source'),review=arg('review');
if(!source||!path.isAbsolute(source)||!fs.existsSync(source))fail('Use --source with an existing absolute generated image path');
if(!review||review.length<30)fail('Use --review with an honest visual check note (at least 30 characters)');
const version=Number(arg('version')||1);
if(!Number.isInteger(version)||version<1||version>99)fail('Invalid version');
const relative='generated/'+key+'-v'+version+'.webp';
const destination=path.join(root,'assets/exercise-media',relative);
const recordDir=path.join(audit,'generated-image-records');
const recordPath=path.join(recordDir,key+'.json');
if(fs.existsSync(destination))fail('Asset exists; use a new --version, never overwrite an accepted image');
fs.mkdirSync(path.dirname(destination),{recursive:true});fs.mkdirSync(recordDir,{recursive:true});
const result=cp.spawnSync('/opt/homebrew/bin/cwebp',['-quiet','-q','84','-m','6','-resize','1280','0','-metadata','none',source,'-o',destination],{encoding:'utf8'});
if(result.status!==0)fail(result.stderr||'WebP conversion failed');
const fallbackFile=relative.replace(/\.webp$/,'.jpg'),fallbackPath=path.join(root,'assets/exercise-media',fallbackFile);
const jpeg=cp.spawnSync('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','80',destination,'--out',fallbackPath],{encoding:'utf8'});
if(jpeg.status!==0)fail(jpeg.stderr||'JPEG compatibility conversion failed');
const title=item.title||item.titleEs||key;
const titleEs=typeof title==='object'?title.es:title;
const titleEn=typeof title==='object'?title.en:(item.titleEn||key);
const alt=item.alt||{es:titleEs+(kind==='overview'?': vista orientativa del bloque.':': dos posiciones del ejercicio.'),en:titleEn+(kind==='overview'?': indicative block overview.':': two exercise positions.')};
const record={key,file:relative,fallbackFile,alt,kind,source:'generated',status:'reviewed',createdAt:new Date().toISOString(),tool:'built-in image_gen',original:source,prompt,visualReview:review,reviewType:'AI visual inspection, not clinical or certified-coach validation',bytes:fs.statSync(destination).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex'),fallbackBytes:fs.statSync(fallbackPath).size,fallbackSha256:crypto.createHash('sha256').update(fs.readFileSync(fallbackPath)).digest('hex')};
fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');
process.stdout.write(JSON.stringify({key,file:relative,bytes:record.bytes,record:path.relative(root,recordPath)})+'\n');
