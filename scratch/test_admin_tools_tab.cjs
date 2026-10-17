const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

async function testAdmin() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_admin_' + Date.now());
  const port = 9560;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,800',
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

  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', m.params.type, m.params.args.map(a => a.value));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', m.params.exceptionDetails);
    }
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Set user as admin in localStorage
  await send('Runtime.evaluate', {
    expression: `(function() {
      localStorage.setItem('synapse_user', JSON.stringify({ name: 'Chief Architect', email: 'admin@synapse.ai', role: 'admin' }));
      location.reload();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  // Click Admin Panel button
  const clickAdmin = await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.btn-admin-nav');
      if (btn) {
        btn.click();
        return 'clicked btn-admin-nav';
      }
      return 'btn-admin-nav NOT found';
    })()`,
    returnByValue: true
  });
  console.log('Click admin:', clickAdmin.result?.result?.value);
  await new Promise(r => setTimeout(r, 4000));

  // Click 'Products & AI Tools' tab
  const clickTools = await send('Runtime.evaluate', {
    expression: `(function() {
      const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
      const toolsTab = tabs.find(t => t.textContent.includes('Products & AI Tools') || t.textContent.includes('Products'));
      if (toolsTab) {
        toolsTab.click();
        return 'clicked ' + toolsTab.textContent;
      }
      return 'toolsTab NOT found. Available: ' + tabs.map(t => t.textContent).join(' | ');
    })()`,
    returnByValue: true
  });
  console.log('Click tools tab:', clickTools.result?.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Check what is displayed
  const stateCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const pane = document.querySelector('.admin-tab-pane');
      const table = document.querySelector('.admin-table');
      const rows = table ? table.querySelectorAll('tbody tr').length : 0;
      const h2 = pane ? pane.querySelector('h2')?.textContent : null;
      return {
        hasPane: !!pane,
        h2,
        rowCount: rows,
        bodyText: pane ? pane.innerText.slice(0, 300) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('State check:', JSON.stringify(stateCheck.result?.result?.value, null, 2));

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

testAdmin().catch(console.error);
