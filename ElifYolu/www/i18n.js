/* Elif Yolu — çok dilli arayüz (tr, en, de, es, ru, ar)
   The game is written in Turkish. For other languages the Turkish text is the key:
   every text node and placeholder/aria-label that appears in the page is looked up
   (exact match, then patterns with {0}{1}… for numbers and names) and replaced.
   Lesson content (letter names, transliterations, meanings, meals) is swapped at the
   data level by applyContent(), because short readings like "su" would be ambiguous. */
'use strict';

const I18N = (() => {
  const LANGS = ['tr', 'en', 'de', 'es', 'ru', 'ar'];
  const NAMES = { tr: 'Türkçe', en: 'English', de: 'Deutsch', es: 'Español', ru: 'Русский', ar: 'العربية' };
  const KEY = 'elifyolu.lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (!LANGS.includes(lang)) {
    let existing = false;
    try { existing = !!localStorage.getItem('elifyolu.v1'); } catch (e) { /* ignore */ }
    const nav = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    // players from before v1.4 keep Turkish; new players get their device language
    lang = existing ? 'tr' : (LANGS.find(l => nav.startsWith(l)) || (nav ? 'en' : 'tr'));
  }
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const dict = new Map(), pats = [];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function add(l, d) {
    if (l !== lang) return;
    for (const [k, v] of Object.entries(d)) {
      if (!/\{\d\}/.test(k)) { dict.set(k, v); continue; }
      const order = [];
      const src = k.split(/(\{\d\})/).map(p => /^\{\d\}$/.test(p) ? (order.push(+p[1]), '([\\s\\S]+?)') : esc(p)).join('');
      pats.push({ re: new RegExp('^' + src + '$'), order, v, lit: k.replace(/\{\d\}/g, '').length });
    }
    pats.sort((a, b) => b.lit - a.lit);
  }
  function t(s, depth = 0) {
    if (lang === 'tr' || s == null) return s;
    s = String(s);
    const m0 = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m0[2];
    if (!core) return s;
    let r = dict.get(core);
    if (r == null && depth < 3 && core.length < 300 && /[A-Za-zÀ-ɏ]/.test(core)) {
      for (const p of pats) {
        const m = p.re.exec(core);
        if (!m) continue;
        const vals = [];
        p.order.forEach((n, i) => { vals[n] = m[i + 1]; });
        r = p.v.replace(/\{(\d)\}/g, (_, n) => t(vals[n], depth + 1));
        break;
      }
    }
    return r == null ? s : m0[1] + r + m0[3];
  }
  // fill a translated template from code: I18N.f('{0}. ayet', [3])
  const f = (key, vals) => t(key).replace(/\{(\d)\}/g, (_, n) => vals[n]);

  const ATTRS = ['placeholder', 'aria-label', 'title'];
  function node(n) {
    if (n.nodeType === 3) {
      const v = n.nodeValue;
      if (collect) collect.add(v.trim());
      const r = t(v);
      if (r !== v) n.nodeValue = r;
      return;
    }
    if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
    for (const a of ATTRS) {
      const v = n.getAttribute(a);
      if (!v) continue;
      if (collect) collect.add(v.trim());
      const r = t(v);
      if (r !== v) n.setAttribute(a, r);
    }
    if (n.lang === 'ar' && n.classList.contains('ar')) return;   // Qur'an text
    for (let c = n.firstChild; c; c = c.nextSibling) node(c);
  }
  let collect = null;
  function start() {
    collect = window.__i18nCollect || null;   // tests: gather every Turkish string shown
    if (lang === 'tr' && !collect) return;
    node(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'characterData') node(m.target);
        else m.addedNodes.forEach(node);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function set(l) {
    if (!LANGS.includes(l)) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    location.reload();
  }

  /* ---- lesson content ---- */
  const content = {};   // filled by i18n/<lang>.js
  function applyContent() {
    if (lang === 'tr') return;
    const C = content;
    if (C.letters) LETTERS.forEach(l => { const x = C.letters[l.ar]; if (x) { l.name = x[0]; l.hint = x[1]; } });
    if (C.syl) Object.values(HARAKAT).flat().forEach(s => { if (s.ar in C.syl) s.read = C.syl[s.ar]; });
    if (C.marks) Object.values(MARK_INFO).forEach(m => { if (C.marks[m.sign] != null) m.text = C.marks[m.sign]; });
    if (C.words) [...WORDS1, ...WORDS2].forEach(w => { const x = C.words[w.ar]; if (x) { w.read = x[0]; w.mean = x[1]; } });
    for (const [k, su] of Object.entries(SURAHS)) {
      const x = C.surahs && C.surahs[k];
      if (!x) continue;
      su.name = x.name;
      su.ayahs.forEach((a, i) => { a.read = x.read ? x.read[i] : null; a.mean = x.mean ? x.mean[i] : null; });
    }
  }
  const noReads = () => lang === 'ar';   // Arabic speakers read the script itself

  if (lang !== 'tr') document.write('<script src="i18n/' + lang + '.js"><\/script><script src="quran/names/' + lang + '.js"><\/script>');
  return { lang, LANGS, NAMES, add, t, f, set, start, content, applyContent, noReads, dict };
})();
