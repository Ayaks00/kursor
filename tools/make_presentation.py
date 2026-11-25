#!/usr/bin/env python3
"""Генерация презентации docs/slides.pdf (6 слайдов, до 7 по требованиям).
Запуск: python tools/make_presentation.py  (нужен reportlab и системный DejaVu Sans)."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs' / 'slides.pdf'
W, H = landscape(A4)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('DejaVu', FONT))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', BOLD))

BG = HexColor('#11132a')
GOLD = HexColor('#f2d68a')
CYAN = HexColor('#8ee9f2')
WHITE = HexColor('#e9e2cc')
MUTED = HexColor('#b4a98e')


def wrap(c, text, x, y, max_width, size, leading, font='DejaVu', color=WHITE):
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split()
    line = ''
    for word in words:
        test = (line + ' ' + word).strip()
        if pdfmetrics.stringWidth(test, font, size) > max_width and line:
            c.drawString(x, y, line)
            y -= leading
            line = word
        else:
            line = test
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def background(c, n, title, kicker=None):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, H - 8, W, 8, fill=1, stroke=0)
    c.setFillColor(CYAN)
    c.rect(0, 0, W, 4, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont('DejaVu-Bold', 24)
    c.drawString(34, H - 48, title)
    if kicker:
        c.setFont('DejaVu', 11)
        c.setFillColor(CYAN)
        c.drawString(36, H - 67, kicker)
    c.setFont('DejaVu', 9)
    c.setFillColor(MUTED)
    c.drawString(W - 70, 18, f'{n}/6')


def bullets(c, items, x, y, width, size=12, leading=22):
    for item in items:
        c.setFillColor(GOLD)
        c.circle(x + 3, y + 4, 2.5, fill=1, stroke=0)
        y = wrap(c, item, x + 14, y, width - 14, size, leading)
        y -= 5
    return y


def screenshot(c, name, x, y, w):
    h = w * 270 / 480
    c.drawImage(str(ROOT / 'docs' / 'screens' / name), x, y, w, h, mask='auto')
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.rect(x, y, w, h, fill=0, stroke=1)


def slide1(c):
    background(c, 1, 'ЛОБАЧЕВСКИЙ: КРИВАЯ КАЗАНЬ', 'Пиксельный платформер в античном стиле · команда ИБ')
    c.setFont('DejaVu-Bold', 18)
    c.setFillColor(CYAN)
    c.drawString(36, H - 110, 'Геометрия, которая становится платформой')
    wrap(c, 'Платформер с одним законченным циклом: старт, три уровня Казани, босс Зилант и победа. '
           'Уникальная механика — переключение между плоским миром и геометрией Лобачевского: '
           'параллельные платформы сходятся в идеальной точке и превращаются в проходимый мост.',
         36, H - 145, 520, 13, 21)
    bullets(c, [
        'Наука: Н. И. Лобачевский, доклад 1826 года, ректор КФУ в 1827–1846 гг.',
        'Казань: Баумана, главное здание КФУ, обсерватория Энгельгардта, Кремль, Сююмбике, Зилант.',
        'Формат: веб, запуск без установки среды, 480×270 px, < 300 КБ.',
    ], 36, H - 250, 520, 12, 19)
    screenshot(c, 'menu.png', 560, 120, 248)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 11)
    c.drawString(36, 50, 'Игра: index.html · Исходники: GitHub · Сборка: kursor-lobachevsky-web.zip')


def slide2(c):
    background(c, 2, 'ДВА СЛОЯ: КАЗАНЬ И НАУКА', 'Античная Казань + реальное открытие')
    c.setFont('DejaVu-Bold', 14)
    c.setFillColor(CYAN)
    c.drawString(36, H - 100, 'Слой «Казань»')
    bullets(c, [
        'Улица Баумана: лавки, чак-чак, татарский орнамент.',
        'Главное здание КФУ: портик и залы Лобачевского.',
        'Обсерватория им. В. П. Энгельгардта: купол, телескоп, звёзды.',
        'Казанский Кремль, башня Сююмбике, дракон Зилант — финал.',
    ], 36, H - 125, 430, 12, 20)
    c.setFont('DejaVu-Bold', 14)
    c.setFillColor(CYAN)
    c.drawString(520, H - 100, 'Слой «Наука»')
    bullets(c, [
        'Николай Иванович Лобачевский — создатель неевклидовой геометрии.',
        '11 (23) февраля 1826 — доклад о «воображаемой геометрии».',
        'Ректор Казанского университета в 1827–1846 годах.',
        'Идея «сходящихся параллельных» управляет пространством уровней.',
    ], 520, H - 125, 420, 12, 20)
    wrap(c, 'Источники: kpfu.ru/math/history/.../lobachevskij-nikolaj-ivanovich · dm.kpfu.ru · '
            'astro.kpfu.ru/architecture · unesco.ru/en/unescorussia/sites/s980/',
         36, 78, 900, 10, 15, color=MUTED)


def slide3(c):
    background(c, 3, 'ФИШКА: КРИВИЗНА КАК МЕХАНИКА', 'Q / Shift — переключение мира · мрамор и бронза')
    bullets(c, [
        'Платформа описана двумя отрезками: обычным и «кривым»; концы интерполируются.',
        'В кривом режиме мосты и пандусы появляются, обычные платформы исчезают.',
        'Пунктирные лучи сходятся в идеальную точку — центр искривления уровня.',
        'Переключение доступно в прыжке; без него ни один уровень не проходится.',
        'Эффект: дуги, искажение кадра, смена цвета персонажа и звук перехода.',
    ], 36, H - 110, 470, 12, 21)
    screenshot(c, 'curved-geometry.png', 520, 150, 288)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 10)
    c.drawString(520, 130, 'Скриншот: параллельные навесы сошлись в точке')


def slide4(c):
    background(c, 4, 'ИГРОВОЙ ЦИКЛ', 'Меню → 3 уровня → босс → катсцена')
    cards = [
        ('1. БАУМАНА', 'Обучение кривизне: навесы лавок превращаются в мост.'),
        ('2. ГЛАВНОЕ ЗДАНИЕ КФУ', 'Переключение в воздухе, платформы «в двух листах» геометрии.'),
        ('3. ОБСЕРВАТОРИЯ ЭНГЕЛЬГАРДТА', 'Низкая гравитация, звёздная навигация, цепочка сужений.'),
        ('4. КРЕМЛЬ: ЗИЛАНТ', 'Три удара только в кривом мире; финальная катсцена и титры.'),
    ]
    y = H - 120
    for title, body in cards:
        c.setFillColor(CYAN)
        c.setFont('DejaVu-Bold', 13)
        c.drawString(36, y, title)
        wrap(c, body, 36, y - 20, 480, 11, 16)
        y -= 70
    screenshot(c, 'boss-zilant.png', 520, 320, 288)
    screenshot(c, 'observatory.png', 520, 130, 288)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 9)
    c.drawString(520, 495, 'Финал: Зилант')
    c.drawString(520, 305, 'Уровень 3: обсерватория')


def slide5(c):
    background(c, 5, 'ТЕХНИКА И ТРЕБОВАНИЯ', 'Античная стилизация, чистый JavaScript, без установки среды')
    bullets(c, [
        'Стек: HTML5 Canvas 2D, чистый JavaScript, без сборщика и зависимостей.',
        'Запуск: открыть index.html в Chrome / Яндекс Браузере; также архив со сборкой.',
        'Управление: WASD/стрелки, пробел, Q/Shift, Esc/P, R, M; мышь в меню.',
        '30+ FPS, загрузка уровня < 1 с, размер сборки < 300 КБ.',
        'Меню, пауза, рестарт, выход, чекпоинты, сохранение прогресса, подсказки.',
        'Звуки прыжка/сбора/смерти и фоновая музыка; экран «Об игре» с источниками.',
    ], 36, H - 110, 510, 12, 20)
    c.setFillColor(CYAN)
    c.setFont('DejaVu-Bold', 14)
    c.drawString(600, H - 110, 'Соответствие')
    wrap(c, 'О-1 фишка · О-2 3 уровня + финал · О-3 Казань · О-4 наука · О-5 механика — критично. '
            'О-6…О-10 — меню, смерти, подсказка, звук, титры — выполнены.',
         600, H - 140, 330, 12, 21)


def slide6(c):
    background(c, 6, 'КОМАНДА, ИСТОЧНИКИ, АССЕТЫ', 'Прозрачность — часть игры')
    c.setFont('DejaVu-Bold', 16)
    c.setFillColor(CYAN)
    c.drawString(36, H - 110, 'КОМАНДА ИБ')
    bullets(c, [
        'Код, тексты, пиксельная графика, уровни и музыка — команда ИБ.',
        'ИИ-инструмент: Arena.ai Agent (код, тексты, графика, музыка, тестирование).',
        'Сторонние ассеты: CC0-звуки Kenney (CREDITS.md); остальное — собственное.',
        'Факты: Музей истории КФУ, страницы КФУ, astro.kpfu.ru, UNESCO.',
        'Игровая метафора не выдаётся за исторический факт.',
    ], 36, H - 150, 560, 12, 21)
    screenshot(c, 'victory.png', 580, 110, 228)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 10)
    c.drawString(36, 42, 'Русский язык интерфейса · 4 сцены · демо-видео записывается по инструкции в README')


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H))
    c.setTitle('Лобачевский: Кривая Казань — презентация')
    for fn in (slide1, slide2, slide3, slide4, slide5, slide6):
        fn(c)
        c.showPage()
    c.save()
    print(f'Wrote {OUT} ({OUT.stat().st_size} bytes, 6 slides)')


if __name__ == '__main__':
    main()
