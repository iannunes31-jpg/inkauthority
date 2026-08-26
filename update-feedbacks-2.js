const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Use non-greedy regex to match the texts, ignoring what's inside the tags
html = html.replace(
  />Placeholder de depoimento — cole aqui a fala de um aluno sobre o que mudou na carreira dele\.<\\u002Fp><div><p[^>]*>Nome do aluno<\\u002Fp>/,
  '>Obrigada 🙏🏼 vc tem me ajudado muuuuuiiiitoooo , vc nem imagina quantas vidas esta mudando com suas dicas ... a minha é uma delas !!!!<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">paulacardosotattoo<\\u002Fp>'
);

html = html.replace(
  />Placeholder de depoimento — resultado de aluno, print de conversa ou feedback\.<\\u002Fp><div><p[^>]*>Nome do aluno<\\u002Fp>/,
  '>Ótimo conteúdo para o desenvolvimento de um bom profissional. 👏🔥<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">renanlasneautattoo<\\u002Fp>'
);

html = html.replace(
  />Placeholder de depoimento — cole aqui a fala de um aluno sobre o que mudou na carreira dele\.<\\u002Fp><div><p[^>]*>Nome do aluno<\\u002Fp>/,
  '>Deus abençoe você pois as suas dicas estão ajudando muitos tatuadores 🔥❤️<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">jrtatttooo<\\u002Fp>'
);

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
