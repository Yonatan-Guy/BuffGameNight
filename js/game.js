'use strict';
/* =========================================================
   small helpers
   ========================================================= */
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function newId() { return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function initial(n) { return [...String(n || '?').trim()][0] || '?'; }
function okColor(c) { return /^#[0-9a-f]{3,8}$/i.test(String(c || '')); }
function $(id) { return document.getElementById(id); }
let toastTimer = null;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2600); }

/* =========================================================
   language
   ========================================================= */
const STR = {
  he: {
    docTitle: 'מי שלח?', langSwitch: 'English', skinLabel: 'סגנון: {s}', skinTitle: 'סגנון', skinArcade: 'ארקייד', skinNight: 'לילה', skinRetro: 'רטרו',
    picsLabel: 'תמונות פרופיל (לא חובה): מופיעות בחשיפה', groupPic: 'הקבוצה', addPic: 'להוסיף תמונה ל{n}', removePic: 'להסיר', errPic: 'לא הצלחנו לקרוא את התמונה.', logoA: 'מי ', logoB: 'שלח', logoC: '?',
    tagline: 'משחק ניחושים על הקבוצה שלכם: ההודעות הכי מצחיקות מהצ\'אט, עם השמות מוסתרים. כולם מנחשים מהטלפון מי כתב מה.',
    hostTitle: 'לפתוח חדר', hostSub: 'על המסך הגדול, עם קובץ המשחק', joinTitle: 'להצטרף', joinSub: 'מהטלפון, עם קוד בן 4 ספרות',
    howTo: 'איך מכינים משחק מהצ\'אט שלכם ←', back: 'חזרה',
    setupTitle: 'איזה צ\'אט משחקים?', dropTitle: 'גררו לכאן את קובץ המשחק', dropSub: 'או לחצו כדי לבחור את קובץ ה־JSON שקיבלתם מ־Claude',
    noFile: 'אין לכם קובץ? ככה מכינים אחד', trySample: 'או נסו קבוצה לדוגמה', privacy: 'הקובץ נשמר רק בדפדפן הזה ולא עולה לשום שרת.',
    metaQ: '{n} שאלות', metaP: '{n} בקבוצה', openRoom: 'לפתוח חדר', preview: 'תצוגה מקדימה', del: 'מחיקה',
    delConfirm: 'למחוק את "{t}" מהדפדפן הזה?', settingCount: 'כמה שאלות', all: 'כולן ({n})', settingOrder: 'סדר',
    orderShuffle: 'מעורבב', orderDate: 'לפי תאריך', settingPace: 'קצב', paceRelaxed: 'רגוע', paceNormal: 'רגיל', paceFast: 'מהיר', paceNone: 'בלי הגבלת זמן',
    questionsList: 'השאלות בקובץ ({a} מתוך {n} פעילות)', loaded: 'נטען: {t}', skipped: ' ({n} שאלות דולגו כי חסר בהן מידע)',
    errNotGame: 'זה לא נראה כמו קובץ משחק.', errNoQuestions: 'אין בקובץ שאלות.', errNoValid: 'לא מצאנו בקובץ אף שאלה תקינה.',
    errRead: 'לא הצלחנו לקרוא את הקובץ. ודאו שזה קובץ ה־JSON שקיבלתם מ־Claude.', errBig: 'הקובץ גדול מדי (מעל 8MB).',
    notSaved: 'הדפדפן לא מאפשר לשמור (אולי גלישה בסתר). המשחק יישאר רק עד שתסגרו את הדף.', untitled: 'הקבוצה',
    joinAt: 'נכנסים מהטלפון ל־', andCode: 'ומקלידים את הקוד', orScan: 'או סורקים',
    creating: 'פותחים חדר…', roomOpen: 'החדר פתוח', roomErr: 'בעיה בחיבור ({e}). נסו לרענן את הדף.',
    noPeer: 'רכיב החיבור לא נטען. בדקו את האינטרנט ורעננו.', waiting: 'מחכים לשחקנים…', nPlayers: '{n} מחוברים', start: 'להתחיל',
    removeConfirm: 'להוציא את {n} מהחדר?', removed: '{n} הוצא/ה מהחדר', playersBtn: 'שחקנים', noPlayers: 'אין שחקנים עדיין',
    offline: 'מנותק', removeAria: 'להוציא את {n}',
    qOf: 'שאלה {i} מתוך {n}', whoSentMarked: 'מי שלח את ההודעה המסומנת?', whoSent: 'מי שלח את זה?', namesHidden: 'השמות מוסתרים',
    lockedN: '{a} מתוך {n} ננעלו', revealNow: 'לחשוף עכשיו', next: 'לשאלה הבאה', toFinal: 'לתוצאות',
    nobody: 'אף אחד לא זיהה', everybody: 'כולם זיהו', board: 'הטבלה',
    finalTitle: 'מי מכיר את הקבוצה הכי טוב?', hardest: 'הכי קשה לזיהוי', hardestSub: 'רק {p}% זיהו נכון',
    easiest: 'הכי צפוי/ה', easiestSub: '{p}% זיהו נכון', fastest: 'הכי מהיר/ה', fastestSub: '{s} שניות לתשובה נכונה, בממוצע',
    playAgain: 'עוד סיבוב, אותם שחקנים', otherGame: 'לבחור משחק אחר', leaveConfirm: 'לצאת מהמשחק? החדר ייסגר לכולם.',
    previewOn: 'תצוגה מקדימה, עם 3 שחקנים מדומים', exitPreview: 'יציאה',
    joinHeading: 'הצטרפות', codePh: 'קוד החדר', namePh: 'השם שלכם', joinBtn: 'להיכנס',
    enterCode: 'צריך קוד של 4 ספרות', enterName: 'צריך שם', connecting: 'מתחברים…',
    roomNotFound: 'אין חדר עם הקוד הזה. בדקו את המספר על המסך.', connProblem: 'בעיה בחיבור ({e})', nameTaken: 'השם הזה כבר תפוס בחדר',
    inLobby: 'אתם בפנים', inLobbySub: 'המשחק יתחיל עוד רגע. העיניים על המסך.',
    pickSender: 'מי שלח את ההודעה המסומנת?', lockedOn: 'ננעלתם על', waitOthers: 'מחכים לשאר השחקנים',
    correct: 'צדקתם', wrong: 'לא הפעם', timeUp: 'נגמר הזמן', itWas: 'זה היה {n}', rankOf: 'מקום {r} מתוך {n}',
    getReady: 'השאלה הבאה בדרך', reconnecting: 'מתחברים מחדש…', tryN: 'ניסיון {i} מתוך {n}', disconnected: 'החיבור נותק',
    roomClosed: 'החדר נסגר', scoreKept: 'הניקוד שלכם נשמר.', rejoinAs: 'לחזור בתור {n}', backToRoom: 'לחזור לחדר {c} בתור {n}',
    kicked: 'הוציאו אתכם מהחדר', leaveGame: 'לצאת מהמשחק?', fake: ['נועם', 'שירה', 'גל'],
    fullChat: '⤢ שיחה מלאה', backToBoard: '⤡ חזרה לטבלה', closeView: 'סגירה'
  },
  en: {
    docTitle: 'Who sent it?', langSwitch: 'עברית', skinLabel: 'Look: {s}', skinTitle: 'Look', skinArcade: 'Arcade', skinNight: 'Night', skinRetro: 'Retro',
    picsLabel: 'Profile pictures (optional): shown at the reveal', groupPic: 'Group', addPic: 'Add a picture for {n}', removePic: 'Remove', errPic: 'Couldn’t read that image.', logoA: 'Who ', logoB: 'sent', logoC: ' it?',
    tagline: 'A guessing game about your group chat: its funniest messages with the names hidden. Everyone guesses who wrote what from their phone.',
    hostTitle: 'Host a room', hostSub: 'On the big screen, with your game file', joinTitle: 'Join', joinSub: 'From your phone, with a 4-digit code',
    howTo: 'How to make a game from your chat →', back: 'Back',
    setupTitle: 'Which chat are we playing?', dropTitle: 'Drop your game file here', dropSub: 'or click to pick the JSON file you got from Claude',
    noFile: 'No file yet? Here’s how to make one', trySample: 'or try a sample group', privacy: 'The file stays in this browser. It is never uploaded to a server.',
    metaQ: '{n} questions', metaP: '{n} in the chat', openRoom: 'Open the room', preview: 'Preview', del: 'Delete',
    delConfirm: 'Delete "{t}" from this browser?', settingCount: 'Questions', all: 'All ({n})', settingOrder: 'Order',
    orderShuffle: 'Shuffled', orderDate: 'By date', settingPace: 'Pace', paceRelaxed: 'Relaxed', paceNormal: 'Normal', paceFast: 'Fast', paceNone: 'No time limit',
    questionsList: 'Questions in the file ({a} of {n} on)', loaded: 'Loaded: {t}', skipped: ' ({n} questions skipped because they were incomplete)',
    errNotGame: 'This doesn’t look like a game file.', errNoQuestions: 'The file has no questions.', errNoValid: 'No usable questions in this file.',
    errRead: 'Couldn’t read the file. Make sure it’s the JSON file you got from Claude.', errBig: 'The file is too big (over 8 MB).',
    notSaved: 'This browser won’t save files (private mode?). The game stays only until you close the page.', untitled: 'The group',
    joinAt: 'On your phone, go to', andCode: 'and enter the code', orScan: 'or scan',
    creating: 'Opening the room…', roomOpen: 'The room is open', roomErr: 'Connection problem ({e}). Try refreshing the page.',
    noPeer: 'The connection library didn’t load. Check the internet and refresh.', waiting: 'Waiting for players…', nPlayers: '{n} connected', start: 'Start',
    removeConfirm: 'Remove {n} from the room?', removed: '{n} was removed', playersBtn: 'Players', noPlayers: 'No players yet',
    offline: 'offline', removeAria: 'Remove {n}',
    qOf: 'Question {i} of {n}', whoSentMarked: 'Who sent the highlighted message?', whoSent: 'Who sent this?', namesHidden: 'Names hidden',
    lockedN: '{a} of {n} locked in', revealNow: 'Reveal now', next: 'Next question', toFinal: 'Results',
    nobody: 'Nobody got it', everybody: 'Everyone got it', board: 'Scores',
    finalTitle: 'Who knows the group best?', hardest: 'Hardest to spot', hardestSub: 'only {p}% guessed right',
    easiest: 'Most predictable', easiestSub: '{p}% guessed right', fastest: 'Fastest', fastestSub: '{s} s per correct answer, on average',
    playAgain: 'Another round, same players', otherGame: 'Pick another game', leaveConfirm: 'Leave the game? The room closes for everyone.',
    previewOn: 'Preview with 3 pretend players', exitPreview: 'Exit',
    joinHeading: 'Join', codePh: 'Room code', namePh: 'Your name', joinBtn: 'Join',
    enterCode: 'Enter the 4-digit code', enterName: 'Enter your name', connecting: 'Connecting…',
    roomNotFound: 'No room with that code. Check the number on the screen.', connProblem: 'Connection problem ({e})', nameTaken: 'That name is already taken in this room',
    inLobby: 'You’re in', inLobbySub: 'The game starts soon. Eyes on the screen.',
    pickSender: 'Who sent the highlighted message?', lockedOn: 'You locked in', waitOthers: 'Waiting for the others',
    correct: 'Correct', wrong: 'Not this time', timeUp: 'Time’s up', itWas: 'It was {n}', rankOf: '{r} of {n}',
    getReady: 'Next question coming up', reconnecting: 'Reconnecting…', tryN: 'Try {i} of {n}', disconnected: 'Disconnected',
    roomClosed: 'The room is closed', scoreKept: 'Your score is kept.', rejoinAs: 'Rejoin as {n}', backToRoom: 'Back to room {c} as {n}',
    kicked: 'You were removed from the room', leaveGame: 'Leave the game?', fake: ['Sam', 'Alex', 'Robin'],
    fullChat: '⤢ Full chat', backToBoard: '⤡ Back to scores', closeView: 'Close'
  }
};
let LANG = lsGet('wst.lang') || ((navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en');
if (!STR[LANG]) LANG = 'en';
function t(k, v) {
  let s = STR[LANG][k] ?? STR.en[k] ?? k;
  if (v && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (m, x) => (v[x] ?? m));
  return s;
}
function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.title = t('docTitle');
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  if (current === 'setup') renderGames();
  if (current === 'home') showRejoinBanner();
  setSkin(SKIN);
}
function toggleLang() { LANG = LANG === 'he' ? 'en' : 'he'; lsSet('wst.lang', LANG); applyLang(); }

/* looks: 'arcade', 'night' (default) or 'retro'. The TV's choice is sent to the phones. */
const SKINS = ['arcade', 'night', 'retro'];
let SKIN = new URLSearchParams(location.search).get('skin') || lsGet('wst.skin') || 'night';
if (!SKINS.includes(SKIN)) SKIN = 'night';
const SKIN_FONTS = {   // each look's extra fonts, loaded the first time it is picked
  retro: 'family=Press+Start+2P&family=Rubik:wght@500;700;900&family=VT323',
  arcade: 'family=Secular+One&family=Press+Start+2P&family=Rubik:wght@400;500;700;900'
}, fontsLoaded = new Set();
function setSkin(sk, save) {
  if (!SKINS.includes(sk)) return;
  SKIN = sk;
  document.documentElement.dataset.skin = sk;
  if (save) lsSet('wst.skin', sk);
  if (SKIN_FONTS[sk] && !fontsLoaded.has(sk)) {
    fontsLoaded.add(sk);
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?${SKIN_FONTS[sk]}&display=swap`;
    document.head.appendChild(l);
  }
  renderSkinSliders(SKINS, sk, k => t('skin' + k[0].toUpperCase() + k.slice(1)));
}
function pickSkin(sk) { setSkin(sk, true); broadcast({ type: 'skin', skin: SKIN }); }
function toggleSkin() { pickSkin(SKINS[(SKINS.indexOf(SKIN) + 1) % SKINS.length]); }

/* =========================================================
   screens + browser Back
   ========================================================= */
let current = 'home';
function show(id, push = true) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  if (push && id !== current) { try { history.pushState({ screen: id }, '', '#' + id); } catch (e) {} }
  current = id;
  document.body.classList.toggle('inPlay', id === 'player');
  document.body.classList.toggle('inGame', id === 'game');
  window.scrollTo(0, 0);
}
function replaceScreen(id) { try { history.replaceState({ screen: id }, '', '#' + id); } catch (e) {} }
window.addEventListener('popstate', e => {
  let target = (e.state && e.state.screen) || 'home';
  const stay = () => { try { history.pushState({ screen: current }, '', '#' + current); } catch (err) {} };
  if (current === 'lobby' || current === 'game') {
    const mid = roomActive && !previewMode && (phase === 'question' || phase === 'reveal');
    if (mid && !confirm(t('leaveConfirm'))) { stay(); return; }
    closeRoom();
    target = 'setup'; replaceScreen('setup');
  } else if (current === 'player') {
    if (!kicked && myConn && !confirm(t('leaveGame'))) { stay(); return; }
    leaveAsPlayer();
    target = 'home'; replaceScreen('home');
  }
  if ((target === 'lobby' || target === 'game') && !roomActive) { target = 'setup'; replaceScreen('setup'); }
  if (target === 'player' && !myConn) { target = 'home'; replaceScreen('home'); }
  if (target === 'setup') renderGames();
  if (target === 'home') showRejoinBanner();
  show(target, false);
});

/* =========================================================
   game files
   Format: { title, group, me, participants:[{name,color}],
             questions:[{ date, category, note, time, messages:[{from,text,time,answer,reaction}] }] }
   Also reads the older party-quiz files (questions with chat.lines).
   ========================================================= */
const MEDIA_KINDS = ['image', 'gif', 'video', 'audio'];
const PALETTE = ['#53bdeb', '#ffbc38', '#06cf9c', '#fc9775', '#e542a3', '#a5b337', '#9b8cff', '#ff7a59', '#00a5f4', '#d3b56b', '#25d366', '#ff5d8f'];
function normalizeGame(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(t('errNotGame'));
  const qs = Array.isArray(raw.questions) ? raw.questions : null;
  if (!qs || !qs.length) throw new Error(t('errNoQuestions'));
  const names = [], colorOf = {};
  const addName = n => { n = String(n ?? '').trim().slice(0, 30); if (n && !names.includes(n)) names.push(n); return n; };
  if (Array.isArray(raw.participants)) raw.participants.forEach(p => {
    const n = addName(typeof p === 'string' ? p : p && p.name);
    if (n && p && okColor(p.color)) colorOf[n] = p.color;
  });
  const out = []; let skipped = 0;
  qs.slice(0, 500).forEach(q => {
    try {
      if (!q || typeof q !== 'object') throw 0;
      let msgs, date, note, cat, time;
      if (q.chat && Array.isArray(q.chat.lines)) {           // older party-quiz file
        msgs = q.chat.lines.map(l => ({ from: l.who, text: l.text, time: l.time, answer: l.target, reaction: l.react }));
        date = q.chat.date; note = q.chat.note; cat = q.cat; time = q.time;
        if (Array.isArray(q.a)) q.a.forEach(addName);
      } else { msgs = q.messages; date = q.date; note = q.note; cat = q.category; time = q.time; }
      if (!Array.isArray(msgs) || !msgs.length) throw 0;
      msgs = msgs.slice(0, 40).map(m => ({
        from: addName(m && m.from), text: String((m && m.text) ?? '').slice(0, 3000), time: String((m && m.time) || '').slice(0, 8),
        answer: !!(m && m.answer), reaction: !!(m && m.reaction && !m.answer),
        replyTo: Number.isInteger(m && m.replyTo) ? m.replyTo : -1,
        media: m && typeof m.media === 'string' && /^media\/[\w.-]+$/.test(m.media) ? m.media : '',
        mediaKind: m && MEDIA_KINDS.includes(m.mediaKind) ? m.mediaKind : ''
      }));
      // "replyTo" is the index of the quoted message in the same question, shown like a WhatsApp reply
      msgs.forEach(m => { const r = msgs[m.replyTo]; if (r && r !== m) m.quote = { from: r.from, text: r.text.slice(0, 200) }; delete m.replyTo; });
      const ans = msgs.filter(m => m.answer);
      if (!ans.length || !ans[0].from || !ans.every(m => m.from === ans[0].from)) throw 0;
      const tm = Number(time);
      out.push({ id: out.length, date: String(date || '').slice(0, 20), note: note ? String(note).slice(0, 240) : '',
        category: cat ? String(cat).slice(0, 40) : '', time: Number.isFinite(tm) && tm >= 5 && tm <= 180 ? Math.round(tm) : 0,
        messages: msgs, sender: ans[0].from });
    } catch (e) { skipped++; }
  });
  if (!out.length) throw new Error(t('errNoValid'));
  return {
    title: String(raw.title || raw.group || t('untitled')).slice(0, 60),
    group: String(raw.group || raw.title || t('untitled')).slice(0, 60),
    me: String(raw.me || '').trim(),
    participants: names.map((n, i) => ({ name: n, color: colorOf[n] || PALETTE[i % PALETTE.length] })),
    questions: out, skipped
  };
}

/* saved games (this browser only) */
const GAMES_KEY = 'wst.games';
let games = [], canSave = true, selectedId = null;
try { const a = JSON.parse(lsGet(GAMES_KEY)); if (Array.isArray(a)) games = a.filter(r => r && r.game && Array.isArray(r.game.questions)); } catch (e) {}
function saveGames() { canSave = lsSet(GAMES_KEY, JSON.stringify(games.filter(r => !r.sample))); return canSave; }
function currentRec() { return games.find(r => r.id === selectedId) || null; }
function addGame(raw, sample) {
  const g = normalizeGame(raw);
  const rec = { id: newId(), addedAt: Date.now(), game: g, off: [], sample: !!sample,
    settings: { count: 'all', order: 'shuffle', pace: 'normal' } };
  games = games.filter(r => !(sample && r.sample));
  games.unshift(rec); selectedId = rec.id;
  if (!sample) saveGames();
  return rec;
}
function setMsg(text, kind) { const el = $('loadMsg'); el.textContent = text || ''; el.className = 'msg' + (kind ? ' ' + kind : ''); }
function readFile(file) {
  if (!file) return;
  if (file.size > 8e6) { setMsg(t('errBig'), 'err'); return; }
  const r = new FileReader();
  r.onload = () => {
    let raw;
    try { raw = JSON.parse(String(r.result).replace(/^﻿/, '')); } catch (e) { setMsg(t('errRead'), 'err'); return; }
    try {
      const rec = addGame(raw);
      setMsg(t('loaded', { t: rec.game.title }) + (rec.game.skipped ? t('skipped', { n: rec.game.skipped }) : ''), 'ok');
      if (!canSave) setMsg(t('notSaved'), 'err');
      renderGames();
    } catch (e) { setMsg(e.message || t('errRead'), 'err'); }
  };
  r.onerror = () => setMsg(t('errRead'), 'err');
  r.readAsText(file);
}
function loadSample() {
  addGame(LANG === 'he' ? SAMPLE_HE : SAMPLE_EN, true);
  setMsg('', ''); renderGames();
}
function selectGame(id) { selectedId = selectedId === id ? null : id; renderGames(); }
function deleteGame(id) {
  const rec = games.find(r => r.id === id);
  if (!rec || !confirm(t('delConfirm', { t: rec.game.title }))) return;
  games = games.filter(r => r.id !== id); if (selectedId === id) selectedId = null;
  saveGames(); renderGames();
}
function setSetting(key, val) { const rec = currentRec(); if (!rec) return; rec.settings[key] = val; if (!rec.sample) saveGames(); }
function toggleQ(qid, on) {
  const rec = currentRec(); if (!rec) return;
  const off = new Set(rec.off || []); on ? off.delete(qid) : off.add(qid); rec.off = [...off];
  if (!rec.sample) saveGames();
  const sum = $('qsum'); if (sum) sum.textContent = t('questionsList', { a: rec.game.questions.length - off.size, n: rec.game.questions.length });
}
function renderGames() {
  const box = $('gamesList');
  if (!games.length) { box.innerHTML = ''; return; }
  if (!selectedId) selectedId = games[0].id;
  box.innerHTML = games.map(rec => {
    const g = rec.game, sel = rec.id === selectedId, off = new Set(rec.off || []), s = rec.settings;
    const active = g.questions.length - off.size;
    const faces = g.participants.slice(0, 10).map(p => `<i style="background:${p.color}">${esc(initial(p.name))}</i>`).join('');
    let body = '';
    if (sel) {
      const counts = [10, 15, 20, 30].filter(n => n < active);
      const opt = (v, label, cur) => `<option value="${v}"${String(cur) === String(v) ? ' selected' : ''}>${esc(label)}</option>`;
      body = `<div class="gbody">
        <div class="settings">
          <div class="field"><label for="set-count">${esc(t('settingCount'))}</label>
            <select id="set-count" onchange="setSetting('count',this.value)">${opt('all', t('all', { n: active }), s.count)}${counts.map(n => opt(n, n, s.count)).join('')}</select></div>
          <div class="field"><label for="set-order">${esc(t('settingOrder'))}</label>
            <select id="set-order" onchange="setSetting('order',this.value)">${opt('shuffle', t('orderShuffle'), s.order)}${opt('date', t('orderDate'), s.order)}</select></div>
          <div class="field"><label for="set-pace">${esc(t('settingPace'))}</label>
            <select id="set-pace" onchange="setSetting('pace',this.value)">${opt('relaxed', t('paceRelaxed'), s.pace)}${opt('normal', t('paceNormal'), s.pace)}${opt('fast', t('paceFast'), s.pace)}${opt('none', t('paceNone'), s.pace)}</select></div>
        </div>
        <div class="pics">
          <span class="picsLabel">${esc(t('picsLabel'))}</span>
          <div class="picRow">${[{ name: t('groupPic'), src: (rec.pics && rec.pics.group) || DEFAULT_GROUP, custom: !!(rec.pics && rec.pics.group) },
            ...g.participants.map(pp => ({ name: pp.name, src: (rec.pics && rec.pics.people && rec.pics.people[pp.name]) || DEFAULT_PERSON,
              custom: !!(rec.pics && rec.pics.people && rec.pics.people[pp.name]) }))].map((x, i) => `
            <div class="pic"><button class="picBtn" data-k="${i}" onclick="pickPic(this)" aria-label="${esc(t('addPic', { n: x.name }))}">
              <img src="${x.src}" alt=""><span class="plus">+</span></button>
              <span class="pn" dir="auto">${esc(x.name)}</span>
              ${x.custom ? `<button class="linkbtn small" data-k="${i}" onclick="clearPic(this)">${esc(t('removePic'))}</button>` : ''}</div>`).join('')}</div>
        </div>
        <details><summary id="qsum">${esc(t('questionsList', { a: active, n: g.questions.length }))}</summary>
          <ol class="qlist">${g.questions.map(q => {
            const a = q.messages.find(m => m.answer);
            return `<li><label><input type="checkbox" id="q-${q.id}"${off.has(q.id) ? '' : ' checked'} onchange="toggleQ(${q.id},this.checked)">
              <span class="qd">${esc(q.date)}</span><span class="qt" dir="auto">${esc(a.text.replace(/\s+/g, ' '))}</span></label></li>`;
          }).join('')}</ol></details>
        <div class="gact">
          <button class="btn big" data-primary onclick="openRoom()"${active ? '' : ' disabled'}>${esc(t('openRoom'))}</button>
          <button class="btn ghost" onclick="startPreview()"${active ? '' : ' disabled'}>${esc(t('preview'))}</button>
          <span class="spacer"></span>
          ${rec.sample ? '' : `<button class="btn danger small" onclick="deleteGame('${rec.id}')">${esc(t('del'))}</button>`}
        </div></div>`;
    }
    return `<article class="gcard wnd${sel ? ' sel' : ''}" data-title="game_${games.indexOf(rec) + 1}.json">
      <button class="gsum" onclick="selectGame('${rec.id}')" aria-expanded="${sel}">
        <span class="gtitle" dir="auto">${esc(g.title)}</span>
        <span class="gmeta">${esc(t('metaQ', { n: active }))} · ${esc(t('metaP', { n: g.participants.length }))}</span>
        <span class="faces" aria-hidden="true">${faces}</span>
      </button>${body}</article>`;
  }).join('');
}
function goSetup() { renderGames(); show('setup'); }

/* profile pictures: stored with the game in this browser, shrunk to 160px */
let picTarget = null;
function picKeyAt(i) { const rec = currentRec(); return i === 0 ? '__group__' : rec.game.participants[i - 1].name; }
function pickPic(btn) { picTarget = picKeyAt(Number(btn.dataset.k)); $('picInput').click(); }
function clearPic(btn) {
  const rec = currentRec(); if (!rec || !rec.pics) return;
  const k = picKeyAt(Number(btn.dataset.k));
  if (k === '__group__') delete rec.pics.group; else delete rec.pics.people[k];
  if (!rec.sample) saveGames(); renderGames();
}
function readPic(file) {
  const rec = currentRec(); if (!file || !rec || !picTarget) return;
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const S = 160, c = document.createElement('canvas'); c.width = c.height = S;
    const m = Math.min(img.width, img.height);
    c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
    URL.revokeObjectURL(url);
    const data = c.toDataURL('image/jpeg', 0.82);
    rec.pics = rec.pics || { group: '', people: {} }; rec.pics.people = rec.pics.people || {};
    if (picTarget === '__group__') rec.pics.group = data; else rec.pics.people[picTarget] = data;
    if (!rec.sample && !saveGames()) setMsg(t('notSaved'), 'err');
    renderGames();
  };
  img.onerror = () => { URL.revokeObjectURL(url); setMsg(t('errPic'), 'err'); };
  img.src = url;
}

/* =========================================================
   building a round
   ========================================================= */
let ROUND = null;   // { game, items:[{ q, options:[{name,color}], correct, dur }] }
function autoTime(q) {
  if (q.time) return q.time;
  const chars = q.messages.filter(m => !m.reaction).reduce((s, m) => s + m.text.length, 0);
  return clamp(Math.round((12 + chars / 30) / 5) * 5, 15, 60);
}
function optionsFor(q, g) {
  const ps = g.participants;
  let list = ps;
  if (ps.length > 8) {
    const others = shuffle(ps.filter(p => p.name !== q.sender)).slice(0, 5);
    const keep = new Set([q.sender, ...others.map(p => p.name)]);
    list = ps.filter(p => keep.has(p.name));
  }
  return list.map(p => ({ name: p.name, color: p.color }));
}
function prepareRound(rec) {
  const g = rec.game, s = rec.settings || {}, off = new Set(rec.off || []);
  let qs = shuffle(g.questions.filter(q => !off.has(q.id)));
  if (s.count && s.count !== 'all') qs = qs.slice(0, Number(s.count));
  if (s.order === 'date') qs.sort((a, b) => a.id - b.id);
  const pace = { relaxed: 1.4, normal: 1, fast: 0.7 }[s.pace] || 1;
  const pics = (rec.pics && rec.pics.people) || {};
  // 'none': no clock at all; a question waits for the last player (dur still sets how fast answers score)
  ROUND = { noLimit: s.pace === 'none', game: g, colors: Object.fromEntries(g.participants.map(p => [p.name, p.color])), pics, groupPic: (rec.pics && rec.pics.group) || '',
    items: qs.map(q => { const options = optionsFor(q, g);
      return { q, options, correct: options.findIndex(o => o.name === q.sender), dur: Math.max(8, Math.round(autoTime(q) * pace)) }; }) };
}

/* =========================================================
   the chat panel
   lines: [{ from?, text, time, answer, reaction, first? }]
   Before the reveal names are solid bars (their width does not depend on the name).
   ========================================================= */
const BAR_W = [3.4, 4.6, 2.8, 3.9, 5.1, 3.1, 4.2];
const DEFAULT_GROUP = 'data:image/jpeg;base64,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';
const DEFAULT_PERSON = 'data:image/jpeg;base64,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';
const GROUP_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cfd8dc" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"></circle><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 13.6c2.9.2 5 2.2 5 5.4"></path></svg>';
function hiddenLines(q) {   // what phones get: no names, no reactions, only where a new sender starts
  const vis = q.messages.filter(m => !m.reaction);
  return vis.map((m, i) => ({ text: m.text, time: m.time, answer: m.answer, first: i === 0 || vis[i - 1].from !== m.from,
    quote: m.quote ? { text: m.quote.text } : undefined, media: m.media, mediaKind: m.mediaKind }));
}
function mediaHtml(l) {
  const src = esc(l.media), k = l.mediaKind || (/\.(mp4|mov|webm|m4v)$/i.test(l.media) ? 'video' : /\.(opus|ogg|mp3|m4a|aac|wav)$/i.test(l.media) ? 'audio' : 'image');
  // a file that can't be loaded turns back into its "📷 תמונה" line instead of leaving an empty bubble
  const label = (l.text.match(/(📷 תמונה|🎥 סרטון|🎤 הקלטה|GIF|סטיקר)$/) || ['📷 תמונה'])[0];
  const fail = ` onerror="this.replaceWith('${label}')"`;
  if (k === 'gif') return `<video class="wmedia" src="${src}" autoplay loop muted playsinline${fail}></video>`;
  if (k === 'video') return `<video class="wmedia" src="${src}" controls playsinline preload="metadata"${fail}></video>`;
  if (k === 'audio') return `<audio class="waudio" src="${src}" controls preload="metadata"${fail}></audio>`;
  return `<img class="wmedia" src="${src}" alt=""${fail}>`;
}
function chatHtml(c, o = {}) {
  const reveal = !!o.reveal;
  const lines = reveal ? c.lines : c.lines.filter(l => !l.reaction);
  let run = -1, asked = false, ri = 0;
  const body = lines.map((l, i) => {
    const first = reveal ? (i === 0 || lines[i - 1].from !== l.from) : (l.first !== undefined ? l.first : true);
    if (first) run++;
    const out = reveal && o.me && l.from === o.me;
    let nm = '';
    if (first && !out) {
      if (reveal) {
        const col = (o.colors && o.colors[l.from]) || '#8696a0';
        nm = `<span class="nm" style="color:${col}" dir="auto">${esc(l.from)}<i class="cover" style="animation-delay:${Math.min(run * 110, 1100)}ms"></i></span>`;
      } else nm = `<span class="nm"><i class="rb" style="width:${BAR_W[run % BAR_W.length]}em"></i></span>`;
    }
    const qf = l.quote && reveal ? l.quote.from : '';
    const quote = l.quote ? `<span class="q"${qf ? ` style="--qc:${(o.colors && o.colors[qf]) || '#8696a0'}"` : ''}><span class="qn">${qf ? esc(qf) : '<i class="rb"></i>'}</span><span class="qt" dir="auto">${esc(l.quote.text)}</span></span>` : '';
    // a photo / GIF / video / voice note next to the game file; phones keep the "📷 תמונה" line instead
    const med = l.media && !o.small ? mediaHtml(l) : '';
    const text = med ? l.text.replace(/\n?(📷 תמונה|🎥 סרטון|🎤 הקלטה|GIF|סטיקר)$/, '') : l.text;
    const ask = (!reveal && l.answer && !asked) ? (asked = true, `<div class="ask">${esc(t('whoSent'))}</div>`) : '';
    const cls = ['b', out ? 'out' : '', first ? 'first' : '', l.answer ? 'target' : ''].join(' ');
    const delay = l.reaction ? ` style="animation-delay:${900 + (ri++) * 450}ms"` : '';
    // avatar beside the first message of each run; everyone is the grey silhouette until the reveal
    const src = reveal && o.pics && o.pics[l.from] ? o.pics[l.from] : DEFAULT_PERSON;
    const ava = out ? '' : `<img class="ava${first ? '' : ' sp'}${reveal ? ' shown' : ''}" src="${src}" alt="">`;
    return `${ask}<div class="msg${out ? ' out' : ''}${l.reaction ? ' react' : ''}"${delay}>${ava}<div class="${cls}">${nm}${quote}${med}${text ? `<span dir="auto">${esc(text)}</span>` : ''}<span class="tm">${esc(l.time || '')}</span></div></div>`;
  }).join('');
  const head = o.small ? '' : `<div class="wa-head"><img class="wa-gav" src="${o.groupPic || DEFAULT_GROUP}" alt=""><div>
      <div class="wa-gname" dir="auto">${esc(c.group || '')}</div>
      <div class="wa-sub">${reveal ? esc((o.names || []).join(', ')) : esc(t('namesHidden'))}</div></div></div>`;
  return `<div class="wa${o.small ? ' sm' : ''}">${head}<div class="wa-body">
      ${c.date ? `<div class="wa-date">${esc(c.date)}</div>` : ''}
      ${c.note ? `<div class="wa-sys" dir="auto">${esc(c.note)}</div>` : ''}${body}</div></div>`;
}

/* =========================================================
   HOST (TV)
   ========================================================= */
const PREFIX = 'whosent-v1-';
const players = new Map();      // key -> { name, token, conn, connected, score, answer, elapsed, lastPoints, hits:[] }
const banned = new Set(), bannedTokens = new Set();
let peer = null, roomActive = false, previewMode = false, phase = 'idle';
let qIndex = -1, qStart = 0, qDur = 20, timerId = null, senderStats = {}, pausedAt = 0;

function openRoom() {
  const rec = currentRec(); if (!rec) return;
  prepareRound(rec);
  if (!ROUND.items.length) return;
  closeRoom();
  roomActive = true; phase = 'lobby';
  $('lobbyTitle').textContent = rec.game.title;
  $('joinUrl').textContent = (location.host + location.pathname).replace(/index\.html$/, '').replace(/\/$/, '');
  $('roomCode').textContent = '····'; $('qr').innerHTML = '';
  $('hostStatus').textContent = t('creating');
  show('lobby'); renderLobby(); createPeer();
}
function createPeer() {
  if (typeof Peer === 'undefined') { $('hostStatus').textContent = t('noPeer'); return; }
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const p = new Peer(PREFIX + code);
  peer = p;
  p.on('open', () => {
    if (peer !== p) return;
    $('roomCode').textContent = code;
    $('hostStatus').textContent = t('roomOpen');
    const url = location.origin + location.pathname + '?join=' + code;
    $('qr').innerHTML = '';
    if (typeof QRCode !== 'undefined') new QRCode($('qr'), { text: url, width: 180, height: 180, colorDark: '#0c0e13', colorLight: '#ffffff' });
  });
  p.on('error', err => {
    if (peer !== p) return;
    if (err.type === 'unavailable-id') { p.destroy(); createPeer(); }
    else if (err.type !== 'peer-unavailable') $('hostStatus').textContent = t('roomErr', { e: err.type });
  });
  p.on('disconnected', () => { if (peer === p && !p.destroyed) { try { p.reconnect(); } catch (e) {} } });
  p.on('connection', handleConnection);
}
function closeRoom() {
  clearInterval(timerId);
  players.forEach(pl => { try { pl.conn && pl.conn.close(); } catch (e) {} });
  if (peer) { const p = peer; peer = null; try { p.destroy(); } catch (e) {} }
  players.clear(); banned.clear(); bannedTokens.clear();
  roomActive = false; previewMode = false; phase = 'idle';
  $('playersBtn').hidden = true; $('playersPanel').hidden = true; $('previewBar').hidden = true;
}

function handleConnection(conn) {
  conn.on('data', msg => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'join') {
      const name = String(msg.name || '').trim().slice(0, 16);
      const key = name.toLowerCase();
      const token = String(msg.token || '').slice(0, 40);
      if (!name) return;
      if (banned.has(key) || (token && bannedTokens.has(token))) { conn.send({ type: 'kicked' }); return; }
      const existing = players.get(key);
      if (existing && existing.connected && existing.token !== token) { conn.send({ type: 'error', code: 'taken' }); return; }
      const p = existing || { name, score: 0, answer: null, elapsed: 0, lastPoints: 0, hits: [] };
      const old = p.conn;
      p.conn = conn; p.connected = true; p.token = token; conn._key = key;
      players.set(key, p);
      if (old && old !== conn) { try { old.close(); } catch (e) {} }
      conn.send({ type: 'welcome', name: p.name, score: p.score, skin: SKIN, pics: (ROUND && ROUND.pics) || {} });
      syncPlayer(p);
      refreshHost();
    } else if (msg.type === 'answer') {
      const p = players.get(conn._key);
      if (p && p.conn === conn) onAnswer(p, msg.choice);
    }
  });
  conn.on('close', () => {
    const p = players.get(conn._key);
    if (!p || p.conn !== conn) return;
    p.connected = false;
    if (phase === 'lobby') players.delete(conn._key);
    refreshHost(); maybeEndEarly();
  });
}
function send(p, msg) { if (p.connected && p.conn && p.conn.open) { try { p.conn.send(msg); } catch (e) {} } }
function broadcast(msg) { players.forEach(p => send(p, msg)); }
function connectedPlayers() { return [...players.values()].filter(p => p.connected); }
function ranking() { return [...players.values()].sort((a, b) => b.score - a.score); }
function syncPlayer(p) {
  if (phase === 'lobby') send(p, { type: 'lobby' });
  else if (phase === 'question') send(p, p.answer === null ? questionMsg() : { type: 'locked', choice: ROUND.items[qIndex].options[p.answer] });
  else if (phase === 'final') send(p, finalMsg(p));
  else send(p, p.lastResult || { type: 'between' });
}
function refreshHost() {
  if (phase === 'lobby') renderLobby();
  if (phase === 'question') renderLocked();
  renderPlayersPanel();
}
function renderLobby() {
  const box = $('players'); box.innerHTML = '';
  players.forEach((p, key) => {
    const chip = document.createElement('div'); chip.className = 'chip' + (p.connected ? '' : ' off');
    const av = document.createElement('span'); av.className = 'av'; av.style.background = PALETTE[[...key].reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTE.length]; av.textContent = initial(p.name);
    const nm = document.createElement('span'); nm.textContent = p.name; nm.dir = 'auto';
    const b = document.createElement('button'); b.className = 'kick'; b.textContent = '✕';
    b.setAttribute('aria-label', t('removeAria', { n: p.name })); b.onclick = () => kick(key);
    chip.append(av, nm, b); box.appendChild(chip);
  });
  const n = connectedPlayers().length;
  $('count').textContent = n ? t('nPlayers', { n }) : t('waiting');
  $('startBtn').disabled = n === 0;
}

/* host controls */
function kick(key) {
  const p = players.get(key);
  if (!p || !confirm(t('removeConfirm', { n: p.name }))) return;
  banned.add(key); if (p.token) bannedTokens.add(p.token);
  send(p, { type: 'kicked' });
  const c = p.conn; setTimeout(() => { try { c && c.close(); } catch (e) {} }, 300);
  players.delete(key);
  toast(t('removed', { n: p.name }));
  refreshHost(); maybeEndEarly();
}
function togglePlayers() { const pn = $('playersPanel'); pn.hidden = !pn.hidden; renderPlayersPanel(); }
function renderPlayersPanel() {
  const pn = $('playersPanel'); if (pn.hidden) return;
  pn.innerHTML = '';
  if (!players.size) { pn.textContent = t('noPlayers'); return; }
  players.forEach((p, key) => {
    const row = document.createElement('div'); row.className = 'prow';
    const dot = document.createElement('span'); dot.className = 'dot' + (p.connected ? '' : ' off');
    const nm = document.createElement('span'); nm.className = 'nm'; nm.dir = 'auto'; nm.textContent = p.name;
    const sc = document.createElement('span'); sc.className = 'muted'; sc.textContent = p.connected ? p.score : p.score + ' · ' + t('offline');
    const b = document.createElement('button'); b.className = 'kick'; b.textContent = '✕';
    b.setAttribute('aria-label', t('removeAria', { n: p.name })); b.onclick = () => kick(key);
    row.append(dot, nm, sc, b); pn.appendChild(row);
  });
}

/* game flow */
function startGame() {
  players.forEach((p, key) => { if (!p.connected) players.delete(key); });
  players.forEach(p => { p.score = 0; p.hits = []; });
  senderStats = {}; qIndex = -1;
  show('game');
  $('playersBtn').hidden = false;
  nextQuestion();
}
function questionMsg() {
  const it = ROUND.items[qIndex], q = it.q;
  return { type: 'question', n: qIndex + 1, total: ROUND.items.length, date: q.date, note: q.note,
           lines: hiddenLines(q), options: it.options };
}
function nextQuestion() {
  qIndex++;
  if (qIndex >= ROUND.items.length) { showFinal(); return; }
  phase = 'question';
  players.forEach(p => { p.answer = null; p.lastPoints = 0; p.elapsed = 0; p.lastResult = null; });
  const it = ROUND.items[qIndex], q = it.q, g = ROUND.game;
  qDur = it.dur;
  $('timebar').hidden = ROUND.noLimit;
  $('prog').textContent = t('qOf', { i: qIndex + 1, n: ROUND.items.length });
  $('stage').innerHTML = `<div class="qgrid">
      <div id="chatBox">${chatHtml({ group: g.group, date: q.date, note: q.note, lines: hiddenLines(q) }, { groupPic: ROUND.groupPic })}</div>
      <aside class="side">
        ${q.category ? `<span class="cat" dir="auto">${esc(q.category)}</span>` : ''}
        <h2>${esc(t('whoSentMarked'))}</h2>
        <div class="suspects">${it.options.map((o, i) => `<div class="sus" id="sus${i}" style="--c:${o.color}">
            ${avHtml(o, ROUND.pics)}<span class="nm" dir="auto">${esc(o.name)}</span>
            <span class="cnt" id="cnt${i}"></span><span class="voters" id="vot${i}"></span></div>`).join('')}</div>
        <div class="locked"><span class="lc" id="lockedCount"></span><div class="lchips" id="lockedChips"></div></div>
        <div class="sideFoot" id="sideFoot"><button class="btn ghost small" onclick="endQuestion()">${esc(t('revealNow'))}</button></div>
      </aside></div>`;
  renderLocked();
  qStart = performance.now(); pausedAt = 0; clockHolds.clear(); closeView();
  scrollToTarget(); setTimeout(scrollToTarget, 400);   // again once photos have their size
  broadcast(questionMsg());
  if (previewMode) setTimeout(() => { if (phase === 'question') fakeAnswers(); }, 1800);
  clearInterval(timerId);
  tick(); timerId = setInterval(tick, 200);
}
function avHtml(o, pics) {
  const pic = pics && pics[o.name];
  return pic ? `<img class="av pic" src="${pic}" alt="">` : `<span class="av" style="background:${okColor(o.color) ? o.color : '#8696a0'}">${esc(initial(o.name))}</span>`;
}
/* The clock stops while a video / voice note plays or a photo is open full screen,
   and runs again once nothing holds it. */
const clockHolds = new Set();
function clockNow() { return pausedAt || performance.now(); }
function pauseClock(why) {
  if (phase !== 'question') return;
  clockHolds.add(why);
  if (pausedAt) return;
  pausedAt = performance.now(); clearInterval(timerId);
  $('timer').textContent = '⏸';
}
function resumeClock(why) {
  clockHolds.delete(why);
  if (!pausedAt || clockHolds.size) return;
  qStart += performance.now() - pausedAt; pausedAt = 0;
  if (phase === 'question') { clearInterval(timerId); tick(); timerId = setInterval(tick, 200); }
}
const clip = e => e.target.controls && e.target.closest && e.target.closest('#chatBox');
document.addEventListener('play', e => { if (clip(e)) pauseClock('clip'); }, true);
['pause', 'ended'].forEach(ev => document.addEventListener(ev, e => {
  if (clip(e) && ![...document.querySelectorAll('#chatBox video[controls], #chatBox audio')].some(m => !m.paused)) resumeClock('clip');
}, true));

/* a photo or GIF in the chat opens full screen */
function openView(el) {
  closeView();
  const v = document.createElement('div'); v.id = 'viewer'; v.setAttribute('role', 'dialog');
  const big = el.tagName === 'VIDEO'
    ? Object.assign(document.createElement('video'), { src: el.getAttribute('src'), autoplay: true, loop: true, muted: true, playsInline: true })
    : Object.assign(document.createElement('img'), { src: el.getAttribute('src'), alt: '' });
  const x = Object.assign(document.createElement('button'), { className: 'x', textContent: '✕' });
  x.setAttribute('aria-label', t('closeView'));
  v.append(big, x); v.onclick = closeView;
  document.body.appendChild(v);
  pauseClock('view');
}
function closeView() { const v = $('viewer'); if (!v) return; v.remove(); resumeClock('view'); }
document.addEventListener('click', e => {
  const m = e.target.closest && e.target.closest('#chatBox img.wmedia, #chatBox video.wmedia:not([controls])');
  if (m) openView(m);
});
/* after the reveal the chat can take the whole screen, so the full conversation fits */
function toggleFullChat() {
  const g = document.querySelector('#stage .qgrid'); if (!g) return;
  const on = g.classList.toggle('full');
  const b = $('fullBtn'); if (b) b.textContent = t(on ? 'backToBoard' : 'fullChat');
  // show as much of the conversation as fits, ending with the laughs at the bottom
  const body = g.querySelector('.wa-body'); if (body) body.scrollTop = on ? body.scrollHeight : 0;
  if (!on) scrollToTarget();
}
/* open each question with the highlighted message in view */
function scrollToTarget() {
  const body = document.querySelector('#chatBox .wa-body'), tg = body && body.querySelector('.b.target');
  if (tg) body.scrollTop += tg.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight * 0.3;
}
function tick() {
  if (ROUND.noLimit) { if (!pausedAt) $('timer').textContent = ''; return; }
  const left = Math.max(0, qDur - (clockNow() - qStart) / 1000);
  $('timer').textContent = Math.ceil(left);
  $('timeFill').style.width = (left / qDur * 100) + '%';
  const hurry = left <= 5;
  $('timer').classList.toggle('hurry', hurry); $('timebar').classList.toggle('hurry', hurry);
  if (left <= 0) endQuestion();
}
function renderLocked() {
  const all = [...players.values()].filter(p => p.connected || p.answer !== null);
  const done = all.filter(p => p.answer !== null);
  const lc = $('lockedCount'); if (!lc) return;
  lc.textContent = t('lockedN', { a: done.length, n: all.length });
  $('lockedChips').innerHTML = done.map(p => `<span dir="auto">${esc(p.name)}</span>`).join('');
}
function onAnswer(p, choice) {
  if (phase !== 'question' || p.answer !== null) return;
  const it = ROUND.items[qIndex];
  if (!Number.isInteger(choice) || choice < 0 || choice >= it.options.length) return;
  p.answer = choice;
  p.elapsed = (clockNow() - qStart) / 1000;   // measured on the TV, so phone clocks don't matter
  send(p, { type: 'locked', choice: it.options[choice] });
  renderLocked(); maybeEndEarly();
}
function maybeEndEarly() {
  if (phase !== 'question') return;
  const online = connectedPlayers();
  if (online.length && online.every(x => x.answer !== null)) setTimeout(() => endQuestion(), 600);
}
function endQuestion() {
  if (phase !== 'question') return;
  phase = 'reveal';
  clearInterval(timerId); pausedAt = 0; clockHolds.clear();
  $('timer').textContent = ''; $('timeFill').style.width = '0%';
  const it = ROUND.items[qIndex], q = it.q, g = ROUND.game;
  const st = senderStats[q.sender] || (senderStats[q.sender] = { answers: 0, right: 0 });
  players.forEach(p => {
    const right = p.answer === it.correct;
    p.lastPoints = right ? Math.round(1000 * (1 - 0.5 * Math.min(1, p.elapsed / qDur))) : 0;
    p.score += p.lastPoints;
    if (p.answer !== null) { st.answers++; if (right) { st.right++; p.hits.push(p.elapsed); } }
  });
  const ranked = ranking();
  ranked.forEach((p, i) => send(p, p.lastResult = { type: 'result', answered: p.answer !== null, correct: p.answer === it.correct, points: p.lastPoints,
    score: p.score, rank: i + 1, of: ranked.length, sender: { name: q.sender, color: (ROUND.colors[q.sender] || '#8696a0') } }));
  // chat with names, reactions, and the votes per suspect
  $('chatBox').innerHTML = chatHtml({ group: g.group, date: q.date, note: q.note, lines: q.messages },
    { reveal: true, me: g.me, colors: ROUND.colors, names: g.participants.map(p => p.name), pics: ROUND.pics, groupPic: ROUND.groupPic });
  const head = document.querySelector('#chatBox .wa-head');
  if (head) head.insertAdjacentHTML('beforeend', `<button class="btn ghost small" id="fullBtn" onclick="toggleFullChat()">${esc(t('fullChat'))}</button>`);
  scrollToTarget();
  it.options.forEach((o, i) => {
    const voters = [...players.values()].filter(p => p.answer === i);
    const el = $('sus' + i);
    el.classList.add(i === it.correct ? 'win' : 'dim');
    $('cnt' + i).textContent = voters.length || '';
    $('vot' + i).textContent = voters.map(p => p.name).join(', ');
  });
  const last = qIndex === ROUND.items.length - 1;
  const rightN = [...players.values()].filter(p => p.answer === it.correct).length;
  const verdict = players.size ? (rightN === 0 ? t('nobody') : rightN === players.size ? t('everybody') : '') : '';
  $('lockedCount').textContent = verdict; $('lockedChips').innerHTML = '';
  $('sideFoot').innerHTML = `<div class="board wnd" data-title="scores.txt" style="flex:1">
      <h3>${esc(t('board'))}</h3>
      ${ranked.slice(0, 5).map((p, i) => `<div class="row${i === 0 && p.score > 0 ? ' lead' : ''}"><span class="rk">${i + 1}</span>
        <span class="nm" dir="auto">${esc(p.name)}</span>${p.lastPoints ? `<span class="plus">+${p.lastPoints}</span>` : ''}<span class="sc">${p.score}</span></div>`).join('')}
    </div>
    <button class="btn big" data-primary onclick="nextQuestion()">${esc(last ? t('toFinal') : t('next'))}</button>`;
  renderPlayersPanel();
}
/* what a phone shows at the end: its place, everyone's scores, and the same facts as the TV */
let finalFacts = [];
function finalMsg(p) {
  const r = ranking();
  return { type: 'final', rank: r.indexOf(p) + 1, of: r.length, score: p.score,
           board: r.map(x => ({ name: x.name, score: x.score, me: x === p })), facts: finalFacts };
}
function showFinal() {
  phase = 'final';
  clearInterval(timerId);
  $('timer').textContent = ''; $('prog').textContent = ''; $('timeFill').style.width = '0%';
  const r = ranking();
  const pod = (p, place) => p ? `<div class="pod p${place}"><span class="nm" dir="auto">${esc(p.name)}</span><span class="sc">${p.score}</span><div class="blk">${place}</div></div>` : '<div></div>';
  const facts = [];
  const ss = Object.entries(senderStats).filter(([, s]) => s.answers > 0).map(([n, s]) => ({ n, p: Math.round(100 * s.right / s.answers) }));
  if (ss.length >= 2) {
    ss.sort((a, b) => a.p - b.p);
    facts.push({ k: t('hardest'), v: ss[0].n, s: t('hardestSub', { p: ss[0].p }) });
    const top = ss[ss.length - 1];
    if (top.p > ss[0].p) facts.push({ k: t('easiest'), v: top.n, s: t('easiestSub', { p: top.p }) });
  }
  const fast = r.filter(p => p.hits.length >= 2).map(p => ({ n: p.name, s: p.hits.reduce((a, b) => a + b, 0) / p.hits.length })).sort((a, b) => a.s - b.s)[0];
  if (fast) facts.push({ k: t('fastest'), v: fast.n, s: t('fastestSub', { s: fast.s.toFixed(1) }) });
  finalFacts = facts;
  r.forEach(p => send(p, finalMsg(p)));
  $('stage').innerHTML = `<div class="final">
      <h2>${esc(t('finalTitle'))}</h2>
      <div class="podium">${pod(r[1], 2)}${pod(r[0], 1)}${pod(r[2], 3)}</div>
      ${r.length > 3 ? `<div class="board wnd" data-title="scores.txt">${r.slice(3).map((p, i) => `<div class="row"><span class="rk">${i + 4}</span><span class="nm" dir="auto">${esc(p.name)}</span><span class="sc">${p.score}</span></div>`).join('')}</div>` : ''}
      ${facts.length ? `<div class="facts">${facts.map(f => `<div class="fact wnd" data-title="stats.txt"><span class="k">${esc(f.k)}</span><span class="v" dir="auto">${esc(f.v)}</span><span class="s">${esc(f.s)}</span></div>`).join('')}</div>` : ''}
      <div class="gact"><button class="btn big" data-primary onclick="playAgain()">${esc(t('playAgain'))}</button>
        <button class="btn ghost" onclick="otherGame()">${esc(t('otherGame'))}</button></div>
    </div>`;
}
function playAgain() {
  if (previewMode) { startPreview(); return; }
  const rec = currentRec(); if (rec) prepareRound(rec);
  phase = 'lobby';
  players.forEach((p, key) => { if (!p.connected) players.delete(key); else { p.score = 0; p.hits = []; p.answer = null; } });
  broadcast({ type: 'lobby' }); broadcast({ type: 'score', score: 0 });
  $('playersBtn').hidden = true;
  show('lobby'); renderLobby();
}
function otherGame() { closeRoom(); renderGames(); show('setup', false); replaceScreen('setup'); }

/* preview: the game on this screen with pretend players */
function startPreview() {
  const rec = currentRec(); if (!rec) return;
  closeRoom();
  prepareRound(rec);
  roomActive = true; previewMode = true;
  t('fake').forEach(n => players.set(n, { name: n, score: 0, answer: null, elapsed: 0, lastPoints: 0, hits: [], connected: false, conn: null }));
  senderStats = {}; qIndex = -1;
  $('previewBar').hidden = false;
  show('game');
  nextQuestion();
}
function fakeAnswers() {
  const it = ROUND.items[qIndex];
  players.forEach(p => {
    p.answer = Math.random() < 0.5 ? it.correct : Math.floor(Math.random() * it.options.length);
    p.elapsed = 2 + Math.random() * qDur * 0.6;
  });
  renderLocked();
  if (ROUND.noLimit) setTimeout(() => { if (phase === 'question' && previewMode) endQuestion(); }, 1500);   // pretend players are "everyone"
}

/* Space / Enter presses the main button on the TV */
document.addEventListener('keydown', e => {
  if ($('viewer') && (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); closeView(); return; }
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  if (/^(INPUT|SELECT|TEXTAREA|BUTTON|A|SUMMARY)$/.test(e.target.tagName)) return;
  const btn = document.querySelector('.screen.active [data-primary]:not(:disabled)');
  if (btn) { e.preventDefault(); btn.click(); }
});

/* =========================================================
   PLAYER (phone)
   ========================================================= */
let phonePics = {};
let myConn = null, myPeer = null, session = null, kicked = false, retries = 0, retryTimer = null, lastQ = null;
const SESSION_KEY = 'wst.session', MAX_RETRIES = 15;
function deviceToken() { let tk = lsGet('wst.device'); if (!tk) { tk = newId(); lsSet('wst.device', tk); } return tk; }
function savedSession() { try { const s = JSON.parse(lsGet(SESSION_KEY)); return s && Date.now() - s.at < 6 * 3600e3 ? s : null; } catch (e) { return null; } }
function pview(html, cls) { const v = $('pview'); v.className = 'pview'; v.innerHTML = cls ? `<div class="state ${cls}">${html}</div>` : html; }

function joinRoom() {
  const code = $('codeInput').value.trim(), name = $('nameInput').value.trim(), st = $('status');
  st.className = 'msg err';
  if (!/^\d{4}$/.test(code)) { st.textContent = t('enterCode'); return; }
  if (!name) { st.textContent = t('enterName'); return; }
  st.className = 'msg'; st.textContent = t('connecting');
  $('joinBtn').disabled = true;
  kicked = false; retries = 0;
  connectTo(code, name, true);
}
function connectTo(code, name, fromForm) {
  clearTimeout(retryTimer);
  if (typeof Peer === 'undefined') { $('status').textContent = t('noPeer'); $('joinBtn').disabled = false; return; }
  if (myPeer) { try { myPeer.destroy(); } catch (e) {} }
  const peerP = new Peer(); myPeer = peerP;
  const fail = (text, roomGone) => {
    if (peerP !== myPeer) return;
    if (fromForm && !myConn) {
      const st = $('status'); st.className = 'msg err'; st.textContent = text;
      $('joinBtn').disabled = false; try { peerP.destroy(); } catch (e) {}
    } else lost(roomGone ? t('roomClosed') : text, roomGone);
  };
  peerP.on('open', () => {
    const conn = peerP.connect(PREFIX + code, { reliable: true });
    conn.on('open', () => conn.send({ type: 'join', name, token: deviceToken() }));
    conn.on('data', msg => onHostMessage(msg, conn, fail, code));
    conn.on('close', () => { if (myConn === conn) lost(); });
  });
  peerP.on('error', err => fail(err.type === 'peer-unavailable' ? t('roomNotFound') : t('connProblem', { e: err.type }), err.type === 'peer-unavailable'));
}
function lost(reason, stop) {
  if (kicked || !session) return;
  myConn = null;
  if (stop || retries >= MAX_RETRIES) {
    pview(`<p class="big">${esc(reason || t('disconnected'))}</p><p class="muted">${esc(t('scoreKept'))}</p>
      <button class="btn big" onclick="rejoin()">${esc(t('rejoinAs', { n: session.name }))}</button>`, 'bad');
    return;
  }
  retries++;
  pview(`<p class="big">${esc(t('reconnecting'))}</p><p class="muted">${esc(t('tryN', { i: retries, n: MAX_RETRIES }))}</p>`, 'plain');
  retryTimer = setTimeout(() => connectTo(session.code, session.name, false), 2000);
}
function rejoin() {
  session = session || savedSession();
  if (!session) { show('join'); return; }
  retries = 0; kicked = false;
  $('pName').textContent = session.name;
  if (current !== 'player') show('player');
  pview(`<p class="big">${esc(t('connecting'))}</p>`, 'plain');
  connectTo(session.code, session.name, false);
}
function leaveAsPlayer() {
  clearTimeout(retryTimer);
  const p = myPeer; myPeer = null; myConn = null; session = null;
  if (p) { try { p.destroy(); } catch (e) {} }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && current === 'player' && session && !kicked && !(myConn && myConn.open)) {
    retries = 0; connectTo(session.code, session.name, false);
  }
});
function onHostMessage(msg, conn, fail, code) {
  if (!msg || typeof msg !== 'object') return;
  switch (msg.type) {
    case 'error': fail(msg.code === 'taken' ? t('nameTaken') : t('connProblem', { e: msg.code }), msg.code === 'taken'); break;
    case 'kicked':
      kicked = true; myConn = null; lsDel(SESSION_KEY);
      if (current !== 'player') show('player');
      pview(`<p class="big">${esc(t('kicked'))}</p>`, 'bad');
      try { myPeer && myPeer.destroy(); } catch (e) {}
      break;
    case 'welcome':
      myConn = conn; retries = 0;
      session = { code, name: msg.name, at: Date.now() };
      lsSet(SESSION_KEY, JSON.stringify(session));
      $('pName').textContent = msg.name; $('pScore').textContent = msg.score;
      if (msg.skin) setSkin(msg.skin);
      phonePics = {};
      if (msg.pics && typeof msg.pics === 'object') Object.entries(msg.pics).slice(0, 40).forEach(([k, v]) => {
        if (typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 200000) phonePics[k] = v;
      });
      $('status').textContent = ''; $('joinBtn').disabled = false;
      if (current !== 'player') show('player');
      break;
    case 'lobby': pview(`<p class="big">${esc(t('inLobby'))}</p><p class="muted">${esc(t('inLobbySub'))}</p>`, 'plain'); break;
    case 'between': pview(`<p class="big">${esc(t('getReady'))}</p>`, 'plain'); break;
    case 'score': $('pScore').textContent = msg.score; break;
    case 'skin': setSkin(msg.skin); break;
    case 'question': renderPhoneQuestion(msg); break;
    case 'locked': {
      const o = msg.choice || {};
      pview(`<p class="muted">${esc(t('lockedOn'))}</p><p class="big" dir="auto" style="color:${okColor(o.color) ? o.color : 'inherit'}">${esc(o.name || '')}</p>
        <p class="muted">${esc(t('waitOthers'))}</p>`, 'plain');
      break;
    }
    case 'result': {
      $('pScore').textContent = msg.score;
      const s = msg.sender || {};
      const head = !msg.answered ? t('timeUp') : msg.correct ? t('correct') : t('wrong');
      pview(`<p class="big">${esc(head)}</p>${msg.points ? `<p class="pts" dir="ltr">+${msg.points}</p>` : ''}
        <p class="who" style="--c:${okColor(s.color) ? s.color : '#8696a0'}" dir="auto">${esc(t('itWas', { n: s.name || '' }))}</p><p class="muted">${esc(t('rankOf', { r: msg.rank, n: msg.of }))}</p>`, msg.correct ? 'ok' : 'bad');
      break;
    }
    case 'final':
      $('pScore').textContent = msg.score;
      $('pProg').textContent = '';
      phoneFinal(msg);
      break;
  }
}
function phoneFinal(msg) {
  const board = Array.isArray(msg.board) ? msg.board.slice(0, 40) : [];
  const facts = Array.isArray(msg.facts) ? msg.facts.slice(0, 4) : [];
  const medal = ['🥇', '🥈', '🥉'];
  pview(`<div class="pfinal">
      <div class="state ${msg.rank === 1 ? 'ok' : 'plain'}"><p class="big">${medal[msg.rank - 1] || msg.rank}</p>
        <p>${esc(t('rankOf', { r: msg.rank, n: msg.of }))}</p><p class="pts" dir="ltr">${Number(msg.score) || 0}</p></div>
      ${board.length ? `<div class="board"><h3>${esc(t('board'))}</h3>${board.map((b, i) => `<div class="row${b.me ? ' me' : ''}">
        <span class="rk">${medal[i] || i + 1}</span><span class="nm" dir="auto">${esc(b.name)}</span><span class="sc">${Number(b.score) || 0}</span></div>`).join('')}</div>` : ''}
      ${facts.length ? `<div class="facts">${facts.map(f => `<div class="fact"><span class="k">${esc(f.k)}</span>
        <span class="v" dir="auto">${esc(f.v)}</span><span class="s">${esc(f.s)}</span></div>`).join('')}</div>` : ''}
    </div>`);  window.scrollTo(0, 0);   // the last question may have left the page scrolled down
}
function renderPhoneQuestion(m) {
  lastQ = m;
  const lines = Array.isArray(m.lines) ? m.lines.slice(0, 40) : [];
  const opts = Array.isArray(m.options) ? m.options : [];
  $('pProg').textContent = t('qOf', { i: m.n, n: m.total });
  pview(`<div class="pq">
      ${chatHtml({ date: m.date, note: m.note, lines }, { small: true })}
      <div class="opts">${opts.map((o, i) => `<button class="opt" onclick="answer(${i})">
        ${avHtml(o, phonePics)}<span class="nm" dir="auto">${esc(o.name)}</span></button>`).join('')}</div>
    </div>`);
  const tgt = document.querySelector('#pview .b.target'); if (tgt && tgt.scrollIntoView) tgt.scrollIntoView({ block: 'center' });
}
function answer(i) {
  if (!(myConn && myConn.open)) return;
  myConn.send({ type: 'answer', choice: i });
  document.querySelectorAll('#pview .opt').forEach(b => { b.disabled = true; });
}

/* =========================================================
   sample groups (made up, so the public site shows no real chat)
   ========================================================= */
const SAMPLE_HE = { title: 'החבר\'ה מהשכונה (לדוגמה)', group: 'החבר\'ה מהשכונה', me: 'מאיה',
  participants: [{ name: 'נועה' }, { name: 'תומר' }, { name: 'מאיה' }, { name: 'דניאל' }, { name: 'אורי' }],
  questions: [
    { date: '14/02/2025', category: '🍽️ אוכל', messages: [
      { from: 'תומר', time: '19:02', text: 'מישהו יודע מה עושים עם 3 קילו חומוס' },
      { from: 'דניאל', time: '19:03', text: 'למה יש לך 3 קילו חומוס' },
      { from: 'תומר', time: '19:03', text: 'לחצתי פעם אחת יותר מדי באפליקציה' },
      { from: 'נועה', time: '19:04', text: 'תפתח מסעדה. תקרא לה "פעם אחת יותר מדי"', answer: true },
      { from: 'מאיה', time: '19:04', text: 'חחחחחחחחח', reaction: true }, { from: 'אורי', time: '19:05', text: 'מתתתת', reaction: true }] },
    { date: '03/06/2025', category: '⏰ איחורים', messages: [
      { from: 'מאיה', time: '21:10', text: 'אני בדרך, 5 דקות' },
      { from: 'אורי', time: '21:50', text: 'היא אמרה 5 דקות לפני 40 דקות' },
      { from: 'דניאל', time: '21:51', text: 'אצל מאיה דקה זאת יחידה של רגש, לא של זמן', answer: true },
      { from: 'נועה', time: '21:51', text: 'חחחחחחחחחחח', reaction: true }, { from: 'תומר', time: '21:52', text: '😂😂😂', reaction: true }] },
    { date: '21/08/2025', category: '🔥 עקיצות', messages: [
      { from: 'נועה', time: '17:30', text: 'מי בא לים מחר?' },
      { from: 'תומר', time: '17:41', text: 'תלוי במזג האוויר' },
      { from: 'אורי', time: '17:41', text: 'תומר בודק תחזית כדי למצוא סיבה לא לבוא', answer: true },
      { from: 'מאיה', time: '17:42', text: 'חחחחחחחח', reaction: true }, { from: 'דניאל', time: '17:42', text: '1', reaction: true }] },
    { date: '10/11/2025', category: '🎭 דרמה', messages: [
      { from: 'מאיה', time: '08:15', text: 'עדכון: השכן שוב מתאמן על החצוצרה', answer: true },
      { from: 'מאיה', time: '08:15', text: 'הוא כבר יודע שני תווים. שניהם לא נכונים', answer: true },
      { from: 'נועה', time: '08:20', text: 'חחחחחחחחחחחח', reaction: true }, { from: 'דניאל', time: '08:21', text: 'אני מת', reaction: true }] },
    { date: '02/01/2026', category: '💪 חדר כושר', messages: [
      { from: 'דניאל', time: '20:05', text: 'נרשמתי לחדר כושר' },
      { from: 'אורי', time: '20:06', text: 'מזל טוב! כמה פעמים היית?' },
      { from: 'דניאל', time: '20:07', text: 'מבחינה טכנית הייתי שם כשנרשמתי', answer: true },
      { from: 'תומר', time: '20:07', text: 'חחחחחחחחחחחח', reaction: true }] },
    { date: '17/03/2026', category: '🍞 בישולים', note: 'רקע: תומר אפה לחם בפעם הראשונה', messages: [
      { from: 'תומר', time: '13:20', text: '📷 תמונה\nהלחם שלי יצא' },
      { from: 'נועה', time: '13:21', text: 'יצא מה' },
      { from: 'מאיה', time: '13:21', text: 'יצא מהתנור. זה כל מה שאפשר להגיד עליו', answer: true },
      { from: 'אורי', time: '13:22', text: 'חחחחחחחחחחח', reaction: true }, { from: 'דניאל', time: '13:22', text: '💀', reaction: true }] }
  ] };
const SAMPLE_EN = { title: 'The flat (sample)', group: 'The flat', me: 'Priya',
  participants: [{ name: 'Jess' }, { name: 'Tom' }, { name: 'Priya' }, { name: 'Dan' }, { name: 'Leo' }],
  questions: [
    { date: '14/02/2025', category: '🍽️ food', messages: [
      { from: 'Tom', time: '19:02', text: 'does anyone know what to do with 3 kilos of hummus' },
      { from: 'Dan', time: '19:03', text: 'why do you have 3 kilos of hummus' },
      { from: 'Tom', time: '19:03', text: 'I pressed + one time too many' },
      { from: 'Jess', time: '19:04', text: 'open a restaurant. call it "one time too many"', answer: true },
      { from: 'Priya', time: '19:04', text: 'hahahahaha', reaction: true }, { from: 'Leo', time: '19:05', text: '💀', reaction: true }] },
    { date: '03/06/2025', category: '⏰ always late', messages: [
      { from: 'Priya', time: '21:10', text: 'on my way, 5 min' },
      { from: 'Leo', time: '21:50', text: 'she said 5 min 40 min ago' },
      { from: 'Dan', time: '21:51', text: 'Priya minutes are a unit of emotion, not time', answer: true },
      { from: 'Jess', time: '21:51', text: '😂😂😂', reaction: true }, { from: 'Tom', time: '21:52', text: 'lmaooo', reaction: true }] },
    { date: '21/08/2025', category: '🔥 roasts', messages: [
      { from: 'Jess', time: '17:30', text: 'beach tomorrow?' },
      { from: 'Tom', time: '17:41', text: 'depends on the weather' },
      { from: 'Leo', time: '17:41', text: 'Tom checks the forecast to find a reason not to come', answer: true },
      { from: 'Priya', time: '17:42', text: 'hahahaha', reaction: true }, { from: 'Dan', time: '17:42', text: '#1', reaction: true }] },
    { date: '10/11/2025', category: '🎭 drama', messages: [
      { from: 'Priya', time: '08:15', text: 'update: the neighbour is practising the trumpet again', answer: true },
      { from: 'Priya', time: '08:15', text: 'he knows two notes now. both wrong', answer: true },
      { from: 'Jess', time: '08:20', text: 'hahahahahaha', reaction: true }, { from: 'Dan', time: '08:21', text: 'I’m dead', reaction: true }] },
    { date: '02/01/2026', category: '💪 gym', messages: [
      { from: 'Dan', time: '20:05', text: 'I joined a gym' },
      { from: 'Leo', time: '20:06', text: 'congrats! how many times have you been?' },
      { from: 'Dan', time: '20:07', text: 'technically I was there when I signed up', answer: true },
      { from: 'Tom', time: '20:07', text: 'hahahahahahaha', reaction: true }] },
    { date: '17/03/2026', category: '🍞 baking', note: 'Context: Tom baked bread for the first time', messages: [
      { from: 'Tom', time: '13:20', text: '📷 Photo\nmy bread came out' },
      { from: 'Jess', time: '13:21', text: 'came out how' },
      { from: 'Priya', time: '13:21', text: 'came out of the oven. that’s all we can say about it', answer: true },
      { from: 'Leo', time: '13:22', text: 'hahahahaha', reaction: true }, { from: 'Dan', time: '13:22', text: '💀', reaction: true }] }
  ] };

/* =========================================================
   start
   ========================================================= */
function showRejoinBanner() {
  const s = savedSession();
  $('rejoinBox').hidden = !s;
  if (s) $('rejoinBtn').textContent = t('backToRoom', { c: s.code, n: s.name });
}
(function init() {
  try { history.replaceState({ screen: 'home' }, '', location.pathname + location.search); } catch (e) {}
  applyLang();
  showRejoinBanner();
  setTimeout(() => $('logo').classList.add('open'), 700);
  const drop = $('drop'), input = $('fileInput');
  input.addEventListener('change', () => { readFile(input.files[0]); input.value = ''; });
  $('picInput').addEventListener('change', e => { readPic(e.target.files[0]); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => readFile(e.dataTransfer.files[0]));
  const pre = new URLSearchParams(location.search).get('join');
  if (pre && /^\d{4}$/.test(pre)) { show('join'); $('codeInput').value = pre; $('nameInput').focus(); }
})();
