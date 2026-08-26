const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const videoStart = html.indexOf('<div id="hero-video"');
const videoEnd = html.indexOf('</div>', videoStart) + 6;
const videoHtml = html.substring(videoStart, videoEnd);

const h1Start = html.indexOf('<h1', videoEnd);
const h1End = html.indexOf('</h1>', h1Start) + 5;
const h1Html = html.substring(h1Start, h1End);

console.log('Video HTML:');
console.log(videoHtml);
console.log('H1 HTML:');
console.log(h1Html);
