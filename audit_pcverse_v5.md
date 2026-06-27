# Pełny Audyt Aplikacji PCVerse (Etap 28)

> **Audyt przeprowadzony 27 czerwca 2026 r.** po zmianach z Etapów 22–28 (Tryb Budowy, blokada kamery, panel porad, korekta instrukcji).  
> Zbadano **38 plików źródłowych** obejmujących architekturę, rendering 3D, UX/UI, dostępność, SEO, stabilność oraz bundle size.

---

## Podsumowanie Wykonawcze

| Priorytet | Ilość |
|-----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 4 |
| 🟡 Medium | 7 |
| 🟢 Low | 8 |

Aplikacja jest **bardzo dojrzała i profesjonalna**. Od ostatniego audytu (Etap 22) nastąpił ogromny postęp — rozwiązano oba Critical wycieki materiałów RGB (C1, C2), dodano pełny `dispose()` dla tekstury HDD i geometrii CPU, naprawiono warunkowe dispose CanvasTexture, dodano `prefers-reduced-motion` w CSS i naprawiono `manifest.json`. Nowy Tryb Budowy (zustand), panel "Porada Eksperta" i blokada kamery (PPM + WSAD) są poprawnie zaimplementowane. Poniższe znaleziska dotyczą głównie **martwego kodu po blokadzie kamery**, **braku etykiet w Trybie Budowy**, **drobnych wycieków inline materiałów** i **szlifów dostępności**.

---

## ✅ Rozwiązane od ostatniego audytu (Etap 22 → 28)

- ✅ **C1 (RGB wyciek RAMGeometry)** — Rozwiązany. `rgbMat` wyniesiony do `useMemo` + `useEffect` cleanup + `dispose()`.
- ✅ **C2 (RGB wyciek PSUGeometry)** — Rozwiązany. Identyczny wzorzec jak C1.
- ✅ **H2 (`as any` w EffectComposer)** — Częściowo rozwiązany. Zastosowano tablicę z kluczami zamiast `null as any`, choć `as any` pozostał na końcu tablicy (L299).
- ✅ **H3 (duplikacja XMesh w RAMGeometry)** — Rozwiązany. `RAMGeometry` importuje teraz globalny `XMesh`.
- ✅ **H4 (dispose HDD texture)** — Rozwiązany. `hddSideTextureMirrored.dispose()` dodany w `useEffect` cleanup (L30–32).
- ✅ **H5 (dispose ihsGeoRef CPU)** — Rozwiązany. `useEffect(() => () => ihsGeoRef.current?.dispose(), [])` (L78–80).
- ✅ **M2 (CasePanels glass dispose)** — Rozwiązany. Cleanup w `useEffect` (L59–64).
- ✅ **M3 (CanvasTexture warunkowe dispose)** — Rozwiązany. `if (import.meta.env.DEV) return;` (L135).
- ✅ **M4 (manifest.json ścieżka)** — Rozwiązany. Zmieniono na `./manifest.json` (L15).
- ✅ **M6 (prefers-reduced-motion CSS)** — Rozwiązany. Dodano regułę w `index.css` (L35–37).
- ✅ **M7 (MeshReflectorMaterial dispose)** — Rozwiązany. Dodano `reflectorMeshRef` + cleanup (L328–335).
- ✅ **M8 + M9 + M10 (inline materiały z teksturami)** — Rozwiązany masowo. Wszystkie geometrie używają teraz wzorca `useMemo` → `texturedMaterials` → `useEffect` cleanup → `dispose()`.
- ✅ **L1 (WebGL check)** — Rozwiązany. Przeniesiono do synchronicznego `<script>` w `index.html` (L46–57).
- ✅ **L7 (aria-pressed)** — Częściowo rozwiązany. Wiele przycisków toggle ma teraz `aria-pressed`.

---

## 🔴 CRITICAL (1 problem)

---

### C1. Martwy kod WSAD/strzałek w `Scene3D` — potencjalne obejście blokady kamery

**Plik**: [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L101-L134)

**Opis**: Linie 101–134 zawierają pełny handler `handleKeyDown`, który nasłuchuje na klawisze `ArrowUp/Down/Left/Right` i `W/A/S/D` i wywołuje `cameraControlsRef.current.forward()` oraz `.truck()`. **Ten kod jest aktywny i działa**, mimo że jednocześnie ustawiono `keys={{ up: 0, down: 0, left: 0, right: 0 }}` na `CameraControls` (L325–330).

Problem polega na tym, że `keys` w `CameraControls` blokuje jedynie **wbudowaną** obsługę klawiatury biblioteki `camera-controls`. Natomiast **ręczny** `addEventListener('keydown')` z linii 101–134 **nadal działa** i wywołuje `forward()`/`truck()`, pozwalając użytkownikowi uciec kamerą za kadr. Blokada kamery jest więc **niepełna** — strzałki i WSAD dalej przesuwają widok.

**Wpływ**: Użytkownik może odkryć, że pomimo wyłączenia PPM, klawisze WSAD/strzałki nadal pozwalają „uciec" kamerą poza model. To bezpośrednio podważa świadome wyłączenie pana.

