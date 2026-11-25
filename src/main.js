/* Точка входа: фиксированный шаг 60 Гц, DOM-интерфейс и рендер мира по rAF. */
(function () {
  'use strict';
  var canvas = document.getElementById('game');
  var hint = document.getElementById('tap-hint');
  var input = new KZ.Input(canvas);
  var audio = new KZ.AudioSystem();
  var game = new KZ.Game(canvas, input, audio);
  var ui = new KZ.UI(game);
  game.ui = ui;

  window.KZ.game = game;
  window.KZ.ui = ui;

  function unlock() {
    audio.unlock();
    if (hint) hint.classList.add('hidden');
  }
  window.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('pointerdown', unlock, { once: true });

  var last = performance.now();
  var acc = 0;
  var STEP = 1 / 60;

  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    var guard = 0;
    while (acc >= STEP && guard < 6) {
      game.update(STEP);
      input.endFrame();
      acc -= STEP;
      guard++;
    }
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
