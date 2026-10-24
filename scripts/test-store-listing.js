#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'store-listing', '2026-10-21-tiempo-registro-progreso');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
let checked = 0;
function within(value, max, field, bytes = false) {
  assert.equal(typeof value, 'string', `${field} must be text`);
  assert.ok(value.trim(), `${field} cannot be empty`);
  const count = bytes ? Buffer.byteLength(value, 'utf8') : [...value].length;
  assert.ok(count <= max, `${field}: ${count} exceeds ${max}`);
  checked++;
}
for (const language of ['es-ES', 'en-US']) {
  const apple = read(`app-store/${language}.json`);
  for (const [key, limit] of Object.entries({name:30, subtitle:30, promotionalText:170, description:4000})) within(apple[key], limit, `Apple ${language} ${key}`);
  within(apple.keywords, 100, `Apple ${language} keywords`, true);
  for (const key of ['marketingUrl', 'supportUrl', 'privacyPolicyUrl']) assert.equal(new URL(apple[key]).hostname, 'entrenoapp.com');
  const google = read(`google-play/${language}.json`);
  for (const [key, limit] of Object.entries({title:30, shortDescription:80, fullDescription:4000})) within(google[key], limit, `Google ${language} ${key}`);
}
const notes = read('next-release-notes.json');
assert.equal(notes.status, 'DRAFT_NOT_SUBMITTED');
assert.equal(notes.version, null);
assert.equal(notes.build, null);
for (const language of ['es-ES', 'en-US']) {
  within(notes[language].appStore, 4000, `Apple ${language} release notes`);
  within(notes[language].googlePlay, 500, `Google ${language} release notes`);
}
console.log(`PASS: ${checked} localized store fields are within their limits; release notes remain an unsubmitted draft.`);
