const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function run() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_test_cart_dom_' + Date.now());
  const port = 9560;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,800',
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

    // Open cart drawer
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.cart-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Check DOM inside cart drawer
    let domCheck = await send('Runtime.evaluate', {
      expression: `(function() {
        const drawer = document.querySelector('.cart-drawer');
        const items = document.querySelectorAll('.cart-item-card');
        const removeBtns = document.querySelectorAll('.btn-remove-item');
        return JSON.stringify({
          drawerFound: !!drawer,
          itemsCount: items.length,
          removeBtnsCount: removeBtns.length,
          drawerHTML: drawer ? drawer.innerHTML.slice(0, 500) : 'none'
        });
      })()`,
      returnByValue: true
    });
    console.log('DOM inside drawer:', domCheck.result?.result?.value);

    // Now click the remove button
    let clickResult = await send('Runtime.evaluate', {
      expression: `(function() {
        const btn = document.querySelector('.btn-remove-item');
        if (!btn) return 'NO_BTN';
        btn.click();
        return 'CLICKED';
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickResult.result?.result?.value);

    await new Promise(r => setTimeout(r, 1000));

    // Check cart in localStorage
    let lsCheck = await send('Runtime.evaluate', {
      expression: `localStorage.getItem('synapse_cart')`,
      returnByValue: true
    });
    console.log('localStorage after click:', lsCheck.result?.result?.value);

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
