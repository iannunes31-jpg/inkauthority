const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');

const regex = /href=\\"(#[^\\]+)\\"[^>]*>.*?Acesso antecipado/i;
const match = html.match(regex);
if (match) {
  console.log('Button links to:', match[1]);
  const targetId = match[1].substring(1);
  const targetRegex = new RegExp('id=\\\\"' + targetId + '\\\\"');
  if (targetRegex.test(html)) {
      console.log('Target element exists.');
  } else {
      console.log('Target element DOES NOT exist. IDs in document:');
      const ids = html.match(/id=\\"([^\\]+)\\"/g);
      console.log(ids ? ids.join(', ') : 'none');
  }
} else {
  console.log('No anchor found with Acesso antecipado');
  const aMatches = html.match(/<a[^>]*>/g);
  if (aMatches) {
      console.log('Anchors found:', aMatches);
  }
}
