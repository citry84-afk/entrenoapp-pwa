#!/usr/bin/env node
'use strict';
// Format conversion only: preserve the reviewed composition and WebP original.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'audits/2026-10-24/generated-image-records');
let added=0;
for(const file of fs.readdirSync(dir).filter(file=>file.endsWith('.json'))){
  const recordPath=path.join(dir,file),record=JSON.parse(fs.readFileSync(recordPath,'utf8'));
  if(record.fallbackFile)continue;
  if(!/^generated\/[a-z0-9-]+-v[1-9][0-9]*\.webp$/.test(record.file))throw new Error('Unsafe source path');
  const fallbackFile=record.file.replace(/\.webp$/,'.jpg'),destination=path.join(root,'assets/exercise-media',fallbackFile);
  if(fs.existsSync(destination))throw new Error('Untracked fallback already exists: '+fallbackFile);
  const result=cp.spawnSync('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','80',path.join(root,'assets/exercise-media',record.file),'--out',destination],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||'JPEG conversion failed');
  const data=fs.readFileSync(destination);if(data[0]!==255||data[1]!==216)throw new Error('Not a JPEG');
  record.fallbackFile=fallbackFile;record.fallbackBytes=data.length;record.fallbackSha256=crypto.createHash('sha256').update(data).digest('hex');
  fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');added++;
}
console.log(JSON.stringify({addedJpegFallbacks:added}));
