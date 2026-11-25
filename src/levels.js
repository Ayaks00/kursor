/* Уровни: три локации Казани + финальный босс.
   Платформа задаётся отрезком; ca/cb — её положение в «мире Лобачевского».
   kind: both | flat | curve — в каком режиме платформа материальна. */
(function (KZ) {
  'use strict';

  function P(x1, y1, x2, y2, o) {
    o = o || {};
    return {
      a: [x1, y1], b: [x2, y2],
      ca: o.ca || [x1, y1], cb: o.cb || [x2, y2],
      kind: o.kind || 'both',
      style: o.style || 'stone'
    };
  }
  function I(x, y, type) { return { x: x, y: y, type: type || 'postulate' }; }
  function C(x, y) { return { x: x, y: y }; }
  function S(x, y, w) { return { type: 'spikes', x: x, y: y, w: w }; }
  function O(x, y, ax, ay, bx, by, speed) {
    return { type: 'orb', x: x, y: y, ax: ax, ay: ay, bx: bx, by: by, speed: speed || 1, r: 7 };
  }

  var levels = [
    {
      id: 1,
      name: 'УЛИЦА БАУМАНА',
      subtitle: 'На агоре: первая кривизна',
      fact: 'В 1826 году Николай Иванович Лобачевский доложил в Казанском университете о «воображаемой геометрии». Прямые, которые кажутся параллельными, здесь встречаются в идеальной точке.',
      task: 'Нажми Q: плоскость станет кривой, и параллельные навесы сойдутся — по ним можно перейти пропасть.',
      bg: 'bauman',
      palette: { sky: '#4a3326', far: '#6b4234', farBuild: '#7a4a35', midBuild: '#c08a58', win: '#f0d9a0', ground: '#6b4a33', groundLine: '#a0794f' },
      worldW: 1950,
      spawn: [26, 200],
      vanish: { x: 706, y: 122 },
      guides: [[620, 215], [800, 200], [620, 175], [800, 165], [1395, 180], [1580, 145]],
      gravity: 0.22, jump: -5.2, speed: 2.15,
      platforms: [
        P(0, 220, 380, 220, { style: 'wood' }),
        P(430, 215, 620, 215, { style: 'wood' }),
        P(620, 214, 780, 196, { ca: [620, 214], cb: [780, 196], kind: 'curve', style: 'metal' }),
        P(800, 200, 980, 200, { style: 'wood' }),
        P(1030, 190, 1220, 190),
        P(1250, 180, 1400, 180, { style: 'wood' }),
        P(1400, 178, 1560, 150, { kind: 'curve', style: 'metal' }),
        P(1580, 210, 1950, 210),
        P(200, 170, 300, 170, { style: 'wood' }),
        P(700, 150, 800, 150, { style: 'metal' }),
        P(1100, 148, 1200, 148, { style: 'wood' }),
        P(1500, 108, 1600, 108, { style: 'metal' })
      ],
      items: [I(120, 192, 'chakchak'), I(250, 148), I(520, 188, 'chakchak'), I(690, 128), I(880, 170), I(1150, 126, 'chakchak'), I(1300, 150), I(1550, 90), I(1730, 180, 'chakchak')],
      checkpoints: [C(500, 215), C(1060, 190), C(1620, 210)],
      hazards: [S(390, 224, 34), O(1000, 150, 1000, 110, 1000, 176, 0.7), S(1480, 224, 46)],
      lamps: [[170, 220], [560, 215], [890, 200], [1320, 180], [1760, 210]],
      goal: { x: 1890, y: 203 }
    },
    {
      id: 2,
      name: 'ГЛАВНОЕ ЗДАНИЕ КФУ',
      subtitle: 'Академия и зал параллельных',
      fact: 'Лобачевский был ректором Казанского университета в 1827–1846 годах и возглавлял строительство главного здания. Здесь его идеи превращаются в проходимые лестницы.',
      task: 'Переключай геометрию прямо в прыжке: одни платформы существуют только в плоском мире, другие — только в кривом.',
      bg: 'main',
      palette: { sky: '#232b3e', ground: '#4c4030' },
      worldW: 2200,
      spawn: [24, 200],
      vanish: { x: 1260, y: 92 },
      guides: [[1100, 210], [1400, 140], [1100, 140], [1400, 210], [1660, 205], [1840, 170]],
      gravity: 0.22, jump: -5.25, speed: 2.15,
      platforms: [
        P(0, 220, 300, 220),
        P(360, 205, 560, 205, { style: 'wood' }),
        P(560, 204, 700, 184, { kind: 'curve', style: 'metal' }),
        P(720, 182, 920, 182, { style: 'wood' }),
        P(920, 180, 1100, 180, { kind: 'flat', style: 'wood' }),
        P(1100, 210, 1400, 140, { ca: [1100, 210], cb: [1264, 175], style: 'metal' }),
        P(1264, 175, 1400, 140, { kind: 'curve', style: 'metal' }),
        P(1100, 140, 1400, 140, { kind: 'flat', style: 'wood' }),
        P(1440, 195, 1660, 195, { style: 'wood' }),
        P(1660, 190, 1840, 166, { kind: 'curve', style: 'metal' }),
        P(1860, 190, 2200, 190),
        P(430, 150, 540, 150, { style: 'metal' }),
        P(760, 130, 860, 130),
        P(1500, 140, 1600, 140, { style: 'wood' }),
        P(1950, 140, 2060, 140, { style: 'metal' })
      ],
      items: [I(140, 190, 'chakchak'), I(480, 128), I(640, 158), I(820, 100), I(1000, 150), I(1180, 120), I(1350, 110, 'chakchak'), I(1550, 118), I(1750, 150), I(2010, 110), I(2130, 160, 'chakchak')],
      checkpoints: [C(400, 205), C(1120, 210), C(1890, 190)],
      hazards: [S(310, 224, 42), O(920, 150, 920, 100, 920, 170, 0.9), S(1820, 224, 30), O(2000, 190, 2000, 150, 2000, 205, 1.1)],
      lamps: [[140, 220], [780, 182], [1520, 195], [1980, 190]],
      goal: { x: 2150, y: 183 }
    },
    {
      id: 3,
      name: 'ОБСЕРВАТОРИЯ ЭНГЕЛЬГАРДТА',
      subtitle: 'Храм звёзд и лёгкая гравитация',
      fact: 'Казанская астрономическая школа и обсерватория им. В. П. Энгельгардта известна с XIX века: здесь изучали небо и измеряли пространство. В низкой гравитации кривизна становится заметнее.',
      task: 'Луна светит слабее — прыжки выше. Соединяй «параллельные» орбиты и не попадайся в чёрные углы.',
      bg: 'observatory',
      palette: { ground: '#273047' },
      worldW: 2400,
      spawn: [24, 200],
      vanish: { x: 1420, y: 62 },
      guides: [[1280, 195], [1580, 160], [1280, 155], [1580, 120], [2000, 190], [2210, 150]],
      gravity: 0.18, jump: -5.4, speed: 2.2,
      platforms: [
        P(0, 220, 340, 220, { style: 'metal' }),
        P(400, 210, 640, 210, { style: 'metal' }),
        P(680, 190, 860, 190, { kind: 'flat', style: 'metal' }),
        P(680, 205, 860, 168, { kind: 'curve', style: 'metal' }),
        P(900, 175, 1080, 175, { style: 'metal' }),
        P(1080, 174, 1280, 174, { kind: 'flat', style: 'metal' }),
        P(1280, 195, 1580, 160, { kind: 'curve', style: 'metal' }),
        P(1610, 180, 1820, 180, { style: 'metal' }),
        P(1820, 190, 2000, 190, { kind: 'flat', style: 'metal' }),
        P(2000, 190, 2210, 150, { kind: 'curve', style: 'metal' }),
        P(2240, 200, 2400, 200, { style: 'metal' }),
        P(240, 150, 340, 150, { style: 'metal' }),
        P(980, 118, 1080, 118),
        P(1660, 128, 1760, 128)
      ],
      items: [I(150, 188, 'chakchak'), I(290, 128), I(520, 180), I(760, 140), I(950, 145, 'chakchak'), I(1160, 145), I(1450, 128), I(1700, 106, 'chakchak'), I(1900, 150), I(2130, 122), I(2330, 170, 'chakchak')],
      checkpoints: [C(430, 210), C(920, 175), C(1640, 180), C(2270, 200)],
      hazards: [S(350, 224, 44), O(620, 160, 620, 110, 620, 185, 0.8), O(1120, 140, 1060, 120, 1200, 160, 0.9), S(1830, 224, 34), O(2050, 130, 2000, 110, 2120, 150, 1.2)],
      lamps: [[220, 220], [970, 175], [1700, 180], [2300, 200]],
      goal: { x: 2350, y: 193 }
    },
    {
      id: 4,
      name: 'КАЗАНСКИЙ КРЕМЛЬ',
      subtitle: 'Финал: Зилант',
      fact: 'Зилант — легендарный дракон и символ Казани; башня Сююмбике — самый узнаваемый силуэт Кремля. Научный спор продолжается: сможет ли кривая геометрия победить миф?',
      task: 'Включи кривизну: под Зилантом появится платформа-резонанс. Прыгни и ударь дракона трижды.',
      bg: 'kremlin',
      palette: { ground: '#59402f' },
      worldW: 960,
      spawn: [40, 200],
      vanish: { x: 480, y: 74 },
      guides: [[300, 190], [660, 190], [480, 150], [480, 100]],
      gravity: 0.22, jump: -5.5, speed: 2.2,
      boss: true,
      platforms: [
        P(0, 230, 960, 230, { style: 'stone' }),
        P(80, 180, 200, 180, { style: 'wood' }),
        P(320, 168, 440, 168, { style: 'metal' }),
        P(520, 168, 640, 168, { style: 'metal' }),
        P(760, 180, 880, 180, { style: 'wood' }),
        P(400, 148, 560, 148, { kind: 'curve', style: 'metal' })
      ],
      items: [I(140, 148, 'chakchak'), I(480, 118, 'chakchak'), I(820, 148, 'chakchak')],
      checkpoints: [],
      hazards: [],
      lamps: [[120, 230], [380, 168], [700, 168], [900, 180]],
      goal: null
    }
  ];

  /* Логические координаты совпадают с raster: 1920×1080.
     Описания выше заданы в «дизайнерских» единицах (480×270) для читаемости,
     здесь они один раз переводятся в настоящие игровые пиксели. */
  var K = 4;
  KZ.DESIGN_SCALE = K;

  function pair(p) { return [p[0] * K, p[1] * K]; }
  function point(p) { return { x: p.x * K, y: p.y * K }; }

  function scaleLevel(lv) {
    var out = Object.assign({}, lv);
    out.worldW = lv.worldW * K;
    out.spawn = [lv.spawn[0] * K, lv.spawn[1] * K];
    out.vanish = { x: lv.vanish.x * K, y: lv.vanish.y * K };
    out.gravity = lv.gravity * K;
    out.jump = lv.jump * K;
    out.speed = lv.speed * K;
    out.guides = lv.guides.map(pair);
    out.platforms = lv.platforms.map(function (p) {
      return {
        a: pair(p.a), b: pair(p.b), ca: pair(p.ca), cb: pair(p.cb),
        kind: p.kind, style: p.style
      };
    });
    out.items = lv.items.map(function (it) {
      return { x: it.x * K, y: it.y * K, type: it.type };
    });
    out.checkpoints = lv.checkpoints.map(point);
    out.hazards = lv.hazards.map(function (h) {
      var z = Object.assign({}, h);
      z.x *= K; z.y *= K;
      if (z.w) z.w *= K;
      if (z.r) z.r *= K;
      if (z.ax !== undefined) { z.ax *= K; z.ay *= K; z.bx *= K; z.by *= K; }
      return z;
    });
    out.goal = lv.goal ? point(lv.goal) : null;
    out.lamps = (lv.lamps || []).map(pair);
    return out;
  }

  KZ.LEVELS = levels.map(scaleLevel);
})(window.KZ = window.KZ || {});
