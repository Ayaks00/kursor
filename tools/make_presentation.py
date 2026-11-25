#!/usr/bin/env python3
"""Генерация презентации docs/slides.pdf: 7 слайдов по регламенту защиты.

Структура: титул → проблема и идея → механика → уровни → реализация →
проверка и требования → команда, источники, запуск.
Запуск: python tools/make_presentation.py (нужны reportlab и системный DejaVu Sans).
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs' / 'slides.pdf'
W, H = landscape(A4)
TOTAL = 7
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
    c.setFont('DejaVu-Bold', 23)
    c.drawString(34, H - 46, title)
    if kicker:
        c.setFont('DejaVu', 11)
        c.setFillColor(CYAN)
        c.drawString(36, H - 65, kicker)
    c.setFont('DejaVu', 9)
    c.setFillColor(MUTED)
    c.drawString(W - 70, 18, f'{n}/{TOTAL}')


def bullets(c, items, x, y, width, size=12, leading=21):
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
    background(c, 1, 'ЛОБАЧЕВСКИЙ: КРИВАЯ КАЗАНЬ',
               'Пиксельный платформер в античном стиле · команда ИБ')
    c.setFont('DejaVu-Bold', 18)
    c.setFillColor(CYAN)
    c.drawString(36, H - 106, 'Геометрия, которая становится платформой')
    wrap(c, 'Законченная игра: меню, три уровня Казани, босс Зилант и победа. Главная механика — '
            'переключение между плоским миром и геометрией Лобачевского: параллельные навесы '
            'сходятся в идеальной точке и превращаются в проходимый мост.',
         36, H - 138, 515, 12.5, 19)
    bullets(c, [
        'Наука: Н. И. Лобачевский, доклад 1826 года, ректор КФУ в 1827–1846 гг.',
        'Казань: четыре разных статичных фона — Баумана, КФУ, обсерватория, Кремль.',
        'Формат: веб без установки среды, raster и логика 1920×1080, сборка < 400 КБ.',
        'Детали: чешуя Зиланта, роспись амфор, швы дорожек, бронзовые фонари, эффекты.',
    ], 36, H - 235, 515, 11.5, 18)
    screenshot(c, '01-menu.png', 580, 125, 225)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 10.5)
    c.drawString(36, 48, 'Игра: index.html · Сборка: kursor-lobachevsky-web.zip · Исходники: GitHub')


def slide2(c):
    background(c, 2, 'ПРОБЛЕМА И ИДЕЯ', 'Как превратить научный факт в игровое действие')
    c.setFont('DejaVu-Bold', 14)
    c.setFillColor(CYAN)
    c.drawString(36, H - 100, 'Проблема')
    bullets(c, [
        'Открытие Лобачевского обычно остаётся текстом в учебнике.',
        'Казань упоминается как «место события», а не как игровое пространство.',
        'Нужна механика, которую видно за 10 секунд и без длинной инструкции.',
        'Требовался полный цикл: 3 уровня, финал, смерти и возрождение, звук.',
    ], 36, H - 125, 390, 11.5, 19)
    c.setFont('DejaVu-Bold', 14)
    c.setFillColor(CYAN)
    c.drawString(452, H - 100, 'Решение')
    bullets(c, [
        'Кривизна — не декор, а обязательное условие прохождения уровней.',
        'Параллельные навесы сходятся в «идеальной точке» и становятся мостом.',
        'Четыре локации с разными статичными фонами и фактами в текстах уровней.',
        'Смерти, чекпоинты, сохранение прогресса, пауза и подсказки.',
    ], 452, H - 125, 360, 11.5, 19)
    wrap(c, 'Результат: игрок одновременно видит Казань, узнаёт дату 1826 года и '
            'проверяет кривизну на практике, а не читает про неё.',
         36, 88, 780, 12, 19, color=GOLD)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 10)
    c.drawString(36, 46, 'Факты сверены по kpfu.ru, dm.kpfu.ru, astro.kpfu.ru и unesco.ru; вымысел помечен как метафора.')


def slide3(c):
    background(c, 3, 'ФИШКА: КРИВИЗНА КАК МЕХАНИКА', 'Q / Shift — переключение мира · мрамор и бронза')
    bullets(c, [
        'Платформа описана двумя отрезками: обычным и «кривым»; концы интерполируются.',
        'В кривом режиме мосты и пандусы появляются, обычные платформы исчезают.',
        'Пунктирные лучи сходятся в идеальную точку — центр искривления уровня.',
        'Переключение доступно в прыжке; без него ни один уровень не проходится.',
        'Эффект: дуги, искажение кадра, смена цвета героя и звук перехода.',
    ], 36, H - 108, 465, 12, 21)
    screenshot(c, '06-curved.png', 520, 150, 290)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 10)
    c.drawString(520, 130, 'Параллельные навесы сошлись в идеальной точке')
    c.drawString(36, 48, 'Идея Лобачевского использована как игровая метафора, а не как буквальный исторический эпизод.')


def slide4(c):
    background(c, 4, 'УРОВНИ И ИГРОВОЙ ЦИКЛ', 'Меню → 3 уровня → босс → катсцена → победа')
    cards = [
        ('1. БАУМАНА', 'Обучение кривизне: навесы лавок превращаются в мост.'),
        ('2. ГЛАВНОЕ ЗДАНИЕ КФУ', 'Переключение в воздухе, платформы «в двух листах» геометрии.'),
        ('3. ОБСЕРВАТОРИЯ ЭНГЕЛЬГАРДТА', 'Низкая гравитация, звёздная навигация, цепочка сужений.'),
        ('4. КРЕМЛЬ: ЗИЛАНТ', 'Три удара только в кривом мире; финальная катсцена и титры.'),
    ]
    y = H - 118
    for title, body in cards:
        c.setFillColor(CYAN)
        c.setFont('DejaVu-Bold', 12.5)
        c.drawString(36, y, title)
        wrap(c, body, 36, y - 19, 455, 11, 16)
        y -= 68
    screenshot(c, '09-boss.png', 520, 315, 290)
    screenshot(c, '08-observatory.png', 520, 125, 290)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 9)
    c.drawString(520, 490, 'Финал: Зилант')
    c.drawString(520, 300, 'Уровень 3: обсерватория')


def slide5(c):
    background(c, 5, 'КАК СДЕЛАНА ИГРА', 'Чистый JavaScript, Canvas 2D, DOM-интерфейс, без сборщика')
    c.setFont('DejaVu-Bold', 13)
    c.setFillColor(CYAN)
    c.drawString(36, H - 100, 'Из чего собрано')
    bullets(c, [
        'levels.js — данные 4 сцен в координатах 1920×1080: платформы, чекпоинты, цели.',
        'art.js — спрайты и платформы из примитивов Canvas 2D, сетка 4 логических px.',
        'game.js — цикл 60 Гц, физика, камера, столкновения и преобразование кривизны.',
        'ui.js + CSS — весь русский текст в HTML поверх canvas, текст не рисуется на canvas.',
        'audio.js — Web Audio: процедурная музыка; CC0-сэмплы встроены в sfx-data.js.',
    ], 36, H - 125, 500, 11.5, 18)
    c.setFont('DejaVu-Bold', 13)
    c.setFillColor(CYAN)
    c.drawString(565, H - 100, 'Как запускается')
    bullets(c, [
        'Фоны: generate_backgrounds.js → PNG → bg-data.js (data URI, file:// работает).',
        'build_web.py → dist/ и ZIP; внешних картинок и зависимостей нет.',
        'Chrome / Яндекс Браузер: открыть index.html или play.html.',
        'Сборка < 400 КБ, загрузка < 10 с, 30+ FPS, управление с клавиатуры.',
    ], 565, H - 125, 250, 11, 17)
    screenshot(c, '05-play.png', 565, 165, 250)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 9.5)
    c.drawString(36, 46, 'Дорожки и платформы получили тёмную подложку, контур и светлый верхний край для контраста с фоном.')


def slide6(c):
    background(c, 6, 'ПРОВЕРКА И СООТВЕТСТВИЕ', 'Требования О-1…О-10 подтверждены запуском и тестами')
    c.setFont('DejaVu-Bold', 12)
    c.setFillColor(CYAN)
    c.drawString(36, H - 98, 'Требования')
    bullets(c, [
        'О-1 Фишка: переключение геометрии меняет платформы.',
        'О-2 Объём: 3 уровня + босс + победа.',
        'О-3 Казань: Баумана, КФУ, обсерватория, Кремль, Сююмбике, Зилант.',
        'О-4 Наука: Лобачевский, 1826, ректорство 1827–1846.',
        'О-5 Механика обязательна и видна в первые 10 секунд.',
        'О-6 Меню и пауза: продолжить, рестарт, звук.',
        'О-7 Смерти, чекпоинты, сохранение прогресса.',
        'О-8 Подсказка скрывается пробелом, есть «Как играть».',
        'О-9 CC0-звуки и процедурная музыка.',
        'О-10 Команда, источники и лицензии — в README.',
    ], 36, H - 120, 405, 10.5, 15)
    c.setFont('DejaVu-Bold', 12)
    c.setFillColor(CYAN)
    c.drawString(465, H - 98, 'Что проверено')
    bullets(c, [
        'Симуляция: все 3 уровня и бой пройдены до конца.',
        'Регрессия чекпоинтов: респавн всегда на платформе.',
        'Fuzz и UI-smoke: 0 ошибок, все экраны открываются.',
        'Сборка и распаковка ZIP; запуск с file:// и с Pages.',
        'Русский интерфейс без текста на canvas.',
        'Совместимость: Chrome, Яндекс Браузер, клавиатура.',
    ], 465, H - 120, 350, 10.5, 17)
    screenshot(c, '10-victory.png', 500, 90, 300)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 9.5)
    c.drawString(36, 46, 'Скрипты проверки: tools/simulate.js, tools/ui-smoke.js, tools/preview.js.')


def slide7(c):
    background(c, 7, 'КОМАНДА, ИСТОЧНИКИ, ЗАПУСК', 'Прозрачность и воспроизводимость — часть проекта')
    c.setFont('DejaVu-Bold', 15)
    c.setFillColor(CYAN)
    c.drawString(36, H - 105, 'КОМАНДА ИБ')
    bullets(c, [
        'Код, тексты, уровни, пиксельная графика и музыка — команда ИБ.',
        'Сторонние ассеты: только CC0-звуки Kenney, список в CREDITS.md.',
        'Факты: kpfu.ru (Лобачевский, 1826), dm.kpfu.ru, astro.kpfu.ru, unesco.ru.',
        'Игровая метафора не выдаётся за исторический факт.',
    ], 36, H - 135, 520, 11.5, 19)
    c.setFont('DejaVu-Bold', 15)
    c.setFillColor(CYAN)
    c.drawString(36, H - 230, 'КАК ЗАПУСТИТЬ')
    bullets(c, [
        'Открыть index.html в Chrome или Яндекс Браузере — установка не нужна.',
        'Или распаковать kursor-lobachevsky-web.zip; онлайн: ayaks00.github.io/kursor/',
        'Управление: WASD/стрелки, пробел, Q/Shift, Esc/P, R, M.',
        'Демо-видео до 2 минут: 1920×1080, 30 FPS, нарезка описана в README.',
    ], 36, H - 260, 520, 11.5, 19)
    screenshot(c, '10-victory.png', 590, 180, 215)
    c.setFillColor(MUTED)
    c.setFont('DejaVu', 9.5)
    c.drawString(36, 46, 'Русский язык интерфейса · 4 локации · шпаргалка для защиты: docs/qa-answers.md')


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H))
    c.setTitle('Лобачевский: Кривая Казань — презентация')
    for fn in (slide1, slide2, slide3, slide4, slide5, slide6, slide7):
        fn(c)
        c.showPage()
    c.save()
    print(f'Wrote {OUT} ({OUT.stat().st_size} bytes, {TOTAL} slides)')


if __name__ == '__main__':
    main()
