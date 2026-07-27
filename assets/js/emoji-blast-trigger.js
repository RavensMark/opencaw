(function () {
  var brandBlastButton = document.getElementById('brand-blast');
  var footerRainButton = document.getElementById('footer-emoji-rain');
  var rainContainer;
  var rainAnimationFrame;
  var rainStopTimeout;
  var rainDropTimeouts = [];
  var isRaining = false;

  var rainEmojis = ['🎲', '🐉', '⚔️', '🛡️', '🧝', '🧌', '🧟', '🧛', '🧙‍♂️', '🏹', '🪄', '💎', '🗝️', '🏰', '📜', '🔮', '🐺', '🦉', '🕷️', '🕸️', '🦇', '🐍', '🦂', '🌙', '🔥', '❄️', '⚡', '☠️', '💀', '👁️'];

  function blastBirds() {
    if (!brandBlastButton || typeof window.emojiBlast !== 'function') {
      return;
    }

    var rect = brandBlastButton.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    var offsets = [
      { x: 0, y: 0 },
      { x: -24, y: -10 },
      { x: 24, y: -10 },
    ];

    offsets.forEach(function (offset, index) {
      window.setTimeout(function () {
        window.emojiBlast({
          emojiCount: 28,
          emojis: ['🪶', '🐦‍⬛'],
          position: {
            x: centerX + offset.x,
            y: centerY + offset.y,
          },
          uniqueness: 2,
        });
      }, index * 90);
    });
  }

  function randomEmoji() {
    return rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
  }

  function createRainContainer() {
    if (rainContainer) {
      return rainContainer;
    }

    rainContainer = document.createElement('div');
    rainContainer.className = 'emoji-rain';
    rainContainer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rainContainer);
    return rainContainer;
  }

  function RainDrop(delay, range) {
    this.x = range[0] + Math.random() * range[1];
    this.y = -80 - Math.random() * 120;
    this.velocity = {
      x: -0.4 + Math.random() * 0.8,
      y: 1.4 + Math.random() * 1.8,
    };
    this.range = range;
    this.rotation = Math.random() * 360;
    this.rotationVelocity = -1.2 + Math.random() * 2.4;
    this.element = document.createElement('span');
    this.element.className = 'emoji-rain-drop';
    this.element.textContent = randomEmoji();
    this.element.style.opacity = '0';

    var drop = this;
    var dropTimeout = window.setTimeout(function () {
      if (!isRaining) {
        return;
      }

      createRainContainer().appendChild(drop.element);
      drop.active = true;
    }, delay);

    rainDropTimeouts.push(dropTimeout);
  }

  RainDrop.prototype.update = function () {
    if (!this.active) {
      return;
    }

    if (this.y > window.innerHeight + 80) {
      this.y = -80 - Math.random() * 120;
      this.x = this.range[0] + Math.random() * this.range[1];
      this.element.textContent = randomEmoji();
    }

    this.y += this.velocity.y;
    this.x += this.velocity.x;
    this.rotation += this.rotationVelocity;
    this.element.style.opacity = '1';
    this.element.style.transform = 'translate3d(' + this.x + 'px, ' + this.y + 'px, 0) rotate(' + this.rotation + 'deg)';
  };

  function stopEmojiRain() {
    isRaining = false;

    if (rainAnimationFrame) {
      window.cancelAnimationFrame(rainAnimationFrame);
      rainAnimationFrame = null;
    }

    if (rainStopTimeout) {
      window.clearTimeout(rainStopTimeout);
      rainStopTimeout = null;
    }

    rainDropTimeouts.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
    rainDropTimeouts = [];

    if (rainContainer) {
      rainContainer.remove();
      rainContainer = null;
    }

    if (footerRainButton) {
      footerRainButton.setAttribute('aria-pressed', 'false');
    }
  }

  function startEmojiRain() {
    var container = createRainContainer();
    container.textContent = '';
    isRaining = true;

    if (footerRainButton) {
      footerRainButton.setAttribute('aria-pressed', 'true');
    }

    var circles = [];
    var width = window.innerWidth || document.documentElement.clientWidth || 1200;
    var lanes = [-0.1, 0.1, 0.3, 0.5, 0.7, 0.9];

    for (var i = 0; i < 15; i += 1) {
      lanes.forEach(function (lane) {
        circles.push(new RainDrop(i * 150, [width * lane, width * 0.35]));
      });
    }

    function animate() {
      if (!isRaining) {
        return;
      }

      circles.forEach(function (circle) {
        circle.update();
      });
      rainAnimationFrame = window.requestAnimationFrame(animate);
    }

    animate();

    rainStopTimeout = window.setTimeout(stopEmojiRain, 8500);
  }

  function toggleEmojiRain() {
    if (isRaining) {
      stopEmojiRain();
      return;
    }

    startEmojiRain();
  }

  if (brandBlastButton) {
    brandBlastButton.addEventListener('click', blastBirds);
  }

  if (footerRainButton) {
    footerRainButton.setAttribute('aria-pressed', 'false');
    footerRainButton.addEventListener('click', toggleEmojiRain);
  }
})();
