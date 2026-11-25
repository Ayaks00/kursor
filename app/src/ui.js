
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
    this.levelList = document.getElementById('level-list');
    this.hud = document.getElementById('hud');
    this.toast = document.getElementById('toast');
    this.el = {
      level: document.getElementById('hud-level'),
      chakCount: document.getElementById('chak-count'),
      chakTotal: document.getElementById('chak-total'),
      chakFill: document.getElementById('chak-fill'),
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
      quizLevel: document.getElementById('quiz-level'),
      quizQuestion: document.getElementById('quiz-question'),
      quizFeedback: document.getElementById('quiz-feedback')
    };
    this.quizList = document.getElementById('quiz-list');

    this.menuSignature = '';
    this.levelSignature = '';
    this.quizSignature = '';
    this.buildPauseButtons();
    this.applyLanguage();
    this.resize();
    window.addEventListener('resize', function () { self.resize(); });
    requestAnimationFrame(function () { self.resize(); });

    
    this.root.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'BUTTON') return;
      var st = self.game.state;
      if (st === 'how') self.game.setState('menu');
      else if (st === 'victory' && self.game.stateTime > 1.5) self.game.setState('menu');
    });
  }

  UI.prototype.resize = function () {
    var w = this.stage.clientWidth;
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
      return self.makeButton(KZ.t(it.label), function () { self.game.menuAction(it.id); }, self.menuList);
    });
  };

  UI.prototype.buildLevelButtons = function () {
    var self = this;
    var items = this.game.levelItems();
    var signature = items.map(function (it) { return it.id + (it.locked ? 'x' : 'o') + it.label; }).join('|');
    if (signature === this.levelSignature) return;
    this.levelSignature = signature;
    this.levelList.innerHTML = '';
    this.levelButtons = items.map(function (it) {
      var b = self.makeButton(it.label, function () { self.game.levelAction(it.id); }, self.levelList);
      b.disabled = !!it.locked;
      return b;
    });
  };

  UI.prototype.buildPauseButtons = function () {
    var self = this;
    var actions = [
      ['ПРОДОЛЖИТЬ', function () { self.game.setState('play'); }],
      ['ПЕРЕЗАПУСК УРОВНЯ', function () { self.game.restartLevel(); }],
      ['ЗВУК ВКЛ/ВЫКЛ', function () { self.game.audio.toggleMute(); }]
    ];
    this.pauseLabels = actions.map(function (a) { return a[0]; });
    this.pauseButtons = actions.map(function (a) {
      return self.makeButton(KZ.t(a[0]), a[1], self.pauseList);
    });
  };

  UI.prototype.applyLanguage = function () {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.dataset.ru) el.dataset.ru = el.textContent;
      el.textContent = KZ.t(el.dataset.ru);
    }
    for (var p = 0; p < this.pauseButtons.length; p++) {
      this.pauseButtons[p].textContent = KZ.t(this.pauseLabels[p]);
    }
    this.menuSignature = '';
    this.levelSignature = '';
    this.quizSignature = '';
  };

  UI.prototype.buildQuizButtons = function (game) {
    var items = game.quizItems();
    var signature = game.quizIndex + '|' + game.quizAnswered + '|' + items.map(function (it) { return it.label; }).join('|');
    if (signature === this.quizSignature) return;
    this.quizSignature = signature;
    var self = this;
    this.quizList.innerHTML = '';
    if (game.quizAnswered) {
      this.quizButtons = [this.makeButton(KZ.t('ДАЛЬШЕ'), function () { game.quizContinue(); }, this.quizList)];
      return;
    }
    this.quizButtons = items.map(function (it) {
      return self.makeButton(it.label, function () { game.answerQuiz(it.index); }, self.quizList);
    });
  };

  UI.prototype.highlight = function (buttons, index) {
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
    if (state === 'levels') {
      this.buildLevelButtons();
      this.highlight(this.levelButtons, game.menuIndex);
    }
    if (state === 'pause') this.highlight(this.pauseButtons, game.menuIndex);
    if (state === 'quiz') {
      this.buildQuizButtons(game);
      this.highlight(this.quizButtons, game.menuIndex);
      var quizLv = KZ.LEVELS[game.quizIndex];
      this.el.quizLevel.textContent = KZ.t(quizLv.name);
      this.el.quizQuestion.textContent = KZ.t(quizLv.quiz.question);
      this.el.quizFeedback.textContent = game.quizAnswered ? KZ.t(game.quizCorrect ? 'ВЕРНО!' : 'НЕВЕРНО') : '';
      this.el.quizFeedback.classList.toggle('active', game.quizAnswered);
      this.el.quizFeedback.classList.toggle('wrong', game.quizAnswered && !game.quizCorrect);
    }

    if (state === 'intro') {
      var lv = game.level;
      this.el.introTitle.textContent = KZ.t('УРОВЕНЬ') + ' ' + lv.id + ' · ' + KZ.t(lv.name);
      this.el.introSubtitle.textContent = KZ.t(lv.subtitle);
      this.el.introFact.textContent = KZ.t(lv.fact);
      this.el.introTask.textContent = KZ.t(lv.task);
    }

    if (hudOn) {
      var level = game.level;
      var taken = 0;
      for (var i = 0; i < game.items.length; i++) if (game.items[i].taken) taken++;
      this.el.level.textContent = level.id + '. ' + level.name;
      this.el.chakCount.textContent = taken;
      this.el.chakTotal.textContent = '/ ' + game.items.length;
      this.el.chakFill.style.width = (game.items.length ? Math.round(taken / game.items.length * 100) : 0) + '%';
      this.el.curvLabel.textContent = KZ.t(game.target ? 'ЛОБАЧЕВСКИЙ' : 'ПЛОСКОСТЬ');
      this.el.curvFill.style.width = Math.round(game.curvature * 100) + '%';
      var boss = game.boss;
      this.el.bossBox.classList.toggle('active', !!boss && !boss.dead);
      if (boss) this.el.bossFill.style.width = Math.max(0, boss.hp / (boss.maxHp || 10) * 100) + '%';
      var showHint = state === 'play' && game.hintTime > 0 && !game.hintDismissed;
      this.el.hintBox.classList.toggle('active', showHint);
      if (showHint) this.el.hintTask.textContent = KZ.t(level.task);
    }

    if (state === 'complete') {
      this.el.completeName.textContent = game.level.name;
      this.el.completeTime.textContent = KZ.t('ВРЕМЯ: ') + game.timeInLevel.toFixed(1) + KZ.t(' с');
      this.el.completeStats.textContent = KZ.t('ПЕРЕКЛЮЧЕНИЙ: ') + game.switches;
    }

    var showToast = game.toastTime > 0;
    this.toast.classList.toggle('active', showToast);
    if (showToast) this.toast.textContent = KZ.t(game.toast || '');
  };

  KZ.UI = UI;
})(window.KZ = window.KZ || {});
