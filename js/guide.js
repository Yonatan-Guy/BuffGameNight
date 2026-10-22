'use strict';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
let LANG = lsGet('wst.lang') || ((navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en');
function applyLang() {
  document.querySelectorAll('main[data-lang]').forEach(m => { m.hidden = m.dataset.lang !== LANG; });
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.getElementById('langBtn').textContent = LANG === 'he' ? 'English' : 'עברית';
  document.getElementById('toGame').textContent = LANG === 'he' ? '→ למשחק' : '← To the game';
  document.title = LANG === 'he' ? 'מי שלח? איך מכינים משחק' : 'Who sent it? Making a game';
  setSkin(SKIN);
}
function toggleLang() { LANG = LANG === 'he' ? 'en' : 'he'; lsSet('wst.lang', LANG); applyLang(); }
let SKIN = new URLSearchParams(location.search).get('skin') || lsGet('wst.skin') || 'night';
if (SKIN !== 'retro') SKIN = 'night';
let fonts = false;
function setSkin(sk) {
  SKIN = sk; document.documentElement.dataset.skin = sk;
  if (sk === 'retro' && !fonts) {
    fonts = true; const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Rubik:wght@500;700;900&family=VT323&display=swap'; document.head.appendChild(l);
  }
  const name = LANG === 'he' ? (sk === 'retro' ? 'רטרו' : 'לילה') : (sk === 'retro' ? 'Retro' : 'Night');
  document.getElementById('skinBtn').textContent = (LANG === 'he' ? 'סגנון: ' : 'Look: ') + name;
}
function toggleSkin() { setSkin(SKIN === 'retro' ? 'night' : 'retro'); lsSet('wst.skin', SKIN); }
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
