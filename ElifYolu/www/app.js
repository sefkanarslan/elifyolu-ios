/* Elif Yolu — oyun mantığı */
'use strict';

/* ================= helpers ================= */
const $ = (s, el = document) => el.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(3)) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(String(k)));
  return el;
}
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sample = (a, n) => shuffle(a).slice(0, n);
function uniqBy(a, f) { const s = new Set(); return a.filter(x => { const k = f(x); if (s.has(k)) return false; s.add(k); return true; }); }
const arDigits = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const arSpan = (t, cls) => h('span', { class: 'ar' + (cls ? ' ' + cls : ''), lang: 'ar', dir: 'rtl' }, t);

/* ================= icons ================= */
const I = {
  fire: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.6 2.2c.4 3.1-1.3 4.6-2.9 6.1C8.1 9.9 6.5 11.4 6.5 14.3A5.6 5.6 0 0 0 12 20a5.6 5.6 0 0 0 5.5-5.7c0-2.4-1.2-4-2.1-5.1-.2 1.6-1 2.6-2 3 .7-3.6-.1-7.4-.8-10z"/><path fill="#ffc800" d="M12 20a3.2 3.2 0 0 1-3.2-3.3c0-1.8 1.4-2.8 2.4-4 .2 1.3.9 2 1.6 2.3.8.3 1.6 1.1 1.6 2.2A3.1 3.1 0 0 1 12 20z"/></svg>',
  gem: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 3h10l4 6-9 12L3 9z"/><path fill="#fff" opacity=".45" d="M7 3l3 6H3zM12 21l-2-12h4z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4 6.8 4c2.2 0 3.6 1.3 5.2 3.1C13.6 5.3 15 4 17.2 4 21 4 23.1 8 21.6 11.6 19.5 16.4 12 21 12 21z"/><ellipse cx="7.5" cy="8.6" rx="2" ry="1.3" fill="#fff" opacity=".5" transform="rotate(-30 7.5 8.6)"/></svg>',
  inf: '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M5 5l14 14M19 5L5 19"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9h4l5-4v14l-5-4H3z"/><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  path: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3l9 7.5-1.4 1.6L18 10.8V20h-4.5v-5.5h-3V20H6v-9.2l-1.6 1.3L3 10.5z"/></svg>',
  abc: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor"/><text x="12" y="17" text-anchor="middle" font-size="13" fill="#fff" font-family="Amiri,serif">ب</text></svg>',
  book: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 5.5C4.5 4.2 8 4 11 5.6V20c-3-1.6-6.5-1.4-9-.1zM22 5.5c-2.5-1.3-6-1.5-9 .1V20c3-1.6 6.5-1.4 9-.1z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2" fill="currentColor"/><path fill="currentColor" d="M3.5 21a8.5 7 0 0 1 17 0z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6L2.5 9.3l6.6-.8z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.5l5 5L19.5 7"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10" width="15" height="11" rx="3" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="2.6" d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 3h12v5a6 6 0 0 1-12 0zM9.5 15h5l1 4h-7zM6.5 20h11v2h-11z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 10h2V8h3v8H4v-2H2zM22 10h-2V8h-3v8h3v-2h2zM8 11h8v2H8z"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>',
};
const icon = (name, cls) => h('span', { class: cls || '', html: I[name], style: 'display:inline-grid' });

function mascot(mood = 'happy', cls = '') {
  const sad = mood === 'sad';
  return h('div', { class: 'mascot ' + cls, html: `<svg viewBox="0 0 160 160">
    <ellipse cx="80" cy="150" rx="46" ry="6" fill="#e5e5e5"/>
    <path d="M80 ${sad ? 34 : 14}c13 17 17 30 0 46-17-16-13-29 0-46z" fill="#ff9600"/>
    <path d="M80 ${sad ? 46 : 32}c6 9 8 15 0 24-8-9-6-15 0-24z" fill="#ffc800"/>
    <rect x="72" y="64" width="16" height="12" rx="4" fill="#e5a600"/>
    <path d="M132 96c10-3 20-6 24-12-1 9-9 18-24 22z" fill="#ffc800"/>
    <path d="M28 104a14 14 0 1 1 6-24" fill="none" stroke="#e5a600" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="80" cy="108" rx="54" ry="34" fill="#ffc800"/>
    <ellipse cx="80" cy="80" rx="26" ry="8" fill="#e5a600"/>
    <ellipse cx="80" cy="118" rx="46" ry="20" fill="#ffd84d" opacity=".6"/>
    <circle cx="64" cy="102" r="9" fill="#fff"/><circle cx="96" cy="102" r="9" fill="#fff"/>
    <circle cx="${sad ? 64 : 66}" cy="${sad ? 105 : 103}" r="4.5" fill="#3c3c3c"/><circle cx="${sad ? 96 : 98}" cy="${sad ? 105 : 103}" r="4.5" fill="#3c3c3c"/>
    ${sad ? '<path d="M68 126q12-9 24 0" fill="none" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round"/>'
          : '<path d="M66 118q14 14 28 0" fill="#ff4b4b" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round"/>'}
    <circle cx="52" cy="116" r="5" fill="#ff9600" opacity=".45"/><circle cx="108" cy="116" r="5" fill="#ff9600" opacity=".45"/>
  </svg>` });
}

/* ================= state ================= */
const KEY = 'elifyolu.v1';
const REGEN = 30 * 60 * 1000;
const MAXH = 5;
function today(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dayDiff(a, b) { return Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5); }
const DEFAULT = () => ({ xp: 0, streak: 0, best: 0, lastDay: null, hearts: MAXH, heartsTs: Date.now(), done: {},
  daily: { day: today(), xp: 0 }, settings: { goal: 20, hearts: true, sfx: true }, welcomed: false, lessons: 0 });
let memStore = null;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(DEFAULT(), JSON.parse(raw)); } catch (e) { /* ignore */ }
  return memStore || DEFAULT();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memStore = S; } }
let S = load();

function regen() {
  if (S.hearts >= MAXH) { S.hearts = MAXH; S.heartsTs = Date.now(); return; }
  const n = Math.floor((Date.now() - S.heartsTs) / REGEN);
  if (n > 0) { S.hearts = Math.min(MAXH, S.hearts + n); S.heartsTs += n * REGEN; if (S.hearts >= MAXH) S.heartsTs = Date.now(); save(); }
}
function checkDay() {
  const t = today();
  if (S.daily.day !== t) S.daily = { day: t, xp: 0 };
  if (S.lastDay && dayDiff(S.lastDay, t) > 1) S.streak = 0;
}
const heartsOn = () => S.settings.hearts;
const nextHeartIn = () => Math.max(0, REGEN - (Date.now() - S.heartsTs));
const fmtMin = ms => { const m = Math.ceil(ms / 60000); return m >= 60 ? Math.floor(m / 60) + ' sa ' + (m % 60) + ' dk' : m + ' dk'; };

/* ================= audio ================= */
/* All speech is pre-recorded and bundled in assets/audio (see audio.js):
   letters/syllables/words → audio/t/<id>.mp3, ayahs (Alafasy) → audio/a/<sssaaa>.mp3.
   Keys: plain Arabic text for t/, '@surah:index' or '@besmele' for ayahs. */
