/* Elif Yolu — okuma kontrolü (recitation check)
   1) Arabic text normalisation that makes Quranic (Uthmani-style, fully vowelled)
      text comparable with what a speech recogniser writes (plain, unvowelled).
   2) Word alignment: every expected word is marked ok / wrong / missing.
   3) Speech: one API over Android (SpeechRecognizer), iOS (SFSpeechRecognizer)
      and browsers (Web Speech API). */
'use strict';

const Recite = (() => {
  const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
  function norm(s) {
    return String(s || '').normalize('NFC')
      .replace(MARKS, '')
      .replace(/[آأإٱٲٳ]/g, 'ا') // آ أ إ ٱ → ا
      .replace(/ى/g, 'ي')   // ى → ي
      .replace(/ة/g, 'ه')   // ة → ه
      .replace(/ؤ/g, 'و')   // ؤ → و
      .replace(/ئ/g, 'ي')   // ئ → ي
      .replace(/ء/g, '')         // lone hamza
      .replace(/[^ء-ي\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  const words = s => { const n = norm(s); return n ? n.split(' ') : []; };

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // similarity of two normalised words, 0..1. Recognisers often drop or add the
  // article and long vowels, so compare with and without a leading "ال" too.
  function sim(a, b) {
    if (a === b) return 1;
    const strip = w => (w.length > 3 && w.startsWith('ال') ? w.slice(2) : w);
    let best = 0;
    for (const [x, y] of [[a, b], [strip(a), strip(b)]]) {
      const d = lev(x, y), L = Math.max(x.length, y.length);
      best = Math.max(best, L ? 1 - d / L : 1);
    }
    return best;
  }
  const same = (e, h) => sim(e, h) >= (Math.min(e.length, h.length) <= 3 ? 0.66 : 0.72);

  /* Align expected words with heard words (edit-distance DP over words).
     Returns per expected word: 'ok' | 'wrong' | 'missing' plus a score. */
  function align(expectedText, heardText) {
    const E = words(expectedText), H = words(heardText);
    const m = E.length, n = H.length;
    const D = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const B = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(''));
    for (let i = 1; i <= m; i++) { D[i][0] = i; B[i][0] = 'del'; }
    for (let j = 1; j <= n; j++) { D[0][j] = j * 0.5; B[0][j] = 'ins'; }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const ok = same(E[i - 1], H[j - 1]);
        const opts = [[D[i - 1][j - 1] + (ok ? 0 : 1), ok ? 'ok' : 'sub'], [D[i - 1][j] + 1, 'del'], [D[i][j - 1] + 0.5, 'ins']];
        opts.sort((a, b) => a[0] - b[0]);
        D[i][j] = opts[0][0]; B[i][j] = opts[0][1];
      }
    }
    const status = new Array(m).fill('missing');
    let i = m, j = n, extra = 0;
    while (i > 0 || j > 0) {
      const b = B[i][j];
      if (b === 'ok') { status[i - 1] = 'ok'; i--; j--; }
      else if (b === 'sub') { status[i - 1] = 'wrong'; i--; j--; }
      else if (b === 'del') { status[i - 1] = 'missing'; i--; }
      else { extra++; j--; }
    }
    const ok = status.filter(s => s === 'ok').length;
    return { status, ok, total: m, extra, score: m ? ok / m : 0, heard: H.join(' ') };
  }
  // pick the recogniser alternative that matches best
  function best(expectedText, texts) {
    let top = null;
    for (const t of texts || []) {
      const r = align(expectedText, t);
      if (!top || r.score > top.score || (r.score === top.score && r.extra < top.extra)) top = r;
    }
    return top || align(expectedText, '');
  }
  // Memorisation check: every word of the ayah must be there and recognised.
  // (Small spelling noise from the recogniser is already tolerated by sim().)
  // Tested on Whisper transcripts: catches 44/44 skipped/swapped/wrong-ayah
  // readings and accepts 47/50 correct ones (tools/asr_eval.js).
  const PASS = 1;
  const passed = r => r.total > 0 && r.ok === r.total && r.extra <= Math.max(2, Math.ceil(r.total * 0.5));

  /* ---------------- speech engines ---------------- */
  let handler = null;
  window.__speech = ev => { if (handler) handler(ev); };

  function kind() {
    try { if (window.Android && Android.speechAvailable && Android.speechAvailable()) return 'android'; } catch (e) { /* old app */ }
    if (window.__iosSpeech && window.webkit && webkit.messageHandlers && webkit.messageHandlers.native) return 'ios';
    if (window.SpeechRecognition || window.webkitSpeechRecognition) return 'web';
    return null;
  }

  let webRec = null;
  function webStart() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = webRec = new SR();
    r.lang = 'ar-SA'; r.interimResults = true; r.continuous = true; r.maxAlternatives = 5;
    let finals = [];  // per result index: array of alternatives
    const joined = () => {
      const n = Math.max(1, ...finals.map(a => a.length));
      const out = [];
      for (let k = 0; k < n; k++) out.push(finals.map(a => a[Math.min(k, a.length - 1)]).join(' '));
      return out;
    };
    r.onstart = () => window.__speech({ type: 'ready' });
    r.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        finals[i] = Array.from(e.results[i]).map(x => x.transcript);
      }
      window.__speech({ type: 'partial', texts: joined() });
    };
    r.onerror = e => window.__speech({ type: 'error', error: e.error === 'not-allowed' ? 'permission' : e.error === 'no-speech' ? 'silence' : e.error === 'network' ? 'network' : String(e.error) });
    r.onend = () => { webRec = null; window.__speech({ type: finals.length ? 'final' : 'end', texts: joined() }); };
    try { r.start(); window.__speech({ type: 'start' }); } catch (e) { window.__speech({ type: 'error', error: 'busy' }); }
  }

  const Speech = {
    kind,
    available: () => !!kind(),
    start(onEvent) {
      handler = onEvent;
      const k = kind();
      if (k === 'android') Android.startSpeech();
      else if (k === 'ios') webkit.messageHandlers.native.postMessage({ cmd: 'speechStart' });
      else if (k === 'web') webStart();
      else onEvent({ type: 'error', error: 'unavailable' });
    },
    stop() {
      const k = kind();
      if (k === 'android') Android.stopSpeech();
      else if (k === 'ios') webkit.messageHandlers.native.postMessage({ cmd: 'speechStop' });
      else if (webRec) webRec.stop();
    },
    cancel() { handler = null; try { Speech.stop(); } catch (e) { /* ignore */ } },
  };

  const ERR_TEXT = {
    permission: 'Mikrofon izni verilmedi. Telefon ayarlarından Elif Yolu için mikrofon iznini aç.',
    network: 'Konuşma tanıma için internet bağlantısı gerekiyor.',
    language: 'Cihazında Arapça konuşma tanıma yok. Ayarlardan Arapça ses tanıma paketini ekleyebilirsin.',
    silence: 'Ses duyulmadı. Mikrofona yakın, yüksek sesle oku.',
    nomatch: 'Okuduğun anlaşılamadı. Biraz daha yavaş ve net okumayı dene.',
    unavailable: 'Bu cihazda konuşma tanıma bulunamadı.',
    busy: 'Mikrofon şu an meşgul, bir daha dene.',
  };
  const errText = c => ERR_TEXT[c] || 'Dinleme sırasında bir sorun oldu. Bir daha dene.';

  return { norm, words, sim, align, best, passed, PASS, Speech, errText };
})();
if (typeof module !== 'undefined') module.exports = Recite;
