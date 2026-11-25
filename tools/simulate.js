/* Инструмент разработки: грубый автопилот для проверки проходимости уровней. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
let createCanvas;
try { ({ createCanvas } = require('@napi-rs/canvas')); }
catch (e) { ({ createCanvas } = require('/tmp/kztools/node_modules/@napi-rs/canvas')); }
const root = path.join(__dirname, '..');
const canvas = createCanvas(480, 270);
canvas.addEventListener = () => {};
canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 480, height: 270 });
global.window = global;
global.addEventListener = () => {};
global.document = { getElementById: () => canvas, createElement: () => createCanvas(480,270), addEventListener: () => {} };
const store = {};
global.localStorage = { getItem: k => store[k] || null, setItem: (k,v) => { store[k] = v; } };
global.Audio = class { play() {} };
global.AudioContext = undefined;
global.webkitAudioContext = undefined;
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => 0;
global.setInterval = () => 0;
['src/sfx-data.js','src/audio.js','src/input.js','src/art.js','src/levels.js','src/game.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'), { filename:f }));

const K = 4;
const CURVE_ZONES = {
  0: [[600, 810], [1380, 1590]],
  1: [[540, 730], [1090, 1420], [1650, 1850]],
  2: [[660, 880], [1270, 1590], [1990, 2220]]
};

function run(levelIndex) {
  const input = new KZ.Input(canvas);
  const game = new KZ.Game(canvas, input, new KZ.AudioSystem());
  game.loadLevel(levelIndex);
  game.setState('play');
  game.hazards = []; // проверяем только геометрию, без случайных смертей
  let maxX = 0, stuck = 0, lastX = 0, jumps = 0, toggles = 0, holdJump = 0;
  for (let frame = 0; frame < 8000; frame++) {
    const p = game.player;
    input.down = {};
    input.down.KeyD = true;
    if (holdJump > 0) { input.down.Space = true; holdJump--; }
    if (game.state === 'death') { input.down = {}; }
    if (game.state === 'play') {
      const zones = (CURVE_ZONES[levelIndex] || []).map(z => z.map(v => v * K));
      const wantCurve = zones.some(z => p.x > z[0] && p.x < z[1]);
      if ((wantCurve ? 1 : 0) !== game.target) {
        input.pressed.KeyQ = true;
        toggles++;
      }
      const plat = p.groundIdx >= 0 ? game.level.platforms[p.groundIdx] : null;
      const ends = plat ? game.platformEnds(plat) : null;
      const edge = ends ? Math.max(ends[0][0], ends[1][0]) - 12 * K : 0;
      if (p.onGround && (p.x > edge || stuck > 25)) {
        input.pressed.Space = true;
        input.down.Space = true;
        holdJump = 12;
        jumps++;
      }
    }
    if (process.env.DEBUG && levelIndex===0 && frame<420 && frame%8===0) console.log(frame, 'x',p.x.toFixed(1),'y',p.y.toFixed(1),'vy',p.vy.toFixed(2),'g',p.onGround,p.groundIdx,'curv',game.curvature.toFixed(2),'state',game.state);
    game.update(1/60);
    input.endFrame();
    maxX = Math.max(maxX, game.player.x);
    if (Math.abs(game.player.x - lastX) < 0.3 * K) stuck++; else stuck = 0;
    lastX = game.player.x;
    if (game.state === 'complete') return { levelIndex, ok: true, maxX, jumps, toggles, frames: frame };
  }
  return { levelIndex, ok: false, maxX, jumps, toggles, state: game.state };
}
for (let i = 0; i < 3; i++) console.log(JSON.stringify(run(i)));

function bossTest() {
  const input = new KZ.Input(canvas);
  const game = new KZ.Game(canvas, input, new KZ.AudioSystem());
  game.loadLevel(3);
  game.setState('play');
  game.curvature = 1; game.target = 1;
  let hold = 0;
  for (let frame = 0; frame < 3000; frame++) {
    const p = game.player, b = game.boss;
    b.fireTimer = 999; b.fireballs = [];
    input.down = {};
    input.down.KeyD = p.x < b.x - 4 * K;
    input.down.KeyA = p.x > b.x + 4 * K;
    if (p.onGround && Math.abs(p.x + 5 * K - b.x) < 45 * K && hold === 0) {
      input.pressed.Space = true; input.down.Space = true; hold = 16;
    }
    if (hold > 0) { input.down.Space = true; hold--; }
    game.update(1/60);
    input.endFrame();
    if (process.env.BOSSDEBUG && frame%30===0) console.log(frame,'px',p.x.toFixed(0),'py',p.y.toFixed(0),'bx',b.x.toFixed(0),'by',b.y.toFixed(0),'hp',b.hp,'curv',game.curvature.toFixed(2),'g',p.onGround,'hitcd',b.hitCooldown.toFixed(1));
    if (game.state === 'victory') return { boss: true, ok: true, frames: frame, hp: b.hp };
  }
  return { boss: true, ok: false, hp: game.boss.hp, state: game.state };
}
console.log(JSON.stringify(bossTest()));
