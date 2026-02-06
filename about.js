/* ========== About Page ========== */
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initTiltCard();
  initRipples();
  initDiscordWidget();
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

function initDiscordWidget() {
  var widget = document.getElementById('discord-widget');
  var img = document.getElementById('discord-widget-img');
  var usernameEl = document.getElementById('discord-widget-username');
  var statusEl = document.getElementById('discord-widget-status');
  var avatarWrap = document.getElementById('discord-widget-avatar');
  var tooltipEl = document.getElementById('discord-widget-tooltip');
  var discordId = widget ? widget.getAttribute('data-discord-id') : null;
  var statusLabels = { online: 'Online', idle: 'Away', dnd: 'Do Not Disturb', offline: 'Offline' };

  if (!discordId) {
    if (avatarWrap) avatarWrap.setAttribute('data-status', 'offline');
    if (statusEl) statusEl.textContent = 'Offline';
    if (tooltipEl) tooltipEl.textContent = 'Offline';
    setDefaultAvatar(img, '184723293599825921');
    return;
  }

  if (tooltipEl) tooltipEl.textContent = 'Loading...';
  fetch('https://api.lanyard.rest/v1/users/' + discordId)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.success || !data.data) {
        setDefaultAvatar(img, discordId);
        if (avatarWrap) avatarWrap.setAttribute('data-status', 'offline');
        if (statusEl) statusEl.textContent = 'Offline';
        if (tooltipEl) tooltipEl.textContent = 'Offline';
        return;
      }
      var d = data.data;
      var user = d.discord_user;
      var status = d.discord_status;
      var statusClass = status === 'online' ? 'online' : status === 'idle' ? 'idle' : status === 'dnd' ? 'dnd' : 'offline';
      var name = (user && (user.global_name || user.username)) ? (user.global_name || user.username) : '7hal';

      if (user && user.avatar && img) {
        var ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
        img.src = 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.' + ext + '?size=128';
        img.alt = name;
        avatarWrap && avatarWrap.removeAttribute('data-initial');
      } else {
        setDefaultAvatar(img, discordId);
      }

      if (usernameEl) usernameEl.textContent = name;
      if (statusEl) statusEl.textContent = statusLabels[statusClass] || 'Offline';
      if (avatarWrap) avatarWrap.setAttribute('data-status', statusClass);
      if (tooltipEl) tooltipEl.textContent = statusLabels[statusClass] || 'Offline';
    })
    .catch(function() {
      setDefaultAvatar(img, discordId);
      if (avatarWrap) avatarWrap.setAttribute('data-status', 'offline');
      if (statusEl) statusEl.textContent = 'Offline';
      if (tooltipEl) tooltipEl.textContent = 'Offline';
    });
}

function setDefaultAvatar(img, discordId) {
  if (!img || !discordId) return;
  var n = parseInt(String(discordId).slice(-2), 10) || 0;
  var index = Math.min(5, Math.max(0, n % 6));
  img.src = 'https://cdn.discordapp.com/embed/avatars/' + index + '.png';
  img.alt = '7hal';
}

function initTiltCard() {
  var card = document.getElementById('about-card');
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

function initRipples() {
  document.querySelectorAll('.btn-ripple, .social-btn').forEach(function(el) {
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
