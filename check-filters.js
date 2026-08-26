const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');
const filters = html.match(/filter:[^;\"\\]+/gi);
if (filters) console.log(filters.slice(0, 20));
