/* All customer-facing copy for the demo (Hebrew + English).
 * Single source of truth: the app renders from here, and messenger-sequence.md is generated from here. */
window.STAM_TEXTS = {
  /* the very first DM is bilingual, before the lead picks a language */
  welcome: n => `שלום ${n} 🙏\nתודה על ההתעניינות בקורס סופר סת"ם של הרב אליעזר אדם.\nHello! Which language do you prefer?`,
  waNumber: '972500000000', /* DEMO number, not real */

  he: {
    langLabel: 'עברית',
    publicReply: n => `תודה ${n}! שלחתי לך הודעה פרטית עם כל הפרטים 🙏`,
    motQ: n => `נעים מאוד ${n}. כדי שאשלח לך את המידע הכי רלוונטי, מה הכי מושך אותך בכתיבת סת"ם?`,
    mots: ['פרנסה יציבה', 'גמישות בזמנים', 'חיבור רוחני', 'הכל ביחד'],
    phoneQ: 'מצוין, זה בדיוק מה שהקורס בנוי לתת.\nאם תרצה שהרב או מישהו מהצוות יחזרו אליך, מה מספר הטלפון שלך?\n👇 לחיצה על הכפתור ממלאת את המספר אוטומטית',
    phoneHint: 'אפשר גם להקליד מספר בשורה למטה ⌨️',
    phonePh: 'הקלידו מספר, למשל 050-1234567',
    phoneBad: 'נראה שהמספר לא תקין 🤔\nאפשר לכתוב אותו שוב? למשל 050-1234567, או מספר בינלאומי עם קידומת מדינה, כמו +1 555 010 0001',
    consentQ: 'אפשר לשלוח לך כאן במסנג\'ר עוד כמה הודעות קצרות על הקורס? אפשר להפסיק בכל רגע.',
    yes: 'כן, בשמחה ✅',
    details: 'רק את הפרטים',
    confirmYes: 'מעולה 🙏 הנה הפרטים:',
    confirmDetails: 'בשמחה 🙏 הנה הפרטים, ולא נשלח מעבר לזה:',
    btn: {
      trial: '🎁 להתחלת הניסיון',
      trial2: '🎁 להמשך הניסיון',
      register: '✍️ אני רוצה להירשם',
      wa: '💬 לדבר עם הרב בוואטסאפ',
      stop: 'הפסק',
      optinYes: 'כן, עדכנו אותי',
      optinNo: 'לא תודה'
    },
    seq: [
      { /* M1 — immediately */
        bubbles: [
          n => 'הקורס של הרב אליעזר אדם, ראש מכון "מלאכת שמים", מלמד אותך לכתוב סת"ם מהבית, בקצב שלך 📜\n\n✍️ שיעורי וידאו מוקלטים\n📸 משוב אישי מהרב על כל כתיבה שתצלם ותשלח\n🎥 מפגשי זום פרטיים ללא הגבלה, ושיעור הלכה שבועי\n📖 מעיפרון, דרך קולמוס וקלף, ועד מגילת אסתר כשרה\n🎓 מבחן הסמכה, תעודת סופר סת"ם, וליווי לכל החיים',
          n => '🎁 אפשר להתחיל כבר עכשיו: 7 ימי ניסיון חינם, בלי כרטיס אשראי.'
        ],
        buttons: ['trial', 'wa', 'stop']
      },
      { /* M2 — +3 hours */
        bubbles: [
          n => `${n}, הספקת להציץ בשיעורי הניסיון? 🙂\nשאלה שהרב שומע הרבה: "יש לי בכלל זמן לזה?"`,
          n => 'הקורס בנוי בדיוק בשביל אנשים עסוקים:\n⏱️ אין מועדים קבועים. לומדים מתי שנוח, גם בלילה או בין הסדרים\n⏸️ צריך הפסקה? עוצרים וחוזרים בלי תשלום נוסף\n🖋️ הציוד לתחילת הדרך עולה פחות מ-200 ₪'
        ],
        buttons: ['trial2', 'wa', 'stop']
      },
      { /* M3 — +22 hours, before the 24h window closes */
        bubbles: [
          n => `${n}, כמה מילים על הדרך שלפניך:\nהרב אדם הכשיר עד היום למעלה מ-2,500 סופרי סת"ם, ולקורס הסכמות של רבנים, ובהם הרב יעקב מאיר שטרן, מחבר "משנת הסופר".\n\n"התוכנית הזאת היא כמו לקבל רב פרטי כל יום – גם בהלכה וגם בכתיבה."\n— שלמה ר', ירושלים`,
          n => '20 המזוזות הראשונות שלך נכתבות בליווי צמוד של הרב, עד שהן נבדקות ונמכרות. בנוסף מקבלים הדרכה בבניית קהל לקוחות ובהקמת עסק עצמאי.\nהקורס המלא: 3,800 ₪, עם אפשרות לתשלומים.'
        ],
        buttons: ['register', 'wa', 'stop'],
        optin: 'רוצה שנעדכן אותך כאן בעדכונים והטבות על הקורס?'
      },
      { /* M4 — day 4, Marketing Message (opt-in only) */
        bubbles: [
          n => `${n}, רק תזכורת קטנה: ימי הניסיון החינמיים עוברים מהר ⏳\nכדאי לנצל את הימים שנשארו כדי להתרשם מהשיעורים עד הסוף.`,
          n => 'ואם אתה מרגיש שזה בשבילך, אפשר להמשיך ישר לקורס המלא, בליווי אישי של הרב עד תעודת סופר סת"ם. אפשר לשלם בתשלומים.'
        ],
        buttons: ['register', 'wa', 'stop']
      },
      { /* M5 — day 6, Marketing Message (opt-in only), final */
        bubbles: [
          n => `${n}, זו ההודעה האחרונה שלי בנושא, ולא אטריד מעבר לזה 🙏\nאם נשארה שאלה פתוחה, על הזמן, על העלות, או אם זה בכלל בשבילך, הכי פשוט לשאול את הרב ישירות.`,
          n => 'אפשר לכתוב לרב אליעזר אדם בוואטסאפ, בלי שום התחייבות, ולקבל תשובה ממי שילמד אותך.\nבהצלחה, ושתזכה לכתוב בקדושה ובטהרה.'
        ],
        buttons: ['wa', 'register', 'stop']
      }
    ],
    reply: {
      register: n => `איזה יופי, ${n}! 🙏\nלהשלמת ההרשמה: soferstam.org/register\nמכאן נמשיך איתך באופן אישי, בלי הודעות אוטומטיות.`,
      stop: n => 'בסדר גמור, הפסקתי את ההודעות ✅\nאם תרצה לחזור, פשוט לכתוב לנו כאן. בהצלחה!',
      wa: n => 'מצוין 🙏 הרב אליעזר אדם ישמח לדבר איתך.\nנפתחת עכשיו שיחת וואטסאפ עם הודעה מוכנה, רק ללחוץ "שליחה".',
      optinYes: n => 'תודה! נעדכן אותך מדי פעם בעדכונים והטבות. אפשר להפסיק בכל רגע 🙏',
      optinNo: n => 'בסדר גמור, תודה 🙏 אם תרצה לשאול משהו, אפשר תמיד לכתוב לנו כאן.',
      liveChat: n => 'תודה על השאלה! 🙏 העברתי אותה לצוות, ומתתיה יחזור אליך כאן בהקדם.'
    },
    waPrefill: 'שלום הרב, הגעתי מהפייסבוק (מתתיה) ואשמח לשמוע על קורס הסת"ם'
  },

  en: {
    langLabel: 'English',
    publicReply: n => `Thanks, ${n}! I've sent you a private message with all the details 🙏`,
    motQ: n => `Great to meet you, ${n}! So I can send you what's most relevant — what draws you most to writing STaM?`,
    mots: ['A steady parnassah', 'Flexible hours', 'A spiritual connection', 'All of the above'],
    phoneQ: 'Wonderful — that\'s exactly what the course is built for.\nWhat\'s the best number to reach you, in case you\'d like the Rabbi or our team to get back to you?\n👇 Tap the button to fill it in automatically',
    phoneHint: 'You can also type a number below ⌨️',
    phonePh: 'Type a number, e.g. +1 555 010 0001',
    phoneBad: 'That number doesn\'t look quite right 🤔\nCould you type it again? e.g. 050-1234567, or an international number with the country code, like +1 555 010 0001',
    consentQ: 'May I send you a few more short messages about the course here on Messenger? You can stop at any time.',
    yes: 'Yes, please ✅',
    details: 'Just the details',
    confirmYes: 'Great 🙏 Here are the details:',
    confirmDetails: 'Sure thing 🙏 Here are the details — nothing more after this:',
    btn: {
      trial: '🎁 Start the free trial',
      trial2: '🎁 Continue the trial',
      register: '✍️ I want to register',
      wa: '💬 Talk to the Rabbi on WhatsApp',
      stop: 'Stop',
      optinYes: 'Yes, keep me posted',
      optinNo: 'No, thanks'
    },
    seq: [
      {
        bubbles: [
          n => 'Rabbi Eliezer Adam, head of the Meleches Shamayim Institute, will teach you to write STaM from home, at your own pace 📜\n\n✍️ Recorded video lessons\n📸 Personal feedback from the Rabbi on every piece you photograph and send\n🎥 Unlimited private Zoom sessions, plus a weekly Halacha shiur\n📖 From pencil to quill and parchment, all the way to a kosher Megillas Esther\n🎓 Certification exam, Sofer STaM certificate, and lifetime support',
          n => '🎁 You can start right now: a free 7-day trial, no credit card needed.'
        ],
        buttons: ['trial', 'wa', 'stop']
      },
      {
        bubbles: [
          n => `${n}, have you had a chance to look at the trial lessons? 🙂\nOne question the Rabbi hears a lot: "Do I really have time for this?"`,
          n => 'The course is built for busy people:\n⏱️ No fixed schedule — learn whenever it suits you, even late at night or between sedarim\n⏸️ Need a break? Pause and pick up again at no extra cost\n🖋️ Starter equipment costs under ₪200'
        ],
        buttons: ['trial2', 'wa', 'stop']
      },
      {
        bubbles: [
          n => `${n}, a few words about the path ahead:\nRabbi Adam has trained over 2,500 sofrim, and the course carries haskamos from rabbanim, including Rabbi Yaakov Meir Stern, author of Mishnas HaSofer.\n\n"This program is like having a private rebbi every day — both in Halacha and K'siva."\n— Shlomo R., Yerushalayim`,
          n => 'Your first 20 mezuzos are written under the Rabbi\'s close guidance until they\'re checked and sold — plus guidance on building a client base and your own business.\nThe full course: ₪3,800, with installments available.'
        ],
        buttons: ['register', 'wa', 'stop'],
        optin: 'Would you like us to keep you posted here with course updates and special offers?'
      },
      {
        bubbles: [
          n => `${n}, just a quick reminder: the free trial days go by fast ⏳\nIt's worth using the days you have left to get a real feel for the lessons.`,
          n => 'And if you feel this is for you, you can move straight on to the full course — with the Rabbi\'s personal guidance all the way to your Sofer STaM certificate. Installments available.'
        ],
        buttons: ['register', 'wa', 'stop']
      },
      {
        bubbles: [
          n => `${n}, this is my last message on the subject — I won't bother you beyond this 🙏\nIf you still have a question — about the time, the cost, or whether it's right for you — the simplest thing is to ask the Rabbi directly.`,
          n => 'You\'re welcome to message Rabbi Eliezer Adam on WhatsApp, with no obligation, and hear it straight from the person who\'ll teach you.\nWishing you much hatzlacha — may you merit to write with kedusha and tahara.'
        ],
        buttons: ['wa', 'register', 'stop']
      }
    ],
    reply: {
      register: n => `Wonderful, ${n}! 🙏\nTo complete your registration: soferstam.org/register\nFrom here we'll continue with you personally — no more automated messages.`,
      stop: n => 'No problem — I\'ve stopped the messages ✅\nIf you\'d like to come back, just write to us here. Hatzlacha!',
      wa: n => 'Excellent 🙏 Rabbi Eliezer Adam will be happy to speak with you.\nA WhatsApp chat is opening now with a ready-made message — just tap "Send".',
      optinYes: n => 'Thank you! We\'ll keep you posted from time to time. You can stop at any time 🙏',
      optinNo: n => 'No problem, thank you 🙏 If you have any question, you can always write to us here.',
      liveChat: n => 'Thanks for your question! 🙏 I\'ve passed it on to the team — Matityahu will get back to you here shortly.'
    },
    waPrefill: 'Hi Rabbi, I came from Facebook (Matityahu) and would love to hear about the STaM course'
  }
};
