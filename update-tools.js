const fs = require('fs');

let content = fs.readFileSync('app/tools/page.tsx', 'utf8');

const tutorOriginal = `Seu mentor particular 24 horas por dia. Nossa IA sugere agulhas, pigmentos e ajuda no planejamento cirúrgico.`;
const tutorNovo = `Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.`;

content = content.replace(tutorOriginal, tutorNovo);

// Fix cirurgico encoding issues if any
const tutorEncoded = `Seu mentor particular 24 horas por dia. Nossa IA sugere agulhas, pigmentos e ajuda no planejamento cirǧrgico.`;
content = content.replace(tutorEncoded, tutorNovo);

fs.writeFileSync('app/tools/page.tsx', content);
console.log('Tools page updated');
