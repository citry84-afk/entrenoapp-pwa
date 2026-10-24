#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { tmpdir } = require('node:os');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const daysArg = process.argv.find((arg) => arg.startsWith('--days='));
const days = Math.max(1, Math.min(90, Number(daysArg?.split('=')[1] || 30) || 30));
const outputJson = process.argv.includes('--json');

function adminToken() {
  if (process.env.ANALYTICS_ADMIN_TOKEN) return process.env.ANALYTICS_ADMIN_TOKEN;
  try {
    const siteId = JSON.parse(readFileSync(join(__dirname, '../.netlify/state.json'), 'utf8')).siteId;
    if (!siteId) throw new Error('Falta el proyecto vinculado.');
    const args = ['env:get', 'ANALYTICS_ADMIN_TOKEN', '--site', siteId, '--context', 'production'];
    const localCli = process.env.NETLIFY_CLI_PATH;
    return execFileSync(localCli ? process.execPath : 'npx', localCli ? [localCli, ...args] : ['--yes', 'netlify-cli@27.1.2', ...args], {
      cwd: tmpdir(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 45000,
    }).trim();
  } catch {
    return '';
  }
}

function row(label, value) {
  console.log(`${label.padEnd(34)} ${String(value).padStart(8)}`);
}

async function main() {
  const token = adminToken();
  if (!token) throw new Error('Falta ANALYTICS_ADMIN_TOKEN en Netlify o en el entorno local.');
  const response = await fetch(`https://entrenoapp.com/api/analytics/report?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`El informe respondió ${response.status}.`);
  const report = await response.json();
  if (outputJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\nEntrenoApp · últimos ${report.period.days} días (${report.period.from} → ${report.period.to})\n`);
  row('Vistas de páginas de captación', report.marketing?.page_views || 0);
  row('Clics hacia app/tiendas', report.marketing?.cta_clicks || 0);
  console.log('Recuentos de eventos, no usuarios únicos ni conversiones por cohorte.');
  row('Relación eventos CTA / vistas', `${report.marketing?.page_to_cta_pct || 0}%`);
  console.log('');
  for (const stage of report.funnel) row(`${stage.label} (${stage.conversion_from_previous_pct}%)`, stage.count);
  console.log('');
  row('Paywalls vistos', report.purchases.paywall_views);
  row('Compras iniciadas', report.purchases.started);
  row('Compras completadas', report.purchases.completed);
  row('Conversión paywall → compra', `${report.purchases.paywall_to_purchase_pct}%`);
  row('Restauraciones', report.purchases.restored);
  row('Activados en 24 h', report.retention.activated_in_24h);
  row('Segundo entreno en 7 días', report.retention.second_workout_in_7d);
  row('Retorno después de 7 días', report.retention.returned_after_7d);
  console.log('');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
