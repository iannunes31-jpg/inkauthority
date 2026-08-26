const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Fix Cloudflare iframe autoplay
html = html.replace(/\?autoplay=false/g, ''); // Cloudflare stream actually auto plays if the param is present at all, or we need autoplay=0, let's just remove it!
html = html.replace('allow=\\"accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;\\"', 'allow=\\"accelerometer; gyroscope; encrypted-media; picture-in-picture;\\"');

fs.writeFileSync('public/index-nova.html', html);
console.log('Fixed autoplay');
