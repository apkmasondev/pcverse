# Pełny Audyt Aplikacji PCVerse (Etap 22)

> **Audyt przeprowadzony 26 czerwca 2026 r.** po zmianach z Etapów 20–21.  
> Zbadano **38 plików źródłowych** obejmujących architekturę, rendering 3D, UX/UI, dostępność, SEO, stabilność oraz bundle size.

---

## Podsumowanie Wykonawcze

| Priorytet | Ilość |
|-----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 6 |
| 🟡 Medium | 10 |
| 🟢 Low | 7 |

Aplikacja jest **bardzo dojrzała**. Poprzednie audyty (Etapy 5–21) rozwiązały fundamentalne wycieki pamięci, architekturę komponentów i performance. W Etapie 21 prawidłowo zaimplementowano zarządzanie cyklem życia (`useMemo`/`useEffect`/`dispose()`) dla nowych materiałów scenografii, tekstury karteczek i złotych pinów RAM. Poniżej wymienione znaleziska dotyczą głównie **inline materiałów w geometriach komponentów**, **optymalizacji kontekstowych re-renderów** oraz **drobnych szlifów dostępności i SEO**.

---

## ✅ Rozwiązane od ostatniego audytu (Etap 20 → 21)

- ✅ **H1 (useIsMobile flash)** — Rozwiązany. Hook teraz inicjalizuje stan synchronicznie z `matchMedia`.
- ✅ **H4 (PCProvider context value)** — Rozwiązany. Oba `settingsValue` i `selectionValue` są opakowane w `useMemo`.
- ✅ **DeskScenery dispose()** — Prawidłowo zaimplementowany. Nowe materiały (GPU box, energetyk, RAM, karteczki, złote piny) mają kompletny cykl `useMemo` → `useEffect cleanup` → `dispose()`.
- ✅ **Text component crash** — Rozwiązany. Usunięto zależność od Google Fonts CDN; karteczki używają teraz lokalnych tekstur `.webp`.
- ✅ **Eksplozja float clipping** — Rozwiązany. Zmienna `explodeLift = 0.15` zapobiega przenikaniu się modelu z podstawką.

---

## 🔴 CRITICAL (2 problemy)

---

### C1. Inline `meshStandardMaterial` z `rgbColor` w RAMGeometry — wyciek materiałów

**Plik**: `src/components/PCModel/geometries/RAMGeometry.tsx` (linie 61–65)

**Opis**: Linia 64 tworzy `<meshStandardMaterial color={rgbColor} emissive={rgbColor} .../>` bezpośrednio w JSX. Za każdym razem gdy `rgbColor` się zmieni (suwak RGB), React Three Fiber tworzy **nową instancję** `MeshStandardMaterial` i nie dispose'uje starej. Dotyczy to **dwóch instancji** komponentu RAM (ram_1, ram_2), więc każda zmiana koloru wycieka 2 materiały.

**Wpływ**: Stopniowy wzrost zużycia VRAM. Na długich sesjach mobilnych z intensywnym zmienianiem kolorów może prowadzić do spadku FPS lub OOM.

**Naprawa**: Zastosować wzorzec `useRef` + `useEffect` jak w `MotherboardGeometry`:
```tsx
const rgbMat = useMemo(() => new MeshStandardMaterial({ emissiveIntensity: 1.5, toneMapped: false }), []);
useEffect(() => {
  rgbMat.color.set(rgbColor);
  rgbMat.emissive.set(rgbColor);
}, [rgbColor, rgbMat]);
useEffect(() => () => rgbMat.dispose(), [rgbMat]);
// W JSX: <primitive object={rgbMat} attach="material" />
```

---

### C2. Inline `meshStandardMaterial` z `rgbColor` w PSUGeometry — wyciek materiałów

**Plik**: `src/components/PCModel/geometries/PSUGeometry.tsx` (linie 78–87)

