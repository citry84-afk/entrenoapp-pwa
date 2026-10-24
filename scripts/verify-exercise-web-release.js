#!/usr/bin/env node
'use strict';
// Verify the public, immutable staged release. Never reads profiles or credentials.
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

async function main() {
  const [baseInput, snapshotInput, reportInput] = process.argv.slice(2);
  if (!baseInput || !snapshotInput) throw new Error('Usage: verify-exercise-web-release.js HTTPS_ORIGIN STAGED_DIRECTORY [REPORT_JSON]');
  const base = new URL(baseInput);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash || !(base.hostname === 'entrenoapp.com' || base.hostname.endsWith('.netlify.app'))) throw new Error('Expected the public EntrenoApp deployment origin');
  const snapshot = path.resolve(snapshotInput);
  const context = vm.createContext({});
  vm.runInContext(await fs.readFile(path.join(snapshot, 'assets/js/exercise-generated-media.js'), 'utf8'), context);
  const assets = vm.runInContext('exerciseGeneratedMediaCatalogue()', context);
  if (!assets.length) throw new Error('No generated media in staged release');
  const files = ['app.html', 'assets/exercise-media/CREDITS.md', ...['exercise-muscles', 'exercise-media', 'exercise-generated-media', 'exercise-visual-catalogue', 'exercise-visuals'].map(name => 'assets/js/' + name + '.js')];
  for (const asset of assets) {
    if (!/^generated\/[a-z0-9][a-z0-9-]*-v[1-9][0-9]*\.webp$/.test(asset.file) || asset.fallbackFile !== asset.file.replace(/\.webp$/, '.jpg')) throw new Error('Unsafe or incomplete staged media: ' + asset.key);
    files.push('assets/exercise-media/' + asset.file, 'assets/exercise-media/' + asset.fallbackFile);
  }
  const unique = [...new Set(files)];
  const results = [];
  const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const file = unique[cursor++];
      const expected = await fs.readFile(path.join(snapshot, file));
      const response = await fetch(new URL(file, base), {redirect: 'error', signal: AbortSignal.timeout(30000)});
      if (response.status !== 200) throw new Error(file + ': HTTP ' + response.status);
      const type = (response.headers.get('content-type') || '').split(';')[0].trim();
      if ((file.endsWith('.webp') && type !== 'image/webp') || (file.endsWith('.jpg') && type !== 'image/jpeg') || (file.endsWith('.js') && !/(?:java|ecma)script/.test(type)) || (file.endsWith('.html') && type !== 'text/html')) throw new Error(file + ': unexpected Content-Type ' + type);
      const actual = Buffer.from(await response.arrayBuffer());
      const hash = sha256(expected);
      if (actual.length !== expected.length || sha256(actual) !== hash) throw new Error(file + ': deployment differs from staged snapshot');
      results.push({file, status: response.status, contentType: type, bytes: actual.length, sha256: hash});
      if (results.length % 40 === 0) process.stderr.write('Verified ' + results.length + '/' + unique.length + ' public files\n');
    }
  }
  await Promise.all(Array.from({length: 8}, worker));
  const report = {checkedAt: new Date().toISOString(), baseUrl: base.origin, stagedDirectory: snapshot, generatedAssets: assets.length, verifiedFiles: results.length, totalBytes: results.reduce((sum, file) => sum + file.bytes, 0), files: results.sort((a, b) => a.file.localeCompare(b.file))};
  if (reportInput) await fs.writeFile(path.resolve(reportInput), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({baseUrl: report.baseUrl, generatedAssets: report.generatedAssets, verifiedFiles: report.verifiedFiles, totalBytes: report.totalBytes, report: reportInput || null}));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
