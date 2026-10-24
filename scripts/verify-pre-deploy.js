/**
 * Verificación rápida antes de deploy (Netlify).
 * Uso: npm run verify
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PHANTOM_PUB = 'ca-pub-4129506161314540';
const ACTIVE_PUB = 'ca-pub-4837743291717475';

function die(msg) {
  console.error('❌', msg);
  process.exit(1);
}

function warn(msg) {
  console.warn('⚠️ ', msg);
}

const requiredRoot = [
  'netlify.toml',
  'sitemap.xml',
  'robots.txt',
  'ads.txt',
  'manifest.json',
];
const revenueCatConfig = path.join(root, 'assets', 'config', 'revenuecat.js');
const appHtmlPath = path.join(root, 'app.html');
const indexHtmlPath = path.join(root, 'index.html');
const iosInfoPlistPath = path.join(root, 'ios', 'App', 'App', 'Info.plist');
const analyticsEventPath = path.join(root, 'netlify', 'functions', 'analytics-event.ts');
const analyticsReportPath = path.join(root, 'netlify', 'functions', 'analytics-report.ts');

console.log('🔍 verify-pre-deploy — EntrenoApp\n');

for (const f of requiredRoot) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) die(`Falta archivo obligatorio en la raíz: ${f}`);
}

if (!fs.existsSync(revenueCatConfig)) {
  warn('Falta assets/config/revenuecat.js; Plus por suscripción no podrá abrir productos nativos.');
} else {
  const rc = fs.readFileSync(revenueCatConfig, 'utf8');
  if (!/ENTRENOAPP_REVENUECAT_IOS_KEY\s*=\s*["']appl_/i.test(rc)) {
    warn('RevenueCat iOS public key vacía o no parece empezar por appl_. Completar antes de publicar Plus.');
  }
  if (!/ENTRENOAPP_REVENUECAT_ANDROID_KEY\s*=\s*["']goog_/i.test(rc)) {
    warn('RevenueCat Android public key vacía o no parece empezar por goog_. Completar antes de publicar Plus.');
  }
}

if (!fs.existsSync(analyticsEventPath) || !fs.existsSync(analyticsReportPath)) {
  die('Faltan las funciones de analítica de producto o del informe protegido.');
}

if (fs.existsSync(iosInfoPlistPath)) {
  const infoPlist = fs.readFileSync(iosInfoPlistPath, 'utf8');
  if (!infoPlist.includes('NSUserTrackingUsageDescription')) {
    die('La app iOS incluye Google Mobile Ads y debe declarar NSUserTrackingUsageDescription.');
  }
  if (!infoPlist.includes('ITSAppUsesNonExemptEncryption')) {
    die('Info.plist debe declarar ITSAppUsesNonExemptEncryption para evitar preguntas de exportación innecesarias.');
  }
}

if (fs.existsSync(appHtmlPath)) {
  const appHtml = fs.readFileSync(appHtmlPath, 'utf8');
  if (/<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js/i.test(appHtml)) {
    die('app.html carga Google Analytics de forma estática y alcanzaría a la app nativa.');
  }
  if (!/isNativePlatform[\s\S]{0,1800}googletagmanager\.com\/gtag\/js/i.test(appHtml)) {
    die('app.html debe proteger Google Analytics con la detección de plataforma nativa.');
  }
  if (!/function adMobBannerOptions[\s\S]{0,500}npa\s*:\s*true/i.test(appHtml)) {
    die('Los anuncios nativos deben seguir solicitándose como no personalizados (npa:true).');
  }
  for (const eventName of ['onboarding_viewed', 'onboarding_started', 'onboarding_complete', 'first_workout_started', 'first_exercise_completed', 'first_workout_saved', 'plus_paywall_view', 'plus_purchase_started', 'plus_purchase_success', 'plus_restore_success', 'activation_first_workout_24h']) {
    if (!appHtml.includes(eventName)) die(`Falta el evento crítico de producto: ${eventName}`);
  }
  if (!/function openWelcomeWorkout[\s\S]{0,7000}function startWelcomeWorkout/.test(appHtml)) {
    die('Falta el recorrido directo al entrenamiento de bienvenida después del onboarding.');
  }
  if (!/function handleExerciseCompleted[\s\S]{0,1800}saveSession\(\)/.test(appHtml)) {
    die('El entrenamiento de bienvenida debe guardarse automáticamente al completarse.');
  }
  if (!/<meta[^>]+name=["']robots["'][^>]+content=["']noindex, follow["']/i.test(appHtml)) {
    die('app.html debe quedar fuera del índice: la portada y las guías son las páginas de captación.');
  }
  if (!/const latest=productAnalyticsQueue\(\)[\s\S]{0,600}latest\.splice\(index,1\)/.test(appHtml)) {
    die('La cola analítica debe retirar solo el evento enviado para no perder eventos concurrentes.');
  }
  if (!/function ensureNativeTrackingAuthorization[\s\S]{0,2200}trackingAuthorizationStatus[\s\S]{0,2200}requestTrackingAuthorization/i.test(appHtml)) {
    die('La app iOS debe consultar y solicitar ATT antes de iniciar Google Mobile Ads.');
  }
  const initAdMobStart = appHtml.indexOf('async function initAdMob');
  const attBeforeAdMob = appHtml.indexOf('await ensureNativeTrackingAuthorization()', initAdMobStart);
  const adMobInitialize = appHtml.indexOf('await AdMob.initialize', initAdMobStart);
  if (initAdMobStart < 0 || attBeforeAdMob < initAdMobStart || adMobInitialize < attBeforeAdMob) {
    die('initAdMob debe esperar la autorización ATT antes de llamar a AdMob.initialize.');
  }
}

if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  if (!/isNativePlatform[\s\S]{0,1800}googletagmanager\.com\/gtag\/js/i.test(indexHtml)) {
    die('index.html debe impedir Analytics dentro de las aplicaciones nativas.');
  }
  if (/pagead2\.googlesyndication\.com|adsbygoogle/i.test(indexHtml)) {
    die('La portada no debe cargar AdSense automático: distrae antes de explicar el producto.');
  }
  const demoPanels = (indexHtml.match(/data-demo-panel=/g) || []).length;
  if (demoPanels !== 5) {
    die(`La demostración principal debe conservar sus 5 pasos (encontrados: ${demoPanels}).`);
  }
  if (!/Crear mi entrenamiento gratis/.test(indexHtml) || !/data-demo-toggle/.test(indexHtml)) {
    die('La demostración principal necesita un CTA claro y control para pausar la animación.');
  }
}

const ads = fs.readFileSync(path.join(root, 'ads.txt'), 'utf8');
if (!ads.includes(ACTIVE_PUB.split(':')[1]) && !ads.includes('pub-4837743291717475')) {
  warn('ads.txt no parece contener el publisher activo esperado (revisa manualmente).');
}

const scanDirs = [
  path.join(root, 'js'),
  path.join(root, 'www', 'js'),
];
for (const dir of scanDirs) {
  if (!fs.existsSync(dir)) continue;
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith('.js')) {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(PHANTOM_PUB)) {
          die(`ID fantasma ${PHANTOM_PUB} encontrado en ${path.relative(root, full)}`);
        }
      }
    }
  };
  walk(dir);
}

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const issues = [];
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(c)) issues.push(`${f}: sin <title>`);
  const hasDesc =
    /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(c) ||
    /<meta[^>]*property\s*=\s*["']description["'][^>]*>/i.test(c);
  if (!hasDesc) issues.push(`${f}: sin meta description`);
}

if (issues.length) {
  console.warn(`\n⚠️  ${issues.length} aviso(s) en HTML de la raíz (no bloquean el deploy):\n`);
  issues.slice(0, 25).forEach((x) => warn(x));
  if (issues.length > 25) warn(`… y ${issues.length - 25} más`);
}

// Sitemap: comprobar que cada .html listado exista en la raíz
const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length > 35) die(`El sitemap vuelve a estar demasiado disperso (${locs.length} URLs; máximo previsto: 35).`);
if (locs.includes('https://entrenoapp.com/app.html')) die('app.html tiene noindex y no debe aparecer en el sitemap.');
for (const priorityUrl of [
  'https://entrenoapp.com/',
  'https://entrenoapp.com/app-entreno.html',
  'https://entrenoapp.com/controlar-rutina-gimnasio.html',
  'https://entrenoapp.com/rutina-gym-principiantes-2026.html',
  'https://entrenoapp.com/mejores-suplementos-deportivos-2026.html',
]) {
  if (!locs.includes(priorityUrl)) die(`Falta una URL prioritaria en sitemap.xml: ${priorityUrl}`);
}
for (const legacyUrl of [
  'https://entrenoapp.com/rutina-gym-principiantes-2025.html',
  'https://entrenoapp.com/empezar-a-correr.html',
  'https://entrenoapp.com/suplementos-recomendados.html',
]) {
  if (locs.includes(legacyUrl)) die(`Una URL antigua sigue dispersando el sitemap: ${legacyUrl}`);
}
let badLoc = 0;
for (const loc of locs) {
  let u;
  try {
    u = new URL(loc);
  } catch {
    badLoc++;
    warn(`URL inválida en sitemap: ${loc}`);
    continue;
  }
  if (!u.hostname.endsWith('entrenoapp.com')) continue;
  const pathname = u.pathname;
  if (pathname === '/' || pathname === '') continue;
  if (!pathname.endsWith('.html')) continue;
  const file = pathname.replace(/^\//, '');
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    badLoc++;
    warn(`Sitemap apunta a archivo inexistente: ${file}`);
  }
}

if (badLoc) die(`Sitemap: ${badLoc} problema(s) grave(s) con rutas.`);

console.log('\n✅ verify-pre-deploy OK (sin errores bloqueantes).\n');
process.exit(0);
