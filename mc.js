/* ========== Minecraft Profile Page ========== */
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initTiltCard();
});

function initParticles() {
  if (typeof particlesJS !== 'function') return;
  var colors = ['#a855f7', '#c084fc', '#e879f9'];
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

function initTiltCard() {
  var card = document.getElementById('mc-card');
  if (!card) return;
  var tiltAmount = 12;
  card.addEventListener('mousemove', function(e) {
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;
    var rotateX = (y - 0.5) * -2 * tiltAmount;
    var rotateY = (x - 0.5) * 2 * tiltAmount;
    card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}
