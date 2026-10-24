#!/usr/bin/env node
// Stage only public web assets; never upload the workspace or credentials.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

async function main() {
  const root = path.resolve(__dirname, '..');
  const target = await fs.mkdtemp(path.join(os.tmpdir(), 'entrenoapp-web-release-'));
  const publicFiles = new Set(['robots.txt', 'ads.txt', 'app-ads.txt', 'sitemap.xml', 'manifest.json', 'sw.js', '_redirects', '_headers']);
  const publicDirs = new Set(['assets', 'css', 'js', '.well-known', 'identity-emails']);
  console.log(`Staging: ${target}`);
  let count = 0;
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if ((entry.isFile() && (entry.name.endsWith('.html') || publicFiles.has(entry.name))) || (entry.isDirectory() && publicDirs.has(entry.name))) {
      console.log(`Copying ${entry.name}`);
      await fs.cp(path.join(root, entry.name), path.join(target, entry.name), { recursive: entry.isDirectory(), dereference: false });
      count++;
    }
  }
  console.log(`Ready: ${target} (${count} entries)`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