**Naprawa**: Usunąć cały blok `useEffect` z linii 101–134 (handler `handleKeyDown` ze switchem na klawisze strzałek i WSAD). Prop `keys={{ up: 0, ... }}` na `CameraControls` jest wystarczający do zablokowania wbudowanej obsługi, a po usunięciu handlera nie będzie żadnej drogi do truck/forward.

```diff
- // Obsługa przesuwania na boki (Pan / Truck) za pomocą strzałek
- useEffect(() => {
-   const handleKeyDown = (e: KeyboardEvent) => {
-     ...
-     switch (e.key) {
-       case 'ArrowUp': case 'w': case 'W':
-         cameraControlsRef.current.forward(speed, true); break;
-       // ... all cases
-     }
-   };
-   window.addEventListener('keydown', handleKeyDown);
-   return () => window.removeEventListener('keydown', handleKeyDown);
- }, []);
```

---

## 🟠 HIGH (4 problemy)

---

### H1. Kontekstowy re-render lawinowy w `ComponentMesh`

**Plik**: [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L88-L285)

**Opis**: `ComponentMesh` jest opakowane w `React.memo` z custom comparatorem, ale wewnątrz subskrybuje **4 konteksty** jednocześnie (`usePCSelection`, `usePCRGB`, `usePCView`, `usePCUI`) **plus** `useBuildStore` (zustand). Zmiana dowolnego z ~15 pól (np. `rgbColor`, `xrayMode`, `showLabels`, `buildMode`, `currentStep`) powoduje re-render **wszystkich 14 instancji** `ComponentMesh`. Custom comparator (L285) sprawdza jedynie `data` i `isMobile`, ale zmiany kontekstowe pochodzą z hooków wewnątrz komponentu, więc comparator ich nie blokuje.

**Wpływ**: Zmiana slidera RGB powoduje 14 × pełen re-render. Na mobile to wyraźny jank.

**Naprawa**: Krótkoterminowo — wynieś `rgbColor`, `xrayMode`, `showLabels` do propsów `ComponentMesh` i obsługuj w comparatorze. Długoterminowo — migracja `usePCRGB` / `usePCView` na granularne selektory zustand.

---

### H2. `EffectComposer` — resztkowy `as any` cast na tablicę efektów

**Plik**: [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L293-L299)

**Opis**: Linie 293–299 renderują efekty postprocessingu jako tablicę: `{([ ... ] as any)}`. Cast `as any` na końcu tablicy maskuje potencjalny brak kompatybilności typów. W nowszych wersjach `@react-three/postprocessing` (v3+) tablica children w `EffectComposer` może nie być wspierana.

**Wpływ**: Potencjalny crash lub silent failure po aktualizacji zależności.

**Naprawa**: Zastąpić tablicę bezpośrednimi JSX children z warunkami:
```tsx
<EffectComposer multisampling={4}>
  {dofEnabled && !disableEffects && <DepthOfField ... />}
  {!disableEffects && <N8AO ... />}
  <Bloom ... />
  <Vignette ... />
  <ChromaticAberration ... />
</EffectComposer>
```

---

### H3. `apple-touch-icon` wskazuje na `.svg` — iOS ignoruje SVG

**Plik**: [index.html](file:///d:/Projekty%20AI/PCVerse/index.html#L16)

**Opis**: `<link rel="apple-touch-icon" href="/favicon.svg" />` — Safari/iOS akceptuje wyłącznie **PNG** dla `apple-touch-icon`. Dodatkowo ścieżka jest absolutna (`/favicon.svg`), co nie zadziała z `base: '/pcverse/'`.

**Wpływ**: Użytkownik dodający stronę do ekranu głównego iOS zobaczy generyczną ikonę.

**Naprawa**: Wygeneruj `apple-touch-icon.png` (180×180 px) i użyj ścieżki względnej: `href="./apple-touch-icon.png"`.

---

### H4. Etykiety 3D (`Html` labels) nie pojawiają się w Trybie Budowy po eksplozji

**Plik**: [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L205)

**Opis**: Warunek renderowania etykiet w linii 205:
```tsx
{!buildMode && showLabels && ...
```
Pierwsza klauzula `!buildMode` **całkowicie wyłącza** etykiety w Trybie Budowy. Ale w Trybie Budowy użytkownik widzi lewitujące, rozłożone komponenty i **nie wie co jest czym** — etykiety byłyby tutaj naturalną nawigacją. Kod w warunku wewnętrznym (L255–259) zawiera nawet specjalny tekst "Oczekujący komponent" / nazwy komponentu, ale **nigdy nie jest widoczny**.

**Wpływ**: UX: Użytkownik w trybie budowy musi zgadywać, który lewitujący blok jest którym podzespołem.

**Naprawa**: Zmienić warunek, aby w trybie budowy etykiety pojawiały się dla niezmontowanych i bieżących komponentów.

---

## 🟡 MEDIUM (7 problemów)

---

### M1. `DeskScenery` ładuje 17+ tekstur naraz — brak progresywnego ładowania

**Plik**: [DeskScenery.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx)

**Opis**: Jeden masywny zestaw `useTexture()` z ~17 URL-i ładuje ~3.4 MB tekstur synchronicznie. Włączenie scenografii powoduje freeze na 1–3 sekundy.

**Naprawa**: Rozdzielić na grupy priorytetowe z `Suspense`. Blat + dywan załadować natychmiast, detale — leniwie.

---

### M2. Dwa inline `meshStandardMaterial` w `DeskScenery` bez dispose

**Plik**: [DeskScenery.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L206)

**Opis**: L206 tworzy inline materiał (cylinder ściana koszyka) i L360 tworzy inline materiał (dywan) bez dispose.

**Wpływ**: 2 wycieki materiałów przy toggle scenografii.

**Naprawa**: Wynieś do `useMemo` + `useEffect` cleanup.

---

### M3. Brak `onContextMenu` prevention — menu kontekstowe przeglądarki na PPM

**Plik**: [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L347-L352)

**Opis**: Po wyłączeniu PPM, prawy klik pokazuje natywne menu przeglądarki nad sceną 3D. Psuje immersję.

**Naprawa**: Dodaj `onContextMenu={(e) => e.preventDefault()}` na wrapperze `<div>` sceny.

---

### M4. `InfoPanel` — brak guard na `buildMode`

**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx)

