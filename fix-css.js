const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// I will replace the injected CSS with a stronger one.
const oldCSS = `
  <style>
    .skiptranslate { display: none !important; }
    body { top: 0px !important; }
    html.light body { filter: invert(1) hue-rotate(180deg) contrast(0.95); background-color: #f7f7f7 !important; }
    html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }
  </style>`;

const newCSS = `
  <style>
    .skiptranslate { display: none !important; }
    body { top: 0px !important; }
    html.light { 
      filter: invert(1) hue-rotate(180deg) contrast(0.95) !important; 
      background-color: #000 !important; 
    }
    html.light img, 
    html.light video, 
    html.light iframe, 
    html.light [style*="background-image"] { 
      filter: invert(1) hue-rotate(180deg) !important; 
    }
  </style>`;

if (html.includes(oldCSS)) {
    html = html.replace(oldCSS, newCSS);
    fs.writeFileSync('public/index-nova.html', html);
    console.log('Successfully updated CSS logic!');
} else {
    // maybe there's a slight formatting difference, let's do a regex replace
    const regex = /<style>\s*\.skiptranslate[\s\S]*?<\/style>/;
    if (regex.test(html)) {
        html = html.replace(regex, newCSS.trim());
        fs.writeFileSync('public/index-nova.html', html);
        console.log('Successfully updated CSS logic with regex!');
    } else {
        console.log('Could not find CSS block!');
    }
}
