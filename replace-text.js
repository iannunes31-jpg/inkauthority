const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Replacements
html = html.split('Cara, alguém tem que mudar essa realidade.').join('Seu trabalho pode ser bom. Mas se ninguém entende o seu valor, ele continua invisível.');

// Triade
const triadeOriginal = `A tríade que separa quem lidera<br>de quem espera o mercado voltar`;
const triadeNew = `Os três pilares para construir uma carreira sólida na tatuagem.`;
html = html.split(triadeOriginal).join(triadeNew);

// Proxima geracao
const proximaGeracaoOriginal = `A próxima geração de tatuadores não será formada apenas pelos mais técnicos — e sim pelos que unirem posicionamento, técnica e estratégia.`;
const proximaGeracaoNew = `A próxima geração de grandes tatuadores será formada por quem souber unir técnica, posicionamento e estratégia.`;
html = html.split(proximaGeracaoOriginal).join(proximaGeracaoNew);

// Quem conduz
const quemConduzOriginal = `Quem conduz</span>`;
const quemConduzNew = `</span>`;
html = html.split(quemConduzOriginal).join(quemConduzNew);

// Bio Isabella Badini
const bioOriginal = `10 anos de carreira. Tudo o que conquistei veio da tatuagem — e não foi só a técnica que me trouxe até aqui.`;
const bioNew = `Prazer, me chamo Isabela Badini, tatuo a mais de 10 anos e, assim como você, sou apaixonada pela tatuagem e muito grata por tudo que ela me proporcionou até hoje… e não foi só a técnica que me trouxe até aqui!`;
html = html.split(bioOriginal).join(bioNew);

// 10+ -> Paises que tive a oportunidade de visitar através do meu trabalho
const dezMaisOriginal = `10+</span>\n            <p style="margin:8px 0 0;font-size:clamp(15px,2.1vw,18px);line-height:1.6;color:rgba(238,238,242,.66)">países onde fui convidada para tatuar. Rodei o mundo através da tatuagem.</p>`;
const dezMaisNew = `10+</span>\n            <p style="margin:8px 0 0;font-size:clamp(15px,2.1vw,18px);line-height:1.6;color:rgba(238,238,242,.66)">Paises que tive a oportunidade de visitar através do meu trabalho</p>`;
html = html.split(dezMaisOriginal).join(dezMaisNew);

// Remove 3.5k - 5k
const tresKOriginal = `<div data-reveal="">\n            <span style="font-family:'Jost',sans-serif;font-size:clamp(34px,6vw,64px);font-weight:200;background:linear-gradient(180deg,#fff,#8f9096);-webkit-background-clip:text;background-clip:text;color:transparent">R$3,5–5k</span>\n            <p style="margin:8px 0 0;font-size:clamp(15px,2.1vw,18px);line-height:1.6;color:rgba(238,238,242,.66)">por sessão, percebido como preço justo. Porque me posicionei antes de cobrar.</p>\n          </div>`;
html = html.split(tresKOriginal).join('');

// Replace curso with workshop where appropriate, e.g. "O curso" -> "O workshop"
html = html.split('O curso</span>').join('O workshop</span>');
html = html.split('O Curso</span>').join('O Workshop</span>');

fs.writeFileSync('public/index-nova.html', html);
console.log('Text replacements in index-nova.html applied.');
