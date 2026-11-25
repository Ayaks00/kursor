


(function (KZ) {
  'use strict';

  var A = {};
  
  
  A.U = 4;
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

  A.fineRect = function (ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };

  
  
  A.at = function (ctx, x, y, draw) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(A.U, A.U);
    draw(ctx);
    ctx.restore();
  };

  
  A.halo = function (ctx, x, y, r, color, alpha) {
    ctx.save();
    for (var i = 3; i >= 1; i--) {
      ctx.globalAlpha = alpha * (0.5 * (4 - i) / 3 + 0.05);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * i / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  
  A.drawParticle = function (ctx, q) {
    var t = Math.max(0, Math.min(1, q.life / (q.maxLife || 1)));
    ctx.save();
    ctx.globalAlpha = Math.min(1, t * 1.5);
    if (q.glow) A.halo(ctx, q.x, q.y, q.size * 3, q.color, 0.35 * t);
    A.rect(ctx, q.x - q.size / 2, q.y - q.size / 2, q.size, q.size, q.color);
    ctx.restore();
  };

  
  A.drawRing = function (ctx, fx) {
    var t = 1 - Math.max(0, fx.life) / fx.maxLife;
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.75;
    ctx.strokeStyle = fx.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(Math.round(fx.x), Math.round(fx.y), Math.max(1, Math.round(fx.r)), 0, Math.PI * 2);
    ctx.stroke();
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 2;
      A.rect(ctx, fx.x + Math.cos(a) * fx.r - 1, fx.y + Math.sin(a) * fx.r - 1, 2, 2, fx.color);
    }
    ctx.restore();
  };

  
  A.vignette = function (ctx) {
    var u = A.U;
    var g = ctx.createRadialGradient(240 * u, 132 * u, 88 * u, 240 * u, 132 * u, 292 * u);
    g.addColorStop(0, 'rgba(20,14,8,0)');
    g.addColorStop(0.72, 'rgba(20,14,8,0.07)');
    g.addColorStop(1, 'rgba(14,9,5,0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 480 * u, 270 * u);
  };

  
  A.font = function (size, bold, mono) {
    
    var family = 'Georgia, "Times New Roman", "DejaVu Serif", serif';
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

    
    for (var i = 0; i < 8; i++) {
      var bx = i * 82 - (camX * 0.62) % 82 - 40;
      A.rect(ctx, bx, 126, 66, 10, C.marbleDim);
      for (var s = 0; s < 66; s += 11) A.rect(ctx, bx + s, 126, 6, 10, C.terracotta);
      A.rect(ctx, bx + 2, 137, 62, 3, C.goldDark);
      A.rect(ctx, bx + 5, 141, 56, 13, '#3a291e');
      A.rect(ctx, bx + 8, 145, i % 2 ? 36 : 28, 2, C.goldDark);
      A.column(ctx, bx + 6, 156, 52, C.marbleDim);
      A.column(ctx, bx + 56, 156, 52, C.marbleDim);
      
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
    
    var ox = 190 - camX * 0.12;
    A.rect(ctx, ox - 136, 118, 272, 100, C.marbleDim);
    A.rect(ctx, ox - 144, 106, 288, 13, C.marble);
    A.pediment(ctx, ox - 108, 84, 216, C.marble);
    A.rect(ctx, ox - 112, 102, 224, 4, C.gold);
    A.ornament(ctx, ox - 104, 96, 208, C.goldDark, 0);
    for (var c = 0; c < 7; c++) A.column(ctx, ox - 118 + c * 40, 119, 86, C.marble);
    
    for (var b = 0; b < 3; b++) {
      var bx = ox - 78 + b * 78;
      A.rect(ctx, bx, 140, 16, 30, '#8e8168');
      A.rect(ctx, bx + 5, 143, 6, 8, C.marbleDark);
      A.rect(ctx, bx + 4, 152, 8, 12, C.marble);
      A.rect(ctx, bx + 2, 164, 12, 5, C.marbleDark);
    }
    A.rect(ctx, ox - 42, 88, 84, 2, C.goldDark);
    A.ornament(ctx, ox - 100, 108, 200, '#5a4a32', 0);
    
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
    
    var dx = 250 - camX * 0.24;
    A.rect(ctx, dx - 44, 154, 88, 64, C.marbleDim);
    for (var col = 0; col < 4; col++) A.column(ctx, dx - 38 + col * 23, 160, 52, C.marble);
    A.rect(ctx, dx - 50, 148, 100, 8, C.marble);
    A.pediment(ctx, dx - 36, 132, 72, C.marble);
    
    A.rect(ctx, dx - 30, 116, 60, 18, '#9c9a84');
    A.rect(ctx, dx - 20, 108, 40, 9, C.marble);
    A.rect(ctx, dx - 10, 101, 20, 8, C.marbleDim);
    A.rect(ctx, dx + 2, 112, 9, 28, '#1c2539');
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(dx, 141, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(dx, 141, 11, 0, Math.PI * 2); ctx.stroke();
    A.rect(ctx, dx - 2, 139, 4, 4, C.goldLight);
    A.ornament(ctx, dx - 16, 172, 32, C.goldDark, 0);
    
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
    
    A.rect(ctx, 0, 168, 480, 102, '#8b6a50');
    for (var i = 0; i < 24; i++) {
      var bx = i * 22 - (camX * 0.35) % 22;
      A.rect(ctx, bx, 166, 13, 10, '#a07c5c');
      A.rect(ctx, bx + 2, 178, 19, 1, '#6e533d');
      A.rect(ctx, bx + 9, 192, 1, 14, '#6e533d');
    }
    A.ornament(ctx, 0, 210, 480, C.goldDark, 0);
    
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

  
  var bgImages = {};
  function bgImage(name) {
    if (!(name in bgImages)) {
      var im = new Image();
      im.src = window.BG_DATA[name];
      bgImages[name] = im;
    }
    return bgImages[name];
  }

  A.backdropFine = function (ctx, level, camX, time) {
    var seed = level.id * 97;
    for (var i = 0; i < 72; i++) {
      var x = ((i * 137 + seed) % 2000) - 40 - camX * 0.12;
      var y = 12 + ((i * 83 + seed) % 250) * A.U;
      var a = 0.08 + 0.08 * Math.sin(time * 2 + i);
      ctx.globalAlpha = a;
      A.fineRect(ctx, x, y, 2, 2, i % 3 ? '#f5e3ab' : '#8ee9f2');
    }
    ctx.globalAlpha = 0.18;
    for (var j = 0; j < 9; j++) {
      var gx = ((j * 241 + seed) % 1900) - camX * 0.06;
      ctx.fillStyle = '#fff3c8';
      ctx.fillRect(gx, 0, 1, 1080);
    }
    ctx.globalAlpha = 1;
  };

  A.backdrop = function (ctx, level, camX, time) {
    var im = bgImage(level.bg);
    if (im && im.complete && (im.naturalWidth || im.width)) {
      ctx.drawImage(im, 0, 0, 480 * A.U, 270 * A.U);
      A.backdropFine(ctx, level, camX, time);
      return;
    }
    
    ctx.save();
    ctx.scale(A.U, A.U);
    var pal = level.palette;
    if (level.bg === 'main' || level.bg === 'kfu') A.kfu(ctx, camX / A.U, time, pal);
    else if (level.bg === 'bauman') A.bauman(ctx, camX / A.U, time, pal);
    else if (level.bg === 'observatory') A.observatory(ctx, camX / A.U, time, pal);
    else A.kremlin(ctx, camX / A.U, time, pal);
    ctx.restore();
  };

  A.platform = function (ctx, a, b, style, alpha, phase) {
    ctx.save();
    ctx.globalAlpha = alpha;
    A.at(ctx, a[0], a[1], function (ctx) {
      var x1 = 0, y1 = 0;
      var x2 = (b[0] - a[0]) / A.U, y2 = (b[1] - a[1]) / A.U;
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var thick = 7;
      var base = style === 'wood' ? '#7b5433' : style === 'metal' ? '#6f532b' : '#7a6a51';
      var top = style === 'wood' ? '#e0b477' : style === 'metal' ? '#f0d183' : '#f7efd8';
      var dark = style === 'wood' ? '#3d2a1c' : style === 'metal' ? '#4a3920' : '#4d4032';
      var edge = '#241a12';
      function slab(offset, thickness) {
        ctx.beginPath();
        ctx.moveTo(x1 + nx * offset, y1 + ny * offset);
        ctx.lineTo(x2 + nx * offset, y2 + ny * offset);
        ctx.lineTo(x2 + nx * (offset + thickness), y2 + ny * (offset + thickness));
        ctx.lineTo(x1 + nx * (offset + thickness), y1 + ny * (offset + thickness));
        ctx.closePath();
      }
      
      slab(1.5, thick + 2);
      ctx.fillStyle = 'rgba(20,13,8,0.5)'; ctx.fill();
      
      slab(0, thick);
      ctx.fillStyle = base; ctx.fill();
      ctx.strokeStyle = edge; ctx.lineWidth = 0.7; ctx.stroke();
      
      slab(-0.6, 2.4);
      ctx.fillStyle = top; ctx.fill();
      ctx.strokeStyle = 'rgba(255,244,208,0.8)'; ctx.lineWidth = 0.4; ctx.stroke();
      
      slab(thick - 1.6, 1.6);
      ctx.fillStyle = dark; ctx.fill();
      
      for (var d = 7; d < len; d += 11) {
        var px = x1 + dx * (d / len) + nx * 3;
        var py = y1 + dy * (d / len) + ny * 3;
        if (style === 'wood') {
          A.rect(ctx, px, py, 4, 0.4, '#6d4c33');
          A.rect(ctx, px + 1, py + 2, 3, 0.3, '#a87a4b');
        } else if (style === 'metal') {
          A.rect(ctx, px, py, 1.2, 1.2, C.goldLight);
          A.rect(ctx, px + 0.3, py + 0.3, 0.6, 0.6, C.bronzeDark);
        } else {
          A.rect(ctx, px, py, 0.6, 3, '#5a4b39');
          A.rect(ctx, px + 2, py + 1, 3, 0.5, '#fff4d0');
        }
      }
      ctx.beginPath();
      ctx.moveTo(x1 + nx * 0.2, y1 + ny * 0.2);
      ctx.lineTo(x2 + nx * 0.2, y2 + ny * 0.2);
      ctx.strokeStyle = 'rgba(255,252,226,0.55)';
      ctx.lineWidth = 0.25;
      ctx.stroke();
      for (var sf = 3.5; sf < len; sf += 6.5) {
        var fx = x1 + dx * (sf / len) + nx * 1.4;
        var fy = y1 + dy * (sf / len) + ny * 1.4;
        A.fineRect(ctx, fx, fy, 0.25, 0.25, style === 'metal' ? '#fff0b8' : '#fff6dd');
        A.fineRect(ctx, fx + nx * 2.5, fy + ny * 2.5, 0.25, 0.25, 'rgba(20,14,9,0.7)');
      }
      ctx.beginPath();
      ctx.moveTo(x1 + nx * (thick + 0.4), y1 + ny * (thick + 0.4));
      ctx.lineTo(x2 + nx * (thick + 0.4), y2 + ny * (thick + 0.4));
      ctx.strokeStyle = 'rgba(255,226,160,0.35)';
      ctx.lineWidth = 0.25;
      ctx.stroke();
      if (style === 'metal' && len > 14) {
        A.ornament(ctx, 3, 2, Math.min(26, len - 6), C.goldLight, phase);
      }
      if (style === 'stone' && len > 20) {
        ctx.strokeStyle = 'rgba(255,244,208,0.6)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(4, 1.2); ctx.lineTo(len - 4, 1.2);
        ctx.stroke();
      }
    });
    ctx.restore();
  };

  A.player = function (ctx, p, time, curved) {
    A.at(ctx, p.x, p.y, function (ctx) {
      var x = 0, y = 0;
      var run = p.onGround && Math.abs(p.vx) > 0.2 * A.U ? Math.sin(time * 14) : 0;
      var chiton = curved ? C.gold : C.parchment;
      var cloak = curved ? C.olive : C.terracotta;
      if (curved) A.halo(ctx, 5, 7, 11 + Math.sin(time * 5) * 2, C.gold, 0.34);
      
      A.rect(ctx, x - 2, y + 14, 14, 1, 'rgba(30,22,14,0.35)');
      A.rect(ctx, x - 2, y + 3, 3, 9, '#8c4f34');
      A.rect(ctx, x - 1, y + 4, 12, 7, cloak);
      A.rect(ctx, x - 2 + Math.sin(time * 6) * 1, y + 7, 3, 5, cloak);
      A.rect(ctx, x + 1, y + 6, 8, 4, chiton);
      A.rect(ctx, x + 2, y + 6, 0.4, 4, '#b9a782');
      A.rect(ctx, x + 5, y + 6, 0.4, 4, '#b9a782');
      A.rect(ctx, x - 3, y + 5, 3, 6, C.bronzeDark);
      A.rect(ctx, x - 3, y + 5, 1, 6, C.goldDark);
      A.rect(ctx, x + (run > 0 ? 1 : 0), y + 11, 3, 3, C.ink);
      A.rect(ctx, x + 6 - (run > 0 ? 1 : 0), y + 11, 3, 3, C.ink);
      A.rect(ctx, x + (run > 0 ? 1 : 0), y + 11, 3, 1, '#a88758');
      A.rect(ctx, x + 6 - (run > 0 ? 1 : 0), y + 11, 3, 1, '#a88758');
      
      A.rect(ctx, x + 1, y, 9, 6, '#d9b58a');
      A.rect(ctx, x + 1, y + 4, 9, 2, '#c9a276');
      A.rect(ctx, x + 0, y - 2, 11, 3, '#7e5b3e');
      A.rect(ctx, x + 1, y - 3, 3, 2, C.olive);
      A.rect(ctx, x + 6, y - 3, 3, 2, C.olive);
      A.rect(ctx, x + 4, y - 4, 2, 1, '#98a469');
      A.rect(ctx, x + 2, y + 2, 3, 1, C.ink);
      A.rect(ctx, x + 6, y + 2, 3, 1, C.ink);
      A.rect(ctx, x + 2, y + 2, 1, 0.5, C.parchment);
      A.rect(ctx, x + 6, y + 2, 1, 0.5, C.parchment);
      A.rect(ctx, x + 5, y + 2, 1, 2, '#a37d59');
      
      A.rect(ctx, x + 8, y + 6, 3, 4, C.parchment);
      A.rect(ctx, x + 8, y + 6, 3, 1, C.marble);
      A.rect(ctx, x + 9, y + 8, 1, 1, C.gold);
      if (curved) A.rect(ctx, x + 8, y - 1, 2, 2, C.goldLight);
      A.fineRect(ctx, x + 2.25, y + 6.5, 0.25, 3.5, 'rgba(255,246,214,0.5)');
      A.fineRect(ctx, x + 5.75, y + 6.5, 0.25, 3.5, 'rgba(255,246,214,0.5)');
      A.fineRect(ctx, x + 0.5, y + 9.25, 10, 0.25, 'rgba(40,28,18,0.5)');
      A.fineRect(ctx, x + 1.5, y + 0.5, 0.5, 0.5, '#fff0c8');
      A.fineRect(ctx, x + 9.5, y + 0.5, 0.5, 0.5, '#fff0c8');
      A.fineRect(ctx, x + 3.25, y - 2.75, 0.5, 0.5, '#c7d68d');
      A.fineRect(ctx, x + 7.25, y - 2.75, 0.5, 0.5, '#c7d68d');
      A.fineRect(ctx, x + 8.75, y + 6.75, 0.25, 2.5, '#8a5a3c');
      A.fineRect(ctx, x + 9.5, y + 8.25, 0.25, 0.25, C.goldLight);
    });
  };

  A.pickup = function (ctx, item, time) {
    var phase = item.x / A.U;
    var bob = Math.sin(time * 3 + phase) * 2 * A.U;
    var shine = item.type === 'chakchak' ? '#ffce6a' : '#fff3c8';
    A.at(ctx, item.x, item.y + bob, function (ctx) {
      var x = 0, y = 0;
      A.halo(ctx, x, y, 10 + Math.sin(time * 4 + phase) * 2, shine, 0.5);
      if (item.type === 'chakchak') {
        
        A.rect(ctx, x - 3, y - 3, 7, 6, C.terracotta);
        A.rect(ctx, x - 2, y - 2, 5, 4, '#c97a4c');
        A.rect(ctx, x - 4, y - 5, 9, 3, '#cf8053');
        A.rect(ctx, x - 3, y - 5, 7, 1, '#e39a6a');
        A.rect(ctx, x - 2, y - 6, 5, 2, C.terracotta);
        A.rect(ctx, x - 4, y + 3, 9, 2, C.bronzeDark);
        A.rect(ctx, x - 3, y + 4, 7, 1, C.goldDark);
        A.rect(ctx, x - 1, y - 1, 3, 3, C.goldLight);
        A.rect(ctx, x - 2, y - 1, 1, 1, '#fff3c8');
        A.rect(ctx, x + 1, y + 1, 1, 1, '#ffce6a');
        A.rect(ctx, x - 5, y - 2, 2, 3, C.bronzeDark);
        A.rect(ctx, x + 4, y - 2, 2, 3, C.bronzeDark);
        A.rect(ctx, x - 5, y - 1, 1, 1, C.gold);
        A.rect(ctx, x + 4, y - 1, 1, 1, C.gold);
      } else {
        
        A.rect(ctx, x - 3, y - 4, 7, 8, C.parchment);
        A.rect(ctx, x - 4, y - 5, 9, 2, C.marble);
        A.rect(ctx, x - 4, y + 3, 9, 2, C.marble);
        A.rect(ctx, x - 4, y - 4, 1, 7, '#c7b68d');
        A.rect(ctx, x + 4, y - 4, 1, 7, '#c7b68d');
        A.rect(ctx, x - 1, y - 2, 1, 4, '#8a5a3c');
        A.rect(ctx, x + 1, y - 2, 1, 4, '#8a5a3c');
        A.rect(ctx, x - 1, y, 3, 1, '#8a5a3c');
        A.rect(ctx, x + 2, y + 2, 1, 1, C.gold);
        for (var l = 0; l < 3; l++) A.rect(ctx, x - 2, y - 3 + l * 2, 4, 0.3, '#b09a70');
      }
      A.fineRect(ctx, -6.75, -0.25, 0.5, 0.5, '#ffffff');
      A.fineRect(ctx, 6.25, -0.25, 0.5, 0.5, '#ffffff');
      A.fineRect(ctx, -0.25, -6.75, 0.5, 0.5, '#ffffff');
      A.fineRect(ctx, 0.25, 6.25, 0.5, 0.5, '#fff3c8');
    });
  };

  A.flag = function (ctx, cp, time) {
    A.at(ctx, cp.x, cp.y, function (ctx) {
      var x = 0, y = 0;
      A.rect(ctx, x - 2, y - 1, 6, 2, C.bronzeDark);
      A.rect(ctx, x, y - 22, 2, 22, C.bronzeDark);
      A.rect(ctx, x + 0.5, y - 22, 0.5, 22, C.goldDark);
      A.rect(ctx, x - 2, y - 22, 7, 2, C.gold);
      A.rect(ctx, x - 1, y - 24, 5, 2, C.goldLight);
      var c = cp.active ? C.gold : '#9a8c6c';
      A.rect(ctx, x + 2, y - 20, 13, 10, c);
      A.rect(ctx, x + 2, y - 20, 13, 1, cp.active ? C.goldLight : '#c2b394');
      A.ornament(ctx, x + 3, y - 18, 11, '#6b3f28', 0);
      A.rect(ctx, x + 2, y - 11, 13, 2, C.goldDark);
      A.rect(ctx, x + 4, y - 9, 1, 2, C.bronze);
      A.rect(ctx, x + 12, y - 9, 1, 2, C.bronze);
      if (cp.active) {
        A.halo(ctx, 6, -15, 12 + Math.sin(time * 4) * 3, C.goldLight, 0.55);
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 5);
        A.rect(ctx, -4, -24, 22, 16, C.goldLight);
        ctx.globalAlpha = 1;
      }
    });
  };

  A.spikes = function (ctx, h) {
    A.at(ctx, h.x, h.y, function (ctx) {
      var x = 0, y = 0;
      var w = h.w / A.U;
      A.rect(ctx, x, y + 5, w, 2, C.bronzeDark);
      A.rect(ctx, x, y + 5, w, 0.5, C.goldDark);
      for (var i = 0; i < w; i += 7) {
        for (var k = 0; k < 5; k++) {
          A.rect(ctx, x + i + (4 - k) / 2, y + k, Math.max(1, k + 1), 1, k % 2 ? C.bronze : C.marbleDim);
          A.rect(ctx, x + i + (4 - k) / 2, y + k, 0.5, 1, C.goldLight);
        }
        A.rect(ctx, x + i + 1, y + 6, 5, 1, '#5c4a30');
      }
    });
  };

  A.orb = function (ctx, o, time) {
    A.at(ctx, o.x, o.y, function (ctx) {
      var x = 0, y = 0;
      var r = (o.r || 7 * A.U) / A.U;
      var pulse = Math.sin(time * 5) * 0.5;
      A.halo(ctx, 0, 0, r + 4 + pulse, '#d9b15c', 0.35);
      ctx.globalAlpha = 0.22;
      A.rect(ctx, -r - 3, -r - 3, r * 2 + 6, r * 2 + 6, '#d9b15c');
      ctx.globalAlpha = 1;
      A.rect(ctx, -r, -r + 2, r * 2, r * 2 - 4, '#4a3a2b');
      A.rect(ctx, -r + 2, -r, r * 2 - 4, r * 2, '#4a3a2b');
      
      A.rect(ctx, -r + 3, -r + 2, 3, 3, C.goldLight);
      A.rect(ctx, r - 5, r - 6, 2, 2, C.gold);
      A.rect(ctx, -r - 1, -1, 3, 2, C.goldDark);
      A.rect(ctx, r - 2, -1, 3, 2, C.goldDark);
      A.rect(ctx, -1, -r - 1, 2, 3, C.goldDark);
      A.rect(ctx, -1, r - 2, 2, 3, C.goldDark);
      A.rect(ctx, -2, -2, 3, 3, '#2c2620');
      A.rect(ctx, -1, -1, 1, 1, C.goldLight);
    });
  };

  A.door = function (ctx, d, time, active) {
    A.at(ctx, d.x, d.y, function (ctx) {
      var x = 0, y = 0;
      A.rect(ctx, -6, y + 30, 28, 2, 'rgba(30,22,14,0.4)');
      A.rect(ctx, -4, -4, 24, 3, C.marble);
      A.column(ctx, -4, 0, 32, C.marbleDim);
      A.column(ctx, 18, 0, 32, C.marbleDim);
      A.rect(ctx, -3, -8, 22, 4, C.marble);
      A.pediment(ctx, -1, -14, 18, C.marble);
      A.ornament(ctx, -1, -7, 18, C.goldDark, 0);
      A.rect(ctx, -2, 1, 1, 30, '#f5ecd4');
      A.rect(ctx, 18, 1, 1, 30, '#f5ecd4');
      if (active) A.halo(ctx, 8, 15, 14 + Math.sin(time * 3) * 2, '#f5e3ab', 0.55);
      A.rect(ctx, 0, 0, 16, 30, active ? '#e8c46c' : '#5b4b38');
      A.rect(ctx, 3, 3, 10, 24, active ? C.goldLight : '#776449');
      A.rect(ctx, 4, 3, 0.5, 24, '#fff8dd');
      A.rect(ctx, 5, 15, 6, 2, '#6c4a24');
      A.rect(ctx, 7, 12, 2, 8, '#6c4a24');
      A.rect(ctx, 13, 16, 1, 2, C.gold);
      A.rect(ctx, 2, 27, 12, 1, C.goldDark);
    });
  };

  A.dragon = function (ctx, b, time) {
    A.at(ctx, b.x, b.y, function (ctx) {
      var x = 0, y = 0;
      var flap = Math.sin(time * 8) * 5;
      A.halo(ctx, 0, 0, 26 + Math.sin(time * 3) * 4, b.flash > 0 ? '#ffffff' : '#e3c57d', 0.4);
      
      A.rect(ctx, -26, -12 + flap, 18, 8, '#6e5a3d');
      A.rect(ctx, -24, -10 + flap, 14, 1, '#a28859');
      A.rect(ctx, -22, -8 + flap, 12, 1, '#a28859');
      A.rect(ctx, -20, -6 + flap, 10, 1, '#a28859');
      A.rect(ctx, 8, -12 - flap, 18, 8, '#6e5a3d');
      A.rect(ctx, 10, -10 - flap, 14, 1, '#a28859');
      A.rect(ctx, 12, -8 - flap, 12, 1, '#a28859');
      A.rect(ctx, 14, -6 - flap, 10, 1, '#a28859');
      A.rect(ctx, -16, -4, 6, 5, '#5d7550');
      A.rect(ctx, -14, -10, 28, 17, '#6f8b5e');
      A.rect(ctx, -12, -8, 24, 13, '#7d9869');
      A.rect(ctx, 12, -10, 13, 12, '#7fa06b');
      A.rect(ctx, 23, -6, 6, 5, '#92b27a');
      A.rect(ctx, 28, -5, 3, 3, '#9db884');
      A.rect(ctx, 10, -15, 4, 6, C.goldLight);
      A.rect(ctx, 18, -15, 4, 6, C.goldLight);
      A.rect(ctx, 11, -17, 2, 3, C.gold);
      A.rect(ctx, 19, -17, 2, 3, C.gold);
      A.rect(ctx, 17, -7, 3, 3, b.flash > 0 ? '#ffffff' : C.goldLight);
      A.rect(ctx, 18, -6, 1, 1, C.ink);
      A.rect(ctx, 24, -3, 2, 2, C.ink);
      A.rect(ctx, 26, 0, 4, 1, C.parchment);
      A.rect(ctx, -6, 9, 5, 9, '#567049');
      A.rect(ctx, 5, 9, 5, 9, '#567049');
      A.rect(ctx, -5, 16, 7, 2, '#3f563a');
      A.rect(ctx, 6, 16, 7, 2, '#3f563a');
      for (var i = 0; i < 4; i++) {
        A.rect(ctx, -10 + i * 6, -2, 2, 2, C.gold);
        A.rect(ctx, -9 + i * 6, 3, 2, 2, '#a8bd7c');
      }
      for (var sc = 0; sc < 9; sc++) {
        A.fineRect(ctx, -11 + sc * 2.7, -7 + (sc % 3) * 4.5, 0.5, 0.5, '#d9e6b0');
        A.fineRect(ctx, -10 + sc * 2.7, 6 + (sc % 2) * 2, 0.25, 0.25, '#3f563a');
      }
      A.fineRect(ctx, 17.75, -6.75, 0.5, 0.5, '#ffffff');
      A.fineRect(ctx, 24.25, -2.75, 0.5, 0.5, '#ffffff');
      A.fineRect(ctx, 25.25, 0.25, 0.5, 0.5, '#fff3c8');
    });
  };

  A.fireball = function (ctx, f, time) {
    A.at(ctx, f.x, f.y, function (ctx) {
      var x = 0, y = 0;
      A.halo(ctx, 0, 0, 8, '#d97846', 0.6);
      A.rect(ctx, -4, -2, 3, 4, '#8a4a2b');
      A.rect(ctx, -3, -3, 6, 6, C.terracotta);
      A.rect(ctx, -2, -4, 4, 8, C.gold);
      A.rect(ctx, -1, -1, 2, 2, C.goldLight);
      A.rect(ctx, -1, -3, 1, 1, '#fff3c8');
      if (((time * 20) | 0) % 2) {
        A.rect(ctx, -6, 2, 3, 2, '#8a4a2b');
        A.rect(ctx, 3, -3, 2, 2, C.gold);
      }
    });
  };

  A.idealPoint = function (ctx, p, time, strength) {
    A.at(ctx, p.x, p.y, function (ctx) {
      var x = 0, y = 0;
      var r = 5 + Math.sin(time * 4) * 2 + strength * 5;
      A.halo(ctx, 0, 0, r + 8, C.goldLight, 0.22 + strength * 0.35);
      ctx.strokeStyle = 'rgba(245,227,171,' + (0.28 + strength * 0.5) + ')';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2); ctx.stroke();
      for (var k = 0; k < 8; k++) {
        var a = k * Math.PI / 4;
        A.rect(ctx, Math.cos(a) * (r + 8), Math.sin(a) * (r + 8), 1, 1, C.goldLight);
      }
      A.rect(ctx, -1, -1, 3, 3, C.goldLight);
      A.rect(ctx, -0.25, -0.25, 0.5, 0.5, '#ffffff');
      A.rect(ctx, 10, -4, 26, 0.5, C.goldLight);
    });
  };

  
  A.lantern = function (ctx, x, y, time) {
    A.at(ctx, x, y, function (ctx) {
      var gx = 0, gy = -20;
      var flicker = Math.sin(time * 7 + x / A.U) * 1.2;
      A.rect(ctx, -3, -1, 7, 2, '#5c4a30');
      A.rect(ctx, -1, -20, 2, 20, C.bronzeDark);
      A.rect(ctx, -0.5, -20, 0.5, 20, C.goldDark);
      A.rect(ctx, -3, -22, 7, 2, C.bronze);
      A.rect(ctx, -2, -27, 5, 5, '#3a2d20');
      A.rect(ctx, -1, -26, 3, 3, '#ffce6a');
      A.rect(ctx, 0, -25 + flicker * 0.2, 1, 2, C.goldLight);
      A.rect(ctx, -3, -28, 7, 2, C.bronzeDark);
      A.rect(ctx, -2, -29, 5, 1, C.gold);
      A.rect(ctx, -1, -30, 3, 1, '#7a6038');
      A.rect(ctx, 3, -24, 1, 2, C.bronzeDark);
      A.halo(ctx, gx, gy - 5, 14 + flicker, '#ffce6a', 0.5);
      A.halo(ctx, gx, gy - 5, 7 + flicker * 0.5, '#fff3c8', 0.35);
    });
  };

  A.convergenceGuides = function (ctx, level, strength, phase) {
    if (strength < 0.05) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, strength) * 0.72;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = A.U * 0.35;
    ctx.setLineDash([5 * A.U, 4 * A.U]);
    ctx.lineDashOffset = -(phase * 8 * A.U) % (8 * A.U);
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
