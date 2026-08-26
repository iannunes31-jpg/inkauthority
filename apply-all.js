const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

// Helper to escape HTML for the JSON string
function escapeForJson(str) {
  // Replace actual newlines with \n literal
  let res = str.replace(/\n/g, '\\n');
  // Escape double quotes
  res = res.replace(/"/g, '\\"');
  // Escape forward slashes (often escaped in this template)
  res = res.replace(/\//g, '\\/');
  return res;
}

// 1. TEXT REPLACEMENTS
html = html.split('Cara, alguém tem que mudar essa realidade.').join('Seu trabalho pode ser bom. Mas se ninguém entende o seu valor, ele continua invisível.');

html = html.split('A tríade que separa quem lidera<br>de quem espera o mercado voltar').join('Os três pilares para construir uma carreira sólida na tatuagem.');

html = html.split('A próxima geração de tatuadores não será formada apenas pelos mais técnicos — e sim pelos que unirem posicionamento, técnica e estratégia.').join('A próxima geração de grandes tatuadores será formada por quem souber unir técnica, posicionamento e estratégia.');

html = html.split('Quem conduz<\\/span>').join('<\\/span>');

html = html.split('10 anos de carreira. Tudo o que conquistei veio da tatuagem — e não foi só a técnica que me trouxe até aqui.').join('Prazer, me chamo Isabela Badini, tatuo a mais de 10 anos e, assim como você, sou apaixonada pela tatuagem e muito grata por tudo que ela me proporcionou até hoje… e não foi só a técnica que me trouxe até aqui!');

html = html.split('países onde fui convidada para tatuar. Rodei o mundo através da tatuagem.').join('Paises que tive a oportunidade de visitar através do meu trabalho');

// Remove 3.5k - 5k block (regex to capture the whole div)
// The HTML inside index-nova.html has escaped quotes and slashes.
html = html.replace(/<div data-reveal=\\"\\">\\n\s*<span style=\\"font-family:'Jost',sans-serif;font-size:clamp\(34px,6vw,64px\);font-weight:200;background:linear-gradient\(180deg,#fff,#8f9096\);-webkit-background-clip:text;background-clip:text;color:transparent\\">R\$3,5–5k<\\\/span>.*?<\\\/div>/, '');

html = html.split('O curso<\\/span>').join('O workshop<\\/span>');
html = html.split('O Curso<\\/span>').join('O Workshop<\\/span>');

html = html.split('5eedfa0a-8306-4175-9caa-fa4b6c8f5177').join('\\/isa-nova.jpeg');

html = html.split('O espaço que você ocupa na mente do cliente — antes mesmo dele conhecer o seu trabalho.').join('Como você é percebido e lembrado pelos seus clientes.');

// Remove "Sua história aqui" block
html = html.replace(/<span data-reveal=\\"\\" style=\\"display:inline-flex;align-items:center;gap:10px;font-size:12px;letter-spacing:\.34em;text-transform:uppercase;color:rgba\(20,20,26,\.62\)\\"><span style=\\"font-size:13px\\">✦<\\\/span> Sua história aqui<\\\/span>/, '');


// 2. HERO REORDER
const oldH1Str = '<h1 style=\\"margin:0;font-family:\'Jost\',sans-serif;font-weight:200;font-size:clamp(32px,8vw,88px);line-height:.98;letter-spacing:clamp(.1em,1.6vw,.24em);background:linear-gradient(176deg,#ffffff 0%,#d3d3d9 40%,#7c7d84 60%,#f4f4f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent\\">INK<br style=\\"display:none\\">&nbsp;AUTHORITY<\\/h1>';
html = html.split(oldH1Str).join('');

const heroInsert = `
    <div style="text-align:center; margin-bottom: 24px;">
      <h1 style="margin:0;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(32px,8vw,88px);line-height:.98;letter-spacing:clamp(.1em,1.6vw,.24em);background:linear-gradient(176deg,#ffffff 0%,#d3d3d9 40%,#7c7d84 60%,#f4f4f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent">INK&nbsp;AUTHORITY</h1>
      <div style="display:flex; align-items:center; justify-content:center; gap: 12px; margin: 16px 0;">
        <div style="height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4)); width: 80px;"></div>
        <span style="color:#fff; font-size: 14px;">✦</span>
        <div style="height:1px; background:linear-gradient(270deg, transparent, rgba(255,255,255,0.4)); width: 80px;"></div>
      </div>
      <p style="margin:0; font-family:'Jost',sans-serif; font-size:clamp(12px,2vw,16px); letter-spacing:0.3em; color:rgba(238,238,242,.7); text-transform:uppercase;">POSICIONAMENTO ✦ TÉCNICA ✦ ESTRATÉGIA</p>
    </div>
`;
const videoTag = '<div id=\\"hero-video\\"';
html = html.split(videoTag).join(escapeForJson(heroInsert) + '\\n      ' + videoTag);


// 3. MODULES REPLACEMENT
const modulesList = [
    { title: "Abertura", desc: "" },
    { title: "Posicionamento - Aula 1", desc: "O que é posicionamento?" },
    { title: "Posicionamento - Aula 2", desc: "Como aplicar o posicionamento na minha carreira;" },
    { title: "Construindo um Perfil Atraente", desc: "" },
    { title: "Conteúdos Estratégicos", desc: "como postar com intenção;" },
    { title: "Processo de Vendas", desc: "Como atender da maneira certa e converter clientes;" },
    { title: "Marketing & Tráfego Pago - Aula 1", desc: "como funciona o tráfego pago para o tatuador;" },
    { title: "Marketing & Tráfego Pago - Aula 2", desc: "Quais os melhores criativos para campanhas;" },
    { title: "Marketing & Tráfego Pago - Aula 3", desc: "Como criar uma campanha pra atrair clientes do zero; usando o facebook e o google." },
    { title: "Aula Bônus 1", desc: "" },
    { title: "Aula Bônus 2", desc: "como usar o chat gpt de forma estrategica pra criar conteudos" }
];

let modulesHtml = '';
modulesList.forEach((mod, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    let pTag = '';
    if (mod.desc) {
        pTag = `<p style="margin:7px 0 0;font-style:italic;font-size:clamp(14px,1.9vw,17px);color:rgba(238,238,242,.5)">${mod.desc}</p>`;
    }

    modulesHtml += `
        <div data-reveal="" style="display:flex;align-items:flex-start;gap:clamp(16px,3vw,32px);padding:clamp(24px,3.4vw,40px) 6px;border-top:1px solid rgba(255,255,255,.1)">
          <span style="font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(30px,4.6vw,50px);line-height:1;color:rgba(210,210,218,.7);min-width:clamp(48px,7vw,84px)">${num}</span>
          <div style="flex:1"><h3 style="margin:0;font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(20px,2.8vw,30px);color:#f0f0f3">${mod.title}</h3>${pTag}</div>
        </div>
    `;
});

const modulesStartMatch = html.indexOf('<div style=\\"display:flex;flex-direction:column;border-bottom:1px solid rgba(255,255,255,.1)\\">');
if (modulesStartMatch > -1) {
    const modulesEndMatch = html.indexOf('<\\/div>\\n    <\\/div>\\n  <\\/section>', modulesStartMatch);
    if (modulesEndMatch > -1) {
        html = html.substring(0, modulesStartMatch) + 
               escapeForJson('<div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(255,255,255,.1)">\n' + modulesHtml + '\n</div>') + 
               html.substring(modulesEndMatch + ('<\\/div>'.length));
    }
}


// 4. NEW SECTIONS
const dorHtml = `
  <!-- DOR E SOLUÇÃO -->
  <section style="position:relative;padding:clamp(80px,12vh,150px) 22px;background:linear-gradient(180deg,#08080a,#0b0b0e)">
    <div style="max-width:900px;margin:0 auto;text-align:center">
      <h2 data-reveal="" style="margin:0 auto;max-width:820px;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(28px,4.6vw,54px);line-height:1.16;letter-spacing:.01em;color:#f3f3f6">O conhecimento que transforma técnica em uma carreira sólida.</h2>
      <p data-reveal="" data-delay="100" style="margin:24px auto 0;max-width:640px;font-weight:300;font-size:clamp(16px,2.3vw,20px);line-height:1.7;color:rgba(238,238,242,.66)">Tudo que eu precisei aprender além da tatuagem para construir autoridade, atrair clientes e manter minha agenda cheia.</p>
      
      <div data-reveal="" data-delay="200" style="display:flex;flex-direction:column;gap:16px;margin:48px auto;max-width:500px;text-align:left">
        <div style="display:flex;align-items:center;gap:16px;padding:20px 24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px">
          <span style="color:#dcdce2;font-size:24px">✦</span>
          <span style="font-family:'Jost',sans-serif;font-size:clamp(15px,2vw,18px);letter-spacing:.1em;color:#f0f0f3;text-transform:uppercase">Converter mais clientes</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;padding:20px 24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px">
          <span style="color:#dcdce2;font-size:24px">✦</span>
          <span style="font-family:'Jost',sans-serif;font-size:clamp(15px,2vw,18px);letter-spacing:.1em;color:#f0f0f3;text-transform:uppercase">Aumentar sua percepção de valor</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;padding:20px 24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px">
          <span style="color:#dcdce2;font-size:24px">✦</span>
          <span style="font-family:'Jost',sans-serif;font-size:clamp(15px,2vw,18px);letter-spacing:.1em;color:#f0f0f3;text-transform:uppercase">Criar mais oportunidades através da tatuagem</span>
        </div>
      </div>

      <a href="javascript:window.parent.postMessage({type:'OPEN_REGISTER'}, '*');" data-reveal="" data-delay="300" style="display:inline-block;padding:18px 36px;background:#f3f3f6;color:#08080a;border-radius:100px;font-family:'Jost',sans-serif;font-size:14px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;transition:transform .3s" style-hover="transform:scale(1.04)">QUERO CONSTRUIR MINHA AUTORIDADE</a>
    </div>
  </section>
`;

const paraQuemHtml = `
  <!-- PARA QUEM -->
  <section style="position:relative;padding:clamp(90px,14vh,180px) 22px;background:#08080a">
    <div style="max-width:1080px;margin:0 auto">
      <div style="text-align:center;margin-bottom:clamp(48px,8vh,80px)">
        <span data-reveal="" style="font-size:11px;letter-spacing:.36em;text-transform:uppercase;color:rgba(238,238,242,.42)">Público</span>
        <h2 data-reveal="" data-delay="80" style="margin:22px 0 0;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(28px,4.6vw,54px);line-height:1.14;color:#f3f3f6">Para quem é o Workshop?</h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,4vw,40px)">
        <div data-reveal="" style="padding:clamp(32px,5vw,48px);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0));border:1px solid rgba(255,255,255,.08);border-radius:24px">
          <h3 style="margin:0 0 16px;font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(22px,3vw,32px);color:#f0f0f3">Tatuadores experientes</h3>
          <p style="margin:0;font-weight:300;font-size:clamp(15px,2vw,18px);line-height:1.7;color:rgba(238,238,242,.66)">Que já construíram uma trajetória, mas entendem que o mercado está mudando e querem se adaptar às novas formas de comunicar, vender e atrair clientes para continuar crescendo e se manter à frente.</p>
        </div>
        <div data-reveal="" data-delay="100" style="padding:clamp(32px,5vw,48px);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0));border:1px solid rgba(255,255,255,.08);border-radius:24px">
          <h3 style="margin:0 0 16px;font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(22px,3vw,32px);color:#f0f0f3">Tatuadores iniciantes</h3>
          <p style="margin:0;font-weight:300;font-size:clamp(15px,2vw,18px);line-height:1.7;color:rgba(238,238,242,.66)">Que querem começar a carreira com uma visão mais completa do mercado, entendendo desde cedo como construir seu posicionamento, atrair clientes e criar oportunidades para o próprio trabalho.</p>
        </div>
      </div>
    </div>
  </section>
`;

const faqHtml = `
  <!-- FAQ -->
  <section style="position:relative;padding:clamp(90px,14vh,180px) 22px;background:#08080a">
    <div style="max-width:800px;margin:0 auto">
      <div style="text-align:center;margin-bottom:clamp(48px,8vh,80px)">
        <h2 data-reveal="" style="margin:0;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(28px,4.6vw,54px);line-height:1.14;color:#f3f3f6">Tire suas dúvidas</h2>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <details data-reveal="" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden">
          <summary style="padding:24px;font-family:'Jost',sans-serif;font-size:clamp(18px,2.2vw,22px);color:#f0f0f3;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center">
            Como funciona o acesso ao workshop? <span style="color:rgba(255,255,255,.4)">+</span>
          </summary>
          <div style="padding:0 24px 24px;font-weight:300;font-size:16px;line-height:1.7;color:rgba(238,238,242,.66)">
            O acesso é 100% online e as aulas ficam disponíveis na plataforma da Ink Authority. Você pode assistir quando e onde quiser.
          </div>
        </details>
        
        <details data-reveal="" data-delay="100" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden">
          <summary style="padding:24px;font-family:'Jost',sans-serif;font-size:clamp(18px,2.2vw,22px);color:#f0f0f3;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center">
            Serve para quem está começando do zero? <span style="color:rgba(255,255,255,.4)">+</span>
          </summary>
          <div style="padding:0 24px 24px;font-weight:300;font-size:16px;line-height:1.7;color:rgba(238,238,242,.66)">
            Sim! O método foi desenhado para te dar uma visão completa de posicionamento desde o início, evitando erros comuns e acelerando seu crescimento.
          </div>
        </details>

        <details data-reveal="" data-delay="200" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden">
          <summary style="padding:24px;font-family:'Jost',sans-serif;font-size:clamp(18px,2.2vw,22px);color:#f0f0f3;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center">
            Por quanto tempo terei acesso? <span style="color:rgba(255,255,255,.4)">+</span>
          </summary>
          <div style="padding:0 24px 24px;font-weight:300;font-size:16px;line-height:1.7;color:rgba(238,238,242,.66)">
            Você terá acesso ilimitado ao conteúdo pelo período de 1 ano, incluindo todas as atualizações e aulas bônus que adicionarmos.
          </div>
        </details>
      </div>
    </div>
  </section>
`;

html = html.split('<!-- MANIFESTO -->').join(escapeForJson(dorHtml) + '\\n  <!-- MANIFESTO -->');
html = html.split('<!-- MÓDULOS -->').join(escapeForJson(paraQuemHtml) + '\\n  <!-- MÓDULOS -->');
html = html.split('<!-- FOOTER -->').join(escapeForJson(faqHtml) + '\\n  <!-- FOOTER -->');

fs.writeFileSync('public/index-nova.html', html);
console.log('All changes applied successfully!');
