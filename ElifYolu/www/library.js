/* Elif Yolu — Kur'an kütüphanesi: 114 sure, okuma + ezber
   Text and meal load per surah on demand (quran/s/NNN.js). Recitation audio:
   the 25 short-surah ayahs are bundled; all others stream from everyayah.com. */
'use strict';

const Q = (() => {
  const cache = {}, waiting = {};
  window.__qs = (n, d) => { cache[n] = d; (waiting[n] || []).forEach(f => f()); delete waiting[n]; };
  const meta = n => window.QURAN_INDEX[n - 1];        // [no, tr name, ar name, M/D, count]
  function load(n) {
    if (cache[n]) return Promise.resolve(cache[n]);
    return new Promise((ok, fail) => {
      (waiting[n] = waiting[n] || []).push(() => ok(cache[n]));
      if (waiting[n].length > 1) return;
      const sc = document.createElement('script');
      sc.src = 'quran/s/' + String(n).padStart(3, '0') + '.js';
      sc.onerror = () => { delete waiting[n]; fail(new Error('load ' + n)); };
      document.head.append(sc);
    });
  }
  // okunuş (transliteration) exists only for the five surahs taught on the path
  const READS = { 1: 'fatiha', 108: 'kevser', 112: 'ihlas', 113: 'felak', 114: 'nas' };
  function view(n) {
    const d = cache[n], m = meta(n);
    if (!d) throw new Error('surah not loaded: ' + n);
    const rd = READS[n] && SURAHS[READS[n]];
    return { no: n, name: m[1], arName: m[2], place: m[3], ayahs: d.ar.map((ar, i) => ({ ar, mean: d.tr[i], read: rd ? rd.ayahs[i].read : null })),
      akey: i => `q:${n}:${i}` };
  }
  // ezber parts: consecutive ayahs, about 30 words or 5 ayahs each
  function parts(n) {
    const d = cache[n], out = [];
    let a = 0, words = 0;
    d.ar.forEach((t, i) => {
      const w = t.split(' ').length;
      if (i > a && (words + w > 34 || i - a >= 5)) { out.push([a, i]); a = i; words = 0; }
      words += w;
    });
    out.push([a, d.ar.length]);
    return out;
  }
  const lessonId = (n, p, lvl) => `q-${n}-${p}-${lvl}`;
  return { load, view, meta, parts, lessonId, cache, READS };
})();

/* ---- audio keys: '@q:<surah>:<index>' ---- */
(() => {
  const orig = TTS.src.bind(TTS);
  let bundled = null;
  TTS.src = k => {
    if (k && k.startsWith('@q:')) {
      const [, n, i] = k.split(':');
      const file = String(n).padStart(3, '0') + String(+i + 1).padStart(3, '0');
      bundled = bundled || new Set(Object.values((window.AUDIO || {}).a || {}));
      return bundled.has(file) ? 'audio/a/' + file + '.mp3' : 'https://everyayah.com/data/Alafasy_64kbps/' + file + '.mp3';
    }
    return orig(k);
  };
  // a streamed ayah may fail without internet: say so once instead of staying silent
  let warned = 0;
  const p = TTS.player.bind(TTS);
  TTS.player = () => {
    const a = p();
    if (!a._netWatch) {
      a._netWatch = true;
      a.addEventListener('error', () => {
        if (/^https?:/.test(a.src) && Date.now() - warned > 8000) { warned = Date.now(); toast('Bu ayetin sesi internetten çalınır. Bağlantını kontrol et.'); }
        TTS.playing = false; TTS.onend = null;
        if (READER.playAll) { READER.playAll = false; document.querySelectorAll('.reader .playing').forEach(e => e.classList.remove('playing')); const b = $('#playall'); if (b) { b.classList.remove('on'); b.textContent = '▶ Tamamını dinle'; } }
      });
    }
    return a;
  };
})();

/* ---------------- Sureler sekmesi ---------------- */
const READER = { surah: null, mode: 'read', read: true, mean: true, query: '', playAll: false };
const BESMELE_U = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
const trFold = s => String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ı]/g, 'i').replace(/[^a-z0-9]/g, '');
function surahStars(n) { const pre = `q-${n}-`; return Object.entries(S.stars || {}).reduce((t, [k, v]) => t + (k.startsWith(pre) ? v : 0), 0); }

