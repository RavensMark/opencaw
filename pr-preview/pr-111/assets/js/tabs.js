(function () {
  var tabs = document.querySelectorAll('.tab');
  var brandHome = document.getElementById('brand-home');
  var landingTiles = document.querySelectorAll('[data-open-tab]');
  var dmOnlyPanels = ['boopsum', 'staff', 'questinfo', 'encounter'];
  var panels = {
    home: document.getElementById('panel-home'),
    boopsum: document.getElementById('panel-boopsum'),
    loot: document.getElementById('panel-loot'),
    staff: document.getElementById('panel-staff'),
    questinfo: document.getElementById('panel-questinfo'),
    questnotes: document.getElementById('panel-questnotes'),
    character: document.getElementById('panel-character'),
    avrae: document.getElementById('panel-avrae'),
    encounter: document.getElementById('panel-encounter'),
    map: document.getElementById('panel-map'),
    links: document.getElementById('panel-links'),
  };

  function isKnownPanel(name) {
    return Object.prototype.hasOwnProperty.call(panels, name);
  }

  function readTabFromHash() {
    var hash = window.location.hash || '';
    var name = hash.replace(/^#/, '').trim().toLowerCase();
    return isKnownPanel(name) ? name : null;
  }

  function syncHash(name) {
    var targetHash = '#' + name;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }

  function activate(name, options) {
    options = options || {};
    if (!isKnownPanel(name)) name = 'home';
    if (document.documentElement.classList.contains('mode-player') && dmOnlyPanels.indexOf(name) !== -1) {
      name = 'home';
    }
    document.body.classList.toggle('tab-wide', name === 'loot' || name === 'avrae' || name === 'encounter' || name === 'map');
    document.body.classList.toggle('is-home', name === 'home');
    tabs.forEach(function (btn) {
      var on = btn.dataset.tab === name;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    Object.keys(panels).forEach(function (key) {
      var panel = panels[key];
      if (!panel) return;
      var on = key === name;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
    if (!options.fromHash) {
      syncHash(name);
    }
    window.dispatchEvent(new CustomEvent('rmtools-tab', { detail: { tab: name } }));
  }

  function readModeFromPath() {
    return /\/dm(?:\/|$)/.test(window.location.pathname || '');
  }

  function applyMode(isDm) {
    document.documentElement.classList.toggle('mode-dm', isDm);
    document.documentElement.classList.toggle('mode-player', !isDm);
    if (!isDm) {
      var activeDmTab = document.querySelector('.tab.is-active.dm-only');
      if (activeDmTab) activate('home');
    }
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activate(btn.dataset.tab);
    });
  });

  if (brandHome) {
    brandHome.addEventListener('click', function () {
      activate('home');
    });
  }

  landingTiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      activate(tile.dataset.openTab);
    });
  });

  window.addEventListener('hashchange', function () {
    var tabFromHash = readTabFromHash() || 'home';
    activate(tabFromHash, { fromHash: true });
  });

  applyMode(readModeFromPath());
  activate(readTabFromHash() || 'home', { fromHash: true });
})();
