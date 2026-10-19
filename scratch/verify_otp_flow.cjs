const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function testOtpFlow() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_otp_test_' + Date.now());
  const port = 9588;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,800',
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
      await new Promise(r => setTimeout(r, 200));
    }

    if (!p) throw new Error('Could not connect to Chrome debugging port');

    const ws = new WebSocket(p.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };
    await new Promise(r => ws.onopen = r);
    const send = (method, params = {}) => new Promise(resolve => {
      const mid = id++;
      callbacks.set(mid, resolve);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:5173#login ...');
    await send('Page.navigate', { url: 'http://localhost:5173#login' });
    await new Promise(r => setTimeout(r, 2500));

    // Check step 1: Email empty, no autofill
    const step1Check = await send('Runtime.evaluate', {
      expression: `(function() {
        const emailInput = document.querySelector('#loginEmail');
        const modal = document.querySelector('.login-modal-container');
        return {
          modalOpen: !!modal,
          emailValue: emailInput ? emailInput.value : null,
          hasAdminBadge: !!document.querySelector('.admin-badge'),
          hasAutoFillBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Auto Fill'))
        };
      })()`,
      returnByValue: true
    });
    console.log('Step 1 initial state:', JSON.stringify(step1Check.result.value));

    // Type email using React's native value setter
    console.log('Typing email chetranicky@gmail.com ...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const input = document.querySelector('#loginEmail');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, 'chetranicky@gmail.com');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const form = input.closest('form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      })()`
    });

    // Wait for OTP step (up to 12s for Gmail SMTP delivery)
    console.log('Waiting for backend OTP send (SMTP to Gmail)...');
    let step2Reached = false;
    let toastMessage = '';
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const res = await send('Runtime.evaluate', {
        expression: `(function() {
          const otpInput = document.querySelector('#loginOtp');
          const toasts = Array.from(document.querySelectorAll('.toast, [role="status"], .toast-message, .app-toast')).map(t => t.textContent).join(' | ');
          return {
            hasOtpInput: !!otpInput,
            otpValue: otpInput ? otpInput.value : '',
            toasts: toasts
          };
        })()`,
        returnByValue: true
      });
      if (res.result.value && res.result.value.hasOtpInput) {
        step2Reached = true;
        toastMessage = res.result.value.toasts;
        console.log(`Step 2 reached at ${i+1}s! State:`, JSON.stringify(res.result.value));
        break;
      }
    }

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join('C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\247a0cb3-ce75-4045-a55a-378834cb1c0f', 'otp_real_delivery_test.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot to', shotPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testOtpFlow().catch(console.error);
