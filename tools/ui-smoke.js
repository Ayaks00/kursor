/* Headless-проверка DOM-интерфейса без браузера. */
const fs = require('fs'), path = require('path'), vm = require('vm');
let createCanvas;
try { ({ createCanvas } = require('@napi-rs/canvas')); }
catch (e) { ({ createCanvas } = require('/tmp/kztools/node_modules/@napi-rs/canvas')); }
const root = path.join(__dirname, '..');

function El(id, tag) {
  this.id = id; this.tagName = (tag || 'div').toUpperCase();
  this.children = []; this.attrs = {}; this.textContent = '';
  this.listeners = {}; this.clientWidth = 1440;
  this.style = { setProperty() {}, width: '' };
  const set = new Set();
  this.classList = {
    add: c => set.add(c), remove: c => set.delete(c),
    contains: c => set.has(c),
    toggle: (c, on) => { if (on === undefined) on = !set.has(c); on ? set.add(c) : set.delete(c); return on; }
  };
  this._classes = set;
}
El.prototype.getAttribute = function (k) { return this.attrs[k] || null; };
El.prototype.setAttribute = function (k, v) { this.attrs[k] = v; };
El.prototype.addEventListener = function (ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); };
El.prototype.appendChild = function (child) { this.children.push(child); return child; };
El.prototype.querySelectorAll = function () { return screens; };
Object.defineProperty(El.prototype, 'innerHTML', { set() { this.children = []; }, get() { return ''; } });

const screenNames = ['menu','how','exit','intro','pause','death','complete','victory'];
const screens = screenNames.map(n => { const e = new El('screen-' + n); e.setAttribute('data-screen', n); return e; });
const ids = ['ui','stage','menu-list','pause-list','hud','toast','hud-level','hud-stats','curv-label',
  'curv-fill','boss-box','boss-fill','hint-box','hint-task','intro-title','intro-subtitle','intro-fact',
  'intro-task','complete-name','complete-time','complete-stats'];
const nodes = {};
ids.forEach(id => nodes[id] = new El(id));
nodes.stage.clientWidth = 1440;

const canvas = createCanvas(480, 270);
canvas.addEventListener = () => {};
canvas.getBoundingClientRect = () => ({ left:0, top:0, width:480, height:270 });

global.window = global;
global.addEventListener = () => {};
global.document = {
  getElementById: id => nodes[id] || (nodes[id] = new El(id)),
  createElement: tag => tag === 'canvas' ? createCanvas(480, 270) : new El('', tag),
  addEventListener: () => {}
};
const store = {};
global.localStorage = { getItem: k => store[k] || null, setItem: (k,v) => { store[k] = v; } };
global.Audio = class { play() {} };
global.AudioContext = undefined; global.webkitAudioContext = undefined;
global.performance = { now: () => 0 }; global.requestAnimationFrame = () => 0; global.setInterval = () => 0;

['src/sfx-data.js','src/audio.js','src/input.js','src/art.js','src/levels.js','src/game.js','src/ui.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }));

const game = new KZ.Game(canvas, new KZ.Input(canvas), new KZ.AudioSystem());
const ui = new KZ.UI(game);
game.ui = ui;
let errors = 0;
for (const state of ['menu','how','exit','intro','play','pause','death','complete','victory']) {
  if (state === 'intro' || state === 'play' || state === 'pause' || state === 'death' || state === 'complete') game.loadLevel(0);
  game.setState(state);
  game.stateTime = 3;
  try {
    game.render();
    const active = screenNames.filter(n => ui.screens[n].classList.contains('active'));
    console.log(state.padEnd(9), 'screen:', active.join(',') || '(none)', 'hud:', ui.hud.classList.contains('active'));
  } catch (e) { errors++; console.error('ERR', state, e.stack); }
}
game.setState('play');
game.hintTime = 10; game.curvature = 0.7; game.target = 1;
game.render();
console.log('HUD level:', nodes['hud-level'].textContent, '| stats:', nodes['hud-stats'].textContent,
            '| curv:', nodes['curv-label'].textContent, nodes['curv-fill'].style.width);
console.log('menu buttons:', ui.menuList.children.map(b => b.textContent).join(' / '));
console.log('pause buttons:', ui.pauseList.children.map(b => b.textContent).join(' / '));
console.log('errors:', errors);
process.exit(errors ? 1 : 0);
