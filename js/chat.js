'use strict';
/* =========================================================
   Reading a WhatsApp export and finding what made the group laugh.
   Runs in the browser (window.Chat) and in Node for tests (module.exports).
   Nothing here touches the page: parse → laughs → candidates → stats.
   ========================================================= */
const Chat = (() => {
  /* ---------------- parsing ---------------- */
  const BIDI = /[‎‏⁦-⁩‪-‮⁠﻿]/g;
  // iPhone: [18/06/2021, 13:05:22] Name: text      Android: 18/06/2021, 13:05 - Name: text
  const IOS = /^\[(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?[Mm]\.?)?\] ([^:]{1,80}?): ?([\s\S]*)$/;
  const AND = /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?[Mm]\.?)?\s*[-–] (?:([^:]{1,80}?): )?([\s\S]*)$/;
  const SYSTEM = /(end-to-end encrypted|הודעות ושיחות מוצפנות|created (this )?group|יצר\/ה את הקבוצה|יצר את הקבוצה|added|הוסיף|הוסיפה|removed|הסיר|left$|יצא\/ה|עזב|joined using|הצטרף|changed (this group|the group|the subject|their phone)|שינה את|שינתה את|This message was deleted|You deleted this message|הודעה זו נמחקה|מחקת הודעה זו|^POLL:|^סקר:|Missed (voice|video) call|שיחה .* שלא נענתה|security code|קוד האבטחה|is a contact|pinned a message|הצמיד)/i;
  const OMITTED = [
    [/(image|photo) omitted|תמונה הושמטה|תמונה לא נכללה/i, 'image'],
    [/video( note)? omitted|סרטון הושמט|וידאו הושמט/i, 'video'],
    [/GIF omitted|GIF הושמט/i, 'gif'],
    [/(audio|voice message) omitted|(שמע|הקלטה|הודעה קולית) הושמט/i, 'audio'],
    [/sticker omitted|מדבקה הושמטה|סטיקר הושמט/i, 'sticker'],
    [/document omitted|מסמך הושמט/i, 'doc'],
    [/<Media omitted>|<המדיה הושמטה>|<מדיה לא נכללה>/i, 'image']
  ];
  const ATTACH = [/<attached: ([^>]+)>/i, /<מצורף: ([^>]+)>/, /^(\S+\.(?:jpe?g|png|webp|heic|gif|mp4|mov|3gp|opus|ogg|m4a|mp3|aac|pdf|vcf|webm)) \((?:file attached|קובץ מצורף)\)/i];
  function kindOfFile(f) {
    const n = f.toLowerCase();
    if (/-gif-|\.gif$/.test(n)) return 'gif';
    if (/-sticker-|^stk-|\.webp$/.test(n)) return 'sticker';
    if (/\.(jpe?g|png|heic)$/.test(n)) return 'image';
    if (/\.(mp4|mov|3gp|webm)$/.test(n)) return 'video';
    if (/\.(opus|ogg|m4a|mp3|aac|wav)$/.test(n)) return 'audio';
    return 'doc';
  }
  const LABEL = { he: { image: '📷 תמונה', video: '🎥 סרטון', gif: 'GIF', audio: '🎤 הקלטה', sticker: 'סטיקר', doc: '📎 קובץ' },
                  en: { image: '📷 Photo', video: '🎥 Video', gif: 'GIF', audio: '🎤 Voice message', sticker: 'Sticker', doc: '📎 File' } };

  function parse(text, lang = 'he') {
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    const raw = [];
    for (const line of lines) {
      const l = line.replace(BIDI, '');
      const m = l.match(IOS) || l.match(AND);
      if (m) raw.push({ a: +m[1], b: +m[2], c: +m[3], h: +m[4], mi: +m[5], s: +(m[6] || 0), ap: (m[7] || '').toLowerCase(), who: m[8] ? m[8].trim() : '', text: m[9] });
      else if (raw.length) raw[raw.length - 1].text += '\n' + l;
    }
    if (!raw.length) return null;
    // which number is the day? Look for a first or second part above 12
    let order = 'dmy';
    if (raw.some(r => r.a > 31)) order = 'ymd';
    else if (raw.some(r => r.b > 12) && !raw.some(r => r.a > 12)) order = 'mdy';
    const first = raw[0];
    const groupName = /end-to-end|מוצפנות/.test(first.text) ? first.who : '';
    const L = LABEL[lang] || LABEL.en;
    const msgs = raw.map((r, i) => {
      let [d, mo, y] = order === 'dmy' ? [r.a, r.b, r.c] : order === 'mdy' ? [r.b, r.a, r.c] : [r.c, r.b, r.a];
      if (y < 100) y += 2000;
      let h = r.h;
      if (r.ap.startsWith('p') && h < 12) h += 12;
      if (r.ap.startsWith('a') && h === 12) h = 0;
      let t = r.text.replace(/<This message was edited>|<ההודעה נערכה>/g, '').trim();
      let media = null;
      for (const re of ATTACH) { const a = t.match(re); if (a) { media = { kind: kindOfFile(a[1]), file: a[1].trim() }; t = t.replace(a[0], '').trim(); break; } }
      if (!media) for (const [re, kind] of OMITTED) if (re.test(t)) { media = { kind, file: '' }; t = t.replace(re, '').trim(); break; }
      const system = !r.who || r.who === groupName || (!media && SYSTEM.test(t) && t.length < 140);
      const shown = media ? (t ? t + '\n' : '') + L[media.kind] : t;
      return { i, ts: new Date(y, mo - 1, d, h, r.mi, r.s).getTime(), date: `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`,
               time: `${String(h).padStart(2, '0')}:${String(r.mi).padStart(2, '0')}`, who: r.who, text: shown, body: t, media, system };
    });
    return { msgs, group: groupName };
  }

  /* ---------------- laughter ---------------- */
  // the laughs every group shares; a group adds its own words on top
  const BASE = {
    he: ['חחח', '😂', '🤣', '💀', '😹', 'מת', 'אני מת', 'מתתי', 'מתה', 'אני מתה', 'מתים', 'מת מצחוק', 'מתה מצחוק', 'מתתי מצחוק',
         'קרסתי', 'קורס', 'קורסת', 'נפטרתי', 'צורח', 'צורחת', 'צרחתי', 'בוכה', 'בוכה מצחוק', 'בכיתי', 'בכיתי מצחוק',
         'הרגת', 'הרגת אותי', 'הרגתם אותי', 'גמרת', 'גמרת אותי', 'קרעת', 'קרעת אותי', 'קורע', 'קורעת', 'קורע מצחוק',
         'הצחקת', 'הצחקת אותי', 'איזה מצחיק', 'מצחיק רצח', 'לא נושם', 'לא נושמת', 'אין לי אוויר', 'נחנקתי', 'התפקעתי', 'התפוצצתי'],
    en: ['haha', 'hahaha', 'lol', 'lmao', 'lmfao', 'rofl', '😂', '🤣', '💀', '😹', 'dead', "i'm dead", 'im dead', 'dying', "i'm dying",
         'hilarious', 'crying', "i'm crying", 'screaming', "i can't", 'cant breathe', "can't breathe", 'killing me', 'you killed me']
  };
  /* words that often mean "funny" but sometimes don't: offered with one click, not ticked by default */
  const EXTRA = {
    he: ['😭', '😆', '😅', '🙈', '🔥', '👏', 'גדול', 'אגדה', 'יא אגדה', 'אלוף', 'גאון', 'לגנדרי', 'פצצה', 'מצחיק', 'אין עליך', 'לא נורמלי', 'חולה', 'סוף', 'די', 'דייי', 'וואו', 'אחי'],
    en: ['😭', '😆', '😅', '🙈', '🔥', '👏', 'legend', 'genius', 'omg', 'stop', 'stoppp', 'no way', 'bro', 'funny', 'classic', 'iconic']
  };
  const RANK = /^\W*(#\s*\d{1,2}|(טופ|top|מקום)\s*\d{1,2}|\d{1,2}\s*\/\s*10|solid\s*\d|יופי של בדיחה\s*\d|\d{1,2} מצחיק)\W*$/i;
  const LAUGH_CORE = /(ח[חה]{2,}|(?:ha){2,}h?|\bh{3,}\b|\blo+l\b|\blmf?ao+\b|\bxd+\b|😂|🤣|💀|😹)/i;
  /* fold repeats so "מתתתת" matches "מת" and "hahahahaha" matches "haha" */
  function norm(s) {
    return String(s).toLowerCase().replace(BIDI, '').replace(/[\uFE0F\u{1F3FB}-\u{1F3FF}]/gu, '').replace(/[\s.,!?'"״׳…~*_\-]+/g, ' ').trim()
      .replace(/(\p{Extended_Pictographic})(?:\s*\1)+/gu, '$1')                 // 🤭🤭🤭 -> 🤭
      .replace(/(?<!\p{L})ח[חה]+(?!\p{L})/gu, 'חח').replace(/\b(?:ha)+h?\b/g, 'haha')
      .replace(/(.)\1{2,}/gu, '$1$1');
  }
  /* a stretched word can be stretched from one letter ("מתתתת" = "מת") or two ("מתתתתי" = "מתתי") */
  function variants(t) {
    const n = norm(t), one = n.replace(/(\p{L})\1+(?=\P{L}|$)/gu, '$1');
    const raw = String(t).toLowerCase().replace(BIDI, '').replace(/[\s.,!?'"״׳…~*_\-]+/g, ' ').trim().replace(/(\p{L})\1{2,}/gu, '$1');
    return [...new Set([n, one, norm(raw)])];
  }
  function makeLaughTest(words, opts = {}) {
    const set = new Set(words.map(norm).filter(Boolean));
    const fits = (n, w) => n.startsWith(w + ' ') && n.length <= Math.max(12, w.length + 4);   // "הרגת אותי" for "הרגת", not a long sentence
    return function isLaugh(text) {
      const t = String(text || '').replace(BIDI, '').trim();
      if (!t) return false;
      if (opts.ranks !== false && RANK.test(t)) return true;
      const vs = variants(t);
      if (vs.some(v => set.has(v))) return true;
      // a reply that starts with laughing ("חחחח מה קורה") is still a laugh
      if (/^\W*(ח[חה׳']{2,}|😂|🤣|💀)/.test(t)) return true;
      if (LAUGH_CORE.test(t) && t.replace(LAUGH_CORE, '').replace(/[\s!?.,ה]+/g, '').length <= 12) return true;
      for (const w of set) if (w.length >= 2 && vs.some(n => fits(n, w))) return true;
      return false;
    };
  }
  function strength(text) {
    const t = String(text || '');
    let s = 0; (t.match(/ח[חה]{2,}|(?:ha){2,}/gi) || []).forEach(x => { s += Math.min(x.length, 30); });
    s += 8 * (t.match(/😂|🤣|💀|😹/g) || []).length;
    return s + (RANK.test(t) ? 15 : 0);
  }
  /* short replies that people send right after someone else's message: the group's laugh words live here */
  /* Laughter is contagious: a reply counts as laugh-like when a different person
     also laughs at the same moment (within 3 minutes). "כן" or "ok" rarely does. */
  function discoverLaughs(msgs, known) {
    const isKnown = makeLaughTest(known);
    const counts = new Map();
    for (let j = 1; j < msgs.length; j++) {
      const m = msgs[j], p = msgs[j - 1];
      if (m.system || m.media || p.system || p.who === m.who || m.ts - p.ts > 5 * 60e3) continue;
      const t = m.body.trim(); if (!t || t.length > 18) continue;
      const n = norm(t); if (!n || /^\d+$/.test(n)) continue;
      const c = counts.get(n) || { word: n, count: 0, together: 0, example: t };
      c.count++;
      for (let k = Math.max(0, j - 3); k <= Math.min(msgs.length - 1, j + 3); k++) {
        const o = msgs[k];
        if (k === j || o.who === m.who || o.system || Math.abs(o.ts - m.ts) > 3 * 60e3) continue;
        if (isKnown(o.body) || norm(o.body) === n) { c.together++; break; }
      }
      counts.set(n, c);
    }
    return [...counts.values()].map(c => ({ ...c, rate: c.together / c.count, known: isKnown(c.example) }))
      .filter(c => c.count >= 4 && c.together >= 3 && c.rate >= 0.25)
      .sort((a, b) => b.together - a.together).slice(0, 36);
  }

  function wordCounts(msgs, words) {
    const ws = words.map(w => [w, norm(w)]).filter(([, n]) => n), out = Object.fromEntries(words.map(w => [w, 0]));
    for (let j = 1; j < msgs.length; j++) {
      const m = msgs[j];
      if (m.system || m.media || msgs[j - 1].who === m.who || !m.body || m.body.length > 30) continue;
      const vs = variants(m.body);
      for (const [w, n] of ws) if (vs.some(v => v === n || (v.startsWith(n + ' ') && v.length <= Math.max(12, n.length + 4)))) out[w]++;
    }
    return out;
  }

  /* ---------------- the jokes ---------------- */
  /* Each laugh is credited to the nearest earlier real message by someone else (within 10 minutes).
     Up to 3 back-to-back messages by the same sender count as one punchline. */
  function candidates(msgs, isLaugh) {
    const laugh = msgs.map(m => !m.system && !m.media && isLaugh(m.body));
    const found = new Map();
    for (let j = 0; j < msgs.length; j++) {
      if (!laugh[j]) continue;
      const L = msgs[j], seen = [];
      for (let k = j - 1; k >= Math.max(0, j - 8); k--) {
        const p = msgs[k];
        if (L.ts - p.ts > 600e3) break;
        if (p.system || laugh[k] || !(p.body || p.media)) continue;
        seen.push(k);
      }
      const target = seen.find(k => msgs[k].who !== L.who);
      if (target === undefined) continue;
      let b = target;
      while (b - 1 >= 0 && msgs[b - 1].who === msgs[target].who && !laugh[b - 1] && target - b < 2 && msgs[b].ts - msgs[b - 1].ts <= 90e3 && !msgs[b - 1].system) b--;
      const f = found.get(b) || { laughers: new Set(), strength: 0, end: 0, reactions: [] };
      f.laughers.add(L.who); f.strength += strength(L.body); f.end = Math.max(f.end, target); f.reactions.push(j);
      found.set(b, f);
    }
    const out = [];
    for (const [b, f] of found) {
      const sender = msgs[b].who;
      const block = []; for (let k = b; k <= f.end; k++) if (msgs[k].who === sender) block.push(k);
      if (block.every(k => msgs[k].media && msgs[k].media.kind === 'audio' && !msgs[k].body)) continue;   // a voice note alone can't be read
      out.push({ start: b, end: f.end, sender, date: msgs[b].date, answer: block, reactions: f.reactions.filter(k => msgs[k].who !== sender).slice(0, 3),
                 laughers: [...f.laughers], score: Math.round((10 * f.laughers.size + f.strength / 6) * 10) / 10 });
    }
    out.sort((a, b) => b.score - a.score);
    out.forEach((c, n) => { c.id = n + 1; });
    return out;
  }
  /* the conversation around a joke: back to a 20-minute silence (12 lines at most), a few lines after */
  function windowOf(msgs, start, end, before = 12, after = 6, gap = 20 * 60e3) {
    let lo = start, n = 0;
    for (let k = start - 1; k >= 0 && n < before; k--) {
      const x = msgs[k]; if (x.system) continue;
      if (msgs[lo].ts - x.ts > gap) break;
      lo = k; n++;
    }
    let hi = end, m = 0;
    while (hi + 1 < msgs.length && m < after) { hi++; if (!msgs[hi].system) m++; }
    return [lo, hi];
  }

  /* ---------------- group stats for the awards ---------------- */
  const CURSE = /זין|מזדיי|זיינ|בן זונה|בת זונה|שרמוט|סתום|כוס |כוסית|אמא שלך|חרא|מניאק|יא אפס|דפוק|מפגר|fuck|shit|bitch|asshole|dick/gi;
  function stats(msgs, isLaugh, cands, people) {
    const S = {}; people.forEach(p => { S[p] = { msgs: 0, words: 0, laughs_in: 0, laughs_out: 0, self: 0, voice: 0, photos: 0, night: 0, curses: 0, ratings: 0, jokes: 0, big: 0, score: 0 }; });
    const matrix = {}; people.forEach(a => { matrix[a] = {}; people.forEach(b => { matrix[a][b] = 0; }); });
    const longest = {}, hours = Array(24).fill(0), weekdays = Array(7).fill(0), months = {};
    const real = msgs.filter(m => !m.system && S[m.who]);
    const laugh = real.map(m => !m.media && isLaugh(m.body));
    let total = 0;
    real.forEach((L, j) => {
      const s = S[L.who]; s.msgs++; s.words += (L.body || '').split(/\s+/).filter(Boolean).length;
      if (L.media) { if (L.media.kind === 'audio') s.voice++; if (L.media.kind === 'image') s.photos++; }
      if (new Date(L.ts).getHours() < 5) s.night++;
      s.curses += ((L.body || '').match(CURSE) || []).length;
      if (RANK.test(L.body || '')) s.ratings++;
      (String(L.body || '').match(/ח[חה]{2,}|(?:ha){3,}/gi) || []).forEach(x => {
        if (!longest[L.who] || x.length > longest[L.who].n) longest[L.who] = { n: x.length, k: j };
      });
      const mk = new Date(L.ts); const key = `${mk.getFullYear()}-${String(mk.getMonth() + 1).padStart(2, '0')}`;
      months[key] = months[key] || [0, 0]; months[key][1]++;
      if (!laugh[j]) return;
      for (let k = j - 1; k >= Math.max(0, j - 8); k--) {
        const p = real[k];
        if (L.ts - p.ts > 600e3) break;
        if (laugh[k]) continue;
        if (p.who === L.who) { s.self++; break; }
        S[p.who].laughs_in++; s.laughs_out++; matrix[L.who][p.who]++; total++;
        const d = new Date(L.ts); hours[d.getHours()]++; weekdays[(d.getDay() + 6) % 7]++; months[key][0]++;
        break;
      }
    });
    cands.forEach(c => { const s = S[c.sender]; if (!s) return; s.jokes++; s.score += c.score; if (c.laughers.length >= 2) s.big++; });
    const convo = k => { let lo = k; while (lo > 0 && k - lo < 9 && real[lo].ts - real[lo - 1].ts <= 20 * 60e3) lo--;
      return real.slice(lo, k + 1).map((x, n) => ({ who: x.who, date: x.date, time: x.time, text: x.text, me: lo + n === k })); };
    const out = { people: {}, matrix, hours, weekdays, total_msgs: real.length, total_laughs: total,
      span: [real[0] ? real[0].date : '', real.length ? real[real.length - 1].date : ''],
      months: Object.keys(months).sort().map(k => [k, months[k][0], months[k][1]]) };
    people.forEach(p => {
      const s = S[p], m = Math.max(1, s.msgs), lg = longest[p];
      out.people[p] = { ...s, score: Math.round(s.score),
        per100_in: +(100 * s.laughs_in / m).toFixed(2), per100_out: +(100 * s.laughs_out / m).toFixed(2),
        lpj: +(s.laughs_in / Math.max(1, s.jokes)).toFixed(2), curses1k: +(1000 * s.curses / m).toFixed(1),
        nightpct: +(100 * s.night / m).toFixed(1), avgwords: +(s.words / m).toFixed(1),
        longest: lg ? [real[lg.k].date, lg.n] : null, longest_chat: lg ? convo(lg.k) : [] };
    });
    return out;
  }

  return { parse, norm, variants, isCore: w => LAUGH_CORE.test(w) && !String(w).replace(LAUGH_CORE, '').trim(), wordCounts, EXTRA, BASE, makeLaughTest, discoverLaughs, candidates, windowOf, stats, kindOfFile, CURSE };
})();
if (typeof module !== 'undefined') module.exports = Chat;
