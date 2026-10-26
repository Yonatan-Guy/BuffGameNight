'use strict';
/* =========================================================
   Create a game from a WhatsApp export, entirely in this browser.
   Steps: who it's for → the chat → the people → what counts as a laugh →
   how many to look at → marking each one → done.
   The half-made game is kept in IndexedDB (Store), so a refresh loses nothing.
   ========================================================= */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
let toastTimer = null;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3200); }

/* ---------------- words ---------------- */
const STR = {
  he: {
    title: 'מי שלח? יצירת משחק', toGame: '→ למשחק', langSwitch: 'English', skinTitle: 'סגנון', skinArcade: 'בהיר', skinDark: 'כהה',
    steps: ['למי', 'הצ\'אט', 'מי בקבוצה', 'מה מצחיק', 'כמה', 'סימון', 'סיום'],
    next: 'הבא', back: 'חזרה', resumeQ: 'יש משחק שהתחלתם להכין ({f}). להמשיך מאיפה שעצרתם?', resume: 'להמשיך', startOver: 'להתחיל מחדש',
    whoH: 'למי המשחק?', whoSub: 'זה משנה רק את ברירות המחדל: מילות הצחוק, הקטגוריות והאם לדלג על בדיחות עם קללות. אפשר לשנות הכל אחר כך.',
    friends: 'חברים', friendsSub: 'החבורה, הצבא, העבודה. עקיצות וקללות זה חלק מהכיף.', family: 'משפחה', familySub: 'קבוצת המשפחה. בלי קללות, עם 😂 ו"מתה מצחוק".',
    privacyH: 'הכל קורה בדפדפן הזה', privacy: 'הצ\'אט, התמונות והמשחק נשמרים רק במחשב הזה (בדפדפן). שום דבר לא עולה לשרת, וגם אנחנו לא רואים כלום.',
    upH: 'מייצאים את הצ\'אט מוואטסאפ', upDrop: 'גררו לכאן את קובץ הצ\'אט', upDropSub: 'קובץ ה־zip שוואטסאפ יוצר (מומלץ, עם התמונות) או _chat.txt',
    upHow: 'איך מייצאים?', iphone: 'אייפון', android: 'אנדרואיד',
    iphoneSteps: ['פותחים את הקבוצה בוואטסאפ ולוחצים על שם הקבוצה למעלה', 'גוללים למטה ובוחרים "ייצוא צ\'אט"', 'בוחרים "צרף מדיה" אם רוצים תמונות וסרטונים במשחק (מומלץ)', 'שולחים את הקובץ לעצמכם (מייל, וואטסאפ לעצמכם, דרייב) ומורידים אותו למחשב'],
    androidSteps: ['פותחים את הקבוצה בוואטסאפ ולוחצים על ⋮ למעלה', 'עוד ← ייצוא צ\'אט', 'בוחרים "כולל מדיה" אם רוצים תמונות (מומלץ)', 'שולחים את הקובץ לעצמכם ומורידים אותו למחשב'],
    upTip: 'קבוצה גדולה עם הרבה מדיה? וואטסאפ מגביל את הייצוא. אפשר לייצא בלי מדיה ולגרור תמונות אחת־אחת בשלב הסימון.',
    reading: 'קוראים את הצ\'אט…', badFile: 'לא מצאנו בקובץ צ\'אט של וואטסאפ. ודאו שזה ה־zip או ה־txt שוואטסאפ יצר.',
    gotChat: '{n} הודעות · {p} אנשים · {a} עד {b}', gotMedia: '{n} תמונות, סרטונים והקלטות בקובץ', noMedia: 'בלי מדיה בקובץ: את התמונות אפשר להוסיף אחר כך',
    peopleH: 'מי בקבוצה?', peopleSub: 'השמות כמו שיופיעו במשחק. לחצו על העיגול כדי להוסיף תמונת פרופיל: ככה תדעו מי זה בחשיפה, והתמונות ייפלו ברקע.',
    msgsN: '{n} הודעות', include: 'במשחק', me: 'זה אני', meHint: '"זה אני" = מי שייצא את הצ\'אט. ההודעות שלו יופיעו בצד ירוק, כמו בוואטסאפ שלו.',
    groupName: 'שם הקבוצה', groupPic: 'תמונת הקבוצה', fewMsgs: 'עם פחות מ־20 הודעות כדאי להוציא מהמשחק',
    laughH: 'מה נחשב צחוק אצלכם?', laughSub: 'אנחנו מוצאים בדיחות לפי ההודעות שאחרים שלחו אחריהן. סמנו מה אצלכם אומר "זה מצחיק".',
    laughBase: 'צחוק רגיל', laughFound: 'מצאנו אצלכם (מופיעים כשעוד מישהו צוחק)', laughAdd: 'מילה משלכם', add: 'להוסיף',
    curse: 'לדלג על בדיחות עם קללות', ranks: 'לספור דירוגים כמו "1", "#3", "8/10"',
    foundN: 'מצאנו {n} בדיחות', foundBy: 'לכל אחד:',
    countH: 'כמה בדיחות לעבור עליהן?', countSub: 'מצאנו {n}. בשלב הבא עוברים עליהן אחת־אחת ומסמנים מצחיק / בינוני / לא. משחק טוב צריך 20–30, אז כדאי לעבור על פי 4.',
    perPerson: 'בערך {n} לכל אחד, מהכי מצחיקות שלו', minutes: 'כ־{m} דקות של סימון', startReview: 'להתחיל לסמן',
    revH: 'סימון', revSub: 'לחיצה על הודעה פותחת אפשרויות · לחיצה על אדם מסננת · הכל נשמר לבד',
    show: 'הצג', todo: 'עוד לא סימנתי', all: 'הכל', funny: '😂 מצחיק', meh: '😐 בינוני', no: '👎 לא מצחיק', onlyMedia: 'רק עם תמונה / סרטון / הקלטה',
    goal: 'מטרה: 20–30 מצחיקות, בערך 4–5 לכל אחד', marked: 'סימנתם {r} מתוך {n}', moreUp: '⬆ עוד הקשר מלמעלה', moreDown: '⬇ עוד הודעות אחרי',
    laughed: 'צחקו', toGuess: 'ההודעה לנחש', noAnswer: 'לא נבחרה הודעה לנחש', msgN: 'הודעה', msgsWord: 'הודעות', laughsAtReveal: 'צחוקים בחשיפה',
    tAnswer: '🎯 זו ההודעה לנחש', tUnanswer: '🎯 לא לנחש', tLaugh: '😂 צחוק (בחשיפה)', tUnlaugh: '😂 לא צחוק', tReply: '↩ היא תגובה ל…', tUnreply: '↩ להוריד ציטוט',
    tHide: '✂ להסתיר מהמשחק', tShow: '👁 להחזיר', pickReply: 'לחצו על ההודעה שעליה ענו', cancel: 'ביטול',
    note: 'הסבר קצר מעל הצ\'אט (לא חובה)', category: 'קטגוריה (לא חובה)', sameConvo: 'אותה שיחה כמו בדיחה קודמת',
    mediaDrop: 'גררו לכאן או <u>לחצו</u> כדי להוסיף', replace: 'להחליף', zipAgain: 'כדי להחזיר את התמונות מה־zip, גררו אותו שוב לשלב "הצ\'אט".',
    more: 'עוד {n}', doneReview: 'סיימתי, לסיכום', hidden: 'מוסתר', inReveal: 'בחשיפה',
    finH: 'סיכום', finSub: 'כמה יש לכל אחד. אפשר לחזור לסמן עוד, או ליצור את המשחק.', withMeh: 'להוסיף גם את הבינוניות', gameTitle: 'שם המשחק',
    create: 'ליצור את המשחק 🎉', creating: 'שומרים…', tooFew: 'סמנו לפחות 5 בדיחות כמצחיקות',
    lowWarn: 'ל{p} יש מעט. נסו לסנן לפי השם שלו בשלב הסימון.', mediaMissing: '{n} תמונות/סרטונים חסרים: הם יופיעו במשחק כ"📷 תמונה"',
    where: 'איפה זה נשמר?', whereTxt: 'המשחק, התמונות והטיוטה נשמרים בדפדפן הזה בלבד. בדפדפן אחר או במחשב אחר הם לא יופיעו. כדי להעביר: בעמוד המשחק לוחצים "שמירה לקובץ" ופותחים את הקובץ במחשב השני. ניקוי נתוני גלישה מוחק אותם.',
    family: 'משפחה'
  },
  en: {
    title: 'Who sent it? Make a game', toGame: '← To the game', langSwitch: 'עברית', skinTitle: 'Look', skinArcade: 'Light', skinDark: 'Dark',
    steps: ['For whom', 'The chat', 'People', 'What\'s funny', 'How many', 'Marking', 'Done'],
    next: 'Next', back: 'Back', resumeQ: 'You started making a game ({f}). Pick up where you left off?', resume: 'Continue', startOver: 'Start over',
    whoH: 'Who is the game for?', whoSub: 'This only sets defaults: the laugh words, the categories and whether to skip jokes with swearing. You can change it all later.',
    friends: 'Friends', friendsSub: 'The gang, the army, work. Roasts and swearing are part of the fun.', family: 'Family', familySub: 'The family group. No swearing, plenty of 😂.',
    privacyH: 'It all happens in this browser', privacy: 'The chat, the photos and the game are kept only on this computer (in the browser). Nothing is uploaded, and nobody else sees anything.',
    upH: 'Export the chat from WhatsApp', upDrop: 'Drop the chat file here', upDropSub: 'the zip WhatsApp makes (best, with photos) or _chat.txt',
    upHow: 'How do I export?', iphone: 'iPhone', android: 'Android',
    iphoneSteps: ['Open the group in WhatsApp and tap its name at the top', 'Scroll down and choose "Export Chat"', 'Choose "Attach Media" to get photos and videos into the game (best)', 'Send the file to yourself (email, WhatsApp, Drive) and download it to this computer'],
    androidSteps: ['Open the group in WhatsApp and tap ⋮ at the top', 'More → Export chat', 'Choose "Include media" to get photos (best)', 'Send the file to yourself and download it to this computer'],
    upTip: 'Big group with lots of media? WhatsApp limits the export. Export without media and drop photos one by one while marking.',
    reading: 'Reading the chat…', badFile: 'No WhatsApp chat found in that file. Use the zip or txt that WhatsApp made.',
    gotChat: '{n} messages · {p} people · {a} to {b}', gotMedia: '{n} photos, videos and voice notes in the file', noMedia: 'No media in the file: photos can be added later',
    peopleH: 'Who is in the group?', peopleSub: 'Names as they will show in the game. Tap the circle to add a profile picture: it shows at the reveal, and the faces drift in the background.',
    msgsN: '{n} messages', include: 'In the game', me: 'That\'s me', meHint: '"That\'s me" = whoever exported the chat. Their messages show on the green side, like in their own WhatsApp.',
    groupName: 'Group name', groupPic: 'Group picture', fewMsgs: 'Under 20 messages: better left out',
    laughH: 'What counts as a laugh in your group?', laughSub: 'We find jokes by what others sent right after them. Tick what says "that\'s funny" in your group.',
    laughBase: 'Everyday laughs', laughFound: 'Found in your chat (others laugh at the same moment)', laughAdd: 'Your own word', add: 'Add',
    curse: 'Skip jokes with swearing', ranks: 'Count ratings like "1", "#3", "8/10"',
    foundN: 'Found {n} jokes', foundBy: 'Per person:',
    countH: 'How many jokes to look through?', countSub: 'We found {n}. Next you go through them one by one: funny / so-so / not. A good game needs 20–30, so look at about 4 times that.',
    perPerson: 'About {n} each, from their funniest', minutes: 'about {m} minutes of marking', startReview: 'Start marking',
    revH: 'Marking', revSub: 'Tap a message for options · tap a person to filter · everything saves by itself',
    show: 'Show', todo: 'Not marked yet', all: 'All', funny: '😂 Funny', meh: '😐 So-so', no: '👎 Not funny', onlyMedia: 'Only with photo / video / voice',
    goal: 'Goal: 20–30 funny ones, about 4–5 each', marked: 'Marked {r} of {n}', moreUp: '⬆ More context above', moreDown: '⬇ More messages after',
    laughed: 'Laughed', toGuess: 'Message to guess', noAnswer: 'No message chosen to guess', msgN: 'message', msgsWord: 'messages', laughsAtReveal: 'laughs at the reveal',
    tAnswer: '🎯 This is the one to guess', tUnanswer: '🎯 Not this one', tLaugh: '😂 A laugh (at the reveal)', tUnlaugh: '😂 Not a laugh', tReply: '↩ It replies to…', tUnreply: '↩ Remove quote',
    tHide: '✂ Leave out of the game', tShow: '👁 Put back', pickReply: 'Tap the message it replies to', cancel: 'Cancel',
    note: 'Short note above the chat (optional)', category: 'Category (optional)', sameConvo: 'Same conversation as an earlier joke',
    mediaDrop: 'Drop here or <u>click</u> to add', replace: 'Replace', zipAgain: 'To bring back the photos from the zip, drop it again on the "The chat" step.',
    more: '{n} more', doneReview: 'Done, show the summary', hidden: 'left out', inReveal: 'at reveal',
    finH: 'Summary', finSub: 'How many each person has. Go back to mark more, or make the game.', withMeh: 'Include the so-so ones too', gameTitle: 'Game name',
    create: 'Make the game 🎉', creating: 'Saving…', tooFew: 'Mark at least 5 jokes as funny',
    lowWarn: '{p} has few. Filter by their name while marking.', mediaMissing: '{n} photos/videos missing: they will show as "📷 Photo"',
    where: 'Where is it saved?', whereTxt: 'The game, the photos and the draft live in this browser only. Another browser or computer won\'t see them. To move a game: on the game page press "Save to file" and open that file on the other computer. Clearing browsing data deletes them.',
    family: 'Family'
  }
};
let LANG = lsGet('wst.lang') || ((navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en');
if (!STR[LANG]) LANG = 'he';
const t = (k, v) => { let s = STR[LANG][k] ?? STR.he[k] ?? k; if (v && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m); return s; };

/* ---------------- looks (same slider as the game) ---------------- */
const SKINS = ['arcade', 'dark'];
let SKIN = { night: 'dark', retro: 'arcade' }[lsGet('wst.skin')] || lsGet('wst.skin');
if (!SKINS.includes(SKIN)) SKIN = 'arcade';
function setSkin(sk) { SKIN = sk; document.documentElement.dataset.skin = sk; renderSkinSliders(SKINS, sk, k => t('skin' + k[0].toUpperCase() + k.slice(1))); }
function pickSkin(sk) { setSkin(sk); lsSet('wst.skin', sk); }
function toggleLang() { LANG = LANG === 'he' ? 'en' : 'he'; lsSet('wst.lang', LANG); applyLang(); }
function applyLang() {
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.title = t('title'); $('langBtn').textContent = t('langSwitch');
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  setSkin(SKIN); render();
}

/* ---------------- presets ---------------- */
const PALETTE = ['#53bdeb', '#ffbc38', '#06cf9c', '#fc9775', '#e542a3', '#a5b337', '#9b8cff', '#ff7a59', '#00a5f4', '#d3b56b', '#25d366', '#ff5d8f'];
const PRESET = {
  friends: { words: [...new Set([...Chat.BASE.he, ...Chat.BASE.en])], curse: false,
    cats: ['🔥 עקיצות', '🍺 יציאות ושתייה', '💸 כסף וקמצנות', '💘 דייטים', '🎖️ צבא ועבודה', '⏰ איחורים והברזות', '🎭 דרמה והגזמות', '🔞 גבולי'] },
  family: { words: [...new Set([...Chat.BASE.he, ...Chat.BASE.en, '😅', '😆', '🤭', 'מתה', 'צוחקת', 'קורעת', 'קרעת אותי', 'הצחקת אותי', 'איזה מצחיק', 'מתה מצחוק'])], curse: true,
    cats: ['🍲 אוכל', '🎉 אירועים וחגים', '👵 סבא וסבתא', '📸 תמונות', '🤦 פדיחות', '💬 ציטוטים', '✈️ טיולים', '📱 טכנולוגיה'] }
};

/* ---------------- state ---------------- */
const S = { step: 0, audience: '', fileName: '', chatText: '', people: {}, me: '', group: '', groupPic: '',
            words: [], curse: false, ranks: true, reviewCount: 0, dec: {}, uploads: {}, includeMeh: false, title: '', reviewIds: [] };
let P = null;          // the parsed chat: { msgs, group }
let ZIP = new Map();   // file name in the zip → JSZip entry (kept in memory only)
let CANDS = [];        // jokes found with the current laugh words
let VIEW = [];         // P.msgs with display names
const urls = new Map();   // media blob URLs already made
let filters = { status: 'todo', person: '', media: false }, shown = 15, sel = null, pick = null;

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { Store.put('drafts', 'current', JSON.parse(JSON.stringify(S))).catch(() => {}); }, 400);
}

