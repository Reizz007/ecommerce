const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9333;
  const tempProfile = path.join(__dirname, 'temp_chrome_profile');

  // Spawn headless chrome
  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=375,812'
  ]);

  // wait 1.5s for Chrome to start
  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const pages = await listRes.json();
    let wsUrl = pages[0]?.webSocketDebuggerUrl;

    if (!wsUrl) {
      const newRes = await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173`);
      const newPage = await newRes.json();
      wsUrl = newPage.webSocketDebuggerUrl;
    }

    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    console.log('Setting viewport to 375x812 (mobile iPhone 13/14)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Clicking cart button...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const cartBtn = document.querySelector('.cart-btn') || document.querySelector('[aria-label*="Cart"]') || document.querySelector('.btn-cart');
        if (cartBtn) {
          cartBtn.click();
          return 'Cart button clicked';
        }
        return 'No cart button found';
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Clicking checkout button (.btn-full)...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const checkoutBtn = document.querySelector('.btn-full') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
        if (checkoutBtn) {
          checkoutBtn.click();
          return 'Checkout button clicked: ' + checkoutBtn.className;
        }
        return 'No checkout button found';
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Filling Step 1 and proceeding to Step 2...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const nameInput = document.querySelector('input[placeholder*="Alex"]') || document.querySelectorAll('.checkout-step-panel input')[0];
        const emailInput = document.querySelector('input[placeholder*="alex@"]') || document.querySelectorAll('.checkout-step-panel input')[1];
        if (nameInput) {
          nameInput.value = 'John Doe';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (emailInput) {
          emailInput.value = 'john@example.com';
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const continueBtn = document.querySelector('.checkout-actions button[type="submit"]');
        if (continueBtn) {
          continueBtn.click();
          return 'Continued to Step 2';
        }
        return 'Continue button not found';
      })()`
    });
    await new Promise(r => setTimeout(r, 3000));

    console.log('Capturing mobile screenshot of Step 2 (ABA Tab)...');
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'mobile_payment_aba.png'), Buffer.from(ss1.result.data, 'base64'));
    console.log('Saved mobile_payment_aba.png');

    // Scroll down inside the checkout-step-panel
    await send('Runtime.evaluate', {
      expression: `(function() {
        const panel = document.querySelector('.checkout-step-panel');
        if (panel) panel.scrollTop = 500;
      })()`
    });
    await new Promise(r => setTimeout(r, 500));
    const ss1_scrolled = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'mobile_payment_aba_scrolled.png'), Buffer.from(ss1_scrolled.result.data, 'base64'));
    console.log('Saved mobile_payment_aba_scrolled.png');

    // Switch to KHQR tab
    console.log('Switching to KHQR tab...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const khqrTab = document.getElementById('tab-payment-khqr');
        if (khqrTab) khqrTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 3000));

    console.log('Capturing mobile screenshot of Step 2 (KHQR Tab)...');
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'mobile_payment_khqr.png'), Buffer.from(ss2.result.data, 'base64'));
    console.log('Saved mobile_payment_khqr.png');

    // Check layout metrics
    const metrics = await send('Runtime.evaluate', {
      expression: `(function() {
        const modal = document.querySelector('.checkout-modal-container');
        const panel = document.querySelector('.checkout-step-panel');
        const tabs = document.querySelector('.payment-methods-tabs');
        const card = document.querySelector('.aba-pay-card') || document.querySelector('.khqr-pay-card');
        const iframe = document.querySelector('.khqr-iframe-card');
        const actions = document.querySelector('.checkout-actions-aba-wrap');
        
        return {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          documentScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          modal: modal ? {
            width: modal.offsetWidth,
            height: modal.offsetHeight,
            scrollWidth: modal.scrollWidth,
            clientWidth: modal.clientWidth
          } : null,
          panel: panel ? {
            width: panel.offsetWidth,
            height: panel.offsetHeight,
            scrollWidth: panel.scrollWidth,
            scrollHeight: panel.scrollHeight,
            clientWidth: panel.clientWidth,
            clientHeight: panel.clientHeight
          } : null,
          tabs: tabs ? {
            width: tabs.offsetWidth,
            scrollWidth: tabs.scrollWidth
          } : null,
          card: card ? {
            width: card.offsetWidth,
            scrollWidth: card.scrollWidth
          } : null,
          iframe: iframe ? {
            width: iframe.offsetWidth,
            height: iframe.offsetHeight
          } : null,
          actions: actions ? {
            width: actions.offsetWidth
          } : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Layout Metrics:', JSON.stringify(metrics.result?.value, null, 2));

    ws.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    chrome.kill();
  }
}

main();
