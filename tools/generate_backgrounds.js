/* Четыре статичных фона 1920x1080 — по одному на локацию Казани.
   Античная стилизация: агора Баумана, портик КФУ, храм звёзд обсерватории,
   древняя стена Кремля с башней Сююмбике. Генерирует PNG и src/bg-data.js. */
const fs = require('fs'), path = require('path'), vm = require('vm');
let createCanvas;
try { ({ createCanvas } = require('@napi-rs/canvas')); }
catch (e) { ({ createCanvas } = require('/tmp/kztools/node_modules/@napi-rs/canvas')); }
const root = path.join(__dirname, '..');
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(root, 'src/art.js'), 'utf8'), { filename: 'src/art.js' });
const A = KZ.Art, C = A.colors;
const S = 4, W = 480, H = 270;

function scene() {
  const canvas = createCanvas(W * S, H * S);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.scale(S, S);
  return { canvas: canvas, ctx: ctx };
}
const rect = (ctx, x, y, w, h, c) => A.rect(ctx, x, y, w, h, c);

function sky(ctx, bands) {
  for (let i = 0; i < bands.length; i++) {
    const h = Math.ceil(H / bands.length);
    rect(ctx, 0, i * h, W, h, bands[i]);
  }
}

function mosaicFloor(ctx, top, base, joint) {
  rect(ctx, 0, top, W, H - top, base);
  for (let y = top + 6; y < H; y += 12) {
    rect(ctx, 0, y, W, 1, joint);
    for (let x = ((y / 12) | 0) % 2 ? 0 : 12; x < W; x += 24) rect(ctx, x, y - 6, 1, 6, joint);
  }
}

// 1. Улица Баумана — античная агора с лавками, амфорами и чак-чаком.
function bauman(ctx) {
  sky(ctx, ['#d7bd97', '#cbb08a', '#bda17b', '#aa8d6c']);
  rect(ctx, 0, 128, W, 92, '#a3805f');
  for (let i = 0; i < 13; i++) {
    const bx = i * 40 - 8;
    const bh = 34 + (i * 13) % 22;
    rect(ctx, bx, 150 - bh, 38, bh, i % 2 ? '#b48a63' : '#c19a70');
    A.pediment(ctx, bx - 2, 138 - bh, 42, '#d8bd92');
    for (let c = 0; c < 3; c++) A.column(ctx, bx + 4 + c * 12, 152 - bh, bh - 14, '#e3d1ac');
  }
  // Ряд лавок: полосатые козырьки, прилавки, амфоры, подносы с чак-чаком.
  for (let i = 0; i < 7; i++) {
    const bx = i * 74 - 12;
    rect(ctx, bx, 126, 70, 8, '#efe0bd');
    for (let s = 0; s < 70; s += 14) rect(ctx, bx + s, 126, 7, 8, '#a85539');
    rect(ctx, bx + 2, 134, 66, 2, C.goldDark);
    A.column(ctx, bx + 5, 136, 70, C.marbleDim);
    A.column(ctx, bx + 62, 136, 70, C.marbleDim);
    rect(ctx, bx + 4, 168, 64, 24, '#4b3525');
    rect(ctx, bx + 6, 170, 60, 3, '#8c6746');
    rect(ctx, bx + 8, 174, 56, 1, C.goldDark);
    for (let a = 0; a < 3; a++) {
      const ax = bx + 12 + a * 19;
      rect(ctx, ax, 186, 7, 10, C.terracotta);
      rect(ctx, ax - 1, 195, 9, 2, C.bronzeDark);
      rect(ctx, ax + 1, 183, 5, 3, '#c9794d');
      rect(ctx, ax + 2, 180, 3, 3, C.goldLight);
    }
    rect(ctx, bx + 44, 180, 18, 4, '#d7b26c');
    rect(ctx, bx + 46, 178, 14, 2, '#f5e3ab');
    A.ornament(ctx, bx + 6, 160, 58, C.goldDark, 0);
  }
  mosaicFloor(ctx, 220, '#9a7c5b', '#6f573f');
  A.ornament(ctx, 0, 224, W, C.goldDark, 0);
  for (let x = 12; x < W; x += 44) {
    rect(ctx, x, 236, 2, 10, '#755b42');
    rect(ctx, x - 2, 234, 6, 2, C.bronze);
    A.halo(ctx, x, 236, 7, '#ffce6a', 0.28);
  }
}

