# Pełny Audyt Aplikacji PCVerse v6 (Etap 30)

> **Audyt przeprowadzony 28 czerwca 2026 r.** po zmianach z Etapów 29–30 (Oświetlenie Krawędziowe, Tryb Ekspercki, Przykładowe Modele 2026).
> Zbadano **38 plików źródłowych** obejmujących architekturę, rendering 3D, UX/UI, dostępność, SEO, stabilność oraz bundle size.

---

## Podsumowanie Wykonawcze

| Priorytet | Ilość |
|-----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 3 |
| 🟡 Medium | 6 |
| 🟢 Low | 9 |

Aplikacja jest **dojrzała i profesjonalna**. Od ostatniego audytu (v5, Etap 28) nastąpił znaczący postęp:

- Usunięto martwy handler WSAD/strzałek (v5-C1).
- Refaktoryzacja `EffectComposer` — eliminacja tablicy `as any`, przejście na warunkowe JSX children (v5-H2).
- ESC wychodzi z Trybu Budowy (v5-M5).
- Etykiety widoczne w Trybie Budowy dla bieżących/niezmontowanych komponentów (v5-H4).
- Dodano `buildMode` guard w `InfoPanel` (v5-M4).
- Dodano `onContextMenu` prevention (v5-M3).
- Usunięto duplikację `useEffect` na `envPreset` (v5-M7).
- Wdrożono 4 nowe panele w Trybie Budowy: Porada Eksperta, Narzędzia i Parametry, Telemetria, Przykładowe Modele.
- Migracja danych komponentów do rozbudowanego modelu z `expertDetails`, `customStats`, `exampleSpecs`.

**Zero problemów Critical.** Pozostałe znaleziska dotyczą optymalizacji re-renderów, czystości typów, drobnych wycieków materiałów, i szlifów dostępności.

---

## ✅ Rozwiązane od ostatniego audytu (v5 → v6)

- ✅ **v5-C1 (Martwy handler WSAD/strzałek)** — Rozwiązany. Cały blok `useEffect` z handlerem `handleKeyDown` i switch na klawisze strzałek/WSAD został usunięty z `Scene3D.tsx`.
- ✅ **v5-H2 (EffectComposer `as any` tablica)** — Rozwiązany. `EffectComposer` renderuje teraz bezpośrednie JSX children z warunkami zamiast tablicy z castem.
- ✅ **v5-H4 (Etykiety niewidoczne w Trybie Budowy)** — Rozwiązany. Warunek renderowania etykiet (L301–304 w [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L301-L304)) uwzględnia teraz `buildMode` z wyświetlaniem dla `isUnbuilt || isCurrentStep`.
- ✅ **v5-M3 (Brak `onContextMenu` prevention)** — Rozwiązany. Dodano `onContextMenu={(e) => e.preventDefault()}` na wrapperze sceny ([Scene3D.tsx L311](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L311)).
- ✅ **v5-M4 (InfoPanel brak guard `buildMode`)** — Rozwiązany. Guard `if (buildMode) return null;` dodany w [InfoPanel.tsx L133](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L133).
- ✅ **v5-M5 (Brak ESC do wyjścia z Build Mode)** — Rozwiązany. Handler ESC w [UI.tsx L116–127](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L116-L127) obsługuje teraz wyjście z Trybu Budowy.
- ✅ **v5-M6 (Nieużywane importy w InfoPanel)** — Rozwiązany. `useMotionValue`, `useSpring`, `useTransform` są aktywnie wykorzystywane (parallax mousemove effect, L117–121).
- ✅ **v5-M7 (Duplikacja useEffect na `envPreset`)** — Rozwiązany. Usunięto zduplikowany efekt. Teraz `setEnvPreset` w [usePC.tsx L131–138](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L131-L138) obsługuje ustawienia oświetlenia bezpośrednio w akcji zustand.

---

## 🟠 HIGH (3 problemy)

---

### H1. `apple-touch-icon` nadal wskazuje na `.svg` — iOS ignoruje SVG

