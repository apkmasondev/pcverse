import sys

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

new_entries = """- **Hover Effect (Inteligenty Z-Offset)**: Skalowanie unoszenia się komponentów po najechaniu kursorem (hover) odbywa się teraz proporcjonalnie w dół względem rozmiaru komponentu. Ogromna obudowa drga minimalnie, a mały dysk SSD dynamicznie odskakuje.
- **Wyeliminowanie Z-fightingu obudowy**: Skrócono w dół płaszczyzny lewego panelu, tacki płyty głównej i tylnego panelu w `CaseGeometry.tsx` o grubość podłogi (Y z `-2.4` na `-2.3`), eliminując brutalne przenikanie się brył.
- **Śrubki Szklanych Paneli**: Zgodnie z zasadami oszczędzania Draw Calls, zastosowano system `<Instances>` dodający po 4 fizyczne śrubki montażowe w rogach dwóch szklanych paneli (przednim i prawym bocznym).
"""

target_line = "## Dzień 12 - Wdrożenie Ostatnich Szlifów Audytu - Faza 7 (Backlog)"
if target_line in content:
    content = content.replace(target_line, target_line + "\n\n" + new_entries)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
