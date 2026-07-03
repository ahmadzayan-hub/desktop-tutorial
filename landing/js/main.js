/* Beyond Style UAE — landing page behavior
   1. Arabic/English toggle (persisted, updates dir + lang + WhatsApp text)
   2. Prefilled WhatsApp message on every .js-wa link
   3. Soft scroll-reveal animation (skipped when reduced motion is set)   */

(function () {
  "use strict";

  var WA_NUMBER = "971551556991";
  var WA_MSG = {
    en: "Hello Beyond Style UAE, I would like to order a customized jewelry item. Please share the available designs and prices.",
    ar: "مرحباً بيوند ستايل، أرغب بطلب قطعة مجوهرات مخصصة. أرجو مشاركة التصاميم المتوفرة والأسعار.",
  };

  var html = document.documentElement;

  function currentLang() {
    return html.getAttribute("lang") === "en" ? "en" : "ar";
  }

  function applyWhatsAppLinks(lang) {
    var href =
      "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_MSG[lang]);
    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.setAttribute("href", href);
    });
  }

  function setLang(lang) {
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.title =
      lang === "ar"
        ? "Beyond Style UAE — مجوهرات مخصصة وخط عربي | Personalized Jewelry UAE"
        : "Beyond Style UAE — Personalized Jewelry & Arabic Calligraphy Accessories";
    applyWhatsAppLinks(lang);
    try {
      localStorage.setItem("bsu-lang", lang);
    } catch (e) {
      /* private mode — ignore */
    }
  }

  // Restore saved language (Arabic is the default in the markup).
  var saved = null;
  try {
    saved = localStorage.getItem("bsu-lang");
  } catch (e) {
    /* ignore */
  }
  if (saved === "en" || saved === "ar") {
    setLang(saved);
  } else {
    applyWhatsAppLinks(currentLang());
  }

  var toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setLang(currentLang() === "ar" ? "en" : "ar");
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Scroll reveal
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach(function (el) {
    io.observe(el);
  });
})();
