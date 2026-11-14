/* Elif Yolu — Ezber (memorisation) lessons and the recitation check UI */
'use strict';

/* ---------------- generators ---------------- */
function ezWords(su) { return su.ayahs.map(a => a.ar.split(' ')); }
function ezDistractors(su, exclude, n) {
  const own = uniqBy(ezWords(su).flat(), x => x).filter(w => !exclude.includes(w));
  const other = uniqBy(Object.values(SURAHS).filter(s => s !== su).flatMap(s => s.ayahs.flatMap(a => a.ar.split(' '))), x => x)
    .filter(w => !exclude.includes(w) && !own.includes(w));
  const picked = sample(own, Math.min(n, own.length));
  return picked.concat(sample(other, n - picked.length));
}
// words worth hiding: skip one-letter particles, prefer content words
function ezHideable(words) {
  const idx = words.map((w, k) => k).filter(k => Recite.norm(words[k]).length >= 3);
  return idx.length ? idx : words.map((_, k) => k);
}
function ezChoiceBlank(su, key, i) {
  const words = su.ayahs[i].ar.split(' ');
  const k = pick(ezHideable(words));
  const opts = shuffle([words[k], ...ezDistractors(su, [words[k]], 3)]);
  return C({ ayahKey: `${key}:${i}`, label: `${su.name} · ${i + 1}. ayet`, title: 'Boşluğa hangi kelime gelir?', arOpts: true, layout: 'grid2',
    options: opts, answer: opts.indexOf(words[k]), reveal: su.ayahs[i].ar,
    bigNode: () => h('div', { class: 'big-ar ayah blank-ayah' }, words.map((w, j) => j === k ? h('span', { class: 'gap' }, ' ') : w + ' ')) });
}
function ezBlanks(su, key, i, ratio) {
  const words = su.ayahs[i].ar.split(' ');
  const can = ezHideable(words);
  const n = Math.max(1, Math.min(can.length, Math.round(words.length * ratio), words.length >= 4 ? 99 : 1));
  const hide = sample(can, Math.max(n, words.length >= 4 ? 2 : 1)).sort((a, b) => a - b);
  const need = hide.map(k => words[k]);
  const bank = shuffle([...need, ...ezDistractors(su, need, Math.min(3, 1 + Math.ceil(hide.length / 2)))]);
  return { type: 'blanks', ayahKey: `${key}:${i}`, label: `${su.name} · ${i + 1}. ayet`, title: 'Eksik kelimeleri sırayla yerleştir', words, hide, bank };
}
function ezNext(su, key, i) {
  const A = su.ayahs, nxt = A[i + 1];
  const others = Object.values(SURAHS).filter(s => s !== su).flatMap(s => s.ayahs);
  const pool = fill([nxt, ...A.filter((_, j) => j !== i && j !== i + 1)], others, LKEY, 3);
  return C({ ayahKey: `${key}:${i + 1}`, label: 'Sıradaki ayet', title: 'Bu ayetten sonra hangisi gelir?', big: A[i].ar, bigClass: 'ayah', say: `@${key}:${i}`,
    arOpts: true, longOpts: true, layout: 'list', ...choice(nxt, pool, LKEY, 3) });
}
function ezRecite(su, key, i, hidden) {
  return { type: 'recite', ayahKey: `${key}:${i}`, su, key, i, hidden, soft: true, label: `${su.name} · ${i + 1}. ayet`,
    title: hidden ? `${i + 1}. ayeti ezberden oku` : `${i + 1}. ayeti oku` };
}
function ezIntro(su, level) {
  const T = {
    1: ['Ezber 1', 'Boşluk doldur', 'Ayetler sırayla gelecek; her birinde bir kelime eksik. Sureyi bölüm bölüm hafızana yerleştir.'],
    2: ['Ezber 2', 'Eksik kelimeler', 'Bu sefer birden fazla kelime eksik. Kelimeleri ayetteki sırasıyla yerleştir.'],
    3: ['Ezber 3', 'Ezberden oku', Recite.Speech.available()
      ? 'Mikrofon düğmesine bas ve ayeti ezberden oku. Uygulama okuduğunu dinleyip kelime kelime kontrol eder; doğru kelimeler yeşil, yanlış ya da atlanan kelimeler kırmızı görünür.'
      : 'Ayeti yüksek sesle ezberden oku, sonra doğrusunu görüp dinleyerek kendini kontrol et. (Bu cihazda konuşma tanıma bulunamadı.)'],
  }[level];
  return { type: 'intro', build: () => h('div', { class: 'intro' },
    h('span', { class: 'badge' }, T[0]),
    h('div', { class: 'big-ar mid' }, SURAH_AR[ezKey(su)]),
    h('h2', null, `${su.name}: ${T[1]}`),
    h('p', { class: 'sub' }, T[2])) };
}
const ezKey = su => Object.keys(SURAHS).find(k => SURAHS[k] === su);

