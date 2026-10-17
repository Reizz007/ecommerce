const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function run() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_test_remove_' + Date.now());
  const port = 9559;
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

    if (!p) {
      console.error('Could not connect to Chrome debugger');
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
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Initial cart in localStorage and DOM
    let res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('1. Initial cart state:', res.result?.result?.value);

    // 2. Open cart drawer
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.cart-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 500));

    // 3. Remove item from cart
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-remove-item')?.click()`
    });
    await new Promise(r => setTimeout(r, 500));

    res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'none',
        emptyText: document.querySelector('.cart-empty')?.innerText || 'not empty'
      })`,
      returnByValue: true
    });
    console.log('2. After clicking remove button:', res.result?.result?.value);

    // 4. Refresh page (F5)
    console.log('3. Refreshing page...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2500));

    res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cartLS: localStorage.getItem('synapse_cart'),
        counter: document.querySelector('.cart-counter')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('4. After refresh cart state:', res.result?.result?.value);

    // Now open cart drawer again after refresh
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.cart-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 500));

    res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        itemsInCartCount: document.querySelectorAll('.cart-item-card').length,
        emptyStateVisible: !!document.querySelector('.cart-empty')
      })`,
      returnByValue: true
    });
    console.log('5. Cart drawer contents after refresh:', res.result?.result?.value);

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