const TTS = {
  // One reused <audio> element: iOS Safari only lets a page play sound after a tap,
  // but once an element has played from a tap it can keep playing new sources.
  el: null, onend: null, playing: false, unlocked: false,
  src(k) {
    const A = window.AUDIO;
    if (!A || !k) return null;
    if (k[0] === '@') { const f = A.a[k.slice(1)]; return f ? 'audio/a/' + f + '.mp3' : null; }
    const id = A.t[k];
    return id ? 'audio/t/' + id + '.mp3' : null;
  },
  ok() { return !!window.AUDIO; },
  has(k) { return !!this.src(k); },
  player() {
    if (!this.el) {
      const a = this.el = new Audio();
      a.preload = 'auto';
      a.setAttribute('playsinline', '');
      a.addEventListener('ended', () => { this.playing = false; const f = this.onend; this.onend = null; if (f) f(); });
    }
    return this.el;
  },
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    const a = this.player();
    a.muted = true;
    a.src = this.src(LETTERS[0].say) || '';
    const p = a.play();
    const done = () => { if (!this.playing) { a.pause(); } a.muted = false; };
    if (p && p.then) p.then(done, done); else done();
  },
  stop() { const a = this.el; this.onend = null; this.playing = false; if (a) { try { a.pause(); } catch (e) { /* ignore */ } } },
  say(k, onend) {
    const s = this.src(k);
    this.stop();
    if (!s) { if (onend) onend(); return; }
    const a = this.player();
    a.muted = false;
    a.src = s;
    this.onend = onend || null;
    this.playing = true;
    try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
    const p = a.play();
    if (p && p.catch) p.catch(() => { this.playing = false; });
  },
};
['touchend', 'pointerdown', 'click'].forEach(ev => document.addEventListener(ev, () => TTS.unlock(), { capture: true, passive: true }));
// key for a tapped Arabic option: letter forms (with tatweel) speak the letter's name
function optKey(o) { const l = LETTER[o.replace(/ـ/g, '')]; return l ? l.say : o; }
let actx = null;
function tone(seq, type = 'sine', vol = 0.16) {
  if (!S.settings.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime + 0.01;
    seq.forEach(([f, at, dur]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(vol, t0 + at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t0 + at); o.stop(t0 + at + dur + 0.05);
    });
  } catch (e) { /* audio unavailable */ }
}
const sfx = {
  ok: () => tone([[784, 0, .12], [1047, .09, .22]]),
  bad: () => tone([[311, 0, .16], [233, .12, .26]], 'triangle', .2),
  tap: () => tone([[600, 0, .05]], 'sine', .06),
  pair: () => tone([[880, 0, .1]], 'sine', .1),
  win: () => tone([[523, 0, .14], [659, .12, .14], [784, .24, .14], [1047, .36, .35]]),
};
function speakBtn(text, size) {
  return h('button', { class: 'speak' + (size ? ' ' + size : ''), 'aria-label': 'Dinle', html: I.speaker, onclick: e => { e.stopPropagation(); TTS.say(text); } });
}

/* ================= question builders ================= */
function fill(pool, all, key, min = 4) {
  if (pool.length >= min) return pool;
  return uniqBy([...pool, ...shuffle(all)], key).slice(0, Math.max(min, pool.length));
}
function choice(correct, pool, key, n = 4) {
  const others = uniqBy(shuffle(pool.filter(x => key(x) !== key(correct))), key).slice(0, n - 1);
  const opts = shuffle([correct, ...others]).map(key);
  return { options: opts, answer: opts.indexOf(key(correct)) };
}
const C = o => Object.assign({ type: 'choice' }, o);
const LKEY = l => l.ar, NKEY = l => l.name;

// ---- letters
const fillL = pool => fill(pool, LETTERS, LKEY);
const qG2N = (l, pool) => C({ label: 'Harfi tanı', title: 'Bu harfin adı ne?', big: l.ar, say: l.say, layout: 'grid2', ...choice(l, fillL(pool), NKEY) });
const qN2G = (l, pool) => C({ label: 'Harfi bul', title: `“${l.name}” harfi hangisi?`, arOpts: true, layout: 'grid2', sayOpts: o => LETTER[o] && LETTER[o].say, ...choice(l, fillL(pool), LKEY) });
const qListenL = (l, pool) => C({ label: 'Dinle', title: 'Duyduğun harfi seç', listen: true, say: l.say, arOpts: true, layout: 'grid2', ...choice(l, fillL(pool), LKEY) });
function qMatch(items, aKey, bKey, aAr, bAr, n = 5) {
  const ps = uniqBy(uniqBy(shuffle(items), aKey), bKey).slice(0, n);
  return { type: 'match', label: 'Eşleştir', title: 'Eşleri bul', aAr, bAr, pairs: ps.map(i => ({ a: aKey(i), b: bKey(i), say: i.say })) };
}
function introLetter(l) {
  const f = letterForms(l.ar);
  return { type: 'intro', say: l.say, build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Yeni harf'),
    h('div', { class: 'big-ar' }, l.ar),
    h('h2', null, l.name),
    h('p', { class: 'sub' }, l.hint),
    TTS.ok() ? speakBtn(l.say) : null,
    h('div', { class: 'forms' }, [['tek', 'Tek'], ['bas', 'Başta'], ['orta', 'Ortada'], ['son', 'Sonda']].map(([k, t]) =>
      h('div', null, arSpan(f[k]), h('small', null, t)))),
  ) };
}
function genLetters(ls) {
  const pool = ls.pool.map(a => LETTER[a]), fresh = ls.fresh.map(a => LETTER[a]);
  const makers = [qG2N, qN2G]; if (TTS.ok()) makers.push(qListenL);
  const head = [];
  fresh.forEach(l => { head.push(introLetter(l)); head.push(qG2N(l, pool)); });
  const rest = fresh.map(l => qN2G(l, pool));
  const order = shuffle(pool);
  let i = 0;
  while (head.filter(s => s.type !== 'intro').length + rest.length < 11) rest.push(pick(makers)(order[i++ % order.length], pool));
  const out = head.concat(shuffle(rest));
  if (pool.length >= 4) out.splice(out.length - rnd(4), 0, qMatch(pool, LKEY, NKEY, true, false));
  return out;
}

// ---- similar letters
const DOT_LABELS = ['Noktasız', '1 nokta', '2 nokta', '3 nokta'];
const qDots = l => C({ label: 'Noktaları say', title: 'Bu harfte kaç nokta var?', big: l.ar, layout: 'grid2', options: DOT_LABELS.slice(), answer: l.dots });
function introGroup(g) {
  return { type: 'intro', build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Benzer harfler'),
    h('h2', null, 'Noktalara dikkat!'),
    h('p', { class: 'sub' }, 'Bu harflerin gövdesi aynı; onları yalnızca noktaları ayırır.'),
    h('div', { class: 'group' }, g.map(l => h('div', null, arSpan(l.ar), h('small', null, l.name)))),
  ) };
}
function genSimilar(ls) {
  const groups = ls.groups.map(i => SIMILAR_GROUPS[i].map(a => LETTER[a]));
  const all = groups.flat();
  const out = [];
  groups.forEach(g => {
    out.push(introGroup(g));
    const target = pick(g);
    out.push(C({ label: 'Harfi bul', title: `“${target.name}” hangisi?`, arOpts: true, layout: 'grid2',
      ...choice(target, fill(g, all, LKEY, 3), LKEY, Math.max(3, Math.min(4, g.length))) }));
  });
  const rest = [];
  groups.forEach(g => { const l = pick(g); rest.push(C({ label: 'Harfi tanı', title: 'Bu harfin adı ne?', big: l.ar, say: l.say, layout: 'grid2', ...choice(l, fill(g, all, LKEY, 3), NKEY, Math.max(3, Math.min(4, g.length))) })); });
  sample(all, 3).forEach(l => rest.push(qDots(l)));
  out.push(...shuffle(rest));
  out.push(qMatch(all, LKEY, NKEY, true, false));
  return out;
}

