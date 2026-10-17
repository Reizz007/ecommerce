const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function snap() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_laptop_' + Date.now());
  const port = 9522;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1150,800'
  ]);

  let p = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        if (list.length > 0 && list[0].webSocketDebuggerUrl) {
          p = list[0];
          break;
        }
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
  }

  if (!p) {
    console.error('Chrome failed to open debug port');
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
    width: 1150,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2200));

  // Snap 1: Header at 1150px
  const ssNav = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'nav_1150_fixed.png'), Buffer.from(ssNav.result.data, 'base64'));
  console.log('Saved nav_1150_fixed.png');

  // Open checkout and step to 2
  await send('Runtime.evaluate', { expression: 'window.__openCheckout(true)' });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', { expression: 'document.querySelector(".checkout-actions button[type=submit]")?.click()' });
  await new Promise(r => setTimeout(r, 3000));

  // Snap 2: Modal Step 2 at 1150px
  const ssModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'modal_1150_fixed.png'), Buffer.from(ssModal.result.data, 'base64'));
  console.log('Saved modal_1150_fixed.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

snap().catch(console.error);