/* ---------------- the chat ---------------- */
function rebuildView() {
  if (!P) return;
  VIEW = P.msgs.map(m => ({ ...m, raw: m.who, who: (S.people[m.who] && S.people[m.who].name) || m.who }));
}
function included(raw) { const p = S.people[raw]; return p && p.include; }
function findJokes() {
  if (!P) { CANDS = []; return; }
  const words = S.words.slice();
  const isLaugh = Chat.makeLaughTest(words, { ranks: S.ranks });
  const curse = new RegExp(Chat.CURSE.source, 'i');
  CANDS = Chat.candidates(P.msgs, isLaugh).filter(c => included(c.sender) && !(S.curse && c.answer.some(k => curse.test(P.msgs[k].body))));
}
async function readChatFile(file) {
  const st = $('upMsg'); if (st) { st.className = 'msg'; st.textContent = t('reading'); }
  try {
    let text = '', zipMap = new Map();
    if (/\.zip$/i.test(file.name) || file.type.includes('zip')) {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter(f => !f.dir);
      const txt = entries.find(f => /(^|\/)_?chat\.txt$/i.test(f.name)) || entries.find(f => /\.txt$/i.test(f.name));
      if (!txt) throw new Error('no txt');
      text = await txt.async('string');
      entries.forEach(f => { if (f !== txt) zipMap.set(f.name.split('/').pop(), f); });
    } else text = await file.text();
    const parsed = Chat.parse(text, LANG);
    if (!parsed || parsed.msgs.filter(m => !m.system).length < 10) throw new Error('not a chat');
    const sameChat = S.chatText && S.chatText.length === text.length && S.chatText.slice(0, 2000) === text.slice(0, 2000);
    ZIP = zipMap; P = parsed;
    if (!sameChat) {   // a new chat: fresh people, keep the audience
      Object.assign(S, { fileName: file.name, chatText: text, people: {}, me: '', group: parsed.group || '', groupPic: '', dec: {}, uploads: {}, reviewIds: [], reviewCount: 0, title: parsed.group || '' });
      const counts = {}; parsed.msgs.forEach(m => { if (!m.system) counts[m.who] = (counts[m.who] || 0) + 1; });
      Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach((w, i) => {
        S.people[w] = { name: w.replace(/[^\p{L}\p{N} '"-]/gu, '').trim().split(/\s+/)[0] || w, color: PALETTE[i % PALETTE.length], include: counts[w] >= 20, pic: '', count: counts[w] };
      });
    }
    rebuildView(); findJokes(); save();
    render();
  } catch (e) {
    console.warn(e);
    if (st) { st.className = 'msg err'; st.textContent = t('badFile'); }
  }
}

/* ---------------- pictures ---------------- */
function squarePic(file, size = 192) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const m = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
    img.src = url;
  });
}
function rainNow() { FaceRain.setFaces([S.groupPic, ...Object.values(S.people).filter(p => p.include).map(p => p.pic)]); }
let fileTarget = null;
function pickFile(accept, target) { fileTarget = target; const i = $('fileIn'); i.accept = accept; i.value = ''; i.click(); }
$('fileIn').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f || !fileTarget) return;
  await useFile(f, fileTarget);
});
async function useFile(f, target) {
  if (target.kind === 'chat') return readChatFile(f);
  if (target.kind === 'pic') {
    try {
      const d = await squarePic(f);
      if (target.who === '__group__') S.groupPic = d; else S.people[target.who].pic = d;
      save(); rainNow(); render();
    } catch (e) { toast('🙁'); }
  }
  if (target.kind === 'media') {
    const key = `draft/${target.i}`;
    await Store.put('media', key, f);
    S.uploads[target.i] = { key, name: f.name, type: f.type };
    urls.delete('u' + target.i);
    save(); rerenderCard(target.card);
  }
}

