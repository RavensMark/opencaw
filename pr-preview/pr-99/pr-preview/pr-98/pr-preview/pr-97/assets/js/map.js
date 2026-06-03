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

  if (!viewport || !stage || !image || !markerLayer) return;

  var maps = {
    world: {
      name: "Raven's Mark World",
      src: 'assets/img/ravensmark-world-map.svg',
      alt: "Raven's Mark world map",
      width: 1152,
      height: 2048,
      defaultView: { x: -80, y: -760, scale: 0.8 },
      markers: [
        {
          id: 'avia',
          label: 'K. of Avia',
          x: 43,
          y: 73.4,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Avia',
          description: 'Display the Raven\'s Mark wiki page for Avia and open it in a new tab.'
        },
        {
          id: 'asetria',
          label: 'Asetria',
          x: 22.2,
          y: 94.4,
          type: 'map',
          target: 'asetria',
          description: 'Open a closer regional sub-map for Asetria.'
        },
        {
          id: 'efriqo',
          label: 'Confederacy of Efriqo',
          x: 62,
          y: 79,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Confederacy_of_Efriqo',
          description: 'Display the wiki page for the Confederacy of Efriqo.'
        },
        {
          id: 'vershnila',
          label: 'K. of Vershnila',
          x: 78.2,
          y: 70.8,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Vershnila',
          description: 'Display the wiki page for Vershnila.'
        },
        {
          id: 'lithosphere',
          label: 'K. of Lithosphere',
          x: 54.2,
          y: 64.1,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Lithosphere',
          description: 'Display the wiki page for Lithosphere.'
        },
        {
          id: 'savara',
          label: "Free State of Sa'vara",
          x: 82.8,
          y: 94.3,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Sa%27vara',
          description: "Display the wiki page for Sa'vara."
        }
      ]
    },
    asetria: {
      name: 'Asetria Regional Map',
      src: 'assets/img/asetria-submap.svg',
      alt: 'Asetria regional sub-map',
      width: 1200,
      height: 850,
      defaultView: { x: 0, y: 0, scale: 0.72 },
      markers: [
        {
          id: 'asetria-wiki',
          label: 'Asetria Wiki',
          x: 48,
          y: 41,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Asetria',
          description: 'Display the Asetria wiki page.'
        },
        {
          id: 'southern-harbor',
          label: 'Southern Harbor',
          x: 18,
          y: 72,
          type: 'link',
          url: 'https://ravensmark.fandom.com/wiki/Asetria',
          description: 'A sample sub-map point of interest that links out to the wiki.'
        },
        {
          id: 'return-world',
          label: 'Return to World',
          x: 86,
          y: 13,
          type: 'map',
          target: 'world',
          description: "Return to the Raven's Mark world map."
        }
      ]
    }
  };

  var state = { map: 'world', x: 0, y: 0, scale: 1, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 };

  function clampScale(value) {
    return Math.min(2.4, Math.max(0.45, value));
  }

  function applyTransform() {
    stage.style.transform = 'translate(' + state.x + 'px, ' + state.y + 'px) scale(' + state.scale + ')';
  }

  function renderMarkers() {
    var config = maps[state.map];
    markerLayer.innerHTML = '';
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
      return;
    }

    var link = document.createElement('a');
    link.className = 'btn primary map-link-btn';
    link.href = marker.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open wiki page';
    actions.appendChild(link);
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

  loadMap('world');
})();
