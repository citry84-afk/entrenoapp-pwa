#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function declaration(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing app function: ${name}`);
  const end = source.slice(start + 1).search(/^(?:(?:async )?function |const |let |<\/script>)/m);
  return source.slice(start, end < 0 ? source.length : start + 1 + end);
}

const functions = [
  'reminderDefault', 'reminderState', 'reminderIds', 'parseReminderTime',
  'setReminderTime', 'toggleReminderDay', 'getLocalNotifications', 'notificationExtra',
  'cancelWorkoutReminders', 'ensureNotificationPermission', 'scheduleWorkoutReminders',
  'sendTestWorkoutReminder', 'enableWorkoutReminder', 'disableWorkoutReminder',
  'dailyNudgeDefault', 'dailyNudgeState', 'dailyNudgeIds', 'dailyNudgeCount',
  'cancelDailyNudges', 'scheduleDailyNudges', 'setDailyNudge', 'setDailyNudgeTime',
  'restoreNotificationSchedules', 'cancelLiveCoachNotification', 'scheduleLiveCoachNotification',
];
const context = vm.createContext({ console: { ...console, warn() {} }, Date, Set });
vm.runInContext(functions.map(declaration).join('\n'), context, { filename: 'app-notifications.js' });
vm.runInContext(`
  let S,platform,permission,requestedPermission,permissionCheckFails,calls,messages,window,stored;
  const localStorage={
    getItem(key){return stored[key]??null;},
    setItem(key,value){stored[key]=String(value);}
  };
  const notifications={
    async checkPermissions(){calls.check++;if(permissionCheckFails)throw new Error('Unavailable');return {display:permission};},
    async requestPermissions(){calls.request++;permission=requestedPermission;return {display:permission};},
    async cancel(options){calls.cancel.push(options);},
    async createChannel(options){calls.channel.push(options);},
    async schedule(options){calls.schedule.push(options);}
  };
  function nativePlatform(){return platform;}
  function persist(){calls.persist++;return true;}
  function renderSettings(){calls.render++;}
  function toast(message){messages.push(message);}
  function workoutCoachActive(){return true;}
  function liveCoachMessage(){return 'Keep going';}
  function workoutCoachIntervalMs(){return 240000;}
  function reset(){
    S={profile:{mode:'musculacion'},routine:[{name:'Day A'}],reminder:null,nudges:null};
    platform='ios';permission='prompt';requestedPermission='granted';permissionCheckFails=false;
    calls={check:0,request:0,schedule:[],cancel:[],channel:[],persist:0,render:0};
    messages=[];stored={};window={Capacitor:{Plugins:{LocalNotifications:notifications}}};
  }
  reset();
`, context);

