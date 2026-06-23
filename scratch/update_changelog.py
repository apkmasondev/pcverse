import sys

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

new_entries = """- **Culling paneli bocznych**: Obudowa automatycznie wyłącza renderowanie paneli (właściwość `visible = false`), gdy oddalą się poza zasięg wzroku kamery, odciążając kartę graficzną i zmniejszając liczbę Draw Calls.
- **Wznawianie ekranu ładowania**: Skrypt `LoadingScreen.tsx` został zaktualizowany, aby automatycznie powracał i maskował chrupnięcia podczas asynchronicznego pobierania nowych map środowiskowych (HDRI).
- **Grubsze RGB Chipsetu**: Podwojono grubość obrysu LED (z 0.04 do 0.08) na układzie chłodzącym Chipset na płycie głównej.
- **Złote piny w gniazdach RAM**: Dodano nowe, realistyczne, fizyczne złącza stykowe do środka wszystkich 4 slotów pamięci na płycie głównej.
- **Obrót tekstury radiatora CPU**: Poprawiono mapowanie UV na wieży chłodzącej procesora, obracając tekstury bocznego i górnego finu o 90 stopni.
- **Rozdział portów SATA dysku HDD**: Zastąpiono pojedyncze, szerokie gniazdo na dysku twardym prawidłowymi, osobnymi złączami zasilania oraz przesyłu danych, pokrytymi realistycznym materiałem `materials.goldMetal`.
"""

# Find the start of the latest backlog phase
target_line = "## Dzień 12 - Wdrożenie Ostatnich Szlifów Audytu - Faza 7 (Backlog)"
if target_line in content:
    content = content.replace(target_line, target_line + "\n\n" + new_entries)
else:
    # If using windows encoded string didn't match, just insert at top
    parts = content.split("## Dzie")
    if len(parts) > 1:
        content = parts[0] + "## Dzie" + parts[1] + "\n" + new_entries + "".join(["## Dzie" + p for p in parts[2:]])

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
