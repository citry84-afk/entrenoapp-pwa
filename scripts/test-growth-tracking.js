const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../js/growth-tracking.js'), 'utf8');

function page(address, { referrer = '', pageName = 'home', language = 'es' } = {}) {
  const listeners = new Map();
  const requests = [];
  const gaEvents = [];
  const location = new URL(address);
  const context = {
    URL, URLSearchParams, location,
    window: {},
    document: {
      referrer,
      body: { dataset: { page: pageName } },
      documentElement: { lang: language },
      addEventListener(name, handler) { listeners.set(name, handler); },
    },
    fetch(url, options) {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return Promise.resolve({ ok: true });
    },
    gtag(...args) { gaEvents.push(args); },
  };
  vm.runInNewContext(script, context);
  return {
    requests, gaEvents,
    click(href, placement = 'hero', extraDataset = {}) {
      let destination = href;
      const anchor = {
        dataset: { growthSource: placement, ...extraDataset },
        textContent: 'Open the app',
        getAttribute(name) { return name === 'href' ? destination : null; },
        get href() { return destination; },
        set href(value) { destination = value; },
      };
      listeners.get('click')({ target: { closest: () => anchor } });
      return new URL(destination, location.href);
    },
    clickOutside() { listeners.get('click')({ target: { closest: () => null } }); },
  };
}

const campaign = {
  utm_source: 'instagram',
  utm_medium: 'paid_social',
  utm_campaign: 'vuelta al gym',
  utm_content: 'vídeo A / azul',
  utm_term: 'rutina fácil',
};
const address = `https://entrenoapp.com/?${new URLSearchParams(campaign)}`;
const landing = page(address);
const appLink = landing.click('/app.html?lang=en#today', 'hero_demo');
for (const [key, value] of Object.entries(campaign)) {
  assert.equal(appLink.searchParams.get(key), value, `${key} survives the landing-to-app click`);
}
assert.equal(appLink.searchParams.get('lang'), 'en');
assert.equal(appLink.hash, '#today');
assert.equal(appLink.searchParams.get('cta_source'), 'hero_demo');
assert.equal(landing.requests[1].body.dimensions.acquisition_source, 'instagram');
assert.equal(landing.requests[1].body.dimensions.acquisition_medium, 'paid_social');
assert.equal(landing.requests[1].body.dimensions.interaction_source, 'hero_demo');
assert.equal(landing.gaEvents[0][1], 'web_app_click');
assert.equal(landing.gaEvents[0][2].interaction_source, 'hero_demo');
assert.ok(!('source' in landing.gaEvents[0][2]), 'GA placement does not override acquisition source');

const plusLink = landing.click('/plus-en.html', 'business_plus');
const plusPage = page(plusLink.href, { pageName: 'plus_en', language: 'en' });
const onwardApp = plusPage.click('/app.html?lang=en', 'plus_en_activate_free');
for (const [key, value] of Object.entries(campaign)) {
  assert.equal(onwardApp.searchParams.get(key), value, `${key} survives a second marketing page`);
}
assert.equal(onwardApp.searchParams.get('cta_source'), 'plus_en_activate_free');
assert.equal(plusPage.requests[0].body.dimensions.language, 'en');
assert.equal(plusPage.requests[0].body.dimensions.interaction_source, 'plus_en');

const explicit = landing.click('/app?utm_source=partner&utm_medium=email&utm_campaign=partner_launch&utm_content=button&utm_term=plan', 'footer');
assert.equal(explicit.searchParams.get('utm_source'), 'partner', 'Explicit destination attribution takes precedence');
assert.equal(explicit.searchParams.get('utm_medium'), 'email');
assert.equal(explicit.searchParams.get('utm_campaign'), 'partner_launch');
assert.equal(explicit.searchParams.get('utm_content'), 'button');
assert.equal(explicit.searchParams.get('utm_term'), 'plan');
assert.equal(explicit.searchParams.get('cta_source'), 'footer');

const direct = page('https://entrenoapp.com/');
const directApp = direct.click('/app', 'nav');
assert.equal(directApp.searchParams.get('utm_source'), 'direct', 'CTA placement is not an acquisition source');
assert.equal(directApp.searchParams.get('cta_source'), 'nav');

const referral = page('https://entrenoapp.com/', { referrer: 'https://example.org/article' });
assert.equal(referral.click('/app').searchParams.get('utm_source'), 'example.org');

for (const address of ['http://127.0.0.1:4198/', 'https://preview--entrenoapp.netlify.app/', 'https://entrenoapp.com/?qa=1']) {
  const qaPage = page(address);
  qaPage.click('/app', 'hero');
  assert.equal(qaPage.requests.length, 0, 'QA traffic does not enter the aggregate product report');
  assert.equal(qaPage.gaEvents.length, 0, 'QA clicks are not sent to GA');
}

const stores = [
  ['https://apps.apple.com/es/app/entrenoapp/id6749792687', 'app_store_click'],
  ['https://play.google.com/store/apps/details?id=com.lipastudios.entrenoapp', 'google_play_click'],
];
for (const [url, event] of stores) {
  const storePage = page(address);
  assert.equal(storePage.click(url).href, url, 'External store URLs are not rewritten');
  assert.equal(storePage.requests[1].body.dimensions.feature, event);
}

const anchors = page(address);
assert.equal(anchors.click('#activate').hash, '#activate');
assert.equal(anchors.click('mailto:hello@example.org').href, 'mailto:hello@example.org');
const beforeOutsideClick = anchors.requests.length;
anchors.clickOutside();
assert.equal(anchors.requests.length, beforeOutsideClick, 'Untracked clicks do not create events');
for (const request of [...landing.requests, ...plusPage.requests, ...direct.requests]) {
  assert.equal(request.url, '/api/analytics/event');
  assert.ok(['marketing_page_view', 'marketing_cta_click'].includes(request.body.event));
  assert.ok(!('utm_content' in request.body.dimensions), 'Free-form campaign text is not added to first-party dimensions');
  assert.ok(!('utm_term' in request.body.dimensions));
}

const appSource = fs.readFileSync(path.join(__dirname, '../app.html'), 'utf8');
const dimensionsFunction = appSource.slice(appSource.indexOf('function productAnalyticsDimensions('), appSource.indexOf('let productAnalyticsSending='));
const appContext = vm.createContext({
  URLSearchParams,
  location: { search: '?utm_source=instagram&cta_source=plus_hero_free' },
  PRODUCT_ANALYTICS_VERSION: '2.2.0',
  analyticsAcquisition: () => ({ source: 'instagram', medium: 'paid_social', campaign: 'launch' }),
  nativePlatform: () => 'web', currentLang: () => 'es',
});
vm.runInContext(dimensionsFunction, appContext);
assert.equal(vm.runInContext('productAnalyticsDimensions().acquisition_source', appContext), 'instagram');
assert.equal(vm.runInContext('productAnalyticsDimensions().interaction_source', appContext), 'plus_hero_free');
assert.equal(vm.runInContext('productAnalyticsDimensions({source:"welcome"}).interaction_source', appContext), 'welcome');

console.log('PASS: original campaigns survive marketing navigation and app entry; CTA placement stays separate; store links and aggregate tracking remain compatible.');