**Opis**: InfoPanel polega wyłącznie na `selectedComponent === null` aby się ukryć. Bezpieczniej byłoby dodać dodatkowy guard `buildMode === true` → ukryj panel, na wypadek race condition w React 18 batching.

**Naprawa**: Dodaj `const { buildMode } = useBuildStore();` i guard `if (buildMode) return null;`.

---

### M5. Brak skrótu ESC do wyjścia z Trybu Budowy

**Plik**: [UI.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L55-L63)

**Opis**: Handler ESC zamyka jedynie `showInstructions`. Brak skrótu do wyjścia z Trybu Budowy.

**Naprawa**: Rozszerz handler ESC o `buildMode`.

---

### M6. Nieużywane importy w `InfoPanel.tsx`

**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L2)

**Opis**: `useMotionValue`, `useSpring`, `useTransform` importowane ale nieużywane.

**Naprawa**: Usuń nieużywane importy.

---

### M7. Duplikacja useEffect na `envPreset` w `usePC.tsx`

**Plik**: [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L82-L91)

**Opis**: Dwa oddzielne `useEffect` nasłuchujące na `envPreset` (L82–91 i L140–166). Efekt L82 obsługuje preset `night`, który **nie istnieje** w UI (tablica PRESETS ma: city, studio, dawn, apartment).

**Naprawa**: Usunąć efekt L82–91.

---

## 🟢 LOW (8 problemów)

---

### L1. Mega-plik tekstury kubka `new_mug_screen.webp` (550KB)
**Naprawa**: Przekompresować do ~200 KB (512×512 px).

### L2. Puste linie i trailing whitespace w wielu plikach
**Naprawa**: Wyczyść trailing whitespace.

### L3. `rotation` as `as any` w `ComponentMesh` (L156)
**Naprawa**: Zmień na explicit tuple `[number, number, number]`.

### L4. Literówka `Overylay` w komentarzu (UI.tsx L117)
**Naprawa**: Poprawić na `Overlay`.

### L5. Brak `aria-live` na elementach Trybu Budowy
**Naprawa**: Dodaj `aria-live="polite"` na kontenerze z tekstem kroku.

### L6. `useMemo` użyte jako side-effect w `GPUGeometry` (L28–33)
**Naprawa**: Zmień na `useEffect`.

### L7. `ErrorBoundary` `fallback` prop nie jawnie typuje `null`
**Naprawa**: Kosmetyczne, opcjonalne.

### L8. `buildMode ? 'hidden' : ''` zamiast warunkowego renderowania (UI.tsx L196)
**Naprawa**: Rozważ `{!buildMode && <motion.div ... />}`.

---

## Podsumowanie i Priorytety

### Natychmiastowe (przed deploy):
1. **C1**: Usunąć martwy handler WSAD/strzałek — blokada kamery jest niekompletna!
2. **H4**: Włączyć etykiety w Trybie Budowy.

### Planowane (następny sprint):
3. **H1**: Refaktoryzacja kontekstów lub migracja na zustand.
4. **H2**: Wyeliminuj `as any` w EffectComposer.
5. **H3**: Wygeneruj `apple-touch-icon.png`.
6. **M3**: Zablokuj menu kontekstowe na PPM.
7. **M5**: Dodaj ESC do wyjścia z Trybu Budowy.
8. **M6**: Usuń nieużywane importy z InfoPanel.
9. **M7**: Usuń zduplikowany useEffect na envPreset.

### Backlog (nice-to-have):
10. **M1**: Progresywne ładowanie tekstur scenografii.
11. **M4**: Guard `buildMode` w InfoPanel.
12. **L1–L8**: Drobne szlify kodu, typów i dostępności.
