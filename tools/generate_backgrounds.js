/* Один чистый статичный фон 1920x1080: главное здание КФУ, колонны, портик, лестница.
   Генерирует assets/bg/kfu-main.png и src/bg-data.js (data URI для file://). */
const fs = require('fs'), path = require('path'), vm = require('vm');
let createCanvas;
try { ({ createCanvas } = require('@napi-rs/canvas')); }
catch (e) { ({ createCanvas } = require('/tmp/kztools/node_modules/@napi-rs/canvas')); }
const root = path.join(__dirname, '..');
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(root, 'src/art.js'), 'utf8'), { filename: 'src/art.js' });
const A = KZ.Art, C = A.colors;
const S = 4, W = 480, H = 270;

const canvas = createCanvas(W * S, H * S);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.scale(S, S);
const rect = (x, y, w, h, c) => A.rect(ctx, x, y, w, h, c);

// Небо: несколько спокойных античных тонов, без деталей.
rect(0, 0, W, 76, '#d9c9a6');
rect(0, 76, W, 54, '#cdb892');
rect(0, 130, W, 40, '#bfa780');
// Дальний план: мягкий холм и оливковые силуэты.
rect(0, 168, W, 30, '#a8916e');
for (let i = 0; i < 12; i++) {
  const x = i * 46 - 10;
  rect(x + 15, 160, 3, 12, '#796f52');
  rect(x + 10, 154, 13, 8, '#7d7b58');
}

// Главное здание: симметричный мраморный портик.
rect(70, 116, 340, 96, '#ddd0b2');        // основное тело
for (let i = 0; i < 7; i++) rect(76 + i * 48, 120 + (i % 2) * 9, 1, 74, '#d2c4a4');
rect(60, 106, 360, 12, '#efe4c6');        // антаблеман
rect(66, 100, 348, 4, C.gold);            // золотая линия фриза
A.pediment(ctx, 118, 70, 244, '#e9dfc4'); // фронтон
rect(222, 84, 36, 16, '#d6c7a3');         // ниша фронтона
rect(230, 88, 20, 10, '#b6a47e');
rect(238, 86, 4, 14, C.gold);             // лавровый знак
A.ornament(ctx, 80, 110, 320, C.goldDark, 0);

// Восемь колонн с базами, капителями и тонкими каннелюрами.
for (let i = 0; i < 8; i++) {
  const x = 92 + i * 40;
  rect(x - 5, 200, 14, 4, '#a99a7d');
  rect(x - 2, 118, 8, 82, '#f2e9d0');
  rect(x - 1, 122, 2, 74, '#cfc09f');
  rect(x + 3, 122, 2, 74, '#d8cbaa');
  rect(x - 4, 116, 12, 4, '#fbf3dd');
  // Тонкие линии видны только при высоком разрешении растра.
  rect(x, 124, 1, 70, '#e3d8bb');
  rect(x + 2, 124, 1, 70, '#e8ddc3');
}
// Центральная дверь и ступени.
rect(222, 152, 36, 48, '#6e573d');
rect(226, 156, 28, 44, '#a88655');
rect(238, 168, 4, 32, C.gold);
rect(214, 198, 52, 6, '#efe4c6');
rect(206, 204, 68, 6, '#ded0ae');
rect(196, 210, 88, 6, '#cbbc99');
rect(180, 216, 120, 6, '#b9aa88');

// Площадь — ровная, без узоров.
rect(0, 198, W, 24, '#9c8a6c');
rect(0, 222, W, 48, '#8c7c62');
rect(0, 236, W, 2, '#a39476');
rect(0, 254, W, 2, '#796b54');
for (let x = 24; x < W; x += 48) rect(x, 226, 1, 10, '#82735a');
for (let x = 0; x < W; x += 48) rect(x, 258, 1, 12, '#82735a');

const outDir = path.join(root, 'assets', 'bg');
fs.mkdirSync(outDir, { recursive: true });
for (const old of fs.readdirSync(outDir)) if (old.endsWith('.png')) fs.unlinkSync(path.join(outDir, old));
const file = path.join(outDir, 'kfu-main.png');
const png = canvas.toBuffer('image/png');
fs.writeFileSync(file, png);
const js = [
  '// Статичный фон 1920x1080 — главное здание КФУ, античный портик.',
  '// Собственная графика команды ИБ, сгенерирована tools/generate_backgrounds.js.',
  'window.BG_DATA = {',
  "  'main': 'data:image/png;base64," + png.toString('base64') + "'",
  '};'
].join('\n') + '\n';
fs.writeFileSync(path.join(root, 'src', 'bg-data.js'), js, 'utf8');
console.log('generated', file, png.length, 'bytes; bg-data.js', fs.statSync(path.join(root,'src/bg-data.js')).size);