function renderSurahs(v) {
  if (READER.surah) return renderSurahPage(v);
  const page = h('div', { class: 'page' });
  const list = h('div', { class: 'surah-list' });
  const draw = () => {
    const q = trFold(READER.query), qa = Recite.norm(READER.query);
    list.innerHTML = '';
    const rows = window.QURAN_INDEX.filter(([no, tr, ar]) => !q && !qa || String(no) === READER.query.trim() || (q && trFold(tr).includes(q)) || (qa && Recite.norm(ar).includes(qa)));
    if (!rows.length) list.append(h('div', { class: 'lb-empty' }, 'Bu adla bir sure bulunamadı.'));
    rows.forEach(([no, tr, ar, place, count]) => {
      const st = surahStars(no);
      list.append(h('button', { class: 'surah-item', onclick: () => openSurah(no) },
        h('div', { class: 'no' }, String(no)),
        h('div', { class: 'si-mid' }, h('b', null, tr), h('span', null, `${place === 'M' ? 'Mekke' : 'Medine'} · ${count} ayet`),
          st ? h('span', { class: 'si-stars', html: STAR_SVG + `<i>${st}</i>` }) : null),
        arSpan(ar)));
    });
  };
  const search = h('input', { id: 'surah-search', class: 'inp search', type: 'search', placeholder: 'Sure ara: Yâsîn, Mülk, 36…', value: READER.query, autocomplete: 'off',
    oninput: e => { READER.query = e.target.value; draw(); } });
  page.append(h('h1', null, 'Sureler'), h('p', { class: 'lead' }, '114 surenin tamamı: oku, dinle, meali gör ve bölüm bölüm ezberle.'), search, list);
  draw();
  v.append(page);
}
function openSurah(n, mode) {
  TTS.stop(); READER.playAll = false;
  READER.surah = n; if (mode) READER.mode = mode;
  render(); $('#view').scrollTop = 0;
}
function renderSurahPage(v) {
  const n = READER.surah, m = Q.meta(n);
  const page = h('div', { class: 'page reader' });
  v.append(page);
  const seg = h('div', { class: 'seg', role: 'tablist' }, [['read', 'Oku'], ['ezber', 'Ezberle']].map(([k, t]) =>
    h('button', { role: 'tab', 'aria-selected': String(READER.mode === k), class: READER.mode === k ? 'on' : '', onclick: () => { TTS.stop(); READER.playAll = false; READER.mode = k; render(); } }, t)));
  page.append(
    h('button', { class: 'chip', onclick: () => { TTS.stop(); READER.playAll = false; READER.surah = null; render(); } }, '‹ Sureler'),
    h('div', { class: 'sp-head' }, h('div', null, h('h1', null, `${m[1]} Suresi`), h('p', { class: 'lead', style: 'margin:0' }, `${n}. sure · ${m[3] === 'M' ? 'Mekke' : 'Medine'} · ${m[4]} ayet`)),
      h('div', { class: 'ar sp-ar' }, m[2])),
    seg);
  const body = h('div', { class: 'sp-body' }, h('div', { class: 'lb-empty' }, 'Yükleniyor…'));
  page.append(body);
  Q.load(n).then(() => {
    if (READER.surah !== n || !body.isConnected) return;
    body.innerHTML = '';
    (READER.mode === 'ezber' ? drawEzberParts : drawReader)(body, Q.view(n));
  }, () => { body.innerHTML = ''; body.append(h('div', { class: 'lb-empty' }, 'Sure yüklenemedi.')); });
}

