const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');
const start = html.indexOf('<section style=\\"position:relative;min-height:100svh');
const end = html.indexOf('<\\/section>', start);
console.log(html.substring(start, end));