**Opis**: Linie 81–85 tworzą inline `<meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} toneMapped={false} />` wewnątrz warunkowego bloku `{!xrayMode && ...}`. Przy każdej zmianie `rgbColor` albo `xrayMode` React tworzy nowy materiał.

**Wpływ**: Identyczny jak C1 — wyciek 1 materiału na zmianę koloru.

**Naprawa**: Wynieść do `useMemo` + `useRef` + `useEffect`, jak we wzorcu z `GPUGeometry`.

---

## 🟠 HIGH (6 problemów)

---

### H1. Kontekstowy re-render lawinowy w `ComponentMesh`

**Plik**: `src/components/PCModel/PCModel.tsx` (linie 96–255)

**Opis**: `ComponentMesh` jest opakowane w `React.memo`, ale wewnątrz subskrybuje **obydwa konteksty** (`usePCSelection` + `usePCSettings`). Za każdym razem gdy zmienia się `rgbColor`, `xrayMode`, `showLabels`, `showInstructions`, `showAirflow` — **wszystkie 14 komponentów** przebudowują się. Custom comparator w `memo` (L255: `prevProps.data === nextProps.data && prevProps.isMobile === nextProps.isMobile`) nie chroni, bo zmiana pochodzi z hooków wewnątrz, nie z propsów.

**Wpływ**: Zmiana jednego slidera kolorów powoduje **14 × pełen re-render** łącznie z `useMemo` na `ProceduralGeometry`, przetworzeniem do 14 etykiet HTML, etc. Na mobile to wyraźny jank.

**Naprawa**:
1. Podziel `PCSettingsContext` na mniejsze atomy: `RGBContext`, `ViewModeContext`, `UIContext`.
2. Albo: użyj selektorów (zustand/jotai) zamiast React Context, aby subskrybować tylko potrzebne pola.
3. Krótkoterminowo: wynieś `rgbColor` i `xrayMode` do propsów `ComponentMesh` i obsługuj je w memo comparatorze.

---

### H2. `EffectComposer` — niebezpieczny `as any` cast na `null`

**Plik**: `src/components/Scene3D/Scene3D.tsx` (linie 261–263)

**Opis**: Linia 261 `{(dofEnabled && !disableEffects ? <DepthOfField .../> : null) as any}` i linia 263 z `N8AO` — `as any` maskuje brak kompatybilności typów efektów wewnątrz `EffectComposer`. W nowszych wersjach `@react-three/postprocessing` (v3+) `null` dzieci w `EffectComposer` mogą spowodować crash.

**Wpływ**: Potencjalny crash przy aktualizacji `postprocessing` i `@react-three/postprocessing`.

**Naprawa**: Użyj warunkowego renderowania efektów bezpośrednio:
```tsx
<EffectComposer multisampling={4}>
  {dofEnabled && !disableEffects && <DepthOfField target={dofTarget} ... />}
  <Bloom ... />
  {!disableEffects && <N8AO ... />}
  <Vignette ... />
  <ChromaticAberration ... />
</EffectComposer>
```

---

### H3. Duplikacja `XMesh` / `Mesh` w `RAMGeometry` — brak współdzielenia

**Pliki**: `src/components/PCModel/geometries/RAMGeometry.tsx` (linie 8–24), `src/components/PCModel/geometries/XMesh.tsx`

**Opis**: `RAMGeometry.tsx` definiuje **własną kopię** komponentu `Mesh` (linie 8–24), która jest funkcjonalnie niemal identyczna z globalnym `XMesh` wyeksportowanym z `XMesh.tsx`. Różnica polega na logice filtrowania — `XMesh` filtruje po `child.type.endsWith('Geometry')`, natomiast kopia w RAM sprawdza `child.type === 'meshStandardMaterial' || 'primitive'`. Obie robią to samo — ukrywają materiały w X-Ray mode.

**Wpływ**: Duplikacja kodu, brak spójności w podejściu do filtrowania materiałów, ryzyko rozbieżności przy przyszłych zmianach.