function drawReader(body, su) {
  const hasRead = su.ayahs[0].read != null;
  const chip = (key, label) => h('button', { class: 'chip' + (READER[key] ? ' on' : ''), onclick: () => { READER[key] = !READER[key]; render(); } }, label);
  const showBesmele = su.no !== 1 && su.no !== 9;
  body.append(h('div', { class: 'toggles' }, hasRead ? chip('read', 'Okunuş') : null, chip('mean', 'Meal'),
    h('button', { class: 'chip play-all' + (READER.playAll ? ' on' : ''), id: 'playall', onclick: () => playSurah(su) }, READER.playAll ? '■ Durdur' : '▶ Tamamını dinle')));
  if (showBesmele) body.append(h('div', { class: 'ar besmele', id: 'row-besmele' }, BESMELE_U));
  // long surahs: render in slices so the page stays light
  const STEP = 60;
  let shown = 0;
  const more = h('button', { class: 'btn ghost', style: 'margin-top:14px' });
  const rows = h('div');
  const add = () => {
    const end = Math.min(su.ayahs.length, shown + STEP);
    for (let i = shown; i < end; i++) rows.append(ayahRow(su, i));
    shown = end;
    more.hidden = shown >= su.ayahs.length;
    more.textContent = `Devamını göster (${shown + 1}–${Math.min(su.ayahs.length, shown + STEP)}. ayetler)`;
  };
  more.onclick = add;
  body.append(rows, more);
  add();
  body.append(h('div', { class: 'note' }, hasRead
    ? 'Okunuşlar yalnızca yardımcıdır; Arapça seslerin tamamı Latin harfleriyle tam karşılanamaz. Doğru tecvid için bir hocadan ya da güvenilir kıraat kayıtlarından yararlan.'
    : 'Kıraat: Mişari Raşid el-Afasi. Bu surenin sesi internetten çalınır. Meal: Diyanet İşleri Başkanlığı. Metin: Medine Mushafı.'));
}
function ayahRow(su, i) {
  const a = su.ayahs[i];
  return h('div', { class: 'ayah-row', id: 'row-' + i },
    h('div', { class: 'ayah-head' }, h('div', { class: 'ayah-btns' }, speakBtn('@' + su.akey(i), 'sm'),
      Recite.Speech.available() ? h('button', { class: 'mic sm', 'aria-label': 'Okumamı kontrol et', html: MIC_SVG,
        onclick: e => readerCheck(e.currentTarget.closest('.ayah-row'), a.ar, e.currentTarget, { surah: su.no, ayah: i + 1, firstWord: 0 }) }) : null),
      h('span', { class: 'ar', lang: 'ar' }, a.ar + ' ', h('span', { class: 'end' }, '﴿' + arDigits(i + 1) + '﴾'))),
    READER.read && a.read ? h('div', { class: 'tr' }, `${i + 1}. ${a.read}`) : null,
    READER.mean ? h('div', { class: 'mn' }, `${i + 1}. ${a.mean}`) : null);
}
function playSurah(su) {
  const clear = () => document.querySelectorAll('.reader .playing').forEach(e => e.classList.remove('playing'));
  const btn = $('#playall');
  if (READER.playAll) { READER.playAll = false; TTS.stop(); clear(); if (btn) { btn.classList.remove('on'); btn.textContent = '▶ Tamamını dinle'; } return; }
  READER.playAll = true;
  if (btn) { btn.classList.add('on'); btn.textContent = '■ Durdur'; }
  const n = su.no;
  const queue = (n !== 1 && n !== 9 ? [['@besmele', 'row-besmele']] : []).concat(su.ayahs.map((_, i) => ['@' + su.akey(i), 'row-' + i]));
  const step = k => {
    clear();
    if (k >= queue.length || !READER.playAll || READER.surah !== n) { READER.playAll = false; const b = $('#playall'); if (b) { b.classList.remove('on'); b.textContent = '▶ Tamamını dinle'; } return; }
    let row = document.getElementById(queue[k][1]);
    if (!row && queue[k][1].startsWith('row-')) { const mb = document.querySelector('.reader .btn.ghost'); if (mb && !mb.hidden) mb.click(); row = document.getElementById(queue[k][1]); }
    if (row) { row.classList.add('playing'); row.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    TTS.say(queue[k][0], () => step(k + 1));
  };
  step(0);
}

/* ---- Ezberle: parts × 3 levels ---- */
const LVL = [[1, 'Boşluk'], [2, 'Eksik'], [3, 'Oku']];
function partDone(n, p, lvl) { return !!S.done[Q.lessonId(n, p, lvl)]; }
function drawEzberParts(body, su) {
  const parts = Q.parts(su.no);
  const doneParts = parts.filter((_, p) => partDone(su.no, p, 3)).length;
  body.append(h('div', { class: 'ez-sum' },
    h('div', { class: 'ez-bar' }, h('i', { style: `width:${Math.round(doneParts / parts.length * 100)}%` })),
    h('span', null, `${doneParts}/${parts.length} bölüm ezberlendi`)),
    h('p', { class: 'note', style: 'margin-top:8px' }, 'Her bölümde üç adım var: boşluk doldur, eksik kelimeleri yerleştir, ezberden oku. Bir adımı bitirince sıradaki açılır.'));
  const list = h('div', { class: 'ez-parts' });
  parts.forEach(([a, b], p) => {
    const row = h('div', { class: 'ez-part' + (partDone(su.no, p, 3) ? ' done' : '') },
      h('div', { class: 'ez-pt' }, h('b', null, a + 1 === b ? `${a + 1}. ayet` : `${a + 1}–${b}. ayetler`),
        h('span', { class: 'ar', lang: 'ar' }, su.ayahs[a].ar.split(' ').slice(0, 4).join(' ') + (su.ayahs[a].ar.split(' ').length > 4 ? ' …' : ''))),
      h('div', { class: 'ez-lv' }, LVL.map(([lvl, name]) => {
        const id = Q.lessonId(su.no, p, lvl);
        const open = lvl === 1 || partDone(su.no, p, lvl - 1);
        const st = (S.stars || {})[id] || 0;
        return h('button', { class: 'lv' + (st ? ' got' : '') + (open ? '' : ' locked'), 'aria-label': `${name}${open ? '' : ' (kilitli)'}`,
          onclick: () => open ? startLesson(qLesson(su, p, lvl, [a, b])) : toast('Önce bir önceki adımı bitir.') },
          h('span', { class: 'lv-n' }, open ? String(lvl) : '', open ? null : h('span', { html: I.lock, class: 'lv-lock' })),
          h('small', null, name),
          h('span', { class: 'lv-st' }, [1, 2, 3].map(k => h('span', { class: k <= st ? 'on' : '', html: STAR_SVG }))));
      })));
    list.append(row);
  });
  body.append(list);
}
function qLesson(su, p, lvl, range) {
  const title = `${su.name} ${range[0] + 1}–${range[1]} · ${LVL[lvl - 1][1]}`;
  return { id: Q.lessonId(su.no, p, lvl), title, kind: 'ezber', q: su.no, range, level: lvl, unit: { id: 'q-' + su.no, title: su.name } };
}
