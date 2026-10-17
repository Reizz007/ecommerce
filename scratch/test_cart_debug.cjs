const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function run() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_debug_btn_' + Date.now());
  const port = 9561;
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

    let check = await send('Runtime.evaluate', {
      expression: `(function() {
        const btns = document.querySelectorAll('.cart-btn');
        return {
          btnsCount: btns.length,
          btnsVisible: Array.from(btns).map(b => b.offsetWidth > 0 && b.offsetHeight > 0),
          btnsHTML: Array.from(btns).map(b => b.outerHTML)
        };
      })()`,
      returnByValue: true
    });
    console.log('Cart btns:', JSON.stringify(check.result?.result?.value, null, 2));

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
