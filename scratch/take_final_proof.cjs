const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testScreens() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_snap_real_' + Date.now());
  const port = 9572;
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
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
    };
    await new Promise(r => ws.onopen = r);
    const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 1500));

    // 1. Clear session and click Sign In button in navbar
    await send('Runtime.evaluate', {
      expression: `(function() {
        localStorage.removeItem('synapse_user');
        localStorage.removeItem('synapse_token');
        location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-signin-nav')?.click()`
    });
    await new Promise(r => setTimeout(r, 1000));

    let snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'login_modal_clean_verified.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('1. Saved login modal screenshot!');

    // 2. Set admin user in localStorage and reload
    await send('Runtime.evaluate', {
      expression: `(function() {
        localStorage.setItem('synapse_user', JSON.stringify({
          id: 1,
          name: 'Chief Admin',
          email: 'admin@synapse.ai',
          role: 'admin'
        }));
        location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2500));

    // 3. Click Admin Panel button in navbar
    const clickAdmin = await send('Runtime.evaluate', {
      expression: `(function() {
        const btn = document.querySelector('.btn-admin-nav');
        if (btn) {
          btn.click();
          return 'CLICKED';
        }
        return 'NOT_FOUND';
      })()`,
      returnByValue: true
    });
    console.log('2. Click admin button:', clickAdmin.result?.result?.value);
    await new Promise(r => setTimeout(r, 1500));

    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'admin_dashboard_redesigned_verified.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('3. Saved redesigned dashboard screenshot!');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testScreens().catch(console.error);