// 2. Главное здание КФУ — мраморный портик, фронтон, лестница.
function kfu(ctx) {
  sky(ctx, ['#d9c9a6', '#cdb892', '#bfa780', '#ae9873']);
  rect(ctx, 0, 168, W, 30, '#a8916e');
  for (let i = 0; i < 12; i++) {
    const x = i * 46 - 10;
    rect(ctx, x + 15, 160, 3, 12, '#796f52');
    rect(ctx, x + 10, 154, 13, 8, '#7d7b58');
  }
  rect(ctx, 70, 116, 340, 96, '#ddd0b2');
  for (let i = 0; i < 7; i++) rect(ctx, 76 + i * 48, 120 + (i % 2) * 9, 1, 74, '#d2c4a4');
  rect(ctx, 60, 106, 360, 12, '#efe4c6');
  rect(ctx, 66, 100, 348, 4, C.gold);
  A.pediment(ctx, 118, 70, 244, '#e9dfc4');
  rect(ctx, 222, 84, 36, 16, '#d6c7a3');
  rect(ctx, 230, 88, 20, 10, '#b6a47e');
  rect(ctx, 238, 86, 4, 14, C.gold);
  for (let i = 0; i < 3; i++) {
    const bx = 176 + i * 70;
    rect(ctx, bx, 140, 16, 30, '#8e8168');
    rect(ctx, bx + 5, 143, 6, 8, C.marbleDark);
    rect(ctx, bx + 4, 152, 8, 12, C.marble);
    rect(ctx, bx + 2, 164, 12, 5, C.marbleDark);
  }
  A.ornament(ctx, 80, 110, 320, C.goldDark, 0);
  for (let i = 0; i < 8; i++) {
    const x = 92 + i * 40;
    rect(ctx, x - 5, 200, 14, 4, '#a99a7d');
    rect(ctx, x - 2, 118, 8, 82, '#f2e9d0');
    rect(ctx, x - 1, 122, 2, 74, '#cfc09f');
    rect(ctx, x + 3, 122, 2, 74, '#d8cbaa');
    rect(ctx, x, 124, 1, 70, '#e3d8bb');
    rect(ctx, x + 2, 124, 1, 70, '#e8ddc3');
    rect(ctx, x - 4, 116, 12, 4, '#fbf3dd');
  }
  rect(ctx, 222, 152, 36, 48, '#6e573d');
  rect(ctx, 226, 156, 28, 44, '#a88655');
  rect(ctx, 230, 160, 20, 8, '#c8a76c');
  rect(ctx, 238, 168, 4, 32, C.gold);
  rect(ctx, 214, 198, 52, 6, '#efe4c6');
  rect(ctx, 206, 204, 68, 6, '#ded0ae');
  rect(ctx, 196, 210, 88, 6, '#cbbc99');
  rect(ctx, 180, 216, 120, 6, '#b9aa88');
  rect(ctx, 0, 198, W, 24, '#9c8a6c');
  rect(ctx, 0, 222, W, 48, '#8c7c62');
  rect(ctx, 0, 236, W, 2, '#a39476');
  rect(ctx, 0, 254, W, 2, '#796b54');
  for (let x = 24; x < W; x += 48) rect(ctx, x, 226, 1, 10, '#82735a');
  for (let x = 0; x < W; x += 48) rect(ctx, x, 258, 1, 12, '#82735a');
}

// 3. Обсерватория Энгельгардта — храм звёзд с куполом и астролябием.
function observatory(ctx) {
  sky(ctx, ['#1d2743', '#26304d', '#2e3853', '#374056']);
  A.stars(ctx, 0, 0, 120, 6, 170);
  ctx.strokeStyle = 'rgba(217,177,92,0.32)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let k = 0; k < 5; k++) {
    const x = 54 + k * 92;
    ctx.moveTo(x, 40 + k * 8); ctx.lineTo(x + 34, 56 + k * 6); ctx.lineTo(x + 64, 34 + k * 10);
  }
  ctx.stroke();
  rect(ctx, 400, 22, 22, 22, C.goldLight);
  rect(ctx, 408, 19, 22, 25, '#26304d');
  rect(ctx, 0, 188, W, 82, '#273047');
  for (let h = 0; h < 8; h++) rect(ctx, h * 68, 181 + (h % 3) * 10, 70, 30, '#30394d');
  for (let tr = 0; tr < 10; tr++) {
    const x = tr * 58;
    rect(ctx, x, 196, 2, 12, '#4a4a35');
    rect(ctx, x - 5, 188, 12, 8, '#465239');
  }
  const dx = 250;
  rect(ctx, dx - 44, 154, 88, 64, C.marbleDim);
  for (let col = 0; col < 4; col++) A.column(ctx, dx - 38 + col * 23, 160, 52, C.marble);
  rect(ctx, dx - 50, 148, 100, 8, C.marble);
  A.pediment(ctx, dx - 36, 132, 72, C.marble);
  rect(ctx, dx - 30, 116, 60, 18, '#9c9a84');
  rect(ctx, dx - 20, 108, 40, 9, C.marble);
  rect(ctx, dx - 10, 101, 20, 8, C.marbleDim);
  rect(ctx, dx + 2, 112, 9, 28, '#1c2539');
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(dx, 141, 17, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(dx, 141, 11, 0, Math.PI * 2); ctx.stroke();
  rect(ctx, dx - 2, 139, 4, 4, C.goldLight);
  // Медный меридиан и звездная карта на каменной плите.
  ctx.beginPath(); ctx.arc(dx - 74, 214, 22, 0.2, Math.PI * 1.5); ctx.stroke();
  rect(ctx, dx - 76, 212, 4, 4, C.goldLight);
  rect(ctx, 20, 150, 76, 44, '#4a4a3f');
  rect(ctx, 23, 153, 70, 38, '#5b5947');
  ctx.beginPath(); ctx.moveTo(30, 162); ctx.lineTo(86, 156); ctx.moveTo(30, 176); ctx.lineTo(86, 170); ctx.stroke();
  rect(ctx, 56, 160, 2, 2, C.goldLight);
  rect(ctx, 30, 181, 42, 2, C.goldLight);
  for (let i = 0; i < 5; i++) rect(ctx, 32 + i * 9, 160 + (i % 2) * 12, 1, 1, C.goldLight);
  A.ornament(ctx, dx - 16, 172, 32, C.goldDark, 0);
  rect(ctx, 0, 232, W, 38, '#3d3c44');
  A.ornament(ctx, 0, 234, W, C.goldDark, 0);
}

