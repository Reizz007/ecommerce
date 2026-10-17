const { spawn } = require('child_process');
const fs = require('fs');

async function check() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9499',
    '--headless=new',
    '--window-size=1200,800'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9499/json/list');
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
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Click cart icon
  await send('Runtime.evaluate', {
    expression: 'document.querySelector(".cart-btn")?.click()'
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click proceed
  await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Proceed to Checkout"))?.click()'
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check what is currently visible
  const modalText = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".checkout-modal-container")?.innerText',
    returnByValue: true
  });
  console.log('Modal text at Step 1:', modalText.result?.result?.value);

  // Submit step 1
  await send('Runtime.evaluate', {
    expression: 'document.querySelector(".checkout-actions button[type=submit]")?.click()'
  });
  await new Promise(r => setTimeout(r, 3000));

  const modalStep2 = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".checkout-modal-container")?.innerText',
    returnByValue: true
  });
  console.log('Modal text at Step 2:', modalStep2.result?.result?.value);

  const iframeSrc = await send('Runtime.evaluate', {
    expression: 'document.querySelector("iframe")?.src',
    returnByValue: true
  });
  console.log('Iframe src:', iframeSrc.result?.result?.value);

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/verified_real_qr.png', Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/verified_real_qr.png');

  ws.close();
  chrome.kill();
}
check().catch(console.error);
