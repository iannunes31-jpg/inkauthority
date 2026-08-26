const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const targetStart = html.indexOf("const resourceScript = '<script>window.__resources = ' +");
const targetEnd = html.indexOf(";</' + 'script>';", targetStart) + 17;

const injection = `
    const myInjection = \`
  <style>
    .skiptranslate { display: none !important; }
    body { top: 0px !important; }
    html.light body { filter: invert(1) hue-rotate(180deg) contrast(0.95); background-color: #f7f7f7 !important; }
    html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }
  </style>
  <div id="google_translate_element_iframe" style="display:none"></div>
  <script>
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SET_THEME') {
        if (event.data.theme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      } else if (event.data && event.data.type === 'SET_LANG') {
        const iSelect = document.querySelector('.goog-te-combo');
        if (iSelect) {
          iSelect.value = event.data.lang;
          iSelect.dispatchEvent(new Event('change'));
        }
      }
    });
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement(
            { pageLanguage: 'pt', autoDisplay: false },
            'google_translate_element_iframe'
        );
    };
  </\` + \`script>
  <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></\` + \`script>\`;

    const resourceScript = '<script>window.__resources = ' +
      JSON.stringify(resourceMap).replace(/<\\//g, '<\\\\/') +
      ';</' + 'script>' + myInjection;
`;

if (targetStart > -1) {
    html = html.substring(0, targetStart) + injection + html.substring(targetEnd);
    fs.writeFileSync('public/index-nova.html', html);
    console.log('Successfully injected logic into bundler script!');
} else {
    console.log('Could not find target block!');
}