function run(code) { return vm.runInContext(code, context); }
function plain(code) { return JSON.parse(JSON.stringify(run(code))); }
let passed = 0, failed = 0;
async function test(name, callback) {
  run('reset();');
  try {
    await callback();
    passed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${name}\n  ${error.stack}`);
  }
}

async function main() {
  await test('New installation defaults keep every reminder disabled', () => {
    assert.equal(run('reminderState().enabled'), false);
    assert.equal(run('dailyNudgeCount()'), 0);
  });

  await test('New installation does not request permission, schedule, or save opt-in at startup', async () => {
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.check'), 0);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('calls.persist'), 0);
    assert.equal(run('S.reminder'), null);
    assert.equal(run('S.nudges'), null);
  });

  await test('Old automatic-start marker cannot enable reminders on a new profile', async () => {
    run("stored.ea_default_notifications_v1='1'");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('reminderState().enabled'), false);
    assert.equal(run('dailyNudgeCount()'), 0);
  });

  await test('Existing enabled schedules are restored only with permission already granted', async () => {
    run("permission='granted';S.reminder={enabled:true,time:'07:15',days:[2,6],native:true};S.nudges={mind:{enabled:false,time:'10:00'},reto:{enabled:true,time:'18:40'},night:{enabled:false,time:'23:00'},native:true}");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 2);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6202, 6206]);
    assert.deepEqual(plain('calls.schedule[0].notifications[0].schedule.on'), { weekday: 3, hour: 7, minute: 15 });
    assert.deepEqual(plain('calls.schedule[1].notifications.map(n=>n.id)'), [6302]);
    assert.equal(run('S.reminder.time'), '07:15');
    assert.equal(run('S.nudges.reto.time'), '18:40');
    assert.equal(run('S.nudges.mind.enabled'), false);
  });

  await test('Existing disabled preferences stay off even when system permission is granted', async () => {
    run("permission='granted';S.reminder={enabled:false,time:'08:30',days:[0],native:false};S.nudges={night:{enabled:false,time:'21:15'},native:false}");
    const before = run('JSON.stringify({reminder:S.reminder,nudges:S.nudges})');
    await run('restoreNotificationSchedules()');
    assert.equal(run('JSON.stringify({reminder:S.reminder,nudges:S.nudges})'), before);
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
  });

  await test('Partial saved preferences do not implicitly enable missing reminder categories', async () => {
    run("permission='granted';S.nudges={night:{enabled:true,time:'21:45'},native:true}");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6303]);
    assert.equal(run('S.nudges.mind.enabled'), false);
    assert.equal(run('S.nudges.reto.enabled'), false);
    assert.equal(run('S.reminder'), null);
  });

  await test('Denied permission is never requested again by passive restoration', async () => {
    run("permission='denied';S.reminder={enabled:true,time:'08:00',days:[1],native:true};S.nudges={mind:{enabled:true,time:'09:00'},native:true}");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('S.reminder.enabled'), true);
    assert.equal(run('S.reminder.native'), false);
    assert.equal(run('S.nudges.mind.enabled'), true);
    assert.equal(run('S.nudges.native'), false);
  });

  await test('Undecided permission is not requested by passive restoration', async () => {
    run("S.reminder={enabled:true,time:'08:00',days:[1],native:false}");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
  });

  await test('Workout coach cannot request notification permission automatically', async () => {
    assert.equal(await run('scheduleLiveCoachNotification()'), false);
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
  });

  await test('Workout coach can use an existing system permission without a new prompt', async () => {
    run("permission='granted'");
    assert.equal(await run('scheduleLiveCoachNotification()'), true);
    assert.equal(run('calls.request'), 0);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6401]);
  });

  await test('Explicit workout reminder opt-in requests once and enables only that reminder', async () => {
    await run('enableWorkoutReminder()');
    assert.equal(run('calls.request'), 1);
    assert.equal(run('S.reminder.enabled'), true);
    assert.equal(run('S.reminder.native'), true);
    assert.equal(run('dailyNudgeCount()'), 0);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6201, 6203, 6205]);
  });

  await test('Explicit daily opt-in enables only the selected daily reminder', async () => {
    await run("setDailyNudge('mind',true)");
    assert.equal(run('calls.request'), 1);
    assert.equal(run('dailyNudgeCount()'), 1);
    assert.equal(run('S.reminder'), null);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6301]);
  });

  await test('Denied daily opt-in does not announce an active notification', async () => {
    run("requestedPermission='denied'");
    await run("setDailyNudge('mind',true)");
    assert.equal(run('calls.request'), 1);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('S.nudges.native'), false);
    assert.equal(run("messages.includes('Aviso diario activado')"), false);
  });

  await test('Declining explicit opt-in schedules nothing and is not retried on next boot', async () => {
    run("requestedPermission='denied'");
    await run('enableWorkoutReminder()');
    assert.equal(run('calls.request'), 1);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('S.reminder.native'), false);
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.request'), 1);
  });

  await test('Native permission rejection cannot trigger a second browser permission request', async () => {
    run("requestedPermission='denied';window.Notification={};globalThis.Notification={requestPermission(){throw new Error('Browser prompt must not run in native app');}}");
    await run('enableWorkoutReminder()');
    assert.equal(run('calls.request'), 1);
    assert.equal(run("messages.some(message=>message.includes('En navegador'))"), false);
  });

  await test('Test-notification button may request permission without opting into recurring reminders', async () => {
    await run('sendTestWorkoutReminder()');
    assert.equal(run('calls.request'), 1);
    assert.deepEqual(plain('calls.schedule[0].notifications.map(n=>n.id)'), [6299]);
    assert.equal(run('S.reminder'), null);
    assert.equal(run('S.nudges'), null);
  });

  await test('Changing a saved time or day cannot request permission', async () => {
    run("permission='denied';S.reminder={enabled:true,time:'08:00',days:[1],native:false};S.nudges={mind:{enabled:true,time:'09:00'},native:false}");
    run("setReminderTime('08:45');toggleReminderDay(3)");
    await run("setDailyNudgeTime('mind','09:30')");
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('S.reminder.time'), '08:45');
    assert.equal(run('S.nudges.mind.time'), '09:30');
  });

  await test('Disabling a reminder cancels it without requesting any permission', async () => {
    run("S.reminder={enabled:true,time:'08:00',days:[1],native:true};S.nudges={mind:{enabled:true,time:'09:00'},native:true}");
    await run('disableWorkoutReminder()');
    await run("setDailyNudge('mind',false)");
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
    assert.equal(run('S.reminder.enabled'), false);
    assert.equal(run('dailyNudgeCount()'), 0);
    assert.equal(run('S.nudges.native'), false);
    assert.equal(run('calls.cancel.length'), 2);
  });

  await test('Browser startup never invokes the native notification plugin', async () => {
    run("platform='web';S.reminder={enabled:true};S.nudges={mind:{enabled:true}}");
    await run('restoreNotificationSchedules()');
    assert.equal(run('calls.check'), 0);
    assert.equal(run('calls.request'), 0);
    assert.equal(run('calls.schedule.length'), 0);
  });

  await test('Failed permission checks stay passive unless a user explicitly asks', async () => {
    run('permissionCheckFails=true');
    assert.equal(await run('ensureNotificationPermission(notifications)'), false);
    assert.equal(run('calls.request'), 0);
    assert.equal(await run('ensureNotificationPermission(notifications,{request:true})'), true);
    assert.equal(run('calls.request'), 1);
  });

  await test('Onboarding and boot both call passive restoration, never the legacy activator', () => {
    assert.equal(source.includes('activateDefaultNotifications'), false);
    const calls = source.match(/setTimeout\(\(\)=>restoreNotificationSchedules\(\),1400\)/g) || [];
    assert.equal(calls.length, 2);
    assert.equal(declaration('restoreNotificationSchedules').includes('requestPermission:true'), false);
  });

  console.log(`\n${passed} notification opt-in tests passed, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
