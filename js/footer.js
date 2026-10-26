'use strict';
/* The small footer on every page: who made it, how to reach us, and that it is not WhatsApp's.
   It goes into [data-footer] when the page has one, and follows the page language. */
(function () {
  const T = {
    he: { by: 'נבנה על ידי Yonatan Guy', contact: 'באג, רעיון או יצירת קשר', guide: 'איך זה עובד', meta: 'לא קשור לוואטסאפ או ל־Meta.',
      priv: 'הצ׳אטים נשארים בדפדפן שלכם. התוכן במשחקים באחריות מי שיצר אותם.' },
    en: { by: 'Made by Yonatan Guy', contact: 'Bug, idea or contact', guide: 'How it works', meta: 'Not affiliated with WhatsApp or Meta.',
      priv: 'Chats stay in your browser. Game content is the responsibility of whoever made it.' }
  };
  function render() {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'he', s = T[lang];
    let f = document.getElementById('siteFoot');
    if (!f) {
      f = document.createElement('footer'); f.id = 'siteFoot'; f.className = 'siteFoot';
      (document.querySelector('[data-footer]') || document.body).appendChild(f);
    }
    f.dir = lang === 'he' ? 'rtl' : 'ltr';
    f.innerHTML = `<span>© ${new Date().getFullYear()} ${s.by}</span>
      <a href="feedback.html">🐞 ${s.contact}</a><a href="guide.html">${s.guide}</a>
      <span class="sfNote">${s.priv} ${s.meta}</span>`;
  }
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
