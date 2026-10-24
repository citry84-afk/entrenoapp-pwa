const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../app.html'), 'utf8');
const source = html.slice(html.indexOf('async function flushProductAnalytics(){'), html.indexOf('function productAnalyticsLifecycle(){'));
async function main() {
  let queue = [{id:'a',event:'app_first_open'}], calls = 0, ok = false;
  const timers = [];
  const ctx = {navigator:{onLine:true}, AbortSignal, JSON,
    productAnalyticsQueue:()=>queue.map(x=>({...x})), saveProductAnalyticsQueue:q=>{queue=q;},
    productAnalyticsEndpoint:()=>'/test', fetch:async()=>{calls++;return {ok};},
    setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;}
  };
  vm.createContext(ctx);
  vm.runInContext('let productAnalyticsSending=false,productAnalyticsRetryTimer=null,productAnalyticsRetryDelay=2000;\n'+source,ctx);
  await ctx.flushProductAnalytics();
  assert.equal(calls,1);assert.equal(timers[0].delay,2000);assert.equal(queue.length,1);
  await ctx.flushProductAnalytics();assert.equal(calls,1,'No extra request while retry timer is pending');
  timers.shift().fn();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,2);assert.equal(timers[0].delay,4000);
  ok=true;timers.shift().fn();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(queue.length,0);assert.equal(timers.length,0);
  queue=[{id:'b',event:'session_saved'}];ok=false;
  await ctx.flushProductAnalytics();assert.equal(timers[0].delay,2000,'Success resets backoff');
  ctx.AbortSignal=undefined;ok=true;timers.shift().fn();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(queue.length,0,'Older browsers without AbortSignal.timeout can still send events');
  console.log('PASS: analytics failure backs off, preserves queue, and recovers without duplicate sends.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