function genEzber(ls) {
  const su = SURAHS[ls.surah], K = ls.surah, A = su.ayahs, out = [ezIntro(su, ls.level)];
  const idx = A.map((_, i) => i);
  if (ls.level === 1) {
    idx.forEach(i => out.push(ezChoiceBlank(su, K, i)));
    const extra = sample(idx.filter(i => A[i].ar.split(' ').length >= 3), Math.max(0, Math.min(4, 10 - A.length)));
    extra.sort((a, b) => a - b).forEach(i => out.push(ezBlanks(su, K, i, 0.3)));
    if (out.length < 7 && A.length > 1) out.push(ezNext(su, K, rnd(A.length - 1)));
  } else if (ls.level === 2) {
    idx.forEach(i => out.push(ezBlanks(su, K, i, 0.5)));
    const nexts = sample(idx.slice(0, -1), Math.min(3, A.length - 1)).sort((a, b) => a - b);
    nexts.forEach(i => out.push(ezNext(su, K, i)));
  } else {
    idx.forEach(i => out.push(ezRecite(su, K, i, true)));
  }
  return out;
}
GEN.ezber = genEzber;

/* ---------------- renderer: blanks ---------------- */
RENDER.blanks = function renderBlanks(q, body, foot) {
  promptBlock(q, body);
  const filled = q.hide.map(() => null);          // tile element per blank
  const line = h('div', { class: 'big-ar ayah blank-ayah ez-line', lang: 'ar' });
  const bank = h('div', { class: 'bank' });
  const gaps = [];
  q.words.forEach((w, j) => {
    const bi = q.hide.indexOf(j);
    if (bi < 0) { line.append(w + ' '); return; }
    const g = h('button', { class: 'gap slot', 'aria-label': `${bi + 1}. boşluk`, onclick: () => {
      if (LS.locked || !filled[bi]) return;
      sfx.tap(); filled[bi].classList.remove('ph'); filled[bi] = null; draw();
    } });
    gaps.push(g); line.append(g, ' ');
  });
  const draw = () => {
    const cur = filled.indexOf(null);
    gaps.forEach((g, bi) => { g.textContent = filled[bi] ? filled[bi].textContent : ' '; g.classList.toggle('filled', !!filled[bi]); g.classList.toggle('cur', bi === cur); });
    chk.disabled = cur !== -1;
  };
  q.bank.forEach(t => {
    const b = h('button', { class: 'tile', onclick: () => {
      if (LS.locked || b.classList.contains('ph')) return;
      const cur = filled.indexOf(null);
      if (cur < 0) return;
      sfx.tap(); b.classList.add('ph'); filled[cur] = b; draw();
    } }, t);
    bank.append(b);
  });
  body.append(line, bank);
  const chk = h('button', { class: 'btn', disabled: true, onclick: () => {
    if (LS.locked) return;
    let ok = true;
    gaps.forEach((g, bi) => { const right = filled[bi].textContent === q.words[q.hide[bi]]; ok = ok && right; g.classList.add(right ? 'good' : 'bad'); });
    if (!ok) q.bank = shuffle(q.bank);
    judge(ok, q, q.words.join(' '), true);
  } }, 'Kontrol et');
  foot.append(chk);
  draw();
};

