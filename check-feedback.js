const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');

const idx = html.indexOf('dep-1');
if (idx > -1) {
  console.log(html.substring(idx - 200, idx + 400));
}
