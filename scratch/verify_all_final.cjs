const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9488',
    '--headless=new',
    '--window-size=1200,900'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9488/json/list');
  const [p] = await res.json();
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Verify Homepage Navbar and Hero
  const homeCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const navLinks = Array.from(document.querySelectorAll('.nav-link, .nav-cta')).map(a => a.textContent.trim());
      const hasPricingSection = !!document.getElementById('pricing');
      const heroTitle = document.querySelector('.hero-title')?.textContent.trim();
      return { navLinks, hasPricingSection, heroTitle };
    })()`,
    returnByValue: true
  });
  console.log('Homepage verification:', JSON.stringify(homeCheck.result?.result?.value, null, 2));

  // Take screenshot of homepage header & hero
  const ssHome = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verified_home.png'), Buffer.from(ssHome.result.data, 'base64'));

  // 2. Open Checkout directly or via Cart
  await send('Runtime.evaluate', {
    expression: 'window.__openCheckout ? window.__openCheckout(true) : document.querySelector(".cart-btn")?.click()'
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 1 check
  const step1 = await send('Runtime.evaluate', {
    expression: `(function() {
      const inputs = document.querySelectorAll('.checkout-step-panel input');
      const submit = document.querySelector('.checkout-actions button[type="submit"]');
      if (submit) submit.click();
      return 'submitted step 1';
    })()`,
    returnByValue: true
  });
  console.log('Step 1 proceed:', step1.result?.result?.value);
  await new Promise(r => setTimeout(r, 3000));

  // Step 2 verification
  const step2 = await send('Runtime.evaluate', {
    expression: `(function() {
      const tabs = Array.from(document.querySelectorAll('.payment-tab')).map(t => t.textContent.trim());
      const iframe = document.querySelector('iframe.khqr-live-iframe')?.src;
      const subtitle = document.querySelector('.step-sub')?.textContent.trim();
      const khqrBtn = document.getElementById('btn-pay-now-khqr')?.textContent.trim();
      const hasPaywayBtn = !!document.getElementById('btn-pay-now-payway');
      return { tabs, iframe, subtitle, khqrBtn, hasPaywayBtn };
    })()`,
    returnByValue: true
  });
  console.log('Step 2 verification:', JSON.stringify(step2.result?.result?.value, null, 2));

  const ssStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verified_step2_khqr.png'), Buffer.from(ssStep2.result.data, 'base64'));

  ws.close();
  chrome.kill();
}

run().catch(console.error);
