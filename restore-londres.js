const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const badHeic = '<img src=\\"\\u002Fespaco-7.heic\\" style=\\"width:100%;height:100%;object-fit:cover;display:block;\\" \\u002F>';
const goodOriginal = '<image-slot id=\\"isa-londres2\\" shape=\\"rect\\" src=\\"46902831-9cdb-4703-882a-ef15cebe5e02\\" placeholder=\\"Londres, exterior\\"><\\u002Fimage-slot>';

html = html.replace(badHeic, goodOriginal);
fs.writeFileSync('public/index-nova.html', html);
console.log('Restored londres2');