// ---- letter forms
const POS = { bas: 'baştaki', orta: 'ortadaki', son: 'sondaki' };
const POSL = { bas: 'Kelime başında', orta: 'Kelime ortasında', son: 'Kelime sonunda' };
const NONJOIN = ['ا', 'د', 'ذ', 'ر', 'ز', 'و'];
function genForms(ls) {
  const pool = ls.pool.map(a => LETTER[a]);
  const out = [];
  const ex = pool.find(l => l.joins);
  out.push({ type: 'intro', build: () => { const f = letterForms(ex.ar); return h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Bitişik yazılış'),
    h('h2', null, 'Harfler şekil değiştirir'),
    h('p', { class: 'sub' }, `Arapçada harfler birbirine bitişir. Aynı harf kelimenin başında, ortasında ve sonunda farklı görünür. Örnek: ${ex.name}`),
    h('div', { class: 'forms' }, [['tek', 'Tek'], ['bas', 'Başta'], ['orta', 'Ortada'], ['son', 'Sonda']].map(([k, t]) => h('div', null, arSpan(f[k]), h('small', null, t)))),
  ); } });
  if (pool.some(l => !l.joins)) out.push({ type: 'intro', build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Kural'),
    h('h2', null, 'Bitişmeyen 6 harf'),
    h('p', { class: 'sub' }, 'Bu harfler kendinden önceki harfe bitişir ama kendinden sonraki harfe bitişmez.'),
    h('div', { class: 'group' }, NONJOIN.map(a => h('div', null, arSpan(a), h('small', null, LETTER[a].name)))),
  ) });
  const qs = [];
  shuffle(pool).forEach((l, i) => {
    const pos = ['bas', 'orta', 'son'][i % 3];
    if (i % 2 === 0) qs.push(C({ label: POSL[pos], title: 'Bu hangi harf?', big: letterForms(l.ar)[pos], say: l.say, layout: 'grid2', ...choice(l, pool, NKEY) }));
    else {
      const c = choice(l, pool, x => letterForms(x.ar)[pos]);
      qs.push(C({ label: 'Şekli bul', title: `“${l.name}” harfinin ${POS[pos]} hali hangisi?`, arOpts: true, layout: 'grid2', ...c }));
    }
  });
  if (pool.some(l => !l.joins)) {
    for (let k = 0; k < 2; k++) {
      const nj = LETTER[pick(NONJOIN)];
      qs.push(C({ label: 'Kural', title: 'Hangi harf kendinden sonrakine bitişmez?', arOpts: true, layout: 'grid2', ...choice(nj, [nj, ...sample(pool.filter(l => l.joins), 3)], LKEY) }));
    }
  }
  return out.concat(sample(qs, 11));
}

// ---- syllables (harekeler, cezm, şedde, tenvin, med)
const RKEY = s => s.read;
const HARAKA3 = ['Üstün', 'Esre', 'Ötre'];
const TENV3 = ['İki üstün', 'İki esre', 'İki ötre'];
const ALL_SYL = Object.values(HARAKAT).flat();
function introMarks(marks, items) {
  const multi = marks.length > 1;
  return { type: 'intro', build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Okuma işareti'),
    multi ? null : h('div', { class: 'big-ar mid' }, MARK_INFO[marks[0]].sign),
    h('h2', null, multi ? 'Tenvin' : marks[0]),
    h('p', { class: 'sub' }, multi ? 'Harekenin iki kez yazılmasıdır; okurken sona bir "n" sesi eklenir.' : MARK_INFO[marks[0]].text),
    h('div', { class: 'group' }, (multi ? marks.map(m => items.find(i => i.mark === m)) : items.filter(i => marks.includes(i.mark)).slice(0, 4))
      .map(i => h('div', null, arSpan(i.ar), h('small', null, i.read)))),
  ) };
}
function qMarkName(s) {
  const set = HARAKA3.includes(s.mark) ? HARAKA3 : TENV3.includes(s.mark) ? TENV3 : null;
  if (!set) return null;
  return C({ label: 'İşaret', title: 'Bu hecedeki işaretin adı ne?', big: s.ar, say: s.say, layout: 'list', options: set.slice(), answer: set.indexOf(s.mark) });
}
function qWhichHas(s) {
  const plain = [...HARAKAT.ustun, ...HARAKAT.esre, ...HARAKAT.otre];
  const name = s.mark === 'Med' ? 'uzatma (med)' : s.mark;
  return C({ label: 'İşaret', title: `Hangisinde ${s.mark === 'Med' ? '' : '“'}${name}${s.mark === 'Med' ? '' : '”'} var?`, arOpts: true, layout: 'grid2', ...choice(s, [s, ...sample(plain, 3)], LKEY) });
}
function genSyll(ls) {
  const items = ls.items;
  const pool = fill(items, ALL_SYL, RKEY);
  const out = [];
  if (ls.marks.length) {
    if (ls.marks.every(m => TENV3.includes(m))) out.push(introMarks(ls.marks, items));
    else ls.marks.forEach(m => out.push(introMarks([m], items)));
  }
  const makers = [
    s => C({ label: 'Oku', title: 'Bu hece nasıl okunur?', big: s.ar, bigClass: s.ar.length > 3 ? 'mid' : '', say: s.say, layout: 'grid2', ...choice(s, pool, RKEY) }),
    s => C({ label: 'Yaz', title: `“${s.read}” hangisi?`, arOpts: true, layout: 'grid2', ...choice(s, pool, LKEY) }),
    s => qMarkName(s) || qWhichHas(s),
  ];
  if (TTS.ok()) makers.push(s => C({ label: 'Dinle', title: 'Duyduğun heceyi seç', listen: true, say: s.say, arOpts: true, layout: 'grid2', ...choice(s, pool, LKEY) }));
  const order = shuffle(items);
  const qs = [];
  for (let i = 0; i < 10; i++) qs.push(makers[i % makers.length](order[i % order.length]));
  out.push(...shuffle(qs));
  out.splice(out.length - rnd(3), 0, qMatch(items, LKEY, RKEY, true, false, 4));
  return out;
}

// ---- words
const ALL_WORDS = [...WORDS1, ...WORDS2];
const MKEY = w => w.mean;
function introWord(w) {
  return { type: 'intro', say: w.say, build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Yeni kelime'),
    h('div', { class: 'big-ar mid' }, w.ar),
    TTS.ok() ? speakBtn(w.say) : null,
    h('div', { class: 'read' }, w.read),
    h('div', { class: 'mean' }, w.mean),
  ) };
}
function genWords(ls) {
  const pool = fill(ls.pool, ALL_WORDS, LKEY);
  const qW2M = w => C({ label: 'Anlam', title: 'Bu kelimenin anlamı ne?', big: w.ar, bigClass: 'mid', say: w.say, layout: 'list', ...choice(w, pool, MKEY) });
  const qM2W = w => C({ label: 'Kelimeyi bul', title: `“${w.mean}” hangisi?`, arOpts: true, layout: 'grid2', ...choice(w, pool, LKEY) });
  const qW2R = w => C({ label: 'Oku', title: 'Bu kelime nasıl okunur?', big: w.ar, bigClass: 'mid', say: w.say, layout: 'grid2', ...choice(w, pool, RKEY) });
  const makers = [qW2M, qM2W, qW2R];
  if (TTS.ok()) makers.push(w => C({ label: 'Dinle', title: 'Duyduğun kelimeyi seç', listen: true, say: w.say, arOpts: true, layout: 'grid2', ...choice(w, pool, LKEY) }));
  const head = [];
  ls.fresh.forEach(w => { head.push(introWord(w)); head.push(qW2M(w)); });
  const rest = ls.fresh.map(qW2R);
  const order = shuffle(ls.pool);
  let i = 0;
  while (head.filter(s => s.type !== 'intro').length + rest.length < 10) rest.push(pick(makers)(order[i++ % order.length]));
  const out = head.concat(shuffle(rest));
  out.splice(out.length - rnd(3), 0, qMatch(ls.pool, LKEY, MKEY, true, false, 4));
  return out;
}

