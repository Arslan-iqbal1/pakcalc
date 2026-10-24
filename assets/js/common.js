/* Theme + language toggles shared by every page. */
(function(){
  var theme = localStorage.getItem("pakcalc-theme");
  if(theme) document.documentElement.setAttribute("data-theme", theme);
  window.toggleTheme = function(){
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("pakcalc-theme", cur);
  };
  var dict = {
    "nav-home": {"en":"Home","ur":"ہوم"},
    "nav-calculators": {"en":"Calculators","ur":"کیلکولیٹرز"},
    "nav-guides": {"en":"Guides","ur":"رہنما"},
    "nav-about": {"en":"About","ur":"ہمارے بارے میں"},
    "nav-contact": {"en":"Contact","ur":"رابطہ"},
    "btn-calc": {"en":"Calculate","ur":"حساب کریں"},
    "lbl-result": {"en":"Result","ur":"نتیجہ"},
    "btn-print": {"en":"Print / Save as PDF","ur":"پرنٹ / PDF محفوظ کریں"},
    "related": {"en":"Related calculators","ur":"متعلقہ کیلکولیٹرز"},
    "guide-link": {"en":"Read the full guide","ur":"مکمل رہنما پڑھیں"}
  };
  window.toggleLang = function(){
    var lang = localStorage.getItem("pakcalc-lang") === "ur" ? "en" : "ur";
    localStorage.setItem("pakcalc-lang", lang);
    applyLang(lang);
  };
  function applyLang(lang){
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var k = el.getAttribute("data-i18n");
      if(dict[k] && dict[k][lang]) el.textContent = dict[k][lang];
    });
    var b = document.getElementById("langBtn");
    if(b) b.textContent = lang === "ur" ? "English" : "اردو";
    document.documentElement.setAttribute("lang", lang === "ur" ? "ur" : "en");
  }
  document.addEventListener("DOMContentLoaded", function(){
    applyLang(localStorage.getItem("pakcalc-lang") || "en");
  });
})();
