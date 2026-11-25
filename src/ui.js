/* HTML-интерфейс: весь текст — настоящие DOM-элементы, canvas рисует только мир. */
(function (KZ) {
  'use strict';

  function UI(game) {
    var self = this;
    this.game = game;
    this.root = document.getElementById('ui');
    this.stage = document.getElementById('stage');
    this.screens = {};
    var nodes = this.root.querySelectorAll('[data-screen]');
    for (var i = 0; i < nodes.length; i++) this.screens[nodes[i].getAttribute('data-screen')] = nodes[i];

    this.menuList = document.getElementById('menu-list');
    this.pauseList = document.getElementById('pause-list');
    this.hud = document.getElementById('hud');
    this.toast = document.getElementById('toast');
    this.el = {
      level: document.getElementById('hud-level'),
      stats: document.getElementById('hud-stats'),
      curvLabel: document.getElementById('curv-label'),
      curvFill: document.getElementById('curv-fill'),
      bossBox: document.getElementById('boss-box'),
      bossFill: document.getElementById('boss-fill'),
      hintBox: document.getElementById('hint-box'),
      hintTask: document.getElementById('hint-task'),
      introTitle: document.getElementById('intro-title'),
      introSubtitle: document.getElementById('intro-subtitle'),
      introFact: document.getElementById('intro-fact'),
      introTask: document.getElementById('intro-task'),
      completeName: document.getElementById('complete-name'),
      completeTime: document.getElementById('complete-time'),
      completeStats: document.getElementById('complete-stats'),
      victoryStats: document.getElementById('victory-stats')
    };

    this.menuSignature = '';
    this.buildPauseButtons();
    this.resize();
    window.addEventListener('resize', function () { self.resize(); });
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { self.resize(); });

    // Клик по экранам «Как играть», «Об игре», «Выход» и титрам возвращает в меню.
    this.root.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'BUTTON') return;
      var st = self.game.state;
      if (st === 'how' || st === 'about' || st === 'exit') self.game.setState('menu');
      else if (st === 'victory' && self.game.stateTime > 1.5) self.game.setState('menu');
    });
  }

  UI.prototype.resize = function () {
    var w = this.stage.clientWidth || (this.root && this.root.clientWidth) || window.innerWidth || 480;
    w = Math.max(320, w);
    this.stage.style.setProperty('--u', (w / 480) + 'px');
  };

  UI.prototype.makeButton = function (label, action, list) {
    var self = this;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'game-btn';
    b.textContent = label;
    b.addEventListener('click', function () { action(); self.game.audio.play('click', 0.5); });
    list.appendChild(b);
    return b;
  };

  UI.prototype.buildMenuButtons = function () {
    var self = this;
    var items = this.game.menuItems();
    var signature = items.map(function (it) { return it.id; }).join('|');
    if (signature === this.menuSignature) return;
    this.menuSignature = signature;
    this.menuList.innerHTML = '';
    this.menuButtons = items.map(function (it) {
      return self.makeButton(it.label, function () { self.game.menuAction(it.id); }, self.menuList);
    });
  };

  UI.prototype.buildPauseButtons = function () {
    var self = this;
    var actions = [
      ['ПРОДОЛЖИТЬ', function () { self.game.setState('play'); }],
      ['ПЕРЕЗАПУСК УРОВНЯ', function () { self.game.restartLevel(); }],
      ['ЗВУК ВКЛ/ВЫКЛ', function () { self.game.audio.toggleMute(); }],
      ['В ГЛАВНОЕ МЕНЮ', function () { self.game.setState('menu'); }]
    ];
    this.pauseButtons = actions.map(function (a) {
      return self.makeButton(a[0], a[1], self.pauseList);
    });
  };

  UI.prototype.highlight = function (buttons, index) {
    if (!buttons) return;
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.toggle('selected', i === index);
  };

  UI.prototype.render = function (game) {
    var state = game.state;
    for (var key in this.screens) this.screens[key].classList.remove('active');
    var screenName = (state === 'play') ? null : state;
    if (screenName && this.screens[screenName]) this.screens[screenName].classList.add('active');

    var hudOn = state === 'play' || state === 'pause' || state === 'death' || state === 'complete';
    this.hud.classList.toggle('active', hudOn);

    if (state === 'menu') {
      this.buildMenuButtons();
      this.highlight(this.menuButtons, game.menuIndex);
    }
    if (state === 'pause') this.highlight(this.pauseButtons, game.menuIndex);

    if (state === 'intro') {
      var lv = game.level;
      this.el.introTitle.textContent = 'УРОВЕНЬ ' + lv.id + ' · ' + lv.name;
      this.el.introSubtitle.textContent = lv.subtitle;
      this.el.introFact.textContent = lv.fact;
      this.el.introTask.textContent = lv.task;
    }

    if (hudOn) {
      var level = game.level;
      var taken = 0;
      for (var i = 0; i < game.items.length; i++) if (game.items[i].taken) taken++;
      this.el.level.textContent = level.id + '. ' + level.name;
      this.el.stats.textContent = 'ЧАК-ЧАК ' + taken + '/' + game.items.length + '  СМЕРТИ ' + game.deaths;
      this.el.curvLabel.textContent = game.target ? 'ЛОБАЧЕВСКИЙ' : 'ПЛОСКОСТЬ';
      this.el.curvFill.style.width = Math.round(game.curvature * 100) + '%';
      var boss = game.boss;
      this.el.bossBox.classList.toggle('active', !!boss && !boss.dead);
      if (boss) this.el.bossFill.style.width = Math.max(0, boss.hp / 3 * 100) + '%';
      var showHint = state === 'play' && game.hintTime > 0;
      this.el.hintBox.classList.toggle('active', showHint);
      if (showHint) this.el.hintTask.textContent = level.task;
    }

    if (state === 'complete') {
      this.el.completeName.textContent = game.level.name;
      this.el.completeTime.textContent = 'ВРЕМЯ: ' + game.timeInLevel.toFixed(1) + ' с';
      this.el.completeStats.textContent = 'ПЕРЕКЛЮЧЕНИЙ: ' + game.switches + '   СМЕРТЕЙ: ' + game.deaths;
    }

    if (state === 'victory') {
      this.el.victoryStats.textContent = 'ПРОЙДЕНО УРОВНЕЙ: 4 · СМЕРТЕЙ: ' + game.deaths;
    }

    var showToast = game.toastTime > 0;
    this.toast.classList.toggle('active', showToast);
    if (showToast) this.toast.textContent = game.toast || '';
  };

  KZ.UI = UI;
})(window.KZ = window.KZ || {});
