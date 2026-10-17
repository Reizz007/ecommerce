const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testAll() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_verify_fix_' + Date.now());
  const port = 9570;
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
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Currency Options in DOM
  const currencyCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const select = document.querySelector('.currency-select');
      if (!select) return { found: false };
      const options = Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
      return { found: true, count: options.length, options };
    })()`,
    returnByValue: true
  });
  console.log('1. Currency Dropdown Check:', JSON.stringify(currencyCheck.result?.result?.value, null, 2));

  // Switch currency to KHR and check formatted price
  await send('Runtime.evaluate', {
    expression: `(function() {
      const select = document.querySelector('.currency-select');
      select.value = 'KHR';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const khrPriceCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const priceEl = document.querySelector('.tool-lifetime-price');
      return priceEl ? priceEl.innerText : null;
    })()`,
    returnByValue: true
  });
  console.log('2. KHR Formatted Price Check:', khrPriceCheck.result?.result?.value);

  // Switch back to USD
  await send('Runtime.evaluate', {
    expression: `(function() {
      const select = document.querySelector('.currency-select');
      select.value = 'USD';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Click a Product Card in the Catalog
  const clickCardRes = await send('Runtime.evaluate', {
    expression: `(function() {
      const card = document.querySelector('.tool-card');
      if (card) {
        card.click();
        return 'clicked first tool-card';
      }
      return 'tool-card NOT found';
    })()`,
    returnByValue: true
  });
  console.log('3. Click Product Card:', clickCardRes.result?.result?.value);
  await new Promise(r => setTimeout(r, 800));

  const modalCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const modal = document.querySelector('.tool-details-container');
      const title = modal ? modal.querySelector('h2')?.textContent : null;
      return {
        isOpen: !!modal,
        title
      };
    })()`,
    returnByValue: true
  });
  console.log('4. Tool Quick View Modal Check:', JSON.stringify(modalCheck.result?.result?.value, null, 2));

  // Snap Quick View Modal
  const ssModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'product_modal_open.png'), Buffer.from(ssModal.result.data, 'base64'));
  console.log('Saved product_modal_open.png');

  // Close modal
  await send('Runtime.evaluate', { expression: 'document.querySelector(".tool-details-container .modal-close")?.click()' });
  await new Promise(r => setTimeout(r, 500));

  // 3. Test Admin Panel -> Products & AI Tools
  await send('Runtime.evaluate', {
    expression: `(function() {
      localStorage.setItem('synapse_user', JSON.stringify({ name: 'Chief Architect', email: 'admin@synapse.ai', role: 'admin' }));
      location.reload();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', { expression: 'document.querySelector(".btn-admin-nav")?.click()' });
  await new Promise(r => setTimeout(r, 3500));

  // Click 'Products & AI Tools' tab
  const clickToolsTab = await send('Runtime.evaluate', {
    expression: `(function() {
      const tabs = Array.from(document.querySelectorAll('.admin-menu-item'));
      const tab = tabs.find(t => t.textContent.includes('Products'));
      if (tab) {
        tab.click();
        return 'clicked tab: ' + tab.textContent;
      }
      return 'tab NOT found';
    })()`,
    returnByValue: true
  });
  console.log('5. Admin Products & AI Tools Click:', clickToolsTab.result?.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  const adminToolsCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const table = document.querySelector('.admin-table');
      const rows = table ? table.querySelectorAll('tbody tr') : [];
      const toolNames = Array.from(rows).map(r => r.querySelector('.tool-name-cell strong')?.textContent).filter(Boolean);
      return {
        rowCount: rows.length,
        toolNames: toolNames.slice(0, 6)
      };
    })()`,
    returnByValue: true
  });
  console.log('6. Admin Products Table Rows:', JSON.stringify(adminToolsCheck.result?.result?.value, null, 2));

  // Snap Admin Products view
  const ssAdmin = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'admin_products_tab.png'), Buffer.from(ssAdmin.result.data, 'base64'));
  console.log('Saved admin_products_tab.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

testAll().catch(console.error);
