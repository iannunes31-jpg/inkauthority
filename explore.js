const fs = require('fs');
const html = fs.readFileSync('public/index-nova.html', 'utf8');

// Helper to find context around a string
function findContext(query) {
  const idx = html.indexOf(query);
  if (idx > -1) {
    console.log(`--- Context for '${query}' ---`);
    console.log(html.substring(Math.max(0, idx - 150), idx + 200).replace(/\\u002F/g, '/'));
  } else {
    console.log(`'${query}' not found`);
  }
}

findContext('Quem já vive a nova era');
findContext('Adicionar foto');
findContext('Placeholder de depoimento');
