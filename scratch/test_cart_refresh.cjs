const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  let cartLS = await page.evaluate(() => localStorage.getItem('synapse_cart'));
  console.log('1. Initial localStorage cart:', cartLS);

  // Open cart drawer
  const cartBtn = await page.$('.cart-btn');
  if (cartBtn) {
    await cartBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Check items in drawer
  const removeBtns = await page.$$('.btn-remove-item');
  console.log('2. Remove buttons found in drawer:', removeBtns.length);

  if (removeBtns.length > 0) {
    await removeBtns[0].click();
    console.log('3. Clicked remove button!');
    await new Promise(r => setTimeout(r, 600));
  }

  cartLS = await page.evaluate(() => localStorage.getItem('synapse_cart'));
  console.log('4. localStorage cart after click remove:', cartLS);

  // Refresh page
  console.log('5. Reloading page...');
  await page.reload({ waitUntil: 'networkidle0' });

  cartLS = await page.evaluate(() => localStorage.getItem('synapse_cart'));
  console.log('6. localStorage cart after reload:', cartLS);

  const cartCounter = await page.evaluate(() => {
    const el = document.querySelector('.cart-counter');
    return el ? el.innerText : 'none';
  });
  console.log('7. Cart counter badge after reload:', cartCounter);

  await browser.close();
})();
