


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
    if (!A._vignette || A._vignette.ctx !== ctx) {
      var g = ctx.createRadialGradient(240 * u, 132 * u, 88 * u, 240 * u, 132 * u, 292 * u);
      g.addColorStop(0, 'rgba(20,14,8,0)');
      g.addColorStop(0.72, 'rgba(20,14,8,0.07)');
      g.addColorStop(1, 'rgba(14,9,5,0.32)');
      A._vignette = { ctx: ctx, grad: g };
    }
    ctx.fillStyle = A._vignette.grad;
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
  A.preload = function () {
    for (var name in (window.BG_DATA || {})) bgImage(name);
  };

  function bgImage(name) {
    if (!(name in bgImages)) {
      var im = new Image();
      im.src = window.BG_DATA[name];
      bgImages[name] = im;
    }
    return bgImages[name];
  }

  var bgStrips = {};
  function bgStrip(name, im) {
    if (bgStrips[name]) return bgStrips[name];
    var w = 480 * A.U, h = 270 * A.U;
    var cv = document.createElement('canvas');
    cv.width = w * 2; cv.height = h;
    var x = cv.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(im, 0, 0, w, h);
    x.save();
    x.translate(w * 2, 0);
    x.scale(-1, 1);
    x.drawImage(im, 0, 0, w, h);
    x.restore();
    bgStrips[name] = cv;
    return cv;
  }

  A.backdropFine = function (ctx, level, camX, camY, time) {
    var seed = level.id * 97;
    var w = 480 * A.U, h = 270 * A.U;
    for (var i = 0; i < 72; i++) {
      var raw = (i * 137 + seed + camX * 0.12) % w;
      var x = raw < 0 ? raw + w : raw;
      var ry = (12 + ((i * 83 + seed) % 250) * A.U - camY * 0.05 + camX * 0.01) % h;
      var y = ry < 0 ? ry + h : ry;
      var a = 0.08 + 0.08 * Math.sin(time * 2 + i);
      ctx.globalAlpha = a;
      A.fineRect(ctx, x, y, 2, 2, i % 3 ? '#f5e3ab' : '#8ee9f2');
    }
    ctx.globalAlpha = 0.18;
    for (var j = 0; j < 9; j++) {
      var gr = (j * 241 + seed + camX * 0.06) % w;
      var gx = gr < 0 ? gr + w : gr;
      ctx.fillStyle = '#fff3c8';
      ctx.fillRect(gx, 0, 1, 1080);
    }
    ctx.globalAlpha = 1;
  };

  A.backdrop = function (ctx, level, camX, camY, time) {
    var shiftY = -camY * 0.18 + camX * 0.012;
    ctx.fillStyle = (level.palette && level.palette.sky) || '#1c2438';
    ctx.fillRect(0, 0, 480 * A.U, 270 * A.U);
    var im = bgImage(level.bg);
    if (im && im.complete && (im.naturalWidth || im.width)) {
      var w = 480 * A.U, h = 270 * A.U;
      var period = w * 2;
      var sx = (camX * 0.16) % period;
      if (sx < 0) sx += period;
      var strip = bgStrip(level.bg, im);
      if (sx + w <= period) {
        ctx.drawImage(strip, sx, 0, w, h, 0, shiftY, w, h);
      } else {
        var first = period - sx;
        ctx.drawImage(strip, sx, 0, first, h, 0, shiftY, first, h);
        ctx.drawImage(strip, 0, 0, w - first, h, first, shiftY, w - first, h);
      }
      A.backdropFine(ctx, level, camX, camY, time);
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

  A.platform = function (ctx, a, b, style, alpha, phase, kind) {
    ctx.save();
    ctx.globalAlpha = alpha;
    A.at(ctx, a[0], a[1], function (ctx) {
      var dx = (b[0] - a[0]) / A.U;
      var dy = (b[1] - a[1]) / A.U;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      ctx.save();
      ctx.rotate(Math.atan2(dy, dx));

      var thick = 8;
      var base = style === 'wood' ? '#6f4a2d' : style === 'metal' ? '#705734' : '#8b7c62';
      var top = style === 'wood' ? '#d9a96b' : style === 'metal' ? '#e9c981' : '#f3ead4';
      var dark = style === 'wood' ? '#382718' : style === 'metal' ? '#40331f' : '#45392a';

      ctx.fillStyle = 'rgba(16,11,7,0.55)';
      ctx.fillRect(0.5, 2.4, len, thick + 2.2);

      var key = style + '|' + top + '|' + base + '|' + dark;
      if (!A._platformGradients) A._platformGradients = [];
      var grad = null;
      for (var gi = 0; gi < A._platformGradients.length; gi++) {
        if (A._platformGradients[gi].ctx === ctx && A._platformGradients[gi].key === key) {
          grad = A._platformGradients[gi].grad;
          break;
        }
      }
      if (!grad) {
        grad = ctx.createLinearGradient(0, 0, 0, thick);
        grad.addColorStop(0, top);
        grad.addColorStop(0.22, base);
        grad.addColorStop(1, dark);
        A._platformGradients.push({ ctx: ctx, key: key, grad: grad });
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, len, thick);
      ctx.strokeStyle = 'rgba(26,18,11,0.85)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(0, 0, len, thick);

      ctx.fillStyle = top;
      ctx.fillRect(-0.4, -1.6, len + 0.8, 2.4);
      ctx.fillStyle = 'rgba(255,252,226,0.8)';
      ctx.fillRect(0, -1.6, len, 0.35);
      ctx.fillStyle = dark;
      ctx.fillRect(0, thick - 1.4, len, 1.4);

      if (style === 'stone') {
        for (var st = 5; st < len - 2; st += 11) {
          A.fineRect(ctx, st, 2.2, 0.3, thick - 3.2, 'rgba(35,27,18,0.62)');
          A.fineRect(ctx, st + 0.4, 2.2, 0.2, thick - 3.2, 'rgba(255,248,220,0.35)');
          A.fineRect(ctx, st + 1.5, 3.2 + (st % 3), 2.6, 0.25, 'rgba(255,246,214,0.5)');
        }
        for (var vn = 8; vn < len - 4; vn += 23) {
          ctx.strokeStyle = 'rgba(120,105,82,0.55)';
          ctx.lineWidth = 0.28;
          ctx.beginPath();
          ctx.moveTo(vn, 2);
          ctx.lineTo(vn + 2.5, 3.4);
          ctx.lineTo(vn + 5, 3);
          ctx.stroke();
        }
        if (len > 22) A.ornament(ctx, 2, 3.2, Math.min(len - 4, 46), C.goldDark, phase);
      } else if (style === 'wood') {
        for (var pl = 4; pl < len - 2; pl += 9) {
          A.fineRect(ctx, pl, 2, 0.3, thick - 3, 'rgba(42,27,16,0.65)');
          A.fineRect(ctx, pl + 0.4, 2.4, 3.2, 0.25, 'rgba(255,220,160,0.32)');
        }
        for (var gr = 6; gr < len - 3; gr += 14) {
          A.fineRect(ctx, gr, 5.2, 4.5, 0.25, 'rgba(38,24,14,0.5)');
          A.fineRect(ctx, gr + 1, 6.4, 3, 0.25, 'rgba(255,214,150,0.28)');
          A.fineRect(ctx, gr + 2.6, 3.6, 0.6, 0.6, 'rgba(38,24,14,0.6)');
        }
        if (len > 22) A.ornament(ctx, 2, 3.2, Math.min(len - 4, 40), '#b98a4c', phase);
      } else {
        for (var rv = 4; rv < len - 2; rv += 7) {
          A.fineRect(ctx, rv, 2.2, 0.8, 0.8, '#fff2c4');
          A.fineRect(ctx, rv + 0.2, 2.4, 0.35, 0.35, '#8c6a3a');
          A.fineRect(ctx, rv + 3.5, thick - 3.2, 0.6, 0.6, '#9b7c4a');
        }
        A.fineRect(ctx, 0, 4.4, len, 0.3, 'rgba(255,230,160,0.5)');
        A.fineRect(ctx, 0, 5.6, len, 0.25, 'rgba(30,22,12,0.5)');
        if (len > 18) A.ornament(ctx, 2, 1.8, Math.min(len - 4, 48), C.goldLight, phase);
      }

      for (var mk = 7; mk < len - 3; mk += 17) {
        if (kind === 'flat') {
          A.fineRect(ctx, mk, -0.5, 0.8, 0.8, C.goldLight);
          A.fineRect(ctx, mk + 0.2, -0.3, 0.35, 0.35, '#8c6a3a');
        } else if (kind === 'curve' || kind === 'pulse' || kind === 'resonance') {
          ctx.strokeStyle = kind === 'pulse' ? '#8ee9f2' : C.goldLight;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(mk, -0.4); ctx.lineTo(mk + 1.2, 0.6); ctx.lineTo(mk + 2.4, -0.4);
          ctx.stroke();
        }
      }
      if (len > 26) {
        for (var br = 12; br < len - 10; br += 30) {
          ctx.fillStyle = style === 'stone' ? '#6f6350' : style === 'metal' ? '#5c4a30' : '#4a3320';
          ctx.beginPath();
          ctx.moveTo(br, thick);
          ctx.lineTo(br + 5, thick);
          ctx.lineTo(br + 2.5, thick + 4.5);
          ctx.closePath();
          ctx.fill();
          A.fineRect(ctx, br + 1.5, thick + 1, 0.25, 2.6, 'rgba(255,236,184,0.45)');
          A.fineRect(ctx, br - 0.5, thick - 0.4, 6, 0.4, C.goldDark);
        }
      }

      ctx.restore();
    });
    ctx.restore();
  };

  A.guard = function (ctx, h, time, active) {
    A.at(ctx, h.x, h.y, function (ctx) {
      var r = (h.r || 7 * A.U) / A.U;
      ctx.globalAlpha = active ? 1 : 0.3;
      A.halo(ctx, 0, 0, r + 3, active ? '#d97846' : '#8ee9f2', 0.4);
      ctx.fillStyle = active ? '#6d3f28' : '#2f4a52';
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5; ctx.stroke();
      A.rect(ctx, -2, -1, 4, 2, active ? C.goldLight : '#8ee9f2');
      A.fineRect(ctx, -0.25, -r + 1, 0.5, r * 2 - 2, 'rgba(255,236,184,0.5)');
      for (var k = 0; k < 4; k++) {
        var a = time * 1.6 + k * Math.PI / 2;
        A.fineRect(ctx, Math.cos(a) * (r + 2), Math.sin(a) * (r + 2), 0.5, 0.5, C.goldLight);
      }
      ctx.globalAlpha = 1;
    });
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
      A.fineRect(ctx, x - 1.75 + Math.sin(time * 9) * 0.6, y + 3.5, 0.25, 0.25, '#fff0c8');
      A.fineRect(ctx, x + 1.25 + Math.sin(time * 11) * 0.5, y + 4.5, 0.25, 0.25, '#d9b15c');
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
        A.fineRect(ctx, x - 2.75, y - 4.25, 0.5, 0.5, '#fff3c8');
        A.fineRect(ctx, x + 1.25, y - 3.75, 0.5, 0.5, '#ffe3a0');
        A.fineRect(ctx, x - 0.25, y + 1.75, 0.5, 0.5, '#fff8dd');
        A.fineRect(ctx, x + 3.25, y - 0.25, 0.5, 0.5, C.goldLight);
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
      A.ornament(ctx, 2, 25, 12, C.goldDark, 0);
      A.fineRect(ctx, -2.25, -6.25, 0.5, 36, 'rgba(255,248,220,0.55)');
      A.fineRect(ctx, 19.75, -6.25, 0.5, 36, 'rgba(255,248,220,0.4)');
      A.fineRect(ctx, 4.25, 3.25, 0.5, 22, 'rgba(255,246,200,0.5)');
    });
  };

  A.dragon = function (ctx, b, time) {
    A.at(ctx, b.x, b.y, function (ctx) {
      var flap = Math.sin(time * 7.5) * 4;
      var breath = 0.5 + 0.5 * Math.sin(time * 4);
      var hurt = b.flash > 0;
      var ember = hurt ? '#ffffff' : '#f5d36a';
      function poly(points, fill, stroke, lw) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fillStyle = fill; ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 0.4; ctx.stroke(); }
      }

      A.halo(ctx, 0, -2, 28 + breath * 4, hurt ? '#ffffff' : '#e3c57d', 0.38);
      ctx.globalAlpha = 0.28;
      A.rect(ctx, -18, 19, 38, 2, '#17150f');
      ctx.globalAlpha = 1;

      poly([[-10, -6], [-24, -19 + flap], [-38, -25 + flap], [-35, -9 + flap], [-24, -2], [-12, 3]],
        hurt ? '#91a88a' : '#4a6142', '#9ab080', 0.5);
      poly([[-12, -5], [-25, -17 + flap], [-34, -21 + flap], [-30, -9 + flap], [-22, -4]],
        hurt ? '#b6c7a6' : '#688458', null);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-11, -4); ctx.lineTo(-36, -23 + flap);
      ctx.moveTo(-11, -2); ctx.lineTo(-35, -12 + flap);
      ctx.moveTo(-11, 0); ctx.lineTo(-25, -3 + flap);
      ctx.stroke();
      for (var wc = 0; wc < 5; wc++) {
        A.fineRect(ctx, -16 - wc * 4, -13 + flap + (wc % 2) * 4, 0.7, 0.7, '#e3c57d');
      }

      poly([[10, -6], [24, -19 - flap], [38, -25 - flap], [35, -9 - flap], [24, -2], [12, 3]],
        hurt ? '#91a88a' : '#4a6142', '#9ab080', 0.5);
      poly([[12, -5], [25, -17 - flap], [34, -21 - flap], [30, -9 - flap], [22, -4]],
        hurt ? '#b6c7a6' : '#688458', null);
      ctx.strokeStyle = C.gold;
      ctx.beginPath();
      ctx.moveTo(11, -4); ctx.lineTo(36, -23 - flap);
      ctx.moveTo(11, -2); ctx.lineTo(35, -12 - flap);
      ctx.moveTo(11, 0); ctx.lineTo(25, -3 - flap);
      ctx.stroke();
      for (var wc2 = 0; wc2 < 5; wc2++) {
        A.fineRect(ctx, 16 + wc2 * 4, -13 - flap + (wc2 % 2) * 4, 0.7, 0.7, '#e3c57d');
      }

      for (var t = 0; t < 5; t++) {
        var ty = -1 + Math.sin(time * 3 + t * 0.7) * 1.2;
        A.rect(ctx, -18 - t * 4, ty, 5, 5 - t * 0.4, hurt ? '#a9bfa0' : (t % 2 ? '#5d7550' : '#4d6544'));
        A.rect(ctx, -19 - t * 4, ty - 2, 1.5, 2, C.gold);
      }

      A.rect(ctx, -14, -8, 28, 17, hurt ? '#b7cbaa' : '#5b7550');
      A.rect(ctx, -12, -10, 24, 15, hurt ? '#cddcc0' : '#6f8b5e');
      A.rect(ctx, -9, -8, 18, 11, hurt ? '#dfe9d2' : '#7d9869');
      for (var belly = 0; belly < 6; belly++) {
        A.rect(ctx, -8 + belly * 3, 4, 2.4, 3, belly % 2 ? '#c6b27e' : '#d9c78f');
        A.fineRect(ctx, -8 + belly * 3, 4.25, 2, 0.35, '#fff3c8');
      }
      for (var ridge = 0; ridge < 8; ridge++) {
        A.rect(ctx, -12 + ridge * 3, -11 + (ridge % 2), 2, 2, ridge % 2 ? C.gold : '#d9e6b0');
      }
      for (var sc = 0; sc < 12; sc++) {
        var sx = -10 + (sc % 6) * 3.5;
        var sy = -6 + Math.floor(sc / 6) * 5;
        A.fineRect(ctx, sx, sy, 1.2, 1.2, '#d9e6b0');
        A.fineRect(ctx, sx + 0.4, sy + 0.4, 0.5, 0.5, '#fff8dd');
      }

      A.rect(ctx, -9, 8, 6, 9, hurt ? '#a9bfa0' : '#4f6a46');
      A.rect(ctx, 5, 8, 6, 9, hurt ? '#a9bfa0' : '#4f6a46');
      A.rect(ctx, -9, 16, 7, 2, '#3f563a');
      A.rect(ctx, 5, 16, 7, 2, '#3f563a');
      for (var claw = 0; claw < 3; claw++) {
        A.rect(ctx, -9 + claw * 2.4, 18, 1.2, 2, '#f5e3ab');
        A.rect(ctx, 5 + claw * 2.4, 18, 1.2, 2, '#f5e3ab');
      }

      A.rect(ctx, 10, -10, 13, 12, hurt ? '#d3e0c6' : '#7fa06b');
      A.rect(ctx, 22, -8, 8, 7, hurt ? '#dfe9d2' : '#8fae72');
      A.rect(ctx, 28, -6, 4, 3, hurt ? '#eaf1de' : '#9db884');
      poly([[22, -2], [31, -2], [30, 0], [23, 1]], '#8fae72', '#4f6a46', 0.35);
      A.rect(ctx, 23, -1, 9, 2, '#4f6a46');
      for (var tooth = 0; tooth < 4; tooth++) A.rect(ctx, 24 + tooth * 2, 1, 1, 2, '#fff3c8');
      A.rect(ctx, 30, -5, 1, 1, '#2a1c12');

      poly([[10, -10], [9, -19], [13, -13]], C.goldLight, C.gold, 0.35);
      poly([[18, -10], [19, -19], [22, -13]], C.goldLight, C.gold, 0.35);
      poly([[13, -10], [14, -16], [17, -11]], '#c8b98f', null);
      ctx.strokeStyle = C.goldLight; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.arc(20, -13, 2.2, 0.3, Math.PI * 1.8); ctx.stroke();
      A.halo(ctx, 18.5, -5.5, 3, ember, 0.35);

      A.rect(ctx, 16, -7, 5, 4, '#2a1c12');
      A.rect(ctx, 17, -6, 3, 2, ember);
      A.fineRect(ctx, 17.4, -5.6, 0.8, 0.8, '#ffffff');
      A.rect(ctx, 26, -7, 3, 2, '#2a1c12');
      A.halo(ctx, 31, -4, 3 + breath * 3, ember, 0.45);

      for (var orn = 0; orn < 4; orn++) {
        A.fineRect(ctx, -14 + orn * 6, 1, 2, 1, C.gold);
        A.fineRect(ctx, -13 + orn * 6, -5, 1, 1, '#e3c57d');
      }
      A.fineRect(ctx, 12, -9, 6, 0.4, '#fff8dd');
      A.fineRect(ctx, 23, -7, 5, 0.4, '#fff8dd');
      A.fineRect(ctx, 28, -5, 3, 0.4, '#fff8dd');
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
      A.fineRect(ctx, -2.25, -25.75, 0.5, 3.5, 'rgba(255,232,170,0.65)');
      A.fineRect(ctx, 1.75, -25.75, 0.5, 3.5, 'rgba(255,232,170,0.45)');
      A.fineRect(ctx, -0.25, -28.5, 0.5, 0.5, C.goldLight);
      A.fineRect(ctx, -0.25, -22.25, 0.5, 0.5, '#8c6a3a');
      A.halo(ctx, gx, gy - 5, 14 + flicker, '#ffce6a', 0.5);
      A.halo(ctx, gx, gy - 5, 7 + flicker * 0.5, '#fff3c8', 0.35);
    });
  };

  A.foreground = function (ctx, level, camX, camY, time) {
    ctx.save();
    var u = A.U;
    var shift = ((camX * 0.32 + camY * 0.12) % (56 * u) + 56 * u) % (56 * u);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = level.id % 2 ? '#f1e2bd' : '#d4b87a';
    for (var side = -1; side <= 1; side += 2) {
      var bx = side < 0 ? -6 * u : 470 * u;
      for (var c = 0; c < 5; c++) {
        var cx = bx + side * c * 13 * u + side * shift * 0.15;
        ctx.fillRect(cx, 0, 3 * u, 270 * u);
        ctx.fillRect(cx - 1.5 * u, 8 * u, 6 * u, 2 * u);
        ctx.fillRect(cx - 1.5 * u, 232 * u, 6 * u, 2 * u);
      }
    }
    ctx.globalAlpha = 0.1;
    A.ornament(ctx, -shift, 260 * u, 540 * u, C.goldLight, 0);
    ctx.restore();
  };

  A.weather = function (ctx, level, time) {
    ctx.save();
    var u = A.U;
    var colors = ['#d9a55c', '#f5e3ab', '#c7d68d', '#e9dfc4', '#ffce6a'];
    var col = colors[(level.id - 1) % colors.length];
    for (var i = 0; i < 34; i++) {
      var speed = 0.4 + (i % 5) * 0.16;
      var x = ((i * 137 + time * speed * 42) % 500) * u;
      var y = ((i * 83 + time * (9 + i % 7) * 1.6) % 280) * u;
      ctx.globalAlpha = 0.12 + 0.12 * Math.sin(time * 2 + i);
      ctx.fillStyle = i % 4 ? col : '#8ee9f2';
      ctx.fillRect(x, y, (i % 3 ? 0.5 : 0.8) * u, (i % 4 ? 0.5 : 0.35) * u);
    }
    ctx.restore();
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
