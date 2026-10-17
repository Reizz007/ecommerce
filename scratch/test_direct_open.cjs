const { spawn } = require('child_process');
const fs = require('fs');

async function check() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9499',
    '--headless=new',
    '--window-size=1200,900'
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

  // Open checkout
  await send('Runtime.evaluate', {
    expression: 'window.__openCheckout(true)'
  });
  await new Promise(r => setTimeout(r, 500));

  // Dispatch submit
  await send('Runtime.evaluate', {
    expression: `(function() {
      const btn = document.querySelector('.checkout-step-panel form button[type=submit]');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 3500));

  const result = await send('Runtime.evaluate', {
    expression: `(function() {
      const modal = document.querySelector('.checkout-modal-container');
      const stepTitle = document.querySelector('.step-title');
      const activeTab = document.querySelector('.payment-tab.active');
      const iframe = document.querySelector('.khqr-live-iframe');
      const specs = document.querySelector('.khqr-crypto-specs');
      return {
        hasModal: !!modal,
        stepTitle: stepTitle ? stepTitle.textContent : null,
        activeTab: activeTab ? activeTab.textContent : null,
        hasIframe: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        specs: specs ? specs.innerText : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(result.result?.result?.value, null, 2));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/real_qr_verified.png', Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/real_qr_verified.png');

  ws.close();
  chrome.kill();
}
check().catch(console.error);
