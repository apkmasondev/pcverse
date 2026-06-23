import sys

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

new_entries = """- **Wyeliminowanie migotania (Flickeringu) Animacji**: Wdrożono system "zatrzasku" (Snap-to-Grid) na samą końcówkę krzywej animacji `lerp` dla rozsuwanych paneli szklanych i blaszanych (Exploded View). Skrypt ucina asympotyczną funkcję gdy margines błędu spadnie poniżej 0.005, drastycznie pomagając silnikowi WebGL z sortowaniem głębi i zapobiegając kilkusekundowemu migotaniu nakładających się warstw szkła.
"""

target_line = "## Dzień 12 - Wdrożenie Ostatnich Szlifów Audytu - Faza 7 (Backlog)"
if target_line in content:
    content = content.replace(target_line, target_line + "\n\n" + new_entries)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
