'use strict';
/* Anonymous counts with GoatCounter: which pages are opened and a few moments in the game
   ("made a game", "opened a room"). Never chat text, names or room codes. Only on the public site. */
(function () {
  const queue = [];
  window.track = name => {
    const gc = window.goatcounter;
    if (gc && gc.count) { try { gc.count({ path: 'event/' + name, title: name, event: true }); } catch (e) {} }
    else queue.push(name);
  };
  if (!/\.netlify\.app$/.test(location.hostname)) { window.track = () => {}; return; }
  window.goatcounter = { path: () => location.pathname };   // drop "?join=4821" and the like
  const s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://yonaguy.goatcounter.com/count';
  s.onload = () => queue.splice(0).forEach(n => window.track(n));
  document.head.appendChild(s);
})();
