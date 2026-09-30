/* דמו אינטראקטיבי — משפך אוטומציה, קורס סופר סת"ם
 * Everything here is simulated in the browser. No network calls, no storage, no analytics.
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

  /* ------------------------------------------------------------ constants */
  var DEMO_PHONE_LOCAL = '050-1234567';
  var POST_ID = '1234';
  var PAGE_ID = '100000000000000';
  var PHONE_NUMBER_ID = '100000000000001';
  var MAKE_HOOK = 'https://hook.eu2.make.com/demo-stam-leads';
  var SHEET_ID = 'DEMO_SHEET_ID';
  var ROW = 6;
  var TEMPLATES = ['stam_welcome', 'stam_day2', 'stam_day4', 'stam_day6'];
  var DAYS = [0, 2, 4, 6];
  var MOTS_HE = ['פרנסה יציבה', 'גמישות בזמנים', 'חיבור רוחני', 'הכל ביחד'];
  var MOTS_EN = ['Stable income', 'Flexible hours', 'Spiritual connection', 'All of the above'];

  function rid(n) { var s = ''; var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'; for (var i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

  /* ------------------------------------------------------------ texts */
  var T = {
    he: {
      motQ: function (n) { return 'נעים מאוד ' + n + '. כדי שאשלח לך את המידע הכי רלוונטי, מה הכי מושך אותך בכתיבת סת"ם?'; },
      phoneQ: 'מצוין, זה בדיוק מה שהקורס בנוי לתת.\nלאיזה מספר וואטסאפ לשלוח לך גישה חינם ל-7 ימי ניסיון ואת פרטי הקורס המלא?\n👇 לחיצה על הכפתור ממלאת את המספר אוטומטית',
      phoneHint: 'אפשר גם להקליד מספר בשורה למטה ⌨️',
      phonePh: 'הקלידו מספר, למשל 050-1234567',
      phoneBad: 'נראה שהמספר לא תקין 🤔\nאפשר לכתוב אותו שוב? למשל 050-1234567, או מספר בינלאומי עם קידומת מדינה, כמו +1 555 010 0001',
      consentQ: 'תודה! אפשר לשלוח לך בוואטסאפ את פרטי הקורס ועוד 3 הודעות קצרות? אפשר להסיר בכל רגע.',
      yes: 'כן, שלחו לי ✅', details: 'רק את הפרטים',
      doneYes: 'נשלח! 📜 בעוד רגע תקבל את הפרטים בוואטסאפ.\nכדאי לשמור את המספר באנשי הקשר.\nבהצלחה, ושתזכה לכתוב בקדושה ובטהרה.',
      doneDetails: 'נשלח! 📜 בעוד רגע תקבל את פרטי הקורס בוואטסאפ (הודעה אחת, בלי המשך).\nכדאי לשמור את המספר באנשי הקשר.\nבהצלחה, ושתזכה לכתוב בקדושה ובטהרה.',
      msgs: [
        function (n) { return 'שלום ' + n + ',\nתודה על ההתעניינות בקורס סופר סת"ם של הרב אליעזר אדם, ראש מכון "מלאכת שמים" 📜\n\n🎁 7 ימי ניסיון חינם, בלי כרטיס אשראי:\nsoferstam.org/trial\n\nמה מחכה לך בקורס המלא:\n✍️ שיעורי וידאו מוקלטים, לומדים מהבית בקצב שלך\n📸 משוב ותיקונים אישיים מהרב על כל כתיבה שאתה שולח בצילום\n🎥 מפגשים פרטיים בזום ללא הגבלה, ושיעור הלכה שבועי\n📖 מעיפרון ועד קולמוס, קלף וכתיבת מגילת אסתר כשרה\n🎓 מבחן הסמכה ותעודת סופר סת"ם מוסמך\n♾️ גישה וליווי לכל החיים\n\nיש שאלה? פשוט להשיב להודעה.'; },
        function (n) { return n + ', הספקת להציץ בשיעורי הניסיון?\n\nשאלה שהרב שומע הרבה: "יש לי בכלל זמן לזה?"\nהקורס בנוי בדיוק בשביל אנשים עסוקים:\n⏱️ אין מועדים קבועים. כל השיעורים מוקלטים, ולומדים מתי שנוח: בבוקר, בלילה או בין הסדרים\n⏸️ צריך הפסקה? אפשר לעצור ולחזור בלי תשלום נוסף\n🖋️ הציוד לתחילת הדרך עולה פחות מ-200 ₪\n\nומה שיוצא מזה הוא מקצוע שעובדים בו מהבית, בשעות שלך, לצד עבודה או כפרנסה מלאה. ובכל מזוזה שנכתבת בקדושה, אתה שותף בשמירה על בית יהודי.\n\nלהמשך הניסיון: soferstam.org/trial'; },
        function (n) { return n + ', הרב אדם הכשיר עד היום למעלה מ-2,500 סופרי סת"ם, ולקורס יש הסכמות של רבנים, ובהם הרב יעקב מאיר שטרן, מחבר "משנת הסופר".\n\nככה מתאר את זה שלמה ר\' מירושלים:\n"התוכנית הזאת היא כמו לקבל רב פרטי כל יום – גם בהלכה וגם בכתיבה."\n\nוהדרך ברורה: 20 המזוזות הראשונות שלך נכתבות בליווי צמוד של הרב, עד שהן נבדקות ונמכרות. בנוסף מקבלים הדרכה בבניית רשימת לקוחות ובהקמת עסק עצמאי.\n\n⏳ תקופת הניסיון היא 7 ימים בלבד, אז כדאי לנצל אותה עד הסוף.\nהקורס המלא עולה 3,800 ₪, ואפשר לשלם בתשלומים.\n\nלהרשמה: soferstam.org/register'; },
        function (n) { return n + ', זו ההודעה האחרונה שלי בנושא, ואני לא אטריד מעבר לזה 🙏\n\nאם נשארה שאלה פתוחה, על הזמן, על העלות, או אם זה בכלל בשבילך, אפשר לקבוע שיחה קצרה של 5 דקות עם הרב אליעזר אדם, בלי שום התחייבות.\n\nתשאל כל מה שחשוב לך, ותקבל תשובה ישירה ממי שילמד אותך.\nלבחירת זמן (בין 10:00 ל-18:00 שעון ישראל): soferstam.org/call\n\nבהצלחה בכל אשר תפנה, ושתזכה לכתוב בקדושה ובטהרה.'; }
      ],
      btn: { trial: 'התחלתי את הניסיון', question: 'יש לי שאלה', unsub: 'הסר', fit: 'זה מתאים לי?', register: 'אני רוצה להירשם', call: 'לקבוע שיחה', notnow: 'לא כרגע' },
      reply: {
        trial: 'כל הכבוד! 🎉 שיהיה בהצלחה בשיעורי הניסיון.\nאם משהו לא ברור, פשוט להשיב להודעה.',
        fit: 'שאלה מצוינת 🙂 הקורס בנוי גם למי שמתחיל מאפס: מהאות הראשונה ועד מזוזה כשרה, עם משוב אישי מהרב על כל כתיבה.\nרוצה לשאול משהו ספציפי? לחצו "יש לי שאלה".',
        register: 'איזה יופי! 🙏 להשלמת ההרשמה: soferstam.org/register\nמכאן נמשיך איתך באופן אישי, בלי הודעות אוטומטיות.',
        call: 'מצוין! לבחירת זמן לשיחה עם הרב: soferstam.org/call\nנתראה בשיחה 🙏',
        notnow: 'תודה על הכנות 🙏 לא נשלח הודעות נוספות.\nאם תרצה לחזור, פשוט לכתוב לנו כאן.',
        unsub: 'הוסרת מרשימת התפוצה ✅ לא יישלחו אליך הודעות נוספות.',
        question: 'תודה! העברתי את השאלה לצוות, ומתתיה יחזור אליך כאן בהקדם 🙏'
      },
      langLabel: 'עברית'
    },
    en: {
      motQ: function (n) { return 'Nice to meet you, ' + n + '. So I can send you the most relevant information — what draws you most to writing STaM?'; },
      phoneQ: 'Great — that\'s exactly what the course is built to give.\nWhich WhatsApp number should I send your free 7-day trial access and the full course details to?\n👇 Tapping the button fills in your number automatically',
      phoneHint: 'You can also type a number below ⌨️',
      phonePh: 'Type a number, e.g. +1 555 010 0001',
      phoneBad: 'That number doesn\'t look right 🤔\nCould you type it again? e.g. 050-1234567, or an international number with the country code, like +1 555 010 0001',
      consentQ: 'Thanks! May I send you the course details on WhatsApp, plus 3 more short messages? You can unsubscribe at any time.',
      yes: 'Yes, send me ✅', details: 'Just the details',
      doneYes: 'Sent! 📜 You\'ll get the details on WhatsApp in a moment.\nIt\'s worth saving the number in your contacts.\nWishing you success — may you merit to write in holiness and purity.',
      doneDetails: 'Sent! 📜 You\'ll get the course details on WhatsApp in a moment (one message, no follow-ups).\nIt\'s worth saving the number in your contacts.\nWishing you success — may you merit to write in holiness and purity.',
      msgs: [
        function (n) { return 'Hi ' + n + ',\nThank you for your interest in the Sofer STaM course by Rabbi Eliezer Adam, head of the "Meleches Shamayim" institute 📜\n\n🎁 7-day free trial, no credit card needed:\nsoferstam.org/trial\n\nWhat\'s waiting for you in the full course:\n✍️ Recorded video lessons — learn from home, at your own pace\n📸 Personal feedback and corrections from the Rabbi on every piece you send by photo\n🎥 Unlimited private Zoom sessions, plus a weekly halacha class\n📖 From pencil to quill, parchment, and writing a kosher Megillat Esther\n🎓 Certification exam and a certified Sofer STaM diploma\n♾️ Lifetime access and support\n\nHave a question? Just reply to this message.'; },
        function (n) { return n + ', have you had a chance to look at the trial lessons?\n\nA question the Rabbi hears a lot: "Do I even have time for this?"\nThe course is built exactly for busy people:\n⏱️ No fixed schedule. All lessons are recorded, so you learn whenever it suits you: morning, night, or between study sessions\n⏸️ Need a break? You can pause and come back at no extra cost\n🖋️ Starter equipment costs less than ₪200\n\nWhat comes out of it is a profession you can practice from home, on your own hours — alongside a job or as a full livelihood. And with every mezuzah written in holiness, you share in protecting a Jewish home.\n\nContinue your trial: soferstam.org/trial'; },
        function (n) { return n + ', Rabbi Adam has trained more than 2,500 sofrim to date, and the course carries approbations from rabbis, including Rabbi Yaakov Meir Stern, author of "Mishnat HaSofer".\n\nHere\'s how Shlomo R. from Jerusalem describes it:\n"This program is like having a private rabbi every day — in both halacha and writing."\n\nAnd the path is clear: your first 20 mezuzot are written under the Rabbi\'s close guidance, until they are checked and sold. You also get guidance on building a client list and setting up your own business.\n\n⏳ The trial is only 7 days, so make the most of it.\nThe full course costs ₪3,800, and you can pay in installments.\n\nTo register: soferstam.org/register'; },
        function (n) { return n + ', this is my last message on the subject, and I won\'t bother you beyond this 🙏\n\nIf you still have an open question — about the time, the cost, or whether it\'s right for you at all — you can book a short 5-minute call with Rabbi Eliezer Adam, with no obligation.\n\nAsk anything that matters to you, and get a direct answer from the person who will teach you.\nPick a time (between 10:00 and 18:00 Israel time): soferstam.org/call\n\nWishing you success in all you do — may you merit to write in holiness and purity.'; }
      ],
      btn: { trial: 'I started the trial', question: 'I have a question', unsub: 'Unsubscribe', fit: 'Is this right for me?', register: 'I want to register', call: 'Book a call', notnow: 'Not now' },
      reply: {
        trial: 'Well done! 🎉 Enjoy the trial lessons.\nIf anything is unclear, just reply to this message.',
        fit: 'Great question 🙂 The course is built for complete beginners too: from the very first letter to a kosher mezuzah, with personal feedback from the Rabbi on every piece.\nWant to ask something specific? Tap "I have a question".',
        register: 'Wonderful! 🙏 To complete your registration: soferstam.org/register\nFrom here we\'ll continue with you personally — no more automated messages.',
        call: 'Excellent! Pick a time for your call with the Rabbi: soferstam.org/call\nTalk soon 🙏',
        notnow: 'Thanks for letting us know 🙏 We won\'t send any more messages.\nIf you\'d like to come back, just write to us here.',
        unsub: 'You\'ve been unsubscribed ✅ You won\'t receive any more messages.',
        question: 'Thanks! I\'ve passed your question on to the team — Matityahu will get back to you here shortly 🙏'
      },
      langLabel: 'English'
    }
  };
  var MSG_BUTTONS = [
    ['trial', 'question', 'unsub'],
    ['fit', 'question', 'unsub'],
    ['register', 'question', 'unsub'],
    ['call', 'notnow', 'unsub']
  ];
  var BTN_PAYLOAD = { trial: 'TRIAL_STARTED', question: 'HAS_QUESTION', unsub: 'UNSUBSCRIBE', fit: 'IS_IT_FOR_ME', register: 'WANT_TO_REGISTER', call: 'BOOK_CALL', notnow: 'NOT_NOW' };

  /* ------------------------------------------------------------ state */
  var S = {
    name: 'יוסף', lang: null, motIdx: null, phone: null, consent: null,
    triggered: false, day: 0, sentIdx: -1, seq: 'none', /* none|active|details|paused|stopped|done */
    status: null, stage: null, note: null, stopReason: null,
    subscriber_id: String(Math.floor(1e8 + Math.random() * 9e8)),
    psid: 'DEMO_PSID_' + rid(6),
    commentId: POST_ID + '_' + Math.floor(10000 + Math.random() * 89999),
    pending: 0, skipNudged: false
  };
  var L = function () { return T[S.lang || 'he']; };

  /* ------------------------------------------------------------ simulated clock */
  var clockBase = new Date();
  clockBase.setSeconds(Math.floor(clockBase.getSeconds()));
  var simNow = new Date(clockBase.getTime());
  function tick(sec) { simNow = new Date(simNow.getTime() + sec * 1000); renderClock(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function hhmmss(d) { return hhmm(d) + ':' + pad(d.getSeconds()); }
  function ddmmyyyy(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function stamp() { return 'יום ' + S.day + ' · ' + ddmmyyyy(simNow) + ' ' + hhmmss(simNow); }
  function unixTs() { return String(Math.floor(simNow.getTime() / 1000)); }
  function isoTs() { var d = simNow; var off = -d.getTimezoneOffset(); var sgn = off >= 0 ? '+' : '-'; off = Math.abs(off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + hhmmss(d) + sgn + pad(Math.floor(off / 60)) + ':' + pad(off % 60); }
  function renderClock() {
    $('#clock').textContent = 'יום ' + S.day + ' · ' + hhmm(simNow);
    $$('.clk').forEach(function (e) { e.textContent = hhmm(simNow); });
  }

  /* ------------------------------------------------------------ helpers */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(text) {
    return esc(text).replace(/soferstam\.org\/[a-z]+/g, function (m) { return '<span class="lnk" tabindex="0" role="note" title="קישור דמו — לא פעיל">' + m + '</span>'; });
  }
  /* keep phone numbers as one left-to-right unit inside Hebrew text (no reordering, no line break at "-") */
  function nums(html) { return html.replace(/(\+?\d[\d \-]{5,}\d)/g, '<span class="nw">$1</span>'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function scrollChat(box) { requestAnimationFrame(function () { box.scrollTop = box.scrollHeight; }); }
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
  var PANEL_OF = { fb: 'fb', ms: 'ms', wa: 'wa', sheet: 'sheet', log: 'log' };
  function showTab(id, opts) {
    $$('.tabs button').forEach(function (b) { var on = b.dataset.tab === id; b.classList.toggle('on', on); if (on) b.classList.remove('badge'); });
    $$('.panel').forEach(function (p) { p.classList.toggle('on', p.dataset.panel === id); });
    if (isMobile()) {
      /* the tab bar is sticky, so measure the header above it (its natural offset) */
      var y = $('.top').offsetHeight;
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
    $$('#guide li').forEach(function (li) {
      var n = +li.dataset.step;
      li.classList.toggle('active', n === step);
      li.classList.toggle('done', n < step);
    });
  }
  var chainTimers = {};
  function lit(sys) {
    var map = { fb: 'fb', mc: 'mc', make: 'make', gs: 'gs', mail: 'alert', tg: 'alert', wa: 'wa', user: null };
    var k = map[sys]; if (!k) return;
    var b = $('#chain b[data-sys="' + k + '"]'); if (!b) return;
    b.classList.add('lit'); clearTimeout(chainTimers[k]);
    chainTimers[k] = setTimeout(function () { b.classList.remove('lit'); }, 1400);
  }

  /* ------------------------------------------------------------ ticker & tooltip */
  var tickerTimer;
  var SYS_NAME = { fb: 'Facebook', mc: 'ManyChat', make: 'Make', gs: 'Google Sheets', mail: 'Email', tg: 'Telegram', wa: 'WhatsApp', user: 'משתמש' };
  function ticker(html) {
    var t = $('#ticker');
    t.innerHTML = '<span>⚡</span><span>' + html + '</span><span class="go">ללוג ←</span>';
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(tickerTimer);
    tickerTimer = setTimeout(function () { t.hidden = true; }, 3800);
  }
  $('#ticker').addEventListener('click', function () {
    $('#ticker').hidden = true;
    if (isMobile()) showTab('log'); else $('#p-log').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var tipTimer;
  function showTip(target) {
    var tip = $('#tip'); var r = target.getBoundingClientRect();
    tip.hidden = false;
    var w = tip.offsetWidth;
    var left = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2));
    var top = r.top - tip.offsetHeight - 8; if (top < 8) top = r.bottom + 8;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
    clearTimeout(tipTimer); tipTimer = setTimeout(function () { tip.hidden = true; }, 2200);
  }
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('.lnk');
    if (l) { e.preventDefault(); showTip(l); }
  });
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
    log.appendChild(node); scrollChat(log);
    badge('log');
  }
  /* simulated HTTP call */
  function api(o) {
    tick(o.tick != null ? o.tick : 1);
    var e = el('div', 'le');
    var reqOpen = logOpenAll || o.open ? ' open' : '';
    e.innerHTML =
      '<div class="le-h"><span class="le-t">' + esc(stamp()) + '</span>' + routeHtml(o.from, o.to) +
      '<span class="le-st pending">⏳ שולח…</span></div>' +
      '<div class="le-title">' + esc(o.title) + '</div>' +
      '<div class="le-url"><b>' + esc(o.method || 'POST') + '</b> ' + esc(o.url) + '</div>' +
      (o.req !== undefined ? '<details class="rq"' + reqOpen + '><summary>בקשה (Request) — הנתונים שנשלחו</summary><pre>' + jsonHtml(o.req) + '</pre></details>' : '') +
      '<div class="resp-slot"></div>' +
      (o.note ? '<div class="le-note">💡 ' + o.note + '</div>' : '');
    addLog(e); lit(o.from); lit(o.to);
    ticker(SYS_NAME[o.from] + ' → ' + SYS_NAME[o.to] + ': ' + esc(o.short || o.title));
    return sleep(o.delay || 650).then(function () {
      var st = $('.le-st', e);
      var code = o.status || 200;
      st.className = 'le-st ' + (code < 300 ? 'ok' : 'bad');
      st.textContent = code + ' ' + (o.statusText || 'OK') + ' · ' + Math.round((o.delay || 650) * (0.6 + Math.random() * 0.3)) + 'ms';
      if (o.res !== undefined) {
        $('.resp-slot', e).innerHTML = '<details class="rs"' + (logOpenAll ? ' open' : '') + '><summary>תשובה (Response)</summary><pre>' + jsonHtml(o.res) + '</pre></details>';
      }
      lit(o.to);
      return o.res;
    });
  }
  /* internal (non-HTTP) event */
  function logEvent(o) {
    tick(o.tick != null ? o.tick : 0);
    var e = el('div', 'le ev' + (o.kind ? ' ' + o.kind : ''));
    e.innerHTML = '<div class="le-h"><span class="le-t">' + esc(stamp()) + '</span>' + routeHtml(o.sys, o.to) +
      '<span class="le-st ' + (o.kind === 'warn' || o.kind === 'stop' ? 'bad' : 'info') + '">' + esc(o.tag || 'פעולה פנימית') + '</span></div>' +
      '<div class="le-title">' + esc(o.title) + '</div>' +
      (o.detail ? '<div class="le-note">' + o.detail + '</div>' : '') +
      (o.data ? '<details' + (logOpenAll ? ' open' : '') + '><summary>פרטים</summary><pre>' + jsonHtml(o.data) + '</pre></details>' : '');
    addLog(e); lit(o.sys);
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
  function syncName() {
    var v = nameInput.value.replace(/[<>]/g, '').trim();
    S.name = v || 'יוסף';
    $('#meAv').textContent = firstLetter(S.name);
  }
  nameInput.addEventListener('input', syncName);

  function addFbComment(author, text, isPage, auto) {
    var box = $('#fbComments');
    var c = el('div', 'cm' + (isPage ? ' reply' : ''));
    c.innerHTML = (isPage ? '<div class="av page-av" style="width:28px;height:28px;font-size:13px;border-width:1.5px">ס</div>' : '<div class="av u-av">' + esc(firstLetter(author)) + '</div>') +
      '<div><div class="b"><div class="n">' + esc(author) + (isPage ? ' <span class="author">מחבר/ת</span>' : '') + '</div><div class="x">' + esc(text) + '</div></div>' +
      '<div class="meta"><span>עכשיו</span><span>לייק</span><span>השב</span></div>' +
      (auto ? '<span class="auto-tag">🤖 תגובה אוטומטית של ManyChat</span>' : '') + '</div>';
    box.appendChild(c);
  }
  var commentCount = 46;
  function bumpCount() { commentCount++; $('#fbCount').textContent = commentCount + ' תגובות · 12 שיתופים'; }

  function onComment(text) {
    text = String(text || '').trim();
    if (!text || S.triggered) return;
    syncName();
    nameInput.disabled = true;
    $('#commentInput').value = '';
    addFbComment(S.name, text, false, false); bumpCount();
    var matched = /סילבוס|syllabus/i.test(text);
    if (!matched) {
      enqueue(function () {
        return api({
          from: 'fb', to: 'mc', title: 'תגובה חדשה על הפוסט — Facebook מודיע ל-ManyChat', short: 'תגובה חדשה (בלי מילת מפתח)',
          url: 'https://manychat.com/webhook/facebook (demo)', req: fbWebhook(text), res: { success: true }, delay: 500
        }).then(function () {
          logEvent({ sys: 'mc', title: 'מילת המפתח "סילבוס" לא נמצאה בתגובה — הבוט לא מגיב', tag: 'אין התאמה', kind: 'warn', detail: 'ManyChat מגיב רק לתגובות שמכילות את מילת המפתח. תגובות רגילות נשארות כרגיל, בלי תגובה אוטומטית.' });
          var h = $('#fbHint'); h.hidden = false; h.className = 'hint';
          h.innerHTML = '💡 הבוט מגיב רק לתגובות עם המילה <span class="kw">סילבוס</span>. נסו שוב, או לחצו על הכפתור הכחול.';
        });
      });
      return;
    }
    S.triggered = true;
    $('#btnSyllabus').disabled = true; $('#btnSyllabus').classList.remove('nudge');
    $('#commentInput').disabled = true; $('#commentSend').disabled = true;
    $('#fbHint').hidden = true;
    enqueue(flowTrigger.bind(null, text));
  }
  function fbWebhook(text) {
    return { object: 'page', entry: [{ id: PAGE_ID, time: +unixTs(), changes: [{ field: 'feed', value: { item: 'comment', verb: 'add', post_id: PAGE_ID + '_' + POST_ID, comment_id: S.commentId, message: text, from: { id: S.psid, name: S.name }, created_time: +unixTs() } }] }] };
  }
  function flowTrigger(text) {
    var pub = 'תודה ' + S.name + '! שלחתי לך הודעה פרטית עם הפרטים 🙏';
    return api({
      from: 'fb', to: 'mc', title: 'תגובה חדשה על הפוסט — Facebook מודיע ל-ManyChat', short: 'תגובה חדשה עם "סילבוס"',
      url: 'https://manychat.com/webhook/facebook (demo)', req: fbWebhook(text), res: { success: true }, delay: 550,
      note: 'פייסבוק שולח ל-ManyChat כל תגובה חדשה על הפוסט.'
    }).then(function () {
      logEvent({ sys: 'mc', title: 'זוהתה מילת המפתח "סילבוס" ← מופעל התרחיש "סילבוס — איסוף ליד"', tag: 'טריגר', short: 'זוהתה מילת מפתח — הבוט מופעל', data: { trigger: 'Facebook Comments', keyword_rule: 'contains: סילבוס | syllabus', post_id: POST_ID, flow: 'סילבוס — איסוף ליד', subscriber_id: S.subscriber_id } });
      return sleep(300);
    }).then(function () {
      return api({
        from: 'mc', to: 'fb', title: 'תגובה פומבית אוטומטית מתחת לתגובה', short: 'תגובה פומבית בפוסט',
        url: 'https://graph.facebook.com/v21.0/' + S.commentId + '/comments', req: { message: pub }, res: { id: S.commentId + '1' }, delay: 700
      });
    }).then(function () {
      addFbComment('קורס סופר סת"ם', pub, true, true); bumpCount();
      return api({
        from: 'mc', to: 'fb', title: 'הודעה פרטית במסנג\'ר (Private Reply) — פתיחת השיחה', short: 'פתיחת שיחה פרטית במסנג\'ר',
        url: 'https://graph.facebook.com/v21.0/me/messages',
        req: { recipient: { comment_id: S.commentId }, messaging_type: 'RESPONSE', message: { text: 'שלום ' + S.name + ' 🙏\nתודה על ההתעניינות בקורס סופר סת"ם של הרב אליעזר אדם.\nHello! Which language do you prefer?', quick_replies: [{ content_type: 'text', title: 'עברית', payload: 'LANG_HE' }, { content_type: 'text', title: 'English', payload: 'LANG_EN' }] } },
        res: { recipient_id: S.psid, message_id: 'm_DEMO' + rid(18) }, delay: 700,
        note: 'במקביל לתגובה הפומבית, הבוט פותח שיחה פרטית במסנג\'ר עם המגיב.'
      });
    }).then(function () {
      var h = $('#fbHint'); h.hidden = false; h.className = 'hint ok';
      h.innerHTML = '✅ הבוט הגיב בפוסט ושלח הודעה פרטית במסנג\'ר. ' + (isMobile() ? 'עוברים למסנג\'ר…' : 'המשיכו בחלון המסנג\'ר ←');
      $('#gotoMs').hidden = false;
      setGuide(2);
      return startMessenger();
    });
  }
  $('#btnSyllabus').addEventListener('click', function () { onComment('סילבוס'); });
  $('#commentForm').addEventListener('submit', function (e) { e.preventDefault(); onComment($('#commentInput').value); });

  /* ------------------------------------------------------------ Messenger */
  var msBody = $('#msBody');
  function msClearEmpty() { var e = $('#msEmpty'); if (e) e.remove(); }
  function msTime() { msBody.appendChild(el('div', 'ms-time', 'היום ' + hhmm(simNow))); }
  function msTyping() {
    var r = el('div', 'bubrow in typing-row', '<div class="av page-av">ס</div><div class="bub typing"><i></i><i></i><i></i></div>');
    msBody.appendChild(r); scrollChat(msBody); return r;
  }
  function msBot(html, dir) {
    var t = msTyping();
    return sleep(800).then(function () {
      t.remove(); tick(2);
      var r = el('div', 'bubrow in', '<div class="av page-av">ס</div><div class="bub"' + (dir ? ' dir="' + dir + '"' : '') + '>' + nums(html) + '</div>');
      msBody.appendChild(r); scrollChat(msBody); badge('ms');
      return r;
    });
  }
  function msUser(text) {
    tick(3);
    var r = el('div', 'bubrow out', '<div class="bub" dir="auto">' + esc(text) + '</div>');
    msBody.appendChild(r); scrollChat(msBody);
  }
  function msQR(opts, onPick, extraCls) {
    $$('.qr', msBody).forEach(function (q) { q.classList.remove('nudge'); $$('button', q).forEach(function (b) { b.disabled = true; }); });
    var q = el('div', 'qr nudge' + (extraCls ? ' ' + extraCls : ''));
    opts.forEach(function (o) {
      var b = el('button', o.cls || '', esc(o.label)); b.type = 'button';
      if (o.dir) b.dir = o.dir;
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
  function setMsInput(enabled, ph) {
    var i = $('#msText'); i.disabled = !enabled; $('#msSend').disabled = !enabled;
    i.placeholder = enabled ? (ph || 'Aa') : 'בחרו אחת מהאפשרויות למעלה';
    if (!enabled) i.value = '';
  }
  function setField(field, value, label) {
    logEvent({ sys: 'mc', title: 'נשמר שדה במנוי: ' + field + ' = ' + value, tag: 'Set Field', short: label || ('נשמר ' + field), ticker: true, data: { subscriber_id: S.subscriber_id, field: field, value: value } });
  }

  function startMessenger() {
    msClearEmpty(); msTime();
    if (isMobile()) setTimeout(function () { if (currentTab() === 'fb') showTab('ms'); }, 900 * SPEED + 400);
    else badge('ms');
    var html = esc('שלום ' + S.name + ' 🙏\nתודה על ההתעניינות בקורס סופר סת"ם של הרב אליעזר אדם.') + '<span class="en">Hello! Which language do you prefer?</span>';
    return msBot(html).then(function () {
      msQR([{ label: 'עברית', v: 'he' }, { label: 'English', v: 'en', dir: 'ltr' }], onLang);
    });
  }
  function onLang(o) {
    S.lang = o.v; msUser(o.label);
    setField('lang', o.v, 'שפה: ' + o.label);
    var mots = S.lang === 'en' ? MOTS_EN : MOTS_HE;
    return msBot(esc(L().motQ(S.name)), S.lang === 'en' ? 'ltr' : null).then(function () {
      msQR(mots.map(function (m, i) { return { label: m, v: i, dir: S.lang === 'en' ? 'ltr' : null }; }), onMot);
    });
  }
  function onMot(o) {
    S.motIdx = o.v; msUser(o.label);
    setField('motivation', MOTS_HE[o.v], 'מוטיבציה: ' + MOTS_HE[o.v]);
    return askPhone(true);
  }
  function askPhone(first) {
    var txt = first ? L().phoneQ : L().phoneBad;
    return msBot(esc(txt), S.lang === 'en' ? 'ltr' : null).then(function () {
      msQR([{ label: '📱 ' + DEMO_PHONE_LOCAL, v: DEMO_PHONE_LOCAL, cls: 'demo-num', dir: 'ltr' }], function (o) { return onPhone(DEMO_PHONE_LOCAL, true); });
      var h = el('div', 'qr-hint', esc(L().phoneHint) + ' <span style="color:#8a8d91;font-weight:400">(מספר דמו)</span>');
      msBody.appendChild(h); scrollChat(msBody);
      setMsInput(true, L().phonePh);
      S.awaitPhone = true;
    });
  }
  function onPhone(raw, fromButton) {
    if (!S.awaitPhone) return;
    msUser(fromButton ? raw : raw);
    var e164 = normPhone(raw);
    if (!e164) {
      logEvent({ sys: 'mc', title: 'אימות מספר נכשל: "' + raw + '" אינו מספר נייד ישראלי או מספר בינלאומי תקין', tag: 'מספר לא תקין', kind: 'warn', short: 'מספר לא תקין — הבוט מבקש שוב', detail: 'פורמטים מקובלים: <span class="ltr">05X-XXXXXXX</span> (נייד ישראלי) או מספר בינלאומי עם קידומת, למשל <span class="ltr">+1 555 010 0001</span>. הבוט לא ממשיך עד שמתקבל מספר תקין.' });
      return askPhone(false);
    }
    S.awaitPhone = false;
    S.phone = e164; setMsInput(false);
    $$('.qr', msBody).forEach(function (q) { q.classList.remove('nudge'); $$('button', q).forEach(function (b) { b.disabled = true; }); });
    setField('phone', e164, 'טלפון נשמר בפורמט בינלאומי (E.164)');
    return msBot(esc(L().consentQ), S.lang === 'en' ? 'ltr' : null).then(function () {
      msQR([{ label: L().yes, v: 'yes', dir: S.lang === 'en' ? 'ltr' : null }, { label: L().details, v: 'details_only', dir: S.lang === 'en' ? 'ltr' : null }], onConsent);
    });
  }
  $('#msForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#msText').value.trim(); if (!v || !S.awaitPhone) return;
    $('#msText').value = '';
    enqueue(function () { return onPhone(v, false); });
  });
  function onConsent(o) {
    S.consent = o.v; msUser(o.label);
    setField('consent', o.v, 'הסכמה: ' + (o.v === 'yes' ? 'כן' : 'רק את הפרטים'));
    return msBot(esc(o.v === 'yes' ? L().doneYes : L().doneDetails), S.lang === 'en' ? 'ltr' : null).then(function () {
      msBody.appendChild(el('div', 'seen', 'נראה')); scrollChat(msBody);
      return pipeline();
    });
  }

  /* ------------------------------------------------------------ backend pipeline */
  var STATUS_CLS = { 'חדש': 'new', 'ניסיון': 'trial', 'שיחה נקבעה': 'call', 'נרשם ✅': 'won', 'הוסר': 'rem' };
  function leadPayload() {
    return { first_name: S.name, phone: S.phone, lang: S.lang, motivation: MOTS_HE[S.motIdx], consent: S.consent, post_id: POST_ID, subscriber_id: S.subscriber_id };
  }
  function pipeline() {
    return api({
      from: 'mc', to: 'make', title: 'שליחת נתוני הליד ל-Make (Webhook)', short: 'נתוני הליד נשלחו ל-Make',
      url: MAKE_HOOK, req: leadPayload(), res: 'Accepted', delay: 800, open: true,
      note: 'זה לב המערכת: ManyChat אוסף את התשובות ושולח אותן ל-Make, שמחבר בין כל שאר המערכות.'
    }).then(function () {
      var date = ddmmyyyy(simNow);
      S.status = 'חדש'; S.stage = 'ממתין לשליחה'; S.note = 'ליד חדש מהפוסט';
      return api({
        from: 'make', to: 'gs', title: 'Google Sheets — Add a Row (הוספת שורה לגיליון)', short: 'שורה חדשה נוספה לגיליון',
        url: 'https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/לידים!A:J:append?valueInputOption=USER_ENTERED',
        req: { values: [[date, S.name, S.phone, L().langLabel, MOTS_HE[S.motIdx], '#' + POST_ID, S.stage, S.status, 'DEMO-005', S.note]] },
        res: { spreadsheetId: SHEET_ID, tableRange: 'לידים!A1:J5', updates: { spreadsheetId: SHEET_ID, updatedRange: 'לידים!A' + ROW + ':J' + ROW, updatedRows: 1, updatedColumns: 10, updatedCells: 10 } },
        delay: 800
      }).then(function () { addSheetRow(date); });
    }).then(function () {
      var alertTxt = '🔔 ליד חדש: ' + S.name + ' · ' + S.phone + '\nשפה: ' + L().langLabel + ' · מוטיבציה: ' + MOTS_HE[S.motIdx] + ' · הסכמה: ' + (S.consent === 'yes' ? 'רצף מלא' : 'רק פרטים') + ' · פוסט #' + POST_ID;
      return Promise.all([
        api({
          from: 'make', to: 'mail', title: 'התראה במייל לצוות: "ליד חדש"', short: 'מייל התראה לצוות',
          url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          req: { to: 'team@example.com', subject: 'ליד חדש: ' + S.name + ' (קורס סת"ם)', body: alertTxt },
          res: { id: '18f' + rid(13).toLowerCase(), threadId: '18f' + rid(13).toLowerCase(), labelIds: ['SENT'] }, delay: 700
        }),
        sleep(150).then(function () {
          return api({
            from: 'make', to: 'tg', title: 'התראה בטלגרם למתתיה: "ליד חדש"', short: 'התראת טלגרם לצוות',
            url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: alertTxt },
            res: { ok: true, result: { message_id: 4000 + Math.floor(Math.random() * 999), chat: { id: 'DEMO_CHAT_ID', type: 'private' }, date: +unixTs(), text: alertTxt } }, delay: 650
          });
        })
      ]);
    }).then(function () {
      if (S.consent === 'yes') {
        S.seq = 'active';
        logEvent({ sys: 'mc', title: 'המנוי נוסף לרצף "סת"ם — 4 הודעות" (יום 0, 2, 4, 6)', tag: 'Sequence', short: 'המנוי נכנס לרצף ההודעות', data: { sequence: 'סת"ם — 4 הודעות', steps: [{ day: 0, template: 'stam_welcome' }, { day: 2, template: 'stam_day2' }, { day: 4, template: 'stam_day4' }, { day: 6, template: 'stam_day6' }], stop_when: ['unsubscribed', 'registered', 'call_booked', 'live_chat'] } });
      } else {
        S.seq = 'details';
        logEvent({ sys: 'mc', title: 'בחירה "רק את הפרטים" ← נשלחת הודעה 1 בלבד, המנוי לא נכנס לרצף', tag: 'ללא רצף', short: 'רק הודעה 1 — בלי רצף', detail: 'כך מכבדים את הבחירה של הלקוח: הוא יקבל את פרטי הקורס, ולא יותר.' });
      }
      return sendWa(0);
    }).then(function () {
      $('#gotoWa').hidden = false;
      setGuide(3);
      updateSkip();
      if (isMobile()) setTimeout(function () { if (currentTab() === 'ms') showTab('wa'); }, 1300 * SPEED + 300);
    });
  }

  /* ------------------------------------------------------------ WhatsApp */
  var waBody = $('#waBody');
  function waClearEmpty() { var e = $('#waEmpty'); if (e) e.remove(); }
  function waDay(label) { waBody.appendChild(el('div', 'day', esc(label))); }
  function waBizMsg(idx) {
    var lang = S.lang; var t = T[lang];
    var wrap = el('div', 'wa-msg');
    wrap.dataset.idx = idx;
    var bub = el('div', 'wa-bub');
    if (lang === 'en') bub.dir = 'ltr';
    bub.innerHTML = '<span class="tpl">תבנית ' + TEMPLATES[idx] + ' · ' + lang + '</span>' + linkify(t.msgs[idx](S.name)) + '<span class="tm">' + hhmm(simNow) + '</span>';
    wrap.appendChild(bub);
    MSG_BUTTONS[idx].forEach(function (k) {
      var b = el('button', 'wa-btn' + (k === 'unsub' ? ' stopb' : ''), '↩︎ ' + esc(t.btn[k]));
      b.type = 'button'; b.dataset.key = k;
      if (lang === 'en') b.dir = 'ltr';
      b.addEventListener('click', function () {
        if (b.disabled) return;
        b.disabled = true; b.classList.add('used');
        enqueue(function () { return onWaButton(k, t.btn[k]); });
      });
      wrap.appendChild(b);
    });
    waBody.appendChild(wrap); scrollChat(waBody);
    if (S.seq === 'stopped') disableWaButtons();
  }
  function waOut(text) {
    tick(20);
    var d = el('div', 'wa-out'); d.dir = 'auto';
    d.innerHTML = esc(text) + '<span class="tm">' + hhmm(simNow) + ' <b>✓✓</b></span>';
    waBody.appendChild(d); scrollChat(waBody);
  }
  function waAuto(text) {
    tick(2);
    var d = el('div', 'wa-in-auto'); if (S.lang === 'en') d.dir = 'ltr';
    d.innerHTML = nums(linkify(text)) + '<span class="tm">' + hhmm(simNow) + '</span>';
    waBody.appendChild(d); scrollChat(waBody); badge('wa');
  }
  function waSys(html, cls) {
    var d = el('div', 'sys-note' + (cls ? ' ' + cls : ''), html);
    waBody.appendChild(d); scrollChat(waBody); return d;
  }
  function disableWaButtons() { $$('.wa-btn', waBody).forEach(function (b) { b.disabled = true; }); }
  function waRecipient() { return S.phone.replace('+', ''); }
  function waStatusHook(wamid, status) {
    return api({
      from: 'wa', to: 'mc', title: 'עדכון סטטוס מ-WhatsApp: ' + status + (status === 'sent' ? ' (נשלחה)' : ' (נמסרה לטלפון)'), short: 'סטטוס הודעה: ' + status,
      url: 'https://manychat.com/webhook/whatsapp (demo)',
      req: { object: 'whatsapp_business_account', entry: [{ id: 'DEMO_WABA_ID', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { phone_number_id: PHONE_NUMBER_ID }, statuses: [{ id: wamid, status: status, timestamp: unixTs(), recipient_id: waRecipient() }] } }] }] },
      res: { success: true }, delay: 450, tick: status === 'sent' ? 1 : 2
    });
  }
  function sendWa(idx) {
    var wamid = 'wamid.DEMO' + rid(22);
    return api({
      from: 'mc', to: 'wa', title: 'שליחת הודעת תבנית ' + (idx + 1) + ' מתוך 4 בוואטסאפ (' + TEMPLATES[idx] + ')', short: 'הודעה ' + (idx + 1) + ' יוצאת בוואטסאפ',
      url: 'https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages',
      req: { messaging_product: 'whatsapp', recipient_type: 'individual', to: waRecipient(), type: 'template', template: { name: TEMPLATES[idx], language: { code: S.lang }, components: [{ type: 'body', parameters: [{ type: 'text', parameter_name: 'first_name', text: S.name }] }] } },
      res: { messaging_product: 'whatsapp', contacts: [{ input: waRecipient(), wa_id: waRecipient() }], messages: [{ id: wamid, message_status: 'accepted' }] },
      delay: 800, open: idx === 0,
      note: idx === 0 ? 'וואטסאפ מאפשר לעסק לפנות ראשון רק עם "הודעת תבנית" שאושרה מראש ע"י Meta. השם מוכנס לתבנית כפרמטר.' : null
    }).then(function () {
      return waStatusHook(wamid, 'sent');
    }).then(function () {
      waClearEmpty();
      waDay(idx === 0 ? 'היום' : 'יום ' + DAYS[idx]);
      waBizMsg(idx); badge('wa');
      S.sentIdx = idx;
      return waStatusHook(wamid, 'delivered');
    }).then(function () {
      var stage = S.seq === 'details' ? 'הודעה 1 בלבד (ללא רצף)' : idx === 3 ? 'הודעה 4 (יום 6) — סוף הרצף' : idx === 0 ? 'הודעה 1 נשלחה' : 'הודעה ' + (idx + 1) + ' (יום ' + DAYS[idx] + ')';
      return sheetUpdate({ stage: stage }, 'wa_message_sent', { template: TEMPLATES[idx], wamid: wamid });
    }).then(function () {
      if (S.seq === 'details') {
        $('#waText').disabled = false; $('#waSend').disabled = false;
      } else {
        $('#waText').disabled = false; $('#waSend').disabled = false;
      }
      if (idx === 3 && S.seq === 'active') {
        S.seq = 'done';
        logEvent({ sys: 'mc', title: 'הרצף הושלם — נשלחו כל 4 ההודעות', tag: 'סוף הרצף', short: 'הרצף הושלם' });
      }
    });
  }
  /* ManyChat reports an event to Make, Make updates the row */
  function sheetUpdate(fields, event, extra) {
    var ev = { event: event, subscriber_id: S.subscriber_id, phone: S.phone, day: S.day };
    Object.keys(fields).forEach(function (k) { ev[k === 'stage' ? 'sequence_step' : k] = fields[k]; });
    if (extra) Object.keys(extra).forEach(function (k) { ev[k] = extra[k]; });
    return api({
      from: 'mc', to: 'make', title: 'דיווח ל-Make על אירוע: ' + event, short: 'עדכון ל-Make: ' + event,
      url: MAKE_HOOK + '/events', req: ev, res: 'Accepted', delay: 450
    }).then(function () {
      if (fields.stage != null) S.stage = fields.stage;
      if (fields.status != null) S.status = fields.status;
      if (fields.note != null) S.note = fields.note;
      var cols = [], vals = [];
      if (fields.stage != null) { cols.push('G'); vals.push(S.stage); }
      if (fields.status != null) { cols.push('H'); vals.push(S.status); }
      if (fields.note != null) { cols.push('J'); vals.push(S.note); }
      var range = 'לידים!' + cols[0] + ROW + ':' + cols[cols.length - 1] + ROW;
      var fullRow = ['G', 'H', 'I', 'J'];
      var rowVals = [S.stage, S.status, 'DEMO-005', S.note];
      var useRange = cols.length > 1 ? 'לידים!G' + ROW + ':J' + ROW : range;
      return api({
        from: 'make', to: 'gs', title: 'Google Sheets — Update a Row (שורה ' + ROW + ')', short: 'הגיליון עודכן',
        method: 'PUT', url: 'https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + useRange + '?valueInputOption=USER_ENTERED',
        req: { range: useRange, values: [cols.length > 1 ? rowVals : vals] },
        res: { spreadsheetId: SHEET_ID, updatedRange: useRange, updatedRows: 1, updatedColumns: cols.length > 1 ? 4 : 1, updatedCells: cols.length > 1 ? 4 : 1 },
        delay: 550
      }).then(function () { updateSheetRow(cols); });
    });
  }

  function onWaButton(key, label) {
    var t = L();
    waOut(label);
    return api({
      from: 'wa', to: 'mc', title: 'הלקוח לחץ על כפתור: "' + label + '"', short: 'לחיצה בוואטסאפ: ' + label,
      url: 'https://manychat.com/webhook/whatsapp (demo)',
      req: { object: 'whatsapp_business_account', entry: [{ id: 'DEMO_WABA_ID', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', contacts: [{ profile: { name: S.name }, wa_id: waRecipient() }], messages: [{ from: waRecipient(), id: 'wamid.DEMO' + rid(22), timestamp: unixTs(), type: 'button', button: { payload: BTN_PAYLOAD[key], text: label } }] } }] }] },
      res: { success: true }, delay: 500
    }).then(function () {
      switch (key) {
        case 'unsub':
          return stopSeq('הוסר', 'לחץ "הסר" — לא לפנות', 'unsubscribed', 'הלקוח לחץ "הסר": הרצף נעצר מיד, והמספר מסומן "לא לפנות".').then(function () {
            return sleep(300);
          }).then(function () { waAuto(t.reply.unsub); waSys('⛔ הרצף נעצר · סטטוס בגיליון: הוסר', 'stop'); });
        case 'register':
          return stopSeq('נרשם ✅', 'לחץ "אני רוצה להירשם"', 'registered', 'הלקוח רוצה להירשם: הרצף נעצר (אין טעם להמשיך לשכנע), והצוות מקבל התראה.').then(function () {
            return teamAlert('🎉 ' + S.name + ' לחץ "אני רוצה להירשם"');
          }).then(function () { waAuto(t.reply.register); waSys('✅ הרצף נעצר · סטטוס בגיליון: נרשם', 'won'); });
        case 'call':
          return stopSeq('שיחה נקבעה', 'ביקש לקבוע שיחה עם הרב', 'call_booked', 'הלקוח ביקש שיחה: הרצף נעצר, והצוות מקבל התראה.').then(function () {
            return teamAlert('📞 ' + S.name + ' ביקש לקבוע שיחה עם הרב');
          }).then(function () { waAuto(t.reply.call); waSys('📞 הרצף נעצר · סטטוס בגיליון: שיחה נקבעה', 'won'); });
        case 'trial':
          return sheetUpdate({ status: 'ניסיון', note: 'לחץ "התחלתי את הניסיון"' }, 'trial_started').then(function () {
            waAuto(t.reply.trial);
            if (S.seq === 'active') logEvent({ sys: 'mc', title: 'הסטטוס עודכן ל"ניסיון" — הרצף ממשיך כרגיל', tag: 'ממשיך', short: 'סטטוס: ניסיון · הרצף ממשיך' });
          });
        case 'fit':
          logEvent({ sys: 'mc', title: 'נשלחה תשובה אוטומטית לשאלה "זה מתאים לי?" — הרצף ממשיך', tag: 'תשובה אוטומטית', short: 'תשובה אוטומטית נשלחה' });
          return sleep(500).then(function () { waAuto(t.reply.fit); });
        case 'notnow':
          if (S.seq === 'active' || S.seq === 'done') S.seq = 'stopped';
          return sheetUpdate({ stage: 'נעצר (יום ' + S.day + ')', note: 'השיב "לא כרגע"' }, 'not_now').then(function () {
            waAuto(t.reply.notnow);
          });
        case 'question':
          return toLiveChat(label);
      }
    });
  }
  function stopSeq(status, note, event, explain) {
    var wasSeq = S.seq;
    S.seq = 'stopped';
    disableWaButtons();
    logEvent({ sys: 'mc', title: 'עצירת הרצף: ' + event + (wasSeq === 'details' ? ' (המנוי ממילא לא היה ברצף)' : ' — הודעות עתידיות בוטלו'), tag: 'עצירה', kind: 'stop', short: 'הרצף נעצר (' + status + ')', detail: explain, data: { action: 'Unsubscribe from sequence', sequence: 'סת"ם — 4 הודעות', reason: event, cancelled_messages: TEMPLATES.slice(S.sentIdx + 1) } });
    return sheetUpdate({ stage: 'נעצר (יום ' + S.day + ')', status: status, note: note }, event);
  }
  function teamAlert(text) {
    return api({
      from: 'make', to: 'tg', title: 'התראה בטלגרם למתתיה', short: 'התראה לצוות',
      url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: text + ' · ' + S.phone },
      res: { ok: true, result: { message_id: 5000 + Math.floor(Math.random() * 999), date: +unixTs() } }, delay: 500
    });
  }
  function toLiveChat(text) {
    var wasActive = S.seq === 'active';
    if (wasActive) S.seq = 'paused';
    logEvent({ sys: 'mc', title: 'השיחה הועברה ל-Live Chat' + (wasActive ? ' — הרצף האוטומטי מושהה' : ''), tag: 'Live Chat', short: 'הועבר ל-Live Chat', detail: 'במקום שהבוט "ינחש" תשובה, אדם אמיתי עונה. כל עוד השיחה פתוחה — לא יוצאות הודעות אוטומטיות.', data: { action: 'Open Live Chat conversation', assign_to: 'מתתיה', pause_automation: wasActive, message: text } });
    return api({
      from: 'mc', to: 'tg', title: 'התראה למתתיה: שאלה חדשה ב-Live Chat', short: 'מתתיה קיבל התראה',
      url: 'https://api.telegram.org/bot<DEMO_TOKEN>/sendMessage', req: { chat_id: 'DEMO_CHAT_ID', text: '💬 ' + S.name + ' (' + S.phone + ') שאל/ה שאלה בוואטסאפ: "' + text + '" — ממתין לתשובה ב-Live Chat' },
      res: { ok: true, result: { message_id: 6000 + Math.floor(Math.random() * 999), date: +unixTs() } }, delay: 550
    }).then(function () {
      return sheetUpdate({ stage: wasActive ? 'מושהה — Live Chat (יום ' + S.day + ')' : S.stage, note: 'שאלה פתוחה — ממתין למענה של מתתיה' }, 'live_chat_opened');
    }).then(function () {
      waAuto(L().reply.question);
      var n = waSys('🔔 הועבר ל-Live Chat — מתתיה יקבל התראה' + (wasActive ? '<br><small>הרצף האוטומטי מושהה עד שהשיחה תיסגר</small>' : ''));
      if (wasActive) {
        var b = el('button', '', '▶ (דמו) מתתיה ענה וסגר את השיחה — המשך רצף'); b.type = 'button';
        b.addEventListener('click', function () { b.disabled = true; enqueue(resumeSeq); });
        n.appendChild(b);
      }
    });
  }
  function resumeSeq() {
    if (S.seq !== 'paused') return Promise.resolve();
    S.seq = 'active';
    logEvent({ sys: 'mc', title: 'שיחת ה-Live Chat נסגרה — הרצף האוטומטי ממשיך', tag: 'חידוש רצף', short: 'הרצף חודש' });
    return sheetUpdate({ stage: 'הודעה ' + (S.sentIdx + 1) + ' (יום ' + DAYS[S.sentIdx] + ')', note: 'שאלה נענתה ע"י מתתיה' }, 'live_chat_closed').then(function () {
      waSys('▶ השיחה נסגרה — הרצף ממשיך');
    });
  }
  $('#waForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#waText').value.trim(); if (!v || S.sentIdx < 0) return;
    $('#waText').value = '';
    enqueue(function () {
      waOut(v);
      return api({
        from: 'wa', to: 'mc', title: 'הלקוח כתב הודעה חופשית בוואטסאפ', short: 'הודעה חופשית מהלקוח',
        url: 'https://manychat.com/webhook/whatsapp (demo)',
        req: { object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { messages: [{ from: waRecipient(), timestamp: unixTs(), type: 'text', text: { body: v } }] } }] }] },
        res: { success: true }, delay: 450
      }).then(function () {
        if (S.seq === 'stopped' && S.status === 'הוסר') {
          logEvent({ sys: 'mc', title: 'המנוי הוסר — ההודעה נשמרת לצוות, אין מענה אוטומטי', tag: 'הוסר', short: 'המנוי הוסר — אין מענה אוטומטי' });
          return;
        }
        return toLiveChat(v);
      });
    });
  });

  /* ------------------------------------------------------------ day skip */
  function updateSkip() {
    var b = $('#btnSkip'); if (!b) return;
    var ready = S.sentIdx >= 0;
    if (S.day >= 6) { b.disabled = true; b.textContent = '✓ סוף הרצף (יום 6)'; b.classList.remove('nudge'); return; }
    b.disabled = !ready || S.pending > 0;
    b.textContent = '⏩ דלג ליום הבא' + (ready ? ' (יום ' + (S.day + 2) + ')' : '');
    b.classList.toggle('nudge', ready && !S.skipNudged && S.pending === 0);
  }
  $('#btnSkip').addEventListener('click', function () {
    if (S.pending > 0 || S.sentIdx < 0 || S.day >= 6) return;
    S.skipNudged = true;
    enqueue(skipDay);
  });
  function skipNote(html, info) {
    var n = $('#skipNote'); n.hidden = false; n.className = 'skipnote' + (info ? ' info' : ''); n.innerHTML = html;
  }
  function skipDay() {
    S.day += 2;
    var d = new Date(simNow.getTime()); d.setDate(d.getDate() + 2); d.setHours(10, 0, 0, 0);
    simNow = d; renderClock();
    var idx = DAYS.indexOf(S.day);
    logEvent({ sys: 'mc', title: '⏩ השעון המדומה קפץ ליום ' + S.day + ' (10:00) — בודקים אם יש הודעה מתוזמנת', tag: 'שעון דמו', short: 'יום ' + S.day, ticker: false });
    if (S.seq === 'active') {
      $('#skipNote').hidden = true;
      return sendWa(idx);
    }
    var why, info = false;
    if (S.seq === 'details') why = 'המנוי בחר "רק את הפרטים" ולכן אינו ברצף. לא נשלחה הודעה ביום ' + S.day + '.';
    else if (S.seq === 'paused') why = 'הרצף מושהה כי יש שאלה פתוחה ב-Live Chat. לא נשלחה הודעה ביום ' + S.day + '.';
    else if (S.seq === 'stopped') why = 'הרצף נעצר (סטטוס: ' + S.status + (S.status === 'חדש' || S.status === 'ניסיון' ? ', "לא כרגע"' : '') + '). לא נשלחה הודעה ביום ' + S.day + '.';
    else if (S.seq === 'done') { why = 'הרצף כבר הושלם.'; info = true; }
    logEvent({ sys: 'mc', title: 'יום ' + S.day + ': לא נשלחה הודעה — ' + why, tag: 'דילוג', kind: info ? null : 'warn', short: 'יום ' + S.day + ': אין הודעה (ראו לוג)' });
    skipNote('🕒 יום ' + S.day + ': ' + esc(why) + ' <b>ההסבר בלוג API.</b>', info);
    return sleep(200);
  }

  /* ------------------------------------------------------------ sheet */
  function stPill(s) { return '<span class="st ' + (STATUS_CLS[s] || 'new') + '">' + esc(s) + '</span>'; }
  function addSheetRow(date) {
    var tr = $('#newRowSlot');
    tr.className = 'newrow rowin';
    tr.innerHTML = '<td class="rn">' + ROW + '</td><td><span class="mono">' + date + '</span></td><td>' + esc(S.name) + '</td><td><span class="mono">' + esc(S.phone) + '</span></td><td>' + L().langLabel + '</td><td>' + MOTS_HE[S.motIdx] + '</td><td><span class="mono">#' + POST_ID + '</span></td>' +
      '<td data-col="G">' + esc(S.stage) + '</td><td data-col="H">' + stPill(S.status) + '</td><td><span class="mono">DEMO-005</span></td><td data-col="J">' + esc(S.note) + '</td>';
    $$('td', tr).forEach(function (td) { if (!td.classList.contains('rn')) flashTd(td); });
    setFx('A' + ROW + ':J' + ROW, 'שורה חדשה נוספה אוטומטית ע"י Make');
    renderStrip();
    badge('sheet');
  }
  function updateSheetRow(cols) {
    var tr = $('#newRowSlot');
    var map = { G: function () { return esc(S.stage); }, H: function () { return stPill(S.status); }, J: function () { return esc(S.note); } };
    cols.forEach(function (c) {
      var td = $('td[data-col="' + c + '"]', tr); if (!td) return;
      td.innerHTML = map[c](); flashTd(td);
    });
    var last = cols[cols.length - 1];
    setFx(last + ROW, last === 'H' ? S.status : last === 'G' ? S.stage : S.note);
    if (cols.indexOf('H') >= 0) setFx('H' + ROW, S.status);
    renderStrip();
    badge('sheet');
  }
  function flashTd(td) {
    $$('#sheet td.sel').forEach(function (x) { x.classList.remove('sel'); });
    td.classList.add('flash', 'sel');
    setTimeout(function () { td.classList.remove('flash'); }, 1300);
  }
  function setFx(ref, val) { $('#fxRef').textContent = ref; $('#fxVal').textContent = val; }
  function renderStrip() {
    var s = $('#leadStrip'); s.className = 'lead-strip live';
    s.innerHTML = '📍 השורה של <b>' + esc(S.name) + '</b> (שורה ' + ROW + '): סטטוס ' + stPill(S.status) + ' · שלב ברצף: <b>' + esc(S.stage) + '</b>';
  }

  /* ------------------------------------------------------------ wiring */
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
  $$('.goto').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.goto); }); });
  $('#resetBtn').addEventListener('click', function () {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    location.replace(location.pathname + (FAST ? '?fast' : ''));
  });
  mobileMQ.addEventListener ? mobileMQ.addEventListener('change', function () { if (!isMobile()) $$('.panel').forEach(function (p) { p.classList.add('on'); }); else showTab(currentTab(), { noScroll: true }); }) : null;
  if (!isMobile()) $$('.panel').forEach(function (p) { p.classList.add('on'); });
  /* one-shot entrance animations should not replay when a hidden tab becomes visible again */
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'pop' || e.animationName === 'rowin') { e.target.style.animation = 'none'; e.target.classList.remove('rowin'); }
  });
  syncName(); renderClock(); updateSkip();

  /* expose read-only state for automated tests */
  window.__demoState = function () { return JSON.parse(JSON.stringify(S)); };
})();
