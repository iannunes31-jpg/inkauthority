const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Replace Image Cards
// They all start with <div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;overflow:hidden;background:#0a0a0c"><div style="aspect-ratio:9/12"><image-slot id="dep-
// and end with <\u002Fimage-slot><\u002Fdiv><\u002Fdiv>
// Let's replace them systematically!

let imgCard1 = '<div style=\\"flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;overflow:hidden;background:#0a0a0c\\"><div style=\\"aspect-ratio:9/12\\"><image-slot id=\\"dep-1\\" shape=\\"rect\\" placeholder=\\"Print / vídeo — depoimento\\"><\\u002Fimage-slot><\\u002Fdiv><\\u002Fdiv>';
let imgCard2 = '<div style=\\"flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;overflow:hidden;background:#0a0a0c\\"><div style=\\"aspect-ratio:9/12\\"><image-slot id=\\"dep-2\\" shape=\\"rect\\" placeholder=\\"Print / vídeo — depoimento\\"><\\u002Fimage-slot><\\u002Fdiv><\\u002Fdiv>';
let imgCard3 = '<div style=\\"flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;overflow:hidden;background:#0a0a0c\\"><div style=\\"aspect-ratio:9/12\\"><image-slot id=\\"dep-3\\" shape=\\"rect\\" placeholder=\\"Print / vídeo — depoimento\\"><\\u002Fimage-slot><\\u002Fdiv><\\u002Fdiv>';

function getFeedbackHTML(text, name) {
  // Same style as the original text cards
  let str = '<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:\'Jost\',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">TEXT</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">NAME</p></div></div>';
  str = str.replace('TEXT', text).replace('NAME', name);
  return str.replace(/"/g, '\\"').replace(/\//g, '\\u002F');
}

html = html.replace(imgCard1, getFeedbackHTML("Muito obrigado pelas dicas, eu gostaria de aprender mais com você", "atelier.mattoso.ink"));
html = html.replace(imgCard2, getFeedbackHTML("Abriu uma visão muito diferente da realidade, irei buscar esses estudos pra chegar no resultado que busco 🙏🏼🔥", "lipe.tattooo"));
html = html.replace(imgCard3, getFeedbackHTML("Eu compro seu curso só vender 🙌 dicas limpas e diretas 👏👏👏", "cesarr_tattoo.es"));

// Replace Text Cards
// The first text card
let txtCard1 = 'Placeholder de depoimento — cole aqui a fala de um aluno sobre o que mudou na carreira dele.<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">Nome do aluno<\\u002Fp><p style=\\"margin:2px 0 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4)\\">CIDADE · @PERFIL<\\u002Fp>';
html = html.replace(txtCard1, 'Obrigada 🙏🏼 vc tem me ajudado muuuuuiiiitoooo , vc nem imagina quantas vidas esta mudando com suas dicas ... a minha é uma delas !!!!<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">paulacardosotattoo<\\u002Fp><p style=\\"display:none\\"><\\u002Fp>');

// The second text card
let txtCard2 = 'Placeholder de depoimento — resultado de aluno, print de conversa ou feedback.<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">Nome do aluno<\\u002Fp><p style=\\"margin:2px 0 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4)\\">CIDADE · @PERFIL<\\u002Fp>';
html = html.replace(txtCard2, 'Ótimo conteúdo para o desenvolvimento de um bom profissional. 👏🔥<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">renanlasneautattoo<\\u002Fp><p style=\\"display:none\\"><\\u002Fp>');

// The third text card (same as first text)
html = html.replace(txtCard1, 'Deus abençoe você pois as suas dicas estão ajudando muitos tatuadores 🔥❤️<\\u002Fp><div><p style=\\"margin:0;font-size:14px;color:#f0f0f3\\">jrtatttooo<\\u002Fp><p style=\\"display:none\\"><\\u002Fp>');

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
