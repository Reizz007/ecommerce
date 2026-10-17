const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function test() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_cat_test_' + Date.now());
  const port = 9571;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=' + port,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,800',
    '--disable-extensions'
  ]);

  try {
    let p = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch('http://127.0.0.1:' + port + '/json/list');
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
    // Wait for react and async API fetches to complete
    await new Promise(r => setTimeout(r, 3500));

    const categories = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('.cat-pill')).map(el => el.innerText.trim().replace(/\\s+/g, ' '))`,
      returnByValue: true
    });
    console.log('Rendered Category Pills:', categories.result?.result?.value);

    const tools = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('.tool-card h3')).map(el => el.innerText.trim())`,
      returnByValue: true
    });
    console.log('Rendered Tool Cards:', tools.result?.result?.value);

    // Test clicking on the second category pill (the admin category "AI & TOOL")
    await send('Runtime.evaluate', {
      expression: `
        const pills = document.querySelectorAll('.cat-pill');
        if (pills.length > 1) {
          pills[1].click();
        }
      `
    });
    await new Promise(r => setTimeout(r, 500));

    const toolsAfterClick = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('.tool-card h3')).map(el => el.innerText.trim())`,
      returnByValue: true
    });
    console.log('Tools after clicking admin category:', toolsAfterClick.result?.result?.value);

    const countText = await send('Runtime.evaluate', {
      expression: `document.querySelector('.results-count')?.innerText`,
      returnByValue: true
    });
    console.log('Results count after clicking:', countText.result?.result?.value);

    // Take screenshot for visual proof
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const fs = require('fs');
    fs.writeFileSync('scratch/category_filter_proof.png', Buffer.from(screenshot.result.data, 'base64'));
    console.log('Screenshot saved to scratch/category_filter_proof.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

test().catch(console.error);
