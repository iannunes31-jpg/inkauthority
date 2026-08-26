const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

// 1. Isabella -> Isabela
// Match exactly 'Isabella' and replace with 'Isabela', ignoring case for 'ISABELLA' as well if any
html = html.replace(/Isabella/g, 'Isabela');
html = html.replace(/ISABELLA/g, 'ISABELA');

// 2. "Lista de espera" -> "Acesso antecipado"
html = html.replace(/Lista de espera/g, 'Acesso antecipado');
html = html.replace(/Lista de Espera/g, 'Acesso Antecipado');
html = html.replace(/lista de espera/g, 'acesso antecipado');
html = html.replace(/LISTA DE ESPERA/g, 'ACESSO ANTECIPADO');

// 3. "Matricule-se" -> "Inscreva-se"
html = html.replace(/Matricule-se/g, 'Inscreva-se');
html = html.replace(/MATRICULE-SE/g, 'INSCREVA-SE');

// 4. Remove all autoplay attributes from <video> tags
html = html.replace(/autoplay=""/g, '');
html = html.replace(/autoplay=\\"\\"/g, ''); // escaped quotes
html = html.replace(/autoplay="true"/g, '');
html = html.replace(/autoplay=\\"true\\"/g, '');

fs.writeFileSync('public/index-nova.html', html);
console.log('Text replacements applied.');
