const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');
const scriptIdx = html.indexOf('window.addEventListener(\'message\'');
if (scriptIdx > -1) {
  console.log('LISTENER FOUND:');
  console.log(html.substring(scriptIdx - 100, scriptIdx + 800));
} else {
  console.log('LISTENER NOT FOUND');
}
