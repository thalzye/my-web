/* ========== Viewer Page ========== */
document.addEventListener('DOMContentLoaded', function() {
  initParticles('online');
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initRipples();
});

function initParticles(status) {
  if (typeof particlesJS !== 'function') return;
  var colors = ['#22c55e', '#4ade80', '#86efac'];
  particlesJS('particles-js', {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: colors },
      shape: { type: 'circle' },
      opacity: { value: 0.4, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.2, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'push' } },
      modes: { bubble: { distance: 120, size: 4, opacity: 0.4, color: colors[0] }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}

function initRipples() {
  document.querySelectorAll('.btn-ripple').forEach(function(el) {
    el.addEventListener('click', function(e) {
      if (!el || !e) return;
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - rect.left - size / 2) + 'px;top:' + (e.clientY - rect.top - size / 2) + 'px;position:absolute;pointer-events:none;';
      el.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    });
  });
}