// ---- surahs
function introSurah(su) {
  return { type: 'intro', build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, 'Yeni sure'),
    h('div', { class: 'big-ar mid' }, SURAH_AR[su.key]),
    h('h2', null, su.name + ' Suresi'),
    h('p', { class: 'sub' }, `${su.ayahs.length} ayet · Mushaf'taki ${su.no}. sure`),
    su.besmeleIsAyah ? null : h('div', { class: 'mean' }, 'Okumaya Besmele ile başlanır:', h('div', { class: 'ar', style: 'font-size:26px;display:block' }, BESMELE),
      TTS.has('@besmele') ? speakBtn('@besmele', 'sm') : null),
  ) };
}
function introAyah(su, i) {
  const a = su.ayahs[i];
  const key = `@${su.key}:${i}`;
  return { type: 'intro', say: key, build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, `${su.name} · ${i + 1}. ayet`),
    h('div', { class: 'big-ar ayah' }, a.ar),
    TTS.has(key) ? speakBtn(key) : null,
    h('div', { class: 'read' }, a.read),
    h('div', { class: 'mean' }, a.mean),
  ) };
}
function genSurah(ls) {
  const su = SURAHS[ls.surah]; su.key = ls.surah;
  const others = Object.entries(SURAHS).filter(([k]) => k !== ls.surah).flatMap(([, s]) => s.ayahs);
  const A = su.ayahs;
  const optPool = i => fill([A[i], ...A.filter((_, j) => j !== i)], others, LKEY);
  const AK = i => `${ls.surah}:${i}`;
  const qRead = i => C({ ayahKey: AK(i), label: 'Okunuş', title: 'Bu ayet nasıl okunur?', big: A[i].ar, bigClass: 'ayah', layout: 'list', ...choice(A[i], optPool(i), RKEY) });
  const qMean = i => C({ ayahKey: AK(i), say: '@' + AK(i), label: 'Anlam', title: 'Bu ayetin anlamı hangisi?', big: A[i].ar, bigClass: 'ayah', layout: 'list', ...choice(A[i], optPool(i), MKEY) });
  const surahWords = uniqBy(A.flatMap(a => a.ar.split(' ')), x => x);
  const otherWords = uniqBy(others.flatMap(a => a.ar.split(' ')), x => x);
  const qBuild = i => {
    const words = A[i].ar.split(' ');
    const extraSrc = surahWords.filter(w => !words.includes(w));
    const extra = sample(extraSrc.length >= 2 ? extraSrc : otherWords.filter(w => !words.includes(w)), words.length >= 8 ? 1 : 2);
    return { type: 'build', ayahKey: AK(i), label: 'Ayeti diz', title: 'Kelimeleri doğru sırayla diz', hint: A[i].mean, answer: words, tiles: shuffle([...words, ...extra]) };
  };
  const qMissing = i => {
    const words = A[i].ar.split(' ');
    const idxs = words.map((w, k) => k).filter(k => words[k].length >= 3);
    const k = pick(idxs.length ? idxs : words.map((_, j) => j));
    const correct = words[k];
    const distract = uniqBy(shuffle([...surahWords, ...otherWords]).filter(w => w !== correct), x => x).slice(0, 3);
    const opts = shuffle([correct, ...distract]);
    return C({ ayahKey: AK(i), label: 'Boşluğu doldur', title: 'Boşluğa hangi kelime gelir?', arOpts: true, layout: 'grid2', options: opts, answer: opts.indexOf(correct),
      bigNode: () => h('div', { class: 'big-ar ayah blank-ayah' }, words.map((w, j) => j === k ? h('span', { class: 'gap' }, ' ') : w + ' ')),
      reveal: A[i].ar });
  };
  const qNext = i => {
    const nxt = A[i + 1];
    const pool = fill([nxt, ...A.filter((_, j) => j !== i && j !== i + 1)], others, LKEY, 3);
    return C({ ayahKey: AK(i + 1), label: 'Sıradaki ayet', title: 'Bu ayetten sonra hangisi gelir?', big: A[i].ar, bigClass: 'ayah', arOpts: true, longOpts: true, layout: 'list', ...choice(nxt, pool, LKEY, 3) });
  };
  const out = [];
  if (ls.fresh.includes(0)) out.push(introSurah(su));
  ls.fresh.forEach(i => { out.push(introAyah(su, i)); out.push(qRead(i)); out.push(qBuild(i)); });
  const rest = ls.fresh.map(qMean);
  const makers = [qMean, qBuild, qMissing, qRead, i => (i < A.length - 1 ? qNext(i) : qMissing(i))];
  const order = shuffle(ls.pool);
  let n = 0;
  const target = ls.fresh.length ? 10 : 11;
  while (out.filter(s => s.type !== 'intro').length + rest.length < target) {
    const i = order[n % order.length];
    rest.push(makers[(n + rnd(2)) % makers.length](i));
    n++;
  }
  return out.concat(shuffle(rest));
}

const SURAH_AR = { fatiha: 'الفاتحة', ihlas: 'الإخلاص', kevser: 'الكوثر', felak: 'الفلق', nas: 'الناس' };
const UNIT_ICON = { u1: 'ا', u2: 'د', u3: 'ض', u4: 'ي', u5: 'ث', u6: 'بَ', u7: 'إِنَّ', u8: 'كِتَاب', u9: 'نُور', u10: 'الفاتحة', u11: 'الإخلاص', u12: 'الكوثر', u13: 'الفلق', u14: 'الناس' };
const KIND_DESC = {
  letters: 'Harfleri tanı, adlarını öğren ve eşleştir.',
  similar: 'Birbirine benzeyen harfleri noktalarından ayırt et.',
  forms: 'Harflerin kelime başında, ortasında ve sonundaki hallerini tanı.',
  syll: 'Heceleri oku, işaretleri tanı.',
  words: 'Kur\'an\'da sık geçen kelimeleri öğren.',
  surah: 'Ayetleri oku, anlamını öğren, kelimeleri sırala.',
};
const GEN = { letters: genLetters, similar: genSimilar, forms: genForms, syll: genSyll, words: genWords, surah: genSurah };
function generate(ls) { return GEN[ls.kind](ls).filter(Boolean); }
function genPractice(base) {
  const doneL = ALL_LESSONS.filter(l => S.done[l.id]);
  const src = doneL.length ? sample(doneL, 3) : [base];
  if (base && !src.includes(base)) src[0] = base;
  return sample(src.flatMap(l => generate(l)).filter(s => s.type !== 'intro'), 9);
}

/* ================= lesson runner ================= */
let LS = null;
const lessonEl = () => $('#lesson');
const OK_WORDS = ['Harika!', 'Mükemmel!', 'Çok iyi!', 'Doğru!', 'Maşallah!', 'Süper!'];

