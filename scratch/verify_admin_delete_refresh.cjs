const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testAdminDelete() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_admin_del_' + Date.now());
  const port = 9566;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1400,900',
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

    // 1. Set admin session in localStorage directly
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 1500));

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

    // Click .btn-admin-nav
    const clickAdmin = await send('Runtime.evaluate', {
      expression: `(function() {
        const btn = document.querySelector('.btn-admin-nav');
        if (btn) {
          btn.click();
          return 'CLICKED_ADMIN_NAV';
        }
        return 'BTN_NOT_FOUND';
      })()`,
      returnByValue: true
    });
    console.log('Click admin nav:', clickAdmin.result?.result?.value);
    await new Promise(r => setTimeout(r, 1000));

    // Click 'Products & AI Tools' tab
    await send('Runtime.evaluate', {
      expression: `(function() {
        const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
        const toolsTab = tabs.find(t => t.textContent.includes('Products & AI Tools') || t.textContent.includes('Products'));
        if (toolsTab) toolsTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    let res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        productsRowsCount: document.querySelectorAll('.admin-table tbody tr').length,
        firstRowName: document.querySelector('.admin-table tbody tr .product-name-cell strong')?.innerText || 'none'
      })`,
      returnByValue: true
    });
    console.log('Initial products table:', res.result?.result?.value);

    // 3. Create a temporary product to test deletion
    console.log('Creating a test product in SQLite...');
    const createRes = await fetch('http://127.0.0.1:8000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Temporary Test AI Engine',
        category_slug: 'code',
        badge: 'TEMP',
        price_monthly: 9.99,
        price_lifetime: 49.99,
        short_desc: 'Test model to be deleted and verified'
      })
    });
    const createdData = await createRes.json();
    console.log('Created test product ID:', createdData.product?.id);

    // Refresh admin panel
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));
    // Click .btn-admin-nav again if needed
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-admin-nav')?.click()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Switch to tools tab
    await send('Runtime.evaluate', {
      expression: `(function() {
        const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
        const toolsTab = tabs.find(t => t.textContent.includes('Products & AI Tools') || t.textContent.includes('Products'));
        if (toolsTab) toolsTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        productsRowsCount: document.querySelectorAll('.admin-table tbody tr').length,
        hasTempProduct: Array.from(document.querySelectorAll('.product-name-cell strong')).some(s => s.innerText.includes('Temporary Test'))
      })`,
      returnByValue: true
    });
    console.log('Products table after creating test product:', res.result?.result?.value);

    // 4. Click delete on the test product
    console.log('Deleting test product via UI button...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        window.confirm = () => true; // auto-confirm confirm modal
        const rows = document.querySelectorAll('.admin-table tbody tr');
        for (let r of rows) {
          if (r.innerText.includes('Temporary Test')) {
            const delBtn = r.querySelector('.btn-table-action.delete');
            if (delBtn) delBtn.click();
            break;
          }
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // 5. Refresh page (F5) and verify it remains deleted!
    console.log('Refreshing page (F5) to verify deletion persistence...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    // Click .btn-admin-nav again
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-admin-nav')?.click()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Switch back to tools tab
    await send('Runtime.evaluate', {
      expression: `(function() {
        const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
        const toolsTab = tabs.find(t => t.textContent.includes('Products & AI Tools') || t.textContent.includes('Products'));
        if (toolsTab) toolsTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        productsRowsCount: document.querySelectorAll('.admin-table tbody tr').length,
        hasTempProduct: Array.from(document.querySelectorAll('.product-name-cell strong')).some(s => s.innerText.includes('Temporary Test')),
        deletedFromDB: !Array.from(document.querySelectorAll('.product-name-cell strong')).some(s => s.innerText.includes('Temporary Test'))
      })`,
      returnByValue: true
    });
    console.log('Products table after refresh (MUST BE DELETED):', res.result?.result?.value);

    // Screenshot of admin products table
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const snapPath = path.join(artifactDir, 'admin_delete_refresh_verified.png');
    fs.writeFileSync(snapPath, Buffer.from(snap.result.data, 'base64'));
    console.log('Saved screenshot:', snapPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testAdminDelete().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
