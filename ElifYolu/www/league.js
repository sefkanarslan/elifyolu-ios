/* Elif Yolu — çevrimiçi başarı sıralaması (Supabase REST, no SDK)
   Players sign in anonymously (no e-mail), pick a nickname, and their XP is
   upserted into public.players. Row-level security lets each player write only
   their own row; everyone can read the table. */
'use strict';

const League = (() => {
  const CFG = window.LEAGUE_CFG || {};
  const ON = !!(CFG.url && CFG.key);
  const base = String(CFG.url || '').replace(/\/+$/, '');
  let busy = null, again = false;

  const auth = () => S.player && S.player.auth;
  async function call(path, opts = {}) {
    const headers = Object.assign({ apikey: CFG.key, 'Content-Type': 'application/json' }, opts.headers || {});
    const a = auth();
    if (opts.user !== false && a && a.access_token) headers.Authorization = 'Bearer ' + a.access_token;
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 12000) : null;
    try {
      const r = await fetch(base + path, { method: opts.method || 'GET', headers, body: opts.body ? JSON.stringify(opts.body) : undefined, signal: ctl ? ctl.signal : undefined });
      const text = await r.text();
      let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      return { ok: r.ok, status: r.status, data, headers: r.headers };
    } finally { if (timer) clearTimeout(timer); }
  }
  function keep(sess) {
    S.player.auth = { access_token: sess.access_token, refresh_token: sess.refresh_token,
      expires_at: Date.now() + (sess.expires_in || 3600) * 1000 - 60000, uid: (sess.user && sess.user.id) || S.player.auth && S.player.auth.uid };
    save();
  }
  async function session() {
    const a = auth();
    if (a && a.access_token && a.expires_at > Date.now()) return true;
    if (a && a.refresh_token) {
      const r = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: a.refresh_token }, user: false });
      if (r.ok && r.data && r.data.access_token) { keep(r.data); return true; }
    }
    const r = await call('/auth/v1/signup', { method: 'POST', body: { data: {} }, user: false });
    if (r.ok && r.data && r.data.access_token) { keep(r.data); return true; }
    throw new Error(r.status === 422 || r.status === 400 ? 'anon-disabled' : 'auth-' + r.status);
  }
  function row() {
    const wk = isoWeek();
    const wxp = S.week && S.week.key === wk ? S.week.xp : 0;
    const stars = Object.values(S.stars || {}).reduce((a, b) => a + b, 0);
    return { id: auth().uid, name: S.player.name, xp: S.xp, week: wk, week_xp: wxp, stars, streak: S.streak, lessons: Object.keys(S.done).length };
  }
  async function push() {
    await session();
    const r = await call('/rest/v1/players?on_conflict=id', { method: 'POST', body: row(), headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } });
    if (!r.ok) {
      const msg = r.data && (r.data.message || r.data.hint) || '';
      if (/duplicate key.*name|players_name_key/i.test(msg)) throw new Error('name-taken');
      throw new Error('write-' + r.status + (msg ? ': ' + msg : ''));
    }
    S.player.synced = Date.now(); S.player.dirty = false; save();
  }
  function sync() {
    if (!ON || !S.player || !S.player.name) return Promise.resolve(false);
    S.player.dirty = true; save();
    if (busy) { again = true; return busy; }
    busy = push().then(() => true, () => false).finally(() => { busy = null; if (again) { again = false; sync(); } });
    return busy;
  }
  async function top(scope) {
    const wk = isoWeek();
    const q = scope === 'week'
      ? `/rest/v1/players?select=id,name,week_xp,stars&week=eq.${wk}&week_xp=gt.0&order=week_xp.desc,updated_at.asc&limit=50`
      : '/rest/v1/players?select=id,name,xp,stars&order=xp.desc,updated_at.asc&limit=50';
    const r = await call(q, { user: false });
    if (!r.ok) throw new Error('read-' + r.status);
    const rows = r.data || [];
    let me = null;
    const uid = auth() && auth().uid;
    if (uid && !rows.some(x => x.id === uid)) {
      const mine = row(), val = scope === 'week' ? mine.week_xp : mine.xp;
      const c = await call(`/rest/v1/players?select=id${scope === 'week' ? `&week=eq.${wk}&week_xp=gt.${val}` : `&xp=gt.${val}`}`,
        { user: false, headers: { Prefer: 'count=exact', Range: '0-0' } });
      const cr = c.headers && c.headers.get('content-range');
      const n = cr ? parseInt(cr.split('/')[1], 10) : NaN;
      if (!isNaN(n) && val > 0) me = { rank: n + 1, name: mine.name, val, stars: mine.stars };
    }
    return { rows, me, uid };
  }
  return { on: ON, sync, top, session, push };
})();

