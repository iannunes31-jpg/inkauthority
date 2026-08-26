const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Match the entire hero-video div including its contents
const heroVideoRegex = /<div id=\\"hero-video\\"[^>]*>.*?<span[^>]*>▶<\\u002Fspan>.*?Vídeo de abertura<\\u002Fspan>\\s*<\\u002Fdiv>\\s*<\\u002Fdiv>/;

const replacement = `<div id=\\"hero-video\\" data-reveal=\\"\\" style=\\"position:relative;width:calc(100% + 40px);aspect-ratio:9\\u002F16;margin-left:-20px;margin-right:-20px;border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden;margin-bottom:clamp(16px,3.2vh,34px)\\">
  <iframe src=\\"https:\\u002F\\u002Fiframe.videodelivery.net\\u002F30319fb40456d90f8d03d1bdb372b768?autoplay=true&loop=true&muted=true\\" style=\\"border: none; width: 100%; height: 100%; display: block;\\" allow=\\"accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;\\" allowfullscreen=\\"true\\"><\\u002Fiframe>
<\\u002Fdiv>`;

html = html.replace(heroVideoRegex, replacement.replace(/\n\s*/g, ''));

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