**Plik**: [index.html L16](file:///d:/Projekty%20AI/PCVerse/index.html#L16)

**Opis**: `<link rel="apple-touch-icon" href="/favicon.svg" />` — Safari/iOS akceptuje wyłącznie **PNG** dla `apple-touch-icon`. Ponadto ścieżka jest absolutna (`/favicon.svg`), co nie zadziała z `base: '/pcverse/'` skonfigurowanym w [vite.config.ts L11](file:///d:/Projekty%20AI/PCVerse/vite.config.ts#L11).

**Wpływ**: Użytkownik dodający stronę do ekranu głównego iOS zobaczy generyczną białą ikonę zamiast brandu PCVerse.

**Naprawa**: Wygeneruj `apple-touch-icon.png` (180×180 px) i zmień ścieżkę na względną:
```html
<link rel="apple-touch-icon" href="./apple-touch-icon.png" />
```

---

### H2. `Poster` i `Magazine` tworzą inline `meshStandardMaterial` z teksturą bez `dispose()`

**Plik**: [DeskScenery.tsx L96](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L96), [DeskScenery.tsx L137–143](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L137-L143)

**Opis**: Komponent `Poster` (L96) tworzy inline `<meshStandardMaterial map={tex} ... />` wewnątrz renderowanego JSX. R3F w pewnych scenariuszach (unmount/remount) nie wywołuje automatycznie `dispose()` na takim materiał. Podobnie `Magazine` (L137–143) tworzy inline materiał z mapą tekstury. Przy każdym toggle `showDesk` lub zamontowaniu/odmontowaniu `<DeskDetails>` przez `<Suspense>`, 7 instancji `Poster` + 1 `Magazine` = **8 wycieków** materiału z teksturami.

**Wpływ**: Memory leak na GPU. Na mobile/słabszych urządzeniach po wielokrotnym toggle widać degradację wydajności.

**Naprawa**: Wynieś materiał do `useMemo` + `useEffect` cleanup w `Poster`, analogicznie jak to zrobiono dla `DeskDetails`. Alternatywnie użyj `<primitive object={...} attach="material" />` z wstępnie zaalokowanym materiałem:
```tsx
const Poster = ({ tex, ... }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: tex, emissiveMap: tex, emissiveIntensity: 0.2, emissive: "#ffffff",
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 
  }), [tex]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <group ...>
      <mesh><planeGeometry ... /><meshBasicMaterial color="#000000" /></mesh>
      <mesh material={mat}><planeGeometry ... /></mesh>
    </group>
  );
};
```

---

### H3. `useMemo` jako side-effect w `CaseGeometry` (modyfikacja tekstury)

**Plik**: [CaseGeometry.tsx L33–42](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CaseGeometry.tsx#L33-L42), [CaseGeometry.tsx L44–58](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CaseGeometry.tsx#L44-L58)

**Opis**: Dwa bloki `useMemo(() => { texture.colorSpace = ...; texture.repeat.set(...); ... }, [texture])` modyfikują istniejące obiekty tekstur (side-effect), zamiast tworzyć nowe wartości. React 19 Strict Mode wywołuje `useMemo` dwukrotnie w developmencie, co potencjalnie powoduje podwójne modyfikacje tekstur. `useMemo` jest semantycznie przeznaczony do **obliczeń czystych (pure)**, nie do mutowania obiektów z zewnętrznym stanem.

**Wpływ**: W React 19 Strict Mode tekstury mogą zostać skonfigurowane dwukrotnie (co w tym przypadku jest idempotentne, ale narusza kontrakt Reacta i jest anty-wzorcem).

**Naprawa**: Zmień na `useEffect`:
```tsx
useEffect(() => {
  caseInteriorTexture.colorSpace = SRGBColorSpace;
  caseInteriorTexture.wrapS = ClampToEdgeWrapping;
  // ...
  caseInteriorTexture.updateMatrix();
}, [caseInteriorTexture]);
```

---

## 🟡 MEDIUM (6 problemów)

---

### M1. `DeskScenery` ładuje ~18 tekstur naraz — brak progresywnego ładowania

**Plik**: [DeskScenery.tsx L226–245](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L226-L245)

**Opis**: `DeskDetails` wykonuje jeden masywny `useTexture()` z 18 URL-ami, co blokuje rendering do momentu załadowania ~3.5 MB tekstur. Choć `<Suspense>` wokół `DeskDetails` jest obecny, nadal cały podgrafik ładuje się w jednym batchu.

**Wpływ**: Pierwsze włączenie scenografii (toggle `showDesk`) powoduje zawieszenie/freeze na 1–3 sekundy na wolniejszych łączach.

**Naprawa**: Podziel tekstury na grupy priorytetowe. Blat + dywan + skrzynia ładuj natychmiast. Detale (pudełka, plakaty, kubek, puszka, karteczki) opakowuj w odrębny `<Suspense>`:
```tsx
<Suspense fallback={null}>
  <DeskEssentials />  {/* rug, crate, reflector */}
  <Suspense fallback={null}>
    <DeskDetails />   {/* posters, boxes, scattered items */}
  </Suspense>
</Suspense>
```

---

### M2. `PCProvider` jest pustym wrapperem — martwy kod

**Plik**: [usePC.tsx L151–153](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L151-L153), [App.tsx L13](file:///d:/Projekty%20AI/PCVerse/src/App.tsx#L13)

**Opis**: `PCProvider` renderuje jedynie `<>{children}</>`. Wszystkie stany przeniesiono na zustand store'y, ale wrapper pozostał w drzewie komponentów. Jest to martwy kod — nie dostarcza żadnego kontekstu ani logiki.

**Wpływ**: Zerowy wpływ na wydajność, ale dezorientuje przy code review i powiększa graf komponentów w React DevTools.

**Naprawa**: Usuń `PCProvider` z [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx) i z [App.tsx](file:///d:/Projekty%20AI/PCVerse/src/App.tsx). Zaimportuj hook'i zustand bezpośrednio tam, gdzie są potrzebne (co już jest robione).

---

### M3. `CorkBoard` tworzy materiał w `useMemo` ale brak `dispose()` przy odmontowaniu

**Plik**: [DeskScenery.tsx L104–110](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L104-L110)

**Opis**: `corkMat` tworzony jest w `useMemo`, ale nie ma towarzyszącego `useEffect` cleanup z `dispose()`. Przy odmontowaniu komponentu `CorkBoard` (toggle scenografii) materiał z teksturą pozostaje w pamięci GPU.

**Wpływ**: Jeden wyciek materiału na każdy toggle scenografii.

**Naprawa**: Dodaj cleanup:
```tsx
useEffect(() => () => corkMat.dispose(), [corkMat]);
```

---

### M4. `Door` tworzy materiał w `useMemo` ale brak `dispose()` przy odmontowaniu

**Plik**: [DeskScenery.tsx L151–157](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L151-L157)

**Opis**: Identyczny problem jak M3, ale dla `doorMat` w komponencie `Door`. Brak `useEffect` cleanup.

**Wpływ**: Jeden wyciek materiału z teksturą na każdy toggle scenografii.

**Naprawa**: Dodaj `useEffect(() => () => doorMat.dispose(), [doorMat]);`

---

### M5. Wielokrotne `(camera as any).setViewOffset()` i `clearViewOffset()` — brak typowania

**Plik**: [Scene3D.tsx L145, L148, L155, L169, L178, L193](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L145)

**Opis**: W `Scene3D.tsx` jest **6 wystąpień** `(camera as any).setViewOffset()` lub `(camera as any).clearViewOffset()`. Te metody **istnieją** w typie `THREE.PerspectiveCamera`, ale R3F zwraca typ `THREE.Camera` z `useThree()`, dlatego stosowany jest cast `as any`.

**Wpływ**: Utrata type-safety, ryzyko ukrycia błędów po aktualizacji Three.js, bałagan typowy w code review.

**Naprawa**: Zaimportuj `PerspectiveCamera` z `three` i jawnie rzutuj raz:
```tsx
const perspCamera = camera as THREE.PerspectiveCamera;
perspCamera.setViewOffset(...);
```
Lub użyj `useThree(state => state.camera)` z typem `PerspectiveCamera` bezpośrednio, ponieważ `<PerspectiveCamera makeDefault />` jest jedyną kamerą w scenie.

---

### M6. `UI.tsx` to mega-plik (1146 linii, 55 KB) — brak dekompozycji

**Plik**: [UI.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx)

**Opis**: Pojedynczy komponent `UI` renderuje **wszystkie** elementy interfejsu: panel boczny z 14 przyciskami, Tryb Budowy, Poradę Eksperta, Narzędzia, Telemetrię, Przykładowe Modele, modal instrukcji, paletę kolorów, środowiska HDR, panel oświetlenia. Jest to największy plik w projekcie — 1146 linii kodu.

**Wpływ**: Czytelność i utrzymywalność spadają. Zmiana koloru jednego przycisku wymaga nawigacji w 55KB pliku. Każda zmiana stanu w `useBuildStore` lub `usePCRGB` re-renderuje **cały** UI zamiast jednego pod-komponentu.

**Naprawa**: Wydziel pod-komponenty:
- `BuildModeOverlay.tsx` (L182–246)
- `BuildModeExpertPanels.tsx` (L248–373) — Porada, Narzędzia, Telemetria, Modele
- `SidebarControls.tsx` (L376–800)
- `SettingsModals.tsx` (paleta, środowiska, oświetlenie)
- `InstructionsDialog.tsx` (modal instrukcji)

---

## 🟢 LOW (9 problemów)

---

### L1. `rotation` cast `as [number, number, number]` w `ComponentMesh`

**Plik**: [PCModel.tsx L252](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L252)

**Opis**: `rotationArr` inferowany jako `number[]`, wymaga explicit castu. Wystarczy zdefiniować jako stałą tuple:
```tsx
const rotationArr: [number, number, number] = ...
```

---

### L2. `ringRef as any` w Trybie Budowy

**Plik**: [PCModel.tsx L285](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L285)

**Opis**: `ref={ringRef as any}` — `ringRef` typowany jako `Mesh` ale podpinany do `<mesh>`. Wystarczy użyć `useRef<THREE.Mesh>(null)`.

---

### L3. `AmbilightStrip` — cast `(state: any)` w selektorach zustand

**Plik**: [DeskScenery.tsx L58–59](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L58-L59)

**Opis**: `usePCRGB((state: any) => state.rgbColor)` — jawny `any` na stanie zustand, mimo że store jest w pełni typowany. Wystarczy usunąć `: any`.

---

### L4. Redundancja useReducedMotion — zduplikowana implementacja

**Plik**: [Scene3D.tsx L21–32](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L21-L32) i [DeskScenery.tsx L390–398](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L390-L398)

**Opis**: Identyczny hook `useReducedMotion` (nasłuch na `prefers-reduced-motion`) jest zaimplementowany dwukrotnie w dwóch różnych plikach.

**Naprawa**: Wyekstrahuj do `src/hooks/useReducedMotion.ts` i importuj w obu miejscach.

---

### L5. `GeometryProps` interface z `[key: string]: any`

**Plik**: [PCModel.tsx L38](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L38)

**Opis**: Index signature `[key: string]: any` niszczy type-safety na propsach geometrii. Lepiej jawnie zdefiniować opcjonalne propsy: `isExhaust?: boolean; rgbEnabled?: boolean`.

---

### L6. `LoadingScreen` — zduplikowana logika ukrywania

**Plik**: [LoadingScreen.tsx L15–21](file:///d:/Projekty%20AI/PCVerse/src/components/LoadingScreen/LoadingScreen.tsx#L15-L21)

**Opis**: Blok `else if (!active && !isManualLoading && progress === 100)` (L15–17) i `else if (!active && !isManualLoading)` (L18–20) są identyczne w zachowaniu — oba ustawiają ten sam timer. Pierwsza gałąź jest zbędna.

**Naprawa**: Uprość do jednego bloku:
```tsx
if (active || isManualLoading) {
  setShow(true);
} else {
  const timer = setTimeout(() => setShow(false), 800);
  return () => clearTimeout(timer);
}
```

---

### L7. Brak `aria-live` na panelach Trybu Budowy (prawa strona)

**Plik**: [UI.tsx L305](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L305)

**Opis**: Panele Telemetrii i Przykładowych Modeli po prawej stronie nie mają `aria-live="polite"`. Panel budowy na dole ma (L213), ale prawa kolumna nie. Czytnik ekranu nie powiadomi o dynamicznie pojawiających się panelach.

**Naprawa**: Dodaj `aria-live="polite"` na kontenerze `<div className="fixed top-6 right-6 ...">` (L305).

---

### L8. Brak `aria-pressed` na niektórych przyciskach toggle w pasku bocznym

**Plik**: [UI.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx)

**Opis**: Przyciski `showLabels`, `showParticles`, `showFog`, `showDesk` nie mają atrybutu `aria-pressed`, podczas gdy `xrayMode`, `showAirflow`, `rgbEnabled` go posiadają. Niespójność w WCAG.

**Naprawa**: Dodaj `aria-pressed={showLabels}` itp. na odpowiednich przyciskach.

---

### L9. `ComponentLabel` przyjmuje props jako `any`

**Plik**: [PCModel.tsx L88](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L88)

**Opis**: `ComponentLabel = memo(({ data, hovered, isUnbuilt, isCurrentStep, isMobile, setHovered }: any) => ...)` — destructured props typowane jako `any`. Utrata type-safety na interfejsie wewnętrznego komponentu.

**Naprawa**: Zdefiniuj explicit interface:
```tsx
interface ComponentLabelProps {
  data: PCComponent;
  hovered: boolean;
  isUnbuilt: boolean;
  isCurrentStep: boolean;
  isMobile: boolean;
  setHovered: (h: boolean) => void;
}
```

---

## Podsumowanie i Priorytety

### Natychmiastowe (przed deploy):
1. **H1**: Wygeneruj `apple-touch-icon.png` i popraw `<link>` w `index.html`.
2. **H2**: Dodaj `dispose()` dla inline materiałów w `Poster` i `Magazine`.
3. **H3**: Zmień `useMemo` z side-effectami na `useEffect` w `CaseGeometry`.

### Planowane (następny sprint):
4. **M1**: Progresywne ładowanie tekstur scenografii.
5. **M2**: Usuń martwy wrapper `PCProvider`.
6. **M3 + M4**: Dodaj `dispose()` cleanup w `CorkBoard` i `Door`.
7. **M5**: Wyeliminuj `as any` na `camera.setViewOffset`.
8. **M6**: Dekompozycja `UI.tsx` na pod-komponenty.

### Backlog (nice-to-have):
9. **L1–L3**: Popraw typy (tuple, ref, zustand selectors).
10. **L4**: Wyekstrahuj `useReducedMotion` do współdzielonego hooka.
11. **L5**: Wyeliminuj index signature `[key: string]: any`.
12. **L6**: Uprość logikę `LoadingScreen`.
13. **L7 + L8**: Szlify dostępności (`aria-live`, `aria-pressed`).
14. **L9**: Jawnie typuj props `ComponentLabel`.

---

## Statystyki Kodu

| Metryka | Wartość |
|---------|---------|
| Plików źródłowych (`.tsx`/`.ts`) | 38 |
| Największy plik | `UI.tsx` — 1146 linii (55 KB) |
| Drugi największy | `MotherboardGeometry.tsx` — 21 KB |
| Wystąpień `as any` | 14 (spadek z ~18 w v5) |
| Zustand stores | 6 (`usePCSelection`, `usePCRGB`, `usePCView`, `usePCUI`, `usePCLighting`, `useBuildStore`) + `useAppLoading` |
| Komponentów 3D (geometrie) | 13 plików |
| Tekstur ładowanych | ~30+ (9 preload + ~18 DeskDetails + ~3 podkomponenty) |
| Zależności produkcyjnych | 12 |
| Chunk splitting | ✅ 7 manualnych chunków w Vite |
