const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const navIdx = html.indexOf('<nav');
const navEndIdx = html.indexOf('</nav>', navIdx);
console.log(html.substring(navIdx, navEndIdx + 6));
