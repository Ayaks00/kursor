/* Клавиатура (обязательно) + мышь для меню. */
(function (KZ) {
  'use strict';

  var HANDLED = {
    ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, Space: 1,
    KeyA: 1, KeyD: 1, KeyW: 1, KeyS: 1, KeyQ: 1, KeyE: 1,
    ShiftLeft: 1, ShiftRight: 1, Escape: 1, KeyP: 1, KeyR: 1,
    KeyM: 1, Enter: 1, NumpadEnter: 1
  };

  function Input(canvas) {
    var self = this;
    this.down = {};
    this.pressed = {};
    this.mouse = { x: 0, y: 0, clicked: false };

    window.addEventListener('keydown', function (e) {
      if (HANDLED[e.code]) e.preventDefault();
      if (!e.repeat) self.pressed[e.code] = true;
      self.down[e.code] = true;
    });
    window.addEventListener('keyup', function (e) {
      self.down[e.code] = false;
    });
    window.addEventListener('blur', function () {
      self.down = {};
    });

    function point(e) {
      var r = canvas.getBoundingClientRect();
      self.mouse.x = (e.clientX - r.left) / r.width * canvas.width;
      self.mouse.y = (e.clientY - r.top) / r.height * canvas.height;
    }
    canvas.addEventListener('mousemove', point);
    canvas.addEventListener('mousedown', function (e) {
      point(e); self.mouse.clicked = true;
    });
  }

  Input.prototype.isDown = function () {
    for (var i = 0; i < arguments.length; i++) if (this.down[arguments[i]]) return true;
    return false;
  };
  Input.prototype.wasPressed = function () {
    for (var i = 0; i < arguments.length; i++) if (this.pressed[arguments[i]]) return true;
    return false;
  };
  Input.prototype.consume = function (code) {
    var v = !!this.pressed[code];
    this.pressed[code] = false;
    return v;
  };
  Input.prototype.endFrame = function () {
    this.pressed = {};
    this.mouse.clicked = false;
  };

  Input.prototype.left = function () { return this.isDown('ArrowLeft', 'KeyA'); };
  Input.prototype.right = function () { return this.isDown('ArrowRight', 'KeyD'); };
  Input.prototype.jumpDown = function () { return this.isDown('Space', 'ArrowUp', 'KeyW'); };
  Input.prototype.jumpPressed = function () { return this.wasPressed('Space', 'ArrowUp', 'KeyW'); };
  Input.prototype.togglePressed = function () { return this.wasPressed('KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight'); };
  Input.prototype.confirmPressed = function () { return this.wasPressed('Enter', 'NumpadEnter', 'Space'); };
  Input.prototype.pausePressed = function () { return this.wasPressed('Escape', 'KeyP'); };
  Input.prototype.restartPressed = function () { return this.wasPressed('KeyR'); };
  Input.prototype.mutePressed = function () { return this.wasPressed('KeyM'); };
  Input.prototype.upPressed = function () { return this.wasPressed('ArrowUp', 'KeyW'); };
  Input.prototype.downPressed = function () { return this.wasPressed('ArrowDown', 'KeyS'); };

  KZ.Input = Input;
})(window.KZ = window.KZ || {});
