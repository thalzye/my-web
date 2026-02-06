/* Shared init for 403 / 404 error pages */
document.addEventListener('DOMContentLoaded', function() {
  initParticles(document.body.getAttribute('data-status') || 'offline');
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initRipples();
});

function initParticles(status) {
  if (typeof particlesJS !== 'function') return;
  const colors = {
    online: ['#22c55e', '#4ade80', '#86efac'],
    idle: ['#eab308', '#facc15', '#fde047'],
    dnd: ['#ef4444', '#f87171', '#fca5a5'],
    offline: ['#64748b', '#94a3b8', '#cbd5e1']
  };
  const c = colors[status] || colors.offline;
  particlesJS('particles-js', {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: c },
      shape: { type: 'circle' },
      opacity: { value: 0.4, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.2, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'push' } },
      modes: { bubble: { distance: 120, size: 4, opacity: 0.4, color: c[0] }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}

function initRipples() {
  document.querySelectorAll('.btn-ripple, .social-btn, .error-btn').forEach(function(el) {
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
