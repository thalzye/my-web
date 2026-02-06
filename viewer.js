/* ========== Viewer Page ========== */
var SERVER_ID = 10694925;
var VIEWER_REFRESH_MS = 15000;
var viewerTimer = null;

document.addEventListener('DOMContentLoaded', function() {
  initParticles('online');
  if (typeof AOS === 'object') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 40 });
  }
  initRipples();
  initViewer();
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

function initViewer() {
  var refreshBtn = document.getElementById('viewer-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      refreshViewer(true);
    });
  }
  refreshViewer(false);
  viewerTimer = setInterval(function() {
    refreshViewer(false);
  }, VIEWER_REFRESH_MS);
}

function refreshViewer(isManual) {
  setViewerStatus('loading', isManual ? 'Refreshing viewer...' : 'Loading viewer...');
  fetch('https://api.gamemonitoring.net/servers/' + SERVER_ID)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (!data || !data.response) {
        throw new Error('Missing response data');
      }
      renderViewer(data.response);
      setViewerStatus('ready', '');
    })
    .catch(function() {
      setViewerStatus('error', 'Failed to load viewer data.');
    });
}

function renderViewer(server) {
  var nameEl = document.getElementById('viewer-server-name');
  var metaEl = document.getElementById('viewer-server-meta');
  var updatedEl = document.getElementById('viewer-updated');
  var treeEl = document.getElementById('viewer-tree');
  if (!treeEl) return;

  var channels = server && server.channels && Array.isArray(server.channels.items) ? server.channels.items : [];
  var flattened = flattenChannels(channels, 0, []);
  var channelCount = flattened.filter(function(item) { return !item.isSpacer; }).length;
  var onlineCount = server && server.channels && typeof server.channels.onlinecount === 'number' ? server.channels.onlinecount : null;

  if (nameEl) nameEl.textContent = server && server.name ? server.name : 'Teamspeak';

  var metaParts = [];
  if (onlineCount !== null) metaParts.push('Online: ' + onlineCount);
  metaParts.push('Channels: ' + channelCount);
  if (server && typeof server.uptime === 'number') metaParts.push('Uptime: ' + formatUptime(server.uptime));
  if (metaEl) metaEl.textContent = metaParts.join(' | ');

  if (updatedEl) updatedEl.textContent = 'Updated: ' + formatTime(new Date());

  treeEl.innerHTML = '';
  if (!flattened.length) {
    var empty = document.createElement('div');
    empty.className = 'viewer-empty';
    empty.textContent = 'No channel data available.';
    treeEl.appendChild(empty);
    return;
  }

  flattened.forEach(function(entry) {
    treeEl.appendChild(buildViewerRow(entry));
  });
}

function flattenChannels(items, depth, result) {
  if (!Array.isArray(items)) return result;
  sortChannels(items).forEach(function(item) {
    var parsed = parseChannelName(item && item.name ? item.name : '');
    result.push({
      id: item && item.id ? item.id : null,
      name: parsed.text,
      isSpacer: parsed.isSpacer,
      depth: depth,
      clients: typeof item.clients === 'number' ? item.clients : 0,
      topic: item && item.topic ? item.topic : ''
    });
    if (item && Array.isArray(item.items) && item.items.length) {
      flattenChannels(item.items, depth + 1, result);
    }
  });
  return result;
}

function sortChannels(items) {
  return items.slice().sort(function(a, b) {
    var orderA = typeof a.order === 'number' ? a.order : 0;
    var orderB = typeof b.order === 'number' ? b.order : 0;
    if (orderA === orderB) {
      var nameA = (a.name || '').toString().toLowerCase();
      var nameB = (b.name || '').toString().toLowerCase();
      return nameA.localeCompare(nameB);
    }
    return orderA - orderB;
  });
}

function parseChannelName(name) {
  var text = (name || '').toString();
  var isSpacer = false;
  var spacerMatch = text.match(/^\[(\*?spacer[^\]]*|cspacer)\]/i);
  if (spacerMatch) {
    isSpacer = true;
    text = text.replace(spacerMatch[0], '');
  }
  text = text.replace(/\\p/g, ' ').replace(/\\s/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();
  if (!text) text = '-';
  return { text: text, isSpacer: isSpacer };
}

