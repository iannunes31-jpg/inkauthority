const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');
const slots = html.match(/id=\\"([a-zA-Z0-9_-]+)\\"/g) || [];
console.log(slots);
