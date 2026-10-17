import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9470',
    '--headless=new',
    '--window-size=500,700'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9470/json/list');
  const [p] = await res.json();
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Console.messageAdded') {
      console.log('Console:', m.params.message.text);
    }
    if (m.method === 'Network.responseReceived') {
      console.log('Response:', m.params.response.url, m.params.response.status);
    }
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });
  await send('Page.enable');
  await send('Console.enable');
  await send('Network.enable');

  const filePath = 'file:///' + path.resolve(__dirname, 'test_iframe.html').replace(/\\/g, '/');
  console.log('Navigating to', filePath);
  await send('Page.navigate', { url: filePath });

  await new Promise(r => setTimeout(r, 5000));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'test_iframe_snap.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved test_iframe_snap.png');

  ws.close();
  chrome.kill();
}
run().catch(console.error);