**Naprawa**: Usunąć lokalne `Mesh` z `RAMGeometry.tsx` i użyć globalnego `XMesh`.

---

### H4. Brak `dispose()` dla sklonowanej tekstury w `HDDGeometry`

**Plik**: `src/components/PCModel/geometries/HDDGeometry.tsx` (linie 21–27)

**Opis**: Linia 22 klonuje teksturę `hddSideTexture.clone()`, ale nigdy nie wywołuje na niej `dispose()`. Ta sklonowana tekstura `hddSideTextureMirrored` nie jest zwracana do GPU przy odmontowaniu komponentu.

**Wpływ**: Wyciek 1 tekstury na mount/unmount komponentu HDD (np. przy przełączaniu trybu X-Ray lub scenografii).

**Naprawa**: Dodać `useEffect` cleanup:
```tsx
useEffect(() => () => hddSideTextureMirrored.dispose(), [hddSideTextureMirrored]);
```

---

### H5. Brak `dispose()` dla `ihsGeoRef` (ExtrudeGeometry) w `CPUGeometry`

**Plik**: `src/components/PCModel/geometries/CPUGeometry.tsx` (linia 15)

**Opis**: `ihsGeoRef` jest `useRef<ExtrudeGeometry>()`, ale nigdzie nie wywołujemy `dispose()`. `ExtrudeGeometry` jest ciężkim obiektem proceduralnym i powinien zostać jawnie zwolniony (zgodnie z Zasadą 6 `3D_DESIGN_GUIDELINES.md`).

**Wpływ**: Wyciek geometrii przy unmount. Mniej bolesny niż materiały, ale sumuje się.

**Naprawa**: Dodać `useEffect` cleanup identycznie jak w `CableGeometry.tsx`:
```tsx
useEffect(() => {
  return () => { ihsGeoRef.current?.dispose(); };
}, []);
```

---

### H6. Mega-plik tekstury kubka `new_mug_screen.webp` (550KB)

**Plik**: `public/textures/posters/new_mug_screen.webp` — **564 KB**

**Opis**: Jedna tekstura kubka waży ponad pół megabajta, co jest znacząco powyżej średniej (reszta to 20–300 KB). Jest to prawdopodobnie obraz o zbyt dużej rozdzielczości na tak mały element 3D (kubek na biurku).

**Wpływ**: Wydłuża czas ładowania scenografii o ~0.5s na wolniejszych łączach, zabiera dodatkową pamięć VRAM.

**Naprawa**: Przekompresować do ~200 KB bez widocznej straty jakości (kubek zajmuje max 5% ekranu, rozdzielczość 512×512 px wystarczy).

---

## 🟡 MEDIUM (10 problemów)

---

### M1. `DeskScenery` ładuje 17 tekstur naraz — brak progresywnego ładowania

**Plik**: `src/components/Scene3D/DeskScenery.tsx` (linie 94–112)

**Opis**: Jeden masywny `useTexture()` z tablicą 17 URL-i ładuje ~3.4 MB tekstur synchronicznie. Jeśli użytkownik włączy scenografię, cała klatka jest zablokowana do momentu pobrania wszystkich 17 plików.

**Wpływ**: Przycięcie / freeze na 1–3 sekundy przy pierwszym włączeniu scenografii.

**Naprawa**: Rozdzielić na grupy priorytetowe. Blat + dywan + skrzynia załadować natychmiast, plakaty i detale — leniwie (`Suspense` per grupa).

---

### M2. Inline `meshStandardMaterial` w CasePanels — `meshPhysicalMaterial` nie dispose'owany

**Plik**: `src/components/PCModel/geometries/CasePanels.tsx` (linie 110–119)

**Opis**: `<meshPhysicalMaterial ref={frontGlassMatRef} .../>` i `<meshStandardMaterial ref={sideGlassMatRef} .../>` są tworzone inline w JSX. Choć mają refy (do animacji opacity), to nigdzie nie wywołujemy `dispose()` na tych materiałach przy unmount.

