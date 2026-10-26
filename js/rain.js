'use strict';
/* =========================================================
   The arcade background: a drifting rain of the group's profile pictures,
   with a vignette, a perspective grid floor and scanlines.
   FaceRain.setFaces(srcs) takes image URLs (data: or blob: or files); with
   no faces only the grid and scanlines show. Each face is pre-rendered once
   into a round sprite, so a frame is one drawImage per flake.
   ========================================================= */
const FaceRain = (() => {
  const cv = document.createElement('canvas'); cv.id = 'rain'; cv.setAttribute('aria-hidden', 'true');
  const layers = ['vignette', 'gridFloor', 'scanlines'].map(c => {
    const d = document.createElement('div'); d.className = 'arcadeLayer ' + c; d.setAttribute('aria-hidden', 'true'); return d;
  });
  const mount = () => document.body.prepend(cv, ...layers);
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  const ctx = cv.getContext('2d');
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sprites = [], flakes = [], raf = 0, last = 0, W = 0, H = 0, dpr = 1, key = '';

  function sprite(img) {
    const S = 192, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), r = S / 2;
    g.beginPath(); g.arc(r, r, r - 2, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.save(); g.beginPath(); g.arc(r, r, r - 14, 0, Math.PI * 2); g.clip();
    const m = Math.min(img.width, img.height);
    g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 14, 14, S - 28, S - 28);
    g.restore();
    g.beginPath(); g.arc(r, r, r - 9, 0, Math.PI * 2); g.lineWidth = 6; g.strokeStyle = '#0b63f6'; g.stroke();
    return c;
  }
  function flake(fresh) {
    const size = 34 + Math.random() * 54;
    return { s: sprites[(Math.random() * sprites.length) | 0], size,
      x: Math.random() * W, y: fresh ? -size - Math.random() * H * 0.3 : Math.random() * H,
      v: 18 + Math.random() * 34 + size * 0.25,               // px/s, bigger faces fall a bit faster
      sway: 10 + Math.random() * 26, ph: Math.random() * 6.28, f: 0.3 + Math.random() * 0.6,
      rot: (Math.random() - 0.5) * 0.5, spin: (Math.random() - 0.5) * 0.5, a: 0.55 + Math.random() * 0.4 };
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const want = sprites.length ? Math.max(12, Math.min(60, Math.round(W * H / 30000))) : 0;   // density from area
    while (flakes.length < want) flakes.push(flake(false));
    flakes.length = Math.min(flakes.length, want);
    if (still || !sprites.length) draw(0);
  }
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    const tsec = performance.now() / 1000;
    flakes.forEach((f, i) => {
      f.y += f.v * dt; f.rot += f.spin * dt;
      if (f.y - f.size > H) flakes[i] = f = flake(true);
      const x = f.x + Math.sin(tsec * f.f + f.ph) * f.sway;
      ctx.save(); ctx.globalAlpha = f.a; ctx.translate(x, f.y); ctx.rotate(f.rot);
      ctx.drawImage(f.s, -f.size / 2, -f.size / 2, f.size, f.size); ctx.restore();
    });
  }
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  function run() {
    cancelAnimationFrame(raf);
    if (!sprites.length || document.hidden) return;
    if (still) { draw(0); return; }
    last = performance.now(); raf = requestAnimationFrame(loop);
  }
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', run);
  return {
    /* faces: image URLs; the same list again is a no-op */
    async setFaces(srcs) {
      srcs = (srcs || []).filter(Boolean);
      const k = srcs.map(s => s.length + ':' + s.slice(-24)).join('|');
      if (k === key) return; key = k;
      const imgs = (await Promise.all(srcs.map(load))).filter(Boolean);
      if (k !== key) return;   // a newer call won
      sprites = imgs.map(sprite); flakes = []; resize(); run();
    }
  };
})();
