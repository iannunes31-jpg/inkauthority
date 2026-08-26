const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

// 1. Move the h1 and add the ✦ elements before hero-video
const videoTag = `<div id="hero-video"`;
const idxVideo = html.indexOf(videoTag);

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

if (idxVideo > -1) {
  html = html.slice(0, idxVideo) + heroInsert + html.slice(idxVideo);
}

// 2. Remove the old H1
const oldH1 = `<h1 style="margin:0;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(32px,8vw,88px);line-height:.98;letter-spacing:clamp(.1em,1.6vw,.24em);background:linear-gradient(176deg,#ffffff 0%,#d3d3d9 40%,#7c7d84 60%,#f4f4f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent">INK<br style="display:none">&nbsp;AUTHORITY<\\/h1>`;
// But because of json escaping, we must escape it carefully
const oldH1Escaped = `<h1 style=\\"margin:0;font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(32px,8vw,88px);line-height:.98;letter-spacing:clamp(.1em,1.6vw,.24em);background:linear-gradient(176deg,#ffffff 0%,#d3d3d9 40%,#7c7d84 60%,#f4f4f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent\\">INK<br style=\\"display:none\\">&nbsp;AUTHORITY<\\/h1>`;
// Just let's replace by indexOf to be safe
const oldH1Start = html.indexOf('<h1 style="margin:0;font-family:\'Jost\',sans-serif;font-weight:200;font-size:clamp(32px,8vw,88px)');
if (oldH1Start > -1) {
    const oldH1End = html.indexOf('<\\/h1>', oldH1Start) + 6;
    html = html.substring(0, oldH1Start) + html.substring(oldH1End);
}

fs.writeFileSync('public/index-nova.html', html);
console.log('Reordered hero text and video!');
