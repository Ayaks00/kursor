/* PIPIXEL-ART: вся графика рисуется примитивами на низкоразрешённом canvas. */
(function (KZ) {
  'use strict';

  var A = {};

  A.rect = function (ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  A.text = function (ctx, str, x, y, opt) {
    opt = opt || {};
    var size = opt.size || 8;
    ctx.font = (opt.bold ? 'bold ' : '') + size + 'px "DejaVu Sans Mono", "Courier New", monospace';
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = 'top';
    if (opt.shadow !== false) {
      ctx.fillStyle = opt.shadowColor || '#080812';
      ctx.fillText(str, Math.round(x) + 1, Math.round(y) + 1);
    }
    ctx.fillStyle = opt.color || '#f2e8c9';
    ctx.fillText(str, Math.round(x), Math.round(y));
  };

  A.panel = function (ctx, x, y, w, h, fill, border) {
    A.rect(ctx, x, y, w, h, fill || '#17162c');
    ctx.strokeStyle = border || '#c8a45c';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
    A.rect(ctx, x + 2, y + 2, 3, 3, border || '#c8a45c');
    A.rect(ctx, x + w - 5, y + h - 5, 3, 3, border || '#c8a45c');
  };

  // Татарский орнамент: ромбы и «бегущая» волна — на флагах, арках и платформах.
  A.ornament = function (ctx, x, y, w, color, phase) {
    phase = phase || 0;
    for (var i = 0; i < w; i += 6) {
      var xx = x + i;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(xx + 2), Math.round(y), 2, 2);
      ctx.fillRect(Math.round(xx), Math.round(y + 2), 2, 2);
      ctx.fillRect(Math.round(xx + 4), Math.round(y + 2), 2, 2);
      ctx.fillRect(Math.round(xx + 2), Math.round(y + 4), 2, 2);
      if (((i / 6 + phase) | 0) % 2 === 0) ctx.fillRect(Math.round(xx + 3), Math.round(y + 6), 2, 2);
    }
  };

  A.stars = function (ctx, camX, time, count, top, bottom) {
    for (var i = 0; i < count; i++) {
      var sx = ((i * 137 + 41) % 900) - (camX * 0.08) % 900;
      var sy = top + ((i * 79) % Math.max(1, bottom - top));
      var tw = (Math.sin(time * 2 + i) > 0.55) ? '#fff7d0' : '#8f93c9';
      A.rect(ctx, sx, sy, 1, 1, tw);
    }
  };

  A.buildings = function (ctx, camX, baseY, color, win, parallax, seed, count) {
    var shift = camX * parallax;
    for (var i = 0; i < count; i++) {
      var bx = i * 34 - (shift % 34) - 34;
      var bh = 34 + ((i * 17 + seed) % 30);
      A.rect(ctx, bx, baseY - bh, 32, bh, color);
      for (var wy = baseY - bh + 6; wy < baseY - 4; wy += 9) {
        for (var wx = bx + 4; wx < bx + 28; wx += 8) {
          if (((wx + wy + i) | 0) % 3 !== 0) A.rect(ctx, wx, wy, 3, 4, win);
        }
      }
    }
  };

  A.bauman = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, pal.sky);
    A.rect(ctx, 0, 150, 480, 120, pal.far);
    A.buildings(ctx, camX, 196, pal.farBuild, pal.win, 0.18, 3, 18);
    A.buildings(ctx, camX, 216, pal.midBuild, pal.win, 0.42, 11, 16);

    // полосатые козырьки лавок и вывески Баумана
    for (var i = 0; i < 8; i++) {
      var bx = i * 82 - (camX * 0.62) % 82 - 40;
      A.rect(ctx, bx, 128, 66, 9, '#f0e4c0');
      for (var s = 0; s < 66; s += 10) A.rect(ctx, bx + s, 128, 5, 9, '#a9473c');
      A.rect(ctx, bx + 4, 140, 58, 12, '#3b2d35');
      A.text(ctx, i % 2 ? 'ЧАК-ЧАК' : 'СУВЕНИРЫ', bx + 6, 142, { size: 6, color: '#f0d494', shadow: false });
      A.rect(ctx, bx + 8, 156, 3, 44, '#4b3a34');
      A.rect(ctx, bx + 5, 156, 9, 3, '#5e4a40');
    }

    A.rect(ctx, 0, 224, 480, 46, pal.ground);
    for (var t = 0; t < 480; t += 16) {
      A.rect(ctx, t - (camX % 16), 230, 8, 2, pal.groundLine);
    }
  };

  A.kfu = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#202344');
    A.stars(ctx, camX * 0.4, time, 45, 10, 120);
    // Главное здание КФУ: портик, колонны, фронтон, ротонда
    var ox = 190 - camX * 0.12;
    A.rect(ctx, ox - 130, 118, 260, 100, '#d9cba7');
    A.rect(ctx, ox - 140, 104, 280, 14, '#eee1bd');
    for (var c = 0; c < 7; c++) {
      var cx = ox - 118 + c * 40;
      A.rect(ctx, cx, 118, 9, 86, '#f3ead1');
      A.rect(ctx, cx - 2, 202, 13, 4, '#b9a987');
    }
    A.rect(ctx, ox - 150, 94, 300, 12, '#f2e4c1');
    for (var p = 0; p < 10; p++) A.rect(ctx, ox - 145 + p * 30, 78, 18, 16, '#efe0b9');
    A.rect(ctx, ox - 12, 58, 24, 24, '#e7d9b4');
    A.rect(ctx, ox - 16, 54, 32, 4, '#f4e7c4');
    A.rect(ctx, ox - 4, 48, 8, 6, '#c8a45c');
    A.text(ctx, 'КАЗАНСКИЙ УНИВЕРСИТЕТ', ox - 96, 110, { size: 7, color: '#5b4b37', shadow: false });
    // доска с формулой параллельных
    A.rect(ctx, 20, 150, 72, 42, '#243c38');
    A.rect(ctx, 22, 152, 68, 38, '#2c4a44');
    A.text(ctx, 'a // b ?', 29, 161, { size: 7, color: '#b9e6c9', shadow: false });
    A.text(ctx, 'a ∩ b !', 29, 174, { size: 7, color: '#f0c674', shadow: false });
    A.rect(ctx, 0, 218, 480, 52, pal.ground || '#3c3550');
  };

  A.observatory = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#121936');
    A.stars(ctx, camX, time, 90, 6, 170);
    var mx = 396 - camX * 0.04;
    A.rect(ctx, mx, 24, 22, 22, '#e9e5c8');
    A.rect(ctx, mx + 5, 21, 17, 25, '#121936');
    // холмы
    A.rect(ctx, 0, 188, 480, 82, '#1b2548');
    for (var h = 0; h < 8; h++) A.rect(ctx, h * 68 - (camX * 0.15) % 68, 181 + (h % 3) * 10, 70, 30, '#222e56');
    // купол обсерватории
    var dx = 250 - camX * 0.24;
    A.rect(ctx, dx - 44, 156, 88, 62, '#c8c4ac');
    A.rect(ctx, dx - 50, 148, 100, 10, '#e4dfc5');
    A.rect(ctx, dx - 36, 128, 72, 22, '#aeb6bc');
    A.rect(ctx, dx - 22, 116, 44, 14, '#c8d0d4');
    A.rect(ctx, dx - 6, 106, 12, 12, '#e0e6e6');
    A.rect(ctx, dx + 4, 120, 8, 30, '#1b2233');
    A.rect(ctx, dx + 2, 146, 12, 6, '#34435a');
    A.text(ctx, 'АОЭ', dx - 8, 172, { size: 7, color: '#4a4a44', shadow: false });
  };

  A.kremlin = function (ctx, camX, time, pal) {
    A.rect(ctx, 0, 0, 480, 270, '#2a1930');
    A.stars(ctx, camX, time, 44, 8, 100);
    A.rect(ctx, 408 - camX * 0.03, 20, 28, 28, '#f4e8bd');
    A.rect(ctx, 414 - camX * 0.03, 17, 26, 31, '#2a1930');
    // стена Кремля
    A.rect(ctx, 0, 168, 480, 102, '#8f3f35');
    for (var i = 0; i < 24; i++) {
      var bx = i * 22 - (camX * 0.35) % 22;
      A.rect(ctx, bx, 166, 13, 10, '#a14b3d');
    }
    // башня Сююмбике — семь ярусов, шатёр и полумесяц
    var tx = 352 - camX * 0.2;
    for (var tier = 0; tier < 5; tier++) {
      var w = 34 - tier * 4;
      A.rect(ctx, tx - w / 2, 158 - tier * 19, w, 18, tier % 2 ? '#c66b46' : '#d98457');
      A.rect(ctx, tx - w / 2 - 3, 158 - tier * 19 - 3, w + 6, 3, '#e8b06a');
    }
    A.rect(ctx, tx - 7, 52, 14, 12, '#4a7d63');
    A.rect(ctx, tx + 3, 50, 5, 8, '#2a1930');
    // Зилант в небе
    A.dragonSilhouette(ctx, 92 - camX * 0.08, 62 + Math.sin(time * 1.4) * 8, 1.1, '#684052');
    A.rect(ctx, 0, 232, 480, 38, '#4b2f30');
  };

  A.dragonSilhouette = function (ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    A.rect(ctx, 0, 0, 24, 10, color);
    A.rect(ctx, 22, 2, 9, 7, color);
    A.rect(ctx, -12, -3, 12, 5, color);
    A.rect(ctx, -18, -9, 8, 6, color);
    A.rect(ctx, -4, -9, 10, 7, color);
    A.rect(ctx, 2, 10, 6, 8, color);
    A.rect(ctx, 26, 1, 2, 2, '#f2c663');
    ctx.restore();
  };

  A.backdrop = function (ctx, level, camX, time) {
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
    var thick = style === 'metal' ? 5 : 6;
    var base = style === 'wood' ? '#8b5a3c' : style === 'metal' ? '#5d6f82' : '#c9b78d';
    var top = style === 'wood' ? '#b98255' : style === 'metal' ? '#9db6c8' : '#f0dfae';
    var dark = style === 'wood' ? '#5d3b2c' : style === 'metal' ? '#344759' : '#8d7b5c';
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + nx * thick, y2 + ny * thick);
    ctx.lineTo(x1 + nx * thick, y1 + ny * thick);
    ctx.closePath();
    ctx.fillStyle = base; ctx.fill();
    ctx.strokeStyle = top; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.lineTo(x2, y2 - 1); ctx.stroke();
    for (var d = 8; d < len; d += 12) {
      var px = x1 + dx * (d / len) + nx * 3;
      var py = y1 + dy * (d / len) + ny * 3;
      A.rect(ctx, px, py, 2, 2, dark);
    }
    if (style === 'metal') A.ornament(ctx, x1 + 4, y1 + 2, Math.min(24, len - 8), '#d7e7f2', phase);
    ctx.restore();
  };

  A.player = function (ctx, p, time, curved) {
    var x = Math.round(p.x), y = Math.round(p.y);
    var run = p.onGround && Math.abs(p.vx) > 0.2 ? Math.sin(time * 14) : 0;
    var shirt = curved ? '#52c6d8' : '#d9a04a';
    var coat = curved ? '#2a7d9a' : '#8c4a35';
    // рюкзак, тело, руки, ноги, голова, очки Лобачевского
    A.rect(ctx, x - 1, y + 4, 12, 7, coat);
    A.rect(ctx, x - 3, y + 5, 3, 5, '#6b432c');
    A.rect(ctx, x + 1, y + 6, 8, 4, shirt);
    A.rect(ctx, x + (run > 0 ? 1 : 0), y + 11, 3, 3, '#263247');
    A.rect(ctx, x + 6 - (run > 0 ? 1 : 0), y + 11, 3, 3, '#263247');
    A.rect(ctx, x + 1, y, 9, 6, '#e8bf91');
    A.rect(ctx, x + 0, y - 2, 11, 3, '#3d3a58');
    A.rect(ctx, x + 2, y + 2, 3, 2, '#1d2333');
    A.rect(ctx, x + 6, y + 2, 3, 2, '#1d2333');
    A.rect(ctx, x + 5, y + 2, 1, 1, '#1d2333');
    A.rect(ctx, x + 2, y + 1, 2, 1, '#e9f3ff');
    if (curved) A.rect(ctx, x + 8, y - 1, 2, 2, '#d8fbff');
  };

  A.pickup = function (ctx, item, time) {
    var bob = Math.sin(time * 3 + item.x) * 2;
    var x = Math.round(item.x), y = Math.round(item.y + bob);
    if (item.type === 'chakchak') {
      A.rect(ctx, x - 3, y - 3, 7, 6, '#c9873e');
      A.rect(ctx, x - 2, y - 4, 5, 2, '#f2d07b');
      A.rect(ctx, x - 1, y - 2, 2, 2, '#fff0b0');
      A.rect(ctx, x + 1, y + 1, 2, 2, '#8d5527');
    } else {
      A.rect(ctx, x - 3, y - 4, 7, 8, '#f2e2b3');
      A.rect(ctx, x - 2, y - 3, 5, 6, '#fff6d8');
      A.rect(ctx, x - 1, y - 2, 1, 4, '#b4713e');
      A.rect(ctx, x + 1, y - 2, 1, 4, '#b4713e');
      A.rect(ctx, x - 1, y + 1, 3, 1, '#b4713e');
    }
  };

  A.flag = function (ctx, cp, time) {
    var x = Math.round(cp.x), y = Math.round(cp.y);
    A.rect(ctx, x, y - 20, 2, 20, '#d8c79a');
    var c = cp.active ? '#f0c45c' : '#9c8e6b';
    A.rect(ctx, x + 2, y - 19, 12, 8, c);
    A.ornament(ctx, x + 2, y - 18, 10, cp.active ? '#7c3f2f' : '#5c5341', 0);
    if (cp.active) {
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(time * 5);
      A.rect(ctx, x - 5, y - 21, 20, 12, '#f5d98a');
      ctx.globalAlpha = 1;
    }
  };

  A.spikes = function (ctx, h) {
    var x = Math.round(h.x), y = Math.round(h.y);
    for (var i = 0; i < h.w; i += 6) {
      for (var k = 0; k < 5; k++) {
        A.rect(ctx, x + i + (4 - k) / 2, y + k, Math.max(1, k + 1), 1, k % 2 ? '#d8d4c8' : '#8e93a6');
      }
    }
    A.rect(ctx, x, y + 5, h.w, 2, '#4a4a62');
  };

  A.orb = function (ctx, o, time) {
    var x = Math.round(o.x), y = Math.round(o.y);
    var r = o.r || 7;
    ctx.globalAlpha = 0.25;
    A.rect(ctx, x - r - 3, y - r - 3, r * 2 + 6, r * 2 + 6, '#b56bff');
    ctx.globalAlpha = 1;
    A.rect(ctx, x - r, y - r + 2, r * 2, r * 2 - 4, '#6b3ea0');
    A.rect(ctx, x - r + 2, y - r, r * 2 - 4, r * 2, '#6b3ea0');
    A.rect(ctx, x - r + 3, y - r + 2, 3, 3, '#e2b7ff');
    A.rect(ctx, x + r - 5, y + r - 6, 2, 2, '#f4e3ff');
  };

  A.door = function (ctx, d, time, active) {
    var x = Math.round(d.x), y = Math.round(d.y);
    A.rect(ctx, x - 2, y - 2, 20, 34, '#4b3b58');
    A.rect(ctx, x, y, 16, 30, active ? '#83e3e8' : '#55486b');
    A.rect(ctx, x + 3, y + 3, 10, 24, active ? '#d8ffff' : '#6e5c86');
    A.ornament(ctx, x + 2, y + 8, 12, '#2c5d63', (time * 4) | 0);
    A.text(ctx, '∞', x + 4, y + 18, { size: 8, color: '#29505d', shadow: false });
  };

  A.dragon = function (ctx, b, time) {
    var x = Math.round(b.x), y = Math.round(b.y);
    var flap = Math.sin(time * 8) * 5;
    A.rect(ctx, x - 24, y - 12 + flap, 16, 8, '#3f7d5a');
    A.rect(ctx, x + 8, y - 12 - flap, 16, 8, '#3f7d5a');
    A.rect(ctx, x - 14, y - 8, 28, 17, '#4d9468');
    A.rect(ctx, x + 12, y - 10, 13, 12, '#5aa777');
    A.rect(ctx, x + 23, y - 6, 6, 5, '#6fbd86');
    A.rect(ctx, x + 10, y - 15, 4, 6, '#e8d7a4');
    A.rect(ctx, x + 18, y - 15, 4, 6, '#e8d7a4');
    A.rect(ctx, x + 17, y - 7, 3, 3, b.flash > 0 ? '#ffffff' : '#f6d45c');
    A.rect(ctx, x + 24, y - 3, 2, 2, '#1c3327');
    A.rect(ctx, x - 6, y + 9, 5, 9, '#3a6f50');
    A.rect(ctx, x + 5, y + 9, 5, 9, '#3a6f50');
    A.ornament(ctx, x - 10, y - 2, 18, '#b5df9e', 0);
  };

  A.fireball = function (ctx, f, time) {
    var x = Math.round(f.x), y = Math.round(f.y);
    A.rect(ctx, x - 3, y - 3, 6, 6, '#f06a32');
    A.rect(ctx, x - 2, y - 4, 4, 8, '#ffb648');
    A.rect(ctx, x - 1, y - 1, 2, 2, '#fff2b0');
    if (((time * 20) | 0) % 2) A.rect(ctx, x - 6, y + 2, 3, 2, '#b8442b');
  };

  A.idealPoint = function (ctx, p, time, strength) {
    var x = Math.round(p.x), y = Math.round(p.y);
    var r = 5 + Math.sin(time * 4) * 2 + strength * 5;
    ctx.strokeStyle = 'rgba(126,238,247,' + (0.25 + strength * 0.5) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    A.rect(ctx, x - 1, y - 1, 3, 3, '#e6ffff');
    A.text(ctx, 'идеальная точка', x + 10, y - 5, { size: 6, color: '#8ee9f2', shadow: false });
  };

  A.convergenceGuides = function (ctx, level, strength, phase) {
    if (!level.guides || strength < 0.05) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, strength) * 0.7;
    ctx.strokeStyle = '#79dfea';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
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
