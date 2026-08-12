// وصال — تفاعلات الصفحة (بدون مكتبات، CSP-safe: ملف منفصل script-src 'self')
// 1) ظهور العناصر عند التمرير  2) إمالة ثلاثية الأبعاد لموك-أب الهاتف
'use strict';

(function () {
  // فعّل وضع الـ JS: الإخفاء المبدئي لعناصر .reveal مربوط بالكلاس ده (progressive enhancement)
  document.documentElement.classList.add('js');

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- ظهور عند التمرير (IntersectionObserver) ----
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ---- إمالة ثلاثية الأبعاد للهاتف ----
  var phone = document.getElementById('phone');
  if (!phone || reduced) return;

  var maxTilt = 14; // درجات
  var raf = null;

  function applyTilt(nx, ny) { // nx,ny في [-1,1]
    if (raf) return;
    raf = requestAnimationFrame(function () {
      phone.style.transform =
        'rotateX(' + (8 - ny * maxTilt) + 'deg) rotateY(' + (-6 + nx * maxTilt) + 'deg)';
      raf = null;
    });
  }

  // ماوس (ديسكتوب): الإمالة تتبع مكان المؤشر حول منتصف الشاشة
  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType && ev.pointerType !== 'mouse') return;
    var nx = (ev.clientX / window.innerWidth) * 2 - 1;
    var ny = (ev.clientY / window.innerHeight) * 2 - 1;
    applyTilt(nx * 0.7, ny * 0.7);
  }, { passive: true });

  // جيروسكوب (موبايل): الإمالة تتبع ميل الجهاز نفسه — بدون طلب إذن iOS (يشتغل حيث متاح)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', function (ev) {
      if (ev.beta == null || ev.gamma == null) return;
      var nx = Math.max(-1, Math.min(1, ev.gamma / 30));
      var ny = Math.max(-1, Math.min(1, (ev.beta - 45) / 30));
      applyTilt(nx, ny);
    }, { passive: true });
  }
})();
