const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

const modules = [
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

modules.forEach((mod, i) => {
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

// Since the new HTML contains newlines, we should minify it slightly to match the original layout if needed, though browsers handle it fine.
modulesHtml = modulesHtml.replace(/\n\s+/g, '');

const startMarker = '<div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(255,255,255,.1)">';
const endMarker = '</section>';

const startIndex = html.indexOf(startMarker);
if (startIndex > -1) {
    const endIndex = html.indexOf(endMarker, startIndex);
    
    // We only replace until the end of the div
    const divEndMarker = '</div>\n    </div>\n  </section>';
    // Actually, let's just find the closing div of the modules list
    // The modules list is inside the div with the border-bottom. Let's find its end.
    
    // Quick regex to find the module list container:
    // It's right after `<h2 ...>O que você vai dominar</h2>\n        <p ...>...</p>\n      </div>\n      <div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(255,255,255,.1)">`
    
    const beforeBlock = html.indexOf('<div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(255,255,255,.1)">');
    const afterBlock = html.indexOf('</div>\n    </div>\n  </section>', beforeBlock);
    
    if(beforeBlock > -1 && afterBlock > -1) {
        html = html.substring(0, beforeBlock) + startMarker + modulesHtml + '</div>' + html.substring(afterBlock);
        fs.writeFileSync('public/index-nova.html', html);
        console.log('Modules replaced successfully!');
    } else {
        console.log('Could not find the end of the block');
    }
} else {
    console.log('Start marker not found');
}
