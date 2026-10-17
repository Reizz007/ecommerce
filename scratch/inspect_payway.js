const { spawn } = require('child_process');
const fs = require('fs');

async function testPayway() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9457',
    '--headless=new',
    '--window-size=1200,900'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9457/json/list');
  const [p] = await res.json();
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

  console.log('Navigating to PayWay link...');
  await send('Page.navigate', { url: 'https://link.payway.com.kh/ABAPAY9s540501U' });
  await new Promise(r => setTimeout(r, 4000));

  const pageInfo = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true
  });
  console.log('PayWay page text:\n', pageInfo.result?.result?.value);

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/payway_page.png', Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/payway_page.png');

  ws.close();
  chrome.kill();
}
testPayway().catch(console.error);
