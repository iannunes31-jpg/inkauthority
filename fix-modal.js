const fs = require('fs');
let content = fs.readFileSync('components/LoginModal.tsx', 'utf8');

content = content.split('window.location.href = "/dashboard";').join('window.location.reload();');

fs.writeFileSync('components/LoginModal.tsx', content);
console.log('Fixed LoginModal to reload instead of redirecting to dashboard');
