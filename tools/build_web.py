#!/usr/bin/env python3
"""Собрать веб-версию в dist/ и упаковать kursor-lobachevsky-web.zip."""
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
ZIP = ROOT / 'kursor-lobachevsky-web.zip'

FILES = [
    'index.html', 'play.html',
    'css/style.css',
    'src/sfx-data.js', 'src/audio.js', 'src/input.js', 'src/art.js',
    'src/levels.js', 'src/game.js', 'src/ui.js', 'src/main.js',
    'README.md', 'CREDITS.md',
    'assets/sfx/jump.ogg', 'assets/sfx/coin.ogg', 'assets/sfx/fall.ogg',
    'assets/sfx/land.ogg', 'assets/sfx/break.ogg', 'assets/sfx/toggle.mp3',
    'assets/sfx/click.mp3', 'assets/sfx/checkpoint.mp3', 'assets/sfx/win.mp3',
    'assets/sfx/hit.mp3',
]

DIST_START = ('Откройте index.html в Chrome или Яндекс Браузере — двойным кликом, '
              'без установки и без запуска сервера. Нажмите клавишу для включения звука.\n'
              'Управление: WASD/стрелки — движение, пробел — прыжок, Q/Shift — кривизна,\n'
              'Esc/P — пауза, R — рестарт, M — звук. Подробности в README.md.\n')


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    for rel in FILES:
        target = DIST / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, target)
    (DIST / 'ЗАПУСК.txt').write_text(DIST_START, encoding='utf-8')

    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in sorted(DIST.rglob('*')):
            if path.is_file():
                zf.write(path, path.relative_to(DIST))
    print(f'Built {DIST} and {ZIP} ({ZIP.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
