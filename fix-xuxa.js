const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const badXuxaLondres = '<image-slot id=\\"isa-londres2\\" shape=\\"rect\\" src=\\"46902831-9cdb-4703-882a-ef15cebe5e02\\" placeholder=\\"Londres, exterior\\"><\\u002Fimage-slot>';
const goodLondres = '<image-slot id=\\"isa-londres2\\" shape=\\"rect\\" src=\\"5c504031-e96b-4ab7-817d-0e4d16b81237\\" placeholder=\\"Londres\\"><\\u002Fimage-slot>';

html = html.replace(badXuxaLondres, goodLondres);

fs.writeFileSync('public/index-nova.html', html);
console.log('Fixed Xuxa duplicate by restoring true Londres image');
