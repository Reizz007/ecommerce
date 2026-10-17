const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9444',
    '--headless=new',
    '--window-size=375,812'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9444/json/list');
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
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Open cart drawer first
  const r1 = await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.cart-btn');
      if (btn) {
        btn.click();
        return 'clicked cart-btn';
      }
      return 'cart-btn not found';
    })()`,
    returnByValue: true
  });
  console.log('r1:', r1.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Click proceed to checkout with proper MouseEvent
  const r2 = await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.btn-primary.btn-glow.btn-full') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
      if (btn) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return 'dispatched click on Proceed to Checkout';
      }
      return 'Proceed to Checkout not found';
    })()`,
    returnByValue: true
  });
  console.log('r2:', r2.result?.value);
  await new Promise(r => setTimeout(r, 1500));

  // Check if checkout modal is open
  const r3 = await send('Runtime.evaluate', {
    expression: `(function() {
      const modal = document.querySelector('.checkout-modal-container');
      const step1Title = document.querySelector('.step-title');
      return {
        hasModal: !!modal,
        title: step1Title ? step1Title.textContent : null
      };
    })()`,
    returnByValue: true
  });
  console.log('r3:', r3.result?.value);

  // Fill inputs and click continue to step 2
  const r4 = await send('Runtime.evaluate', {
    expression: `(function() {
      const inputs = document.querySelectorAll('.checkout-step-panel input');
      if (inputs.length >= 2) {
        inputs[0].value = 'John Doe';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        inputs[1].value = 'john@example.com';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const continueBtn = document.querySelector('.checkout-actions button[type="submit"]');
      if (continueBtn) {
        continueBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return 'clicked continue';
      }
      return 'continue not found';
    })()`,
    returnByValue: true
  });
  console.log('r4:', r4.result?.value);
  await new Promise(r => setTimeout(r, 3000));

  // Check Step 2
  const r5 = await send('Runtime.evaluate', {
    expression: `(function() {
      const stepTitle = document.querySelector('.step-title');
      const tabs = document.querySelector('.payment-methods-tabs');
      const activeTab = document.querySelector('.payment-tab.active');
      return {
        title: stepTitle ? stepTitle.textContent : null,
        hasTabs: !!tabs,
        activeTab: activeTab ? activeTab.textContent : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Step 2 status:', r5.result?.value);

  // Take screenshot of Step 2!
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'real_mobile_step2.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved real_mobile_step2.png');

  ws.close();
  chrome.kill();
}
test().catch(console.error);
