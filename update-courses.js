const fs = require('fs');

let content = fs.readFileSync('app/courses/page.tsx', 'utf8');

// Update Title
content = content.replace(
  'Marketing & <span className="text-foreground">Posicionamento</span>',
  'Posicionamento para <span className="text-foreground">tatuadores</span>'
);

// Update features array
const featuresRegex = /const features = \[[^\]]+\];/;
const newFeatures = `const features = [
    "O que é posicionamento e como aplicá-lo à sua carreira artística",
    "Estruturação das suas redes sociais",
    "Criação de conteúdos que atraem clientes",
    "Técnicas de vendas e conversão de clientes",
    "Como utilizar o tráfego pago de forma objetiva",
    "Acesso à comunidade exclusiva da Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)",
  ];`;
content = content.replace(featuresRegex, newFeatures);

fs.writeFileSync('app/courses/page.tsx', content);
console.log('Courses page updated.');
