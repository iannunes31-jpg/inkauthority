const fs = require('fs');
let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

// Add authView state
code = code.replace(
  /const \[isLoginOpen, setIsLoginOpen\] = useState\(false\);/,
  'const [isLoginOpen, setIsLoginOpen] = useState(false);\n  const [authView, setAuthView] = useState<"login" | "register">("login");'
);

// Update LoginModal
code = code.replace(
  /<LoginModal isOpen=\{isLoginOpen\} onClose=\{[(][^)]*[)] => setIsLoginOpen\(false\)\} initialView="login" \/>/,
  '<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialView={authView} />'
);

// Update Desktop 'Entrar'
code = code.replace(
  /onClick=\{[(][^)]*[)] => setIsLoginOpen\(true\)\}\s*>\s*Entrar/,
  'onClick={() => { setAuthView("login"); setIsLoginOpen(true); }}\n                  >\n                    Entrar'
);

// Update Desktop 'Matricule-se' / 'Acesso Antecipado'
code = code.replace(
  /onClick=\{[(][^)]*[)] => setIsLoginOpen\(true\)\}\s*>\s*Matricule-se/,
  'onClick={() => { setAuthView("register"); setIsLoginOpen(true); }}\n                  >\n                    Acesso Antecipado'
);

// Update Mobile 'Entrar'
code = code.replace(
  /onClick=\{[(][^)]*[)] => \{\s*setIsOpen\(false\);\s*setIsLoginOpen\(true\);\s*\}\}\s*>\s*Entrar/,
  'onClick={() => {\n                      setIsOpen(false);\n                      setAuthView("login");\n                      setIsLoginOpen(true);\n                    }}\n                  >\n                    Entrar'
);

// Update Mobile 'Matricule-se'
code = code.replace(
  /onClick=\{[(][^)]*[)] => \{\s*setIsOpen\(false\);\s*setIsLoginOpen\(true\);\s*\}\}\s*>\s*Matricule-se/,
  'onClick={() => {\n                      setIsOpen(false);\n                      setAuthView("register");\n                      setIsLoginOpen(true);\n                    }}\n                  >\n                    Acesso Antecipado'
);

fs.writeFileSync('components/Navbar.tsx', code);
console.log('Navbar.tsx updated');
