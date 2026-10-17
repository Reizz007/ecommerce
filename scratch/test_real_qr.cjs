const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testModal() {
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

  // Add an item to cart or open cart
  await send('Runtime.evaluate', {
    expression: `(function() {
      const addBtn = document.querySelector('.btn-add-cart') || document.querySelector('button.btn-primary');
      if (addBtn) addBtn.click();
      const cartBtn = document.querySelector('.cart-btn');
      if (cartBtn) cartBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click proceed
  await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Fill Step 1 and proceed to Step 2
  await send('Runtime.evaluate', {
    expression: `(function() {
      const inputs = document.querySelectorAll('.checkout-step-panel input');
      if (inputs.length >= 2) {
        const setVal = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setVal(inputs[0], 'John Doe');
        setVal(inputs[1], 'john@example.com');
      }
      const continueBtn = document.querySelector('.checkout-actions button[type="submit"]');
      if (continueBtn) continueBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 3000));

  const state = await send('Runtime.evaluate', {
    expression: `(function() {
      const iframe = document.querySelector('.khqr-live-iframe');
      const tabs = Array.from(document.querySelectorAll('.payment-tab')).map(t => t.textContent.trim());
      const activeTab = document.querySelector('.payment-tab.active')?.textContent.trim();
      const specs = document.querySelector('.khqr-crypto-specs')?.innerText;
      return {
        hasIframe: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        tabs,
        activeTab,
        specs
      };
    })()`,
    returnByValue: true
  });
  console.log('Step 2 Modal State:', JSON.stringify(state.result?.result?.value, null, 2));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'real_qr_step2.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/real_qr_step2.png');

  ws.close();
  chrome.kill();
}

testModal().catch(console.error);
