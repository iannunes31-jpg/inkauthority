const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');

const matches = html.match(/src=\\"(.*?)\\"/g);
if (matches) {
  const unique = [...new Set(matches)];
  unique.forEach(m => console.log(m));
} else {
  console.log('No src matches found.');
}
