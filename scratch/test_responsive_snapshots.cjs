const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testViewport(width, height, name) {
  const tmpDir = path.join(os.tmpdir(), 'chrome_resp_' + name + '_' + Date.now());
  const port = 9500 + Math.floor(Math.random() * 400);
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`
  ]);

  await new Promise(r => setTimeout(r, 1800));
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
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
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768
  });

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot navbar & hero
  const ssNav = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, `responsive_nav_${name}.png`), Buffer.from(ssNav.result.data, 'base64'));
  console.log(`Saved responsive_nav_${name}.png (${width}x${height})`);

  // Open checkout and go to Step 2
  await send('Runtime.evaluate', {
    expression: 'window.__openCheckout(true)'
  });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', {
    expression: 'document.querySelector(".checkout-actions button[type=submit]")?.click()'
  });
  await new Promise(r => setTimeout(r, 2500));

  // Screenshot modal step 2
  const ssModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, `responsive_modal_${name}.png`), Buffer.from(ssModal.result.data, 'base64'));
  console.log(`Saved responsive_modal_${name}.png (${width}x${height})`);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

async function main() {
  // Test the exact viewport that had the squished header (1150px)
  await testViewport(1150, 800, 'laptop_1150');
  // Test mobile (390px)
  await testViewport(390, 844, 'mobile_390');
}

main().catch(console.error);
