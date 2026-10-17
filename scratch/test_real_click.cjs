const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9450',
    '--headless=new',
    '--window-size=375,812'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9450/json/list');
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Click helper using coordinates
  async function clickSelector(sel) {
    const box = await send('Runtime.evaluate', {
      expression: `(function() {
        const el = document.querySelector('${sel}') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('${sel}'));
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width, height: rect.height };
      })()`,
      returnByValue: true
    });
    const pos = box.result?.result?.value;
    console.log('Pos for', sel, ':', pos);
    if (!pos || pos.width === 0) return false;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    return true;
  }

  console.log('Clicking cart button...');
  await clickSelector('.cart-btn');
  await new Promise(r => setTimeout(r, 800));

  console.log('Clicking Proceed to Checkout...');
  await clickSelector('Proceed to Checkout');
  await new Promise(r => setTimeout(r, 1200));

  console.log('Checking modal state...');
  const modalCheck = await send('Runtime.evaluate', {
    expression: `!!document.querySelector('.checkout-modal-container')`,
    returnByValue: true
  });
  console.log('Is checkout modal open?', modalCheck.result?.result?.value);

  // Take screenshot
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'checkout_step1.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved checkout_step1.png');

  // Fill in inputs and click Continue to Payment
  console.log('Filling inputs and clicking Continue to Payment...');
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
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  await clickSelector('Continue to Payment');
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing Step 2 screenshot...');
  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'checkout_step2.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved checkout_step2.png');

  // Scroll step 2
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.checkout-step-panel')?.scrollTo(0, 450)`
  });
  await new Promise(r => setTimeout(r, 600));
  const ss2_scroll = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'checkout_step2_scroll.png'), Buffer.from(ss2_scroll.result.data, 'base64'));
  console.log('Saved checkout_step2_scroll.png');

  ws.close();
  chrome.kill();
}
test().catch(console.error);
