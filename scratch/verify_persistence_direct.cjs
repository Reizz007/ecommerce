const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

async function test() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_direct_' + Date.now());
  const port = 9580;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,850'
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

  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); } };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // Check initial cart in localStorage
  const c1 = await send('Runtime.evaluate', {
    expression: 'localStorage.getItem("synapse_cart")',
    returnByValue: true
  });
  console.log('1. Initial cart in localStorage:', c1.result?.result?.value);

  // Simulate user removing item from cart by emptying it via localStorage and dispatching storage event or UI
  await send('Runtime.evaluate', {
    expression: `(function() {
      // Clear cart
      localStorage.setItem('synapse_cart', '[]');
    })()`
  });
  console.log('2. Cleared cart in localStorage');

  // Reload page
  console.log('3. Reloading page (F5)...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // Check cart after reload
  const c2 = await send('Runtime.evaluate', {
    expression: `(function() {
      const stored = localStorage.getItem('synapse_cart');
      const badge = document.querySelector('.cart-counter');
      return {
        storedCart: stored,
        hasBadge: !!badge,
        badgeText: badge ? badge.textContent : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('4. Cart after reload:', JSON.stringify(c2.result?.result?.value, null, 2));

  // Now test database tools: check what tools are rendered in store
  const storeTools = await send('Runtime.evaluate', {
    expression: `(function() {
      const cards = Array.from(document.querySelectorAll('.tool-card'));
      return {
        count: cards.length,
        names: cards.map(c => c.querySelector('.tool-name')?.textContent)
      };
    })()`,
    returnByValue: true
  });
  console.log('5. Store Tools rendered:', JSON.stringify(storeTools.result?.result?.value, null, 2));

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

test().catch(console.error);
