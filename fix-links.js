const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// The original JSON string might have "href=\\"javascript:window.parent.postMessage({type:'OPEN_REGISTER'}, '*');\\""
// We will replace it with "onclick=\\"window.parent.postMessage({type:'OPEN_REGISTER'}, '*'); return false;\\"" and remove href.
// It's safer to just do a simple replace
html = html.replace(/href=\\"javascript:window\.parent\.postMessage\(\{type:'OPEN_REGISTER'\}, '\*'\);\\"/g, 'onclick=\\"window.parent.postMessage({type:\\\'OPEN_REGISTER\\\'}, \\\'*\\\'); return false;\\" style=\\"cursor:pointer;\\"');

// Also handle if it was already replaced by fix-issues.js
html = html.replace(/href=\\"#\\" onclick=\\"window\.parent\.postMessage\(\{type:'OPEN_REGISTER'\}, '\*'\); event\.preventDefault\(\);\\"/g, 'onclick=\\"window.parent.postMessage({type:\\\'OPEN_REGISTER\\\'}, \\\'*\\\'); return false;\\" style=\\"cursor:pointer;\\"');

fs.writeFileSync('public/index-nova.html', html);
console.log('Fixed OPEN_REGISTER links to use onclick without href');
