import sys
from datetime import datetime

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

date_str = datetime.now().strftime("%Y-%m-%d")

new_entry = f"""## [{date_str}] - Dodanie tekstur na krawędzie komponentów

### Dodane
- Zintegrowano nową grafikę `hdd_side.webp` na lewą i prawą burtę dysku twardego (`HDDGeometry`).
- Zintegrowano nową grafikę `fan_side.webp` na zewnętrzne krawędzie ram wszystkich wentylatorów w obudowie (`FanGeometry`).

### Poprawione / Zmienione
- Wdrożono sklonowaną i odwróconą teksturę (Mirroring via `RepeatWrapping` i `repeat.x = -1`) na prawej ścianie dysku HDD, co zapewnia jej poprawną orientację.
- Zmodyfikowano mapowanie UV na bocznych krawędziach (lewa/prawa) wentylatorów poprzez rotację tekstury o równe 90 stopni (`Math.PI / 2`). Eliminacja ekstremalnego błędu proporcji, który wcześniej powodował agresywne, rozmyte pionowe smugi przy wciskaniu szerokiego obrazu na krótką, pionową ściankę sześcianu.

"""

content = content.replace("# Changelog\n\n", "# Changelog\n\n" + new_entry)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