/* ---------------- Sıralama sekmesi ---------------- */
const LB = { scope: 'week', cache: {} };
function nameModal(after) {
  const inp = h('input', { id: 'lb-name', class: 'inp', maxlength: '18', placeholder: 'ör. Elif Hafız', autocomplete: 'off', value: (S.player && S.player.name) || '' });
  const err = h('div', { class: 'inp-err', role: 'alert' });
  const go = async () => {
    const v = inp.value.trim().replace(/\s+/g, ' ');
    if (v.length < 2) { err.textContent = 'En az 2 harf yaz.'; return; }
    if (!/^[\p{L}\p{N} ._-]+$/u.test(v)) { err.textContent = 'Sadece harf, rakam, boşluk, nokta ve tire kullan.'; return; }
    const prev = S.player && S.player.name;
    S.player = Object.assign(S.player || {}, { name: v }); save();
    btn.disabled = true; btn.textContent = 'Kaydediliyor…';
    try { await League.push(); closeModal(); if (after) after(); }
    catch (e) {
      btn.disabled = false; btn.textContent = 'Kaydet';
      S.player.name = prev || null; save();
      err.textContent = e.message === 'name-taken' ? 'Bu takma ad alınmış, başka bir tane dene.'
        : e.message === 'anon-disabled' ? 'Sıralama sunucusu misafir girişine kapalı. (Supabase: Anonymous sign-ins)'
        : 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.';
    }
  };
  const btn = h('button', { class: 'btn', onclick: go }, 'Kaydet');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  showModal([h('h3', null, 'Sıralamada görünecek adın'), h('p', null, 'Gerçek adını yazmak zorunda değilsin; bir takma ad yeterli. Herkes bu adı ve XP\'ni görür.'), inp, err, btn,
    h('button', { class: 'btn ghost', onclick: closeModal }, 'Vazgeç')]);
  setTimeout(() => inp.focus(), 50);
}
function renderLeague(v) {
  const page = h('div', { class: 'page lb' });
  v.append(page);
  page.append(h('h1', null, 'Sıralama'));
  if (!League.on) { page.append(h('p', { class: 'lead' }, 'Çevrimiçi sıralama bu sürümde bağlı değil.')); return; }
  if (!S.player || !S.player.name) {
    page.append(h('div', { class: 'lb-join' }, h('div', { html: I.trophy, class: 'lb-trophy' }),
      h('p', null, 'Arkadaşlarınla haftalık XP yarışına katıl. Sadece bir takma ad seçmen yeterli.'),
      h('button', { class: 'btn', onclick: () => nameModal(() => render()) }, 'Sıralamaya katıl')));
  }
  const seg = h('div', { class: 'seg', role: 'tablist' }, [['week', 'Bu hafta'], ['all', 'Tüm zamanlar']].map(([k, t]) =>
    h('button', { role: 'tab', 'aria-selected': String(LB.scope === k), class: LB.scope === k ? 'on' : '', onclick: () => { LB.scope = k; render(); } }, t)));
  page.append(seg);
  const list = h('div', { class: 'lb-list', 'aria-live': 'polite' });
  page.append(list);
  if (S.player && S.player.name) page.append(h('button', { class: 'lb-rename', onclick: () => nameModal(() => render()) }, `Takma adın: ${S.player.name} · değiştir`));
  page.append(h('p', { class: 'note' }, LB.scope === 'week' ? 'Haftalık tablo her pazartesi sıfırlanır. Ders bitirdikçe XP\'n otomatik güncellenir.' : 'Tüm zamanlar tablosu toplam XP\'ye göre sıralanır.'));
  const scope = LB.scope;
  const draw = res => {
    list.innerHTML = '';
    const valKey = scope === 'week' ? 'week_xp' : 'xp';
    if (!res.rows.length) { list.append(h('div', { class: 'lb-empty' }, scope === 'week' ? 'Bu hafta henüz kimse puan almadı. İlk sen ol!' : 'Henüz kimse yok. İlk sen ol!')); return; }
    res.rows.forEach((r, i) => list.append(lbRow(i + 1, r.name, r[valKey], r.stars, r.id === res.uid)));
    if (res.me) { list.append(h('div', { class: 'lb-gap' }, '•••')); list.append(lbRow(res.me.rank, res.me.name, res.me.val, res.me.stars, true)); }
  };
  if (LB.cache[scope]) draw(LB.cache[scope]); else list.append(h('div', { class: 'lb-empty' }, 'Yükleniyor…'));
  const load = () => (S.player && S.player.dirty ? League.sync() : Promise.resolve()).then(() => League.top(scope)).then(res => {
    LB.cache[scope] = res; if (TAB === 'league' && LB.scope === scope && list.isConnected) draw(res);
  }, () => {
    if (!list.isConnected) return;
    list.innerHTML = '';
    list.append(h('div', { class: 'lb-empty' }, 'Sıralamaya ulaşılamadı. İnternet bağlantını kontrol et.', h('button', { class: 'chip', style: 'margin-top:10px', onclick: () => render() }, 'Tekrar dene')));
  });
  load();
}
function lbRow(rank, name, val, stars, me) {
  const medal = rank <= 3 ? ' m' + rank : '';
  return h('div', { class: 'lb-row' + (me ? ' me' : '') },
    h('span', { class: 'lb-rank' + medal }, String(rank)),
    h('span', { class: 'lb-name' }, name, me ? h('small', null, ' (sen)') : null),
    stars ? h('span', { class: 'lb-stars', html: STAR_SVG + `<b>${stars}</b>` }) : null,
    h('span', { class: 'lb-xp' }, `${val} XP`));
}
