#!/usr/bin/env node
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appFile = `file://${path.join(root, 'app.html')}`;
const chromePaths = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

const formats = [
  {
    name: 'iOS 6.9-inch',
    outDir: path.join(root, 'app-store-screenshots', 'iphone-6.9-1320x2868'),
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 3,
    clean: (file) => file.toLowerCase().endsWith('.png'),
    fileName: (shot) => shot.iosName
  },
  {
    name: 'Google Play',
    outDir: path.join(root, 'play-store-assets'),
    viewport: { width: 432, height: 936 },
    deviceScaleFactor: 2.5,
    clean: (file) => /^captura-.*\.png$/i.test(file),
    fileName: (shot) => shot.androidName
  }
];

const shots = [
  {
    iosName: '01-rutina-lista.png',
    androidName: 'captura-01-rutina-lista.png',
    title: 'Tu entrenamiento de hoy, sin distracciones',
    subtitle: 'Elige tu objetivo y EntrenoApp te lleva directo a lo importante.',
    accent: '#5ba7ff',
    setup: async (page) => page.evaluate(() => {
      document.getElementById('app').style.display = 'none';
      document.getElementById('onboarding').style.display = 'none';
      document.getElementById('ob-fork').style.display = 'flex';
    })
  },
  {
    iosName: '02-registra-series.png',
    androidName: 'captura-02-registra-series.png',
    title: 'Cada ejercicio, claro y paso a paso',
    subtitle: 'Peso, repeticiones, objetivo y descanso en una sola pantalla.',
    accent: '#65d99b',
    setup: async (page) => {
      await showApp(page, 'workout');
      await page.evaluate(() => {
        goDay(0);
        const day = todayDay(S.routine[0]);
        const first = day.exercises[0];
        const key = exKey(first, 0);
        W.openEx = key;
        (WD[key] || []).forEach((set, index) => {
          set.kg = 45 + index * 2.5;
          set.reps = index === 0 ? 8 : 10;
          set.done = index === 0;
        });
        renderWorkout();
      });
    }
  },
  {
    iosName: '03-sabes-que-toca.png',
    androidName: 'captura-03-sabes-que-toca.png',
    title: 'Abre, mira qué toca y empieza',
    subtitle: 'El entrenamiento del día es siempre el protagonista.',
    accent: '#ffb35c',
    setup: async (page) => showApp(page, 'home')
  },
  {
    iosName: '04-adapta-tu-dia.png',
    androidName: 'captura-04-adapta-tu-dia.png',
    title: 'Adapta el entrenamiento a tu día',
    subtitle: 'Normal, corto o suave: mantener la constancia también es progreso.',
    accent: '#c795ff',
    setup: async (page) => {
      await showApp(page, 'home');
      await page.evaluate(() => openWorkoutPreview(0, 'express'));
    }
  },
  {
    iosName: '05-progreso-real.png',
    androidName: 'captura-05-progreso-real.png',
    title: 'Mira tu progreso de verdad',
    subtitle: 'Series, volumen, constancia y mejores marcas sin hojas de cálculo.',
    accent: '#5ba7ff',
    setup: async (page) => showApp(page, 'progress')
  },
  {
    iosName: '06-sin-cuenta.png',
    androidName: 'captura-06-sin-cuenta.png',
    title: 'Sin cuenta. Tus datos son tuyos',
    subtitle: 'Empieza al instante y exporta una copia cuando quieras.',
    accent: '#65d99b',
    setup: async (page) => {
      await showApp(page, 'settings');
      await page.evaluate(() => {
        const heading = [...document.querySelectorAll('.section-title')].find((el) => el.textContent.includes('Datos y copia'));
        heading?.parentElement?.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    }
  }
];

function cleanPngs(dir, shouldDelete) {
  fs.mkdirSync(dir, { recursive: true });
  for (const file of fs.readdirSync(dir)) {
    if (shouldDelete(file)) fs.unlinkSync(path.join(dir, file));
  }
}

async function launchBrowser() {
  const executablePath = chromePaths.find((candidate) => fs.existsSync(candidate));
  if (!executablePath) throw new Error('No se encontró Chrome. Define CHROME_PATH para generar las capturas.');
  return chromium.launch({ headless: true, executablePath });
}

async function seed(page) {
  await page.goto(appFile, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    const profile = {
      mode: 'musculacion', priority: 'musculo', goal: 'musculo', equipment: 'gym',
      time: '40', days: '4', experience: 'intermedio'
    };
    const routine = genRoutine(profile);
    const now = Date.now();
    const asISO = (daysAgo) => new Date(now - daysAgo * 86400000).toISOString();
    const setsFor = (ex, offset = 0) => Array.from({ length: ex.sets || 1 }, (_, index) => ({
      kg: ex.type === 'run' ? 0 : Math.round((35 + offset + index * 2.5) * 2) / 2,
      reps: ex.type === 'run' ? (ex.durationMin || 20) : (index % 2 ? 10 : 8),
      done: true
    }));
    const makeSession = (day, daysAgo, mode, feel, bodyWeight) => {
      const exercises = day.exercises.map((ex, index) => ({
        id: ex.id, baseId: ex.id, name: ex.name, type: ex.type || 'strength',
        durationMin: ex.durationMin || 0, sets: setsFor(ex, index * 3)
      }));
      const sets = exercises.flatMap((ex) => ex.sets);
      const volume = sets.reduce((sum, set) => sum + ((Number(set.kg) || 0) * (Number(set.reps) || 0)), 0);
      return {
        id: now - daysAgo * 86400000, date: asISO(daysAgo), dayName: day.name, mode,
        durationMin: 42, exercises, bodyWeight: String(bodyWeight), feel,
        notes: 'Buena técnica y una repetición más en la última serie.',
        summary: { done: sets.length, total: sets.length, reps: sets.reduce((sum, set) => sum + Number(set.reps || 0), 0), volume, pct: 100 }
      };
    };
    const sessions = [
      makeSession(routine[0], 13, 'normal', 'bien', 74.8),
      makeSession(routine[1], 10, 'express', 'bien', 74.6),
      makeSession(routine[2], 7, 'normal', 'muy_bien', 74.4),
      makeSession(routine[3], 4, 'suave', 'bien', 74.2),
      makeSession(routine[0], 1, 'normal', 'muy_bien', 74.0)
    ];
    localStorage.setItem('ea_lang', 'es');
    localStorage.setItem('ea_review_store_opened', 'store-screenshot');
    localStorage.setItem('ea_event_app_first_open', 'store-screenshot');
    localStorage.setItem('ea6', JSON.stringify({
      profile, routine, sessions,
      bodyWeights: [
        { date: asISO(28), weight: 75.2 }, { date: asISO(21), weight: 74.9 },
        { date: asISO(14), weight: 74.6 }, { date: asISO(7), weight: 74.3 }, { date: asISO(1), weight: 74.0 }
      ],
      curDay: 0, manualToday: false, achievements: ['first', 'week3', 'streak3', 'smart_mode'],
      lang: 'es', tourSeen: true, helpDismissed: true
    }));
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`habits_${today}`, JSON.stringify({ sleep: true, move: true, fuel: false }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.body.classList.add('cap-native');
    document.getElementById('ob-fork').style.display = 'none';
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    hydrate();
    nav('home');
  });
}

async function showApp(page, screen) {
  await page.evaluate((target) => {
    if (typeof stopTimer === 'function') stopTimer();
    document.body.classList.add('cap-native');
    document.getElementById('ob-fork').style.display = 'none';
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('summary-modal')?.classList.remove('show');
    hydrate();
    nav(target);
    document.getElementById('content')?.scrollTo({ top: 0, behavior: 'instant' });
  }, screen);
}

async function resetFrame(page) {
  await page.evaluate(() => {
    if (typeof stopTimer === 'function') stopTimer();
    document.getElementById('store-shot-banner')?.remove();
    document.getElementById('store-shot-style')?.remove();
    document.body.classList.remove('store-shot');
    document.getElementById('summary-modal')?.classList.remove('show');
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  });
}

async function addMarketingFrame(page, shot) {
  const frame = { title: shot.title, subtitle: shot.subtitle, accent: shot.accent };
  await page.evaluate(({ title, subtitle, accent }) => {
    document.body.classList.add('store-shot', 'cap-native');
    const style = document.createElement('style');
    style.id = 'store-shot-style';
    style.textContent = `
      body.store-shot{overflow:hidden!important;background:#07101d!important}
      #store-shot-banner{position:fixed;inset:0 0 auto 0;height:176px;z-index:10000;padding:20px 24px 18px;background:linear-gradient(145deg,#0b1729,#101f35);border-bottom:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;justify-content:center}
      #store-shot-banner:after{content:"";position:absolute;right:-52px;top:-76px;width:210px;height:210px;border-radius:50%;background:${accent};filter:blur(70px);opacity:.28}
      #store-shot-banner .store-brand{position:relative;z-index:1;color:${accent};font-size:13px;font-weight:900;letter-spacing:2.2px;margin-bottom:7px}
      #store-shot-banner h1{position:relative;z-index:1;color:#fff;font-size:29px;line-height:1.03;letter-spacing:-1.05px;font-weight:950;max-width:390px;margin:0 0 7px}
      #store-shot-banner p{position:relative;z-index:1;color:#c2cce0;font-size:14px;line-height:1.28;font-weight:600;max-width:380px;margin:0}
      body.store-shot #app{position:fixed!important;inset:176px 0 0!important;height:auto!important;min-height:0!important;margin:0!important}
      body.store-shot #onboarding,body.store-shot #ob-fork,body.store-shot #routine-builder{inset:176px 0 0!important;height:auto!important;min-height:0!important}
      body.store-shot #summary-modal{inset:176px 0 0!important;height:auto!important}
      body.store-shot #summary-modal .summary-sheet{max-height:calc(100vh - 208px)!important}
      body.store-shot .content{overflow-y:auto!important}
    `;
    const banner = document.createElement('div');
    banner.id = 'store-shot-banner';
    banner.innerHTML = `<div class="store-brand">ENTRENOAPP</div><h1>${title}</h1><p>${subtitle}</p>`;
    document.head.appendChild(style);
    document.body.appendChild(banner);
  }, frame);
}

async function generatePlayFeatureGraphic(browser) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;width:1024px;height:500px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#07101d;color:#fff}
    body{position:relative;display:grid;grid-template-columns:58% 42%;background:radial-gradient(circle at 88% 18%,rgba(47,140,255,.32),transparent 31%),linear-gradient(145deg,#08111f,#0e1b30)}
    body:after{content:"";position:absolute;inset:auto -100px -160px auto;width:430px;height:430px;border-radius:50%;background:#35d07f;filter:blur(120px);opacity:.15}
    .copy{padding:54px 30px 42px 64px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
    .brand{color:#5ba7ff;font-size:18px;font-weight:950;letter-spacing:3.5px;margin-bottom:18px}
    h1{font-size:52px;line-height:.98;letter-spacing:-2.2px;margin:0 0 18px;font-weight:950;max-width:560px}
    p{font-size:21px;line-height:1.35;color:#c2cce0;margin:0;max-width:540px;font-weight:650}
    .chips{display:flex;gap:10px;margin-top:24px}.chip{border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);padding:9px 13px;border-radius:999px;font-size:14px;font-weight:850;color:#eef4ff}
    .visual{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;padding:34px 52px 34px 12px}
    .phone{width:356px;height:430px;border-radius:42px;border:2px solid rgba(91,167,255,.55);background:linear-gradient(180deg,#0d1d34,#080d18);box-shadow:0 32px 75px rgba(0,0,0,.48);padding:25px 24px;transform:rotate(2deg)}
    .mini{color:#70b0ff;font-size:12px;font-weight:950;letter-spacing:2px}.day{font-size:31px;font-weight:950;margin:5px 0 17px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:12px 7px;text-align:center}.stat b{display:block;font-size:18px}.stat span{font-size:9px;color:#9aa8bd;font-weight:800;text-transform:uppercase}
    .next{margin-top:16px;border:1px solid rgba(53,208,127,.35);background:rgba(53,208,127,.1);border-radius:18px;padding:15px}.next small{display:block;color:#65d99b;font-size:11px;font-weight:900;letter-spacing:1px}.next strong{display:block;font-size:21px;margin:5px 0}.set{display:grid;grid-template-columns:1fr auto;gap:10px;color:#bdc8da;font-size:14px}.done{margin-top:16px;background:#2f8cff;border-radius:16px;padding:13px;text-align:center;font-weight:900}
  </style></head><body>
    <section class="copy"><div class="brand">ENTRENOAPP</div><h1>Abre. Mira qué toca. Entrena.</h1><p>Tu entrenamiento de hoy, claro y sin distracciones.</p><div class="chips"><div class="chip">Sin cuenta</div><div class="chip">Plan flexible</div><div class="chip">Progreso real</div></div></section>
    <section class="visual"><div class="phone"><div class="mini">ENTRENO DE HOY</div><div class="day">Día 1 · Upper A</div><div class="stats"><div class="stat"><b>42 min</b><span>Duración</span></div><div class="stat"><b>3.2k</b><span>Volumen</span></div><div class="stat"><b>8/12</b><span>Series</span></div></div><div class="next"><small>SIGUIENTE SERIE</small><strong>Press de banca</strong><div class="set"><span>47,5 kg × 10 reps</span><span>2/3</span></div></div><div class="done">Marcar serie hecha</div></div></section>
  </body></html>`, { waitUntil: 'domcontentloaded' });
  const target = path.join(root, 'play-store-assets', 'grafico-funciones-1024x500.png');
  await page.screenshot({ path: target, fullPage: false });
  await page.close();
  console.log(`created Google Play feature graphic: ${target}`);
}

(async () => {
  const browser = await launchBrowser();
  for (const format of formats) {
    cleanPngs(format.outDir, format.clean);
    const page = await browser.newPage({
      viewport: format.viewport,
      deviceScaleFactor: format.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    });
    await seed(page);
    for (const shot of shots) {
      await resetFrame(page);
      await shot.setup(page);
      await addMarketingFrame(page, shot);
      await page.waitForTimeout(700);
      const target = path.join(format.outDir, format.fileName(shot));
      await page.screenshot({ path: target, fullPage: false });
      console.log(`created ${format.name}: ${target}`);
    }
    await page.close();
  }
  await generatePlayFeatureGraphic(browser);
  await browser.close();
  console.log('\nDone. Six benefit-led screenshots were generated for each store.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
