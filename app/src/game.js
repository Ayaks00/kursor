
(function (KZ) {
  'use strict';

  
  
  var K = 4;
  var W = 480 * K, H = 270 * K, SCALE = 1;
  var A = KZ.Art;
  var SAVE_KEY = 'kz_lobachevsky_save_v1';

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function Game(canvas, input, audio) {
    this.canvas = canvas;
    this.scale = SCALE;
    
    
    if (canvas.width !== W * SCALE) canvas.width = W * SCALE;
    if (canvas.height !== H * SCALE) canvas.height = H * SCALE;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(SCALE, SCALE);
    this.scene = document.createElement('canvas');
    this.scene.width = W * SCALE; this.scene.height = H * SCALE;
    this.sctx = this.scene.getContext('2d');
    this.sctx.imageSmoothingEnabled = false;
    this.sctx.scale(SCALE, SCALE);

    this.input = input;
    this.audio = audio;
    this.state = 'menu';
    this.time = 0;
    this.stateTime = 0;
    this.levelIndex = 0;
    this.level = KZ.LEVELS[0];
    this.curvature = 0;
    this.target = 0;
    this.warp = 0;
    this.warpMax = 0.5;
    this.switches = 0;
    this.camX = 0;
    this.menuIndex = 0;
    this.menuRects = [];
    this.particles = [];
    this.effects = [];
    this.shakeTime = 0; this.shakeMag = 0;
    this.flashTime = 0; this.flashMax = 0;
    this.flashAlpha = 0; this.flashColor = '#e3c57d';
    this.frameNo = 0;
    this.hintTime = 0;
    this.player = { x: 0, y: 0, vx: 0, vy: 0, w: 10 * K, h: 14 * K, onGround: false, groundIdx: -1, coyote: 0, jumpBuf: 0, face: 1 };
    this.save = this.loadSave();
    this.result = null;
    this.victoryShown = false;
    this.setState('menu');
  }

  Game.prototype.loadSave = function () {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
    return { unlocked: 0, best: {} };
  };

  Game.prototype.writeSave = function () {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
  };

  Game.prototype.setState = function (s) {
    this.state = s;
    this.stateTime = 0;
    if (s === 'menu') this.menuIndex = 0;
    if (s === 'menu' || s === 'levels') this.audio.setTheme('menu');
    if (s === 'play') this.audio.setTheme(this.level.boss ? 'boss' : 'game');
    if (s === 'victory') this.audio.setTheme('victory');
  };

  Game.prototype.loadLevel = function (idx) {
    this.levelIndex = clamp(idx, 0, KZ.LEVELS.length - 1);
    this.level = KZ.LEVELS[this.levelIndex];
    var lv = this.level;
    this.items = lv.items.map(function (it) { return { x: it.x, y: it.y, type: it.type, taken: false }; });
    this.checkpoints = lv.checkpoints.map(function (c) { return { x: c.x, y: c.y, active: false }; });
    this.hazards = lv.hazards.map(function (h) { return Object.assign({}, h); });
    this.respawn = { x: lv.spawn[0], y: lv.spawn[1] };
    this.curvature = 0;
    this.target = 0;
    this.warp = 0.35;
    this.warpMax = 0.5;
    this.switches = 0;
    this.hintTime = lv.id === 1 ? 14 : 0;
    this.hintDismissed = false;
    this.particles = [];
    this.effects = [];
    this.shakeTime = 0; this.flashTime = 0;
    this.timeInLevel = 0;
    this.invuln = 0;
    this.resetPlayer();
    this.camX = 0;
    if (lv.boss) {
      this.boss = { x: 480 * K, y: 118 * K, hp: 3, flash: 0, fireTimer: 1.6, hitCooldown: 0, dead: false, fireballs: [] };
    } else {
      this.boss = null;
    }
    this.setState('intro');
  };

  Game.prototype.resetPlayer = function () {
    var p = this.player;
    p.x = this.respawn.x; p.y = this.respawn.y;
    p.vx = 0; p.vy = 0; p.onGround = false; p.groundIdx = -1;
    p.coyote = 0; p.jumpBuf = 0;
    p.trail = [];
  };

  Game.prototype.restartLevel = function () {
    this.audio.play('click', 0.35);
    this.loadLevel(this.levelIndex);
    this.setState('play');
  };

  Game.prototype.die = function () {
    if (this.state !== 'play') return;
    this.audio.play('fall', 0.7);
    this.burst(this.player.x + 5 * K, this.player.y + 7 * K, '#c45646', 16, { speed: 2.1, glow: true });
    this.ring(this.player.x + 5 * K, this.player.y + 7 * K, '#c45646', 26, 0.5);
    this.shake(2.2, 0.35);
    this.flash('#7e2a26', 0.3, 0.22);
    this.setState('death');
  };

  
  
  Game.prototype.settleOnPlatform = function () {
    var p = this.player;
    var cx = p.x + p.w / 2, bestY = Infinity;
    for (var i = 0; i < this.level.platforms.length; i++) {
      var plat = this.level.platforms[i];
      if (!this.platformSolid(plat)) continue;
      var ends = this.platformEnds(plat);
      var minX = Math.min(ends[0][0], ends[1][0]) - 10 * K;
      var maxX = Math.max(ends[0][0], ends[1][0]) + 10 * K;
      if (cx < minX || cx > maxX) continue;
      var sy = this.surfaceY(ends, cx);
      if (sy < bestY) bestY = sy;
    }
    if (bestY < Infinity && p.y + p.h >= bestY - 6 * K) {
      p.y = bestY - p.h - K;
      p.vy = 0;
    }
  };

  Game.prototype.respawnNow = function () {
    this.resetPlayer();
    this.settleOnPlatform();
    this.camX = clamp(this.player.x - W * 0.38, 0, Math.max(0, this.level.worldW - W));
    this.invuln = 1.8;
    if (this.boss) {
      this.boss.fireballs = [];
      this.boss.fireTimer = 1.6;
    }
    this.setState('play');
  };

  
  Game.prototype.spark = function (x, y, color, opt) {
    opt = opt || {};
    if (this.particles.length > 420) return;
    var speed = (opt.speed === undefined ? 1.6 : opt.speed) * K;
    var life = opt.life === undefined ? 0.4 + Math.random() * 0.5 : opt.life;
    this.particles.push({
      x: x, y: y,
      vx: (Math.random() * 2 - 1) * speed + (opt.vx || 0) * K,
      vy: (Math.random() * 2 - 1.3) * speed + (opt.vy || 0) * K,
      life: life,
      maxLife: life,
      color: color,
      size: (opt.size || 2) * K,
      gravity: (opt.gravity === undefined ? 0.06 : opt.gravity) * K,
      glow: !!opt.glow,
      screen: !!opt.screen
    });
  };

  Game.prototype.burst = function (x, y, color, n, opt) {
    for (var i = 0; i < n; i++) this.spark(x, y, color, opt);
  };

  
  Game.prototype.ring = function (x, y, color, maxR, life, screen) {
    if (this.effects.length > 40) return;
    this.effects.push({ x: x, y: y, color: color, r: 1, maxR: maxR * K, life: life, maxLife: life, screen: !!screen });
  };

  Game.prototype.shake = function (mag, time) {
    this.shakeMag = Math.max(this.shakeMag, mag * K);
    this.shakeTime = Math.max(this.shakeTime, time);
  };

  Game.prototype.flash = function (color, alpha, time) {
    this.flashColor = color;
    this.flashAlpha = Math.max(this.flashAlpha, alpha);
    this.flashTime = Math.max(this.flashTime, time);
    this.flashMax = this.flashTime;
  };

  Game.prototype.platformEnds = function (plat) {
    var t = this.curvature;
    return [
      [lerp(plat.a[0], plat.ca[0], t), lerp(plat.a[1], plat.ca[1], t)],
      [lerp(plat.b[0], plat.cb[0], t), lerp(plat.b[1], plat.cb[1], t)]
    ];
  };

  Game.prototype.platformSolid = function (plat) {
    return plat.kind === 'both' ||
      (plat.kind === 'flat' && this.curvature < 0.5) ||
      (plat.kind === 'curve' && this.curvature >= 0.5);
  };

  Game.prototype.surfaceY = function (ends, x) {
    var x1 = ends[0][0], x2 = ends[1][0];
    if (Math.abs(x2 - x1) < 0.001) return ends[0][1];
    var t = clamp((x - x1) / (x2 - x1), 0, 1);
    return lerp(ends[0][1], ends[1][1], t);
  };

  Game.prototype.update = function (dt) {
    this.time += dt;
    this.stateTime += dt;
    this.warp = Math.max(0, this.warp - dt);
    this.frameNo++;
    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
    if (this.flashTime > 0) {
      this.flashTime -= dt;
      if (this.flashTime <= 0) this.flashAlpha = 0;
    }

    if (this.input.mutePressed()) {
      var muted = this.audio.toggleMute();
      this.toast = muted ? 'ЗВУК ВЫКЛЮЧЕН' : 'ЗВУК ВКЛЮЧЁН';
      this.toastTime = 1.6;
    }
    if (this.toastTime > 0) this.toastTime -= dt;

    if (this.state === 'menu') this.updateMenu();
    else if (this.state === 'levels') this.updateLevelMenu();
    else if (this.state === 'how') {
      if (this.input.confirmPressed() || this.input.mouse.clicked) this.setState('menu');
    } else if (this.state === 'intro') {
      if (this.input.confirmPressed()) this.setState('play');
    } else if (this.state === 'play') this.updatePlay(dt);
    else if (this.state === 'pause') this.updatePause();
    else if (this.state === 'death') {
      if (this.stateTime > 1.25 || this.input.confirmPressed()) this.respawnNow();
    } else if (this.state === 'complete') {
      if (this.input.confirmPressed()) this.advance();
    } else if (this.state === 'victory') {
      
      if (this.frameNo % 3 === 0) {
        var festive = ['#f5e3ab', '#d9b15c', '#92b27a', '#b5643f', '#e9dfc4'];
        for (var ci = 0; ci < 2; ci++) {
          this.spark(Math.random() * W, -3, festive[(Math.random() * festive.length) | 0], {
            vx: (Math.random() - 0.5) * 0.9, vy: 0.5 + Math.random() * 0.7,
            gravity: 0.012, life: 4.5, size: 2, screen: true
          });
        }
      }
      if (this.input.confirmPressed() && this.stateTime > 1.5) this.setState('menu');
    }

    
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var q = this.particles[i];
      q.x += q.vx; q.y += q.vy; q.vy += q.gravity; q.life -= dt;
      if (q.life <= 0) this.particles.splice(i, 1);
    }
    
    for (var ef = this.effects.length - 1; ef >= 0; ef--) {
      var fx = this.effects[ef];
      fx.life -= dt;
      fx.r = fx.maxR * (1 - Math.max(0, fx.life) / fx.maxLife);
      if (fx.life <= 0) this.effects.splice(ef, 1);
    }
  };

  Game.prototype.updateMenu = function () {
    var items = this.menuItems();
    if (this.input.upPressed()) this.menuIndex = (this.menuIndex + items.length - 1) % items.length;
    if (this.input.downPressed()) this.menuIndex = (this.menuIndex + 1) % items.length;
    if (this.input.confirmPressed()) {
      this.audio.play('click', 0.5);
      this.menuAction(items[this.menuIndex].id);
      return;
    }
    if (this.input.mouse.clicked) {
      for (var i = 0; i < this.menuRects.length; i++) {
        var r = this.menuRects[i];
        if (r.x <= this.input.mouse.x && this.input.mouse.x <= r.x + r.w &&
            r.y <= this.input.mouse.y && this.input.mouse.y <= r.y + r.h) {
          this.audio.play('click', 0.5);
          this.menuAction(r.id);
          return;
        }
      }
    }
  };

  Game.prototype.menuItems = function () {
    var list = [{ id: 'new', label: 'НОВАЯ ИГРА' }];
    if (this.save.unlocked > 0) list.push({ id: 'continue', label: 'ПРОДОЛЖИТЬ' });
    list.push({ id: 'levels', label: 'ВЫБОР УРОВНЯ' });
    list.push({ id: 'how', label: 'КАК ИГРАТЬ' });
    return list;
  };

  Game.prototype.menuAction = function (id) {
    if (id === 'new') {
      this.save.unlocked = 0; this.save.best = {}; this.writeSave();
      this.loadLevel(0);
    } else if (id === 'continue') {
      this.loadLevel(clamp(this.save.unlocked, 0, KZ.LEVELS.length - 1));
    } else if (id === 'levels') {
      this.menuIndex = 0;
      this.setState('levels');
    } else if (id === 'how') this.setState('how');
  };

  Game.prototype.levelItems = function () {
    var list = [];
    for (var i = 0; i < KZ.LEVELS.length; i++) {
      var locked = i > this.save.unlocked;
      list.push({ id: 'level:' + i, label: (i + 1) + '. ' + KZ.LEVELS[i].name + (locked ? ' — ЗАКРЫТ' : ''), locked: locked });
    }
    list.push({ id: 'back', label: 'НАЗАД' });
    return list;
  };

  Game.prototype.updateLevelMenu = function () {
    var items = this.levelItems();
    if (this.input.upPressed()) this.menuIndex = (this.menuIndex + items.length - 1) % items.length;
    if (this.input.downPressed()) this.menuIndex = (this.menuIndex + 1) % items.length;
    if (this.input.pausePressed()) {
      this.audio.play('click', 0.4);
      this.setState('menu');
      return;
    }
    if (this.input.confirmPressed()) this.levelAction(items[this.menuIndex].id);
  };

  Game.prototype.levelAction = function (id) {
    if (id === 'back') {
      this.audio.play('click', 0.4);
      this.setState('menu');
      return;
    }
    var idx = parseInt(id.split(':')[1], 10);
    if (idx > this.save.unlocked) {
      this.audio.play('click', 0.2);
      return;
    }
    this.audio.play('click', 0.5);
    this.loadLevel(idx);
  };

  Game.prototype.advance = function () {
    var next = this.levelIndex + 1;
    if (next >= KZ.LEVELS.length) {
      this.setState('menu');
    } else {
      this.save.unlocked = Math.max(this.save.unlocked, next);
      this.save.best[this.level.id] = Math.round(this.timeInLevel * 10) / 10;
      this.writeSave();
      this.loadLevel(next);
    }
  };

  Game.prototype.updatePause = function () {
    if (this.input.pausePressed()) { this.setState('play'); return; }
    if (this.input.upPressed()) this.menuIndex = (this.menuIndex + 2) % 3;
    if (this.input.downPressed()) this.menuIndex = (this.menuIndex + 1) % 3;
    if (this.input.confirmPressed()) {
      this.audio.play('click', 0.4);
      if (this.menuIndex === 0) this.setState('play');
      else if (this.menuIndex === 1) this.restartLevel();
      else if (this.menuIndex === 2) this.audio.toggleMute();
    }
  };

  Game.prototype.updatePlay = function (dt) {
    var inp = this.input;
    if (inp.pausePressed()) { this.menuIndex = 0; this.audio.play('click', 0.3); this.setState('pause'); return; }
    if (inp.restartPressed()) { this.restartLevel(); return; }
    if (inp.togglePressed()) {
      this.target = this.target ? 0 : 1;
      this.warp = 0.72;
      this.warpMax = 0.72;
      this.switches++;
      this.audio.play('toggle', 0.5);
      var px = this.player.x + 5 * K, py = this.player.y + 6 * K;
      var vx = this.level.vanish.x, vy = this.level.vanish.y;
      var tint = this.target ? '#8ee9f2' : '#f2d68a';
      this.burst(px, py, '#f5e3ab', 22, { speed: 2.6, glow: true, gravity: -0.01 });
      this.burst(vx, vy, tint, 18, { speed: 3.2, glow: true, gravity: 0 });
      this.ring(px, py, '#f5e3ab', 26, 0.5);
      this.ring(px, py, tint, 44, 0.7);
      this.ring(vx, vy, '#e3c57d', 38, 0.65);
      this.ring(vx, vy, tint, 72, 0.9);
      this.flash(tint, 0.18, 0.34);
      this.shake(1.4, 0.3);
    }
    this.curvature += (this.target - this.curvature) * Math.min(1, dt * 10);
    if (Math.abs(this.target - this.curvature) < 0.005) this.curvature = this.target;
    this.timeInLevel += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hintTime > 0) this.hintTime -= dt;
    
    
    if (this.hintTime > 0 && inp.jumpPressed()) {
      this.hintTime = 0;
      this.hintDismissed = true;
      inp.consume('Space'); inp.consume('ArrowUp'); inp.consume('KeyW');
      this.audio.play('click', 0.3);
    }

    var lv = this.level, p = this.player;
    var dir = (inp.right() ? 1 : 0) - (inp.left() ? 1 : 0);
    if (dir) p.face = dir;
    var accel = p.onGround ? 0.3 : 0.14;
    p.vx += (dir * lv.speed - p.vx) * accel;
    if (!dir && p.onGround) p.vx *= 0.72;

    if (inp.jumpPressed()) p.jumpBuf = 8;
    if (p.jumpBuf > 0) p.jumpBuf -= 1;
    if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = lv.jump;
      p.onGround = false;
      p.groundIdx = -1;
      p.coyote = 0;
      p.jumpBuf = 0;
      p.jumpHeld = true;
      this.audio.play('jump', 0.55);
      this.burst(p.x + 5 * K, p.y + 14 * K, this.target ? '#e3c57d' : '#e6c47a', 6, { speed: 1.2, size: 1, gravity: 0.09 });
      this.ring(p.x + 5 * K, p.y + 14 * K, '#d9b15c', 9, 0.28);
    }
    if (!inp.jumpDown() && p.jumpHeld && p.vy < -2) { p.vy *= 0.55; p.jumpHeld = false; }

    if (p.onGround) p.coyote = 5;
    else if (p.coyote > 0) p.coyote--;

    var prevBottom = p.y + p.h;
    var prevX = p.x + p.w / 2;
    p.vy += lv.gravity;
    if (p.vy > 6.5 * K) p.vy = 6.5 * K;
    p.x = clamp(p.x + p.vx, 0, lv.worldW - p.w);
    p.y += p.vy;

    
    if (!p.trail) p.trail = [];
    if (this.frameNo % 2 === 0 && Math.abs(p.vx) > 0.5 * K) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 5) p.trail.shift();
    }

    var wasGround = p.onGround;
    var oldIdx = p.groundIdx;
    p.onGround = false;
    p.groundIdx = -1;

    var bestY = Infinity, bestIdx = -1;
    var endsCache = [];
    for (var i = 0; i < lv.platforms.length; i++) {
      var plat = lv.platforms[i];
      endsCache[i] = this.platformEnds(plat);
      if (!this.platformSolid(plat)) continue;
      var ends = endsCache[i];
      var minX = Math.min(ends[0][0], ends[1][0]) - 2 * K;
      var maxX = Math.max(ends[0][0], ends[1][0]) + 2 * K;
      var cx = p.x + p.w / 2;
      if (cx < minX || cx > maxX) continue;
      var syPrev = this.surfaceY(ends, prevX);
      var syNow = this.surfaceY(ends, cx);
      var bottom = p.y + p.h;
      var crossing = p.vy >= 0 && prevBottom <= syPrev + 4 * K && bottom >= syNow;
      var sliding = wasGround && oldIdx === i && Math.abs(bottom - syNow) < 10 * K && bottom >= syNow - 3 * K;
      if ((crossing || sliding) && syNow < bestY) { bestY = syNow; bestIdx = i; }
    }
    if (bestIdx >= 0) {
      var impact = p.vy;
      p.y = bestY - p.h;
      p.vy = 0;
      p.onGround = true;
      p.groundIdx = bestIdx;
      p.coyote = 5;
      if (!wasGround && impact > 1.7 * K) {
        this.audio.play('land', Math.min(0.5, 0.2 + impact / K * 0.05));
        this.burst(p.x + 5 * K, bestY, '#c8b998', impact > 4 * K ? 8 : 4, { speed: 1, size: 1, gravity: 0.08 });
        this.ring(p.x + 5 * K, bestY, '#e9dfc4', 11, 0.25);
        if (impact > 4 * K) this.shake(0.5, 0.12);
      }
    }

    if (p.y > 290 * K) { this.die(); return; }

    
    for (var q = 0; q < this.items.length; q++) {
      var it = this.items[q];
      if (it.taken) continue;
      if (Math.abs(p.x + 5 * K - it.x) < 9 * K && Math.abs(p.y + 7 * K - it.y) < 10 * K) {
        it.taken = true;
        this.audio.play('coin', 0.5);
        var sparkle = it.type === 'chakchak' ? '#ffce6a' : '#fff3c8';
        this.burst(it.x, it.y, sparkle, 12, { speed: 2, size: 2, glow: true });
        this.ring(it.x, it.y, sparkle, 18, 0.4);
        this.flash(sparkle, 0.05, 0.1);
      }
    }
    
    for (var c = 0; c < this.checkpoints.length; c++) {
      var cp = this.checkpoints[c];
      if (!cp.active && Math.abs(p.x + 5 * K - cp.x) < 10 * K && Math.abs(p.y + 7 * K - cp.y) < 14 * K) {
        cp.active = true;
        
        this.respawn = { x: cp.x - 5 * K, y: cp.y - 16 * K };
        this.audio.play('checkpoint', 0.55);
        this.burst(cp.x, cp.y - 14, '#f5e3ab', 18, { speed: 1.6, size: 2, glow: true, gravity: -0.01 });
        this.ring(cp.x, cp.y - 14, '#d9b15c', 24, 0.6);
        this.flash('#f5e3ab', 0.09, 0.2);
        this.toast = 'ЧЕКПОИНТ АКТИВИРОВАН';
        this.toastTime = 1.4;
      }
    }
    
    var hx, hy, hw = 0, hh = 0;
    for (var h = 0; h < this.hazards.length; h++) {
      var hz = this.hazards[h];
      if (hz.type === 'spikes') { hx = hz.x; hy = hz.y; hw = hz.w; hh = 7 * K; }
      else {
        var ph = this.time * hz.speed;
        hz.x = lerp(hz.ax, hz.bx, (Math.sin(ph) + 1) / 2);
        hz.y = lerp(hz.ay, hz.by, (Math.sin(ph * 0.8 + 1) + 1) / 2);
        hx = hz.x - hz.r; hy = hz.y - hz.r; hw = hz.r * 2; hh = hz.r * 2;
      }
      if (this.invuln <= 0 && p.x + p.w > hx && p.x < hx + hw && p.y + p.h > hy && p.y < hy + hh) { this.die(); return; }
    }

    if (this.boss) this.updateBoss(dt);
    else if (this.level.goal && Math.abs(p.x + 5 * K - this.level.goal.x) < 12 * K &&
             Math.abs(p.y + 7 * K - this.level.goal.y) < 20 * K) {
      this.audio.play('win', 0.55);
      this.burst(this.level.goal.x + 8 * K, this.level.goal.y + 12 * K, '#f5e3ab', 26, { speed: 2.4, size: 2, glow: true, gravity: -0.02 });
      this.ring(this.level.goal.x + 8 * K, this.level.goal.y + 12 * K, '#d9b15c', 36, 0.8);
      this.flash('#f5e3ab', 0.16, 0.3);
      this.setState('complete');
    }

    this.camX = clamp(p.x - W * 0.38, 0, Math.max(0, lv.worldW - W));
  };

  Game.prototype.updateBoss = function (dt) {
    var b = this.boss, p = this.player;
    if (b.dead) {
      if (this.stateTime > 2.4) this.setState('victory');
      return;
    }
    b.x = 480 * K + Math.sin(this.time * 0.85) * 90 * K;
    b.y = 118 * K + Math.sin(this.time * 1.7) * 10 * K;
    if (b.flash > 0) b.flash -= dt;
    if (b.hitCooldown > 0) b.hitCooldown -= dt;

    b.fireTimer -= dt;
    if (b.fireTimer <= 0) {
      var shots = b.hp === 3 ? 1 : 2;
      for (var s = 0; s < shots; s++) {
        var ang = Math.atan2(p.y - b.y, p.x - b.x) + (s - (shots - 1) / 2) * 0.28;
        var sp = (2.1 + (3 - b.hp) * 0.3) * K;
        b.fireballs.push({ x: b.x, y: b.y + 4 * K, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 4 });
      }
      b.fireTimer = Math.max(0.9, 1.9 - (3 - b.hp) * 0.35);
      this.audio.play('hit', 0.25);
      this.ring(b.x, b.y, '#d97846', 14, 0.3);
      this.burst(b.x, b.y + 4 * K, '#f5e3ab', 6, { speed: 1.2, size: 1, glow: true, gravity: 0 });
    }
    for (var i = b.fireballs.length - 1; i >= 0; i--) {
      var f = b.fireballs[i];
      f.x += f.vx; f.y += f.vy; f.life -= dt;
      if (this.frameNo % 2 === 0) {
        this.spark(f.x, f.y, i % 2 ? '#b5643f' : '#e3c57d', {
          vx: -f.vx * 0.08, vy: -f.vy * 0.08, gravity: 0, life: 0.35, size: 1, glow: true
        });
      }
      if (f.life <= 0 || f.y > 260 * K || f.x < 0 || f.x > this.level.worldW) b.fireballs.splice(i, 1);
      else if (this.invuln <= 0 && Math.abs(f.x - (p.x + 5 * K)) < 7 * K && Math.abs(f.y - (p.y + 7 * K)) < 7 * K) { this.die(); return; }
    }

    if (this.curvature > 0.55 && b.hitCooldown <= 0 &&
        Math.abs(p.x + 5 * K - b.x) < 19 * K && Math.abs(p.y + 7 * K - b.y) < 14 * K) {
      b.hp--;
      b.flash = 0.3;
      b.hitCooldown = 0.9;
      this.invuln = 0.6;
      p.vy = -4;
      this.audio.play('break', 0.65);
      this.burst(b.x, b.y, '#e9ffb0', 28, { speed: 2.4, size: 2, glow: true });
      this.ring(b.x, b.y, '#f5e3ab', 30, 0.5);
      this.ring(b.x, b.y, '#d9b15c', 18, 0.35);
      this.flash('#fff3c8', 0.2, 0.22);
      this.shake(2.4, 0.3);
      b.fireballs = [];
      if (b.hp <= 0) {
        b.dead = true;
        this.burst(b.x, b.y, '#fff3a8', 60, { speed: 3, size: 3, glow: true });
        this.ring(b.x, b.y, '#fff3c8', 58, 0.9);
        this.flash('#e3c57d', 0.32, 0.5);
        this.shake(3, 0.5);
        this.audio.play('win', 0.7);
      }
    }
  };

  

  Game.prototype.wrapText = function (ctx, str, x, y, maxW, lineH, opt) {
    var words = str.split(' ');
    var line = '', lines = 0;
    opt = opt || {};
    var size = opt.size || 8;
    ctx.font = A.font(size, opt.bold, opt.mono);
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        A.text(ctx, line, x, y + lines * lineH, opt);
        lines++; line = words[i];
      } else line = test;
    }
    if (line) { A.text(ctx, line, x, y + lines * lineH, opt); lines++; }
    return lines;
  };

  Game.prototype.render = function () {
    var c = this.ctx;
    var warping = this.warp > 0 && this.state === 'play';
    
    
    var s = warping ? this.sctx : c;
    s.clearRect(0, 0, W, H);
    var amp = this.shakeTime > 0 ? this.shakeMag * Math.min(1, this.shakeTime * 6) : 0;
    var ox = amp > 0 ? Math.round((Math.random() * 2 - 1) * amp) : 0;
    var oy = amp > 0 ? Math.round((Math.random() * 2 - 1) * amp) : 0;

    if (!warping && amp > 0) {
      s.fillStyle = '#101026';
      s.fillRect(0, 0, W, H);
    }
    s.save();
    
    if (!warping) s.translate(ox, oy);
    if (this.state === 'menu' || this.state === 'how' || this.state === 'levels') {
      A.backdrop(s, KZ.LEVELS[4], 0, this.time);
      s.fillStyle = 'rgba(9,9,22,0.55)';
      s.fillRect(0, 0, W, H);
      A.halo(s, 240, 74, 84, '#d9b15c', 0.12);
      for (var st = 0; st < 28; st++) {
        A.rect(s, (st * 61 + this.time * 6) % W, 240 + (st % 4) * 6, 2, 2, '#c8a45c');
      }
    } else {
      this.drawWorld(s);
    }
    s.restore();

    if (warping) {
      c.clearRect(0, 0, W, H);
      var k = Math.sin((this.warp / this.warpMax) * Math.PI);
      var dir = this.target ? 1 : -1;
      var SLICE = 3 * K;
      for (var y = 0; y < H + SLICE; y += SLICE) {
        var sy = Math.min(y, H - SLICE);
        var dx = Math.sin((y - this.level.vanish.y) / H * Math.PI) * 11 * K * k * dir;
        c.drawImage(this.scene, 0, sy * this.scale, this.scene.width, SLICE * this.scale,
          dx - K + ox, y - K + oy, W + 2 * K, SLICE);
      }
      var vx = this.level.vanish.x, vy = this.level.vanish.y;
      c.save();
      c.globalAlpha = 0.6 * k;
      c.lineWidth = K * 0.5;
      for (var ri = 0; ri < 5; ri++) {
        c.strokeStyle = ri % 2 ? '#8ee9f2' : '#f2d68a';
        c.beginPath();
        c.arc(vx, vy, (26 + ri * 46) * K * (0.4 + k), 0, Math.PI * 2);
        c.stroke();
      }
      c.globalAlpha = 0.32 * k;
      for (var ra = 0; ra < 14; ra++) {
        var ang = ra / 14 * Math.PI * 2 + this.time * 3 * dir;
        c.strokeStyle = ra % 3 ? '#f5e3ab' : '#8ee9f2';
        c.beginPath();
        c.moveTo(vx + Math.cos(ang) * 18 * K, vy + Math.sin(ang) * 18 * K);
        c.lineTo(vx + Math.cos(ang) * 290 * K, vy + Math.sin(ang) * 290 * K);
        c.stroke();
      }
      c.globalAlpha = 0.3 * k;
      c.fillStyle = '#e3c57d';
      c.fillRect(0, 0, W, H);
      c.restore();
    }
    
    if (this.flashTime > 0 && this.flashAlpha > 0) {
      c.globalAlpha = this.flashAlpha * Math.min(1, this.flashTime / Math.max(0.01, this.flashMax));
      c.fillStyle = this.flashColor;
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }

    if (this.ui) this.ui.render(this);
  };

  Game.prototype.drawWorld = function (ctx) {
    var lv = this.level;
    A.backdrop(ctx, lv, this.camX, this.time);

    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);

    A.convergenceGuides(ctx, lv, this.curvature, this.time);
    A.idealPoint(ctx, lv.vanish, this.time, this.curvature);

    for (var i = 0; i < lv.platforms.length; i++) {
      var plat = lv.platforms[i];
      var ends = this.platformEnds(plat);
      if (Math.max(ends[0][0], ends[1][0]) < this.camX - 20 ||
          Math.min(ends[0][0], ends[1][0]) > this.camX + W + 20 * K) continue;
      var alpha = plat.kind === 'both' ? 1 :
        (plat.kind === 'curve' ? 0.18 + this.curvature * 0.82 : 1.0 - this.curvature * 0.82);
      A.platform(ctx, ends[0], ends[1], plat.style, alpha, this.time);
    }

    if (lv.lamps) {
      for (var li = 0; li < lv.lamps.length; li++) {
        var lampX = lv.lamps[li][0];
        if (lampX < this.camX - 60 || lampX > this.camX + W + 60) continue;
        A.lantern(ctx, lampX, lv.lamps[li][1], this.time);
      }
    }

    for (var q = 0; q < this.items.length; q++) if (!this.items[q].taken) A.pickup(ctx, this.items[q], this.time);
    for (var c = 0; c < this.checkpoints.length; c++) A.flag(ctx, this.checkpoints[c], this.time);
    for (var h = 0; h < this.hazards.length; h++) {
      var hz = this.hazards[h];
      if (hz.type === 'spikes') A.spikes(ctx, hz); else A.orb(ctx, hz, this.time);
    }
    if (lv.goal) {
      var active = this.items.filter(function (it) { return it.taken; }).length >= 4;
      A.door(ctx, lv.goal, this.time, active);
    }
    if (this.boss) {
      if (!this.boss.dead) A.dragon(ctx, this.boss, this.time + (this.boss.flash > 0 ? 5 : 0));
      for (var f = 0; f < this.boss.fireballs.length; f++) A.fireball(ctx, this.boss.fireballs[f], this.time);
    }
    if (this.state !== 'death' && this.player.trail) {
      ctx.save();
      for (var tr = 0; tr < this.player.trail.length; tr++) {
        var ghost = this.player.trail[tr];
        ctx.globalAlpha = (tr + 1) / this.player.trail.length * 0.28;
        A.rect(ctx, ghost.x + 1 * K, ghost.y + 6 * K, 8 * K, 6 * K,
          this.curvature > 0.5 ? A.colors.gold : A.colors.parchment);
      }
      ctx.restore();
    }
    if (this.state !== 'death' && !(this.invuln > 0 && ((this.time * 14) | 0) % 2 === 0)) {
      A.player(ctx, this.player, this.time, this.curvature > 0.5);
    }

    for (var p = 0; p < this.particles.length; p++) if (!this.particles[p].screen) A.drawParticle(ctx, this.particles[p]);
    for (var e2 = 0; e2 < this.effects.length; e2++) {
      if (!this.effects[e2].screen) A.drawRing(ctx, this.effects[e2]);
    }
    ctx.restore();

    
    if (this.curvature > 0.02) {
      ctx.save();
      ctx.globalAlpha = this.curvature * 0.14;
      ctx.strokeStyle = '#e3c57d';
      for (var l = 0; l < 5; l++) {
        ctx.beginPath();
        ctx.arc(lv.vanish.x - this.camX, lv.vanish.y, (45 + l * 38 + Math.sin(this.time * 2 + l) * 4) * K, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    
    A.vignette(ctx);

    
    for (var se = 0; se < this.effects.length; se++) {
      if (this.effects[se].screen) A.drawRing(ctx, this.effects[se]);
    }
    for (var sp = 0; sp < this.particles.length; sp++) {
      if (this.particles[sp].screen) A.drawParticle(ctx, this.particles[sp]);
    }
  };

  Game.prototype.drawMenu = function (c) {
    
  };

  Game.prototype.drawHow = function (c) {
    
  };

  Game.prototype.drawAbout = function (c) {
    
  };

  Game.prototype.drawExit = function (c) {
    
  };

  Game.prototype.drawIntro = function (c) {
    
  };

  Game.prototype.drawHUD = function (c) {
    
  };

  Game.prototype.dim = function (c, alpha) {
    c.fillStyle = 'rgba(6,6,16,' + (alpha || 0.72) + ')';
    c.fillRect(0, 0, W, H);
  };

  Game.prototype.drawPause = function (c) {
    
  };

  Game.prototype.drawDeath = function (c) {
    
  };

  Game.prototype.drawComplete = function (c) {
    
  };

  Game.prototype.drawVictory = function (c) {
    
  };

  KZ.Game = Game;
  KZ.W = W; KZ.H = H;
})(window.KZ = window.KZ || {});
