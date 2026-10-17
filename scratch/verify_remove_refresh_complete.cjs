const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testPersistence() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_verify_persist_' + Date.now());
  const port = 9564;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,900',
    '--disable-extensions'
  ]);

  try {
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

    if (!p) throw new Error('Could not attach to Chrome');

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
    await new Promise(r => setTimeout(r, 2500));

    console.log('=== TEST 1: Initial State ===');
    let state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'empty',
        productCardsCount: document.querySelectorAll('.tool-card').length,
        firstProductName: document.querySelector('.tool-card .tool-name')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('Initial page state:', state.result?.result?.value);

    console.log('\n=== TEST 2: Add Product to Cart ===');
    // Click "Buy License" on first tool
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.tool-card .btn-primary')[0]?.click()`
    });
    await new Promise(r => setTimeout(r, 600));

    state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'empty',
        drawerOpen: !!document.querySelector('.cart-drawer'),
        itemsInDrawer: document.querySelectorAll('.cart-item-card').length,
        itemNameInDrawer: document.querySelector('.cart-item-name')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('State after adding product:', state.result?.result?.value);

    console.log('\n=== TEST 3: Click Remove Item in Cart ===');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-remove-item')?.click()`
    });
    await new Promise(r => setTimeout(r, 600));

    state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'empty',
        drawerOpen: !!document.querySelector('.cart-drawer'),
        isEmptyVisible: !!document.querySelector('.cart-empty')
      })`,
      returnByValue: true
    });
    console.log('State after removing item:', state.result?.result?.value);

    console.log('\n=== TEST 4: Page Refresh (F5) ===');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2500));

    state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'empty',
        productCardsCount: document.querySelectorAll('.tool-card').length,
        firstProductName: document.querySelector('.tool-card .tool-name')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('State after reload (MUST BE EMPTY!):', state.result?.result?.value);

    // Open cart drawer to confirm empty state
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.cart-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 500));

    state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        itemsInDrawerAfterReload: document.querySelectorAll('.cart-item-card').length,
        emptyStateVisible: !!document.querySelector('.cart-empty'),
        emptyText: document.querySelector('.cart-empty h4')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('Cart drawer after reload verification:', state.result?.result?.value);

    // Take screenshot of empty cart drawer after reload
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const snapPath = path.join(artifactDir, 'cart_empty_after_refresh_verified.png');
    fs.writeFileSync(snapPath, Buffer.from(snap.result.data, 'base64'));
    console.log('Saved screenshot:', snapPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testPersistence().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
