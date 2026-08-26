const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

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

const insert = (marker, contentToInsert) => {
    const idx = html.indexOf(marker);
    if (idx > -1) {
        html = html.substring(0, idx) + contentToInsert + '\\n' + html.substring(idx);
    } else {
        console.log('NOT FOUND:', marker);
    }
};

insert('<!-- MANIFESTO -->', dorHtml);
insert('<!-- MÓDULOS -->', paraQuemHtml);
insert('<!-- FOOTER -->', faqHtml);

// Strip literal newlines for json compatibility (avoiding errors when injecting in page.tsx)
html = html.replace(/\\n/g, '');

fs.writeFileSync('public/index-nova.html', html);
console.log('Sections added successfully');