/* ---------------- media for a message ---------------- */
async function mediaUrl(m) {
  const up = S.uploads[m.i];
  if (up) {
    if (!urls.has('u' + m.i)) { const b = await Store.get('media', up.key); if (b) urls.set('u' + m.i, { url: URL.createObjectURL(b), name: up.name }); }
    return urls.get('u' + m.i) || null;
  }
  if (m.media && m.media.file && ZIP.has(m.media.file)) {
    if (!urls.has('z' + m.i)) { const b = await ZIP.get(m.media.file).async('blob'); urls.set('z' + m.i, { url: URL.createObjectURL(b), name: m.media.file }); }
    return urls.get('z' + m.i);
  }
  return null;
}
const isVideo = n => /\.(mp4|mov|webm|m4v|3gp)$/i.test(n), isAudio = n => /\.(opus|ogg|m4a|mp3|aac|wav)$/i.test(n);
function mediaTag(u) {
  if (isVideo(u.name)) return `<video class="phimg" src="${u.url}" controls playsinline preload="metadata"></video>`;
  if (isAudio(u.name)) return `<audio src="${u.url}" controls preload="metadata"></audio>`;
  return `<img class="phimg" src="${u.url}" alt="">`;
}

/* ---------------- choosing what to review ---------------- */
/* the best few per person, interleaved, skipping a second joke from the same conversation */
function chooseForReview(n) {
  const people = Object.keys(S.people).filter(included);
  const by = {}; people.forEach(p => { by[p] = []; });
  const taken = [];
  for (const c of CANDS) {
    const [lo, hi] = Chat.windowOf(P.msgs, c.start, c.end);
    if (taken.some(([a, b]) => c.start >= a && c.start <= b)) continue;
    by[c.sender].push(c); taken.push([lo, hi]);
  }
  const out = [], q = people.map(p => by[p]);
  while (out.length < n && q.some(x => x.length)) for (const x of q) if (x.length && out.length < n) out.push(x.shift());
  return out.map(c => c.start);
}
function itemFor(start) { return CANDS.find(c => c.start === start) || null; }
function decOf(start) {
  if (!S.dec[start]) {
    const c = itemFor(start); if (!c) return null;
    const [lo, hi] = Chat.windowOf(P.msgs, c.start, c.end);
    S.dec[start] = { rating: '', answer: c.answer.slice(), reactions: c.reactions.slice(), hidden: [], replies: {}, lo, hi, note: '', category: '' };
  }
  return S.dec[start];
}
function senderOf(d) { const k = d.answer[0]; return k === undefined ? '' : VIEW[k].who; }

