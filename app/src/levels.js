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
  function C(x, y, plane) { return { x: x, y: y, plane: plane }; }
  function S(x, y, w) { return { type: 'spikes', x: x, y: y, w: w }; }
  function O(x, y, ax, ay, bx, by, speed, r, plane) {
    return { type: 'orb', x: x, y: y, ax: ax, ay: ay, bx: bx, by: by, speed: speed || 1, r: r || 7, plane: plane };
  }

  var levels = [
    {
      id: 1,
      name: 'УЛИЦА БАУМАНА',
      subtitle: 'На агоре: первая кривизна',
      fact: 'В 1826 году Николай Иванович Лобачевский доложил в Казанском университете о «воображаемой геометрии». Прямые, которые кажутся параллельными, здесь встречаются в идеальной точке.',
      task: 'Q / Shift: навесы сходятся в мост. Возвращайся в плоскость, чтобы встать на обычный навес.',
      bg: 'bauman',
      palette: { sky: '#4a3326', far: '#6b4234', farBuild: '#7a4a35', midBuild: '#c08a58', win: '#f0d9a0', ground: '#6b4a33', groundLine: '#a0794f' },
      worldW: 2000,
      spawn: [26, 200],
      vanish: { x: 706, y: 122 },
      guides: [[620, 215], [800, 200], [620, 175], [800, 165], [1395, 180], [1580, 145], [1020, 190], [1220, 165]],
      gravity: 0.22, jump: -5.2, speed: 2.15,
      platforms: [
        P(0, 220, 380, 220, { style: 'wood' }),
        P(430, 215, 620, 215, { kind: 'flat', style: 'wood', drift: { speed: 1.1, amp: 5, phase: 0.6 } }),
        P(620, 214, 780, 196, { ca: [620, 214], cb: [780, 196], kind: 'curve', style: 'metal' }),
        P(800, 200, 980, 200, { kind: 'flat', style: 'wood' }),
        P(1030, 190, 1220, 190, { kind: 'curve', style: 'metal' }),
        P(1250, 180, 1400, 180, { kind: 'flat', style: 'wood' }),
        P(1400, 178, 1560, 150, { kind: 'curve', style: 'metal' }),
        P(1580, 210, 2000, 210),
        P(200, 170, 300, 170, { style: 'wood' }),
        P(700, 150, 800, 150, { style: 'metal' }),
        P(1100, 148, 1200, 148, { style: 'wood' }),
        P(1500, 108, 1600, 108, { style: 'metal' })
      ],
      items: [I(120, 192, 'chakchak'), I(250, 148), I(520, 188, 'chakchak'), I(690, 128), I(880, 170), I(1150, 126, 'chakchak'), I(1300, 150), I(1550, 90), I(1740, 180, 'chakchak'), I(1900, 182)],
      checkpoints: [C(500, 215), C(1060, 190), C(1660, 210)],
      hazards: [S(390, 224, 34), O(1000, 150, 1000, 110, 1000, 176, 0.7), S(1480, 224, 46), S(790, 224, 20), O(880, 150, 860, 120, 900, 170, 1, 6, 1)],
      lamps: [[170, 220], [560, 215], [890, 200], [1320, 180], [1800, 210]],
      goal: { x: 1940, y: 203 },
      quiz: {
        question: 'Что Лобачевский доложил в Казанском университете в 1826 году?',
        options: ['Новую геометрию с несколькими параллелями', 'Закон всемирного тяготения', 'Теорию относительности'],
        correct: 0
      }
    },
    {
      id: 2,
      name: 'ГЛАВНОЕ ЗДАНИЕ КФУ',
      subtitle: 'Академия и зал параллельных',
      fact: 'Лобачевский был ректором Казанского университета в 1827–1846 годах. В залах главного здания его идеи превращаются в лестницы, доступные только в нужной геометрии.',
      task: 'Переключайся в воздухе: одни залы существуют в плоском мире, другие — только в кривом.',
      bg: 'main',
      palette: { sky: '#232b3e', ground: '#4c4030' },
      worldW: 2250,
      spawn: [24, 200],
      vanish: { x: 1260, y: 92 },
      guides: [[1100, 210], [1400, 140], [1100, 140], [1400, 210], [1660, 205], [1840, 170], [540, 205], [700, 184]],
      gravity: 0.22, jump: -5.25, speed: 2.15,
      platforms: [
        P(0, 220, 300, 220),
        P(360, 205, 560, 205, { kind: 'flat', style: 'wood' }),
        P(560, 204, 700, 184, { kind: 'curve', style: 'metal', drift: { speed: 1.4, amp: 6, phase: 1.2 } }),
        P(720, 182, 920, 182, { kind: 'flat', style: 'wood' }),
        P(920, 180, 1100, 180, { kind: 'flat', style: 'wood' }),
        P(1100, 210, 1400, 140, { ca: [1100, 210], cb: [1264, 175], style: 'metal' }),
        P(1264, 175, 1400, 140, { kind: 'curve', style: 'metal' }),
        P(1100, 140, 1400, 140, { kind: 'flat', style: 'wood' }),
        P(1440, 195, 1660, 195, { kind: 'curve', style: 'metal' }),
        P(1660, 190, 1840, 166, { kind: 'curve', style: 'metal' }),
        P(1860, 190, 2250, 190, { kind: 'flat', style: 'stone' }),
        P(430, 150, 540, 150, { style: 'metal' }),
        P(760, 130, 860, 130),
        P(1500, 140, 1600, 140, { style: 'wood' }),
        P(1950, 140, 2060, 140, { style: 'metal' })
      ],
      items: [I(140, 190, 'chakchak'), I(480, 128), I(640, 158), I(820, 100), I(1000, 150), I(1180, 120), I(1350, 110, 'chakchak'), I(1550, 118), I(1750, 150), I(2010, 110), I(2180, 160, 'chakchak')],
      checkpoints: [C(400, 205), C(1120, 210), C(1900, 190)],
      hazards: [S(310, 224, 42), O(920, 150, 920, 100, 920, 170, 0.9), S(1820, 224, 30), O(2000, 190, 2000, 150, 2000, 205, 1.1), S(710, 224, 20), O(1700, 160, 1660, 130, 1740, 180, 0.8, 6, 0)],
      lamps: [[140, 220], [780, 182], [1520, 195], [1980, 190]],
      goal: { x: 2200, y: 183 },
      quiz: {
        question: 'Сколько параллельных прямых проходит через точку вне прямой в геометрии Лобачевского?',
        options: ['Бесконечно много', 'Ровно одна', 'Ни одной'],
        correct: 0
      }
    },
    {
      id: 3,
      name: 'ОБСЕРВАТОРИЯ ЭНГЕЛЬГАРДТА',
      subtitle: 'Храм звёзд и лёгкая гравитация',
      fact: 'Казанская астрономическая школа и обсерватория им. В. П. Энгельгардта известна с XIX века: здесь изучали небо и измеряли пространство. В низкой гравитации кривизна становится заметнее.',
      task: 'Орбиты меняются вместе с геометрией. Переключай чаще, иначе не соберёшь путь к телескопу.',
      bg: 'observatory',
      palette: { ground: '#273047' },
      worldW: 2450,
      spawn: [24, 200],
      vanish: { x: 1420, y: 62 },
      guides: [[1280, 195], [1580, 160], [1280, 155], [1580, 120], [2000, 190], [2210, 150], [900, 175], [1080, 174]],
      gravity: 0.18, jump: -5.4, speed: 2.2,
      platforms: [
        P(0, 220, 340, 220, { kind: 'flat', style: 'metal' }),
        P(400, 210, 640, 210, { kind: 'flat', style: 'metal' }),
        P(680, 190, 860, 190, { kind: 'flat', style: 'metal' }),
        P(680, 205, 860, 168, { kind: 'curve', style: 'metal' }),
        P(900, 175, 1080, 175, { kind: 'curve', style: 'metal', drift: { speed: 1.2, amp: 5, phase: 2.1 } }),
        P(1080, 174, 1280, 174, { kind: 'flat', style: 'metal' }),
        P(1280, 195, 1580, 160, { kind: 'curve', style: 'metal' }),
        P(1610, 180, 1820, 180, { kind: 'flat', style: 'metal' }),
        P(1820, 190, 2000, 190, { kind: 'flat', style: 'metal' }),
        P(2000, 190, 2210, 150, { kind: 'curve', style: 'metal' }),
        P(2240, 200, 2450, 200, { kind: 'curve', style: 'metal' }),
        P(240, 150, 340, 150, { style: 'metal' }),
        P(980, 118, 1080, 118),
        P(1660, 128, 1760, 128),
        P(1180, 132, 1320, 132, { kind: 'pulse', style: 'metal' })
      ],
      items: [I(150, 188, 'chakchak'), I(290, 128), I(520, 180), I(760, 140), I(950, 145, 'chakchak'), I(1160, 145), I(1450, 128), I(1700, 106, 'chakchak'), I(1900, 150), I(2130, 122), I(2380, 170, 'chakchak')],
      checkpoints: [C(430, 210), C(920, 175), C(1640, 180), C(2270, 200)],
      hazards: [S(350, 224, 44), O(620, 160, 620, 110, 620, 185, 0.8), O(1120, 140, 1060, 120, 1200, 160, 0.9), S(1830, 224, 34), O(2050, 130, 2000, 110, 2120, 150, 1.2), O(760, 150, 730, 120, 790, 170, 1, 6, 1)],
      lamps: [[220, 220], [970, 175], [1700, 180], [2300, 200]],
      goal: { x: 2400, y: 193 },
      quiz: {
        question: 'Что измеряют с помощью звёздного параллакса?',
        options: ['Расстояние до близких звёзд', 'Температуру Солнца', 'Скорость ветра'],
        correct: 0
      }
    },
    {
      id: 4,
      name: 'МНОГОЭТАЖНОЕ ЗДАНИЕ КФУ',
      subtitle: 'Подъём по этажам «двойки»',
      fact: 'Второй корпус Казанского университета («двойка») построили в 1970-х годах на верхней террасе Ленинского сада. Здесь его этажи становятся лестницами между геометриями: следующий этаж открывается только в другой плоскости.',
      task: 'Этажи далеко друг от друга: разбегись, прыгни и переключи Q / Shift в воздухе. С места не допрыгнешь — нужен разбег и точный переход.',
      bg: 'kfu2',
      palette: { sky: '#1c2438', ground: '#4c4030' },
      worldW: 560,
      worldTop: -150,
      spawn: [40, 200],
      vanish: { x: 330, y: -126 },
      guides: [[60, 184], [210, 184], [230, 136], [390, 136], [70, 88], [220, 88], [240, 40], [400, 40], [80, -8], [230, -8], [250, -56], [410, -56], [60, -104], [500, -104]],
      gravity: 0.22, jump: -5.4, speed: 2.2,
      platforms: [
        P(0, 230, 560, 230, { style: 'stone' }),
        P(60, 184, 140, 184, { kind: 'flat', style: 'wood' }),
        P(140, 184, 210, 182, { kind: 'flat', style: 'stone' }),
        P(230, 138, 310, 136, { kind: 'curve', style: 'metal' }),
        P(310, 136, 390, 134, { kind: 'curve', style: 'stone' }),
        P(70, 88, 150, 88, { kind: 'flat', style: 'wood' }),
        P(150, 88, 220, 90, { kind: 'flat', style: 'metal' }),
        P(240, 42, 320, 40, { kind: 'curve', style: 'metal' }),
        P(320, 40, 400, 38, { kind: 'curve', style: 'stone' }),
        P(80, -8, 160, -8, { kind: 'flat', style: 'stone' }),
        P(160, -8, 230, -6, { kind: 'flat', style: 'wood' }),
        P(250, -54, 330, -56, { kind: 'curve', style: 'metal' }),
        P(330, -56, 410, -58, { kind: 'curve', style: 'stone' }),
        P(60, -104, 500, -104, { style: 'stone' }),
        P(120, 130, 170, 130, { style: 'wood' }),
        P(300, 14, 350, 14, { style: 'metal' })
      ],
      items: [I(140, 166, 'chakchak'), I(310, 118), I(130, 70, 'chakchak'), I(320, 22), I(150, -26, 'chakchak'), I(330, -74), I(100, -122, 'chakchak'), I(420, -122, 'chakchak')],
      checkpoints: [C(100, 184, 0), C(320, 136, 1), C(120, -8, 0), C(330, -56, 1), C(90, -104, 0)],
      hazards: [S(440, 234, 60), O(220, 112, 220, 82, 220, 120, 0.9), O(235, 24, 235, -6, 235, 28, 1), O(240, -66, 240, -94, 240, -62, 0.9)],
      lamps: [[100, 184], [340, 136], [130, 88], [340, 40], [140, -8], [350, -56], [120, -104], [440, -104]],
      goal: { x: 420, y: -104 },
      quiz: {
        question: 'Какую кривизну имеет гиперболическая плоскость?',
        options: ['Отрицательную', 'Нулевую', 'Положительную'],
        correct: 0
      }
    },
    {
      id: 5,
      name: 'ГОСТИНЫЙ ДВОР',
      subtitle: 'Торговые аркады и чак-чак',
      fact: 'Гостиный двор был торговым сердцем Казани: здесь купцы продавали чай, меха и чак-чак. В его аркадах легко потерять направление, если не следить за геометрией.',
      task: 'Аркады существуют только в своей плоскости. Переключай Q / Shift между прилавками и собирай чак-чак.',
      bg: 'gostiny',
      palette: { sky: '#2a2338', ground: '#6b4a33' },
      worldW: 2400,
      spawn: [24, 200],
      vanish: { x: 1300, y: 96 },
      guides: [[560, 210], [760, 190], [1080, 190], [1300, 150], [1640, 180], [1880, 150], [2080, 180], [2280, 150]],
      gravity: 0.21, jump: -5.4, speed: 2.2,
      platforms: [
        P(0, 220, 360, 220, { style: 'stone' }),
        P(410, 214, 610, 214, { kind: 'flat', style: 'wood' }),
        P(610, 212, 790, 194, { kind: 'curve', style: 'metal' }),
        P(820, 200, 1040, 200, { kind: 'flat', style: 'wood' }),
        P(1060, 198, 1260, 176, { kind: 'curve', style: 'stone' }),
        P(1280, 190, 1500, 190, { kind: 'flat', style: 'wood' }),
        P(1520, 188, 1740, 166, { kind: 'curve', style: 'metal' }),
        P(1760, 196, 2000, 196, { kind: 'flat', style: 'stone' }),
        P(2020, 194, 2240, 174, { kind: 'curve', style: 'metal' }),
        P(2260, 210, 2400, 210, { style: 'stone' }),
        P(180, 170, 300, 170, { style: 'wood' }),
        P(900, 150, 1020, 150, { style: 'metal' }),
        P(1360, 140, 1480, 140, { style: 'wood' }),
        P(1900, 146, 2020, 146, { style: 'metal' })
      ],
      items: [I(120, 192, 'chakchak'), I(250, 148), I(520, 186, 'chakchak'), I(700, 132), I(900, 170), I(1140, 142, 'chakchak'), I(1380, 160), I(1620, 128, 'chakchak'), I(1880, 166), I(2140, 116, 'chakchak'), I(2340, 182)],
      checkpoints: [C(450, 214, 0), C(1080, 198, 1), C(1300, 190, 0), C(2040, 194, 0), C(2300, 210, 0)],
      hazards: [S(380, 224, 26), O(800, 150, 800, 116, 800, 166, 0.8), S(1050, 224, 20), O(1500, 140, 1470, 112, 1530, 158, 0.9, 7, 1), S(1750, 224, 20), O(2240, 140, 2200, 110, 2260, 156, 1)],
      lamps: [[170, 220], [560, 214], [900, 200], [1340, 190], [1780, 196], [2180, 190], [2340, 210]],
      goal: { x: 2340, y: 200 },
      quiz: {
        question: 'Что такое идеальная точка в геометрии Лобачевского?',
        options: ['Точка на бесконечности, где сходятся параллели', 'Центр окружности', 'Точка пересечения осей координат'],
        correct: 0
      }
    },
    {
      id: 6,
      name: 'КАЗАНСКИЙ КРЕМЛЬ',
      subtitle: 'Финал: Зилант',
      fact: 'Зилант — легендарный дракон и символ Казани; башня Сююмбике — самый узнаваемый силуэт Кремля. Научный спор продолжается: сможет ли кривая геометрия победить миф?',
      task: 'Включи кривизну: под Зилантом появится платформа-резонанс. Прыгни и ударь дракона: каждый удар снимает одно очко здоровья.',
      bg: 'kremlin',
      palette: { ground: '#59402f' },
      worldW: 960,
      spawn: [40, 200],
      vanish: { x: 480, y: 74 },
      guides: [[300, 190], [660, 190], [480, 150], [480, 100]],
      gravity: 0.22, jump: -6.2, speed: 2.2,
      boss: true,
      platforms: [
        P(0, 230, 960, 230, { style: 'stone' }),
        P(80, 180, 200, 180, { kind: 'flat', style: 'wood' }),
        P(320, 168, 440, 168, { kind: 'flat', style: 'metal' }),
        P(520, 168, 640, 168, { kind: 'flat', style: 'metal' }),
        P(760, 180, 880, 180, { kind: 'curve', style: 'wood' }),
        P(400, 148, 560, 148, { kind: 'curve', style: 'metal' }),
        P(610, 148, 760, 148, { kind: 'curve', style: 'metal', phase2: true })
      ],
      items: [I(140, 148, 'chakchak'), I(480, 118, 'chakchak'), I(820, 148, 'chakchak'), I(680, 118, 'chakchak')],
      checkpoints: [],
      hazards: [],
      lamps: [[120, 230], [380, 168], [700, 168], [900, 180]],
      goal: null
    }
  ];

  var K = 4;
  KZ.DESIGN_SCALE = K;

  function pair(p) { return [p[0] * K, p[1] * K]; }
  function point(p) { return { x: p.x * K, y: p.y * K }; }

  function scaleLevel(lv) {
    var out = Object.assign({}, lv);
    out.worldW = lv.worldW * K;
    out.worldTop = (lv.worldTop || 0) * K;
    out.spawn = [lv.spawn[0] * K, lv.spawn[1] * K];
    out.vanish = { x: lv.vanish.x * K, y: lv.vanish.y * K };
    out.gravity = lv.gravity * K;
    out.jump = lv.jump * K;
    out.speed = lv.speed * K;
    out.guides = lv.guides.map(pair);
    out.platforms = lv.platforms.map(function (p) {
      return {
        a: pair(p.a), b: pair(p.b), ca: pair(p.ca), cb: pair(p.cb),
        kind: p.kind, style: p.style, phase2: p.phase2,
        drift: p.drift ? { speed: p.drift.speed, amp: p.drift.amp * K, phase: p.drift.phase } : undefined
      };
    });
    out.items = lv.items.map(function (it) {
      return { x: it.x * K, y: it.y * K, type: it.type };
    });
    out.checkpoints = lv.checkpoints.map(function (cp) { var o = point(cp); o.plane = cp.plane; return o; });
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
