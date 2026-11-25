# CREDITS — авторы и лицензии ассетов

## Сторонние ассеты (CC0 1.0)

| Файл в игре | Автор | Лицензия | Источник |
|---|---|---|---|
| `assets/sfx/jump.ogg`, `coin.ogg`, `fall.ogg`, `land.ogg`, `break.ogg` | Kenney (kenney.nl) | CC0 1.0 | [KenneyNL/Starter-Kit-3D-Platformer](https://github.com/KenneyNL/Starter-Kit-3D-Platformer), папка `sounds/`. В README репозитория звуки помечены как CC0. |
| `assets/sfx/toggle.mp3` (`phaser_up_01`), `click.mp3` (`click_01`), `checkpoint.mp3` (`confirm_01`), `win.mp3` (`jingle_8bit_01`), `hit.mp3` (`jingle_hit_01`) | Kenney (kenney.nl); перекодирование в MP3 — репозиторий jupixels | CC0 1.0 | [jupixels/game-sounds](https://github.com/jupixels/game-sounds), папки `sounds/arcade`, `sounds/ui`, `sounds/jingles`. Согласно `LICENSE.md` репозитория, все звуки в этих папках — CC0-паки Kenney (Interface Sounds, UI Audio, RPG Audio, Sci-fi Sounds, Digital Audio, Music Jingles). |

CC0 1.0: <https://creativecommons.org/publicdomain/zero/1.0/>. Атрибуция не обязательна, но указана.

Original sounds © Kenney, https://kenney.nl/. Сэмплы конвертированы в data URI в `src/sfx-data.js` (скрипт `tools/embed_sfx.py`), чтобы игра запускалась прямо из `file://` без CORS-запретов.

## Собственные материалы «команды ИБ»

- Весь игровой код: `src/game.js`, `src/art.js`, `src/levels.js`, `src/input.js`, `src/audio.js`, `src/main.js`.
- Четыре статичных фона 1920×1080: `assets/bg/bauman.png` (античная агора с лавками и чак-чаком), `assets/bg/kfu-main.png` (портик КФУ), `assets/bg/observatory.png` (купол, астролябия, звёздная карта), `assets/bg/kremlin.png` (стена, башня Сююмбике, знамёна с Зилантом). Сгенерированы скриптом `tools/generate_backgrounds.js`.
- Эффекты (ореолы, частицы, ударные кольца, вспышки, тряска, конфетти, виньетка), детализированные спрайты объектов и бронзовые фонари — собственный код в `src/art.js` и `src/game.js`.
- Пиксельная графика в античной стилизации (мрамор, бронза, амфоры, лавр, греческий меандр): рисуется программно через Canvas 2D примитивы в `src/art.js` (здания, портик КФУ, обсерватория, Кремль, Сююмбике, Зилант, персонаж, предметы, орнамент). Внешних изображений нет.
- Фоновая музыка в античном колорите (лира/кифара и рамный барабан) и «дыхание» идеальной точки: синтезируются в `src/audio.js` через Web Audio API (гармонический минор, chiptune).
- Тексты уровней, меню, титров, README, DESIGN.md и презентация.

Все перечисленные материалы созданы командой ИБ; процедурные фоны и спрайты воспроизводимы из исходников (`tools/generate_backgrounds.js`, `src/art.js`), музыка — из `src/audio.js`.

## Шрифты

Сторонние шрифты в сборку не входят. Интерфейс использует системные античные засечные шрифты браузера (`Georgia`, `Times New Roman`, `DejaVu Serif`), что даёт резкую кириллицу при raster canvas 1920×1080. Для PDF-презентации используется системный DejaVu Sans (Bitstream Vera License, свободная лицензия), не входящий в игровую сборку.

## Источники фактов (не ассеты)

- Казанский федеральный университет: <https://kpfu.ru/math/history/znamenitye-personalii/lobachevskij-nikolaj-ivanovich>
- Дирекция музеев КФУ: <https://dm.kpfu.ru/>
- Астрономическая обсерватория им. Энгельгардта: <https://kpfu.ru/physics/struktura/kafedry/otdelenie-astrofiziki-i-kosmicheskoj-geodezii/astronom-observ-engelgardta>, <https://astro.kpfu.ru/architecture>
- ЮНЕСКО / Казанский Кремль: <https://unesco.ru/en/unescorussia/sites/s980/>
