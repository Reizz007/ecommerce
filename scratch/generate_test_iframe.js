import crypto from 'crypto';
import fs from 'fs';

const secretKey = 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei';
const profileId = 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS';
const transactionId = 'SYN-TEST-' + Date.now();
const amount = '1.00';
const remark = 'SYNAPSE_AI_TEST';

const raw = secretKey + transactionId + amount + remark;
const hash = crypto.createHash('sha1').update(raw).digest('hex');

const checkoutUrl = 'https://khqr.cc/api/payment/requestv2/' + profileId + '?transaction_id=' + transactionId + '&amount=' + amount + '&remark=' + remark + '&hash=' + hash;
const iframeUrl = checkoutUrl + '&iframe=1';

const testHtml = `<!DOCTYPE html>
<html>
<head><title>Test Iframe</title></head>
<body>
<h1>Testing KHQR Iframe</h1>
<iframe src="${iframeUrl}" style="width:375px;height:520px;border:1px solid #00f;" id="test-iframe"></iframe>
</body>
</html>`;

fs.writeFileSync('scratch/test_iframe.html', testHtml);
console.log('Saved scratch/test_iframe.html');
