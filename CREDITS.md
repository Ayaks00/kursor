# CREDITS — авторы, материалы и лицензии

## Команда

**Команда ИБ** — код, игровая механика, тексты, графика, фоны, музыка, презентации и документация по регламенту.

## Сторонние материалы

| Тип | Что используется | Автор / источник | Лицензия |
|---|---|---|---|
| Звуки | `jump.ogg`, `coin.ogg`, `fall.ogg`, `land.ogg`, `break.ogg` | [Kenney — Starter Kit 3D Platformer](https://github.com/KenneyNL/Starter-Kit-3D-Platformer) | CC0 1.0 |
| Звуки | `toggle.mp3`, `click.mp3`, `checkpoint.mp3`, `win.mp3`, `hit.mp3` | [jupixels/game-sounds](https://github.com/jupixels/game-sounds), паки Kenney | CC0 1.0 |
| Шрифты | DejaVu Sans / DejaVu Sans Mono в PDF-презентации | Bitstream Vera / DejaVu Fonts | свободная лицензия Bitstream Vera |
| Шрифты | Системные Arial / Segoe UI в PPTX и интерфейсе | ОС пользователя | не включаются в сборку |

CC0 1.0: <https://creativecommons.org/publicdomain/zero/1.0/>. Атрибуция не обязательна, но указана. Исходные звуки лежат в `app/assets/sfx/`, их data URI-копии — в `app/src/sfx-data.js`, чтобы игра работала без отдельной загрузки файлов.

## Собственные материалы

- **Код:** `main.js`, `app/src/*.js`. Ввод, физика, состояния, камера, чекпоинты, босс, навыки, языки, UI и звук реализованы командой ИБ.
- **Фоны:** шесть PNG в `app/assets/bg/` и их встроенные копии в `app/src/bg-data.js`. Перерисованы в едином пиксельном стиле по фотографиям реальных казанских локаций; список источников — в `README.md` и ниже.
- **Спрайты и эффекты:** дракон, персонаж, платформы, фонари, частицы, кольца, вспышки, идеальная точка — программный рендер Canvas 2D в `app/src/art.js` и `app/src/game.js`.
- **Музыка и синтезированные звуки:** Web Audio API в `app/src/audio.js`.
- **Тексты и документы:** `README.md`, `DESIGN.md`, `CREDITS.md`, `docs/qa-answers.md`, `docs/coding-cheatsheet.md`, презентации `Krivaya_Kazan_presentation.pptx`, `docs/slides.pdf` и `presentation/index.html`.
- **Скриншоты:** `docs/screens/*.png` — кадры самой игры.

## Источники фактов

| Элемент | Источник |
|---|---|
| Н. И. Лобачевский, доклад 1826 г., ректор КФУ | [КФУ](https://kpfu.ru/math/history/znamenitye-personalii/lobachevskij-nikolaj-ivanovich), [Музеи КФУ](https://dm.kpfu.ru/) |
| Улица Баумана, Богоявленский собор | [Advantour](https://www.advantour.com/russia/kazan/bauman-street.htm) |
| Главное здание КФУ | [Музей истории КФУ](https://dm.kpfu.ru/) |
| Второй корпус КФУ («двойка») | [Музеи КФУ](https://museums.kpfu.ru/blog/news/vid-na-novye-korpusa) |
| Обсерватория им. Энгельгардта | [КФУ](https://kpfu.ru/physics/struktura/kafedry/otdelenie-astrofiziki-i-kosmicheskoj-geodezii/astronom-observ-engelgardta), [astro.kpfu.ru](https://astro.kpfu.ru/architecture) |
| Гостиный двор | [HobbySalon](https://www.hobbysalon.ru/russia/respublika-tatarstan/kazan/gostinyj-dvor-v-kazani) |
| Казанский Кремль, башня Сююмбике | [UNESCO](https://unesco.ru/en/unescorussia/sites/s980/), [kazan-kremlin.ru](https://kazan-kremlin.ru/) |

«Идеальная точка» как платформа, постулаты и мини-игра с Зилантом — игровая метафора, а не исторический факт.
