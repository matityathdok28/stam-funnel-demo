/* דמו אינטראקטיבי — משפך אוטומציה, קורס סופר סת"ם (v2: Messenger-only automation + human WhatsApp handoff)
 * Everything is simulated in the browser. No network calls, no storage, no analytics.
 * (The page's Content-Security-Policy sets connect-src 'none', so the browser itself blocks any request.) */
(function () {
  'use strict';

  var FAST = /[?&]fast\b/.test(location.search);
  var SPEED = FAST ? 0.08 : 1;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, Math.round(ms * SPEED)); }); };
  var mobileMQ = window.matchMedia('(max-width:980px)');
  var isMobile = function () { return mobileMQ.matches; };
  var TX = window.STAM_TEXTS;

  /* ------------------------------------------------------------ constants */
  var DEMO_PHONE_LOCAL = '050-1234567';
  var POST_ID = '1234';
  var PAGE_ID = '100000000000000';
  var MAKE_HOOK = 'https://hook.eu2.make.com/demo-stam-leads';
  var SHEET_ID = 'DEMO_SHEET_ID';
  var ROW = 6;
  var REF = 'DEMO-005';
  var WA_NUMBER = TX.waNumber; /* demo number */
  /* sequence schedule, relative to the moment the lead consented (t0) */
  var STEPS = [
    { h: 0, skip: '', stage: 'הודעה 1 נשלחה (מיד)', tag: 'הודעה 1 · מיד' },
    { h: 3, skip: 'אחרי 3 שעות', stage: 'הודעה 2 (אחרי 3 שעות)', tag: 'הודעה 2 · אחרי 3 שעות' },
    { h: 22, skip: 'אחרי 22 שעות', stage: 'הודעה 3 (אחרי 22 שעות)', tag: 'הודעה 3 · אחרי 22 שעות (לפני שהחלון נסגר)' },
    { day: 4, skip: 'יום 4', stage: 'הודעה 4 — שיווקית (יום 4)', tag: '📣 הודעה 4 · יום 4 · Marketing Message', mkt: true },
    { day: 6, skip: 'יום 6', stage: 'הודעה 5 — שיווקית (יום 6) — סוף', tag: '📣 הודעה 5 · יום 6 · Marketing Message', mkt: true }
  ];
  var BTN_TYPE = { trial: 'url', trial2: 'url', wa: 'url', register: 'postback', stop: 'postback' };
  var BTN_PAYLOAD = { register: 'WANT_TO_REGISTER', stop: 'STOP_SEQUENCE', optinNo: 'MARKETING_OPTIN_NO' };

  function rid(n) { var s = ''; var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'; for (var i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

  /* ------------------------------------------------------------ state */
  var S = {
    name: 'יוסף', lang: null, motIdx: null, phone: null, consent: null, awaitPhone: false,
    triggered: false, t0: null, step: -1, seq: 'none', /* none|active|details|paused|stopped|closed|done */
    optin: null, optinAsked: false, windowLogged: false, handoff: false, waSent: false,
    status: null, stage: null, optinCol: '—', note: null,
    subscriber_id: String(Math.floor(1e8 + Math.random() * 9e8)),
    psid: 'DEMO_PSID_' + rid(6),
    commentId: POST_ID + '_' + Math.floor(10000 + Math.random() * 89999),
    pending: 0, skipNudged: false
  };
  var L = function () { return TX[S.lang || 'he']; };
  var isEn = function () { return S.lang === 'en'; };
  function waUrl() { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(L().waPrefill); }

  /* ------------------------------------------------------------ simulated clock */
  var clockBase = new Date();
  var simNow = new Date(clockBase.getTime());
  function tick(sec) { simNow = new Date(simNow.getTime() + sec * 1000); renderClock(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function hhmmss(d) { return hhmm(d) + ':' + pad(d.getSeconds()); }
  function ddmmyyyy(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function midnight(d) { var x = new Date(d.getTime()); x.setHours(0, 0, 0, 0); return x; }
  function dayNo() { return Math.round((midnight(simNow) - midnight(clockBase)) / 864e5); }
  function stamp() { return 'יום ' + dayNo() + ' · ' + ddmmyyyy(simNow) + ' ' + hhmmss(simNow); }
  function unixTs() { return Math.floor(simNow.getTime() / 1000); }
  function windowLeftH() { return S.t0 ? (S.t0.getTime() + 864e5 - simNow.getTime()) / 36e5 : null; }
  function renderClock() {
    $('#clock').textContent = 'יום ' + dayNo() + ' · ' + hhmm(simNow);
    $$('.clk').forEach(function (e) { e.textContent = hhmm(simNow); });
    var w = $('#win'), left = windowLeftH();
    if (left === null) { w.className = 'win'; w.textContent = '⏳ חלון 24 שעות: עוד לא נפתח'; }
    else if (left > 0) { w.className = 'win ' + (left <= 3 ? 'closing' : 'open'); w.textContent = '⏳ חלון 24 שעות: פתוח (נותרו ' + Math.ceil(left) + ' שעות)'; }
    else { w.className = 'win closed'; w.textContent = '🔒 חלון 24 שעות: נסגר' + (S.optin ? ' · מותרות רק הודעות שיווקיות' : ''); }
  }

  /* ------------------------------------------------------------ helpers */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(text) {
    return esc(text).replace(/soferstam\.org\/[a-z]+/g, function (m) { return '<span class="lnk" tabindex="0" role="note" title="קישור דמו — לא פעיל">' + m + '</span>'; });
  }
  /* keep phone numbers as one left-to-right unit inside Hebrew text */
  function nums(html) { return html.replace(/(\+?\d[\d \-]{5,}\d)/g, '<span class="nw">$1</span>'); }
  function rich(text) { return nums(linkify(text)).replace(/(\d) ₪/g, '$1\u00a0₪'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function scrollChat(box) { requestAnimationFrame(function () { if (box.scrollTo) box.scrollTo({ top: box.scrollHeight, behavior: FAST ? 'auto' : 'smooth' }); else box.scrollTop = box.scrollHeight; }); }
  function firstLetter(n) { return (n || '?').trim().charAt(0).toUpperCase() || '?'; }
  function jsonHtml(obj) {
    var s = JSON.stringify(obj, null, 2);
    return esc(s).replace(/(&quot;(?:\\.|[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(-?\d+(?:\.\d+)?)\b|\b(true|false|null)\b/g, function (m, str, colon, num, lit) {
      if (str) return '<span class="' + (colon ? 'k' : 's') + '">' + str + '</span>' + (colon || '');
      if (num) return '<span class="n">' + num + '</span>';
      if (lit) return '<span class="n">' + lit + '</span>';
      return m;
    });
  }
  /* serialize everything so rapid clicks never interleave */
  var queue = Promise.resolve();
  function enqueue(fn) {
    S.pending++; updateSkip();
    queue = queue.then(fn).catch(function (e) { console.error(e); }).then(function () { S.pending--; updateSkip(); });
    return queue;
  }

  /* ------------------------------------------------------------ tabs / guide / badges */
  function showTab(id, opts) {
    $$('.tabs button').forEach(function (b) { var on = b.dataset.tab === id; b.classList.toggle('on', on); if (on) b.classList.remove('badge'); });
    $$('.panel').forEach(function (p) { p.classList.toggle('on', p.dataset.panel === id); });
    if (isMobile()) {
      var y = $('.top').offsetHeight; /* tab bar is sticky: scroll to its natural offset */
      if (!(opts && opts.noScroll)) window.scrollTo({ top: y, behavior: 'auto' });
      ['msBody', 'waBody'].forEach(function (i) { scrollChat(document.getElementById(i)); });
      if (id === 'log') scrollChat($('#log'));
    }
  }
  function badge(id) {
    if (!isMobile()) return;
    var b = $('.tabs button[data-tab="' + id + '"]');
    if (b && !b.classList.contains('on')) b.classList.add('badge');
  }
  function currentTab() { var b = $('.tabs button.on'); return b ? b.dataset.tab : 'fb'; }
  function setGuide(step) {
    $$('#guide li').forEach(function (li) { var n = +li.dataset.step; li.classList.toggle('active', n === step); li.classList.toggle('done', n < step); });
  }
  var chainTimers = {};
  function lit(sys) {
    var map = { fb: 'fb', mc: 'mc', msg: 'mc', make: 'make', gs: 'gs', mail: 'alert', tg: 'alert', wa: 'wa', user: null };
    var k = map[sys]; if (!k) return;
    var b = $('#chain b[data-sys="' + k + '"]'); if (!b) return;
    b.classList.add('lit'); clearTimeout(chainTimers[k]);
    chainTimers[k] = setTimeout(function () { b.classList.remove('lit'); }, 1400);
  }

  /* ------------------------------------------------------------ ticker & tooltip */
  var tickerTimer;
  var SYS_NAME = { fb: 'Facebook', msg: 'Messenger', mc: 'ManyChat', make: 'Make', gs: 'Google Sheets', mail: 'Email', tg: 'Telegram', wa: 'WhatsApp (אישי)', user: 'הליד' };
  function ticker(html) {
    var t = $('#ticker');
    t.innerHTML = '<span>⚡</span><span>' + html + '</span><span class="go">ללוג ←</span>';
    t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(tickerTimer); tickerTimer = setTimeout(function () { t.hidden = true; }, 3800);
  }
  $('#ticker').addEventListener('click', function () {
    $('#ticker').hidden = true;
    if (isMobile()) showTab('log'); else $('#p-log').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var tipTimer;
  function showTip(target, text) {
    var tip = $('#tip'); var r = target.getBoundingClientRect();
    tip.textContent = text || '🔗 קישור דמו — בגרסה האמיתית ייפתח הדף באתר';
    tip.hidden = false;
    var w = tip.offsetWidth;
    var left = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2));
    var top = r.top - tip.offsetHeight - 8; if (top < 8) top = r.bottom + 8;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
    clearTimeout(tipTimer); tipTimer = setTimeout(function () { tip.hidden = true; }, 2400);
  }
  document.addEventListener('click', function (e) { var l = e.target.closest && e.target.closest('.lnk'); if (l) { e.preventDefault(); showTip(l); } });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('lnk')) { e.preventDefault(); showTip(e.target); }
  });

  /* ------------------------------------------------------------ API log */
  var logOpenAll = false;
  function routeHtml(from, to) {
    return '<span class="le-route"><span class="sys ' + from + '">' + SYS_NAME[from] + '</span>' + (to ? ' → <span class="sys ' + to + '">' + SYS_NAME[to] + '</span>' : '') + '</span>';
  }
  function addLog(node) {
    var log = $('#log'); var empty = $('#logEmpty'); if (empty) empty.remove();
    log.appendChild(node); scrollChat(log); badge('log');
  }
  function api(o) {
    tick(o.tick != null ? o.tick : 1);
    var e = el('div', 'le' + (o.cls ? ' ' + o.cls : ''));
    var reqOpen = logOpenAll || o.open ? ' open' : '';
    e.innerHTML =
      '<div class="le-h"><span class="le-t">' + esc(stamp()) + '</span>' + routeHtml(o.from, o.to) + '<span class="le-st pending">⏳ שולח…</span></div>' +
      (o.label ? '<div class="le-label">' + esc(o.label) + '</div>' : '') +
      '<div class="le-title">' + esc(o.title) + '</div>' +
      '<div class="le-url"><b>' + esc(o.method || 'POST') + '</b> ' + esc(o.url) + '</div>' +
      (o.req !== undefined ? '<details class="rq"' + reqOpen + '><summary>בקשה (Request) — הנתונים שנשלחו</summary><pre>' + jsonHtml(o.req) + '</pre></details>' : '') +
      '<div class="resp-slot"></div>' +
      (o.note ? '<div class="le-note">💡 ' + o.note + '</div>' : '');
    addLog(e); lit(o.from); lit(o.to);
    ticker(SYS_NAME[o.from] + ' → ' + SYS_NAME[o.to] + ': ' + esc(o.short || o.title));
    var d = o.delay || 650;
    return sleep(d).then(function () {
      var st = $('.le-st', e); var code = o.status || 200;
      st.className = 'le-st ' + (code < 300 ? 'ok' : 'bad');
      st.textContent = code + ' ' + (o.statusText || 'OK') + ' · ' + Math.round(d * (0.6 + Math.random() * 0.3)) + 'ms';
      if (o.res !== undefined) $('.resp-slot', e).innerHTML = '<details class="rs"' + (logOpenAll ? ' open' : '') + '><summary>תשובה (Response)</summary><pre>' + jsonHtml(o.res) + '</pre></details>';
      lit(o.to);
      return o.res;
    });
  }
  function logEvent(o) {
    tick(o.tick != null ? o.tick : 0);
    var e = el('div', 'le ev' + (o.kind ? ' ' + o.kind : ''));
    e.innerHTML = '<div class="le-h"><span class="le-t">' + esc(stamp()) + '</span>' + routeHtml(o.sys, o.to) +
      '<span class="le-st ' + (o.kind === 'warn' || o.kind === 'stop' ? 'bad' : 'info') + '">' + esc(o.tag || 'פעולה פנימית') + '</span></div>' +
      '<div class="le-title">' + esc(o.title) + '</div>' +
      (o.url ? '<div class="le-url">' + esc(o.url) + '</div>' : '') +
      (o.detail ? '<div class="le-note">' + o.detail + '</div>' : '') +
      (o.data ? '<details' + (logOpenAll || o.open ? ' open' : '') + '><summary>פרטים</summary><pre>' + jsonHtml(o.data) + '</pre></details>' : '');
    addLog(e); lit(o.sys); if (o.to) lit(o.to);
    if (o.ticker !== false) ticker(SYS_NAME[o.sys] + ': ' + esc(o.short || o.title));
  }
  $('#logToggle').addEventListener('click', function () {
    logOpenAll = !logOpenAll;
    $$('#log details').forEach(function (d) { d.open = logOpenAll; });
    this.textContent = logOpenAll ? 'סגור את כל פרטי ה-JSON' : 'הצג את כל פרטי ה-JSON';
  });

  /* ------------------------------------------------------------ phone validation */
  function normPhone(raw) {
    var s = String(raw).replace(/[\s\-().\u200e\u200f\u202a-\u202e]/g, '');
    if (/^00/.test(s)) s = '+' + s.slice(2);
    if (/^0(5\d)(\d{7})$/.test(s)) return '+972' + s.slice(1);
    if (/^9725\d{8}$/.test(s)) return '+' + s;
    if (/^\+9725\d{8}$/.test(s)) return s;
    if (/^\+?972/.test(s)) return null; /* Israeli but not a valid mobile */
    if (/^\+[1-9]\d{7,14}$/.test(s)) return s;
    return null;
  }

  /* ------------------------------------------------------------ Facebook */
  var nameInput = $('#nameInput');
  function syncName() { var v = nameInput.value.replace(/[<>]/g, '').trim(); S.name = v || 'יוסף'; $('#meAv').textContent = firstLetter(S.name); }
  nameInput.addEventListener('input', syncName);
  function addFbComment(author, text, isPage, auto) {
    var c = el('div', 'cm' + (isPage ? ' reply' : ''));
    c.innerHTML = (isPage ? '<div class="av page-av" style="width:28px;height:28px;font-size:13px;border-width:1.5px">ס</div>' : '<div class="av u-av">' + esc(firstLetter(author)) + '</div>') +
      '<div><div class="b"><div class="n">' + esc(author) + (isPage ? ' <span class="author">מחבר/ת</span>' : '') + '</div><div class="x" dir="auto">' + esc(text) + '</div></div>' +
      '<div class="meta"><span>עכשיו</span><span>לייק</span><span>השב</span></div>' +
      (auto ? '<span class="auto-tag">🤖 תגובה אוטומטית של ManyChat</span>' : '') + '</div>';
    $('#fbComments').appendChild(c);
  }
  var commentCount = 46;
  function bumpCount() { commentCount++; $('#fbCount').textContent = commentCount + ' תגובות · 12 שיתופים'; }
  function fbWebhook(text) {
    return { object: 'page', entry: [{ id: PAGE_ID, time: unixTs(), changes: [{ field: 'feed', value: { item: 'comment', verb: 'add', post_id: PAGE_ID + '_' + POST_ID, comment_id: S.commentId, message: text, from: { id: S.psid, name: S.name }, created_time: unixTs() } }] }] };
  }
  function onComment(text) {
    text = String(text || '').trim();
    if (!text || S.triggered) return;
    syncName(); nameInput.disabled = true; $('#commentInput').value = '';
    addFbComment(S.name, text, false, false); bumpCount();
    if (!/סילבוס|syllabus/i.test(text)) {
      enqueue(function () {
        return api({ from: 'fb', to: 'mc', title: 'תגובה חדשה על הפוסט — Facebook מודיע ל-ManyChat', short: 'תגובה חדשה (בלי מילת מפתח)', url: 'https://manychat.com/webhook/facebook (demo)', req: fbWebhook(text), res: { success: true }, delay: 500 }).then(function () {
          logEvent({ sys: 'mc', title: 'מילת המפתח "סילבוס" לא נמצאה בתגובה — הבוט לא מגיב', tag: 'אין התאמה', kind: 'warn', detail: 'ManyChat מגיב רק לתגובות שמכילות את מילת המפתח. תגובות רגילות נשארות כרגיל.' });
          var h = $('#fbHint'); h.hidden = false; h.className = 'hint';
          h.innerHTML = '💡 הבוט מגיב רק לתגובות עם המילה <span class="kw">סילבוס</span>. נסו שוב, או לחצו על הכפתור הכחול.';
        });
      });
      return;
    }
    S.triggered = true;
    $('#btnSyllabus').disabled = true; $('#btnSyllabus').classList.remove('nudge');
    $('#commentInput').disabled = true; $('#commentSend').disabled = true; $('#fbHint').hidden = true;
    enqueue(flowTrigger.bind(null, text));
  }
  function flowTrigger(text) {
    var english = /syllabus/i.test(text) && !/[\u0590-\u05FF]/.test(text);
    var pub = TX[english ? 'en' : 'he'].publicReply(S.name);
    return api({ from: 'fb', to: 'mc', title: 'תגובה חדשה על הפוסט — Facebook מודיע ל-ManyChat', short: 'תגובה חדשה עם "סילבוס"', url: 'https://manychat.com/webhook/facebook (demo)', req: fbWebhook(text), res: { success: true }, delay: 550, note: 'פייסבוק שולח ל-ManyChat כל תגובה חדשה על הפוסט.' }).then(function () {
      logEvent({ sys: 'mc', title: 'זוהתה מילת המפתח "סילבוס" ← מופעל התרחיש "סילבוס — איסוף ליד"', tag: 'טריגר', short: 'זוהתה מילת מפתח — הבוט מופעל', data: { trigger: 'Facebook Comments', keyword_rule: 'contains: סילבוס | syllabus', post_id: POST_ID, flow: 'סילבוס — איסוף ליד', subscriber_id: S.subscriber_id } });
      return sleep(300);
    }).then(function () {
      return api({ from: 'mc', to: 'fb', title: 'תגובה פומבית אוטומטית מתחת לתגובה', short: 'תגובה פומבית בפוסט', url: 'https://graph.facebook.com/v21.0/' + S.commentId + '/comments', req: { message: pub }, res: { id: S.commentId + '1' }, delay: 700 });
    }).then(function () {
      addFbComment('קורס סופר סת"ם', pub, true, true); bumpCount();
      return api({
        from: 'mc', to: 'msg', title: 'הודעה פרטית במסנג\'ר (Private Reply) — פתיחת השיחה', short: 'פתיחת שיחה פרטית במסנג\'ר',
        url: 'https://graph.facebook.com/v21.0/me/messages',
        req: { recipient: { comment_id: S.commentId }, messaging_type: 'RESPONSE', message: { text: TX.welcome(S.name), quick_replies: [{ content_type: 'text', title: 'עברית', payload: 'LANG_HE' }, { content_type: 'text', title: 'English', payload: 'LANG_EN' }] } },
        res: { recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }, delay: 700,
        note: 'במקביל לתגובה הפומבית, הבוט פותח שיחה פרטית במסנג\'ר. מכאן והלאה כל האוטומציה קורית במסנג\'ר.'
      });
    }).then(function () {
      var h = $('#fbHint'); h.hidden = false; h.className = 'hint ok';
      h.innerHTML = '✅ הבוט הגיב בפוסט ושלח הודעה פרטית במסנג\'ר. ' + (isMobile() ? 'עוברים למסנג\'ר…' : 'המשיכו בחלון המסנג\'ר ←');
      $('#gotoMs').hidden = false; setGuide(2);
      return startMessenger();
    });
  }
  $('#btnSyllabus').addEventListener('click', function () { onComment('סילבוס'); });
  $('#commentForm').addEventListener('submit', function (e) { e.preventDefault(); onComment($('#commentInput').value); });

  /* ------------------------------------------------------------ Messenger primitives */
  var msBody = $('#msBody');
  function msClearEmpty() { var e = $('#msEmpty'); if (e) e.remove(); }
  function msTyping() { var r = el('div', 'bubrow in', '<div class="av page-av">ס</div><div class="bub typing"><i></i><i></i><i></i></div>'); msBody.appendChild(r); scrollChat(msBody); return r; }
  function msBot(text, opts) {
    opts = opts || {};
    var t = msTyping();
    return sleep(opts.fast ? 500 : 800).then(function () {
      t.remove(); tick(2);
      var html = opts.html != null ? opts.html : rich(text);
      var r = el('div', 'bubrow in' + (opts.cls ? ' ' + opts.cls : ''), '<div class="av page-av">ס</div><div class="bub"' + (isEn() ? ' dir="ltr"' : '') + '>' + html + '</div>');
      msBody.appendChild(r); scrollChat(msBody); badge('ms');
      return r;
    });
  }
  function msUser(text) { tick(3); msBody.appendChild(el('div', 'bubrow out', '<div class="bub" dir="auto">' + esc(text) + '</div>')); scrollChat(msBody); }
  function msSys(html, cls) { var d = el('div', 'ms-sys' + (cls ? ' ' + cls : ''), html); msBody.appendChild(d); scrollChat(msBody); return d; }
  function lockQRs() { $$('.qr', msBody).forEach(function (q) { q.classList.remove('nudge'); $$('button', q).forEach(function (b) { b.disabled = true; }); }); }
  function msQR(opts, onPick) {
    lockQRs();
    var q = el('div', 'qr nudge');
    opts.forEach(function (o) {
      var b = el('button', o.cls || '', esc(o.label)); b.type = 'button'; if (isEn() || o.ltr) b.dir = 'ltr';
      b.addEventListener('click', function () {
        if (b.disabled) return;
        $$('button', q).forEach(function (x) { x.disabled = true; }); b.classList.add('on'); q.classList.remove('nudge');
        enqueue(function () { return onPick(o); });
      });
      q.appendChild(b);
    });
    msBody.appendChild(q); scrollChat(msBody);
    return q;
  }
  function setMsInput(mode) {
    var i = $('#msText'); var on = mode !== 'off';
    i.disabled = !on; $('#msSend').disabled = !on;
    i.setAttribute('inputmode', mode === 'phone' ? 'tel' : 'text');
    i.placeholder = mode === 'phone' ? L().phonePh : mode === 'chat' ? (isEn() ? 'Write a message…' : 'כתבו הודעה חופשית לבוט…') : 'בחרו אחת מהאפשרויות למעלה';
    if (!on) i.value = '';
  }
  function setField(field, value, label) {
    logEvent({ sys: 'mc', title: 'נשמר שדה במנוי: ' + field + ' = ' + value, tag: 'Set Field', short: label || ('נשמר ' + field), data: { subscriber_id: S.subscriber_id, field: field, value: value } });
  }
  /* Messenger button template (card) */
  function msCard(text, keys, opts) {
    opts = opts || {};
    var t = msTyping();
    return sleep(700).then(function () {
      t.remove(); tick(1);
      var c = el('div', 'mcard' + (opts.cls ? ' ' + opts.cls : ''));
      if (isEn()) c.dir = 'ltr';
      c.innerHTML = '<div class="t">' + (opts.label ? '<span class="ml">' + esc(opts.label) + '</span>' : '') + rich(text) + '</div>';
      keys.forEach(function (k) {
        var label = L().btn[k];
        var b = el('button', k === 'wa' ? 'wa-go' : k === 'stop' ? 'stopb' : '', esc(label));
        b.type = 'button'; b.dataset.key = k;
        b.addEventListener('click', function () { onCardButton(k, label, b, c); });
        c.appendChild(b);
      });
      msBody.appendChild(c); scrollChat(msBody); badge('ms');
      if (S.seq === 'stopped') disableSeqButtons();
      return c;
    });
  }
  function disableSeqButtons() { $$('.mcard button', msBody).forEach(function (b) { b.disabled = true; }); }

  /* ------------------------------------------------------------ Messenger: lead-capture questions */
  function startMessenger() {
    msClearEmpty(); msBody.appendChild(el('div', 'ms-time', 'היום ' + hhmm(simNow)));
    if (isMobile()) setTimeout(function () { if (currentTab() === 'fb') showTab('ms'); }, 900 * SPEED + 400); else badge('ms');
    var parts = TX.welcome(S.name).split('\n'); var last = parts.pop();
    return msBot(null, { html: esc(parts.join('\n')) + '<span class="en">' + esc(last) + '</span>' }).then(function () {
      msQR([{ label: 'עברית', v: 'he' }, { label: 'English', v: 'en', ltr: true }], onLang);
    });
  }
  function onLang(o) {
    S.lang = o.v; msUser(o.label); setField('lang', o.v, 'שפה: ' + o.label);
    return msBot(L().motQ(S.name)).then(function () {
      msQR(L().mots.map(function (m, i) { return { label: m, v: i }; }), onMot);
    });
  }
  function onMot(o) {
    S.motIdx = o.v; msUser(o.label); setField('motivation', TX.he.mots[o.v], 'מוטיבציה: ' + TX.he.mots[o.v]);
    return askPhone(true);
  }
  function askPhone(first) {
    return msBot(first ? L().phoneQ : L().phoneBad).then(function () {
      msQR([{ label: '📱 ' + DEMO_PHONE_LOCAL, v: DEMO_PHONE_LOCAL, cls: 'demo-num', ltr: true }], function () { return onPhone(DEMO_PHONE_LOCAL); });
      msBody.appendChild(el('div', 'qr-hint', esc(L().phoneHint) + ' <span style="color:#8a8d91;font-weight:400">(מספר דמו)</span>')); scrollChat(msBody);
      setMsInput('phone'); S.awaitPhone = true;
    });
  }
  function onPhone(raw) {
    if (!S.awaitPhone) return;
    msUser(raw);
    var e164 = normPhone(raw);
    if (!e164) {
      logEvent({ sys: 'mc', title: 'אימות מספר נכשל: "' + raw + '" אינו מספר נייד ישראלי או מספר בינלאומי תקין', tag: 'מספר לא תקין', kind: 'warn', short: 'מספר לא תקין — הבוט מבקש שוב', detail: 'פורמטים מקובלים: <span class="ltr">05X-XXXXXXX</span> (נייד ישראלי) או מספר בינלאומי עם קידומת, למשל <span class="ltr">+1 555 010 0001</span>.' });
      return askPhone(false);
    }
    S.awaitPhone = false; S.phone = e164; setMsInput('off'); lockQRs();
    setField('phone', e164, 'טלפון נשמר (E.164) — כדי שאדם יוכל להתקשר');
    return msBot(L().consentQ).then(function () {
      msQR([{ label: L().yes, v: 'yes' }, { label: L().details, v: 'details_only' }], onConsent);
    });
  }
  $('#msForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#msText').value.trim(); if (!v) return;
    $('#msText').value = '';
    if (S.awaitPhone) { enqueue(function () { return onPhone(v); }); return; }
    if (S.t0) enqueue(function () { return onFreeText(v); });
  });
  function onConsent(o) {
    S.consent = o.v; msUser(o.label);
    setField('consent', o.v, 'הסכמה: ' + (o.v === 'yes' ? 'כן — רצף הודעות במסנג\'ר' : 'רק את הפרטים'));
    S.t0 = new Date(simNow.getTime()); renderClock();
    logEvent({ sys: 'msg', title: 'נפתח "חלון 24 השעות" של מסנג\'ר', tag: 'כלל של Meta', short: 'חלון 24 שעות נפתח', detail: 'מסנג\'ר מאפשר לעסק לשלוח הודעות חופשיות רק בתוך 24 שעות מאז שהמתעניין כתב לבוט. אחרי זה — רק "הודעות שיווקיות" (Marketing Messages), ורק למי שאישר לקבל אותן.' });
    return msBot(o.v === 'yes' ? L().confirmYes : L().confirmDetails).then(function () {
      S.step = 0;
      return sendSeq(0, { noSheet: true });
    }).then(pipeline);
  }

  /* ------------------------------------------------------------ backend pipeline (after consent) */
  var STATUS_CLS = { 'חדש': 'new', 'ניסיון': 'trial', 'עבר לוואטסאפ': 'wa', 'נרשם ✅': 'won', 'הוסר': 'rem' };
  function leadPayload() { return { first_name: S.name, phone: S.phone, lang: S.lang, motivation: TX.he.mots[S.motIdx], consent: S.consent, post_id: POST_ID, subscriber_id: S.subscriber_id }; }
  function pipeline() {
    return api({
      from: 'mc', to: 'make', title: 'שליחת נתוני הליד ל-Make (Webhook)', short: 'נתוני הליד נשלחו ל-Make',
      url: MAKE_HOOK, req: leadPayload(), res: 'Accepted', delay: 800, open: true,
      note: 'ManyChat אוסף את התשובות ושולח אותן ל-Make, שמחבר את הגיליון וההתראות לצוות.'
    }).then(function () {
      var date = ddmmyyyy(simNow);
      S.status = 'חדש'; S.stage = STEPS[0].stage; S.optinCol = '—'; S.note = S.consent === 'yes' ? 'ליד חדש מהפוסט' : 'ביקש רק את הפרטים';
      return api({
        from: 'make', to: 'gs', title: 'Google Sheets — Add a Row (הוספת שורה לגיליון)', short: 'שורה חדשה נוספה לגיליון',
        url: 'https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/לידים!A:K:append?valueInputOption=USER_ENTERED',
        req: { values: [[date, S.name, S.phone, L().langLabel, TX.he.mots[S.motIdx], '#' + POST_ID, S.stage, S.optinCol, S.status, REF, S.note]] },
        res: { spreadsheetId: SHEET_ID, tableRange: 'לידים!A1:K5', updates: { spreadsheetId: SHEET_ID, updatedRange: 'לידים!A' + ROW + ':K' + ROW, updatedRows: 1, updatedColumns: 11, updatedCells: 11 } },
        delay: 800
      }).then(function () { addSheetRow(date); });
    }).then(function () {
      var alertTxt = '🔔 ליד חדש: ' + S.name + ' · ' + S.phone + '\nשפה: ' + L().langLabel + ' · מוטיבציה: ' + TX.he.mots[S.motIdx] + ' · ' + (S.consent === 'yes' ? 'אישר רצף במסנג\'ר' : 'רק פרטים') + ' · פוסט #' + POST_ID;
      return Promise.all([
        api({ from: 'make', to: 'mail', title: 'התראה במייל לצוות: "ליד חדש"', short: 'מייל התראה לצוות', url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', req: { to: 'team@example.com', subject: 'ליד חדש: ' + S.name + ' (קורס סת"ם)', body: alertTxt }, res: { id: '18f' + rid(13).toLowerCase(), labelIds: ['SENT'] }, delay: 700 }),
        sleep(150).then(function () {
          return api({ from: 'make', to: 'tg', title: 'התראה בטלגרם למתתיה: "ליד חדש"', short: 'התראת טלגרם לצוות', url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: alertTxt }, res: { ok: true, result: { message_id: 4000 + Math.floor(Math.random() * 999), date: unixTs() } }, delay: 650 });
        })
      ]);
    }).then(function () {
      if (S.consent === 'yes') {
        if (S.seq === 'none') S.seq = 'active';
        logEvent({ sys: 'mc', title: 'המנוי נכנס לרצף "סת"ם — מסנג\'ר" (מיד, +3 שעות, +22 שעות; ואם אישר הודעות שיווקיות גם יום 4 ויום 6)', tag: 'Sequence', short: 'המנוי נכנס לרצף במסנג\'ר', data: { sequence: 'סת"ם — מסנג\'ר', steps: [{ at: 'מיד', msg: 1 }, { at: '+3h', msg: 2 }, { at: '+22h', msg: 3, includes: 'Marketing Messages opt-in request' }, { at: 'day 4', msg: 4, requires: 'marketing opt-in' }, { at: 'day 6', msg: 5, requires: 'marketing opt-in' }], stop_when: ['whatsapp_handoff', 'registered', 'stop', 'live_chat (pause)'] } });
      } else {
        if (S.seq === 'none') S.seq = 'details';
        logEvent({ sys: 'mc', title: 'בחירה "רק את הפרטים" ← נשלחה הודעה 1 בלבד, המנוי לא נכנס לרצף', tag: 'ללא רצף', short: 'רק הודעה 1 — בלי רצף', detail: 'מכבדים את הבחירה: פרטי הקורס נשלחו, ולא יותר. הכפתורים בהודעה עדיין פעילים.' });
      }
      setMsInput('chat'); updateSkip();
    });
  }

  /* ------------------------------------------------------------ Messenger sequence */
  function sendApiReq(idx, mkt) {
    var m = L().seq[idx];
    var buttons = m.buttons.map(function (k) {
      var t = L().btn[k];
      if (k === 'wa') return { type: 'web_url', title: t, url: waUrl() };
      if (k === 'trial' || k === 'trial2') return { type: 'web_url', title: t, url: 'https://soferstam.org/trial' };
      return { type: 'postback', title: t, payload: BTN_PAYLOAD[k] };
    });
    var recipient = mkt ? { notification_messages_token: 'DEMO_MM_TOKEN_' + S.subscriber_id } : { id: S.psid };
    var reqs = [
      { recipient: recipient, messaging_type: mkt ? undefined : 'RESPONSE', message: { text: m.bubbles[0](S.name) } },
      { recipient: recipient, messaging_type: mkt ? undefined : 'RESPONSE', message: { attachment: { type: 'template', payload: { template_type: 'button', text: m.bubbles[1](S.name), buttons: buttons } } } }
    ];
    if (m.optin) reqs.push({ recipient: recipient, messaging_type: 'RESPONSE', message: { attachment: { type: 'template', payload: { template_type: 'notification_messages', title: m.optin, payload: 'COURSE_UPDATES', notification_messages_frequency: 'WEEKLY', notification_messages_cta_text: 'GET_UPDATES' } } } });
    return JSON.parse(JSON.stringify(reqs));
  }
  function sendSeq(idx, opts) {
    opts = opts || {};
    var st = STEPS[idx], mkt = !!st.mkt, m = L().seq[idx];
    msBody.appendChild(el('div', 'seq-tag' + (mkt ? ' mkt' : ''), esc(st.tag)));
    return api(mkt ? {
      from: 'mc', to: 'msg', label: '📣 Marketing Message · Meta Marketing Messages / ManyChat', cls: 'mkt',
      title: 'הודעה שיווקית ' + (idx + 1) + ' מתוך 5 — מחוץ לחלון 24 השעות', short: 'Marketing Message ' + (idx + 1),
      url: 'https://graph.facebook.com/v21.0/me/messages', req: sendApiReq(idx, true),
      res: [{ recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }, { recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }], delay: 800, open: idx === 3,
      note: 'אחרי שחלון 24 השעות נסגר, מותר לשלוח רק "הודעה שיווקית" — ורק למי שלחץ "כן, עדכנו אותי". ManyChat שולח אותה עם אסימון ההסכמה (notification_messages_token).'
    } : {
      from: 'mc', to: 'msg', title: 'מסנג\'ר — הודעה ' + (idx + 1) + ' מתוך 5 (בתוך חלון 24 השעות)', short: 'הודעה ' + (idx + 1) + ' במסנג\'ר',
      url: 'https://graph.facebook.com/v21.0/me/messages', req: sendApiReq(idx, false),
      res: [{ recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }, { recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }], delay: 700, open: idx === 0,
      note: idx === 0 ? 'שתי בועות קצרות במקום הודעה אחת ארוכה. הכפתור הירוק הוא קישור wa.me — לחיצה עליו פותחת שיחה אישית עם הרב.' : null
    }).then(function () {
      return msBot(m.bubbles[0](S.name));
    }).then(function () {
      return msCard(m.bubbles[1](S.name), m.buttons);
    }).then(function () {
      if (m.optin) {
        S.optinAsked = true;
        return sleep(300).then(function () { return msOptinCard(m.optin); });
      }
    }).then(function () {
      if (opts.noSheet) return;
      return sheetUpdate({ stage: st.stage }, 'message_sent', { message: idx + 1, marketing: mkt });
    }).then(function () {
      if (idx === 4 && S.seq === 'active') { S.seq = 'done'; logEvent({ sys: 'mc', title: 'הרצף הושלם — נשלחו כל 5 ההודעות', tag: 'סוף הרצף', short: 'הרצף הושלם' }); }
    });
  }
  function msOptinCard(text) {
    var t = msTyping();
    return sleep(600).then(function () {
      t.remove(); tick(1);
      var c = el('div', 'mcard optin'); if (isEn()) c.dir = 'ltr';
      c.innerHTML = '<div class="t"><span class="ml">📣 בקשת אישור להודעות שיווקיות (Marketing Messages)</span>' + esc(text) + '</div>';
      ['optinYes', 'optinNo'].forEach(function (k) {
        var label = L().btn[k];
        var b = el('button', 'optin-btn', esc(label)); b.type = 'button'; b.dataset.key = k;
        b.addEventListener('click', function () {
          if (b.disabled) return;
          $$('button', c).forEach(function (x) { x.disabled = true; }); b.classList.add('used');
          enqueue(function () { return onOptin(k === 'optinYes', label); });
        });
        c.appendChild(b);
      });
      msBody.appendChild(c); scrollChat(msBody); badge('ms');
      if (S.seq === 'stopped') $$('button', c).forEach(function (x) { x.disabled = true; });
    });
  }
  function postbackHook(title, payload) {
    return api({
      from: 'msg', to: 'mc', title: 'הליד לחץ על כפתור: "' + title + '"', short: 'לחיצה: ' + title,
      url: 'https://manychat.com/webhook/messenger (demo)',
      req: { object: 'page', entry: [{ id: PAGE_ID, time: unixTs(), messaging: [{ sender: { id: S.psid }, recipient: { id: PAGE_ID }, timestamp: unixTs() * 1000, postback: { title: title, payload: payload } }] }] },
      res: { success: true }, delay: 450
    });
  }
  function clickHook(title, url) {
    return api({
      from: 'msg', to: 'mc', title: 'הליד לחץ על קישור: "' + title + '" (מעקב קליקים של ManyChat)', short: 'קליק: ' + title,
      url: 'https://manychat.com/webhook/messenger (demo)',
      req: { event: 'url_button_click', subscriber_id: S.subscriber_id, button: title, url: url, timestamp: unixTs() }, res: { success: true }, delay: 400
    });
  }
  function onCardButton(k, label, b, card) {
    if (b.disabled) return;
    if (k === 'trial' || k === 'trial2') {
      showTip(b);
      if (b.classList.contains('used')) return;
      b.classList.add('used');
      enqueue(function () {
        return clickHook(label, 'https://soferstam.org/trial').then(function () {
          if (S.status === 'חדש') return sheetUpdate({ status: 'ניסיון', note: 'לחץ על קישור הניסיון' }, 'trial_link_clicked');
        });
      });
      return;
    }
    b.classList.add('used');
    disableSeqButtons();
    if (k === 'wa') { enqueue(waHandoff.bind(null, label)); return; }
    enqueue(function () {
      msUser(label);
      return postbackHook(label, BTN_PAYLOAD[k]).then(function () {
        if (k === 'register') {
          return stopSeq('נרשם ✅', 'לחץ "אני רוצה להירשם"', 'registered', 'הליד רוצה להירשם: הרצף נעצר (אין טעם להמשיך לשכנע), והצוות מקבל התראה.').then(function () {
            return teamAlert('🎉 ' + S.name + ' לחץ "אני רוצה להירשם" במסנג\'ר');
          }).then(function () { return msBot(L().reply.register(S.name)); }).then(function () { msSys('✅ הרצף נעצר · סטטוס בגיליון: נרשם', 'won'); });
        }
        if (k === 'stop') {
          return stopSeq('הוסר', 'לחץ "הפסק" — לא לפנות', 'stopped_by_lead', 'הליד לחץ "הפסק": הרצף נעצר מיד' + (S.optin ? ', וההסכמה להודעות שיווקיות בוטלה' : '') + '. לא יישלחו הודעות נוספות.').then(function () {
            return msBot(L().reply.stop(S.name));
          }).then(function () { msSys('⛔ הרצף נעצר · סטטוס בגיליון: הוסר', 'stop'); });
        }
      });
    });
  }
  function stopSeq(status, note, event, explain, stageOverride) {
    var was = S.seq; S.seq = 'stopped'; disableSeqButtons();
    $$('.mcard.optin button').forEach(function (x) { x.disabled = true; });
    var cancelled = []; for (var i = S.step + 1; i < 5; i++) cancelled.push('הודעה ' + (i + 1));
    logEvent({ sys: 'mc', title: 'עצירת הרצף: ' + event + (was === 'details' || was === 'closed' ? ' (המנוי ממילא לא היה ברצף פעיל)' : ' — הודעות עתידיות בוטלו'), tag: 'עצירה', kind: 'stop', short: 'הרצף נעצר (' + status + ')', detail: explain, data: { action: 'Unsubscribe from sequence' + (S.optin && event === 'stopped_by_lead' ? ' + Marketing Messages opt-out' : ''), reason: event, cancelled: cancelled } });
    if (S.optin && event === 'stopped_by_lead') S.optinCol = 'בוטל';
    var f = { stage: stageOverride || ('נעצר (' + stepWhen() + ')'), status: status, note: note };
    if (S.optin && event === 'stopped_by_lead') f.optin = 'בוטל';
    return sheetUpdate(f, event);
  }
  function stepWhen() { var st = STEPS[Math.max(0, S.step)]; return S.step <= 0 ? 'אחרי הודעה 1' : st.skip; }
  function teamAlert(text) {
    return api({ from: 'make', to: 'tg', title: 'התראה בטלגרם למתתיה', short: 'התראה לצוות', url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: text + ' · ' + S.phone }, res: { ok: true, result: { message_id: 5000 + Math.floor(Math.random() * 999), date: unixTs() } }, delay: 500 });
  }
  function onOptin(yes, label) {
    msUser(label);
    var p = yes ? api({
      from: 'msg', to: 'mc', title: 'הליד אישר קבלת הודעות שיווקיות (Marketing Messages opt-in)', short: 'אישר הודעות שיווקיות', label: '📣 Meta Marketing Messages / ManyChat',
      url: 'https://manychat.com/webhook/messenger (demo)',
      req: { object: 'page', entry: [{ id: PAGE_ID, time: unixTs(), messaging: [{ sender: { id: S.psid }, recipient: { id: PAGE_ID }, timestamp: unixTs() * 1000, optin: { type: 'notification_messages', payload: 'COURSE_UPDATES', notification_messages_token: 'DEMO_MM_TOKEN_' + S.subscriber_id, notification_messages_frequency: 'WEEKLY', notification_messages_status: 'RESUME_NOTIFICATIONS' } }] }] },
      res: { success: true }, delay: 500
    }) : postbackHook(label, BTN_PAYLOAD.optinNo);
    return p.then(function () {
      S.optin = yes; S.optinCol = yes ? 'כן' : 'לא';
      logEvent(yes
        ? { sys: 'mc', title: 'ההסכמה נשמרה: מותר לשלוח הודעות שיווקיות גם אחרי שחלון 24 השעות ייסגר (הודעות 4 ו-5)', tag: 'Opt-in', short: 'אישור הודעות שיווקיות: כן' }
        : { sys: 'mc', title: 'הליד לא אישר הודעות שיווקיות — כשחלון 24 השעות ייסגר, לא יישלחו הודעות נוספות', tag: 'ללא אישור', kind: 'warn', short: 'אישור הודעות שיווקיות: לא' });
      return sheetUpdate({ optin: S.optinCol }, yes ? 'marketing_optin_yes' : 'marketing_optin_no');
    }).then(function () { return msBot(yes ? L().reply.optinYes(S.name) : L().reply.optinNo(S.name)); });
  }

  /* ------------------------------------------------------------ human WhatsApp handoff */
  var waBody = $('#waBody');
  function waHandoff(label) {
    var url = waUrl();
    return clickHook(label, url).then(function () {
      return stopSeq('עבר לוואטסאפ', 'ליד חם — ממתין לשיחה עם הרב', 'whatsapp_handoff', 'הליד ביקש לדבר עם הרב: האוטומציה נעצרת, ומכאן אדם מטפל בו אישית.', 'נעצר — עבר לוואטסאפ (' + stepWhen() + ')');
    }).then(function () {
      return msBot(L().reply.wa(S.name));
    }).then(function () {
      msSys('💬 נפתחה שיחת וואטסאפ אישית עם הרב — ראו חלון 3', 'won');
      logEvent({
        sys: 'user', to: 'wa', tag: 'ללא API', short: 'נפתח קישור wa.me לוואטסאפ של הרב', open: true,
        title: 'הליד פותח קישור wa.me — שיחת וואטסאפ רגילה עם הרב, עם הודעה מוכנה (בלי WhatsApp API)',
        url: url,
        detail: 'מבנה הקישור: <span class="ltr">https://wa.me/&lt;מספר&gt;?text=&lt;הודעה מקודדת&gt;</span>. המספר כאן הוא מספר דמו. המילה "מתתיה" בהודעה מזהה שהליד הגיע דרכך.',
        data: { format: 'https://wa.me/<number>?text=<urlencoded message>', number: WA_NUMBER + ' (demo)', text: L().waPrefill, url: url }
      });
      openWaChat();
      return Promise.all([
        api({ from: 'make', to: 'tg', title: 'התראה בטלגרם למתתיה: "🔥 ליד חם עבר לוואטסאפ"', short: '🔥 ליד חם עבר לוואטסאפ', url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: '🔥 ליד חם עבר לוואטסאפ: ' + S.name + ' · ' + S.phone + ' · שפה: ' + L().langLabel + ' · מוטיבציה: ' + TX.he.mots[S.motIdx] + ' · שלב: ' + stepWhen() }, res: { ok: true, result: { message_id: 7000 + Math.floor(Math.random() * 999), date: unixTs() } }, delay: 600 }),
        sleep(120).then(function () {
          return api({ from: 'make', to: 'mail', title: 'מייל לצוות: "🔥 ליד חם עבר לוואטסאפ"', short: 'מייל: ליד חם', url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', req: { to: 'team@example.com', subject: '🔥 ליד חם עבר לוואטסאפ: ' + S.name, body: S.name + ' · ' + S.phone + ' לחץ "לדבר עם הרב בוואטסאפ".' }, res: { id: '18f' + rid(13).toLowerCase(), labelIds: ['SENT'] }, delay: 600 });
        })
      ]);
    });
  }
  function openWaChat() {
    S.handoff = true;
    var e = $('#waEmpty'); if (e) e.remove();
    waBody.appendChild(el('div', 'day', 'היום'));
    $('#waSeen').textContent = 'נראה לאחרונה היום ב-' + hhmm(new Date(simNow.getTime() - 25 * 60000));
    var ta = $('#waText'); ta.disabled = false; ta.value = L().waPrefill; ta.dir = isEn() ? 'ltr' : 'rtl'; autoGrow(ta);
    var sb = $('#waSend'); sb.disabled = false; sb.classList.add('nudge');
    var hint = el('div', 'sys-note', '✍️ ההודעה כבר כתובה מראש — לחצו על כפתור השליחה הירוק ▸'); hint.id = 'waHint';
    waBody.appendChild(hint); scrollChat(waBody);
    $('#gotoWa').hidden = false; setGuide(3); badge('wa');
    if (isMobile()) setTimeout(function () { if (currentTab() === 'ms') showTab('wa'); }, 1100 * SPEED + 300);
  }
  function autoGrow(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(96, ta.scrollHeight + 2) + 'px'; }
  $('#waText').addEventListener('input', function () { autoGrow(this); });
  $('#waForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ta = $('#waText'), v = ta.value.trim(); if (!v || !S.handoff) return;
    ta.value = ''; autoGrow(ta); ta.placeholder = 'הודעה'; $('#waSend').classList.remove('nudge');
    var h = $('#waHint'); if (h) h.remove();
    tick(15);
    var d = el('div', 'wa-out'); d.dir = 'auto'; d.innerHTML = esc(v) + '<span class="tm">' + hhmm(simNow) + ' <b>✓✓</b></span>';
    waBody.appendChild(d);
    if (!S.waSent) {
      S.waSent = true;
      waBody.appendChild(el('div', 'sys-note won', '👤 מכאן זו שיחה אישית: הרב (או מתתיה) עונה בעצמו — בלי בוט ובלי API.'));
      logEvent({ sys: 'wa', tag: 'שיחה אנושית', short: 'ההודעה נשלחה לרב בוואטסאפ', title: 'הליד שלח לרב את ההודעה המוכנה בוואטסאפ. מכאן השיחה ידנית — שום מערכת לא שולחת הודעות.', detail: 'בזכות המילה "מתתיה" בהודעה, הרב יודע שהליד הגיע דרכך.' });
      setGuide(4);
    }
    scrollChat(waBody);
  });

  /* ------------------------------------------------------------ Live Chat (free text in Messenger) */
  function onFreeText(v) {
    msUser(v);
    return api({
      from: 'msg', to: 'mc', title: 'הליד כתב הודעה חופשית במסנג\'ר', short: 'הודעה חופשית מהליד',
      url: 'https://manychat.com/webhook/messenger (demo)',
      req: { object: 'page', entry: [{ id: PAGE_ID, time: unixTs(), messaging: [{ sender: { id: S.psid }, recipient: { id: PAGE_ID }, timestamp: unixTs() * 1000, message: { mid: 'm_DEMO' + rid(16), text: v } }] }] },
      res: { success: true }, delay: 450
    }).then(function () {
      var wasActive = S.seq === 'active';
      if (wasActive) S.seq = 'paused';
      logEvent({ sys: 'mc', title: 'השיחה הועברה ל-Live Chat' + (wasActive ? ' — הרצף האוטומטי מושהה' : ''), tag: 'Live Chat', short: 'הועבר ל-Live Chat', detail: 'במקום שהבוט "ינחש" תשובה, אדם אמיתי עונה. כל עוד השיחה פתוחה — לא יוצאות הודעות אוטומטיות.', data: { action: 'Open Live Chat conversation', assign_to: 'מתתיה', pause_automation: wasActive, message: v } });
      return api({ from: 'mc', to: 'tg', title: 'התראה למתתיה: הודעה חדשה ב-Live Chat', short: 'מתתיה קיבל התראה', url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: '💬 ' + S.name + ' (' + S.phone + ') כתב במסנג\'ר: "' + v + '" — ממתין לתשובה ב-Live Chat' }, res: { ok: true, result: { message_id: 6000 + Math.floor(Math.random() * 999), date: unixTs() } }, delay: 500 }).then(function () {
        if (wasActive) return sheetUpdate({ stage: 'מושהה — Live Chat (' + stepWhen() + ')', note: 'שאלה פתוחה — ממתין למענה של מתתיה' }, 'live_chat_opened');
        return sheetUpdate({ note: 'שאלה פתוחה — ממתין למענה של מתתיה' }, 'live_chat_opened');
      }).then(function () {
        return msBot(L().reply.liveChat(S.name));
      }).then(function () {
        var n = msSys('🔔 הועבר ל-Live Chat — מתתיה יקבל התראה' + (wasActive ? '<br><small>הרצף האוטומטי מושהה עד שהשיחה תיסגר</small>' : ''));
        if (wasActive) {
          var b = el('button', '', '▶ (דמו) מתתיה ענה וסגר את השיחה — המשך רצף'); b.type = 'button';
          b.addEventListener('click', function () { b.disabled = true; enqueue(resumeSeq); });
          n.appendChild(b);
        }
      });
    });
  }
  function resumeSeq() {
    if (S.seq !== 'paused') return Promise.resolve();
    S.seq = 'active';
    logEvent({ sys: 'mc', title: 'שיחת ה-Live Chat נסגרה — הרצף האוטומטי ממשיך', tag: 'חידוש רצף', short: 'הרצף חודש' });
    return sheetUpdate({ stage: STEPS[S.step].stage + ' · חודש', note: 'שאלה נענתה ע"י מתתיה' }, 'live_chat_closed').then(function () { msSys('▶ השיחה נסגרה — הרצף ממשיך'); });
  }

  /* ------------------------------------------------------------ skip forward */
  function updateSkip() {
    var b = $('#btnSkip'); if (!b) return;
    var ready = S.step >= 0 && S.seq !== 'none';
    if (S.step >= 4) { b.disabled = true; b.textContent = '✓ סוף הדמו (יום 6)'; b.classList.remove('nudge'); return; }
    b.disabled = !ready || S.pending > 0;
    b.textContent = '⏩ דלג קדימה' + (ready ? ': ' + STEPS[S.step + 1].skip : '');
    b.classList.toggle('nudge', ready && !S.skipNudged && S.pending === 0);
  }
  $('#btnSkip').addEventListener('click', function () {
    if (S.pending > 0 || S.step < 0 || S.step >= 4 || S.seq === 'none') return;
    S.skipNudged = true; enqueue(skip);
  });
  function skipNote(html, info) { var n = $('#skipNote'); n.hidden = false; n.className = 'skipnote' + (info ? ' info' : ''); n.innerHTML = html; }
  function whyNot() {
    if (S.seq === 'details') return 'הליד בחר "רק את הפרטים", ולכן אינו ברצף.';
    if (S.seq === 'paused') return 'הרצף מושהה כי יש שיחה פתוחה ב-Live Chat.';
    if (S.seq === 'stopped') return 'הרצף נעצר (סטטוס: ' + S.status + ').';
    if (S.seq === 'closed') return 'חלון 24 השעות נסגר והליד לא אישר הודעות שיווקיות — הוא עכשיו בקהל הריטרגטינג בפייסבוק.';
    if (S.seq === 'done') return 'הרצף כבר הושלם.';
    return '';
  }
  function jumpTo(idx) {
    var st = STEPS[idx], d;
    if (st.day != null) { d = midnight(clockBase); d.setDate(d.getDate() + st.day); d.setHours(10, 0, 0, 0); }
    else d = new Date(S.t0.getTime() + st.h * 36e5);
    simNow = d; renderClock();
  }
  function skip() {
    var idx = S.step + 1;
    var p = Promise.resolve();
    if (idx === 3 && !S.windowLogged) {
      /* the 24h window closes between M3 and M4 */
      S.windowLogged = true;
      p = p.then(function () {
        simNow = new Date(S.t0.getTime() + 864e5); renderClock();
        if (S.seq === 'active' && S.optin) {
          logEvent({ sys: 'msg', title: 'חלון 24 שעות נסגר — הליד אישר הודעות שיווקיות, ולכן ממשיכים ב-Marketing Messages', tag: 'חלון נסגר', short: 'חלון נסגר — ממשיכים בהודעות שיווקיות' });
        } else if (S.seq === 'active' || S.seq === 'details' || (S.seq === 'paused' && !S.optin)) {
          S.seq = 'closed';
          logEvent({ sys: 'msg', to: 'fb', title: 'חלון 24 שעות נסגר — הליד נכנס לקהל ריטרגטינג בפייסבוק', tag: 'ריטרגטינג', kind: 'warn', short: 'חלון נסגר — קהל ריטרגטינג', detail: 'אסור לשלוח לו עוד הודעות במסנג\'ר (לא אישר הודעות שיווקיות). במקום זה הוא נכלל בקהל מותאם בפייסבוק ("אנשים ששוחחו עם הדף במסנג\'ר"), ואפשר להציג לו מודעות.', data: { custom_audience: 'Messenger — שוחחו עם הדף (30 יום)', subscriber_id: S.subscriber_id, marketing_optin: S.optin === null ? 'not answered' : S.optin } });
          return sheetUpdate({ stage: 'חלון נסגר — קהל ריטרגטינג' }, 'window_closed_retargeting');
        } else {
          logEvent({ sys: 'msg', title: 'חלון 24 שעות נסגר', tag: 'חלון נסגר', short: 'חלון 24 שעות נסגר', ticker: false });
        }
      });
    }
    return p.then(function () {
      S.step = idx; jumpTo(idx);
      if (idx === 2) setGuide(3);
      logEvent({ sys: 'mc', title: '⏩ השעון המדומה קפץ ל: ' + STEPS[idx].skip + ' — בודקים אם יש הודעה מתוזמנת', tag: 'שעון דמו', short: STEPS[idx].skip, ticker: false });
      var ok = S.seq === 'active' && (!STEPS[idx].mkt || S.optin);
      if (ok) { $('#skipNote').hidden = true; return sendSeq(idx); }
      var why = whyNot();
      logEvent({ sys: 'mc', title: STEPS[idx].skip + ': לא נשלחה הודעה — ' + why, tag: 'אין הודעה', kind: S.seq === 'done' ? null : 'warn', short: STEPS[idx].skip + ': אין הודעה (ראו לוג)' });
      skipNote('🕒 ' + esc(STEPS[idx].skip) + ': לא נשלחה הודעה. ' + esc(why) + ' <b>ההסבר בלוג API.</b>', S.seq === 'done');
      return sleep(200);
    });
  }

  /* ------------------------------------------------------------ sheet */
  var COLS = { stage: 'G', optin: 'H', status: 'I', note: 'K' };
  function stPill(s) { return '<span class="st ' + (STATUS_CLS[s] || 'new') + '">' + esc(s) + '</span>'; }
  function sheetUpdate(fields, event, extra) {
    var ev = { event: event, subscriber_id: S.subscriber_id, phone: S.phone };
    Object.keys(fields).forEach(function (k) { ev[k === 'stage' ? 'sequence_step' : k === 'optin' ? 'marketing_optin' : k] = fields[k]; });
    if (extra) Object.keys(extra).forEach(function (k) { ev[k] = extra[k]; });
    return api({ from: 'mc', to: 'make', title: 'דיווח ל-Make על אירוע: ' + event, short: 'עדכון ל-Make: ' + event, url: MAKE_HOOK + '/events', req: ev, res: 'Accepted', delay: 420 }).then(function () {
      if (fields.stage != null) S.stage = fields.stage;
      if (fields.status != null) S.status = fields.status;
      if (fields.note != null) S.note = fields.note;
      if (fields.optin != null) S.optinCol = fields.optin;
      var cols = Object.keys(fields).map(function (k) { return COLS[k]; }).sort();
      var multi = cols.length > 1;
      var range = multi ? 'לידים!G' + ROW + ':K' + ROW : 'לידים!' + cols[0] + ROW;
      var one = { G: S.stage, H: S.optinCol, I: S.status, K: S.note }[cols[0]];
      return api({
        from: 'make', to: 'gs', title: 'Google Sheets — Update a Row (שורה ' + ROW + ')', short: 'הגיליון עודכן', method: 'PUT',
        url: 'https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + range + '?valueInputOption=USER_ENTERED',
        req: { range: range, values: [multi ? [S.stage, S.optinCol, S.status, REF, S.note] : [one]] },
        res: { spreadsheetId: SHEET_ID, updatedRange: range, updatedRows: 1, updatedColumns: multi ? 5 : 1, updatedCells: multi ? 5 : 1 }, delay: 500
      }).then(function () { updateSheetRow(cols); });
    });
  }
  function addSheetRow(date) {
    var tr = $('#newRowSlot'); tr.className = 'newrow rowin';
    tr.innerHTML = '<td class="rn">' + ROW + '</td><td><span class="mono">' + date + '</span></td><td>' + esc(S.name) + '</td><td><span class="mono">' + esc(S.phone) + '</span></td><td>' + L().langLabel + '</td><td>' + TX.he.mots[S.motIdx] + '</td><td><span class="mono">#' + POST_ID + '</span></td>' +
      '<td data-col="G">' + esc(S.stage) + '</td><td data-col="H">' + esc(S.optinCol) + '</td><td data-col="I">' + stPill(S.status) + '</td><td><span class="mono">' + REF + '</span></td><td data-col="K">' + esc(S.note) + '</td>';
    $$('td', tr).forEach(function (td) { if (!td.classList.contains('rn')) flashTd(td); });
    setFx('A' + ROW + ':K' + ROW, 'שורה חדשה נוספה אוטומטית ע"י Make');
    renderStrip(); badge('sheet');
  }
  function updateSheetRow(cols) {
    var tr = $('#newRowSlot');
    var map = { G: function () { return esc(S.stage); }, H: function () { return esc(S.optinCol); }, I: function () { return stPill(S.status); }, K: function () { return esc(S.note); } };
    cols.forEach(function (c) { var td = $('td[data-col="' + c + '"]', tr); if (!td) return; td.innerHTML = map[c](); flashTd(td); });
    var key = cols.indexOf('I') >= 0 ? 'I' : cols[0];
    setFx(key + ROW, { G: S.stage, H: S.optinCol, I: S.status, K: S.note }[key]);
    renderStrip(); badge('sheet');
  }
  function flashTd(td) {
    $$('#sheet td.sel').forEach(function (x) { x.classList.remove('sel'); });
    td.classList.add('flash', 'sel'); setTimeout(function () { td.classList.remove('flash'); }, 1300);
  }
  function setFx(ref, val) { $('#fxRef').textContent = ref; $('#fxVal').textContent = val; }
  function renderStrip() {
    var s = $('#leadStrip'); s.className = 'lead-strip live';
    s.innerHTML = '📍 השורה של <b>' + esc(S.name) + '</b> (שורה ' + ROW + '): סטטוס ' + stPill(S.status) + ' · שלב ברצף: <b>' + esc(S.stage) + '</b> · הודעות שיווקיות: <b>' + esc(S.optinCol) + '</b>';
  }

  /* ------------------------------------------------------------ wiring */
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
  $$('.goto').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.goto); }); });
  $('#resetBtn').addEventListener('click', function () {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    location.replace(location.pathname + (FAST ? '?fast' : ''));
  });
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', function () { if (!isMobile()) $$('.panel').forEach(function (p) { p.classList.add('on'); }); else showTab(currentTab(), { noScroll: true }); });
  if (!isMobile()) $$('.panel').forEach(function (p) { p.classList.add('on'); });
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'pop' || e.animationName === 'rowin') { e.target.style.animation = 'none'; e.target.classList.remove('rowin'); }
  });
  syncName(); renderClock(); updateSkip();

  /* read-only state for automated tests */
  window.__demoState = function () { return JSON.parse(JSON.stringify(S)); };
})();
