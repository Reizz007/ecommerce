const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testPersistence() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_persist_' + Date.now());
  const port = 9575;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,850',
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
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // --- TEST 1: Cart Item Removal and Refresh ---
  console.log('--- Testing Cart Item Removal & Refresh ---');
  // Check initial cart count
  const initialCart = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".cart-counter")?.textContent',
    returnByValue: true
  });
  console.log('Initial Cart Count badge:', initialCart.result?.result?.value);

  // Click cart button to open drawer
  await send('Runtime.evaluate', { expression: 'document.querySelector(".cart-btn")?.click()' });
  await new Promise(r => setTimeout(r, 1200));

  // Click remove item button
  const removeRes = await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.btn-remove-item');
      if (btn) {
        btn.click();
        return 'clicked btn-remove-item';
      }
      return 'btn-remove-item NOT found';
    })()`,
    returnByValue: true
  });
  console.log('Remove button click:', removeRes.result?.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Check cart empty state in drawer
  const emptyCheck = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".cart-empty h4")?.textContent',
    returnByValue: true
  });
  console.log('Cart drawer text after remove:', emptyCheck.result?.result?.value);

  // Close cart drawer
  await send('Runtime.evaluate', { expression: 'document.querySelector(".drawer-close")?.click()' });
  await new Promise(r => setTimeout(r, 500));

  // RELOAD THE PAGE cleanly
  console.log('Reloading page via Page.navigate...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // Check cart badge after refresh
  const cartAfterRefresh = await send('Runtime.evaluate', {
    expression: `(function() {
      const badge = document.querySelector('.cart-count');
      const cartStorage = localStorage.getItem('synapse_cart');
      return {
        hasBadge: !!badge,
        badgeText: badge ? badge.textContent : null,
        localStorageCart: cartStorage
      };
    })()`,
    returnByValue: true
  });
  console.log('Cart after refresh:', JSON.stringify(cartAfterRefresh.result?.result?.value, null, 2));

  // --- TEST 2: Admin Panel View and Clean Layout ---
  console.log('\n--- Testing Admin Panel Layout & Products ---');
  await send('Runtime.evaluate', {
    expression: `(function() {
      localStorage.setItem('synapse_user', JSON.stringify({ name: 'Chief Architect', email: 'admin@synapse.ai', role: 'admin' }));
      location.reload();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  // Open Admin Panel
  await send('Runtime.evaluate', { expression: 'document.querySelector(".btn-admin-nav")?.click()' });
  await new Promise(r => setTimeout(r, 3000));

  // Click 'Products & AI Tools' tab
  await send('Runtime.evaluate', {
    expression: `(function() {
      const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
      const tab = tabs.find(t => t.textContent.includes('Products'));
      if (tab) tab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const adminCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const headers = Array.from(document.querySelectorAll('.admin-table th')).map(th => th.textContent);
      const rows = Array.from(document.querySelectorAll('.admin-table tbody tr'));
      const menuItems = Array.from(document.querySelectorAll('.admin-menu-item')).map(m => m.innerText.trim());
      const sidebarCard = document.querySelector('.sidebar-aba-card')?.innerText.trim();
      return {
        headers,
        rowCount: rows.length,
        menuItems,
        sidebarCard
      };
    })()`,
    returnByValue: true
  });
  console.log('Admin check:', JSON.stringify(adminCheck.result?.result?.value, null, 2));

  // Snap admin panel
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'admin_panel_clean_verified.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved admin_panel_clean_verified.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

testPersistence().catch(console.error);
