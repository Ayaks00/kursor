
(function () {
  'use strict';
  if (KZ.Art && KZ.Art.preload) KZ.Art.preload();
  var canvas = document.getElementById('game');
  var hint = document.getElementById('tap-hint');
  var input = new KZ.Input(canvas);
  var audio = new KZ.AudioSystem();
  var game = new KZ.Game(canvas, input, audio);
  var ui = new KZ.UI(game);
  game.ui = ui;

  window.KZ.game = game;
  window.KZ.ui = ui;

  if (!game.save.lang) game.setState('language');

  function unlock() {
    audio.unlock();
    hint.classList.add('hidden');
  }
  window.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('pointerdown', unlock, { once: true });

  var last = performance.now();
  var acc = 0;
  var STEP = 1 / 60;

  document.addEventListener('visibilitychange', function () {
    last = performance.now();
    acc = 0;
  });

  function frame(now) {
    if (document.hidden) {
      last = now;
      requestAnimationFrame(frame);
      return;
    }
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      game.update(STEP);
      input.endFrame();
      acc -= STEP;
    }
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
