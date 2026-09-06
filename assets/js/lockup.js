/* Keeps every DF360 / Apex MD lockup legible against whatever it sits on.
   dynamic.js clones parts of the page (the sticky bar, the reordered plan
   section), so a lockup can end up on a ground the markup never anticipated --
   white artwork on the light #F5F2ED panel, i.e. invisible. Rather than hard-
   code each one, this picks the variant from the ground actually rendered. */
(function () {
  'use strict';
  function lum(c) {
    var m = (c || '').match(/\d+/g);
    if (!m) return 255;
    return 0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2];
  }
  function groundOf(el) {
    var n = el;
    while (n && n !== document.documentElement) {
      var c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      n = n.parentElement;
    }
    return '#ffffff';
  }
  function fix() {
    /* Any DF360 mark, wherever it sits -- inline in a heading, in a lockup, or
       in a node dynamic.js cloned. The wordmark has no contrast of its own, so
       the wrong variant simply vanishes into the page. */
    Array.prototype.forEach.call(document.querySelectorAll('img[src*="logo-df360-"]'), function (img) {
      var d = lum(groundOf(img)) < 128;
      var want = d ? 'logo-df360-white.webp' : 'logo-df360-grey.webp';
      if (img.getAttribute('src').indexOf(want) === -1)
        img.setAttribute('src', 'img/df360/' + want);
    });
    Array.prototype.forEach.call(document.querySelectorAll('img[src*="logo-apex-"]'), function (img) {
      var d = lum(groundOf(img)) < 128;
      var want = d ? 'logo-apex-white.webp' : 'logo-apex-dark.webp';
      if (img.getAttribute('src').indexOf(want) === -1)
        img.setAttribute('src', 'img/df360/' + want);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.hp-lockup'), function (l) {
      var dark = lum(groundOf(l)) < 128;
      var imgs = l.querySelectorAll('img');
      if (imgs.length < 2) return;
      imgs[0].setAttribute('src', dark ? 'img/df360/logo-df360-white.webp' : 'img/df360/logo-df360-grey.webp');
      imgs[1].setAttribute('src', dark ? 'img/df360/logo-apex-white.webp' : 'img/df360/logo-apex-dark.webp');
      var by = l.querySelector('span');
      if (by) by.style.color = dark ? 'rgba(255,255,255,.62)' : '#8d959c';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
  // dynamic.js runs deferred and clones nodes; re-check once it has settled.
  window.addEventListener('load', function () { setTimeout(fix, 60); });
})();