**Wpływ**: Wyciek 2 materiałów szklanych na unmount paneli. Materiał `meshPhysicalMaterial` z `transmission` i `clearcoat` jest szczególnie ciężki.

**Naprawa**: Dodać `useEffect(() => () => { frontGlassMatRef.current?.dispose(); sideGlassMatRef.current?.dispose(); }, [])`.

---

### M3. `CaseGeometry` — celowe pominięcie dispose() dla `CanvasTexture` z komentarzem

**Plik**: `src/components/PCModel/geometries/CaseGeometry.tsx` (linie 133–135)

**Opis**: Komentarz w liniach 133–135 wyjaśnia, że celowo nie zwalniamy `meshTexture`, `backMeshTexture` i `frontMeshTexture` przez `dispose()`, bo React Strict Mode / Vite HMR niszczy tekstury trzymane w `useMemo`. Choć to prawidłowe obejście problemu HMR, w trybie produkcyjnym te tekstury nigdy nie są zwalniane.

**Wpływ**: 3 niezniszczone `CanvasTexture` (malutkie: 32×32 px, więc wpływ minimalny). Dług technologiczny — obejście powinno być warunkowane flagą `import.meta.env.DEV`.

**Naprawa**: Warunkowe dispose tylko w produkcji:
```tsx
useEffect(() => {
  if (import.meta.env.DEV) return; // Pomiń w HMR
  return () => {
    meshTexture.dispose();
    backMeshTexture.dispose();
    frontMeshTexture.dispose();
  };
}, [meshTexture, backMeshTexture, frontMeshTexture]);
```

---

### M4. `manifest.json` z absolutną ścieżką `/manifest.json` — nie działa z `base: '/pcverse/'`

**Plik**: `index.html` (linia 15)

**Opis**: `<link rel="manifest" href="/manifest.json" />` — ale Vite jest skonfigurowany z `base: '/pcverse/'`. Manifest nie załaduje się poprawnie na serwerze produkcyjnym (`404` pod `https://pcverse.app/manifest.json`).

**Wpływ**: PWA nie działa (brak ikony, brak nazwy, brak tematu).

**Naprawa**: Zmień na `href="./manifest.json"` lub `href="/pcverse/manifest.json"`.

---

### M5. `apple-touch-icon` wskazuje na `.svg` — iOS ignoruje SVG

**Plik**: `index.html` (linia 16)

**Opis**: `<link rel="apple-touch-icon" href="/favicon.svg" />` — Safari/iOS akceptuje wyłącznie PNG dla `apple-touch-icon`. SVG zostanie zignorowany.

**Wpływ**: Użytkownik dodający stronę do ekranu głównego iOS zobaczy generyczną ikonę zamiast logo.

**Naprawa**: Wygeneruj `apple-touch-icon.png` (180×180 px) z pliku SVG i podlinkuj go.

---

### M6. Brak warunku `prefers-reduced-motion` dla animacji CSS

**Pliki**: `src/components/UI/UI.tsx`, `src/components/LoadingScreen/LoadingScreen.tsx`

**Opis**: W animacjach 3D poprawnie używamy `useReducedMotion()` z Framer Motion, ale same animacje CSS (`animate-pulse`, `animate-bounce`) nie mają reguły `@media (prefers-reduced-motion: reduce)` w `index.css`. Framer Motion respektuje to automatycznie, ale Tailwind CSS nie.

**Wpływ**: Użytkownicy z włączonym „reduced motion" w systemie nadal widzą pulsujące/skaczące elementy UI.

**Naprawa**: Dodaj do `index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse, .animate-bounce { animation: none !important; }
}
```

---

### M7. `Scene3D` — brak `MeshReflectorMaterial` cleanup

**Plik**: `src/components/Scene3D/DeskScenery.tsx` (linie 184–197)

**Opis**: `<MeshReflectorMaterial>` tworzy wewnętrznie render target i materiał, ale nie posiada wbudowanego automatycznego dispose. Przy toggle scenografii (showDesk on/off/on/off) te zasoby mogą nie być zwalniane.