function startLesson(lesson, opts = {}) {
  regen(); closeModal();
  if (!opts.practice && heartsOn() && S.hearts <= 0) return heartsModal();
  const steps = opts.steps || generate(lesson);
  LS = { lesson, steps, total: steps.length, done: 0, mistakes: 0, graded: steps.filter(s => s.type !== 'intro').length,
    firstOk: 0, practice: !!opts.practice, t0: Date.now(), locked: false };
  const el = lessonEl();
  el.innerHTML = '';
  el.classList.remove('hidden');
  el.append(
    h('div', { class: 'l-top' },
      h('button', { class: 'x', 'aria-label': 'Kapat', html: I.x, onclick: confirmQuit }),
      h('div', { class: 'pbar' }, h('i', { id: 'pfill' })),
      h('div', { class: 'l-hearts' + (heartsOn() && !LS.practice ? '' : ' inf'), id: 'lhearts' })),
    h('div', { class: 'l-body', id: 'lbody' }),
    h('div', { class: 'l-foot', id: 'lfoot' }));
  updateLessonTop();
  nextStep();
}
function updateLessonTop() {
  if (!LS) return;
  $('#pfill').style.width = Math.max(3, Math.round(LS.done / LS.total * 100)) + '%';
  const lh = $('#lhearts');
  lh.innerHTML = '';
  if (heartsOn() && !LS.practice) lh.append(icon('heart'), String(S.hearts)); else lh.append(icon('inf'));
}
function nextStep() {
  if (!LS) return;
  TTS.stop();
  LS.locked = false;
  const old = $('.fb', lessonEl()); if (old) old.remove();
  if (!LS.steps.length) return finishLesson();
  const q = LS.cur = LS.steps.shift();
  const body = $('#lbody'), foot = $('#lfoot');
  body.innerHTML = ''; foot.innerHTML = ''; foot.classList.remove('has-fb'); body.scrollTop = 0;
  ({ intro: renderIntro, choice: renderChoice, match: renderMatch, build: renderBuild })[q.type](q, body, foot);
}
function renderIntro(q, body, foot) {
  body.append(q.build());
  if (q.say && TTS.has(q.say)) setTimeout(() => { if (LS && LS.cur === q) TTS.say(q.say); }, 250);
  foot.append(h('button', { class: 'btn', onclick: () => { sfx.tap(); LS.done++; updateLessonTop(); nextStep(); } }, 'Devam'));
}
function promptBlock(q, body) {
  if (q.label) body.append(h('div', { class: 'q-label' }, q.label));
  body.append(h('h2', { class: 'q-title' }, q.title));
  if (q.listen) { body.append(speakBtn(q.say, 'big')); setTimeout(() => TTS.say(q.say), 300); }
  else if (q.big) {
    const row = h('div', { class: 'prompt-row' });
    if (q.say && TTS.has(q.say)) row.append(speakBtn(q.say, q.bigClass === 'ayah' ? 'sm' : ''));
    row.append(h('div', { class: 'big-ar ' + (q.bigClass || ''), lang: 'ar' }, q.big));
    body.append(row);
  }
  if (q.bigNode) body.append(q.bigNode());
  if (q.hint) body.append(h('div', { class: 'hint-mean' }, q.hint));
}
function renderChoice(q, body, foot) {
  promptBlock(q, body);
  let sel = -1;
  const btns = [];
  const wrap = h('div', { class: 'opts' + (q.layout === 'grid2' ? ' grid2' : '') });
  q.options.forEach((o, i) => {
    const cls = 'opt' + (q.arOpts ? ' ar-opt' + (q.longOpts || o.length > 16 ? ' long' : '') : (q.layout === 'list' ? ' left' : ''));
    const b = h('button', { class: cls, onclick: () => {
      if (LS.locked) return;
      sel = i; btns.forEach(x => x.classList.remove('sel')); b.classList.add('sel'); chk.disabled = false; sfx.tap();
      if (q.arOpts && !q.longOpts && !q.listen && TTS.has(optKey(o))) TTS.say(optKey(o));
    } }, q.arOpts ? null : h('span', { class: 'num' }, i + 1), q.arOpts ? arSpan(o) : o);
    btns.push(b); wrap.append(b);
  });
  body.append(wrap);
  const chk = h('button', { class: 'btn', disabled: true, onclick: () => {
    if (LS.locked) return;
    const ok = sel === q.answer;
    btns[q.answer].classList.add('right');
    if (!ok) btns[sel].classList.add('wrong');
    judge(ok, q, q.options[q.answer], q.arOpts);
  } }, 'Kontrol et');
  foot.append(chk);
}
function renderMatch(q, body, foot) {
  promptBlock(q, body);
  const left = shuffle(q.pairs.map((p, i) => ({ i, t: p.a, say: p.say })));
  const right = shuffle(q.pairs.map((p, i) => ({ i, t: p.b })));
  let selA = null, selB = null, matched = 0;
  const mk = (it, side, isAr) => {
    const b = h('button', { class: 'opt' + (isAr ? ' ar-opt' : ''), onclick: () => {
      if (b.classList.contains('gone')) return;
      if (side === 'a') { if (selA) selA.el.classList.remove('sel'); selA = { it, el: b }; if (it.say && TTS.has(it.say)) TTS.say(it.say); }
      else { if (selB) selB.el.classList.remove('sel'); selB = { it, el: b }; }
      b.classList.add('sel'); sfx.tap();
      if (selA && selB) {
        const A = selA, B = selB; selA = selB = null;
        if (A.it.i === B.it.i) {
          [A.el, B.el].forEach(e => { e.classList.remove('sel'); e.classList.add('right'); });
          sfx.pair(); matched++;
          setTimeout(() => [A.el, B.el].forEach(e => { e.classList.remove('right'); e.classList.add('gone'); }), 280);
          if (matched === q.pairs.length) setTimeout(() => judge(true, q), 450);
        } else {
          q._missed = true; LS.mistakes++;
          [A.el, B.el].forEach(e => { e.classList.remove('sel'); e.classList.add('wrong', 'shake'); });
          sfx.bad();
          setTimeout(() => [A.el, B.el].forEach(e => e.classList.remove('wrong', 'shake')), 450);
        }
      }
    } }, isAr ? arSpan(it.t) : it.t);
    return b;
  };
  body.append(h('div', { class: 'match' },
    h('div', { class: 'col' }, left.map(it => mk(it, 'a', q.aAr))),
    h('div', { class: 'col' }, right.map(it => mk(it, 'b', q.bAr)))));
  foot.append(h('button', { class: 'btn', disabled: true }, 'Eşleri bul'));
}
function renderBuild(q, body, foot) {
  promptBlock(q, body);
  const line = h('div', { class: 'build-line' });
  const bank = h('div', { class: 'bank' });
  const placed = [];
  const refresh = () => { chk.disabled = placed.length === 0; };
  q.tiles.forEach(t => {
    const src = h('button', { class: 'tile', onclick: () => {
      if (LS.locked || src.classList.contains('ph')) return;
      sfx.tap(); src.classList.add('ph');
      const moved = h('button', { class: 'tile', onclick: () => {
        if (LS.locked) return;
        sfx.tap(); moved.remove(); placed.splice(placed.indexOf(entry), 1); src.classList.remove('ph'); refresh();
      } }, t);
      const entry = { t, el: moved };
      placed.push(entry); line.append(moved); refresh();
    } }, t);
    bank.append(src);
  });
  body.append(line, bank);
  const chk = h('button', { class: 'btn', disabled: true, onclick: () => {
    if (LS.locked) return;
    const ok = placed.map(p => p.t).join(' ') === q.answer.join(' ');
    judge(ok, q, q.answer.join(' '), true);
  } }, 'Kontrol et');
  foot.append(chk);
}
function judge(ok, q, answerText, answerAr) {
  LS.locked = true;
  if (ok) { sfx.ok(); LS.done++; if (!q._missed) LS.firstOk++; if (q.ayahKey && TTS.has('@' + q.ayahKey)) setTimeout(() => { if (LS && LS.cur === q) TTS.say('@' + q.ayahKey); }, 450); }
  else {
    sfx.bad(); LS.mistakes++; q._missed = true;
    if (heartsOn() && !LS.practice) { regen(); if (S.hearts === MAXH) S.heartsTs = Date.now(); S.hearts = Math.max(0, S.hearts - 1); save(); }
    if (q.type === 'choice') { const ans = q.options[q.answer]; const o = shuffle(q.options); q.options = o; q.answer = o.indexOf(ans); }
    if (q.type === 'build') q.tiles = shuffle(q.tiles);
    LS.steps.push(q);
  }
  updateLessonTop();
  const out = !ok && heartsOn() && !LS.practice && S.hearts <= 0;
  const fb = h('div', { class: 'fb ' + (ok ? 'ok' : 'no') },
    h('h4', null, h('span', { class: 'ic', html: ok ? I.check : I.x }), ok ? pick(OK_WORDS) : 'Doğru cevap:'),
    !ok && answerText ? h('div', { class: 'ans' }, answerAr ? arSpan(answerText) : answerText) : null,
    ok && q.reveal ? h('div', { class: 'ans' }, arSpan(q.reveal)) : null,
    h('button', { class: 'btn' + (ok ? '' : ' red'), onclick: () => (out ? outOfHearts() : nextStep()) }, out ? 'Tamam' : 'Devam'));
  const foot = $('#lfoot');
  foot.innerHTML = '';
  foot.classList.add('has-fb');
  foot.append(fb);
}
function outOfHearts() {
  const lesson = LS.lesson;
  showModal(h('div', { class: 'center' },
    mascot('sad'),
    h('h3', null, 'Kalbin kalmadı!'),
    h('p', null, `Alıştırma yaparak 1 kalp kazanabilirsin. Kalpler ${REGEN / 60000} dakikada bir kendiliğinden de dolar.`),
    h('button', { class: 'btn blue', onclick: () => startLesson(lesson, { practice: true, steps: genPractice(lesson) }) }, 'Alıştırma yap'),
    h('button', { class: 'btn ghost', onclick: () => { closeModal(); exitLesson(); } }, 'Çık')), { lock: true });
}
function confirmQuit() {
  if (!LS) return;
  showModal(h('div', { class: 'center' },
    mascot('sad', 'sm'),
    h('h3', null, 'Gitmek mi istiyorsun?'),
    h('p', null, 'Şimdi çıkarsan bu dersteki ilerlemen kaydedilmez.'),
    h('button', { class: 'btn', onclick: closeModal }, 'Derse devam'),
    h('button', { class: 'btn ghost', style: 'color:var(--red)', onclick: () => { closeModal(); exitLesson(); } }, 'Çık')));
}
function exitLesson() { TTS.stop(); LS = null; lessonEl().classList.add('hidden'); lessonEl().innerHTML = ''; render(); }

