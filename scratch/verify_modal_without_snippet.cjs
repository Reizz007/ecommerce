const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\c0f320dc-04f5-4178-86fe-7243d3bade14';

async function testModal() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_modal_verify_' + Date.now());
  const port = 9568;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,950',
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
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 2000));

    // Click on the product card to open quick view modal
    const clickCard = await send('Runtime.evaluate', {
      expression: `(function() {
        const card = document.querySelector('.tool-card');
        if (card) {
          card.click();
          return 'CLICKED_CARD';
        }
        return 'CARD_NOT_FOUND';
      })()`,
      returnByValue: true
    });
    console.log('Click product card:', clickCard.result?.result?.value);
    await new Promise(r => setTimeout(r, 800));

    // Verify modal state
    const modalCheck = await send('Runtime.evaluate', {
      expression: `(function() {
        const modal = document.querySelector('.tool-details-container');
        if (!modal) return { isOpen: false };
        const title = modal.querySelector('h2')?.innerText;
        const capabilities = Array.from(modal.querySelectorAll('.capability-card')).map(c => c.innerText.trim());
        const hasSnippet = !!modal.querySelector('.api-snippet-section');
        const price = modal.querySelector('.action-price-val')?.innerText;
        const buyBtn = modal.querySelector('.btn-primary')?.innerText;
        return {
          isOpen: true,
          title,
          capabilities,
          hasSnippet,
          price,
          buyBtn
        };
      })()`,
      returnByValue: true
    });
    console.log('Modal status:', JSON.stringify(modalCheck.result?.result?.value, null, 2));

    // Take screenshot
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const snapPath = path.join(artifactDir, 'modal_snippet_removed_verified.png');
    fs.writeFileSync(snapPath, Buffer.from(snap.result.data, 'base64'));
    console.log('Saved screenshot:', snapPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testModal().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
