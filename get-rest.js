const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');
const start = html.indexOf('<div id="hero-video"');
const end = html.indexOf('A próxima geração', start);
console.log(html.substring(start, end));
