import sys

with open("CHANGELOG.md", "r", encoding="utf-8") as f:
    content = f.read()

new_entry = """
## Dzień 14 - Detale konstrukcyjne (Złącza i krawędzie)

### Dodane
- **Tekstura spodu karty graficznej**: Zintegrowano nową grafikę `gpu_bottom.webp` na krawędzi karty graficznej przylegającej do złącza PCIe (płyty głównej).
- **Tekstura portów HDD**: Wdrożono nową grafikę `hdd_ports.webp` na tylną krawędź dysku HDD, gdzie podpinane są kable. Użytkownik ręcznie dostosował współrzędne fizycznych, plastikowo-złotych wtyków, by lepiej komponowały się z tłem.
- **Tekstura frontu HDD**: Zaaplikowano finalną grafikę `hdd_behind.webp` na całkowicie przednią (przeciwległą do portów) krawędź dysku HDD, kończąc tym samym oteksturowanie wszystkich 6 ścian dysku.

### Poprawione / Zmienione
- **Wydłużenie złącza PCIe**: Znacząco zwiększono głębokość wystawania złotych pinów PCIe z karty graficznej (z `0.05` na `0.15`), aby sprawiały wrażenie masywniejszych i mocniej "siedzących" w płycie głównej.
- **Odwrócenie tekstury spodu GPU**: Obrócono płaszczyznę `gpu_bottom.webp` o 180 stopni (dodatkowe `Math.PI` na osi Z) zgodnie z wytycznymi.
"""

content = content.replace("# Dziennik Zmian (Changelog)\n", "# Dziennik Zmian (Changelog)\n" + new_entry)

with open("CHANGELOG.md", "w", encoding="utf-8") as f:
    f.write(content)
