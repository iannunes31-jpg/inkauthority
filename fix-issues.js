const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// 1. Fix Light Mode CSS
html = html.replace(
  'html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }',
  'html.light img, html.light video, html.light iframe, html.light [style*=\\"background-image\\"], html.light [data-parallax] { filter: invert(1) hue-rotate(180deg) !important; }'
);
// In case the previous regex missed it:
html = html.replace(
  'html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }',
  'html.light img, html.light video, html.light iframe, html.light [style*="background-image"], html.light [data-parallax] { filter: invert(1) hue-rotate(180deg) !important; }'
);

// 2. Remove "De tatuador para tatuador"
html = html.replace(/<span[^>]*>De tatuador para tatuador<\\\/span>/i, '');
html = html.replace(/De tatuador para tatuador/i, '');
html = html.replace(/Do tatuador para o tatuador/i, '');

// 3. Remove "Sua história aqui"
// Search for the span containing "✦" and "Sua história aqui"
const suaHistoriaRegex = /<span data-reveal=\\"\\" style=\\"display:inline-flex;align-items:center;gap:10px;font-size:12px;letter-spacing:\.34em;text-transform:uppercase;color:rgba\(20,20,26,\.62\)\\"><span style=\\"font-size:13px\\">✦<\\\/span> Sua história aqui<\\\/span>/i;
html = html.replace(suaHistoriaRegex, '');
// Just in case it's in a different format:
html = html.replace(/<span[^>]*>.*?Sua história aqui.*?<\\\/span>/i, '');

// 4. Fix CTA links to avoid redirecting the iframe
// Change href="javascript:..." to href="#" onclick="..."
html = html.replace(/href=\\"javascript:window\.parent\.postMessage\(\{type:'OPEN_REGISTER'\}, '\*'\);\\"/g, 'href=\\"#\\" onclick=\\"window.parent.postMessage({type:\'OPEN_REGISTER\'}, \'*\'); event.preventDefault();\\"');

fs.writeFileSync('public/index-nova.html', html);
console.log('Fixes applied successfully');
