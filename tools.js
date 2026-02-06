/* ========== Tools Page ========== */
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initTiltCard();
  initDiscordTimestamp();
});

function initParticles() {
  if (typeof particlesJS !== 'function') return;
  var colors = ['#5865f2', '#7983f5', '#99a1f8'];
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
  var card = document.getElementById('discord-timestamp-card');
  if (!card) return;
  var tiltAmount = 10;
  card.addEventListener('mousemove', function(e) {
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;
    var rotateX = (y - 0.5) * -2 * tiltAmount;
    var rotateY = (x - 0.5) * 2 * tiltAmount;
    card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.01, 1.01, 1.01)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ========== Discord Timestamp Generator ========== */
var typeFormats = {
  't': { timeStyle: 'short' },
  'T': { timeStyle: 'medium' },
  'd': { dateStyle: 'short' },
  'D': { dateStyle: 'long' },
  'f': { dateStyle: 'long', timeStyle: 'short' },
  'F': { dateStyle: 'full', timeStyle: 'short' },
  'R': { style: 'long', numeric: 'auto' }
};

function automaticRelativeDifference(d) {
  var diff = -((new Date().getTime() - d.getTime()) / 1000) | 0;
  var absDiff = Math.abs(diff);
  if (absDiff > 86400 * 30 * 10) {
    return { duration: Math.round(diff / (86400 * 365)), unit: 'years' };
  }
  if (absDiff > 86400 * 25) {
    return { duration: Math.round(diff / (86400 * 30)), unit: 'months' };
  }
  if (absDiff > 3600 * 21) {
    return { duration: Math.round(diff / 86400), unit: 'days' };
  }
  if (absDiff > 60 * 44) {
    return { duration: Math.round(diff / 3600), unit: 'hours' };
  }
  if (absDiff > 30) {
    return { duration: Math.round(diff / 60), unit: 'minutes' };
  }
  return { duration: diff, unit: 'seconds' };
}

function updateTimestampOutput() {
  var dateInput = document.getElementById('ts-date');
  var timeInput = document.getElementById('ts-time');
  var typeInput = document.getElementById('ts-type');
  var output = document.getElementById('ts-code');
  var preview = document.getElementById('ts-preview');

  var selectedDate = new Date(dateInput.value + 'T' + timeInput.value);
  if (isNaN(selectedDate.getTime())) {
    output.value = '';
    preview.textContent = '—';
    return;
  }

  var ts = Math.floor(selectedDate.getTime() / 1000);
  output.value = '<t:' + ts + ':' + typeInput.value + '>';

  if (typeInput.value === 'R') {
    var formatter = new Intl.RelativeTimeFormat(navigator.language || 'en', typeFormats[typeInput.value] || {});
    var format = automaticRelativeDifference(selectedDate);
    preview.textContent = formatter.format(format.duration, format.unit);
  } else {
    var formatter = new Intl.DateTimeFormat(navigator.language || 'en', typeFormats[typeInput.value] || {});
    preview.textContent = formatter.format(selectedDate);
  }
}

function resetToCurrentTime() {
  var now = new Date();
  document.getElementById('ts-date').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  document.getElementById('ts-time').value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  updateTimestampOutput();
}

function initDiscordTimestamp() {
  var dateInput = document.getElementById('ts-date');
  var timeInput = document.getElementById('ts-time');
  var typeInput = document.getElementById('ts-type');
  var output = document.getElementById('ts-code');
  var copyBtn = document.getElementById('ts-copy');
  var currentBtn = document.getElementById('ts-current');

  if (!dateInput || !timeInput) return;

  dateInput.addEventListener('change', updateTimestampOutput);
  timeInput.addEventListener('change', updateTimestampOutput);
  typeInput.addEventListener('change', updateTimestampOutput);

  output.addEventListener('mouseover', function() { this.select(); });

  copyBtn.addEventListener('click', function() {
    updateTimestampOutput();
    var txt = output.value;
    if (txt && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function() {
        var orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function() {
          copyBtn.innerHTML = orig;
          copyBtn.classList.remove('copied');
        }, 1500);
      });
    }
  });

  currentBtn.addEventListener('click', resetToCurrentTime);

  resetToCurrentTime();
}
