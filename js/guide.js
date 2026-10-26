'use strict';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
let LANG = lsGet('wst.lang') || ((navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en');
function applyLang() {
  document.querySelectorAll('main[data-lang]').forEach(m => { m.hidden = m.dataset.lang !== LANG; });
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.getElementById('langBtn').textContent = LANG === 'he' ? 'English' : 'עברית';
  document.getElementById('toGame').textContent = LANG === 'he' ? '→ למשחק' : '← To the game';
  document.getElementById('toCreate').textContent = LANG === 'he' ? '✨ ליצור משחק' : '✨ Make a game';
  document.title = LANG === 'he' ? 'מי שלח? איך מכינים משחק' : 'Who sent it? Making a game';
  setSkin(SKIN);
}
function toggleLang() { LANG = LANG === 'he' ? 'en' : 'he'; lsSet('wst.lang', LANG); applyLang(); }
const SKINS = ['arcade', 'dark'];
let SKIN = { night: 'dark', retro: 'arcade' }[lsGet('wst.skin')] || lsGet('wst.skin');
if (!SKINS.includes(SKIN)) SKIN = 'arcade';
function setSkin(sk) {
  SKIN = sk; document.documentElement.dataset.skin = sk;
  const NAMES = { he: { title: 'סגנון', arcade: 'בהיר', dark: 'כהה' }, en: { title: 'Look', arcade: 'Light', dark: 'Dark' } };
  renderSkinSliders(SKINS, sk, k => NAMES[LANG][k] || k);
}
function pickSkin(sk) { setSkin(sk); lsSet('wst.skin', SKIN); }
const PROMPT = document.getElementById('promptTpl').content.textContent.trim();
const FORMAT = document.getElementById('formatTpl').content.textContent.trim();
document.querySelectorAll('.promptText').forEach(p => { p.textContent = PROMPT; });
document.querySelectorAll('.formatText').forEach(p => { p.textContent = FORMAT; });
function copyPrompt(btn) {
  const label = btn.textContent, done = LANG === 'he' ? 'הועתק' : 'Copied';
  const fallback = () => {
    const pre = btn.parentElement.querySelector('pre'), r = document.createRange();
    r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = LANG === 'he' ? 'מסומן, העתיקו' : 'Selected, copy it';
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(PROMPT).then(() => { btn.textContent = done; setTimeout(() => { btn.textContent = label; }, 1800); }, fallback);
  } else fallback();
}
applyLang();
// "#ai" goes to the AI section of whichever language is showing
function toAi() { if (location.hash !== '#ai') return; const s = document.querySelector('main:not([hidden]) .aiSec'); if (s) s.scrollIntoView(); }
document.addEventListener('click', e => { if (e.target.closest('a[href="#ai"]')) { e.preventDefault(); history.replaceState(null, '', '#ai'); toAi(); } });
addEventListener('load', toAi);
// faces from the games made in this browser drift in the background, like on the game page
try { const g = JSON.parse(lsGet('wst.games') || '[]')[0]; if (g && g.pics) FaceRain.setFaces([g.pics.group, ...Object.values(g.pics.people || {})]); } catch (e) {}
