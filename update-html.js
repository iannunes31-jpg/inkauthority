const fs = require('fs');

function escapeReplacement(str) {
  return str.replace(/"/g, '\\"').replace(/\//g, '\\u002F');
}

let html = fs.readFileSync('public/index-nova.html', 'utf8');

// The 4 empty slots
html = html.replace(
  /<image-slot id=\\"isa-workshop\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<video src="/espaco-1.mov" autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;"></video>')
);
html = html.replace(
  /<image-slot id=\\"isa-extra1\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<img src="/espaco-2.png" style="width:100%;height:100%;object-fit:cover;display:block;" />')
);
html = html.replace(
  /<image-slot id=\\"isa-extra2\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<img src="/espaco-3.jpeg" style="width:100%;height:100%;object-fit:cover;display:block;" />')
);
html = html.replace(
  /<image-slot id=\\"isa-extra3\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<video src="/espaco-4.mov" autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;"></video>')
);

// Turma gets the testimonial video
html = html.replace(
  /<image-slot id=\\"turma\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<video src="/video-depoimento.mp4" autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;"></video>')
);

// isa-portrait gets espaco 6
html = html.replace(
  /<image-slot id=\\"isa-portrait\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<img src="/espaco-6.jpeg" style="width:100%;height:100%;object-fit:cover;display:block;" />')
);

// isa-londres2 gets espaco 7
html = html.replace(
  /<image-slot id=\\"isa-londres2\\"[^>]*><\\u002Fimage-slot>/,
  escapeReplacement('<img src="/espaco-7.heic" style="width:100%;height:100%;object-fit:cover;display:block;" />')
);

// Feedbacks Data
const f1 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Muito obrigado pelas dicas, eu gostaria de aprender mais com você</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">atelier.mattoso.ink</p></div></div>`);
const f2 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Obrigada 🙏🏼 vc tem me ajudado muuuuuiiiitoooo , vc nem imagina quantas vidas esta mudando com suas dicas ... a minha é uma delas !!!!</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">paulacardosotattoo</p></div></div>`);
const f3 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Abriu uma visão muito diferente da realidade, irei buscar esses estudos pra chegar no resultado que busco 🙏🏼🔥</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">lipe.tattooo</p></div></div>`);
const f4 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Ótimo conteúdo para o desenvolvimento de um bom profissional. 👏🔥</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">renanlasneautattoo</p></div></div>`);
const f5 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Eu compro seu curso só vender 🙌 dicas limpas e diretas 👏👏👏</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">cesarr_tattoo.es</p></div></div>`);
const f6 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Deus abençoe você pois as suas dicas estão ajudando muitos tatuadores 🔥❤️</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">jrtatttooo</p></div></div>`);

// Replace Image Cards
let imgRegex = /<div style=\\"flex:0 0 clamp\(260px,72vw,340px\);border:1px solid rgba\(255,255,255,\.09\);border-radius:16px;overflow:hidden;background:#0a0a0c\\"><div style=\\"aspect-ratio:9\\u002F12\\"><image-slot id=\\"dep-\d\\" shape=\\"rect\\" placeholder=\\"Print \\u002F vídeo — depoimento\\"><\\u002Fimage-slot><\\u002Fdiv><\\u002Fdiv>/;

// Replace Text Cards
// NOTE: I am doing string replacements for text cards, since regex with [^>]* is failing across multiple tags!
// We'll replace the full string of each original text card one by one.

let origText1 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Placeholder de depoimento — cole aqui a fala de um aluno sobre o que mudou na carreira dele.</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">Nome do aluno</p><p style="margin:2px 0 0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.05em;color:rgba(255,255,255,.4)">CIDADE · @PERFIL</p></div></div>`);
let origText2 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Placeholder de depoimento — resultado de aluno, print de conversa ou feedback.</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">Nome do aluno</p><p style="margin:2px 0 0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.05em;color:rgba(255,255,255,.4)">CIDADE · @PERFIL</p></div></div>`);
let origText3 = escapeReplacement(`<div style="flex:0 0 clamp(260px,72vw,340px);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px;background:#0a0a0c;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(340px,90vw,453px)"><span style="font-size:30px;color:rgba(200,200,210,.35)">"</span><p style="margin:0;font-family:'Jost',sans-serif;font-weight:300;font-size:20px;line-height:1.45;color:#e8e8ec">Placeholder de depoimento — cole aqui a fala de um aluno sobre o que mudou na carreira dele.</p><div><p style="margin:0;font-size:14px;color:#f0f0f3">Nome do aluno</p><p style="margin:2px 0 0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.05em;color:rgba(255,255,255,.4)">CIDADE · @PERFIL</p></div></div>`);

// Execution: Replace Image cards with f1, f3, f5
html = html.replace(imgRegex, f1);
html = html.replace(imgRegex, f3);
html = html.replace(imgRegex, f5);

// Replace Text cards with f2, f4, f6
html = html.replace(origText1, f2);
html = html.replace(origText2, f4);
html = html.replace(origText3, f6);

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
