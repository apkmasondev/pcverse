import sys
from datetime import datetime

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

date_str = datetime.now().strftime("%Y-%m-%d")

new_entry = f"""
## [{date_str}] - Tekstury, Glassmorphism Tooltips i poprawki Z-Index

### Dodane
- Zintegrowano nową grafikę `hdd_side.webp` na lewą i prawą burtę dysku twardego (`HDDGeometry`).
- Zintegrowano nową grafikę `fan_side.webp` na zewnętrzne krawędzie ram wszystkich wentylatorów w obudowie (`FanGeometry`).

### Poprawione / Zmienione
- **Lustrzane Odbicie HDD**: Wdrożono sklonowaną i odwróconą teksturę (Mirroring via `RepeatWrapping` i `repeat.x = -1`) na prawej ścianie dysku HDD, co zapewnia jej poprawną orientację.
- **Rotacja UV wentylatorów**: Zmodyfikowano mapowanie UV na bocznych krawędziach (lewa/prawa) wentylatorów poprzez rotację tekstury o równe 90 stopni (`Math.PI / 2`). Wyeliminowano efekt "pikselowych smug" wynikający z agresywnego zgniatania proporcji tekstury.
- **Glassmorphism Tooltips**: Wdrożono nowy, elegancki design dymków z nazwami komponentów. Użyto `backdrop-blur-xl`, asymetrycznych zaokrągleń i gradientów, dodając jednocześnie precyzyjny celownik i lepszą typografię z oddzielonym tłumaczeniem (zero wpływu na wydajność, brak bibliotek zewnętrznych).
- **Z-Index Fix (Loading Screen)**: Naprawiono błąd nakładania się warstw, w którym etykiety 3D (`<Html>`) przebijały ekran ładowania podczas zmiany środowiska. Ekran ładowania otrzymał nadrzędny `z-[9999]`.
"""

content = content.replace("# Dziennik Zmian (Changelog)\n\n", "# Dziennik Zmian (Changelog)\n" + new_entry)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
