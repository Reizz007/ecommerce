const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9446',
    '--headless=new',
    '--window-size=375,812'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9446/json/list');
  const [p] = await res.json();
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, p = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params: p })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // In App.jsx, AppContext holds isCheckoutOpen and step!
  // We can also click the cart button then proceed to checkout:
  const clickRes = await send('Runtime.evaluate', {
    expression: `(function() {
      // Find cart button
      const cartBtn = document.querySelector('.cart-btn');
      if (cartBtn) cartBtn.click();
      return 'cart clicked';
    })()`,
    returnByValue: true
  });
  console.log('Cart click:', clickRes.result?.result?.value);
  await new Promise(r => setTimeout(r, 800));

  const proceedRes = await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
      if (btn) {
        btn.click();
        return 'proceed clicked';
      }
      return 'proceed NOT found';
    })()`,
    returnByValue: true
  });
  console.log('Proceed click:', proceedRes.result?.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Step 1: fill inputs and submit form
  const step1Res = await send('Runtime.evaluate', {
    expression: `(function() {
      const form = document.querySelector('.checkout-step-panel form');
      const inputs = document.querySelectorAll('.checkout-step-panel input');
      if (inputs.length >= 2) {
        // React synthetic events
        const setVal = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setVal(inputs[0], 'John Doe');
        setVal(inputs[1], 'john@example.com');
      }
      const submitBtn = document.querySelector('.checkout-actions button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        return 'submit clicked';
      }
      return 'submit NOT found';
    })()`,
    returnByValue: true
  });
  console.log('Step 1 continue:', step1Res.result?.result?.value);
  await new Promise(r => setTimeout(r, 2500));

  // Check Step 2 title
  const step2Check = await send('Runtime.evaluate', {
    expression: `(function() {
      const title = document.querySelector('.step-title');
      const modal = document.querySelector('.checkout-modal-container');
      const panel = document.querySelector('.checkout-step-panel');
      const tabs = document.querySelector('.payment-methods-tabs');
      const abaCard = document.querySelector('.aba-pay-card');
      const khqrCard = document.querySelector('.khqr-pay-card');
      return {
        title: title ? title.textContent : null,
        modalWidth: modal ? modal.offsetWidth : null,
        modalScrollWidth: modal ? modal.scrollWidth : null,
        panelScrollWidth: panel ? panel.scrollWidth : null,
        panelClientWidth: panel ? panel.clientWidth : null,
        hasAbaCard: !!abaCard,
        hasKhqrCard: !!khqrCard,
        tabsCount: tabs ? tabs.children.length : 0
      };
    })()`,
    returnByValue: true
  });
  console.log('Step 2 check:', JSON.stringify(step2Check.result?.result?.value, null, 2));

  // Screenshot 1: Step 2 top
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'step2_top.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved step2_top.png');

  // Scroll panel down
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.checkout-step-panel')?.scrollTo(0, 350)`
  });
  await new Promise(r => setTimeout(r, 600));
  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'step2_mid.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved step2_mid.png');

  // Scroll panel to bottom
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.checkout-step-panel')?.scrollTo(0, 1000)`
  });
  await new Promise(r => setTimeout(r, 600));
  const ss3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'step2_bottom.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved step2_bottom.png');

  ws.close();
  chrome.kill();
}
test().catch(console.error);
