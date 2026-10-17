const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testViewport(width, height, name) {
  const tmpDir = path.join(os.tmpdir(), 'chrome_resp_' + name + '_' + Date.now());
  const port = 9556;
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
    console.error('Could not find page target for', name);
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

  // Snap 1: Navbar / Hero top
  const ssNav = await send('Page.captureScreenshot', { format: 'png' });
  const navFilename = `resp_nav_${name}.png`;
  fs.writeFileSync(path.join(__dirname, navFilename), Buffer.from(ssNav.result.data, 'base64'));
  fs.writeFileSync(path.join(artifactDir, navFilename), Buffer.from(ssNav.result.data, 'base64'));
  console.log(`Saved ${navFilename}`);

  // Open checkout and go to Step 2
  await send('Runtime.evaluate', { expression: 'window.__openCheckout(true)' });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', { expression: 'document.querySelector(".checkout-actions button[type=submit]")?.click()' });
  await new Promise(r => setTimeout(r, 2500));

  // Snap 2: Modal Step 2
  const ssModal = await send('Page.captureScreenshot', { format: 'png' });
  const modalFilename = `resp_modal_${name}.png`;
  fs.writeFileSync(path.join(__dirname, modalFilename), Buffer.from(ssModal.result.data, 'base64'));
  fs.writeFileSync(path.join(artifactDir, modalFilename), Buffer.from(ssModal.result.data, 'base64'));
  console.log(`Saved ${modalFilename}`);

  // If mobile or tablet, also check mobile menu open
  if (width <= 1024) {
    // close checkout
    await send('Runtime.evaluate', { expression: 'document.querySelector(".btn-close-modal")?.click()' });
    await new Promise(r => setTimeout(r, 500));
    // click hamburger
    await send('Runtime.evaluate', { expression: 'document.querySelector(".mobile-toggle")?.click()' });
    await new Promise(r => setTimeout(r, 500));
    const ssMenu = await send('Page.captureScreenshot', { format: 'png' });
    const menuFilename = `resp_menu_${name}.png`;
    fs.writeFileSync(path.join(__dirname, menuFilename), Buffer.from(ssMenu.result.data, 'base64'));
    fs.writeFileSync(path.join(artifactDir, menuFilename), Buffer.from(ssMenu.result.data, 'base64'));
    console.log(`Saved ${menuFilename}`);
  }

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

async function run() {
  console.log('--- Testing 1440px Desktop ---');
  await testViewport(1440, 900, 'desktop_1440');

  console.log('--- Testing 1150px Laptop ---');
  await testViewport(1150, 800, 'laptop_1150');

  console.log('--- Testing 768px Tablet ---');
  await testViewport(768, 1024, 'tablet_768');

  console.log('--- Testing 390px Mobile ---');
  await testViewport(390, 844, 'mobile_390');

  console.log('All responsive tests completed successfully!');
}

run().catch(console.error);
