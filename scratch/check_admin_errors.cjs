const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function testErrors() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_check_admin_err_' + Date.now());
  const port = 9574;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1440,900',
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
    const consoleLogs = [];
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
        consoleLogs.push(m);
      }
      if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
    };
    await new Promise(r => ws.onopen = r);
    const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 1500));

    // Set user as admin
    await send('Runtime.evaluate', {
      expression: `(function() {
        localStorage.setItem('synapse_user', JSON.stringify({ id: 1, name: 'Admin', role: 'admin' }));
        location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    // Click .btn-admin-nav
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-admin-nav')?.click()`
    });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Console logs/exceptions in Admin:', JSON.stringify(consoleLogs, null, 2));

    const checkDom = await send('Runtime.evaluate', {
      expression: `(function() {
        const adminWrapper = document.querySelector('.admin-wrapper');
        return {
          hasAdminWrapper: !!adminWrapper,
          bodyHTML: document.body.innerHTML.slice(0, 500)
        };
      })()`,
      returnByValue: true
    });
    console.log('Admin DOM check:', JSON.stringify(checkDom.result?.result?.value, null, 2));

    ws.close();
  } finally {
    chrome.kill();
  }
}

testErrors().catch(console.error);