/* ---------------- rendering ---------------- */
function render() {
  $('steps').innerHTML = t('steps').map((s, i) => `<li class="${i === S.step ? 'on' : i < S.step ? 'done' : ''}"><button ${i <= maxStep() ? '' : 'disabled'} data-go="${i}"><b>${i + 1}</b><span>${esc(s)}</span></button></li>`).join('');
  const st = $('stage');
  st.innerHTML = [stepWho, stepUpload, stepPeople, stepLaughs, stepCount, stepReview, stepFinish][S.step]();
  st.classList.toggle('wide', S.step === 5);
  if (S.step === 5) renderCards();
}
function maxStep() {
  if (!S.audience) return 0;
  if (!P) return 1;
  if (!S.reviewIds.length) return 4;
  return 6;
}
const nav = (back, next, nextLabel) => `<div class="wizNav">${back ? `<button class="btn ghost" data-go="${S.step - 1}">${esc(t('back'))}</button>` : '<span></span>'}
  ${next ? `<button class="btn big" data-primary data-go="${S.step + 1}" ${next === 'off' ? 'disabled' : ''}>${esc(nextLabel || t('next'))}</button>` : ''}</div>`;

function stepWho() {
  return `<h1>${esc(t('whoH'))}</h1><p class="lede">${esc(t('whoSub'))}</p>
    <div class="tiles">
      <button class="tile${S.audience === 'friends' ? ' primary' : ''}" data-aud="friends"><span class="em">🍻</span><span class="tt"><b>${esc(t('friends'))}</b><span>${esc(t('friendsSub'))}</span></span></button>
      <button class="tile${S.audience === 'family' ? ' primary' : ''}" data-aud="family"><span class="em">👨‍👩‍👧‍👦</span><span class="tt"><b>${esc(t('family'))}</b><span>${esc(t('familySub'))}</span></span></button>
    </div>
    <div class="note panel"><b>🔒 ${esc(t('privacyH'))}</b><p>${esc(t('privacy'))}</p></div>
    ${nav(false, S.audience ? 'on' : 'off')}`;
}
function stepUpload() {
  const got = P ? (() => {
    const real = P.msgs.filter(m => !m.system), media = real.filter(m => m.media && m.media.file && ZIP.has(m.media.file)).length;
    return `<div class="got panel"><b>✅ ${esc(S.fileName)}</b><span>${esc(t('gotChat', { n: real.length.toLocaleString(), p: Object.keys(S.people).length, a: real[0].date, b: real[real.length - 1].date }))}</span>
      <span>${esc(media ? t('gotMedia', { n: media }) : t('noMedia'))}</span></div>`;
  })() : '';
  const steps = arr => `<ol>${t(arr).map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  return `<h1>${esc(t('upH'))}</h1>
    <label class="drop big" id="chatDrop" data-drop="chat"><strong>${esc(t('upDrop'))}</strong><span class="muted">${esc(t('upDropSub'))}</span></label>
    <div id="upMsg" class="msg" role="status"></div>${got}
    ${P && S.chatText && !ZIP.size && Object.keys(S.uploads).length === 0 && /\.zip$/i.test(S.fileName) ? `<p class="hint">${esc(t('zipAgain'))}</p>` : ''}
    <details class="how panel" ${P ? '' : 'open'}><summary>${esc(t('upHow'))}</summary>
      <div class="howGrid"><div><h3>📱 ${esc(t('iphone'))}</h3>${steps('iphoneSteps')}</div><div><h3>🤖 ${esc(t('android'))}</h3>${steps('androidSteps')}</div></div>
      <p class="hint">💡 ${esc(t('upTip'))}</p></details>
    ${nav(true, P ? 'on' : 'off')}`;
}
function stepPeople() {
  const rows = Object.entries(S.people).map(([raw, p]) => `<div class="person${p.include ? '' : ' off'}">
      <button class="avBtn" data-pic="${esc(raw)}" style="--c:${p.color}" title="${esc(t('groupPic'))}">${p.pic ? `<img src="${p.pic}" alt="">` : `<span>${esc((p.name || '?')[0])}</span>`}<i>+</i></button>
      <input class="txt" data-name="${esc(raw)}" value="${esc(p.name)}" maxlength="24" dir="auto">
      <span class="muted small" dir="auto" title="${esc(raw)}">${esc(raw)} · ${esc(t('msgsN', { n: p.count }))}</span>
      <label class="chk"><input type="checkbox" data-inc="${esc(raw)}" ${p.include ? 'checked' : ''}> ${esc(t('include'))}</label>
      <label class="chk"><input type="radio" name="me" data-me="${esc(raw)}" ${S.me === raw ? 'checked' : ''}> ${esc(t('me'))}</label>
      ${p.count < 20 ? `<span class="hint small">${esc(t('fewMsgs'))}</span>` : ''}</div>`).join('');
  return `<h1>${esc(t('peopleH'))}</h1><p class="lede">${esc(t('peopleSub'))}</p>
    <div class="person group"><button class="avBtn" data-pic="__group__" style="--c:#0b63f6">${S.groupPic ? `<img src="${S.groupPic}" alt="">` : '<span>👥</span>'}<i>+</i></button>
      <input class="txt" id="groupName" value="${esc(S.group)}" placeholder="${esc(t('groupName'))}" maxlength="40" dir="auto"><span class="muted small">${esc(t('groupName'))}</span></div>
    <div class="people">${rows}</div><p class="hint">${esc(t('meHint'))}</p>
    ${nav(true, 'on')}`;
}
let LAUGH_STATS = null;
function stepLaughs() {
  if (!LAUGH_STATS) {
    const base = PRESET[S.audience || 'friends'].words;
    const found = Chat.discoverLaughs(P.msgs, base);
    LAUGH_STATS = { found: found.filter(f => !f.known) };
  }
  const people = Object.keys(S.people).filter(included);
  const by = {}; CANDS.forEach(c => { by[c.sender] = (by[c.sender] || 0) + 1; });
  const chip = (w, extra = '') => `<label class="wchip${S.words.includes(w) ? ' on' : ''}"><input type="checkbox" data-word="${esc(w)}" ${S.words.includes(w) ? 'checked' : ''}><span dir="auto">${esc(w)}</span>${extra}</label>`;
  const base = PRESET[S.audience || 'friends'].words;
  const custom = S.words.filter(w => !base.includes(w) && !LAUGH_STATS.found.some(f => f.word === Chat.norm(w) || f.example === w));
  return `<h1>${esc(t('laughH'))}</h1><p class="lede">${esc(t('laughSub'))}</p>
    <div class="panel wbox"><h3>${esc(t('laughBase'))}</h3><div class="wchips">${base.map(w => chip(w)).join('')}${custom.map(w => chip(w)).join('')}</div>
      ${LAUGH_STATS.found.length ? `<h3>${esc(t('laughFound'))}</h3><div class="wchips">${LAUGH_STATS.found.map(f => chip(f.example, `<small>${f.count}</small>`)).join('')}</div>` : ''}
      <form class="addWord" id="addWord"><input class="txt" id="newWord" placeholder="${esc(t('laughAdd'))}" maxlength="24" dir="auto"><button class="btn small">${esc(t('add'))}</button></form>
      <label class="chk"><input type="checkbox" id="curse" ${S.curse ? 'checked' : ''}> ${esc(t('curse'))}</label>
      <label class="chk"><input type="checkbox" id="ranks" ${S.ranks ? 'checked' : ''}> ${esc(t('ranks'))}</label></div>
    <div class="found panel"><b class="bigN">${esc(t('foundN', { n: CANDS.length }))}</b>
      <div class="perP">${people.map(p => `<span style="--c:${S.people[p].color}"><i></i>${esc(S.people[p].name)} <b>${by[p] || 0}</b></span>`).join('')}</div></div>
    ${nav(true, CANDS.length ? 'on' : 'off')}`;
}
function stepCount() {
  const n = CANDS.length, people = Object.keys(S.people).filter(included).length || 1;
  if (!S.reviewCount) S.reviewCount = Math.min(n, Math.max(24, people * 20));
  const v = Math.min(S.reviewCount, n);
  return `<h1>${esc(t('countH'))}</h1><p class="lede">${esc(t('countSub', { n }))}</p>
    <div class="panel countBox"><input type="range" id="count" min="${Math.min(12, n)}" max="${Math.min(n, 400)}" step="1" value="${v}">
      <b class="bigN" id="countN">${v}</b><span id="countSub">${esc(t('perPerson', { n: Math.round(v / people) }))} · ${esc(t('minutes', { m: Math.max(5, Math.round(v / 4)) }))}</span></div>
    ${nav(true, 'on', t('startReview'))}`;
}
function stepReview() {
  const people = Object.keys(S.people).filter(included);
  return `<div class="revTop panel" id="revTop"></div>
    <div class="revFilters"><label>${esc(t('show'))} <select id="fStatus">${['todo', 'all', 'funny', 'meh', 'no'].map(k => `<option value="${k}"${filters.status === k ? ' selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
      <label class="chk"><input type="checkbox" id="fMedia" ${filters.media ? 'checked' : ''}> ${esc(t('onlyMedia'))}</label><span class="hint small">${esc(t('revSub'))}</span></div>
    <div id="cards" class="cards"></div>
    ${nav(true, 'on', t('doneReview'))}`;
}
function renderTop() {
  const box = $('revTop'); if (!box) return;
  const people = Object.keys(S.people).filter(included);
  const c = {}; people.forEach(p => { c[p] = { funny: 0, meh: 0 }; });
  let rated = 0;
  S.reviewIds.forEach(id => { const d = S.dec[id]; if (!d || !d.rating) return; rated++; if (d.rating === 'no') return; const w = d.answer.length ? P.msgs[d.answer[0]].who : ''; if (c[w]) c[w][d.rating]++; });
  const funny = Object.values(c).reduce((s, x) => s + x.funny, 0);
  box.innerHTML = `<div class="revLine"><b>😂 ${funny}</b> · ${esc(t('marked', { r: rated, n: S.reviewIds.length }))} · <span class="hint">${esc(t('goal'))}</span></div>
    <div class="pchips">${people.map(p => `<button class="pchip${filters.person === p ? ' on' : ''}${c[p].funny < 3 ? ' low' : ''}" data-person="${esc(p)}" style="--c:${S.people[p].color}">
      ${S.people[p].pic ? `<img src="${S.people[p].pic}" alt="">` : `<i></i>`}<span>${esc(S.people[p].name)}</span><small>😂 ${c[p].funny} · 😐 ${c[p].meh}</small></button>`).join('')}</div>`;
}
function visibleIds() {
  return S.reviewIds.filter(id => {
    const d = decOf(id); if (!d) return false;
    if (filters.person && P.msgs[d.answer[0] ?? id].who !== filters.person) return false;
    if (filters.media && !P.msgs.slice(d.lo, d.hi + 1).some(m => m.media)) return false;
    if (filters.status === 'todo') return !d.rating;
    if (filters.status === 'all') return true;
    return d.rating === filters.status;
  });
}
function renderCards() {
  renderTop();
  const ids = visibleIds(), box = $('cards');
  box.innerHTML = ids.slice(0, shown).map(cardHtml).join('') + (ids.length > shown ? `<button class="btn pager" data-more>${esc(t('more', { n: Math.min(15, ids.length - shown) }))}</button>` : '');
  fillMedia(box);
}
function rerenderCard(id) {
  const el = document.querySelector(`.card[data-id="${id}"]`); if (!el) return;
  el.outerHTML = cardHtml(+id); fillMedia(document.querySelector(`.card[data-id="${id}"]`)); renderTop();
}
/* media placeholders get their real file once it is read from the zip / storage */
function fillMedia(root) {
  if (!root) return;
  root.querySelectorAll('[data-media]').forEach(async el => {
    const m = VIEW[+el.dataset.media], u = await mediaUrl(m);
    if (u) el.outerHTML = `${mediaTag(u)}<span class="phrow"><button data-upload="${m.i}">${esc(t('replace'))}</button></span>`;
  });
}
const MEDIA_ICON = { image: '📷', video: '🎥', gif: '🎞️', audio: '🎤', sticker: '🏷️', doc: '📎' };
function cardHtml(id) {
  const d = decOf(id), c = itemFor(id); if (!d) return '';
  const ms = VIEW.slice(d.lo, d.hi + 1).filter(m => !m.system);
  let last = null, lastDate = '';
  const rows = ms.map(m => {
    const out = m.raw === S.me, first = m.who !== last; last = m.who;
    const cls = ['m', out ? 'out' : '', first ? 'first' : '', d.answer.includes(m.i) ? 'ans' : '', d.hidden.includes(m.i) ? 'hid' : '', sel && sel.id === id && sel.i === m.i ? 'sel' : ''].join(' ');
    const p = S.people[m.raw] || { color: '#8696a0', pic: '' };
    const rq = d.replies[m.i] != null ? VIEW[d.replies[m.i]] : null;
    const quote = rq ? `<span class="q" style="--qc:${(S.people[rq.raw] || {}).color || '#53bdeb'}"><span class="qn">${esc(rq.who)}</span><span class="qt">${esc(rq.text.slice(0, 90))}</span></span>` : '';
    let body = esc(m.text);
    if (m.media) {
      const cap = m.text.split('\n').slice(0, -1).join('\n');
      body = `<span class="ph" data-media="${m.i}" data-drop-media="${m.i}"><b>${MEDIA_ICON[m.media.kind] || '📎'}</b>${esc(m.date)} ${esc(m.time)}<br>${t('mediaDrop')}</span>${esc(cap)}`;
    }
    const tags = (d.answer.includes(m.i) ? `<span class="tag ans">🎯</span>` : '') + (d.reactions.includes(m.i) ? `<span class="tag rx">😂 ${esc(t('inReveal'))}</span>` : '') + (d.hidden.includes(m.i) ? `<span class="tag hid">${esc(t('hidden'))}</span>` : '');
    const day = m.date !== lastDate ? (lastDate = m.date, `<div class="day">${esc(m.date)}</div>`) : '';
    const tools = sel && sel.id === id && sel.i === m.i ? toolsHtml(d, m) : '';
    return `${day}<div class="${cls}">${out ? '' : `<span class="ava${first ? '' : ' sp'}" style="--c:${p.color}">${p.pic ? `<img src="${p.pic}" alt="">` : ''}</span>`}
      <div class="b" data-msg="${m.i}">${first || out ? `<span class="nm" style="color:${p.color}">${esc(m.who)}</span>` : ''}${quote}<span dir="auto">${body}</span>${tags}<span class="tm">${esc(m.time)}</span></div></div>${tools}`;
  }).join('');
  const who = senderOf(d), r = d.rating, cats = PRESET[S.audience || 'friends'].cats;
  return `<article class="card${r ? ' r-' + r : ''}" data-id="${id}">
    <div class="chead"><b>${esc(c ? c.date : '')}</b><span class="muted">${esc(t('laughed'))}: ${esc(c ? c.laughers.map(x => (S.people[x] || {}).name || x).join(', ') : '')}</span></div>
    ${pick && pick.id === id ? `<div class="pickbar">${esc(t('pickReply'))} <button data-cancel>${esc(t('cancel'))}</button></div>` : ''}
    <div class="wa"><button class="more" data-more-up>${esc(t('moreUp'))}</button>${rows}<button class="more" data-more-down>${esc(t('moreDown'))}</button></div>
    <div class="cfoot">
      <div class="ansline">${who ? `${esc(t('toGuess'))}: <b style="color:${(S.people[P.msgs[d.answer[0]].who] || {}).color}">${esc(who)}</b> (${d.answer.length} ${esc(d.answer.length === 1 ? t('msgN') : t('msgsWord'))})` : `<span class="warn">${esc(t('noAnswer'))}</span>`}${d.reactions.length ? ` · ${d.reactions.length} ${esc(t('laughsAtReveal'))}` : ''}</div>
      <div class="rate"><button class="f${r === 'funny' ? ' on' : ''}" data-rate="funny">${esc(t('funny'))}</button><button class="m2${r === 'meh' ? ' on' : ''}" data-rate="meh">${esc(t('meh'))}</button><button class="x${r === 'no' ? ' on' : ''}" data-rate="no">${esc(t('no'))}</button></div>
      <div class="extra"><input class="txt" data-field="note" value="${esc(d.note)}" placeholder="${esc(t('note'))}" dir="auto">
        <select data-field="category"><option value="">${esc(t('category'))}</option>${cats.map(x => `<option${d.category === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
    </div></article>`;
}
function toolsHtml(d, m) {
  const a = d.answer.includes(m.i), rx = d.reactions.includes(m.i), h = d.hidden.includes(m.i), rp = d.replies[m.i] != null;
  return `<div class="tools"><button data-tool="answer" class="${a ? 'on' : ''}">${esc(t(a ? 'tUnanswer' : 'tAnswer'))}</button>
    <button data-tool="reaction" class="${rx ? 'on' : ''}">${esc(t(rx ? 'tUnlaugh' : 'tLaugh'))}</button>
    <button data-tool="reply" class="${rp ? 'on' : ''}">${esc(t(rp ? 'tUnreply' : 'tReply'))}</button>
    <button data-tool="hide" class="${h ? 'on' : ''}">${esc(t(h ? 'tShow' : 'tHide'))}</button></div>`;
}
function stepFinish() {
  const people = Object.keys(S.people).filter(included);
  const c = {}; people.forEach(p => { c[p] = { funny: 0, meh: 0 }; });
  S.reviewIds.forEach(id => { const d = S.dec[id]; if (!d || !d.answer.length || (d.rating !== 'funny' && d.rating !== 'meh')) return; const w = P.msgs[d.answer[0]].who; if (c[w]) c[w][d.rating]++; });
  const total = Object.values(c).reduce((s, x) => s + x.funny + (S.includeMeh ? x.meh : 0), 0);
  const low = people.filter(p => c[p].funny < 2).map(p => S.people[p].name);
  return `<h1>${esc(t('finH'))}</h1><p class="lede">${esc(t('finSub'))}</p>
    <div class="panel finBox"><div class="perP big">${people.map(p => `<span style="--c:${S.people[p].color}">${S.people[p].pic ? `<img src="${S.people[p].pic}" alt="">` : '<i></i>'}${esc(S.people[p].name)} <b>${c[p].funny}${S.includeMeh && c[p].meh ? ` + ${c[p].meh}` : ''}</b></span>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="withMeh" ${S.includeMeh ? 'checked' : ''}> ${esc(t('withMeh'))}</label>
      <label class="fld">${esc(t('gameTitle'))}<input class="txt" id="gameTitle" value="${esc(S.title || S.group)}" maxlength="60" dir="auto"></label>
      <b class="bigN">${total}</b>
      ${low.length ? `<p class="hint">⚠️ ${esc(t('lowWarn', { p: low.join(', ') }))}</p>` : ''}
      <div id="finMsg" class="msg"></div></div>
    <details class="panel how"><summary>💾 ${esc(t('where'))}</summary><p>${esc(t('whereTxt'))}</p></details>
    <div class="wizNav"><button class="btn ghost" data-go="5">${esc(t('back'))}</button>
      <button class="btn big" data-primary id="createBtn" ${total >= 5 ? '' : 'disabled'}>${esc(t('create'))}</button></div>`;
}

/* ---------------- making the game ---------------- */
async function createGame() {
  const btn = $('createBtn'); btn.disabled = true; btn.textContent = t('creating');
  const gid = 'g' + Date.now().toString(36);
  const ids = S.reviewIds.filter(id => { const d = S.dec[id]; return d && d.answer.length && (d.rating === 'funny' || (S.includeMeh && d.rating === 'meh')); });
  if (ids.length < 5) { toast(t('tooFew')); btn.disabled = false; btn.textContent = t('create'); return; }
  const people = Object.keys(S.people).filter(included);
  const name = raw => S.people[raw] ? S.people[raw].name : raw;
  const questions = [];
  let missing = 0;
  for (const id of ids) {
    const d = S.dec[id], answer = new Set(d.answer), hidden = new Set(d.hidden), max = Math.max(...d.answer);
    const keep = k => !P.msgs[k].system && (P.msgs[k].body || P.msgs[k].media) && (!hidden.has(k) || answer.has(k));
    const body = []; for (let k = d.lo; k <= max; k++) if (keep(k)) body.push(k);
    const rx = d.reactions.filter(k => k > max && keep(k)).sort((a, b) => a - b).slice(0, 3);
    const order = [...body, ...rx], pos = new Map(order.map((k, n) => [k, n]));
    const lines = [];
    for (const k of order) {
      const m = P.msgs[k], line = { from: name(m.who), time: m.time, text: m.text };
      if (answer.has(k)) line.answer = true;
      if (rx.includes(k)) line.reaction = true;
      const r = d.replies[k]; if (r != null && pos.has(r)) line.replyTo = pos.get(r);
      if (m.media) {
        const u = await mediaUrl(m);
        if (u) {
          const blob = await (await fetch(u.url)).blob();
          const ext = (u.name.match(/\.(\w+)$/) || [, 'jpg'])[1].toLowerCase(), key = `${gid}/${k}.${ext}`;
          await Store.put('media', key, blob);
          line.media = 'idb:' + key;
          line.mediaKind = isVideo(u.name) ? (m.media.kind === 'gif' ? 'gif' : 'video') : isAudio(u.name) ? 'audio' : 'image';
        } else if (m.media.kind !== 'audio' || answer.has(k)) missing++;
      }
      lines.push(line);
    }
    const q = { date: P.msgs[d.answer[0]].date, messages: lines };
    if (d.category) q.category = d.category;
    if (d.note) q.note = d.note;
    if (lines.some(l => l.mediaKind === 'video' || l.mediaKind === 'audio')) q.time = 45;
    questions.push(q);
  }
  questions.sort((a, b) => a.date.split('/').reverse().join('').localeCompare(b.date.split('/').reverse().join('')));
  const game = { format: 'who-sent-that', version: 1, title: S.title || S.group || t('title'), group: S.group || S.title,
    me: S.me ? name(S.me) : '', participants: people.map(p => ({ name: name(p), color: S.people[p].color })), questions };
  // the stats for the awards show, with display names
  const isLaugh = Chat.makeLaughTest(S.words, { ranks: S.ranks });
  const stats = Chat.stats(VIEW.filter(m => m.system || included(m.raw)), isLaugh, CANDS.map(c => ({ ...c, sender: name(c.sender), laughers: c.laughers.map(name) })), people.map(name));
  const pics = { group: S.groupPic, people: Object.fromEntries(people.filter(p => S.people[p].pic).map(p => [name(p), S.people[p].pic])) };
  lsSet('wst.pending', JSON.stringify({ game, pics, stats, mediaPrefix: gid + '/' }));
  if (missing) toast(t('mediaMissing', { n: missing }));
  setTimeout(() => { location.href = './?import=1'; }, missing ? 1600 : 200);
}

/* ---------------- events ---------------- */
function clone(x) { return JSON.parse(JSON.stringify(x)); }
async function go(step) {
  if (step === 5 && S.step === 4) { S.reviewIds = chooseForReview(S.reviewCount); S.reviewIds.forEach(decOf); filters = { status: 'todo', person: '', media: false }; shown = 15; }
  if (step === 3) LAUGH_STATS = null;
  S.step = Math.max(0, Math.min(step, maxStep())); save(); render(); scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const tg = e.target;
  const g = tg.closest('[data-go]'); if (g && !g.disabled) { go(+g.dataset.go); return; }
  const aud = tg.closest('[data-aud]');
  if (aud) { S.audience = aud.dataset.aud; const pr = PRESET[S.audience]; S.words = pr.words.slice(); S.curse = pr.curse; findJokes(); save(); render(); return; }
  if (tg.closest('#chatDrop')) { e.preventDefault(); pickFile('.zip,.txt,application/zip,text/plain', { kind: 'chat' }); return; }
  const pic = tg.closest('[data-pic]'); if (pic) { pickFile('image/*', { kind: 'pic', who: pic.dataset.pic }); return; }
  if (tg.id === 'createBtn') { createGame(); return; }
  if (S.step !== 5) return;
  const pc = tg.closest('[data-person]'); if (pc) { filters.person = filters.person === pc.dataset.person ? '' : pc.dataset.person; shown = 15; renderCards(); return; }
  if (tg.closest('[data-more]')) { shown += 15; renderCards(); return; }
  const card = tg.closest('.card'); if (!card) return;
  const id = +card.dataset.id, d = S.dec[id];
  const up = tg.closest('[data-upload]') || (tg.closest('[data-media]') && tg.closest('[data-media]'));
  if (up) { pickFile('image/*,video/*,audio/*,.opus', { kind: 'media', i: +(up.dataset.upload || up.dataset.media), card: id }); return; }
  if (tg.closest('[data-cancel]')) { pick = null; rerenderCard(id); return; }
  if (tg.closest('[data-more-up]')) { d.lo = Math.max(0, d.lo - 10); save(); rerenderCard(id); return; }
  if (tg.closest('[data-more-down]')) { d.hi = Math.min(P.msgs.length - 1, d.hi + 10); save(); rerenderCard(id); return; }
  const rate = tg.closest('[data-rate]'); if (rate) { d.rating = d.rating === rate.dataset.rate ? '' : rate.dataset.rate; save(); rerenderCard(id); return; }
  const tool = tg.closest('[data-tool]');
  if (tool && sel) {
    const k = sel.i, kind = tool.dataset.tool, m = P.msgs[k];
    const tog = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
    if (kind === 'answer') {
      const cur = d.answer.length ? P.msgs[d.answer[0]].who : '';
      if (d.answer.includes(k)) d.answer = d.answer.filter(x => x !== k);
      else d.answer = cur && cur !== m.who ? [k] : [...d.answer, k].sort((a, b) => a - b);
      d.reactions = d.reactions.filter(x => !d.answer.includes(x)); d.hidden = d.hidden.filter(x => !d.answer.includes(x));
    } else if (kind === 'reaction') { d.reactions = tog(d.reactions, k); d.answer = d.answer.filter(x => x !== k); }
    else if (kind === 'hide') d.hidden = tog(d.hidden, k);
    else if (kind === 'reply') { if (d.replies[k] != null) delete d.replies[k]; else { pick = { id, i: k }; sel = null; rerenderCard(id); return; } }
    save(); rerenderCard(id); return;
  }
  const b = tg.closest('[data-msg]');
  if (b) {
    const k = +b.dataset.msg;
    if (pick && pick.id === id) { if (k !== pick.i) { d.replies[pick.i] = k; save(); } pick = null; rerenderCard(id); return; }
    const prev = sel; sel = sel && sel.id === id && sel.i === k ? null : { id, i: k };
    if (prev && prev.id !== id) rerenderCard(prev.id);
    rerenderCard(id);
  }
});
document.addEventListener('input', e => {
  const tg = e.target;
  if (tg.dataset.name) { S.people[tg.dataset.name].name = tg.value.trim() || tg.dataset.name; rebuildView(); save(); return; }
  if (tg.id === 'groupName') { S.group = tg.value; if (!S.title) S.title = tg.value; save(); return; }
  if (tg.id === 'gameTitle') { S.title = tg.value; save(); return; }
  if (tg.id === 'count') { S.reviewCount = +tg.value; $('countN').textContent = tg.value; const n = Object.keys(S.people).filter(included).length || 1;
    $('countSub').textContent = `${t('perPerson', { n: Math.round(tg.value / n) })} · ${t('minutes', { m: Math.max(5, Math.round(tg.value / 4)) })}`; save(); return; }
  if (tg.dataset.field) { const id = +tg.closest('.card').dataset.id; S.dec[id][tg.dataset.field] = tg.value; save(); }
});
document.addEventListener('change', e => {
  const tg = e.target;
  if (tg.dataset.inc) { S.people[tg.dataset.inc].include = tg.checked; findJokes(); rainNow(); save(); render(); return; }
  if (tg.dataset.me) { S.me = tg.dataset.me; save(); return; }
  if (tg.dataset.word !== undefined) { const w = tg.dataset.word; S.words = tg.checked ? [...new Set([...S.words, w])] : S.words.filter(x => x !== w); findJokes(); save(); render(); return; }
  if (tg.id === 'curse') { S.curse = tg.checked; findJokes(); save(); render(); return; }
  if (tg.id === 'ranks') { S.ranks = tg.checked; findJokes(); save(); render(); return; }
  if (tg.id === 'withMeh') { S.includeMeh = tg.checked; save(); render(); return; }
  if (tg.id === 'fStatus') { filters.status = tg.value; shown = 15; renderCards(); return; }
  if (tg.id === 'fMedia') { filters.media = tg.checked; shown = 15; renderCards(); return; }
  if (tg.dataset.field) { const id = +tg.closest('.card').dataset.id; S.dec[id][tg.dataset.field] = tg.value; save(); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'addWord') return;
  e.preventDefault();
  const w = $('newWord').value.trim(); if (!w) return;
  S.words = [...new Set([...S.words, w])]; findJokes(); save(); render();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && (sel || pick)) { const id = (sel || pick).id; sel = pick = null; rerenderCard(id); } });
/* drag & drop: the chat file anywhere on step 2, a photo onto its placeholder */
document.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); const z = e.target.closest && e.target.closest('[data-drop],[data-drop-media]'); document.querySelectorAll('.over').forEach(x => x !== z && x.classList.remove('over')); if (z) z.classList.add('over'); } });
document.addEventListener('drop', e => {
  if (!e.dataTransfer || !e.dataTransfer.files.length) return;
  e.preventDefault(); document.querySelectorAll('.over').forEach(x => x.classList.remove('over'));
  const f = e.dataTransfer.files[0];
  const zm = e.target.closest && e.target.closest('[data-drop-media]');
  if (zm) { useFile(f, { kind: 'media', i: +zm.dataset.dropMedia, card: +zm.closest('.card').dataset.id }); return; }
  if (S.step === 1 || /\.(zip|txt)$/i.test(f.name)) { if (S.step !== 1) S.step = 1; render(); readChatFile(f); }
});

/* ---------------- start ---------------- */
(async function init() {
  applyLang();
  let draft = null;
  try { draft = await Store.get('drafts', 'current'); } catch (e) {}
  if (draft && draft.chatText) {
    const st = $('stage');
    st.innerHTML = `<div class="panel resume"><p>${esc(t('resumeQ', { f: draft.fileName }))}</p>
      <div class="wizNav"><button class="btn ghost" id="fresh">${esc(t('startOver'))}</button><button class="btn big" data-primary id="cont">${esc(t('resume'))}</button></div></div>`;
    $('cont').onclick = () => {
      Object.assign(S, draft);
      P = Chat.parse(S.chatText, LANG); rebuildView(); findJokes();
      S.step = Math.min(S.step, maxStep()); rainNow(); render();
    };
    $('fresh').onclick = async () => { await Store.del('drafts', 'current'); await Store.delPrefix('media', 'draft/'); render(); };
  }
})();
