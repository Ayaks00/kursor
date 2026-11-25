/* ПИКСЕЛЬНАЯ ГРАФИКА В АНТИЧНОМ СТИЛЕ.
   Вся графика рисуется примитивами на низкоразрешённом canvas: мрамор, терракота,
   бронза, лавр, греческий меандр, амфоры и античные колоннады. */
(function (KZ) {
  'use strict';

  var A = {};
  var C = {
    marble: '#e9dfc4', marbleDim: '#c8b998', marbleDark: '#9a8a6d',
    gold: '#d9b15c', goldLight: '#f5e3ab', goldDark: '#96703a',
    terracotta: '#b5643f', wine: '#5b2d36', olive: '#6e7a4d',
    night: '#1b2440', ink: '#2b241d', parchment: '#e7d6a8',
    bronze: '#9b7c4a', bronzeDark: '#5c4a30'
  };
  A.colors = C;

  A.rect = function (ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Заголовки — античный засечный шрифт, мелкий HUD — моноширинный для читаемости.
  A.font = function (size, bold, mono) {
    // Tahoma/Georgia есть на Windows, Chrome и Яндекс Браузере; DejaVu — запасной вариант на Linux.
    var family = (mono || size < 10)
      ? 'Tahoma, "Segoe UI", "DejaVu Sans", Arial, sans-serif'
      : 'Georgia, "Times New Roman", "DejaVu Serif", serif';
    return (bold ? 'bold ' : '') + size + 'px ' + family;
  };

  A.text = function (ctx, str, x, y, opt) {
    opt = opt || {};
    var size = opt.size || 8;
    ctx.font = A.font(size, opt.bold, opt.mono);
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = 'top';
    if (opt.shadow !== false) {
      ctx.fillStyle = opt.shadowColor || '#1b150f';
      ctx.fillText(str, Math.round(x) + 1, Math.round(y) + 1);
    }
    ctx.fillStyle = opt.color || C.parchment;
    ctx.fillText(str, Math.round(x), Math.round(y));
  };

  // Греческий меандр — орнамент фризов, флагов и платформ.
  A.ornament = function (ctx, x, y, w, color, phase) {
    ctx.save();
    ctx.fillStyle = color || C.gold;
    for (var i = 0; i < w; i += 8) {
      var xx = x + i;
      ctx.fillRect(Math.round(xx), Math.round(y), 6, 1);
      ctx.fillRect(Math.round(xx), Math.round(y + 1), 1, 4);
      ctx.fillRect(Math.round(xx + 1), Math.round(y + 4), 4, 1);
      ctx.fillRect(Math.round(xx + 4), Math.round(y + 2), 1, 2);
      if ((((i / 8) | 0) + (phase || 0)) % 2 === 0) ctx.fillRect(Math.round(xx + 6), Math.round(y + 5), 2, 1);
    }
    ctx.restore();
  };

  A.rosette = function (ctx, x, y, color) {
    A.rect(ctx, x - 2, y, 5, 1, color);
    A.rect(ctx, x - 2, y + 4, 5, 1, color);
    A.rect(ctx, x, y + 2, 1, 1, color);
    A.rect(ctx, x - 1, y + 1, 3, 3, color);
  };

  A.panel = function (ctx, x, y, w, h, fill, border) {
    fill = fill || '#2a2219';
    border = border || C.gold;
    A.rect(ctx, x, y, w, h, fill);
    A.rect(ctx, x + 2, y + 2, w - 4, 1, C.goldDark);
    A.rect(ctx, x + 2, y + h - 3, w - 4, 1, C.goldDark);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
    A.rosette(ctx, Math.round(x + 5), Math.round(y + 4), border);
    A.rosette(ctx, Math.round(x + w - 5), Math.round(y + h - 8), border);
  };

  A.stars = function (ctx, camX, time, count, top, bottom) {
    for (var i = 0; i < count; i++) {
      var sx = ((i * 137 + 41) % 900) - (camX * 0.08) % 900;
      var sy = top + ((i * 79) % Math.max(1, bottom - top));
      var tw = (Math.sin(time * 2 + i) > 0.55) ? C.goldLight : '#a99e7d';
      A.rect(ctx, sx, sy, 1, 1, tw);
      if (i % 17 === 0) {
        A.rect(ctx, sx - 1, sy, 3, 1, C.goldDark);
        A.rect(ctx, sx, sy - 1, 1, 3, C.goldDark);
      }
    }
  };

  A.column = function (ctx, x, y, h, color) {
    A.rect(ctx, x - 4, y + h - 3, 12, 4, C.marbleDark);
    A.rect(ctx, x - 2, y + 2, 8, h - 5, color || C.marble);
    A.rect(ctx, x - 3, y, 10, 3, C.marbleDim);
    A.rect(ctx, x - 1, y + 4, 1, h - 8, '#b6a887');
    A.rect(ctx, x + 4, y + 6, 1, h - 10, '#b6a887');
  };

  A.pediment = function (ctx, x, y, w, color) {
    var h = Math.min(18, Math.floor(w / 8));
    for (var i = 0; i < h; i++) {
      var inset = Math.floor(i * (w / 2) / h);
      A.rect(ctx, x + inset, y + i, w - inset * 2, 1, color);
    }
    A.rect(ctx, x - 3, y + h, w + 6, 3, color);
  };

  A.buildings = function (ctx, camX, baseY, color, win, parallax, seed, count) {
    var shift = camX * parallax;
    for (var i = 0; i < count; i++) {
      var bx = i * 42 - (shift % 42) - 42;
      var bh = 38 + ((i * 17 + seed) % 32);
      A.rect(ctx, bx, baseY - bh, 40, bh, color);
      A.pediment(ctx, bx - 2, baseY - bh - 10, 44, color);
      for (var c = 0; c < 3; c++) A.column(ctx, bx + 4 + c * 12, baseY - bh + 12, bh - 16, C.marbleDim);
      A.rect(ctx, bx + 2, baseY - bh + 6, 36, 3, C.goldDark);
      if (i % 2) A.rect(ctx, bx + 17, baseY - 5, 5, 5, win);
    }
  };

  A.bauman = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, pal.sky);
    A.rect(ctx, 0, 100, 480, 24, '#6b4234');
    A.rect(ctx, 0, 122, 480, 20, '#8a5740');
    A.buildings(ctx, camX, 196, pal.farBuild, pal.win, 0.18, 3, 18);
    A.buildings(ctx, camX, 216, pal.midBuild, pal.win, 0.42, 11, 16);

    // Античный рынок: терракотовые козырьки, драпировки, амфоры и вывески
    for (var i = 0; i < 8; i++) {
      var bx = i * 82 - (camX * 0.62) % 82 - 40;
      A.rect(ctx, bx, 126, 66, 10, C.marbleDim);
      for (var s = 0; s < 66; s += 11) A.rect(ctx, bx + s, 126, 6, 10, C.terracotta);
      A.rect(ctx, bx + 2, 137, 62, 3, C.goldDark);
      A.rect(ctx, bx + 5, 141, 56, 13, '#3a291e');
      A.rect(ctx, bx + 8, 145, i % 2 ? 36 : 28, 2, C.goldDark);
      A.column(ctx, bx + 6, 156, 52, C.marbleDim);
      A.column(ctx, bx + 56, 156, 52, C.marbleDim);
      // амфора у входа
      A.rect(ctx, bx + 28, 202, 6, 9, C.terracotta);
      A.rect(ctx, bx + 27, 210, 8, 6, '#cf8053');
      A.rect(ctx, bx + 29, 199, 4, 3, C.terracotta);
    }

    A.rect(ctx, 0, 224, 480, 46, pal.ground);
    A.ornament(ctx, -(camX % 8), 232, 496, C.goldDark, 0);
    for (var t = 0; t < 480; t += 24) {
      var tx = t - (camX % 24);
      A.rect(ctx, tx, 240, 22, 18, '#765338');
      A.rect(ctx, tx + 11, 240, 1, 18, '#59402c');
      A.rect(ctx, tx, 249, 22, 1, '#59402c');
    }
  };

  A.kfu = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#232b3e');
    A.stars(ctx, camX * 0.4, time, 36, 8, 104);
    // Античная академия: мраморный портик, фронтон, фриз, ниши с бюстами
    var ox = 190 - camX * 0.12;
    A.rect(ctx, ox - 136, 118, 272, 100, C.marbleDim);
    A.rect(ctx, ox - 144, 106, 288, 13, C.marble);
    A.pediment(ctx, ox - 108, 84, 216, C.marble);
    A.rect(ctx, ox - 112, 102, 224, 4, C.gold);
    A.ornament(ctx, ox - 104, 96, 208, C.goldDark, 0);
    for (var c = 0; c < 7; c++) A.column(ctx, ox - 118 + c * 40, 119, 86, C.marble);
    // скульптуры в нишах
    for (var b = 0; b < 3; b++) {
      var bx = ox - 78 + b * 78;
      A.rect(ctx, bx, 140, 16, 30, '#8e8168');
      A.rect(ctx, bx + 5, 143, 6, 8, C.marbleDark);
      A.rect(ctx, bx + 4, 152, 8, 12, C.marble);
      A.rect(ctx, bx + 2, 164, 12, 5, C.marbleDark);
    }
    A.rect(ctx, ox - 42, 88, 84, 2, C.goldDark);
    A.ornament(ctx, ox - 100, 108, 200, '#5a4a32', 0);
    // каменная таблица с чертежом параллельных
    A.rect(ctx, 20, 150, 76, 44, '#4a4a3f');
    A.rect(ctx, 23, 153, 70, 38, '#5b5947');
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, 162); ctx.lineTo(86, 156); ctx.moveTo(30, 176); ctx.lineTo(86, 170); ctx.stroke();
    A.rect(ctx, 56, 160, 2, 2, C.goldLight);
    A.rect(ctx, 29, 181, 40, 2, C.goldLight);
    A.rect(ctx, 0, 218, 480, 52, pal.ground || '#4c4030');
    A.ornament(ctx, 0, 221, 480, C.goldDark, 0);
  };

  A.observatory = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#151f3a');
    A.stars(ctx, camX, time, 84, 6, 168);
    // созвездия и небесная сфера
    ctx.strokeStyle = 'rgba(217,177,92,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var k = 0; k < 5; k++) {
      var sx = 60 + k * 90 - (camX * 0.05) % 90;
      ctx.moveTo(sx, 42 + k * 9); ctx.lineTo(sx + 34, 58 + k * 6); ctx.lineTo(sx + 60, 38 + k * 11);
    }
    ctx.stroke();
    var mx = 396 - camX * 0.04;
    A.rect(ctx, mx, 24, 22, 22, C.goldLight);
    A.rect(ctx, mx + 6, 21, 20, 25, '#151f3a');
    A.rect(ctx, 0, 188, 480, 82, '#273047');
    for (var h = 0; h < 8; h++) A.rect(ctx, h * 68 - (camX * 0.15) % 68, 181 + (h % 3) * 10, 70, 30, '#30394d');
    // каменная башня с бронзовым астролябием
    var dx = 250 - camX * 0.24;
    A.rect(ctx, dx - 44, 154, 88, 64, C.marbleDim);
    for (var col = 0; col < 4; col++) A.column(ctx, dx - 38 + col * 23, 160, 52, C.marble);
    A.rect(ctx, dx - 50, 148, 100, 8, C.marble);
    A.pediment(ctx, dx - 36, 132, 72, C.marble);
    // купол и прорезь телескопа
    A.rect(ctx, dx - 30, 116, 60, 18, '#9c9a84');
    A.rect(ctx, dx - 20, 108, 40, 9, C.marble);
    A.rect(ctx, dx - 10, 101, 20, 8, C.marbleDim);
    A.rect(ctx, dx + 2, 112, 9, 28, '#1c2539');
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(dx, 141, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(dx, 141, 11, 0, Math.PI * 2); ctx.stroke();
    A.rect(ctx, dx - 2, 139, 4, 4, C.goldLight);
    A.ornament(ctx, dx - 16, 172, 32, C.goldDark, 0);
    // оливковые рощи на горизонте
    for (var tr = 0; tr < 10; tr++) {
      var tx = tr * 58 - (camX * 0.3) % 58;
      A.rect(ctx, tx, 196, 2, 12, '#4a4a35');
      A.rect(ctx, tx - 5, 188, 12, 8, '#465239');
    }
  };

  A.kremlin = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#2a2231');
    A.stars(ctx, camX, time, 40, 8, 100);
    A.rect(ctx, 406 - camX * 0.03, 20, 28, 28, C.goldLight);
    A.rect(ctx, 414 - camX * 0.03, 17, 24, 30, '#2a2231');
    // древняя стена из крупных камней с зубцами
    A.rect(ctx, 0, 168, 480, 102, '#8b6a50');
    for (var i = 0; i < 24; i++) {
      var bx = i * 22 - (camX * 0.35) % 22;
      A.rect(ctx, bx, 166, 13, 10, '#a07c5c');
      A.rect(ctx, bx + 2, 178, 19, 1, '#6e533d');
      A.rect(ctx, bx + 9, 192, 1, 14, '#6e533d');
    }
    A.ornament(ctx, 0, 210, 480, C.goldDark, 0);
    // античная сторожевая башня (силуэт Сююмбике)
    var tx = 352 - camX * 0.2;
    for (var tier = 0; tier < 5; tier++) {
      var w = 36 - tier * 4;
      A.rect(ctx, tx - w / 2, 158 - tier * 19, w, 18, tier % 2 ? C.marbleDim : C.marble);
      A.rect(ctx, tx - w / 2 - 3, 158 - tier * 19 - 3, w + 6, 3, C.gold);
      A.rect(ctx, tx - 3, 158 - tier * 19 + 6, 6, 10, '#4a3a2b');
      for (var cc = -1; cc <= 1; cc += 2) A.column(ctx, tx + cc * (w / 2 - 6), 158 - tier * 19 + 3, 14, C.marble);
    }
    A.rect(ctx, tx - 8, 52, 16, 12, C.olive);
    A.rect(ctx, tx + 4, 50, 5, 8, '#2a2231');
    // Зилант в небе — древний дракон с крыльями
    A.dragonSilhouette(ctx, 92 - camX * 0.08, 60 + Math.sin(time * 1.4) * 8, 1.2, '#6d4a52');
    A.rect(ctx, 0, 232, 480, 38, '#59402f');
    A.ornament(ctx, 0, 234, 480, C.goldDark, 0);
  };

  A.dragonSilhouette = function (ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    A.rect(ctx, -18, -10, 18, 6, color);
    A.rect(ctx, -24, -16, 8, 8, color);
    A.rect(ctx, 0, 0, 26, 10, color);
    A.rect(ctx, 24, 2, 10, 7, color);
    A.rect(ctx, -10, 10, 7, 9, color);
    A.rect(ctx, 5, 10, 7, 9, color);
    A.rect(ctx, 26, 1, 2, 2, C.goldLight);
    ctx.restore();
  };

  // Статичная фоновая картинка (заранее сгенерированный PNG), а не анимация.
  var bgImages = {};
  function bgImage(name) {
    if (!(name in bgImages)) {
      var data = window.BG_DATA && window.BG_DATA[name];
      if (!data || typeof Image === 'undefined') { bgImages[name] = null; return null; }
      var im = new Image();
      im.src = data;
      bgImages[name] = im;
    }
    return bgImages[name];
  }

  A.backdrop = function (ctx, level, camX, time) {
    var im = bgImage(level.bg);
    if (im && im.complete && (im.naturalWidth || im.width)) {
      ctx.drawImage(im, 0, 0, 480, 270);
      return;
    }
    // Пока картинка грузится (и в headless-инструментах) — процедурный запасной вариант.
    var pal = level.palette;
    if (level.bg === 'bauman') A.bauman(ctx, camX, time, pal);
    else if (level.bg === 'kfu') A.kfu(ctx, camX, time, pal);
    else if (level.bg === 'observatory') A.observatory(ctx, camX, time, pal);
    else A.kremlin(ctx, camX, time, pal);
  };

  A.platform = function (ctx, a, b, style, alpha, phase) {
    ctx.save();
    ctx.globalAlpha = alpha;
    var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1];
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var thick = 6;
    var base = style === 'wood' ? '#8a6a48' : style === 'metal' ? C.bronze : C.marbleDark;
    var top = style === 'wood' ? '#b18a5c' : style === 'metal' ? '#d0ac64' : C.marble;
    var dark = style === 'wood' ? '#5c432f' : style === 'metal' ? C.bronzeDark : '#786b52';
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + nx * thick, y2 + ny * thick);
    ctx.lineTo(x1 + nx * thick, y1 + ny * thick);
    ctx.closePath();
    ctx.fillStyle = base; ctx.fill();
    ctx.strokeStyle = top; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.lineTo(x2, y2 - 1); ctx.stroke();
    for (var d = 10; d < len; d += 14) {
      var px = x1 + dx * (d / len) + nx * 3;
      var py = y1 + dy * (d / len) + ny * 3;
      A.rect(ctx, px, py, 1, 4, dark);
    }
    if (style === 'metal') A.ornament(ctx, x1 + 4, y1 + 2, Math.min(24, len - 8), C.goldLight, phase);
    ctx.restore();
  };

  A.player = function (ctx, p, time, curved) {
    var x = Math.round(p.x), y = Math.round(p.y);
    var run = p.onGround && Math.abs(p.vx) > 0.2 ? Math.sin(time * 14) : 0;
    var chiton = curved ? C.gold : C.parchment;
    var cloak = curved ? C.olive : C.terracotta;
    // Плащ, хитон, сандалии, лавровый венок и свиток
    A.rect(ctx, x - 1, y + 4, 12, 7, cloak);
    A.rect(ctx, x + 1, y + 6, 8, 4, chiton);
    A.rect(ctx, x - 3, y + 5, 3, 6, C.bronzeDark);
    A.rect(ctx, x + (run > 0 ? 1 : 0), y + 11, 3, 3, C.ink);
    A.rect(ctx, x + 6 - (run > 0 ? 1 : 0), y + 11, 3, 3, C.ink);
    A.rect(ctx, x + 1, y, 9, 6, '#d9b58a');
    A.rect(ctx, x + 0, y - 2, 11, 3, '#7e5b3e');
    A.rect(ctx, x + 1, y - 3, 3, 2, C.olive);
    A.rect(ctx, x + 6, y - 3, 3, 2, C.olive);
    A.rect(ctx, x + 2, y + 2, 3, 1, C.ink);
    A.rect(ctx, x + 6, y + 2, 3, 1, C.ink);
    A.rect(ctx, x + 5, y + 2, 1, 2, '#a37d59');
    if (curved) A.rect(ctx, x + 8, y - 1, 2, 2, C.goldLight);
  };

  A.pickup = function (ctx, item, time) {
    var bob = Math.sin(time * 3 + item.x) * 2;
    var x = Math.round(item.x), y = Math.round(item.y + bob);
    if (item.type === 'chakchak') {
      // амфора с чак-чаком
      A.rect(ctx, x - 3, y - 3, 7, 6, C.terracotta);
      A.rect(ctx, x - 4, y - 5, 9, 3, '#cf8053');
      A.rect(ctx, x - 2, y - 6, 5, 2, C.terracotta);
      A.rect(ctx, x - 4, y + 3, 9, 2, C.bronzeDark);
      A.rect(ctx, x - 1, y - 1, 3, 3, C.goldLight);
      A.rect(ctx, x - 5, y - 2, 2, 3, C.bronzeDark);
      A.rect(ctx, x + 4, y - 2, 2, 3, C.bronzeDark);
    } else {
      // пергаментный свиток
      A.rect(ctx, x - 3, y - 4, 7, 8, C.parchment);
      A.rect(ctx, x - 4, y - 5, 9, 2, C.marble);
      A.rect(ctx, x - 4, y + 3, 9, 2, C.marble);
      A.rect(ctx, x - 1, y - 2, 1, 4, '#8a5a3c');
      A.rect(ctx, x + 1, y - 2, 1, 4, '#8a5a3c');
      A.rect(ctx, x - 1, y, 3, 1, '#8a5a3c');
    }
  };

  A.flag = function (ctx, cp, time) {
    var x = Math.round(cp.x), y = Math.round(cp.y);
    A.rect(ctx, x, y - 22, 2, 22, C.bronzeDark);
    A.rect(ctx, x - 2, y - 22, 7, 2, C.gold);
    var c = cp.active ? C.gold : '#9a8c6c';
    A.rect(ctx, x + 2, y - 20, 13, 10, c);
    A.ornament(ctx, x + 3, y - 18, 11, '#6b3f28', 0);
    A.rect(ctx, x + 2, y - 10, 13, 2, C.goldDark);
    if (cp.active) {
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 5);
      A.rect(ctx, x - 4, y - 24, 22, 16, C.goldLight);
      ctx.globalAlpha = 1;
    }
  };

  A.spikes = function (ctx, h) {
    var x = Math.round(h.x), y = Math.round(h.y);
    // антические калтропы из бронзы
    for (var i = 0; i < h.w; i += 7) {
      for (var k = 0; k < 5; k++) {
        A.rect(ctx, x + i + (4 - k) / 2, y + k, Math.max(1, k + 1), 1, k % 2 ? C.bronze : C.marbleDim);
      }
    }
    A.rect(ctx, x, y + 5, h.w, 2, C.bronzeDark);
  };

  A.orb = function (ctx, o, time) {
    var x = Math.round(o.x), y = Math.round(o.y);
    var r = o.r || 7;
    ctx.globalAlpha = 0.22;
    A.rect(ctx, x - r - 3, y - r - 3, r * 2 + 6, r * 2 + 6, '#d9b15c');
    ctx.globalAlpha = 1;
    A.rect(ctx, x - r, y - r + 2, r * 2, r * 2 - 4, '#4a3a2b');
    A.rect(ctx, x - r + 2, y - r, r * 2 - 4, r * 2, '#4a3a2b');
    A.rect(ctx, x - r + 3, y - r + 2, 3, 3, C.goldLight);
    A.rect(ctx, x + r - 5, y + r - 6, 2, 2, C.gold);
  };

  A.door = function (ctx, d, time, active) {
    var x = Math.round(d.x), y = Math.round(d.y);
    A.rect(ctx, x - 4, y - 4, 24, 3, C.marble);
    A.column(ctx, x - 4, y, 32, C.marbleDim);
    A.column(ctx, x + 18, y, 32, C.marbleDim);
    A.rect(ctx, x - 3, y - 8, 22, 4, C.marble);
    A.ornament(ctx, x - 1, y - 7, 18, C.goldDark, 0);
    A.rect(ctx, x, y, 16, 30, active ? '#e8c46c' : '#5b4b38');
    A.rect(ctx, x + 3, y + 3, 10, 24, active ? C.goldLight : '#776449');
    A.rect(ctx, x + 5, y + 15, 6, 2, '#6c4a24');
    A.rect(ctx, x + 7, y + 12, 2, 8, '#6c4a24');
  };

  A.dragon = function (ctx, b, time) {
    var x = Math.round(b.x), y = Math.round(b.y);
    var flap = Math.sin(time * 8) * 5;
    // бронзовая чешуя, кожаные крылья, золотой гребень
    A.rect(ctx, x - 26, y - 12 + flap, 18, 8, '#6e5a3d');
    A.rect(ctx, x + 8, y - 12 - flap, 18, 8, '#6e5a3d');
    A.rect(ctx, x - 14, y - 8, 28, 17, '#6f8b5e');
    A.rect(ctx, x + 12, y - 10, 13, 12, '#7fa06b');
    A.rect(ctx, x + 23, y - 6, 6, 5, '#92b27a');
    A.rect(ctx, x + 10, y - 15, 4, 6, C.goldLight);
    A.rect(ctx, x + 18, y - 15, 4, 6, C.goldLight);
    A.rect(ctx, x + 17, y - 7, 3, 3, b.flash > 0 ? '#ffffff' : C.goldLight);
    A.rect(ctx, x + 24, y - 3, 2, 2, C.ink);
    A.rect(ctx, x - 6, y + 9, 5, 9, '#567049');
    A.rect(ctx, x + 5, y + 9, 5, 9, '#567049');
    for (var i = 0; i < 4; i++) A.rect(ctx, x - 10 + i * 6, y - 2, 2, 2, C.gold);
  };

  A.fireball = function (ctx, f, time) {
    var x = Math.round(f.x), y = Math.round(f.y);
    A.rect(ctx, x - 3, y - 3, 6, 6, C.terracotta);
    A.rect(ctx, x - 2, y - 4, 4, 8, C.gold);
    A.rect(ctx, x - 1, y - 1, 2, 2, C.goldLight);
    if (((time * 20) | 0) % 2) A.rect(ctx, x - 6, y + 2, 3, 2, '#8a4a2b');
  };

  A.idealPoint = function (ctx, p, time, strength) {
    var x = Math.round(p.x), y = Math.round(p.y);
    var r = 5 + Math.sin(time * 4) * 2 + strength * 5;
    ctx.strokeStyle = 'rgba(245,227,171,' + (0.28 + strength * 0.5) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke();
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4;
      A.rect(ctx, x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8), 2, 2, C.goldLight);
    }
    A.rect(ctx, x - 1, y - 1, 3, 3, C.goldLight);
    A.rect(ctx, x + 10, y - 4, 26, 1, C.goldLight);
  };

  A.convergenceGuides = function (ctx, level, strength, phase) {
    if (!level.guides || strength < 0.05) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, strength) * 0.72;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -(phase * 8) % 8;
    for (var i = 0; i < level.guides.length; i++) {
      var g = level.guides[i];
      ctx.beginPath();
      ctx.moveTo(g[0], g[1]);
      ctx.lineTo(level.vanish.x, level.vanish.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  };

  KZ.Art = A;
})(window.KZ = window.KZ || {});
