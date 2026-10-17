const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function snap() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_cat_snap_' + Date.now());
  const port = 9575;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,1000',
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
    await send('Page.navigate', { url: 'http://localhost:5173#tools' });
    await new Promise(r => setTimeout(r, 3500));

    await send('Runtime.evaluate', {
      expression: 'document.getElementById("tools")?.scrollIntoView({ behavior: "instant" })'
    });
    await new Promise(r => setTimeout(r, 500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const targetPath = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\080adc68-6686-435a-8e30-d83f3af03057\\category_bar_proof.png';
    fs.writeFileSync(targetPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved proof screenshot to:', targetPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

snap().catch(console.error);
