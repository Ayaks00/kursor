/* Основной игровой цикл: состояния, физика, механика кривизны, UI. */
(function (KZ) {
  'use strict';

  var W = 480, H = 270;
  var A = KZ.Art;
  var SAVE_KEY = 'kz_lobachevsky_save_v1';

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function Game(canvas, input, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.scene = document.createElement('canvas');
    this.scene.width = W; this.scene.height = H;
    this.sctx = this.scene.getContext('2d');
    this.sctx.imageSmoothingEnabled = false;

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
    this.deaths = 0;
    this.switches = 0;
    this.camX = 0;
    this.menuIndex = 0;
    this.menuRects = [];
    this.particles = [];
    this.hintTime = 0;
    this.player = { x: 0, y: 0, vx: 0, vy: 0, w: 10, h: 14, onGround: false, groundIdx: -1, coyote: 0, jumpBuf: 0, face: 1 };
    this.save = this.loadSave();
    this.result = null;
    this.victoryShown = false;
    this.setState('menu');
  }

  Game.prototype.loadSave = function () {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { unlocked: 0, best: {} };
  };

  Game.prototype.writeSave = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch (e) {}
  };

  Game.prototype.setState = function (s) {
    this.state = s;
    this.stateTime = 0;
    if (s === 'menu') this.menuIndex = 0;
    if (s === 'menu') this.audio.setTheme('menu');
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
    this.deaths = 0;
    this.switches = 0;
    this.hintTime = lv.id === 1 ? 14 : 0;
    this.particles = [];
    this.timeInLevel = 0;
    this.invuln = 0;
    this.resetPlayer();
    this.camX = 0;
    if (lv.boss) {
      this.boss = { x: 480, y: 118, hp: 3, flash: 0, fireTimer: 1.6, hitCooldown: 0, dead: false, fireballs: [] };
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
  };

  Game.prototype.restartLevel = function () {
    this.audio.play('click', 0.35);
    this.loadLevel(this.levelIndex);
    this.setState('play');
  };

  Game.prototype.die = function () {
    if (this.state !== 'play') return;
    this.deaths++;
    this.audio.play('fall', 0.7);
    this.burst(this.player.x + 5, this.player.y + 7, '#e26c73', 12);
    this.setState('death');
  };

  Game.prototype.respawnNow = function () {
    this.resetPlayer();
    this.camX = clamp(this.player.x - W * 0.38, 0, Math.max(0, this.level.worldW - W));
    this.invuln = 1.8;
    if (this.boss) {
      this.boss.fireballs = [];
      this.boss.fireTimer = 1.6;
    }
    this.setState('play');
  };

  Game.prototype.burst = function (x, y, color, n) {
    for (var i = 0; i < n; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() * 2 - 1) * 1.6,
        vy: (Math.random() * 2 - 1.3) * 1.6,
        life: 0.4 + Math.random() * 0.5,
        color: color
      });
    }
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

    if (this.input.mutePressed()) {
      var muted = this.audio.toggleMute();
      this.toast = muted ? 'ЗВУК ВЫКЛЮЧЕН' : 'ЗВУК ВКЛЮЧЁН';
      this.toastTime = 1.6;
    }
    if (this.toastTime > 0) this.toastTime -= dt;

    if (this.state === 'menu') this.updateMenu();
    else if (this.state === 'how' || this.state === 'about' || this.state === 'exit') {
      if (this.input.confirmPressed() || this.input.mouse.clicked ||
          (this.state === 'about' && this.input.pausePressed())) this.setState('menu');
    } else if (this.state === 'intro') {
      if (this.input.confirmPressed()) this.setState('play');
    } else if (this.state === 'play') this.updatePlay(dt);
    else if (this.state === 'pause') this.updatePause();
    else if (this.state === 'death') {
      if (this.stateTime > 1.25 || this.input.confirmPressed()) this.respawnNow();
    } else if (this.state === 'complete') {
      if (this.input.confirmPressed()) this.advance();
    } else if (this.state === 'victory') {
      if (this.input.confirmPressed() && this.stateTime > 1.5) this.setState('menu');
    }

    // частицы
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var q = this.particles[i];
      q.x += q.vx; q.y += q.vy; q.vy += 0.06; q.life -= dt;
      if (q.life <= 0) this.particles.splice(i, 1);
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
    list.push({ id: 'how', label: 'КАК ИГРАТЬ' });
    list.push({ id: 'about', label: 'ОБ ИГРЕ' });
    list.push({ id: 'exit', label: 'ВЫХОД' });
    return list;
  };

  Game.prototype.menuAction = function (id) {
    if (id === 'new') {
      this.save.unlocked = 0; this.save.best = {}; this.writeSave();
      this.loadLevel(0);
    } else if (id === 'continue') {
      this.loadLevel(clamp(this.save.unlocked, 0, KZ.LEVELS.length - 1));
    } else if (id === 'how') this.setState('how');
    else if (id === 'about') this.setState('about');
    else if (id === 'exit') this.setState('exit');
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
    if (this.input.upPressed()) this.menuIndex = (this.menuIndex + 3) % 4;
    if (this.input.downPressed()) this.menuIndex = (this.menuIndex + 1) % 4;
    if (this.input.confirmPressed()) {
      this.audio.play('click', 0.4);
      if (this.menuIndex === 0) this.setState('play');
      else if (this.menuIndex === 1) this.restartLevel();
      else if (this.menuIndex === 2) this.audio.toggleMute();
      else this.setState('menu');
    }
  };

  Game.prototype.updatePlay = function (dt) {
    var inp = this.input;
    if (inp.pausePressed()) { this.menuIndex = 0; this.audio.play('click', 0.3); this.setState('pause'); return; }
    if (inp.restartPressed()) { this.restartLevel(); return; }
    if (inp.togglePressed()) {
      this.target = this.target ? 0 : 1;
      this.warp = 0.5;
      this.switches++;
      this.audio.play('toggle', 0.5);
      this.burst(this.player.x + 5, this.player.y + 6, '#8ee9f2', 6);
    }
    this.curvature += (this.target - this.curvature) * Math.min(1, dt * 10);
    if (Math.abs(this.target - this.curvature) < 0.005) this.curvature = this.target;
    this.timeInLevel += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hintTime > 0) this.hintTime -= dt;

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
      this.burst(p.x + 5, p.y + 14, this.target ? '#8ee9f2' : '#f2d79a', 4);
    }
    if (!inp.jumpDown() && p.jumpHeld && p.vy < -2) { p.vy *= 0.55; p.jumpHeld = false; }

    if (p.onGround) p.coyote = 5;
    else if (p.coyote > 0) p.coyote--;

    var prevBottom = p.y + p.h;
    var prevX = p.x + p.w / 2;
    p.vy += lv.gravity;
    if (p.vy > 6.5) p.vy = 6.5;
    p.x = clamp(p.x + p.vx, 0, lv.worldW - p.w);
    p.y += p.vy;

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
      var minX = Math.min(ends[0][0], ends[1][0]) - 2;
      var maxX = Math.max(ends[0][0], ends[1][0]) + 2;
      var cx = p.x + p.w / 2;
      if (cx < minX || cx > maxX) continue;
      var syPrev = this.surfaceY(ends, prevX);
      var syNow = this.surfaceY(ends, cx);
      var bottom = p.y + p.h;
      var crossing = p.vy >= 0 && prevBottom <= syPrev + 4 && bottom >= syNow;
      var sliding = wasGround && oldIdx === i && Math.abs(bottom - syNow) < 10 && bottom >= syNow - 3;
      if ((crossing || sliding) && syNow < bestY) { bestY = syNow; bestIdx = i; }
    }
    if (bestIdx >= 0) {
      p.y = bestY - p.h;
      p.vy = 0;
      p.onGround = true;
      p.groundIdx = bestIdx;
      p.coyote = 5;
    }

    if (p.y > 290) { this.die(); return; }

    // предметы
    for (var q = 0; q < this.items.length; q++) {
      var it = this.items[q];
      if (it.taken) continue;
      if (Math.abs(p.x + 5 - it.x) < 9 && Math.abs(p.y + 7 - it.y) < 10) {
        it.taken = true;
        this.audio.play('coin', 0.5);
        this.burst(it.x, it.y, it.type === 'chakchak' ? '#ffce6a' : '#fff3c8', 8);
      }
    }
    // чекпоинты
    for (var c = 0; c < this.checkpoints.length; c++) {
      var cp = this.checkpoints[c];
      if (!cp.active && Math.abs(p.x + 5 - cp.x) < 10 && Math.abs(p.y + 7 - cp.y) < 14) {
        cp.active = true;
        this.respawn = { x: cp.x - 5, y: cp.y - 16 };
        this.audio.play('checkpoint', 0.55);
        this.toast = 'ЧЕКПОИНТ АКТИВИРОВАН';
        this.toastTime = 1.4;
      }
    }
    // опасности
    var hx, hy, hw = 0, hh = 0;
    for (var h = 0; h < this.hazards.length; h++) {
      var hz = this.hazards[h];
      if (hz.type === 'spikes') { hx = hz.x; hy = hz.y; hw = hz.w; hh = 7; }
      else {
        var ph = this.time * hz.speed;
        hz.x = lerp(hz.ax, hz.bx, (Math.sin(ph) + 1) / 2);
        hz.y = lerp(hz.ay, hz.by, (Math.sin(ph * 0.8 + 1) + 1) / 2);
        hx = hz.x - hz.r; hy = hz.y - hz.r; hw = hz.r * 2; hh = hz.r * 2;
      }
      if (this.invuln <= 0 && p.x + p.w > hx && p.x < hx + hw && p.y + p.h > hy && p.y < hy + hh) { this.die(); return; }
    }

    if (this.boss) this.updateBoss(dt);
    else if (this.level.goal && Math.abs(p.x + 5 - this.level.goal.x) < 12 &&
             Math.abs(p.y + 7 - this.level.goal.y) < 20) {
      this.audio.play('win', 0.55);
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
    b.x = 480 + Math.sin(this.time * 0.85) * 210;
    b.y = 118 + Math.sin(this.time * 1.7) * 10;
    if (b.flash > 0) b.flash -= dt;
    if (b.hitCooldown > 0) b.hitCooldown -= dt;

    b.fireTimer -= dt;
    if (b.fireTimer <= 0) {
      var shots = b.hp === 3 ? 1 : 2;
      for (var s = 0; s < shots; s++) {
        var ang = Math.atan2(p.y - b.y, p.x - b.x) + (s - (shots - 1) / 2) * 0.28;
        var sp = 2.1 + (3 - b.hp) * 0.3;
        b.fireballs.push({ x: b.x, y: b.y + 4, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 4 });
      }
      b.fireTimer = Math.max(0.9, 1.9 - (3 - b.hp) * 0.35);
      this.audio.play('hit', 0.25);
    }
    for (var i = b.fireballs.length - 1; i >= 0; i--) {
      var f = b.fireballs[i];
      f.x += f.vx; f.y += f.vy; f.life -= dt;
      if (f.life <= 0 || f.y > 260 || f.x < 0 || f.x > this.level.worldW) b.fireballs.splice(i, 1);
      else if (this.invuln <= 0 && Math.abs(f.x - (p.x + 5)) < 7 && Math.abs(f.y - (p.y + 7)) < 7) { this.die(); return; }
    }

    if (this.curvature > 0.55 && b.hitCooldown <= 0 &&
        Math.abs(p.x + 5 - b.x) < 19 && Math.abs(p.y + 7 - b.y) < 14) {
      b.hp--;
      b.flash = 0.3;
      b.hitCooldown = 0.9;
      this.invuln = 0.6;
      p.vy = -4;
      this.audio.play('break', 0.65);
      this.burst(b.x, b.y, '#e9ffb0', 18);
      b.fireballs = [];
      if (b.hp <= 0) {
        b.dead = true;
        this.burst(b.x, b.y, '#fff3a8', 40);
        this.audio.play('win', 0.7);
      }
    }
  };

  /* ---------- отрисовка ---------- */

  Game.prototype.wrapText = function (ctx, str, x, y, maxW, lineH, opt) {
    var words = str.split(' ');
    var line = '', lines = 0;
    opt = opt || {};
    var size = opt.size || 8;
    ctx.font = (opt.bold ? 'bold ' : '') + size + 'px "DejaVu Sans Mono", "Courier New", monospace';
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
    var s = this.sctx;
    s.clearRect(0, 0, W, H);

    if (this.state === 'menu' || this.state === 'how' || this.state === 'about' || this.state === 'exit') {
      A.backdrop(s, KZ.LEVELS[3], 0, this.time);
      s.fillStyle = 'rgba(9,9,22,0.55)';
      s.fillRect(0, 0, W, H);
      for (var st = 0; st < 28; st++) {
        A.rect(s, (st * 61 + this.time * 6) % W, 240 + (st % 4) * 6, 2, 2, '#c8a45c');
      }
    } else {
      this.drawWorld(s);
    }

    var c = this.ctx;
    c.clearRect(0, 0, W, H);
    if (this.warp > 0 && this.state === 'play') {
      var k = Math.sin((this.warp / 0.5) * Math.PI);
      var dir = this.target ? 1 : -1;
      for (var y = 0; y < H; y += 3) {
        var dx = Math.sin((y - this.level.vanish.y) / H * Math.PI) * 7 * k * dir;
        c.drawImage(this.scene, 0, y, W, 3, dx, y, W, 3);
      }
      c.globalAlpha = 0.22 * k;
      c.fillStyle = '#8ee9f2';
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    } else {
      c.drawImage(this.scene, 0, 0);
    }

    if (this.toastTime > 0) {
      var alpha = Math.min(1, this.toastTime * 2);
      c.globalAlpha = alpha;
      A.panel(c, 156, 34, 168, 18, '#16162b', '#8ee9f2');
      A.text(c, this.toast || '', 240, 40, { size: 7, color: '#d8fbff', align: 'center', shadow: false });
      c.globalAlpha = 1;
    }

    if (this.state === 'menu') this.drawMenu(c);
    else if (this.state === 'how') this.drawHow(c);
    else if (this.state === 'about') this.drawAbout(c);
    else if (this.state === 'exit') this.drawExit(c);
    else if (this.state === 'intro') this.drawIntro(c);
    else if (this.state === 'play') this.drawHUD(c);
    else if (this.state === 'pause') { this.drawHUD(c); this.drawPause(c); }
    else if (this.state === 'death') { this.drawHUD(c); this.drawDeath(c); }
    else if (this.state === 'complete') { this.drawHUD(c); this.drawComplete(c); }
    else if (this.state === 'victory') this.drawVictory(c);
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
          Math.min(ends[0][0], ends[1][0]) > this.camX + W + 20) continue;
      var alpha = plat.kind === 'both' ? 1 :
        (plat.kind === 'curve' ? 0.18 + this.curvature * 0.82 : 1.0 - this.curvature * 0.82);
      A.platform(ctx, ends[0], ends[1], plat.style, alpha, this.time);
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
    if (this.state !== 'death' && !(this.invuln > 0 && ((this.time * 14) | 0) % 2 === 0)) {
      A.player(ctx, this.player, this.time, this.curvature > 0.5);
    }

    for (var p = 0; p < this.particles.length; p++) {
      var q2 = this.particles[p];
      A.rect(ctx, q2.x, q2.y, 2, 2, q2.color);
    }
    ctx.restore();

    // Кривизна искажает и фон: лёгкие «дуги» поверх сцены.
    if (this.curvature > 0.02) {
      ctx.save();
      ctx.globalAlpha = this.curvature * 0.14;
      ctx.strokeStyle = '#8ee9f2';
      for (var l = 0; l < 5; l++) {
        ctx.beginPath();
        ctx.arc(lv.vanish.x - this.camX, lv.vanish.y, 45 + l * 38 + Math.sin(this.time * 2 + l) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  Game.prototype.drawMenu = function (c) {
    this.menuRects = [];
    A.text(c, 'ЛОБАЧЕВСКИЙ', 240, 24, { size: 20, bold: true, color: '#f4d98a', align: 'center' });
    A.text(c, 'КРИВАЯ  КАЗАНЬ', 240, 50, { size: 11, color: '#8ee9f2', align: 'center' });
    A.rect(c, 90, 68, 300, 1, '#c8a45c');
    A.text(c, 'Параллельные прямые встречаются — начни игру', 240, 76, { size: 7, color: '#d8c9a0', align: 'center' });

    var items = this.menuItems();
    var y0 = 102;
    for (var i = 0; i < items.length; i++) {
      var x = 158, y = y0 + i * 21;
      A.panel(c, x, y, 164, 17, i === this.menuIndex ? '#35445a' : '#1d1d36',
        i === this.menuIndex ? '#8ee9f2' : '#6a5c48');
      A.text(c, items[i].label, x + 82, y + 5, { size: 8, color: i === this.menuIndex ? '#e9ffff' : '#d8c9a0', align: 'center', shadow: false });
      this.menuRects.push({ x: x, y: y, w: 164, h: 17, id: items[i].id });
    }
    A.text(c, 'WASD / СТРЕЛКИ — ДВИЖЕНИЕ    ПРОБЕЛ — ПРЫЖОК', 240, 232, { size: 6, color: '#bfb08c', align: 'center' });
    A.text(c, 'Q / SHIFT — КРИВИЗНА    ESC — ПАУЗА    M — ЗВУК', 240, 244, { size: 6, color: '#bfb08c', align: 'center' });
    A.text(c, 'ПИКСЕЛЬНЫЙ ПЛАТФОРМЕР · КОМАНДА ИБ', 240, 258, { size: 6, color: '#8c8069', align: 'center' });
  };

  Game.prototype.drawHow = function (c) {
    A.panel(c, 34, 20, 412, 232, '#14142a', '#c8a45c');
    A.text(c, 'КАК ИГРАТЬ', 240, 32, { size: 13, bold: true, color: '#f4d98a', align: 'center' });
    A.rect(c, 50, 50, 380, 1, '#6a5c48');
    var lines = [
      ['← →  или  A D', 'движение'],
      ['ПРОБЕЛ / W / ↑', 'прыжок (выше при удержании)'],
      ['Q  или  SHIFT', 'переключить геометрию: плоскость ⇄ Лобачевский'],
      ['ESC / P', 'пауза, перезапуск уровня, выход'],
      ['R', 'быстрый перезапуск уровня'],
      ['M', 'включить / выключить звук'],
      ['ENTER', 'начать уровень / продолжить']
    ];
    for (var i = 0; i < lines.length; i++) {
      A.text(c, lines[i][0], 54, 60 + i * 17, { size: 7, color: '#8ee9f2', shadow: false });
      A.text(c, lines[i][1], 196, 60 + i * 17, { size: 7, color: '#e6d9b4', shadow: false });
    }
    A.rect(c, 50, 184, 380, 1, '#6a5c48');
    var body = 'ФИШКА: в кривом мире параллельные навесы сходятся в «идеальной точке» и становятся платформами. ' +
      'Прыгай, нажимай Q в воздухе и ищи чак-чак.';
    this.wrapText(c, body, 54, 192, 372, 11, { size: 7, color: '#e6d9b4', shadow: false });
    A.text(c, 'ENTER / КЛИК — вернуться в меню', 240, 240, { size: 7, color: '#c8a45c', align: 'center', shadow: false });
  };

  Game.prototype.drawAbout = function (c) {
    A.panel(c, 28, 14, 424, 248, '#14142a', '#c8a45c');
    A.text(c, 'ОБ ИГРЕ', 240, 22, { size: 13, bold: true, color: '#f4d98a', align: 'center' });
    A.text(c, 'КОМАНДА: команда ИБ', 40, 42, { size: 8, color: '#8ee9f2', shadow: false });
    var rows = [
      'ИДЕЯ: платформер о неевклидовой геометрии Лобачевского в Казани.',
      'НАУКА: Н. И. Лобачевский, ректор Казанского университета (1827–1846);',
      'доклад о новой геометрии — 1826 г. Источники: kpfu.ru, dm.kpfu.ru.',
      'КАЗАНЬ: улица Баумана, главное здание КФУ, обсерватория Энгельгардта,',
      'Казанский Кремль, башня Сююмбике, Зилант, татарский орнамент, чак-чак.',
      'ИСТОЧНИКИ ФАКТОВ: https://kpfu.ru/math/history/znamenitye-personalii/',
      'https://dm.kpfu.ru/ · https://astro.kpfu.ru/architecture · https://unesco.ru/en/unescorussia/sites/s980/',
      'АССЕТЫ: CC0-звуки Kenney (CREDITS.md); остальная графика и музыка —',
      'собственная процедурная генерация во время разработки.',
      'ИИ-ИНСТРУМЕНТЫ: Arena.ai Agent — код, тексты и пиксельная графика,',
      'процедурная музыка и звуковые эффекты написаны вручную.',
      'ВЕРСИЯ: веб, 480×270 px, 3 уровня + босс.'
    ];
    for (var i = 0; i < rows.length; i++) {
      A.text(c, rows[i], 40, 58 + i * 15, { size: 6, color: i % 3 === 1 ? '#cfc2a0' : '#e6d9b4', shadow: false });
    }
    A.text(c, 'ENTER / КЛИК — меню', 240, 250, { size: 7, color: '#c8a45c', align: 'center', shadow: false });
  };

  Game.prototype.drawExit = function (c) {
    A.panel(c, 110, 82, 260, 104, '#14142a', '#c8a45c');
    A.text(c, 'ВЫХОД', 240, 100, { size: 15, bold: true, color: '#f4d98a', align: 'center' });
    A.text(c, 'Спасибо за игру!', 240, 128, { size: 9, color: '#e6d9b4', align: 'center', shadow: false });
    A.text(c, 'Можно закрыть вкладку.', 240, 144, { size: 7, color: '#bfb08c', align: 'center', shadow: false });
    A.text(c, 'ENTER — вернуться в меню', 240, 166, { size: 7, color: '#8ee9f2', align: 'center', shadow: false });
  };

  Game.prototype.drawIntro = function (c) {
    var lv = this.level;
    A.panel(c, 28, 30, 424, 210, '#121126', '#c8a45c');
    A.text(c, 'УРОВЕНЬ ' + lv.id + ' · ' + lv.name, 42, 44, { size: 11, bold: true, color: '#f4d98a' });
    A.text(c, lv.subtitle, 42, 64, { size: 7, color: '#8ee9f2', shadow: false });
    A.rect(c, 42, 80, 396, 1, '#6a5c48');
    var n = this.wrapText(c, lv.fact, 42, 92, 396, 13, { size: 7, color: '#e6d9b4', shadow: false });
    this.wrapText(c, lv.task, 42, 100 + n * 13 + 8, 396, 13, { size: 7, color: '#f5d68a', shadow: false });
    A.text(c, 'ENTER / ПРОБЕЛ — старт', 240, 224, { size: 8, color: '#8ee9f2', align: 'center' });
  };

  Game.prototype.drawHUD = function (c) {
    var lv = this.level;
    A.rect(c, 0, 0, W, 15, 'rgba(9,9,22,0.75)');
    A.text(c, lv.id + '. ' + lv.name, 6, 4, { size: 7, color: '#f4d98a', shadow: false });
    var taken = this.items.filter(function (i) { return i.taken; }).length;
    A.text(c, 'ЧАК-ЧАК ' + taken + '/' + this.items.length + '  СМЕРТИ ' + this.deaths, 474, 4, { size: 7, color: '#e6d9b4', align: 'right', shadow: false });

    // индикатор кривизны
    var bx = 8, by = 245;
    A.rect(c, bx, by, 104, 18, 'rgba(9,9,22,0.75)');
    A.text(c, this.target ? 'ЛОБАЧЕВСКИЙ' : 'ПЛОСКОСТЬ', bx + 5, by + 2, { size: 6, color: this.target ? '#8ee9f2' : '#f2d79a', shadow: false });
    A.rect(c, bx + 5, by + 11, 94, 4, '#403a52');
    A.rect(c, bx + 5, by + 11, Math.round(94 * this.curvature), 4, '#8ee9f2');
    A.text(c, 'Q', bx + 93, by + 2, { size: 6, color: '#c8a45c', shadow: false });

    if (this.boss && !this.boss.dead) {
      A.text(c, 'ЗИЛАНТ', 240, 20, { size: 7, color: '#f4d98a', align: 'center' });
      A.rect(c, 168, 32, 144, 6, '#3a2033');
      A.rect(c, 168, 32, 48 * this.boss.hp, 6, '#e06f4c');
      A.text(c, 'УДАРЬ В КРИВОМ МИРЕ', 240, 41, { size: 6, color: '#8ee9f2', align: 'center', shadow: false });
    }

    if (this.hintTime > 0) {
      var a = Math.min(1, this.hintTime / 2);
      c.globalAlpha = a;
      A.panel(c, 96, 198, 288, 34, 'rgba(14,14,32,0.9)', '#c8a45c');
      A.text(c, '← → — идти   ПРОБЕЛ — прыжок   Q — кривизна', 240, 204, { size: 7, color: '#f4d98a', align: 'center', shadow: false });
      this.wrapText(c, lv.task, 104, 216, 272, 9, { size: 6, color: '#d8c9a0', align: 'center', shadow: false });
      c.globalAlpha = 1;
    }
  };

  Game.prototype.dim = function (c, alpha) {
    c.fillStyle = 'rgba(6,6,16,' + (alpha || 0.72) + ')';
    c.fillRect(0, 0, W, H);
  };

  Game.prototype.drawPause = function (c) {
    this.dim(c, 0.7);
    A.panel(c, 150, 52, 180, 164, '#14142a', '#c8a45c');
    A.text(c, 'ПАУЗА', 240, 64, { size: 14, bold: true, color: '#f4d98a', align: 'center' });
    var items = ['ПРОДОЛЖИТЬ', 'ПЕРЕЗАПУСК УРОВНЯ', 'ЗВУК ВКЛ/ВЫКЛ', 'В ГЛАВНОЕ МЕНЮ'];
    for (var i = 0; i < 4; i++) {
      A.panel(c, 164, 90 + i * 28, 152, 21, this.menuIndex === i ? '#35445a' : '#1d1d36',
        this.menuIndex === i ? '#8ee9f2' : '#6a5c48');
      A.text(c, items[i], 240, 96 + i * 28, { size: 7, color: this.menuIndex === i ? '#e9ffff' : '#d8c9a0', align: 'center', shadow: false });
    }
  };

  Game.prototype.drawDeath = function (c) {
    this.dim(c, 0.6);
    A.text(c, 'СИНГУЛЯРНОСТЬ!', 240, 110, { size: 17, bold: true, color: '#e26c73', align: 'center' });
    A.text(c, 'Возврат к чекпоинту...', 240, 140, { size: 8, color: '#e6d9b4', align: 'center', shadow: false });
    if (this.stateTime > 0.6) A.text(c, 'ENTER — быстрее', 240, 156, { size: 7, color: '#8ee9f2', align: 'center', shadow: false });
  };

  Game.prototype.drawComplete = function (c) {
    this.dim(c, 0.72);
    A.panel(c, 120, 70, 240, 130, '#14142a', '#c8a45c');
    A.text(c, 'УРОВЕНЬ ПРОЙДЕН', 240, 84, { size: 12, bold: true, color: '#f4d98a', align: 'center' });
    A.text(c, this.level.name, 240, 106, { size: 8, color: '#8ee9f2', align: 'center', shadow: false });
    A.text(c, 'ВРЕМЯ: ' + this.timeInLevel.toFixed(1) + ' с', 240, 130, { size: 7, color: '#e6d9b4', align: 'center', shadow: false });
    A.text(c, 'ПЕРЕКЛЮЧЕНИЙ: ' + this.switches + '   СМЕРТЕЙ: ' + this.deaths, 240, 145, { size: 7, color: '#e6d9b4', align: 'center', shadow: false });
    A.text(c, 'ENTER — дальше', 240, 174, { size: 8, color: '#8ee9f2', align: 'center', shadow: false });
  };

  Game.prototype.drawVictory = function (c) {
    A.backdrop(c, KZ.LEVELS[3], 0, this.time);
    c.fillStyle = 'rgba(8,8,20,0.55)';
    c.fillRect(0, 0, W, H);
    var flyX = 60 + Math.min(1, this.stateTime / 6) * 380;
    A.dragonSilhouette(c, flyX, 55 + Math.sin(this.time * 3) * 10, 1.4, '#8a5265');
    A.text(c, 'ПОБЕДА!', 240, 40, { size: 22, bold: true, color: '#f4d98a', align: 'center' });
    A.text(c, 'Зилант отступает перед геометрией Лобачевского', 240, 70, { size: 8, color: '#8ee9f2', align: 'center', shadow: false });
    this.wrapText(c,
      'Параллельные прямые пересеклись в идеальной точке — и Казань снова стала плоской... ' +
      'настолько, насколько этого желает Евклид.',
      70, 104, 340, 12, { size: 7, color: '#e6d9b4', align: 'center', shadow: false });
    A.text(c, 'КОМАНДА ИБ · КАЗАНСКИЙ УНИВЕРСИТЕТ · 1826 → СЕГОДНЯ', 240, 172, { size: 7, color: '#c8a45c', align: 'center', shadow: false });
    A.text(c, 'ИСТОЧНИКИ: kpfu.ru · dm.kpfu.ru · astro.kpfu.ru · unesco.ru', 240, 190, { size: 6, color: '#bfb08c', align: 'center', shadow: false });
    A.text(c, 'ПРОЙДЕНО УРОВНЕЙ: 4 · СМЕРТЕЙ: ' + this.deaths, 240, 216, { size: 7, color: '#e6d9b4', align: 'center', shadow: false });
    if (this.stateTime > 1.5) A.text(c, 'ENTER — в главное меню', 240, 244, { size: 8, color: '#8ee9f2', align: 'center', shadow: false });
  };

  KZ.Game = Game;
  KZ.W = W; KZ.H = H;
})(window.KZ = window.KZ || {});
