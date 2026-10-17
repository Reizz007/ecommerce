const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testViewport(width, height, name) {
  const tmpDir = path.join(os.tmpdir(), 'chrome_step2_' + name + '_' + Date.now());
  const port = 9557;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    '--disable-extensions'
  ]);

  let p = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        p = list.find(x => x.type === 'page' && x.webSocketDebuggerUrl);
        if (p) break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 250));
  }

  if (!p) {
    chrome.kill();
    return;
  }

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
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768
  });

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Open cart then proceed
  await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.cart-btn');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Fill Step 1 form
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
      const submit = document.querySelector('.checkout-actions button[type="submit"]');
      if (submit) submit.click();
    })()`
  });

  // Wait for Step 2 and KHQR generation
  await new Promise(r => setTimeout(r, 3000));

  // Capture Step 2 top
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, `modal_step2_${name}_top.png`), Buffer.from(ss1.result.data, 'base64'));
  console.log(`Saved modal_step2_${name}_top.png`);

  // Scroll modal panel down to check specs & buttons on mobile/tablet
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.checkout-step-panel')?.scrollTo(0, 450)`
  });
  await new Promise(r => setTimeout(r, 600));

  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, `modal_step2_${name}_scrolled.png`), Buffer.from(ss2.result.data, 'base64'));
  console.log(`Saved modal_step2_${name}_scrolled.png`);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

async function run() {
  console.log('Testing Mobile (390px)...');
  await testViewport(390, 844, 'mobile_390');

  console.log('Testing Tablet (768px)...');
  await testViewport(768, 1024, 'tablet_768');

  console.log('Testing Laptop (1150px)...');
  await testViewport(1150, 800, 'laptop_1150');
}

run().catch(console.error);