function finishLesson() {
  const perfect = LS.mistakes === 0;
  const xp = LS.practice ? 5 : 10 + (perfect ? 5 : 0);
  checkDay();
  const goalBefore = S.daily.xp >= S.settings.goal;
  S.xp += xp; S.daily.xp += xp;
  const t = today();
  let streakUp = false;
  if (S.lastDay !== t) {
    S.streak = S.lastDay && dayDiff(S.lastDay, t) === 1 ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak); S.lastDay = t; streakUp = true;
  }
  let heartGain = false;
  if (LS.practice) { regen(); if (S.hearts < MAXH) { S.hearts++; heartGain = true; if (S.hearts === MAXH) S.heartsTs = Date.now(); } }
  else { const d = S.done[LS.lesson.id] || { n: 0 }; d.n++; d.last = t; S.done[LS.lesson.id] = d; }
  S.lessons++;
  save();
  sfx.win();
  const secs = Math.round((Date.now() - LS.t0) / 1000);
  const acc = LS.graded ? Math.round(LS.firstOk / LS.graded * 100) : 100;
  const goalNow = !goalBefore && S.daily.xp >= S.settings.goal;
  const el = lessonEl();
  el.innerHTML = '';
  const box = (c, label, val) => h('div', { class: 'rbox', style: `--c:${c}` }, h('small', null, label), h('b', null, val));
  el.append(h('div', { class: 'result' },
    mascot('happy', 'bounce'),
    h('h1', null, LS.practice ? 'Alıştırma tamam!' : perfect ? 'Kusursuz ders!' : 'Ders tamamlandı!'),
    h('div', { class: 'boxes' },
      box('var(--yellow)', 'Toplam XP', '+' + xp),
      box('var(--green)', 'Doğruluk', '%' + acc),
      box('var(--blue)', 'Süre', Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'))),
    heartGain ? h('p', { style: 'color:var(--red);font-size:17px;font-weight:900;margin-top:18px' }, '+1 kalp kazandın') : null,
    goalNow ? h('p', { style: 'color:var(--orange);font-size:17px;font-weight:900;margin-top:14px' }, 'Günlük hedefini tamamladın!') : null),
    h('div', { class: 'l-foot' }, h('button', { class: 'btn', onclick: () => (streakUp ? streakScreen() : exitLesson()) }, 'Devam')));
  LS = null;
}
function streakScreen() {
  const el = lessonEl();
  el.innerHTML = '';
  el.append(h('div', { class: 'result' },
    h('div', { html: I.fire, style: 'width:140px;height:140px;color:var(--orange)' }),
    h('div', { style: 'font-size:72px;font-weight:900;color:var(--orange);line-height:1' }, String(S.streak)),
    h('h1', { style: 'color:var(--orange);margin-top:6px' }, 'günlük seri!'),
    h('p', { style: 'color:var(--muted);font-size:16px;max-width:300px;line-height:1.45' }, S.streak === 1 ? 'Harika bir başlangıç! Seriyi korumak için her gün bir ders yap.' : 'Her gün azar azar — en güzel öğrenme böyledir. Yarın da gel!')),
    h('div', { class: 'l-foot' }, h('button', { class: 'btn', onclick: exitLesson }, 'Devam')));
}

/* ================= modals & toast ================= */
let modalLocked = false;
function showModal(content, opts = {}) {
  closeModal(true);
  modalLocked = !!opts.lock;
  const bg = h('div', { class: 'modal-bg', id: 'modal', onclick: e => { if (e.target === bg && !modalLocked) closeModal(); } }, h('div', { class: 'modal' }, content));
  document.body.append(bg);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); modalLocked = false; }
function toast(t) { const el = h('div', { class: 'toast' }, t); document.body.append(el); setTimeout(() => el.remove(), 1800); }

function heartsModal() {
  regen();
  const kids = [h('div', { class: 'center' },
    h('div', { html: I.heart, style: 'width:72px;height:72px;margin:0 auto;color:var(--red)' }),
    h('h3', null, heartsOn() ? `${S.hearts} kalbin var` : 'Sınırsız kalp'),
    h('p', null, !heartsOn() ? 'Kalp sistemi kapalı. Profil sekmesinden açabilirsin.'
      : S.hearts >= MAXH ? 'Kalplerin dolu. Her yanlış cevap bir kalp götürür.'
      : `Sonraki kalp ${fmtMin(nextHeartIn())} içinde. Alıştırma yaparak hemen kalp kazanabilirsin.`))];
  if (heartsOn() && S.hearts < MAXH) kids.push(h('button', { class: 'btn blue', onclick: () => startLesson(null, { practice: true, steps: genPractice(currentLesson() || ALL_LESSONS[0]) }) }, 'Alıştırma yap (+1 kalp)'));
  kids.push(h('button', { class: 'btn ghost', onclick: closeModal }, 'Kapat'));
  showModal(kids);
}

/* ================= main screens ================= */
let TAB = 'path';
const currentLesson = () => ALL_LESSONS.find(l => !S.done[l.id]);

function renderTop() {
  regen(); checkDay();
  const top = $('#topbar');
  top.innerHTML = '';
  top.append(
    h('button', { class: 'stat fire' + (S.lastDay === today() ? '' : ' dim'), onclick: () => toast(S.streak ? `${S.streak} günlük serin var — en uzun: ${S.best}` : 'Bugün bir ders yap, serini başlat!') }, icon('fire'), String(S.streak)),
    h('button', { class: 'stat gem', onclick: () => toast(`Bugün ${S.daily.xp}/${S.settings.goal} XP`) }, icon('gem'), String(S.xp)),
    h('button', { class: 'stat heart', onclick: heartsModal }, icon(heartsOn() ? 'heart' : 'inf'), heartsOn() ? String(S.hearts) : ''));
}
function render() {
  renderTop();
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === TAB));
  const v = $('#view');
  v.innerHTML = '';
  ({ path: renderPath, abc: renderABC, surahs: renderSurahs, profile: renderProfile })[TAB](v);
}
function setTab(t) { TTS.stop(); TAB = t; render(); $('#view').scrollTop = 0; if (t === 'path') scrollToCurrent(); }