/* ---------------- renderer: recite ---------------- */
const MIC_SVG = '<svg viewBox="0 0 24 24"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const STOP_SVG = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/></svg>';

// coloured ayah: each expected word marked ok / wrong / missing
function ayahMarked(text, status) {
  const ws = text.split(' ');
  return h('div', { class: 'big-ar ayah marked', lang: 'ar' }, ws.map((w, j) => [h('span', { class: 'w ' + (status ? status[j] : '') }, w), ' ']));
}
function ayahMasked(text, shown) {
  const ws = text.split(' ');
  return h('div', { class: 'big-ar ayah masked', lang: 'ar' }, ws.map((w, j) => [j < shown ? h('span', { class: 'w' }, w) : h('span', { class: 'w hid' }, w), ' ']));
}

/* One listening session against one ayah. Calls back with the alignment result. */
function listenFor(expected, ui, done) {
  TTS.stop();
  let finished = false, last = [];
  const finish = (texts, err) => {
    if (finished) return; finished = true;
    ui.mic.classList.remove('live'); ui.mic.innerHTML = MIC_SVG;
    if (err) return done(null, err);
    done(Recite.best(expected, texts.length ? texts : last));
  };
  ui.mic.classList.add('live'); ui.mic.innerHTML = STOP_SVG;
  ui.live.textContent = 'Dinliyorum…';
  ui.live.classList.remove('err');
  Recite.Speech.start(ev => {
    if (ev.type === 'partial' && ev.texts && ev.texts[0]) { last = ev.texts; ui.live.textContent = ev.texts[0]; }
    else if (ev.type === 'final') finish(ev.texts || []);
    else if (ev.type === 'end' && !last.length) { /* engine ended without text: wait for error/final */ }
    else if (ev.type === 'end' && last.length) setTimeout(() => finish(last), 900);
    else if (ev.type === 'error') {
      if (last.length && (ev.error === 'nomatch' || ev.error === 'silence')) finish(last);
      else finish([], ev.error);
    }
  });
  return () => { if (!finished) Recite.Speech.stop(); };
}

