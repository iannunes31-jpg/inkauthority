const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

function escapeReplacement(str) {
  return str.replace(/"/g, '\\"').replace(/\//g, '\\u002F');
}

// 1. Fix broken block (isa-workshop). It is currently <video src="/espaco-1.mov" ...></video>
const brokenBlock = escapeReplacement('<video src="/espaco-1.mov" autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;"></video>');
const espaco8 = escapeReplacement('<img src="/espaco-8.jpeg" style="width:100%;height:100%;object-fit:cover;display:block;" />');
html = html.replace(brokenBlock, espaco8);

// 2. Fix the second couch image (isa-estudio). It is currently <image-slot id="isa-estudio" ...></image-slot>
const isaEstudioRegex = /<image-slot id=\\"isa-estudio\\"[^>]*><\\u002Fimage-slot>/;
const espaco6 = escapeReplacement('<img src="/espaco-6.jpeg" style="width:100%;height:100%;object-fit:cover;display:block;" />');
html = html.replace(isaEstudioRegex, espaco6);

// 3. Replace hero-video with Cloudflare stream
const heroVideoRegex = /<video id=\\"hero-video\\"[^>]*><\\u002Fvideo>/;
const heroIframe = escapeReplacement('<iframe src="https://iframe.videodelivery.net/30319fb40456d90f8d03d1bdb372b768?autoplay=true&loop=true&muted=true" style="border: none; width: 100%; height: 100%; display: block;" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>');
html = html.replace(heroVideoRegex, heroIframe);

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
