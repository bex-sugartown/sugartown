// Light/dark toggle for local review documents (vspec and content working drafts).
// Needs <button class="docThemeToggle" id="themeToggle"> and <html data-theme="light-pink-moon">.
(function(){
  var root=document.documentElement, toggle=document.getElementById('themeToggle');
  if(!toggle) return;
  toggle.onclick=function(){
    var dark=root.getAttribute('data-theme')!=='dark-pink-moon';
    root.setAttribute('data-theme',dark?'dark-pink-moon':'light-pink-moon');
    toggle.textContent=dark?'Switch to light view':'Switch to dark view';
    toggle.setAttribute('aria-pressed',dark);
  };
})();