function buildViewerRow(entry) {
  var card = document.createElement('div');
  card.className = 'viewer-channel-card' + (entry.isSpacer ? ' spacer' : '');
  card.style.setProperty('--depth', entry.depth || 0);

  if (entry.isSpacer) {
    var spacerText = document.createElement('span');
    spacerText.className = 'viewer-spacer-text';
    spacerText.textContent = entry.name;
    card.appendChild(spacerText);
    return card;
  }

  var header = document.createElement('div');
  header.className = 'viewer-channel-header';

  var info = document.createElement('div');
  info.className = 'viewer-channel-info';

  var icon = document.createElement('span');
  icon.className = 'viewer-channel-icon';
  icon.innerHTML = '<i class="fas fa-hashtag" aria-hidden="true"></i>';

  var name = document.createElement('span');
  name.className = 'viewer-channel-name';
  name.textContent = entry.name;
  if (entry.topic) {
    name.title = entry.topic;
  }

  info.appendChild(icon);
  info.appendChild(name);
  header.appendChild(info);

  var count = document.createElement('span');
  count.className = 'viewer-channel-count';
  count.textContent = entry.clients + (entry.clients === 1 ? ' user' : ' users');
  header.appendChild(count);

  card.appendChild(header);

  if (entry.clients > 0) {
    card.appendChild(buildUserList(entry.clients));
  }

  return card;
}

function setViewerStatus(state, message) {
  var statusEl = document.getElementById('viewer-status');
  if (!statusEl) return;
  statusEl.innerHTML = '';
  if (state === 'ready') {
    statusEl.style.display = 'none';
    return;
  }
  statusEl.style.display = '';

  var badge = document.createElement('span');
  badge.className = 'viewer-status-badge ' + state;
  var iconClass = state === 'error' ? 'fa-triangle-exclamation' : 'fa-spinner fa-spin';
  badge.innerHTML = '<i class="fas ' + iconClass + '"></i> ' + (message || '');
  statusEl.appendChild(badge);
}

function formatUptime(seconds) {
  var total = Math.max(0, Number(seconds) || 0);
  var days = Math.floor(total / 86400);
  var hours = Math.floor((total % 86400) / 3600);
  var minutes = Math.floor((total % 3600) / 60);
  var parts = [];
  if (days) parts.push(days + 'd');
  if (hours || days) parts.push(hours + 'h');
  parts.push(minutes + 'm');
  return parts.join(' ');
}

function formatTime(date) {
  var d = date instanceof Date ? date : new Date();
  var hh = String(d.getHours()).padStart(2, '0');
  var mm = String(d.getMinutes()).padStart(2, '0');
  var ss = String(d.getSeconds()).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

function buildUserList(count) {
  var list = document.createElement('div');
  list.className = 'viewer-user-list';
  var maxShown = 6;
  var showCount = Math.min(count, maxShown);

  for (var i = 1; i <= showCount; i += 1) {
    list.appendChild(buildUserItem('User ' + i));
  }

  if (count > maxShown) {
    var more = document.createElement('span');
    more.className = 'viewer-user viewer-user-more';
    more.textContent = '+' + (count - maxShown) + ' more';
    list.appendChild(more);
  }

  return list;
}

function buildUserItem(label) {
  var user = document.createElement('span');
  user.className = 'viewer-user';

  var icon = document.createElement('span');
  icon.className = 'viewer-user-icon';
  icon.innerHTML = '<i class="fas fa-user" aria-hidden="true"></i>';

  var status = document.createElement('span');
  status.className = 'viewer-user-status';
  status.setAttribute('aria-hidden', 'true');

  var name = document.createElement('span');
  name.className = 'viewer-user-name';
  name.textContent = label;

  user.appendChild(icon);
  user.appendChild(status);
  user.appendChild(name);
  return user;
}
