'use strict';
/* The look switcher, shared by every page: a slider over the available looks.
   Pages put <div class="skinSlider" data-skin-slider></div> where it belongs
   (add "mini" for the icons-only version), call renderSkinSliders() when the
   look changes, and define pickSkin(name) for what a click does. */
const SKIN_ICONS = { arcade: '🕹️', night: '🌙', retro: '💾' };
function renderSkinSliders(skins, current, label) {
  document.querySelectorAll('[data-skin-slider]').forEach(el => {
    el.style.setProperty('--n', skins.length);
    el.style.setProperty('--i', Math.max(0, skins.indexOf(current)));
    el.setAttribute('role', 'radiogroup');
    el.setAttribute('aria-label', label('title'));
    el.innerHTML = '<span class="thumb" aria-hidden="true"></span>' + skins.map(s =>
      `<button type="button" role="radio" aria-checked="${s === current}" data-pick-skin="${s}" title="${label(s)}">` +
      `<span class="ic" aria-hidden="true">${SKIN_ICONS[s] || '◐'}</span><span class="lb">${label(s)}</span></button>`).join('');
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-pick-skin]');
  if (b && typeof pickSkin === 'function') pickSkin(b.dataset.pickSkin);
});
