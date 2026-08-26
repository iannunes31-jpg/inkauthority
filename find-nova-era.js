const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');

const idx = html.indexOf('Quem já vive a nova era');
if (idx > -1) {
  console.log(html.substring(idx - 50, idx + 600));
}
