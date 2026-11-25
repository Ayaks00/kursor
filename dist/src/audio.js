/* Звук: CC0-сэмплы из CREDITS.md + процедурная chiptune-музыка собственного генерации. */
(function (KZ) {
  'use strict';

  var THEMES = {
    menu: {
      bpm: 96,
      lead: [0, 2, 4, 7, 8, 4, 2, 1],
      bass: [0, 0, 5, 5, 8, 8, 7, 7],
      wave: 'triangle',
      gain: 0.055
    },
    game: {
      bpm: 132,
      lead: [0, 4, 7, 4, 8, 7, 4, 2],
      bass: [0, 0, 7, 7, 5, 5, 8, 8],
      wave: 'square',
      gain: 0.038
    },
    boss: {
      bpm: 168,
      lead: [0, 1, 0, 4, 8, 7, 1, 0],
      bass: [0, 0, 1, 1, 4, 4, 0, 0],
      wave: 'sawtooth',
      gain: 0.032
    },
    victory: {
      bpm: 116,
      lead: [0, 4, 7, 12, 11, 7, 4, 0],
      bass: [0, 5, 7, 5, 0, 5, 7, 9],
      wave: 'triangle',
      gain: 0.06
    }
  };

  // Лад: гармонический минор от A — узнаваемый «восточный» колорит.
  var SCALE = [0, 2, 3, 5, 7, 8, 11];
  function hz(semitone) { return 220 * Math.pow(2, semitone / 12); }
  function noteHz(step) {
    var octave = Math.floor(step / 7);
    return hz(SCALE[((step % 7) + 7) % 7]) * Math.pow(2, octave);
  }

  function AudioSystem() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.started = false;
    this.muted = false;
    this.theme = null;
    this.step = 0;
    this.nextNote = 0;
    this.timer = null;
    this.samples = {};
  }

  AudioSystem.prototype.unlock = function () {
    if (this.started) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.started = true;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.8;
    this.musicBus.connect(this.master);

    this.nextNote = this.ctx.currentTime + 0.05;
    var self = this;
    this.timer = setInterval(function () { self.schedule(); }, 60);
  };

  AudioSystem.prototype.play = function (name, volume) {
    if (this.muted || !window.SFX_DATA || !window.SFX_DATA[name]) return;
    try {
      var audio = new Audio(window.SFX_DATA[name]);
      audio.volume = typeof volume === 'number' ? volume : 0.45;
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* звук необязателен для игры */ }
  };

  AudioSystem.prototype.setTheme = function (name) {
    if (name === this.theme) return;
    this.theme = name;
    this.step = 0;
    if (this.ctx) this.nextNote = this.ctx.currentTime + 0.05;
  };

  AudioSystem.prototype.toggleMute = function () {
    this.muted = !this.muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.02);
    }
    return this.muted;
  };

  AudioSystem.prototype.schedule = function () {
    if (!this.ctx || this.muted || !this.theme || !THEMES[this.theme]) return;
    var th = THEMES[this.theme];
    var stepDur = 60 / th.bpm / 2; // восьмые
    while (this.nextNote < this.ctx.currentTime + 0.18) {
      var i = this.step % 8;
      var t = this.nextNote;
      this.tone(noteHz(th.lead[i]), t, stepDur * 0.85, th.wave, th.gain);
      if (i % 2 === 0) {
        this.tone(noteHz(th.bass[i]) / 2, t, stepDur * 1.7, 'square', th.gain * 0.65);
      }
      if (i === 3 || i === 7) {
        this.noise(t, 0.035, th.gain * 0.35);
      }
      this.step++;
      this.nextNote += stepDur;
    }
  };

  AudioSystem.prototype.tone = function (freq, when, dur, type, gain) {
    if (!this.ctx) return;
    var o = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(this.musicBus);
    o.start(when); o.stop(when + dur + 0.02);
  };

  AudioSystem.prototype.noise = function (when, dur, gain) {
    if (!this.ctx) return;
    var len = Math.floor(this.ctx.sampleRate * dur);
    var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = this.ctx.createBufferSource();
    src.buffer = buf;
    var g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g); g.connect(this.musicBus);
    src.start(when);
  };

  KZ.AudioSystem = AudioSystem;
})(window.KZ = window.KZ || {});