**Wpływ**: Jeden z cięższych efektów — render target w rozdzielczości 512 zabiera ~1 MB VRAM per toggle.

**Naprawa**: Przywrócić `ref` na mesh z `MeshReflectorMaterial` i dispose'ować materiał w cleanup:
```tsx
const reflectorRef = useRef<any>(null);
useEffect(() => () => { reflectorRef.current?.material?.dispose(); }, []);
```

---

### M8. Inline materiały w MotherboardGeometry — `meshStandardMaterial` bez dispose

**Plik**: `src/components/PCModel/geometries/MotherboardGeometry.tsx`

**Opis**: W wielu miejscach (linie 71, 77, 93, 104, 292, 306, 347, 395, 468) tworzone są `<meshStandardMaterial map={...} />` inline w JSX z unikalnymi teksturami. Te materiały nie są zarządzane — przy każdym re-renderze React tworzy nowe instancje, a stare nie zostają dispose'owane.

**Wpływ**: Rozliczanie ~10 wyciekających materiałów na render MotherboardGeometry. Mniejszy wpływ niż C1 (bo Motherboard nie re-renderuje się przy każdej zmianie RGB), ale sumuje się w dłuższej perspektywie.

**Naprawa**: Wynieś inline materiały z teksturami do `useMemo` i dodaj cleanup jak we wzorcu `DeskScenery`.

---

### M9. `CPUGeometry` — inline materiały per-face

**Plik**: `src/components/PCModel/geometries/CPUGeometry.tsx` (linie 94–98)

**Opis**: IHS shape używa `<meshStandardMaterial attach="material-0" map={cpuTexture} />` i `<meshStandardMaterial attach="material-1" .../>` inline. Przy toggle X-Ray lub re-renderze tworzą się 2 nowe materiały.

**Wpływ**: Wyciek 2 materiałów na toggle X-Ray.

**Naprawa**: Wynieś per-face materiały do `useMemo`.

---

### M10. Liczne inline `meshStandardMaterial` w GPUGeometry, PSUGeometry, HDDGeometry, SSDGeometry

**Pliki**: Wiele

**Opis**: Wzorzec się powtarza — tekstury nakładane przez inline `<meshStandardMaterial map={...} />` w JSX wewnątrz warunków `{!xrayMode && (...)}`. Przy toggle xrayMode stare materiały nie są dispose'owane. Dotyczy:
- `GPUGeometry.tsx`: L91, 123, 143, 151, 159, 188, 192 (~7 materiałów)
- `PSUGeometry.tsx`: L60, 65, 70, 75, 92, 97 (~6 materiałów)
- `HDDGeometry.tsx`: L47, 55, 63, 71, 79, 87 (~6 materiałów)
- `SSDGeometry.tsx`: L23, 29 (~2 materiały)

**Wpływ**: ~21 materiałów wyciekających na toggle X-Ray. To jest największy zbiorczy wyciek.

**Naprawa**: Masowa refaktoryzacja — wynieść per-face materiały z teksturami do `useMemo` z właściwym `dispose()` w cleanup. Najlepiej: zdefiniować je w `materials.ts` jako stałe (bo tekstury są stabilne).

---

## 🟢 LOW (7 problemów)

---

### L1. `isWebGLAvailable()` w `App.tsx` uruchamia się w `useEffect` zamiast synchronicznie

**Plik**: `src/App.tsx` (linie 21–23)

**Opis**: Check WebGL jest robiony w `useEffect`, ale przez pierwszy render `webGLSupported === true`. Jeśli WebGL nie jest dostępny, przez jedną klatkę użytkownik widzi próbę renderowania Canvas (co może crashnąć).

**Naprawa**: Przenieś check do `useState` initializer: `useState(() => isWebGLAvailable())`.

---

### L2. Puste linie i nieużywane komentarze w `PCModel.tsx`

