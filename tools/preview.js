/* Инструмент разработки: рендер кадров игры в PNG без браузера.
   Запуск: NODE_PATH=/path/to/node_modules node tools/preview.js out/
   Требуется @napi-rs/canvas (только для проверки, игре не нужен). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let createCanvas, loadImage;
try {
  ({ createCanvas, loadImage } = require('@napi-rs/canvas'));
} catch (e) {
  ({ createCanvas, loadImage } = require('/tmp/kztools/node_modules/@napi-rs/canvas'));
}

const root = path.join(__dirname, '..');
const out = process.argv[2] || '/tmp/kzpreview';
fs.mkdirSync(out, { recursive: true });

const mainCanvas = createCanvas(1920, 1080);
mainCanvas.addEventListener = () => {};
mainCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1920, height: 1080 });

global.window = global;
global.addEventListener = () => {};
global.document = {
  getElementById: () => mainCanvas,
  createElement: (tag) => {
    if (tag !== 'canvas') return {};
    const c = createCanvas(1920, 1080);
    c.addEventListener = () => {};
    return c;
  },
  addEventListener: () => {}
};
const store = {};
global.localStorage = {
  getItem: k => store[k] || null,
  setItem: (k, v) => { store[k] = v; }
};
global.Audio = class { play() {} };
global.AudioContext = undefined;
global.webkitAudioContext = undefined;
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => 0;
global.setInterval = () => 0;

['src/sfx-data.js', 'src/audio.js', 'src/input.js', 'src/art.js', 'src/levels.js', 'src/game.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }));

(async () => {
  // В браузере фон приходит из BG_DATA; здесь подставляем тот же PNG с диска.
  const bg = await loadImage(path.join(root, 'assets/bg/kfu-main.png'));
  KZ.Art.backdrop = function (ctx) { ctx.drawImage(bg, 0, 0, 480, 270); };

  const game = new KZ.Game(mainCanvas, new KZ.Input(mainCanvas), new KZ.AudioSystem());

  function shot(name, setup) {
    if (setup) setup(game);
    game.render();
    fs.writeFileSync(path.join(out, name + '.png'), mainCanvas.toBuffer('image/png'));
    console.log('rendered', name);
  }

  shot('01-menu');
  shot('02-how', g => g.setState('how'));
  shot('03-about', g => g.setState('about'));
  shot('04-intro', g => g.loadLevel(0));
  shot('05-play', g => {
    g.setState('play');
    g.player.x = 660; g.player.y = 195; g.player.onGround = true; g.player.groundIdx = 1;
    g.curvature = 0; g.target = 0;
    g.camX = 380;
  });
  shot('06-curved', g => {
    g.curvature = 1; g.target = 1; g.warp = 0;
    g.player.x = 660; g.player.y = 190; g.camX = 380;
  });
  shot('07-level2', g => { g.loadLevel(1); g.setState('play'); g.player.x = 1180; g.camX = 1030; });
  shot('08-observatory', g => { g.loadLevel(2); g.setState('play'); g.player.x = 1260; g.camX = 1100; g.curvature = 0.7; g.target = 1; });
  shot('09-boss', g => { g.loadLevel(3); g.setState('play'); g.player.x = 430; g.camX = 230; g.curvature = 0.8; g.target = 1; });
  shot('10-victory', g => { g.setState('victory'); g.stateTime = 3; });
})();
