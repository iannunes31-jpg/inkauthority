const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Replace the hero background image UUID with /isa-nova.jpeg
html = html.split('83c705c6-6d43-4106-80e5-f9a5e5a2cf44').join('\\/isa-nova.jpeg');

fs.writeFileSync('public/index-nova.html', html);
console.log('Background image updated successfully');
