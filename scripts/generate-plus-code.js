#!/usr/bin/env node
const crypto = require('node:crypto');

const label = String(process.argv[2] || 'INVITADO').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'INVITADO';
const months = Math.max(1, Number(process.argv[3] || 3));
const maxUses = Math.max(1, Number(process.argv[4] || 10));
const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
const code = `${label}-${suffix}`;

console.log(`Código: ${code}`);
console.log('Añade esta entrada al JSON de PLUS_ACCESS_CODES en Netlify:');
console.log(JSON.stringify({ [code]: { months, maxUses, label } }, null, 2));