RENDER.recite = function renderRecite(q, body, foot) {
  const text = q.su.ayahs[q.i].ar;
  const can = Recite.Speech.available();
  body.append(h('div', { class: 'q-label' }, q.label), h('h2', { class: 'q-title' }, q.title));
  let shown = 0, attempts = 0;
  const stage = h('div', { class: 'ez-stage' });
  const showMasked = () => { stage.innerHTML = ''; stage.append(q.hidden ? ayahMasked(text, shown) : ayahMarked(text, null)); };
  showMasked();
  body.append(stage);
  const mean = h('div', { class: 'hint-mean' }, q.su.ayahs[q.i].mean);
  body.append(mean);
  const msg = h('div', { class: 'ez-msg', role: 'status' });
  body.append(msg);
  const listenAyah = () => TTS.say('@' + q.ayahKey);

  if (!can) {   // self-check fallback
    msg.innerHTML = '';
    msg.append(h('div', { class: 'ez-note' }, 'Bu cihazda konuşma tanıma yok: ayeti yüksek sesle ezberden oku, sonra doğrusunu açıp kendini kontrol et.'));
    const reveal = h('button', { class: 'btn blue', onclick: () => {
      stage.innerHTML = ''; stage.append(ayahMarked(text, null)); listenAyah();
      foot.innerHTML = '';
      foot.append(h('div', { class: 'ez-row' },
        h('button', { class: 'btn ghost', onclick: () => judge(false, q, text, true) }, 'Hata yaptım'),
        h('button', { class: 'btn', onclick: () => judge(true, q) }, 'Doğru okudum')));
    } }, 'Okudum, doğrusunu göster');
    foot.append(reveal);
    return;
  }

  const live = h('div', { class: 'ez-live', lang: 'ar', dir: 'rtl' });
  const mic = h('button', { class: 'mic', 'aria-label': 'Okumaya başla', html: MIC_SVG });
  const hint = q.hidden ? h('button', { class: 'chip', onclick: () => { if (shown < text.split(' ').length) { shown++; showMasked(); q._hinted = true; } } }, 'İpucu: sonraki kelime') : null;
  body.append(h('div', { class: 'mic-wrap' }, mic, h('div', { class: 'mic-cap' }, 'Bas, ayeti oku, bitince tekrar bas')), live);
  let stop = null;
  LS.cleanup = () => { if (stop) stop(); Recite.Speech.cancel(); };
  const result = (r, err) => {
    stop = null;
    if (err) {
      live.textContent = Recite.errText(err); live.classList.add('err');
      if (err === 'permission' || err === 'unavailable' || err === 'language') { skip.hidden = false; }
      return;
    }
    attempts++;
    live.textContent = '';
    stage.innerHTML = ''; stage.append(ayahMarked(text, r.status));
    const okN = r.ok, tot = r.total;
    msg.innerHTML = '';
    if (Recite.passed(r)) {
      msg.append(h('div', { class: 'ez-score good' }, `${okN}/${tot} kelime doğru`));
      Haptic.play('light');
      judge(true, q);
    } else {
      Haptic.play('error');
      msg.append(h('div', { class: 'ez-score bad' }, okN ? `${okN}/${tot} kelime doğru. Kırmızı kelimelere dikkat et.` : 'Okuduğun bu ayetle eşleşmedi.'),
        h('div', { class: 'ez-row' },
          h('button', { class: 'chip', onclick: listenAyah }, 'Doğrusunu dinle'),
          h('button', { class: 'chip', onclick: () => { msg.innerHTML = ''; shown = 0; showMasked(); } }, 'Tekrar dene')));
      if (attempts >= 2) skip.hidden = false;
    }
  };
  mic.onclick = () => {
    if (LS.locked) return;
    if (stop) { stop(); return; }
    msg.innerHTML = '';
    stop = listenFor(text, { mic, live }, result);
  };
  const skip = h('button', { class: 'btn ghost', hidden: true, onclick: () => { if (stop) stop(); Recite.Speech.cancel(); judge(false, q, text, true); } }, 'Şimdilik geç');
  if (hint) foot.append(h('div', { class: 'ez-row', style: 'margin-bottom:10px' }, hint, h('button', { class: 'chip', onclick: listenAyah }, 'Dinle')));
  foot.append(skip);
};

/* ---------------- reader: "okumamı kontrol et" per ayah ---------------- */
function readerCheck(row, text, btn) {
  if (!Recite.Speech.available()) { toast('Bu cihazda konuşma tanıma yok.'); return; }
  if (row._stop) { row._stop(); return; }
  let out = row.querySelector('.rc-out');
  if (!out) { out = h('div', { class: 'rc-out' }); row.append(out); }
  const live = h('div', { class: 'ez-live small', lang: 'ar', dir: 'rtl' });
  out.innerHTML = ''; out.append(live);
  row._stop = listenFor(text, { mic: btn, live }, (r, err) => {
    row._stop = null;
    if (err) { live.textContent = Recite.errText(err); live.classList.add('err'); return; }
    out.innerHTML = '';
    out.append(ayahMarked(text, r.status), h('div', { class: 'ez-score ' + (Recite.passed(r) ? 'good' : 'bad') },
      Recite.passed(r) ? `Doğru okudun · ${r.ok}/${r.total} kelime` : `${r.ok}/${r.total} kelime doğru. Kırmızı kelimeleri tekrar et.`));
    Haptic.play(Recite.passed(r) ? 'light' : 'error');
  });
}
