import sys
from datetime import datetime

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

date_str = datetime.now().strftime("%Y-%m-%d")

# Check if today's date is already at the top
if f"## [{date_str}]" in content:
    # Append to today's entry
    new_entry = """
### Ulepszenia UI i Poprawki Błędów
- **Glassmorphism Tooltips**: Wdrożono nowy, elegancki design dymków z nazwami komponentów. Użyto `backdrop-blur-xl`, asymetrycznych zaokrągleń i gradientów, dodając jednocześnie precyzyjny celownik i lepszą typografię z oddzielonym tłumaczeniem (zero wpływu na wydajność, brak bibliotek zewnętrznych).
- **Z-Index Fix (Loading Screen)**: Naprawiono błąd nakładania się warstw, w którym etykiety 3D (`<Html>`) przebijały ekran ładowania podczas zmiany środowiska. Ekran ładowania otrzymał nadrzędny `z-[9999]`.
"""
    # Insert right after the first "## [Date]" line
    parts = content.split(f"## [{date_str}] - Dodanie tekstur na krawędzie komponentów\n")
    if len(parts) > 1:
        content = parts[0] + f"## [{date_str}] - Dodanie tekstur na krawędzie komponentów\n" + new_entry + parts[1]
else:
    # Just insert as a new section
    new_entry = f"""## [{date_str}] - Ulepszenia UI i Poprawki

### Dodane / Zmienione
- Wdrożono nowy, elegancki design dymków (tooltips) bazujący na Glassmorphismie i Tailwind CSS.
- Naprawiono błąd wyświetlania etykiet podczas ekranu ładowania (poprawka z-index na `z-[9999]`).

"""
    content = content.replace("# Changelog\n\n", "# Changelog\n\n" + new_entry)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
