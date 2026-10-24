#!/usr/bin/env node
'use strict';

// Function-level DOM stubs verify rendering and restoration; browser QA covers layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(name) {
  const start = source.search(new RegExp(`^function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

const translations = source.slice(source.indexOf('const EN={'), source.indexOf('const textOrigins='));
const context = vm.createContext({ console, Set, Date });
vm.runInContext(translations + '\n' + [
  'escHtml', 'lt', 'uiLabel', 'rememberSettingsGroup', 'settingsGroup',
  'settingsChoices', 'captureSettingsView', 'restoreSettingsView', 'renderSettings',
].map(declaration).join('\n'), context, { filename: 'app-settings-functions.js' });
vm.runInContext(`
  let S,W,WD,UI,content,platform,document,window,frames,focusCalls,scrollCalls,localizeCalls;
  function currentLang(){return S.lang;}
  function nativePlatform(){return platform;}
  function requestAnimationFrame(callback){frames.push(callback);}
  function flushFrames(){while(frames.length)frames.shift()();}
  function localizeTree(root){
    localizeCalls++;
    if(currentLang()==='en')root.innerHTML=root.innerHTML.replace(/>([^<]+)</g,(match,text)=>{
      const trimmed=text.trim();return '>'+(EN[trimmed]?text.replace(trimmed,EN[trimmed]):text)+'<';
    });
  }
  function completion(){const rows=Object.values(WD).flat();return {done:rows.filter(row=>row.done).length,total:rows.length};}
  function plusActive(){return false;}
  function renderReminderSettings(){return '<button onclick="'+(S.reminder?.enabled?'disableWorkoutReminder()':'enableWorkoutReminder()')+'">Reminder</button><input id="reminder-time" type="time" onchange="setReminderTime(this.value)">';}
  function renderDailyNudgeSettings(){const q=String.fromCharCode(39);return '<button onclick="setDailyNudge('+q+'mind'+q+','+(!S.nudges?.mind?.enabled)+')">Mind</button>';}
  function renderSoundSettings(){const q=String.fromCharCode(39);return '<button onclick="setSoundPref('+q+'enabled'+q+',false)">Sound</button>';}
  function renderHealthSettings(){return '<button onclick="toggleHealth()">Health body</button>';}
  function renderHowItWorks(){return '<button onclick="startGuidedTour()">Help body</button>';}
  function renderPlusValuePanel(){return '<div>Plus body</div>';}
  function plusAccountPanel(){return '<div>Account body</div>';}
  function plusAccessPanel(){return '<button onclick="showPlus()">Plus access</button>';}
  function renderPlusHub(){return '<div>Plus extras</div>';}
  function attributes(text){
    const attrs={};
    for(const match of text.matchAll(/([^\\s=]+)(?:="([^"]*)"|'([^']*)')?/g))attrs[match[1]]=match[2]??match[3]??'';
    return attrs;
  }
  function control(tagName,attrs={},group=null){
    return {tagName:tagName.toUpperCase(),attrs,id:attrs.id||'',group,
      hasAttribute(name){return Object.hasOwn(this.attrs,name);},
      getAttribute(name){return this.attrs[name]??null;},
      setAttribute(name,value){this.attrs[name]=String(value);},
      closest(selector){return selector==='[data-settings-group]'?this.group:null;},
      focus(options){document.activeElement=this;focusCalls.push({key:this.getAttribute('data-setting-focus'),options});}
    };
  }
  function makeContent(){
    return {html:'',scrollTop:0,groups:[],controls:[],
      set innerHTML(value){
        this.html=value;this.scrollTop=0;this.groups=[];this.controls=[];
        for(const match of value.matchAll(/<details\\b([^>]*)>[\\s\\S]*?<\\/details>/g)){
          const attrs=attributes(match[1]);
          this.groups.push({dataset:{settingsGroup:attrs['data-settings-group']},open:Object.hasOwn(attrs,'open'),start:match.index,end:match.index+match[0].length});
        }
        for(const match of value.matchAll(/<(button|input|select|textarea|summary)\\b([^>]*)>/g)){
          const group=this.groups.find(item=>match.index>=item.start&&match.index<item.end)||null;
          this.controls.push(control(match[1],attributes(match[2]),group));
        }
      },
      get innerHTML(){return this.html;},
      contains(node){return this.controls.includes(node);},
      querySelector(selector){if(selector==='.settings-shell')return this.html.includes('class="settings-shell"')?this:null;return null;},
      querySelectorAll(selector){
        if(selector==='[data-settings-group]')return this.groups;
        if(selector==='[data-setting-focus]')return this.controls.filter(item=>item.hasAttribute('data-setting-focus'));
        if(selector==='button,input,select,textarea,summary')return this.controls;
        return [];
      }
    };
  }
  function reset(){
    S={lang:'es',profile:{mode:'musculacion',experience:'intermedio',priority:'musculo',equipment:'gym',time:'40',days:'3'},sessions:[{id:1}],reminder:{enabled:false},nudges:{mind:{enabled:false}}};
    W={active:true,notes:'Keep me',sessionDay:{name:'Frozen workout'}};
    WD={one:[{kg:73,reps:9,done:true}],two:[{kg:22,reps:10,done:false}]};
    UI={settingsOpen:{}};platform='web';frames=[];focusCalls=[];scrollCalls=[];localizeCalls=0;
    document={activeElement:null,getElementById(){return content;}};
    window={scrollY:0,scrollTo(options){scrollCalls.push(options);this.scrollY=options.top;}};
    content=makeContent();
  }
  reset();
`, context, { filename: 'settings-dom-stubs.js' });

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
let passed = 0, failed = 0;
function test(name, callback) {
  run('reset();');
  try { callback();passed++;console.log(`✓ ${name}`); }
  catch (error) { failed++;console.error(`✗ ${name}\n  ${error.stack}`); }
}

test('All settings groups are closed on first render', () => {
  run('renderSettings(content)');
  assert.deepEqual(plain('content.groups.map(group=>[group.dataset.settingsGroup,group.open])'), [
    ['plan', false], ['notifications', false], ['data', false], ['language', false],
    ['help', false], ['plus', false], ['health', false],
  ]);
});

test('The plan precedes optional Plus and unavailable native health controls', () => {
  run('renderSettings(content)');
  const order = plain('content.groups.map(group=>group.dataset.settingsGroup)');
  assert.equal(order[0], 'plan');
  assert.ok(order.indexOf('plus') > order.indexOf('data'));
  assert.ok(order.indexOf('health') > order.indexOf('plus'));
  assert.match(run('content.innerHTML'), /La conexión nativa de salud no está disponible/);
});

test('Remembered group state is presentation-only and escapes labels', () => {
  const before = run('JSON.stringify({S,W,WD})');
  run("rememberSettingsGroup('plan',true)");
  const html = run("settingsGroup('plan','x','<unsafe>','A & B','body')");
  assert.match(html, /data-settings-group="plan" open/);
  assert.match(html, /&lt;unsafe&gt;/);
  assert.match(html, /A &amp; B/);
  assert.equal(run('JSON.stringify({S,W,WD})'), before);
});

test('Profile choices use buttons, explicit type, pressed state and stable focus keys', () => {
  run('renderSettings(content)');
  const choices = plain("content.controls.filter(item=>item.getAttribute('data-setting-focus')?.startsWith('pref-')).map(item=>({tag:item.tagName,type:item.getAttribute('type'),pressed:item.getAttribute('aria-pressed'),key:item.getAttribute('data-setting-focus'),action:item.getAttribute('onclick')}))");
  assert.ok(choices.length > 15);
  for (const choice of choices) {
    assert.equal(choice.tag, 'BUTTON');
    assert.equal(choice.type, 'button');
    assert.match(choice.pressed, /^(true|false)$/);
  }
  assert.equal(choices.find(item => item.key === 'pref-equipment-gym').pressed, 'true');
  assert.equal(choices.find(item => item.key === 'pref-equipment-bandas').pressed, 'false');
  assert.equal(choices.find(item => item.key === 'pref-experience-avanzado').action, "setExperience('avanzado')");
});

test('Language buttons have explicit type and expose the selected language', () => {
  run('renderSettings(content)');
  assert.deepEqual(plain("content.controls.filter(item=>item.getAttribute('data-setting-focus')?.startsWith('language-')).map(item=>[item.getAttribute('type'),item.getAttribute('aria-pressed')])"), [['button','true'],['button','false']]);
  run("S.lang='en';renderSettings(content)");
  assert.deepEqual(plain("content.controls.filter(item=>item.getAttribute('data-setting-focus')?.startsWith('language-')).map(item=>item.getAttribute('aria-pressed'))"), ['false','true']);
});

test('Capturing another screen is a no-op and captures no unrelated focus', () => {
  assert.equal(run('captureSettingsView(content)'), null);
  run('renderSettings(content);document.activeElement=control("button",{"data-setting-focus":"elsewhere"});');
  assert.equal(run('captureSettingsView(content).focus'), null);
});

test('A settings re-render preserves open groups, focused choice, content and page scroll', () => {
  run(`renderSettings(content);
    content.groups.find(group=>group.dataset.settingsGroup==='plan').open=true;
    content.groups.find(group=>group.dataset.settingsGroup==='data').open=true;
    document.activeElement=content.controls.find(item=>item.getAttribute('data-setting-focus')==='pref-equipment-gym');
    content.scrollTop=412;window.scrollY=735;
  `);
  const before = run('JSON.stringify({S,W,WD})');
  run('renderSettings(content);flushFrames();');
  assert.equal(run('JSON.stringify({S,W,WD})'), before);
  assert.equal(run("content.groups.find(group=>group.dataset.settingsGroup==='plan').open"), true);
  assert.equal(run("content.groups.find(group=>group.dataset.settingsGroup==='data').open"), true);
  assert.equal(run("document.activeElement.getAttribute('data-setting-focus')"), 'pref-equipment-gym');
  assert.equal(run('content.scrollTop'), 412);
  assert.equal(run('window.scrollY'), 735);
  assert.equal(run('focusCalls.at(-1).options.preventScroll'), true);
});

test('A reminder toggle keeps focus when its action changes from enable to disable', () => {
  run(`renderSettings(content);
    content.groups.find(group=>group.dataset.settingsGroup==='notifications').open=true;
    document.activeElement=content.controls.find(item=>item.getAttribute('onclick')==='enableWorkoutReminder()');
    S.reminder.enabled=true;renderSettings(content);flushFrames();
  `);
  assert.equal(run("document.activeElement.getAttribute('onclick')"), 'disableWorkoutReminder()');
  assert.equal(run("document.activeElement.getAttribute('data-setting-focus')"), 'notifications:toggleWorkoutReminder()');
});

test('A daily toggle keeps focus when its boolean action changes', () => {
  run(`renderSettings(content);
    document.activeElement=content.controls.find(item=>item.getAttribute('onclick')==="setDailyNudge('mind',true)");
    S.nudges.mind.enabled=true;renderSettings(content);flushFrames();
  `);
  assert.equal(run("document.activeElement.getAttribute('onclick')"), "setDailyNudge('mind',false)");
});

test('Native settings restore container scroll without moving the web page', () => {
  run("platform='ios';renderSettings(content);content.scrollTop=87;window.scrollY=98;renderSettings(content);flushFrames();");
  assert.equal(run('content.scrollTop'), 87);
  assert.equal(run('scrollCalls.length'), 0);
});

test('A delayed restore does not focus controls after navigation to another screen', () => {
  run("renderSettings(content);document.activeElement=content.controls[0];renderSettings(content);content.innerHTML='<div>History</div>';flushFrames();");
  assert.equal(run('focusCalls.length'), 0);
  assert.equal(run('scrollCalls.length'), 0);
});

test('Spanish and English retain the same groups and selected profile values', () => {
  run('renderSettings(content)');
  assert.match(run('content.innerHTML'), /<h1>Ajustes<\/h1>/);
  assert.match(run('content.innerHTML'), /Mi plan/);
  const spanishOrder = plain('content.groups.map(group=>group.dataset.settingsGroup)');
  run("S.lang='en';renderSettings(content)");
  assert.match(run('content.innerHTML'), /<h1>Settings<\/h1>/);
  assert.match(run('content.innerHTML'), /My plan/);
  assert.match(run('content.innerHTML'), /Health and watches · coming later/);
  assert.match(run('content.innerHTML'), /Strength · 3 days · 40 min/);
  assert.deepEqual(plain('content.groups.map(group=>group.dataset.settingsGroup)'), spanishOrder);
  assert.equal(run("content.controls.find(item=>item.getAttribute('data-setting-focus')==='pref-equipment-gym').getAttribute('aria-pressed')"), 'true');
  assert.equal(run('localizeCalls'), 2);
});

test('Manual routines show their own edit actions without guided-plan controls', () => {
  run('S.profile.manualRoutine=true;renderSettings(content)');
  assert.match(run('content.innerHTML'), /Editar mi rutina/);
  assert.equal(run("content.controls.some(item=>item.getAttribute('data-setting-focus')?.startsWith('pref-'))"), false);
});

test('Manual routine settings are also readable in English', () => {
  run("S.lang='en';S.profile.manualRoutine=true;renderSettings(content)");
  const html = run('content.innerHTML');
  assert.match(html, /Edit my routine/);
  assert.match(html, /Create a guided routine/);
  assert.doesNotMatch(html, /Esta rutina la has creado tú/);
  assert.doesNotMatch(html, />Mi rutina</);
});

console.log(`\n${passed} settings UI tests passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