// 4. Казанский Кремль — стена, башня Сююмбике, знамёна и факелы.
function kremlin(ctx) {
  sky(ctx, ['#2a2231', '#382838', '#46303b', '#4d363c']);
  A.stars(ctx, 0, 0, 44, 6, 100);
  rect(ctx, 406, 20, 28, 28, C.goldLight);
  rect(ctx, 414, 17, 24, 30, '#2a2231');
  rect(ctx, 0, 168, W, 102, '#8b6a50');
  for (let i = 0; i < 24; i++) {
    const bx = i * 22;
    rect(ctx, bx, 166, 13, 10, '#a07c5c');
    rect(ctx, bx + 2, 178, 19, 1, '#6e533d');
    rect(ctx, bx + 9, 192, 1, 14, '#6e533d');
  }
  A.ornament(ctx, 0, 210, W, C.goldDark, 0);
  rect(ctx, 118, 186, 52, 52, '#3c2b25');
  ctx.beginPath(); ctx.arc(144, 186, 26, Math.PI, 0); ctx.strokeStyle = '#a07c5c'; ctx.lineWidth = 3; ctx.stroke();
  rect(ctx, 140, 194, 8, 44, C.goldDark);
  const tx = 352;
  for (let tier = 0; tier < 5; tier++) {
    const w = 36 - tier * 4;
    rect(ctx, tx - w / 2, 158 - tier * 19, w, 18, tier % 2 ? C.marbleDim : C.marble);
    rect(ctx, tx - w / 2 - 3, 158 - tier * 19 - 3, w + 6, 3, C.gold);
    rect(ctx, tx - 3, 158 - tier * 19 + 6, 6, 10, '#4a3a2b');
    for (let cc = -1; cc <= 1; cc += 2) A.column(ctx, tx + cc * (w / 2 - 6), 158 - tier * 19 + 3, 14, C.marble);
  }
  rect(ctx, tx - 8, 52, 16, 12, C.olive);
  rect(ctx, tx + 4, 50, 5, 8, '#2a2231');
  for (let i = 0; i < 4; i++) {
    const bx = 26 + i * 22;
    rect(ctx, bx, 96, 14, 26, '#7e3340');
    rect(ctx, bx + 2, 101, 10, 8, '#a34950');
    A.dragonSilhouette(ctx, bx + 7, 110, 0.28, '#d9b15c');
  }
  for (let i = 0; i < 6; i++) {
    const fx = 40 + i * 82;
    rect(ctx, fx, 176, 3, 12, C.bronzeDark);
    rect(ctx, fx - 2, 172, 7, 5, C.gold);
    rect(ctx, fx, 170, 3, 3, C.goldLight);
    A.halo(ctx, fx, 172, 9, '#ffce6a', 0.3);
  }
  rect(ctx, 0, 232, W, 38, '#59402f');
  rect(ctx, 0, 236, W, 2, '#a39476');
  A.ornament(ctx, 0, 234, W, C.goldDark, 0);
}

const tasks = [
  ['bauman.png', bauman],
  ['kfu-main.png', kfu],
  ['observatory.png', observatory],
  ['kremlin.png', kremlin]
];
const keys = { 'bauman.png': 'bauman', 'kfu-main.png': 'main', 'observatory.png': 'observatory', 'kremlin.png': 'kremlin' };
const outDir = path.join(root, 'assets', 'bg');
fs.mkdirSync(outDir, { recursive: true });
for (const old of fs.readdirSync(outDir)) if (old.endsWith('.png')) fs.unlinkSync(path.join(outDir, old));
const entries = [];
for (const [file, draw] of tasks) {
  const s = scene();
  draw(s.ctx);
  const png = s.canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, file), png);
  entries.push("  '" + keys[file] + "': 'data:image/png;base64," + png.toString('base64') + "'");
  console.log('generated', file, png.length, 'bytes');
}
const js = [
  '// Статичные фоны 1920x1080: Баумана, главное здание КФУ, обсерватория, Кремль.',
  '// Собственная графика команды ИБ, сгенерирована tools/generate_backgrounds.js.',
  'window.BG_DATA = {',
  entries.join(',\n'),
  '};'
].join('\n') + '\n';
fs.writeFileSync(path.join(root, 'src', 'bg-data.js'), js, 'utf8');
console.log('bg-data.js', fs.statSync(path.join(root, 'src/bg-data.js')).size, 'bytes');
