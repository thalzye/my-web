/* ========== Init ========== */
function init() {
  document.body.setAttribute('data-status', 'offline');
  initParticles('offline');
  initAOS();
  initTiltCard();
  initLanyard();
  initZagrebClock();
  initRipples();
}

/* ========== Zagreb live clock (Europe/Zagreb) ========== */
function initZagrebClock() {
  const el = document.getElementById('zagreb-clock');
  if (!el) return;
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-GB', {
      timeZone: 'Europe/Zagreb',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  update();
  setInterval(update, 1000);
}

/* ========== Particles.js (colors match Discord status) ========== */
const STATUS_PARTICLE_COLORS = {
  online: ['#22c55e', '#4ade80', '#86efac'],
  idle: ['#eab308', '#facc15', '#fde047'],
  dnd: ['#ef4444', '#f87171', '#fca5a5'],
  offline: ['#64748b', '#94a3b8', '#cbd5e1']
};

function getParticlesConfig(status) {
  const statusKey = STATUS_PARTICLE_COLORS[status] ? status : 'offline';
  const colors = STATUS_PARTICLE_COLORS[statusKey];
  const mainColor = colors[0];
  return {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: colors },
      shape: { type: 'circle' },
      opacity: { value: 0.4, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: false },
      move: {
        enable: true,
        speed: 1.2,
        direction: 'none',
        random: true,
        out_mode: 'out'
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'bubble' },
        onclick: { enable: true, mode: 'push' }
      },
      modes: {
        bubble: { distance: 120, size: 4, opacity: 0.4, color: mainColor },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  };
}

function initParticles(status) {
  if (typeof particlesJS !== 'function') return;
  particlesJS('particles-js', getParticlesConfig(status || 'offline'));
}

function updateParticlesColor(status) {
  if (typeof particlesJS !== 'function') return;
  const el = document.getElementById('particles-js');
  if (el) {
    el.innerHTML = '';
    particlesJS('particles-js', getParticlesConfig(status || 'offline'));
  }
}

/* ========== AOS (Animate On Scroll) ========== */
function initAOS() {
  if (typeof AOS !== 'object') return;
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 40
  });
}

/* ========== Tilt Card (3D tilt based on mouse position) ========== */
function initTiltCard() {
  const card = document.getElementById('tilt-card');
  if (!card) return;

  const tiltAmount = 12; // max degrees
  const glare = false;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -2 * tiltAmount;
    const rotateY = (x - 0.5) * 2 * tiltAmount;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ========== Discord Lanyard (Avatar + Status) ========== */
function initLanyard() {
  const card = document.getElementById('tilt-card');
  const img = document.getElementById('avatar-img');
  const statusDot = document.getElementById('status-dot');
  const discordId = card?.getAttribute('data-discord-id')?.trim();

  const tooltipEl = document.getElementById('avatar-status-tooltip');
  const setTooltip = (text) => { if (tooltipEl) tooltipEl.textContent = text; };
  const statusLabels = { online: 'Online', idle: 'Away', dnd: 'Do Not Disturb', offline: 'Offline' };

  if (!discordId || discordId === 'YOUR_DISCORD_ID') {
    document.querySelector('.avatar-circle')?.setAttribute('data-status', 'offline');
    document.body.setAttribute('data-status', 'offline');
    setTooltip('Offline');
    if (statusDot) { statusDot.classList.add('offline'); statusDot.title = 'Discord ID not set'; }
    const wrap = document.querySelector('.avatar-circle');
    if (wrap) wrap.setAttribute('data-initial', '7');
    if (img) img.alt = '7hal';
    revealCardFooterButtons();
    return;
  }

  document.querySelector('.avatar-circle')?.setAttribute('data-status', '');
  setTooltip('Loading...');
  if (statusDot) { statusDot.classList.add('loading'); statusDot.title = 'Loading...'; }

  fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !data.data) {
        setDefaultDiscordAvatar(img, discordId);
        setFallbackAvatarStatus(img, statusDot);
        document.body.setAttribute('data-status', 'offline');
        updateParticlesColor('offline');
        revealCardFooterButtons();
        return;
      }
      const { discord_user, discord_status } = data.data;
      if (discord_user?.avatar && img) {
        const ext = discord_user.avatar.startsWith('a_') ? 'gif' : 'png';
        img.src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${ext}?size=256`;
        img.alt = discord_user.global_name || discord_user.username || '7hal';
        img.closest('.avatar-circle')?.removeAttribute('data-initial');
      } else {
        setDefaultDiscordAvatar(img, discordId);
      }
      const statusClass = discord_status === 'online' ? 'online' : discord_status === 'idle' ? 'idle' : discord_status === 'dnd' ? 'dnd' : 'offline';
      const avatarCircle = img?.closest('.avatar-circle');
      if (avatarCircle) avatarCircle.setAttribute('data-status', statusClass);
      document.body.setAttribute('data-status', statusClass);
      updateParticlesColor(statusClass);
      setTooltip(statusLabels[statusClass] || 'Offline');
      if (statusDot) {
        statusDot.classList.remove('loading', 'online', 'idle', 'dnd', 'offline');
        statusDot.classList.add(statusClass);
        statusDot.title = statusLabels[statusClass] || 'Offline';
      }
      revealCardFooterButtons();
    })
    .catch(() => {
      setDefaultDiscordAvatar(img, discordId);
      setFallbackAvatarStatus(img, statusDot);
      document.body.setAttribute('data-status', 'offline');
      updateParticlesColor('offline');
      revealCardFooterButtons();
    });
}

/* ========== Card Footer Buttons – reveal after load ========== */
function revealCardFooterButtons() {
  const el = document.getElementById('card-footer-buttons');
  if (el) el.classList.add('revealed');
}

function setDefaultDiscordAvatar(img, discordId) {
  if (!img || !discordId) return;
  const n = parseInt(String(discordId).slice(-2), 10) || 0;
  const index = Math.min(5, Math.max(0, n % 6));
  img.src = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  img.alt = '7hal';
  img.closest('.avatar-circle')?.removeAttribute('data-initial');
}

function setFallbackAvatarStatus(img, statusDot) {
  document.querySelector('.avatar-circle')?.setAttribute('data-status', 'offline');
  const t = document.getElementById('avatar-status-tooltip');
  if (t) t.textContent = 'Offline';
  if (statusDot) {
    statusDot.classList.remove('loading');
    statusDot.classList.add('offline');
    statusDot.title = 'Offline';
  }
  const wrap = document.querySelector('.avatar-circle');
  if (wrap && (!img?.src || img.src === '')) wrap.setAttribute('data-initial', '7');
}

/* ========== Ripple effect for buttons / links with .btn-ripple ========== */
function addRipple(el, e) {
  if (!el || !e) return;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;position:absolute;pointer-events:none;`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function initRipples() {
  document.querySelectorAll('.btn-ripple, .social-btn').forEach((el) => {
    el.addEventListener('click', (e) => addRipple(el, e));
  });
}

/* ========== Start ========== */
document.addEventListener('DOMContentLoaded', init);
