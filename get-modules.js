const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const mIndex = html.indexOf('<!-- MÓDULOS -->');
if (mIndex > -1) {
    const endIdx = html.indexOf('</section>', mIndex);
    console.log(html.substring(mIndex, endIdx));
}