**Plik**: `src/components/PCModel/PCModel.tsx` (linie 34–41)

**Opis**: Linie 34–41 to puste linie i komentarze placeholder (`// --- R3F Extrude Options ---`, `// --- Procedural Geometries ---`). Identycznie linia 111 to pusta linia wewnątrz komponentu.

**Naprawa**: Usuń puste bloki.

---

### L3. `constants.ts` — puste linie na końcu

**Plik**: `src/components/PCModel/constants.ts` (linie 5–7)

**Opis**: Plik zawiera tylko 3 eksporty i 2 puste linie na końcu.

**Naprawa**: Wyczyść trailing whitespace.

---

### L4. `InfoPanel` — nieużywane importy `useMotionValue`, `useSpring`, `useTransform`

**Plik**: `src/components/InfoPanel/InfoPanel.tsx` (linia 2)

**Opis**: Linia 2 importuje `useMotionValue, useSpring, useTransform` z `framer-motion`, ale żadne z nich nie jest używane w komponencie. TypeScript nie zgłasza tego jako błąd (bo `noUnusedLocals` może być wyłączone), ale `tsc -b` z flagą strict już tak.

**Wpływ**: Potencjalny błąd build w trybie strict; niepotrzebne bytes w bundle (tree-shaking może nie usunąć w 100%).

**Naprawa**: Usuń nieużywane importy.

---

### L5. `ErrorBoundary` — `fallback` prop nie ma typu `null`

**Plik**: `src/components/ErrorBoundary.tsx` (linia 4)

**Opis**: Props type pozwala na `fallback?: ReactNode`, ale w `Scene3D.tsx` L239 użyto `<ErrorBoundary fallback={null}>`. Choć `null` jest valid `ReactNode`, brak jawnego typowania `null` w union type utrudnia czytelność.

**Naprawa**: Kosmetyczne, opcjonalne.

---

### L6. `MeshReflectorMaterial` blokuje widok dołu obudowy w scenografii

**Opis**: Lustrzana powierzchnia blatu (MeshReflectorMaterial) jest dobra wizualnie, ale `resolution={512}` generuje dodatkowy renderpass co klatkę. Na mobile komponent jest poprawnie ukrywany (`if (isMobile) return null`), ale na słabszych desktopach może ciąć FPS o 5–10%.

**Naprawa**: Dodać opcję w UI do wyłączenia odbicia (np. toggle w menu HDRi) lub obniżyć rozdzielczość do 256.

---

### L7. Brak `aria-live` na dynamicznie zmienianych elementach UI

**Plik**: `src/components/UI/UI.tsx`

**Opis**: Kiedy tryb X-Ray, Airflow, czy RGB jest włączany/wyłączany, nie ma żadnego `aria-live` regionu informującego czytnik ekranowy o zmianie stanu. Przyciski mają `aria-label`, ale brak feedbacku o aktualnym stanie (on/off).

**Naprawa**: Dodaj `aria-pressed={xrayMode}` na przyciskach toggle i ukryty `<span role="status" aria-live="polite">`.

---

## Podsumowanie i Priorytety

### Natychmiastowe (przed deploy):
1. **C1 + C2**: Napraw wycieki RGB materiałów w RAMGeometry i PSUGeometry.
2. **H4 + H5**: Dodaj dispose() dla sklonowanej tekstury HDD i ExtrudeGeometry CPU.
3. **M4**: Napraw ścieżkę manifest.json.

### Planowane (następny sprint):
4. **H1**: Refaktoryzacja kontekstów lub migracja na zustand.
5. **H2**: Wyeliminuj `as any` w EffectComposer.
6. **M10**: Masowa refaktoryzacja inline materiałów z teksturami.

### Backlog (nice-to-have):
7. **M1**: Progresywne ładowanie tekstur scenografii.
8. **M6**: Dodaj `prefers-reduced-motion` dla CSS.
9. **L1–L7**: Drobne szlify kodu i dostępności.
