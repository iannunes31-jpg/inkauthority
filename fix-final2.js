const fs = require('fs');

let html = fs.readFileSync('public/index-nova.html', 'utf8');

const iframeStr = '<iframe src=\\"https:\\u002F\\u002Fiframe.videodelivery.net\\u002F2d792a548fb470ad1ed427fbb6c0c525?autoplay=false&loop=true&muted=false\\" style=\\"border: none; width: 100%; height: 100%; display: block;\\" allow=\\"accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;\\" allowfullscreen=\\"true\\"><\\u002Fiframe>';

html = html.replace(/<video src=\\"\\u002Fvideo-depoimento\.mp4[^>]*><\\u002Fvideo>/, iframeStr);
html = html.replace(/<img src=\\"\\u002Fespaco-6\.jpeg\\"([^>]*)\\u002F>/, '<img src=\\"\\u002Fturma-work.jpeg\\"$1\\u002F>');

fs.writeFileSync('public/index-nova.html', html);
console.log('Update complete.');
