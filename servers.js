/* ========== GameMonitor API - Server Status ========== */
const SERVER_IDS = [10694925, 10866628];
const SERVER_ACTIONS = {
  10694925: {
    website: { url: 'https://web.reape.rs', label: 'Website', icon: 'fa-globe', external: true },
    viewer: { url: 'viewer.html', label: 'Viewer', icon: 'fa-eye', external: false }
  },
  10866628: {
    website: { url: 'https://sghq.network', label: 'Website', icon: 'fa-globe', external: true }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  initParticles('online');
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initRipples();

  document.getElementById('servers-grid').addEventListener('click', function(e) {
    var el = e.target.closest('.server-connect-copy');
    if (el) {
      e.preventDefault();
      var txt = el.getAttribute('data-connect');
      if (txt && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function() {
          el.innerHTML = 'Copied! <i class="fas fa-check"></i>';
          el.classList.add('copied');
          setTimeout(function() {
            el.innerHTML = escapeHtml(txt) + ' <i class="fas fa-copy"></i>';
            el.classList.remove('copied');
          }, 1500);
        });
      }
    }
  });

  SERVER_IDS.forEach(function(id) {
    fetch('https://api.gamemonitoring.net/servers/' + id)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        renderServer(id, data.response);
      })
      .catch(function(err) {
        renderServerError(id, err);
      });
  });
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

function renderServer(id, s) {
  var card = document.getElementById('server-' + id);
  if (!card) return;

  card.classList.remove('loading');
  card.classList.add(s && s.status ? 'online' : 'offline');

  var name = (s && s.name) ? escapeHtml(s.name) : 'Unknown';
  var game = (s && s.app && s.app.name) ? escapeHtml(s.app.name) : 'Game';
  var status = s && s.status ? 'online' : 'offline';
  var statusLabel = status === 'online' ? 'Online' : 'Offline';
  var players = (s && typeof s.numplayers === 'number') ? s.numplayers : 0;
  var maxPlayers = (s && typeof s.maxplayers === 'number') ? s.maxplayers : '?';
  var version = (s && s.version) ? escapeHtml(s.version) : '—';
  var connect = (s && s.connect) ? s.connect : '';
  var connectEscaped = connect ? escapeHtml(connect) : '';
  var country = (s && s.country) ? s.country : '';
  var city = (s && s.city) ? escapeHtml(s.city) : '';
  var flag = countryCodeToFlag(country);

  var html = '';
  html += '<div class="server-status-badge ' + status + '"><i class="fas fa-circle"></i> ' + statusLabel + '</div>';
  html += '<h3 class="server-name">' + name + '</h3>';
  html += '<p class="server-game"><i class="fas fa-gamepad"></i> ' + game + '</p>';
  html += '<div class="server-stats">';
  html += '<span class="server-stat"><i class="fas fa-users"></i> ' + players + ' / ' + maxPlayers + '</span>';
  html += '<span class="server-stat"><i class="fas fa-code-branch"></i> ' + version + '</span>';
  if (country || city) {
    html += '<span class="server-stat"><i class="fas fa-map-marker-alt"></i> ' + (city ? city + ', ' : '') + (flag || country) + '</span>';
  }
  html += '</div>';
  if (connect) {
    html += '<p class="server-connect"><code class="server-connect-copy" data-connect="' + escapeHtml(connect) + '" title="Click to copy">' + connectEscaped + '<i class="fas fa-copy"></i></code></p>';
  }
  html += buildServerActions(id);

  card.querySelector('.server-card-inner').innerHTML = html;
}

function renderServerError(id, err) {
  var card = document.getElementById('server-' + id);
  if (!card) return;

  card.classList.remove('loading');
  card.classList.add('error');
  card.querySelector('.server-card-inner').innerHTML =
    '<div class="server-status-badge error"><i class="fas fa-exclamation-triangle"></i> Error</div>' +
    '<p class="server-error-msg">Failed to load server data</p>' +
    buildServerActions(id);
}

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return '';
  var a = code.toUpperCase().charCodeAt(0);
  var b = code.toUpperCase().charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '';
  return String.fromCodePoint(0x1F1E6 - 65 + a, 0x1F1E6 - 65 + b);
}

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildServerActions(id) {
  var actions = SERVER_ACTIONS[id];
  if (!actions) return '';
  var html = '<div class="server-actions">';
  if (actions.website) html += buildActionLink(actions.website);
  if (actions.viewer) html += buildActionLink(actions.viewer);
  html += '</div>';
  return html;
}

function buildActionLink(action) {
  if (!action || !action.url) return '';
  var label = escapeHtml(action.label || 'Open');
  var icon = action.icon ? 'fas ' + action.icon : 'fas fa-link';
  var attrs = ' class="server-action btn-ripple" href="' + action.url + '" aria-label="' + label + '" title="' + label + '"';
  if (action.external) {
    attrs += ' target="_blank" rel="noopener"';
  }
  return '<a' + attrs + '><i class="' + icon + '"></i></a>';
}

function initRipples() {
  document.addEventListener('click', function(e) {
    var el = e.target && e.target.closest ? e.target.closest('.btn-ripple') : null;
    if (!el) return;
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    var rect = el.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - rect.left - size / 2) + 'px;top:' + (e.clientY - rect.top - size / 2) + 'px;position:absolute;pointer-events:none;';
    el.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
  });
}
