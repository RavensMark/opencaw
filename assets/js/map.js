(function () {
  var viewport = document.getElementById('map-viewport');
  var stage = document.getElementById('map-stage');
  var image = document.getElementById('map-image');
  var markerLayer = document.getElementById('map-markers');
  var title = document.getElementById('map-info-title');
  var body = document.getElementById('map-info-body');
  var actions = document.getElementById('map-info-actions');
  var current = document.getElementById('map-current');
  var homeBtn = document.getElementById('map-home');
  var resetBtn = document.getElementById('map-reset');
  var zoomInBtn = document.getElementById('map-zoom-in');
  var zoomOutBtn = document.getElementById('map-zoom-out');
  var overlayPolitical = document.getElementById('map-overlay-political');
  var overlayCommon = document.getElementById('map-overlay-common');
  var overlayDraconic = document.getElementById('map-overlay-draconic');
  var togglePolitical = document.getElementById('map-toggle-political');
  var toggleCommon = document.getElementById('map-toggle-common');
  var toggleDraconic = document.getElementById('map-toggle-draconic');
  var toggleWiki = document.getElementById('map-toggle-wiki');

  if (!viewport || !stage || !image || !markerLayer) return;

  var WIKI_BASE = 'https://ravensmark.fandom.com/wiki/';

  function wikiUrl(slug) {
    return WIKI_BASE + slug;
  }

  var maps = {
    world: {
      name: "Raven's Mark World",
      src: 'assets/map/map.svg',
      alt: "Raven's Mark world map",
      width: 1840,
      height: 3320,
      defaultView: { x: -348, y: -924, scale: 0.8 },
      markers: [
        {
          id: 'avia',
          label: 'Avia',
          x: 46.5,
          y: 61.7,
          type: 'link',
          url: wikiUrl('Avia'),
          description: 'Open the Raven\'s Mark wiki page for Avia in a new tab.'
        },
        {
          id: 'asetria',
          label: 'Asetria',
          x: 36.1,
          y: 64.7,
          type: 'map',
          target: 'asetria',
          url: wikiUrl('Asetria'),
          description: 'Open a closer regional sub-map for Asetria, or jump to the wiki page.'
        },
        {
          id: 'efriqo',
          label: 'Confederacy of Efriqo',
          x: 56,
          y: 62.5,
          type: 'link',
          url: wikiUrl('Efriqo'),
          description: 'Open the wiki page for Efriqo in a new tab.'
        },
        {
          id: 'vershnila',
          label: 'K. of Vershnila',
          x: 64.1,
          y: 50.4,
          type: 'link',
          url: wikiUrl('Vershnila'),
          description: 'Open the wiki page for Vershnila in a new tab.'
        },
        {
          id: 'lithosphere',
          label: 'K. of Lithosphere',
          x: 52.1,
          y: 51.55,
          type: 'link',
          url: wikiUrl('Lithosphere'),
          description: 'Open the wiki page for Lithosphere in a new tab.'
        },
        {
          id: 'savara',
          label: "Free State of Sa'vara",
          x: 66.4,
          y: 68.15,
          type: 'link',
          url: wikiUrl('Free_State_of_Sa%27vara'),
          description: "Open the wiki page for the Free State of Sa'vara in a new tab."
        }
      ]
    },
    asetria: {
      name: 'Asetria Regional Map',
      src: 'assets/map/map.svg',
      alt: 'Asetria regional view on the Raven\'s Mark world map',
      width: 1840,
      height: 3320,
      defaultView: { x: -626, y: -2093, scale: 1.1 },
      markers: [
        {
          id: 'asetria-wiki',
          label: 'Asetria',
          x: 36.1,
          y: 72.2,
          type: 'link',
          url: wikiUrl('Asetria'),
          description: 'Open the Asetria wiki page in a new tab.'
        },
        {
          id: 'dichaea',
          label: 'Dichaea',
          x: 32.7,
          y: 70.9,
          type: 'link',
          url: wikiUrl('Dichaea'),
          description: 'Open the Dichaea wiki page in a new tab.'
        },
        {
          id: 'return-world',
          label: 'Return to World',
          x: 40.75,
          y: 69.75,
          type: 'map',
          target: 'world',
          description: "Return to the Raven's Mark world map."
        }
      ]
    }
  };

  var state = { map: 'world', x: 0, y: 0, scale: 1, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0, showWiki: true };

  function clampScale(value) {
    return Math.min(2.4, Math.max(0.45, value));
  }

  function applyTransform() {
    stage.style.transform = 'translate(' + state.x + 'px, ' + state.y + 'px) scale(' + state.scale + ')';
  }

  function renderMarkers() {
    var config = maps[state.map];
    markerLayer.innerHTML = '';
    markerLayer.hidden = !state.showWiki;
    if (!state.showWiki) return;
    config.markers.forEach(function (marker) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-marker map-marker-' + marker.type;
      btn.style.left = marker.x + '%';
      btn.style.top = marker.y + '%';
      btn.dataset.markerId = marker.id;
      btn.innerHTML = '<span class="map-marker-dot" aria-hidden="true"></span><span class="map-marker-label">' + marker.label + '</span>';
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        selectMarker(marker);
      });
      markerLayer.appendChild(btn);
    });
  }

  function resetInfo() {
    title.textContent = 'Select a point of interest';
    body.textContent = 'Markers can open a sub-map, or show a link that opens in a new browser tab.';
    actions.innerHTML = '';
  }

  function setOverlayVisibility() {
    if (overlayPolitical && togglePolitical) overlayPolitical.hidden = !togglePolitical.checked;
    if (overlayCommon && toggleCommon) overlayCommon.hidden = !toggleCommon.checked;
    if (overlayDraconic && toggleDraconic) overlayDraconic.hidden = !toggleDraconic.checked;
    state.showWiki = !toggleWiki || toggleWiki.checked;
    renderMarkers();
  }

  function loadMap(name, keepInfo) {
    var config = maps[name] || maps.world;
    state.map = maps[name] ? name : 'world';
    image.src = config.src;
    image.alt = config.alt;
    stage.style.width = config.width + 'px';
    stage.style.height = config.height + 'px';
    current.textContent = config.name;
    state.x = config.defaultView.x;
    state.y = config.defaultView.y;
    state.scale = config.defaultView.scale;
    renderMarkers();
    applyTransform();
    if (!keepInfo) resetInfo();
  }

  function appendWikiLink(url) {
    var link = document.createElement('a');
    link.className = 'btn primary map-link-btn';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open wiki page';
    actions.appendChild(link);
  }

  function selectMarker(marker) {
    title.textContent = marker.label;
    body.textContent = marker.description;
    actions.innerHTML = '';

    if (marker.type === 'map') {
      var mapBtn = document.createElement('button');
      mapBtn.type = 'button';
      mapBtn.className = 'btn primary';
      mapBtn.textContent = marker.target === 'world' ? 'Open world map' : 'Open sub-map';
      mapBtn.addEventListener('click', function () {
        loadMap(marker.target);
      });
      actions.appendChild(mapBtn);
      if (marker.url) appendWikiLink(marker.url);
      return;
    }

    appendWikiLink(marker.url);
  }

  function zoom(delta) {
    state.scale = clampScale(state.scale + delta);
    applyTransform();
  }

  viewport.addEventListener('pointerdown', function (event) {
    if (event.target.closest('.map-marker')) return;
    state.dragging = true;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = state.x;
    state.originY = state.y;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', function (event) {
    if (!state.dragging) return;
    state.x = state.originX + event.clientX - state.startX;
    state.y = state.originY + event.clientY - state.startY;
    applyTransform();
  });

  viewport.addEventListener('pointerup', function (event) {
    state.dragging = false;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointercancel', function () {
    state.dragging = false;
    viewport.classList.remove('is-dragging');
  });

  viewport.addEventListener('wheel', function (event) {
    event.preventDefault();
    zoom(event.deltaY > 0 ? -0.08 : 0.08);
  }, { passive: false });

  viewport.addEventListener('keydown', function (event) {
    var step = event.shiftKey ? 60 : 24;
    if (event.key === 'ArrowLeft') state.x += step;
    else if (event.key === 'ArrowRight') state.x -= step;
    else if (event.key === 'ArrowUp') state.y += step;
    else if (event.key === 'ArrowDown') state.y -= step;
    else if (event.key === '+' || event.key === '=') zoom(0.1);
    else if (event.key === '-' || event.key === '_') zoom(-0.1);
    else return;
    event.preventDefault();
    applyTransform();
  });

  homeBtn.addEventListener('click', function () { loadMap('world'); });
  resetBtn.addEventListener('click', function () { loadMap(state.map, true); });
  zoomInBtn.addEventListener('click', function () { zoom(0.15); });
  zoomOutBtn.addEventListener('click', function () { zoom(-0.15); });
  [togglePolitical, toggleCommon, toggleDraconic, toggleWiki].forEach(function (toggle) {
    if (!toggle) return;
    toggle.addEventListener('change', setOverlayVisibility);
  });

  loadMap('world');
  setOverlayVisibility();
})();
