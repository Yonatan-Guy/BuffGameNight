'use strict';
/* =========================================================
   The awards: an end-of-game show built from the whole chat's stats
   (made on the create page, or group-stats.js in a local build).
   Space / click = next, Backspace = back, Esc = close. Each award first shows
   the category, then a roulette of faces lands on the winner.
   ========================================================= */
const Awards = (() => {
  const W = {
    he: { title: 'טקס הפרסים', of: 'של {g}', msgs: 'הודעות', laughs: 'צחוקים', start: 'רווח כדי להתחיל', andThe: 'והפרס על', reveal: 'רווח כדי לגלות',
      nextAward: 'רווח לפרס הבא', cont: 'רווח להמשך', second: 'במקום השני: {p}', place: 'במקום', nextPlace: 'רווח למקום הבא', toPodium: 'רווח לתמונה הסופית',
      podium: 'המעמדים', close: 'Esc לסגירה', whoFunniest: 'ועכשיו: מי הכי מצחיק בקבוצה?', howRanked: 'הדירוג מכל הצ\'אט: כמה צחוקים כל אחד קיבל, ביחס לכמה שכתב, כמה להיטים היו לו ועד כמה חזק צחקו',
      fromPlace: 'רווח · מתחילים מהמקום ה־{n}', whatLaughed: 'ועל מה צחקו?', placeLine: '{a} צחוקים · {b} ל־100 הודעות · {c} להיטים', tie: 'תיקו עם {p}',
      voice: ['🎤', 'מלך ההקלטות', '{v} הודעות קוליות'], photos: ['📸', 'צלם הקבוצה', '{v} תמונות'], msgsA: ['💬', 'הכי חופר', '{v} הודעות'],
      night: ['🦉', 'ינשוף הלילה', '{v}% מההודעות בין חצות ל־5 בבוקר'], curses: ['🤬', 'הפה הכי מלוכלך', '{v} קללות לכל 1,000 הודעות'],
      self: ['🪞', 'צוחק על הבדיחות של עצמו', '{v} פעמים'], humble: ['😇', 'הכי צנוע', 'צחק על הבדיחות של עצמו רק {v} פעמים'],
      lpj: ['🎰', 'הכי הרבה צחוקים לכל בדיחה', '{v} צחוקים בממוצע לבדיחה'], longest: ['📏', 'ה"חחחח" הכי ארוך', '{v} אותיות ברצף'],
      hard: ['🗿', 'הקהל הכי קשה', 'צוחק רק על {v} מכל 100 הודעות'], easy: ['🤣', 'הקהל הכי טוב', 'צוחק על {v} מכל 100 הודעות'],
      pair: ['💞', 'הקהל הכי נאמן', '{a} צחק על {b} {v} פעמים'], ratio: ['🎯', 'הכי מצחיק ביחס לכמה שכותב', '{v} צחוקים לכל 100 הודעות'] },
    en: { title: 'The awards', of: 'of {g}', msgs: 'messages', laughs: 'laughs', start: 'Space to start', andThe: 'And the award for', reveal: 'Space to reveal',
      nextAward: 'Space for the next award', cont: 'Space to continue', second: 'Runner-up: {p}', place: 'In place', nextPlace: 'Space for the next place', toPodium: 'Space for the final picture',
      podium: 'The podium', close: 'Esc to close', whoFunniest: 'And now: who is the funniest?', howRanked: 'Ranked from the whole chat: laughs received, laughs per message, big hits and how hard people laughed',
      fromPlace: 'Space · starting from place {n}', whatLaughed: 'And what were they laughing at?', placeLine: '{a} laughs · {b} per 100 messages · {c} big hits', tie: 'tied with {p}',
      voice: ['🎤', 'Voice-note king', '{v} voice messages'], photos: ['📸', 'Group photographer', '{v} photos'], msgsA: ['💬', 'Never stops typing', '{v} messages'],
      night: ['🦉', 'Night owl', '{v}% of messages between midnight and 5am'], curses: ['🤬', 'Dirtiest mouth', '{v} swear words per 1,000 messages'],
      self: ['🪞', 'Laughs at own jokes', '{v} times'], humble: ['😇', 'Most modest', 'laughed at own jokes only {v} times'],
      lpj: ['🎰', 'Most laughs per joke', '{v} laughs per joke on average'], longest: ['📏', 'Longest laugh', '{v} letters in a row'],
      hard: ['🗿', 'Toughest crowd', 'laughs at only {v} of every 100 messages'], easy: ['🤣', 'Best audience', 'laughs at {v} of every 100 messages'],
      pair: ['💞', 'Most loyal audience', '{a} laughed at {b} {v} times'], ratio: ['🎯', 'Funniest per message', '{v} laughs per 100 messages'] }
  };
  const L = () => W[typeof LANG !== 'undefined' && W[LANG] ? LANG : 'he'];
  const f = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, d = 0) => Number(n).toLocaleString(typeof LANG !== 'undefined' && LANG === 'en' ? 'en' : 'he-IL', { maximumFractionDigits: d, minimumFractionDigits: d });

  function statsFor(rec) { return rec && (rec.stats || (rec.local && window.GROUP_STATS)) || null; }
  let G, P, PEOPLE, COLOR, PIC, REC, SLIDES, podium;
  function build(rec) {
    REC = rec; G = statsFor(rec); P = G.people;
    PEOPLE = rec.game.participants.map(p => p.name).filter(n => P[n]);
    COLOR = Object.fromEntries(rec.game.participants.map(p => [p.name, p.color]));
    PIC = (rec.pics && rec.pics.people) || {};
    const w = L(), order = (key, dir = -1) => [...PEOPLE].sort((a, b) => dir * ((P[a][key] || 0) - (P[b][key] || 0)));
    const award = (k, key, dec = 0, dir = -1) => {
      const o = order(key, dir), [em, title, stat] = w[k];
      if (!o.length || (dir < 0 && !(P[o[0]][key] > 0))) return null;   // nobody did it: skip the award
      return { kind: 'award', em, title, winner: o[0], second: o[1], stat: f(stat, { v: fmt(P[o[0]][key], dec) }) };
    };
    const longest = [...PEOPLE].filter(p => P[p].longest).sort((a, b) => P[b].longest[1] - P[a].longest[1])[0];
    const ties = longest ? PEOPLE.filter(p => P[p].longest && P[p].longest[1] === P[longest].longest[1] && (P[p].longest_chat || []).length) : [];
    const pairs = PEOPLE.flatMap(a => PEOPLE.filter(b => b !== a).map(b => ({ a, b, v: (G.matrix[a] || {})[b] || 0 }))).sort((x, y) => y.v - x.v);
    const MEASURES = ['laughs_in', 'per100_in', 'big', 'score'];
    const place = (key, p) => PEOPLE.filter(q => P[q][key] > P[p][key]).length + (PEOPLE.filter(q => P[q][key] === P[p][key]).length + 1) / 2;
    podium = PEOPLE.map(p => ({ p, avg: MEASURES.reduce((s, k) => s + place(k, p), 0) / MEASURES.length }))
      .sort((a, b) => a.avg - b.avg || P[b.p].laughs_in - P[a.p].laughs_in).map(x => x.p);
    const top = Math.min(6, podium.length);
    SLIDES = [
      { kind: 'title' },
      award('voice', 'voice'), award('photos', 'photos'), award('msgsA', 'msgs'), award('night', 'nightpct', 1), award('curses', 'curses1k', 1),
      award('self', 'self'), award('humble', 'self', 0, 1), award('lpj', 'lpj', 2),
      longest ? { kind: 'award', em: w.longest[0], title: w.longest[1], winner: longest, second: null,
        stat: f(w.longest[2], { v: P[longest].longest[1] }) + (ties.length > 1 ? ' · ' + f(w.tie, { p: ties.filter(p => p !== longest).join(', ') }) : '') } : null,
      ties.length ? { kind: 'laughChat', people: ties.slice(0, 2) } : null,
      award('hard', 'per100_out', 1, 1), award('easy', 'per100_out', 1),
      pairs[0] && pairs[0].v ? { kind: 'pair', ...pairs[0] } : null,
      award('ratio', 'per100_in', 2),
      { kind: 'podiumIntro', top },
      ...podium.slice(0, top).map((p, i) => ({ kind: 'place', p, n: i + 1 })).reverse(),
      { kind: 'podium' }
    ].filter(Boolean);
  }
  const face = (p, cls = '') => `<div class="aw-face ${cls}" style="--c:${COLOR[p] || '#0b63f6'}">${PIC[p] ? `<img src="${PIC[p]}" alt="">`
    : `<i class="aw-ini">${esc([...p][0] || '?')}</i>`}<span>${esc(p)}</span></div>`;

  /* the conversation behind a record laugh, as a little WhatsApp chat; photos come from the game when it has them */
  function mediaFor(m) {
    for (const q of REC.game.questions) if (q.date === m.date) for (const x of q.messages) if (x.media && x.time === m.time && x.from === m.who) return x;
    return null;
  }
  function chatCard(p) {
    const lines = []; let prev = '';
    (P[p].longest_chat || []).forEach(m => {
      const last = lines[lines.length - 1];
      if (last && last.who === m.who && !m.me && !last.me && !mediaFor(m) && !mediaFor(last)) { last.text += '\n' + m.text; last.time = m.time; }
      else lines.push({ ...m });
    });
    if (!lines.length) return '';
    return `<div class="aw-chat"><div class="aw-chat-head">${esc(lines[0].date)}</div>${lines.map(m => {
      const first = m.who !== prev; prev = m.who;
      const med = mediaFor(m), src = med ? (typeof mediaSrc === 'function' ? mediaSrc(med.media) : med.media) : '';
      const text = src ? m.text.replace(/\n?(📷 תמונה|📷 Photo|🎥 סרטון|🎥 Video|GIF)$/, '') : m.text;
      const media = src ? (med.mediaKind === 'video' || med.mediaKind === 'gif' ? `<video src="${esc(src)}" autoplay loop muted playsinline></video>` : `<img src="${esc(src)}" alt="">`) : '';
      return `<div class="aw-b${m.me ? ' me' : ''}${first ? ' first' : ''}">${first ? `<b style="color:${COLOR[m.who] || '#8696a0'}">${esc(m.who)}</b>` : ''}${media}${text ? `<span dir="auto">${esc(text)}</span>` : ''}<i>${esc(m.time)}</i></div>`;
    }).join('')}</div>`;
  }

  let root = null, idx = 0, revealed = false, busy = false;
  function render() {
    const s = SLIDES[idx], w = L();
    let h = '';
    if (s.kind === 'title') {
      h = `<div class="aw-em">🏆</div><h1 class="aw-big">${esc(w.title)}</h1><p class="aw-kicker">${esc(f(w.of, { g: REC.game.group || REC.game.title }))}</p>
        <p class="aw-sub">${esc(G.span[0].slice(-4))}–${esc(G.span[1].slice(-4))} · ${fmt(G.total_msgs)} ${esc(w.msgs)} · ${fmt(G.total_laughs)} ${esc(w.laughs)}</p>
        <div class="aw-row">${PEOPLE.slice(0, 12).map(p => face(p, 'small')).join('')}</div><p class="aw-hint">${esc(w.start)}</p>`;
    } else if (s.kind === 'award') {
      h = `<div class="aw-em">${s.em}</div><p class="aw-kicker">${esc(w.andThe)}</p><h1 class="aw-big">${esc(s.title)}</h1>
        <div class="aw-wheel" id="awWheel">${revealed ? face(s.winner, 'win') : `<div class="aw-q">?</div>`}</div>
        <p class="aw-stat${revealed ? ' on' : ''}">${revealed ? esc(s.stat) : '&nbsp;'}</p>
        ${revealed && s.second ? `<p class="aw-second">${esc(f(w.second, { p: s.second }))}</p>` : ''}
        <p class="aw-hint">${esc(revealed ? w.nextAward : w.reveal)}</p>`;
    } else if (s.kind === 'pair') {
      h = `<div class="aw-em">${w.pair[0]}</div><p class="aw-kicker">${esc(w.andThe)}</p><h1 class="aw-big">${esc(w.pair[1])}</h1>
        ${revealed ? `<div class="aw-row pair">${face(s.a, 'win')}<span class="aw-heart">😂</span>${face(s.b, 'win')}</div>
          <p class="aw-stat on">${esc(f(w.pair[2], s))}</p>` : `<div class="aw-wheel"><div class="aw-q">?</div></div><p class="aw-stat">&nbsp;</p>`}
        <p class="aw-hint">${esc(revealed ? w.cont : w.reveal)}</p>`;
    } else if (s.kind === 'laughChat') {
      h = `<h1 class="aw-big" style="font-size:clamp(30px,5vh,58px)">${esc(w.whatLaughed)}</h1>
        <div class="aw-chats">${s.people.map(chatCard).join('')}</div><p class="aw-hint">${esc(w.cont)}</p>`;
    } else if (s.kind === 'podiumIntro') {
      h = `<div class="aw-em">🥁</div><h1 class="aw-big">${esc(w.whoFunniest)}</h1><p class="aw-sub">${esc(w.howRanked)}</p>
        <p class="aw-hint">${esc(f(w.fromPlace, { n: s.top }))}</p>`;
    } else if (s.kind === 'place') {
      const x = P[s.p];
      h = `<p class="aw-kicker">${esc(w.place)}</p><div class="aw-place n${s.n}">${s.n}</div>
        <div class="aw-wheel" id="awWheel">${revealed ? face(s.p, 'win') : `<div class="aw-q">?</div>`}</div>
        <p class="aw-stat${revealed ? ' on' : ''}">${revealed ? esc(f(w.placeLine, { a: x.laughs_in, b: fmt(x.per100_in, 2), c: x.big })) : '&nbsp;'}</p>
        <p class="aw-hint">${esc(revealed ? (s.n === 1 ? w.toPodium : w.nextPlace) : w.reveal)}</p>`;
    } else if (s.kind === 'podium') {
      const steps = [2, 1, 3, 4, 5, 6].filter(n => n <= podium.length);
      h = `<h1 class="aw-big">${esc(w.podium)}</h1><div class="aw-podium">${steps.map(n => `<div class="aw-pod n${n}">${face(podium[n - 1], n === 1 ? 'win' : '')}
          <div class="aw-blk">${n}</div></div>`).join('')}</div><p class="aw-hint">${esc(w.close)}</p>`;
    }
    root.querySelector('.aw-stage').innerHTML = h;
    root.querySelector('.aw-count').textContent = `${idx + 1} / ${SLIDES.length}`;
    if (s.kind === 'podium' || (revealed && s.kind === 'place' && s.n === 1)) confetti();
  }
  /* faces flick past, slowing down, and stop on the winner */
  function spin(winner, done) {
    const wheel = root.querySelector('#awWheel'); if (!wheel) { done(); return; }
    const ring = PEOPLE.slice(0, 12).includes(winner) ? PEOPLE.slice(0, 12) : [...PEOPLE.slice(0, 11), winner];
    busy = true;
    let delay = 55, i = Math.floor(Math.random() * ring.length), steps = 0;
    const tickOnce = () => {
      i = (i + 1) % ring.length; steps++;
      wheel.innerHTML = face(ring[i], 'spin');
      delay *= 1.13;
      if (delay > 420 && ring[i] === winner && steps > 10) { busy = false; done(); return; }
      setTimeout(tickOnce, Math.min(delay, 480));
    };
    tickOnce();
  }
  function confetti() {
    const box = root.querySelector('.aw-confetti'); box.innerHTML = '';
    const cols = Object.values(COLOR).concat(['#ffd84d', '#ffffff']);
    for (let k = 0; k < 90; k++) {
      const c = document.createElement('i');
      c.style.cssText = `left:${Math.random() * 100}%;background:${cols[k % cols.length]};animation-delay:${Math.random() * .6}s;animation-duration:${2.2 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg)`;
      box.appendChild(c);
    }
    setTimeout(() => { if (box) box.innerHTML = ''; }, 4500);
  }
  function next() {
    if (busy) return;
    const s = SLIDES[idx];
    if (!revealed && (s.kind === 'award' || s.kind === 'place' || s.kind === 'pair')) {
      const show = () => { revealed = true; render(); };
      if (s.kind === 'pair') show(); else spin(s.kind === 'award' ? s.winner : s.p, show);
      return;
    }
    if (idx < SLIDES.length - 1) { idx++; revealed = false; render(); }
  }
  function back() { if (busy || idx === 0) return; idx--; revealed = true; render(); }
  function close() { if (root) { root.remove(); root = null; } document.removeEventListener('keydown', keys, true); }
  function keys(e) {
    if (e.code === 'Escape') close();
    else if (e.code === 'Space' || e.code === 'Enter' || e.code === (document.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) next();
    else if (e.code === 'Backspace' || e.code === (document.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) back();
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }
  /* rec: the game; start: a slide number or kind to jump to */
  async function open(rec, start = 0) {
    if (!statsFor(rec)) return;
    if (typeof loadRoundMedia === 'function' && !Object.keys(typeof mediaUrls !== 'undefined' ? mediaUrls : {}).length) await loadRoundMedia(rec);
    build(rec); close();
    root = document.createElement('div'); root.id = 'awards';
    root.innerHTML = `<div class="aw-confetti"></div><div class="aw-stage"></div><span class="aw-count"></span><button class="aw-x" aria-label="✕">✕</button>`;
    root.addEventListener('click', e => { if (e.target.closest('.aw-x')) close(); else next(); });
    document.body.appendChild(root);
    document.addEventListener('keydown', keys, true);
    idx = typeof start === 'string' ? Math.max(0, SLIDES.findIndex(x => x.kind === start)) : start; revealed = false; render();
  }
  return { open, available: rec => !!statsFor(rec) };
})();
function openAwards(start) { const rec = currentRec(); if (rec) Awards.open(rec, start); }
