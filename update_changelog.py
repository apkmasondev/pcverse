import codecs
with codecs.open('CHANGELOG.md', 'r', 'utf-8') as f:
    content = f.read()

new_entry = """
## Etap 29 - Oświetlenie Krawędziowe i Tablica Korkowa (Scenografia) 🎬

### Rozbudowa Scenografii 3D
- **Tablica Korkowa**: Dodano wygenerowaną teksturę tablicy korkowej na lewej ścianie pokoju, wypełnioną notatkami i schematami budowy PC.
- **Optymalizacja Z-Fighting (Plakaty)**: Zrezygnowano z mikroskopijnego przesunięcia (Z = -0.01) dla ramek plakatów i tablicy korkowej. Wyabstrahowano nowy komponent `<Poster>` używający sprzętowego parametru `polygonOffset`, eliminując Z-Fighting w pełni natywnie w WebGL zgodnie z audytem kodowym.

### Dynamiczne Oświetlenie Krawędziowe (Ambilight)
- **Bezcielesna Poświata LED**: Zastąpiono "brzydki", fizyczny żółty pasek z tyłu biurka zaawansowanym systemem 4 dynamicznych punktów świetlnych (`<pointLight>`) ułożonych na krawędziach podłogi. Zapewnia to miękką, realistyczną poświatę światła padającą na pokój.
- **Płynne Animacje Lerp**: Podpięto poświatę pokoju pod globalny stan podświetlenia obudowy PC. Gdy RGB w komputerze zostaje wyłączone, światła na ścianach wygaszają się do zera z użyciem płynnej matematycznej interpolacji (`THREE.MathUtils.lerp`).
- **Wydajność Pętli Frame**: Wszystkie 4 krawędziowe światła aktualizują się wewnątrz jednej zoptymalizowanej pętli renderowania `useFrame`, oszczędzając zasoby procesora.
"""

new_content = content.replace("# Dziennik Zmian (Changelog)", "# Dziennik Zmian (Changelog)\n" + new_entry)

with codecs.open('CHANGELOG.md', 'w', 'utf-8') as f:
    f.write(new_content)