function renderPath(v) {
  const wrap = h('div', { class: 'path' });
  const cur = currentLesson();
  const firstUndone = cur ? ALL_LESSONS.indexOf(cur) : -1;
  if (Object.keys(S.done).length) wrap.append(h('button', { class: 'practice-card', onclick: () => startLesson(null, { practice: true, steps: genPractice(null) }) },
    h('div', { class: 'pi', html: I.dumbbell }), h('div', null, h('b', null, 'Alıştırma'), h('span', null, 'Öğrendiklerini tazele · +5 XP, +1 kalp'))));
  const OFF = [0, 46, 70, 46, 0, -46, -70, -46];
  UNITS.forEach((u, ui) => {
    const sec = h('section', { class: 'unit c-' + u.color, id: 'unit-' + u.id });
    sec.append(h('div', { class: 'unit-banner' },
      h('div', null, h('p', { style: 'margin:0;font-size:12px;letter-spacing:.8px;opacity:.85' }, `ÜNİTE ${ui + 1}`), h('h2', null, u.title), h('p', null, u.desc)),
      h('div', { class: 'uicon', lang: 'ar' }, UNIT_ICON[u.id])));
    const nodes = h('div', { class: 'nodes' });
    u.lessons.forEach((l, li) => {
      const gi = ALL_LESSONS.indexOf(l);
      const state = S.done[l.id] ? 'done' : gi === firstUndone ? 'current' : firstUndone === -1 || gi < firstUndone ? 'done' : 'locked';
      const isLast = li === u.lessons.length - 1;
      const ic = state === 'locked' ? 'lock' : state === 'done' ? (isLast ? 'trophy' : 'check') : (isLast ? 'trophy' : 'star');
      const node = h('button', { class: 'node ' + state, id: state === 'current' ? 'cur-node' : null, html: I[ic], onclick: () => lessonModal(l, state, ui, li) });
      const w = h('div', { class: 'node-wrap', style: `transform:translateX(${OFF[(li + ui * 3) % 8]}px)` }, node);
      if (state === 'current') w.append(h('div', { class: 'start-tip' }, Object.keys(S.done).length ? 'DEVAM' : 'BAŞLA'));
      nodes.append(w);
    });
    sec.append(nodes);
    wrap.append(sec);
  });
  if (!cur) wrap.append(h('div', { class: 'center', style: 'text-align:center;margin-top:24px' }, mascot('happy'), h('h2', null, 'Tebrikler! Tüm dersleri bitirdin.'), h('p', { style: 'color:var(--muted)' }, 'Alıştırmalarla tekrar etmeyi unutma.')));
  v.append(wrap);
}
function scrollToCurrent() {
  requestAnimationFrame(() => { const n = $('#cur-node'); if (n) n.scrollIntoView({ block: 'center' }); });
}
function lessonModal(l, state, ui, li) {
  const u = UNITS[ui];
  const kids = [
    h('p', { style: 'margin:0 0 4px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted)' }, `Ünite ${ui + 1} · Ders ${li + 1}/${u.lessons.length}`),
    h('h3', null, l.title),
    h('p', null, state === 'locked' ? 'Bu dersi açmak için önceki dersleri tamamla.' : KIND_DESC[l.kind]),
  ];
  if (state === 'locked') kids.push(h('button', { class: 'btn', disabled: true }, 'Kilitli'));
  else kids.push(h('button', { class: 'btn', onclick: () => startLesson(l) }, (state === 'done' ? 'Tekrar et' : 'Başla') + ' · +10 XP'));
  showModal(kids);
}

function letterLearned(ar) {
  return ALL_LESSONS.some(l => l.kind === 'letters' && S.done[l.id] && l.fresh.includes(ar));
}
function letterModal(l) {
  const f = letterForms(l.ar);
  showModal(h('div', { class: 'intro', style: 'margin:0' },
    h('div', { class: 'big-ar' }, l.ar),
    h('h2', null, l.name),
    h('p', { class: 'sub' }, l.hint),
    TTS.ok() ? speakBtn(l.say) : null,
    h('div', { class: 'forms' }, [['tek', 'Tek'], ['bas', 'Başta'], ['orta', 'Ortada'], ['son', 'Sonda']].map(([k, t]) => h('div', null, arSpan(f[k]), h('small', null, t)))),
    h('button', { class: 'btn ghost', style: 'margin-top:18px', onclick: closeModal }, 'Kapat')));
}
function renderABC(v) {
  v.append(h('div', { class: 'page' },
    h('h1', null, 'Elif-Ba'),
    h('p', { class: 'lead' }, 'Bir harfe dokun: adını, okunuşunu ve bitişik yazılışlarını gör.'),
    h('div', { class: 'abc' }, LETTERS.map(l => h('button', { class: letterLearned(l.ar) ? 'learned' : '', onclick: () => letterModal(l) }, arSpan(l.ar), h('small', null, l.name)))),
    h('div', { class: 'sec-title' }, 'Okuma işaretleri'),
    h('div', { class: 'marks' }, Object.entries(MARK_INFO).map(([name, m]) => h('div', { class: 'markrow' }, arSpan(m.sign), h('div', null, h('b', null, name), h('span', null, m.text)))))));
}

const READER = { surah: null, read: true, mean: true };
function renderSurahs(v) {
  if (READER.surah) return renderReader(v);
  v.append(h('div', { class: 'page' },
    h('h1', null, 'Sureler'),
    h('p', { class: 'lead' }, 'Öğrendiğin sureleri okunuşu ve anlamıyla oku.'),
    h('div', { class: 'surah-list' }, Object.entries(SURAHS).map(([k, s]) => h('button', { class: 'surah-item', onclick: () => { READER.surah = k; render(); $('#view').scrollTop = 0; } },
      h('div', { class: 'no' }, String(s.no)), h('div', null, h('b', null, s.name), h('span', null, `${s.ayahs.length} ayet`)), arSpan(SURAH_AR[k]))))));
}
function renderReader(v) {
  const s = SURAHS[READER.surah];
  const chip = (key, label) => h('button', { class: 'chip' + (READER[key] ? ' on' : ''), onclick: () => { READER[key] = !READER[key]; render(); } }, label);
  v.append(h('div', { class: 'page reader' },
    h('button', { class: 'chip', onclick: () => { TTS.stop(); READER.surah = null; render(); } }, '‹ Sureler'),
    h('h1', { style: 'margin-top:12px' }, s.name + ' Suresi'),
    h('div', { class: 'toggles' }, chip('read', 'Okunuş'), chip('mean', 'Meal'),
      h('button', { class: 'chip play-all', id: 'playall', onclick: () => playSurah(READER.surah) }, '▶ Tamamını dinle')),
    s.besmeleIsAyah ? null : h('div', { class: 'ar besmele', id: 'row-besmele' }, BESMELE),
    s.ayahs.map((a, i) => h('div', { class: 'ayah-row', id: 'row-' + i },
      h('div', { class: 'ayah-head' }, speakBtn(`@${READER.surah}:${i}`, 'sm'),
        h('span', { class: 'ar', lang: 'ar' }, a.ar + ' ', h('span', { class: 'end' }, '(' + arDigits(i + 1) + ')'))),
      READER.read ? h('div', { class: 'tr' }, `${i + 1}. ${a.read}`) : null,
      READER.mean ? h('div', { class: 'mn' }, a.mean) : null)),
    h('div', { class: 'note' }, 'Okunuşlar yalnızca yardımcıdır; Arapça seslerin tamamı Latin harfleriyle tam karşılanamaz. Doğru tecvid için bir hocadan ya da güvenilir kıraat kayıtlarından yararlan.')));
}

