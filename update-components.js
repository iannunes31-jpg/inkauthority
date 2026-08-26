const fs = require('fs');
let floatingMenu = fs.readFileSync('components/FloatingMenu.tsx', 'utf8');

// Replace applyTheme to just postMessage
floatingMenu = floatingMenu.replace(/const iframe = document\.querySelector\('iframe'\);[\s\S]*?if \(iframe && iframe\.contentDocument\) \{[\s\S]*?const iHtml = iframe\.contentDocument\.documentElement;[\s\S]*?if \(newTheme === "light"\) \{[\s\S]*?iHtml\.classList\.remove\("dark"\);[\s\S]*?iHtml\.classList\.add\("light"\);[\s\S]*?\} else \{[\s\S]*?iHtml\.classList\.remove\("light"\);[\s\S]*?iHtml\.classList\.add\("dark"\);[\s\S]*?\}[\s\S]*?\}/, `const iframe = document.querySelector('iframe');\n    if (iframe && iframe.contentWindow) {\n        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: newTheme }, '*');\n    }`);

// Replace changeLanguage to just postMessage
floatingMenu = floatingMenu.replace(/const iframe = document\.querySelector\('iframe'\);[\s\S]*?if \(iframe && iframe\.contentDocument\) \{[\s\S]*?const iSelect = iframe\.contentDocument\.querySelector\("\.goog-te-combo"\) as HTMLSelectElement;[\s\S]*?if \(iSelect\) \{[\s\S]*?iSelect\.value = langCode;[\s\S]*?iSelect\.dispatchEvent\(new Event\("change"\)\);[\s\S]*?\}[\s\S]*?\}/, `const iframe = document.querySelector('iframe');\n    if (iframe && iframe.contentWindow) {\n        iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: langCode }, '*');\n    }`);

// Remove setupIframe entirely, it's baked into index-nova.html now
floatingMenu = floatingMenu.replace(/const setupIframe = \(\) => \{[\s\S]*?\};\n\n    const iframe = document\.querySelector\('iframe'\);[\s\S]*?if \(iframe\) \{[\s\S]*?iframe\.addEventListener\('load', setupIframe\);[\s\S]*?\/\/ Em caso de o iframe jǭ ter carregado rǭpido[\s\S]*?if \(iframe\.contentDocument && iframe\.contentDocument\.readyState === 'complete'\) \{[\s\S]*?setupIframe\(\);[\s\S]*?\}[\s\S]*?\}/, `// Iframe logic is baked into index-nova.html, just dispatch initial theme\n    setTimeout(() => {\n      const iframe = document.querySelector('iframe');\n      if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: savedTheme }, '*');\n    }, 1000);`);

fs.writeFileSync('components/FloatingMenu.tsx', floatingMenu);
console.log('FloatingMenu.tsx updated to use postMessage');

let navbar = fs.readFileSync('components/Navbar.tsx', 'utf8');

const useEffectImport = navbar.includes('useEffect') ? '' : ', useEffect';
navbar = navbar.replace(/import \{ useState \} from "react";/, `import { useState${useEffectImport} } from "react";`);

const navHookInsert = `
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OPEN_REGISTER') {
        setAuthView('register');
        setIsLoginOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
`;

navbar = navbar.replace(/const \{ isSignedIn: isLoggedIn \} = useAuth\(\);/, `const { isSignedIn: isLoggedIn } = useAuth();\n${navHookInsert}`);

fs.writeFileSync('components/Navbar.tsx', navbar);
console.log('Navbar.tsx updated with postMessage listener');
