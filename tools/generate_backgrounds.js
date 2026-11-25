/* Генерация статичных фоновых PNG (960×540) из процедурной пиксельной графики.
   Результат: assets/bg/*.png + src/bg-data.js (data URI для запуска с file://). */
const fs = require('fs'), path = require('path'), vm = require('vm');
let createCanvas;
try { ({ createCanvas } = require('@napi-rs/canvas')); }
catch (e) { ({ createCanvas } = require('/tmp/kztools/node_modules/@napi-rs/canvas')); }
const root = path.join(__dirname, '..');
global.window = global;
['src/art.js', 'src/levels.js'].forEach(f =>
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }));

const outDir = path.join(root, 'assets', 'bg');
fs.mkdirSync(outDir, { recursive: true });
const S = 2, W = 480, H = 270;
const entries = [];

for (const lv of KZ.LEVELS) {
  const canvas = createCanvas(W * S, H * S);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.scale(S, S);
  KZ.Art.backdrop(ctx, lv, 0, 0);
  const file = path.join(outDir, lv.bg + '.png');
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  const data = 'data:image/png;base64,' + canvas.toBuffer('image/png').toString('base64');
  entries.push(`  ${JSON.stringify(lv.bg)}: '${data}'`);
  console.log('generated', path.basename(file), fs.statSync(file).size, 'bytes');
}

const js = [
  '// Статичные фоновые изображения 960x540, сгенерированы tools/generate_backgrounds.js.',
  '// Собственная графика команды ИБ, античная стилизация; см. CREDITS.md.',
  'window.BG_DATA = {',
  entries.join(',\n'),
  '};'
].join('\n') + '\n';
fs.writeFileSync(path.join(root, 'src', 'bg-data.js'), js, 'utf8');
console.log('wrote src/bg-data.js', fs.statSync(path.join(root, 'src', 'bg-data.js')).size, 'bytes');