function playSurah(key) {
  const s = SURAHS[key];
  const queue = (s.besmeleIsAyah ? [] : [['@besmele', 'row-besmele']]).concat(s.ayahs.map((_, i) => [`@${key}:${i}`, 'row-' + i]));
  const btn = $('#playall');
  const clear = () => document.querySelectorAll('.reader .playing').forEach(e => e.classList.remove('playing'));
  if (btn && btn.classList.contains('on')) { TTS.stop(); clear(); btn.classList.remove('on'); btn.textContent = '▶ Tamamını dinle'; return; }
  if (btn) { btn.classList.add('on'); btn.textContent = '■ Durdur'; }
  const step = n => {
    clear();
    const b = $('#playall');
    if (n >= queue.length || !b || !b.classList.contains('on') || READER.surah !== key) { if (b) { b.classList.remove('on'); b.textContent = '▶ Tamamını dinle'; } return; }
    const row = document.getElementById(queue[n][1]);
    if (row) { row.classList.add('playing'); row.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    TTS.say(queue[n][0], () => step(n + 1));
  };
  step(0);
}

function renderProfile(v) {
  regen(); checkDay();
  const totalL = ALL_LESSONS.length, doneN = ALL_LESSONS.filter(l => S.done[l.id]).length;
  const learnedLetters = LETTERS.filter(l => letterLearned(l.ar)).length;
  const pct = Math.min(1, S.daily.xp / S.settings.goal);
  const ring = h('div', { class: 'ring', html: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#e5e5e5" stroke-width="8"/><circle cx="32" cy="32" r="26" fill="none" stroke="#ff9600" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(pct * 163.4).toFixed(1)} 200" transform="rotate(-90 32 32)"/></svg>` });
  const scard = (ic, color, val, label) => h('div', { class: 'scard' }, h('span', { html: I[ic], style: `color:${color};display:inline-grid` }), h('div', null, h('b', null, val), h('span', null, label)));
  const sw = (key, title, sub) => h('div', { class: 'setrow' }, h('div', null, h('b', null, title), h('span', null, sub)),
    h('button', { class: 'sw' + (S.settings[key] ? ' on' : ''), 'aria-label': title, onclick: () => { S.settings[key] = !S.settings[key]; if (key === 'hearts') { regen(); } save(); render(); } }));
  v.append(h('div', { class: 'page' },
    h('h1', null, 'Profil'),
    h('div', { class: 'stats' },
      scard('fire', 'var(--orange)', String(S.streak), 'Günlük seri'),
      scard('gem', 'var(--blue)', String(S.xp), 'Toplam XP'),
      scard('trophy', 'var(--yellow-d)', `${doneN}/${totalL}`, 'Tamamlanan ders'),
      scard('star', 'var(--green)', `${learnedLetters}/28`, 'Öğrenilen harf')),
    h('div', { class: 'goal' }, ring, h('div', null, h('b', null, 'Günlük hedef'), h('span', null, `Bugün ${S.daily.xp} / ${S.settings.goal} XP · En uzun seri: ${S.best} gün`))),
    h('div', { class: 'sec-title' }, 'Ayarlar'),
    h('div', { class: 'setrow stack' }, h('div', null, h('b', null, 'Günlük XP hedefi'), h('span', null, 'Her ders 10–15 XP kazandırır')),
      h('div', { class: 'chips' }, [10, 20, 30, 50].map(g => h('button', { class: 'chip' + (S.settings.goal === g ? ' on' : ''), onclick: () => { S.settings.goal = g; save(); render(); } }, String(g))))),
    sw('hearts', 'Kalp sistemi', 'Kapalıyken yanlış cevaplar kalp götürmez'),
    sw('sfx', 'Ses efektleri', 'Doğru/yanlış sesleri'),
    h('div', { class: 'setrow' }, h('div', null, h('b', null, 'Sesler'), h('span', null, 'Uygulamanın içinde, internetsiz çalışır. Harf, hece ve kelime sesleri harekeli metinden üretilmiş Arapça sestir; ayetler Mişari Raşid el-Afasi\'nin kıraatidir.'))),
    h('button', { class: 'danger', onclick: () => showModal([h('h3', null, 'İlerlemeyi sıfırla?'), h('p', null, 'Tüm XP, seri ve tamamlanan dersler silinir. Bu işlem geri alınamaz.'),
      h('button', { class: 'btn red', onclick: () => { const st = S.settings; S = DEFAULT(); S.settings = st; S.welcomed = true; save(); closeModal(); setTab('path'); } }, 'Sıfırla'),
      h('button', { class: 'btn ghost', onclick: closeModal }, 'Vazgeç')]) }, 'İlerlemeyi sıfırla'),
    h('div', { class: 'note' }, 'Elif Yolu, Kur\'an-ı Kerim okumaya giriş için hazırlanmış bir öğrenme oyunudur: harfler, harekeler, temel kelimeler ve kısa sureler. Mealler kısa ve sadedir. Doğru telaffuz ve tecvid için mutlaka bir hocadan ya da güvenilir kıraat kayıtlarından destek al.'),
    h('div', { class: 'note', style: 'margin-top:10px' }, 'Kıraat: Mişari Raşid el-Afasi (everyayah.com). Yazı tipleri: Amiri ve Nunito (SIL Open Font License). Sürüm 1.1')));
}

function welcome() {
  let goal = S.settings.goal;
  const chips = h('div', { class: 'chips', style: 'justify-content:center;margin:4px 0 18px' });
  const draw = () => { chips.innerHTML = ''; [[10, 'Rahat'], [20, 'Normal'], [30, 'Ciddi'], [50, 'Yoğun']].forEach(([g, t]) => chips.append(h('button', { class: 'chip' + (goal === g ? ' on' : ''), onclick: () => { goal = g; draw(); } }, `${t} · ${g} XP`))); };
  draw();
  showModal(h('div', { class: 'center', style: 'text-align:center' },
    mascot('happy', 'bounce'),
    h('h3', null, 'Esselâmü aleyküm!'),
    h('p', null, 'Ben Kandil. Elif Yolu\'nda Kur\'an harflerini, harekeleri ve kısa sureleri adım adım, oyun oynar gibi öğreneceğiz.'),
    h('p', { style: 'margin:0 0 6px;color:var(--ink)' }, 'Günlük hedefini seç:'),
    chips,
    h('button', { class: 'btn', onclick: () => { S.settings.goal = goal; S.welcomed = true; save(); closeModal(); render(); scrollToCurrent(); } }, 'Başlayalım')), { lock: true });
}

/* ================= back button (Android) ================= */
window.onAndroidBack = function () {
  if ($('#modal')) { if (!modalLocked) closeModal(); return; }
  if (LS) return confirmQuit();
  if (!lessonEl().classList.contains('hidden')) return exitLesson();
  if (TAB === 'surahs' && READER.surah) { TTS.stop(); READER.surah = null; return render(); }
  if (TAB !== 'path') return setTab('path');
  try { Android.exitApp(); } catch (e) { /* browser */ }
};

/* ================= boot ================= */
function boot() {
  document.querySelectorAll('.tabbar button').forEach(b => b.addEventListener('click', () => { sfx.tap(); setTab(b.dataset.tab); }));
  render();
  scrollToCurrent();
  if (!S.welcomed) welcome();
  setInterval(() => { if (!LS) renderTop(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !LS) render(); });
}
boot();
