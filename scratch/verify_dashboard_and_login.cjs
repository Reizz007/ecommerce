const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function verifyAll() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_dashboard_verify_' + Date.now());
  const port = 9570;
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

    console.log('=== TEST 1: Login Modal (Verify Note & Quick Access are REMOVED) ===');
    await send('Page.navigate', { url: 'http://localhost:5173#login' });
    await new Promise(r => setTimeout(r, 2000));

    // Check login modal elements
    const loginCheck = await send('Runtime.evaluate', {
      expression: `(function() {
        const modal = document.querySelector('.login-modal-container');
        if (!modal) return { isOpen: false };
        const hasHintText = !!modal.querySelector('.hint-text');
        const hasQuickCreds = !!modal.querySelector('.quick-creds-box');
        const emailInput = !!modal.querySelector('#loginEmail');
        const passwordInput = !!modal.querySelector('#loginPassword');
        return {
          isOpen: true,
          hasHintText,
          hasQuickCreds,
          emailInput,
          passwordInput
        };
      })()`,
      returnByValue: true
    });
    console.log('Login modal check:', JSON.stringify(loginCheck.result?.result?.value, null, 2));

    // Capture screenshot of clean login modal
    let snap = await send('Page.captureScreenshot', { format: 'png' });
    let snapPath = path.join(artifactDir, 'login_modal_clean_verified.png');
    fs.writeFileSync(snapPath, Buffer.from(snap.result.data, 'base64'));
    console.log('Saved login screenshot:', snapPath);

    console.log('\n=== TEST 2: Admin Dashboard (Verify Design & Note/Quick Access Removed) ===');
    // Set user as admin in localStorage and load admin panel
    await send('Runtime.evaluate', {
      expression: `(function() {
        localStorage.setItem('synapse_user', JSON.stringify({
          id: 1,
          name: 'Chief Admin',
          email: 'admin@synapse.ai',
          role: 'admin'
        }));
        location.hash = '#admin';
        location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2500));

    // Click .btn-admin-nav if not opened
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-admin-nav')?.click()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify dashboard elements
    const dashCheck = await send('Runtime.evaluate', {
      expression: `(function() {
        const hasNoteBanner = !!document.querySelector('.admin-pending-alert-banner');
        const hasSidebarQuickAba = !!document.querySelector('.sidebar-aba-card');
        const metricCardsCount = document.querySelectorAll('.admin-metric-card').length;
        const metricTitles = Array.from(document.querySelectorAll('.admin-metric-card .metric-header span')).map(s => s.innerText);
        const metricValues = Array.from(document.querySelectorAll('.admin-metric-card .metric-val')).map(s => s.innerText);
        const hasSystemStrip = !!document.querySelector('.admin-system-strip');
        const recentOrdersRows = document.querySelectorAll('.admin-table tbody tr').length;
        return {
          hasNoteBanner,
          hasSidebarQuickAba,
          metricCardsCount,
          metricTitles,
          metricValues,
          hasSystemStrip,
          recentOrdersRows
        };
      })()`,
      returnByValue: true
    });
    console.log('Dashboard check:', JSON.stringify(dashCheck.result?.result?.value, null, 2));

    // Capture screenshot of redesigned dashboard
    snap = await send('Page.captureScreenshot', { format: 'png' });
    snapPath = path.join(artifactDir, 'admin_dashboard_redesigned_verified.png');
    fs.writeFileSync(snapPath, Buffer.from(snap.result.data, 'base64'));
    console.log('Saved dashboard screenshot:', snapPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

verifyAll().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
