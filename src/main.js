/* Точка входа: фиксированный шаг 60 Гц, DOM-интерфейс и рендер мира по rAF. */
(function () {
  'use strict';
  var canvas = document.getElementById('game');
  var hint = document.getElementById('tap-hint');
  if (!document.getElementById('ui')) {
    var warn = document.createElement('div');
    warn.style.cssText = 'position:fixed;left:0;right:0;top:0;padding:14px;background:#241d16;color:#f3e6bc;' +
      'font:16px Tahoma,sans-serif;text-align:center;z-index:9999';
    warn.textContent = 'Открыта старая кэшированная страница. Нажмите Ctrl+F5 или откройте play.html';
    document.body.appendChild(warn);
  }
  var input = new KZ.Input(canvas);
  var audio = new KZ.AudioSystem();
  var game = new KZ.Game(canvas, input, audio);
  var ui = null;
  if (KZ.UI) {
    try { ui = new KZ.UI(game); game.ui = ui; }
    catch (err) { console.error('UI init error', err); }
  }

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
