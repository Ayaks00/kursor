#!/usr/bin/env python3
"""Собрать kursor-lobachevsky-web.zip без промежуточной папки dist в репозитории.

В архив попадают только файлы, нужные для запуска игры, плюс краткая
информация для жюри (README, CREDITS и ЗАПУСК.txt).
"""
import shutil
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZIP = ROOT / 'kursor-lobachevsky-web.zip'

FILES = [
    'index.html', 'play.html',
    'css/style.css',
    'src/bg-data.js', 'src/sfx-data.js', 'src/audio.js', 'src/input.js', 'src/art.js',
    'src/levels.js', 'src/game.js', 'src/ui.js', 'src/main.js',
    'README.md', 'CREDITS.md',
    'assets/bg/bauman.png', 'assets/bg/kfu-main.png',
    'assets/bg/observatory.png', 'assets/bg/kremlin.png',
    'assets/sfx/jump.ogg', 'assets/sfx/coin.ogg', 'assets/sfx/fall.ogg',
    'assets/sfx/land.ogg', 'assets/sfx/break.ogg', 'assets/sfx/toggle.mp3',
    'assets/sfx/click.mp3', 'assets/sfx/checkpoint.mp3', 'assets/sfx/win.mp3',
    'assets/sfx/hit.mp3',
]

START = ('Откройте index.html в Chrome или Яндекс Браузере — двойным кликом, '
         'без установки и без запуска сервера. Нажмите клавишу для включения звука.\n'
         'Управление: WASD/стрелки — движение, пробел — прыжок, Q/Shift — кривизна,\n'
         'Esc/P — пауза, R — рестарт, M — звук. Подробности в README.md.\n')


def main():
    with tempfile.TemporaryDirectory(prefix='kursor-web-') as tmp:
        stage = Path(tmp)
        for rel in FILES:
            target = stage / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / rel, target)
        (stage / 'ЗАПУСК.txt').write_text(START, encoding='utf-8')

        with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for path in sorted(stage.rglob('*')):
                if path.is_file():
                    zf.write(path, path.relative_to(stage))
    print(f'Built {ZIP} ({ZIP.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
