const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const headEndIdx = html.indexOf('</head>');
const injection = `
  <style>
    .skiptranslate { display: none !important; }
    body { top: 0px !important; }
    html.light body { filter: invert(1) hue-rotate(180deg) contrast(0.95); background-color: #f7f7f7 !important; }
    html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }
  </style>
  <script>
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SET_THEME') {
        if (event.data.theme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      } else if (event.data.type === 'SET_LANG') {
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
  </script>
  <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
`;

html = html.substring(0, headEndIdx) + injection + html.substring(headEndIdx);

const bodyStartIdx = html.indexOf('<body');
const bodyEndIdx = html.indexOf('>', bodyStartIdx);
html = html.substring(0, bodyEndIdx + 1) + '\n<div id="google_translate_element_iframe" style="display:none"></div>\n' + html.substring(bodyEndIdx + 1);

// Replace href="#lista" with postMessage. But wait, `index-nova.html` uses JSON escaping inside `<script type="text/x-dc">`.
// The href string is `href=\\"#lista\\"` inside the JS string!
html = html.replace(/href=\\"#lista\\"/g, 'href=\\"javascript:window.parent.postMessage({type:\'OPEN_REGISTER\'}, \'*\');\\"');

fs.writeFileSync('public/index-nova.html', html);
console.log('index-nova.html updated with direct scripts and postMessage');
