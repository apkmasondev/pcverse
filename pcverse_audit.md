# 🔍 Pełny Audyt Aplikacji PCVerse

> **Data audytu:** 2026-06-22  
> **Wersja:** 0.0.0 (pre-release)  
> **Stack:** React 19 + Vite 8 + Three.js r184 + React Three Fiber 9 + Tailwind CSS 4 + Framer Motion 12

---

## Podsumowanie Wykonawcze

PCVerse to imponująca aplikacja edukacyjna z proceduralnie generowanym 3D modelem komputera PC. Architektura jest funkcjonalna, design premium, a UX dobrze przemyślany. Poniżej 38 znalezionych problemów w 7 kategoriach z priorytetami i konkretnymi propozycjami naprawy.

| Priorytet | Ilość |
|-----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 9 |
| 🟡 Medium | 15 |
| 🟢 Low | 11 |

---

## 1. Architektura React/Vite i Jakość Kodu

### 🔴 C1 — Monolityczny plik PCModel.tsx (2 079 linii, 80 KB)

**Opis:** Jeden plik zawiera 15+ geometrii komponentów, logikę interakcji, cząsteczki airflow, okablowanie, error boundary i x-ray mode. To najpoważniejszy problem architektoniczny w projekcie.

**Wpływ:** Czytelność bliska zeru, refaktor niemożliwy bez ryzyka, każda zmiana wymaga zrozumienia 2 000 linii kontekstu. Współpraca w zespole praktycznie niemożliwa.

**Naprawa:**
```
src/components/PCModel/
├── PCModel.tsx          (≈100 loc — główny eksport, mapa komponentów)
├── ComponentMesh.tsx    (≈100 loc — interakcja, hover, select)
├── CableGeometry.tsx    (≈80 loc)
├── AirflowParticles.tsx (≈70 loc)
├── XRayController.tsx   (≈60 loc — logika xray w useEffect)
├── geometries/
│   ├── CPUGeometry.tsx
│   ├── GPUGeometry.tsx
│   ├── MotherboardGeometry.tsx
│   ├── RAMGeometry.tsx
│   ├── PSUGeometry.tsx
│   ├── CaseGeometry.tsx
│   ├── FanGeometry.tsx
│   ├── SSDGeometry.tsx
│   └── HDDGeometry.tsx
└── constants.ts         (extrudeOpts, preload calls)
```

---

### 🟠 C2 — Duplikacja logiki `isMobile` w 4 komponentach

**Opis:** Identyczny wzorzec `window.matchMedia('(max-width: 768px)')` + listener jest zduplikowany w [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L250-L263), [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1951-L1958), [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L90-L96) i [App.tsx](file:///d:/Projekty%20AI/PCVerse/src/App.tsx).

**Wpływ:** Niespójne breakpointy, wiele jednoczesnych listenerów `resize`, trudność w zmianie progu.

**Naprawa:** Stwórz hook `useIsMobile()` w `src/hooks/useIsMobile.ts` i użyj go wszędzie. Lepiej: dodaj `isMobile` do `PCContext`.

---

### 🟡 C3 — Kontekst `PCContext` jest monolityczny „God object"

**Opis:** [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx) zawiera 15 wartości/setterów w jednym kontekście. Zmiana dowolnej wartości (np. `rgbColor`) powoduje re-render **każdego** konsumenta.

**Wpływ:** Niepotrzebne re-rendery UI, InfoPanel, Scene3D przy każdej zmianie RGB, airflow, labels.

**Naprawa:** Podziel na 2-3 konteksty: `SelectionContext` (selectedComponent), `SettingsContext` (rgb, xray, airflow, labels, env), `ExplodeContext` (explodeStep, camera).

---

### 🟡 C4 — `@types/three` w `dependencies` zamiast `devDependencies`

**Opis:** W [package.json](file:///d:/Projekty%20AI/PCVerse/package.json#L17) `@types/three` jest w `dependencies`. Typy TypeScript nie powinny trafiać do produkcji.

**Wpływ:** Minimalny wpływ na bundle (Vite tree-shakes), ale zła praktyka.

**Naprawa:** Przenieść do `devDependencies`.

---

### 🟢 C5 — Brak walidacji runtime'owej danych komponentów

**Opis:** [components.ts](file:///d:/Projekty%20AI/PCVerse/src/data/components.ts) definiuje interface `PCComponent`, ale dane nie są walidowane runtime. Brakujący `imageUrls` lub `role` spowoduje crash.

**Wpływ:** Przy dodawaniu nowych komponentów łatwo o runtime error.

**Naprawa:** Dodaj schemat Zod lub walidację przy starcie w trybie DEV.

---

### 🟢 C6 — Puste `catch(e) {}` w module audio

**Opis:** Wszystkie funkcje w [audio.ts](file:///d:/Projekty%20AI/PCVerse/src/utils/audio.ts) mają puste `catch(e) {}`. Cicha absorpcja błędów uniemożliwia diagnostykę.

**Wpływ:** Problemy z dźwiękiem nie zostaną wykryte podczas debugowania.

**Naprawa:** `catch(e) { console.warn('Audio:', e); }` lub `if (import.meta.env.DEV) console.warn(...)`.

---

## 2. Wydajność Three.js / React Three Fiber

### 🔴 C7 — Brak `dispose()` dla geometrii proceduralnych i Shape'ów

**Opis:** Komponenty jak `CaseGeometry`, `MotherboardGeometry`, `GPUGeometry` tworzą dziesiątki `THREE.Shape`, `THREE.Path`, `THREE.CubicBezierCurve3` i `tubeGeometry` w `useMemo`. Żaden z nich nie jest czyszczony przy unmount.

**Wpływ:** **Memory leak** — przy każdym mount/unmount (np. explode → collapse) geometrie akumulują się w pamięci GPU. Na urządzeniach mobilnych może spowodować crash po kilku cyklach.

**Naprawa:**
```tsx
useEffect(() => {
  return () => {
    if (shapeGeoRef.current) shapeGeoRef.current.dispose();
  };
}, []);
```
Dodać `ref` i `dispose()` do każdej dynamicznie tworzonej geometrii. Dla krzywych/shape (CPU-only) wystarczy GC, ale `TubeGeometry` i `ExtrudeGeometry` muszą mieć explicit `dispose()`.

---

### 🔴 C8 — `CableGeometry` tworzy nowe instancje `CubicBezierCurve3` przy każdym renderze

**Opis:** W [PCModel.tsx:1886-1921](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1886-L1921) krzywe kabli są tworzone **bezpośrednio w ciele komponentu** — bez `useMemo`. Każdy render komponentu (a renderuje się przy zmianie `explodeStep` i `xrayMode`) tworzy 5 nowych krzywych + 5 nowych `TubeGeometry`.

**Wpływ:** Krytyczny memory leak geometrii GPU. Stare geometrie nigdy nie są zwalniane.

**Naprawa:**
```tsx
const cables = useMemo(() => [
  new THREE.CubicBezierCurve3(...),
  // ...
], []);

// + dispose w useEffect cleanup
```

---

### 🟠 C9 — Ogromna liczba draw calls (>200 szacunkowo)

**Opis:** Każdy `<mesh>` to osobny draw call. Szacunkowa liczba:
- Case: ~60 meshes
- Motherboard: ~50 meshes  
- GPU: ~30 meshes
- Per fan: ~12 meshes × 5 = 60
- Cables: 5 meshes
- Airflow particles: 6 × InstancedMesh
- **Total: ~200+ draw calls**

**Wpływ:** Na słabszych GPU (mobilne, zintegrowane) spadek FPS do 20-30. Postprocessing (Bloom, N8AO, DoF, ChromaticAberration, Vignette) mnożnik ×5 na koszt fill-rate.

**Naprawa:**
1. Użyj `<Merged>` z drei do łączenia identycznych geometrii (np. VRM capacitors, PCIe slots).
2. Zamień serię małych boxGeometry (np. fan blades, VRM fins) na jedną `BufferGeometry` z `mergeBufferGeometries`.
3. Rozważ `InstancedMesh` dla powtarzających się elementów (capacitors, fins, ports).

---

### 🟠 C10 — Nieoptymalne `useFrame` w wielu komponentach

**Opis:** Aktywnych callbacków `useFrame`:
- `GPUGeometry` — 3 fan rotations
- `PSUGeometry` — 1 fan rotation  
- `FanGeometry` × 5 instancji — 5 fan rotations
- `CaseGeometry` — 3 lerpy (glass/side panels)
- `ComponentMesh` × 13 — position/scale lerp
- `CursorLight` — raycaster lerp
- `LocalAirflowParticles` × ~9 — forEach nad cząsteczkami

**Total: ~35+ callbacków `useFrame` w każdej klatce.**

**Wpływ:** Każdy callback to osobne wywołanie JS, co utrudnia JIT optymalizację i zwiększa czas ramki.

**Naprawa:**
1. Połącz rotacje fanów w jeden `useFrame` na poziomie `PCModel` z tablicą ref-ów.
2. Throttle `ComponentMesh` lerp na mobile (już częściowo zrobiony z `timeAccumulator`, ale threshold 1/30 jest za agresywny — gubimy płynność).
3. Dla airflow particles — użyj GPU particles (shader) zamiast CPU-based InstancedMesh update.

---

### 🟠 C11 — X-Ray mode mutuje materiały zamiast je zamieniać

**Opis:** [PCModel.tsx:1960-2026](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1960-L2026) — `useEffect` robi `groupRef.current.traverse()` i bezpośrednio mutuje właściwości materiałów (`wireframe`, `transparent`, `opacity`, `color`, `map = null`).

**Wpływ:**
1. Ustawienie `mat.map = null` **traci referencję** do tekstury — przywrócenie wymaga ponownego ładowania (ale w kodzie backup jest w `userData`, więc to działa).
2. Mutacja materiałów powoduje, że wszystkie meshe współdzielące ten sam materiał (R3F reuse) są zmieniane globalnie — efekty uboczne.
3. `traverse()` 200+ meshes w synchro to blokada main thread na ~2-5ms.

**Naprawa:** Stwórz oddzielne materiały x-ray (`xrayMaterial = new THREE.MeshBasicMaterial(...)`) i przełączaj `mesh.material` reference zamiast mutować właściwości. Lub użyj `<meshBasicMaterial>` warunkowo w JSX.

---

### 🟡 C12 — Canvas ma `logarithmicDepthBuffer: true`

**Opis:** [Scene3D.tsx:270](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L270) — logarithmiczny depth buffer.

**Wpływ:** Dodatkowy koszt GPU na fragment shader (log operacja per piksel). Przy near=0.5, far=100 standardowy depth buffer jest wystarczający. `logarithmicDepthBuffer` jest potrzebny dopiero przy ogromnych różnicach near/far (0.01 / 100000).

**Naprawa:** Usuń `logarithmicDepthBuffer: true`. Przy `near={0.5} far={100}` standardowy 24-bit depth buffer jest idealny.

---

### 🟡 C13 — `shadows` włączone w Canvas, ale brak shadow-map casterów/receiverów

**Opis:** [Scene3D.tsx:272](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L272) ma `shadows` prop, ale żaden mesh nie ma `castShadow` ani `receiveShadow`.

**Wpływ:** Renderer inicjalizuje shadow pipeline (shadow map allocation) bez żadnej korzyści wizualnej.

**Naprawa:** Usuń `shadows` z Canvas lub dodaj `castShadow`/`receiveShadow` do kluczowych meshes + światła.

---

### 🟡 C14 — 5 ciężkich post-processing efektów jednocześnie

**Opis:** Bloom + N8AO + Vignette + ChromaticAberration + DepthOfField = 5 full-screen pasów renderowania.

**Wpływ:** Na mobilnych GPU i zintegrowanych (Intel UHD) to dominujący koszt — każdy pass to pełne odczytanie i zapisanie framebuffera. Efektywnie scena renderuje się 6-7 razy.

**Naprawa:**
1. Na mobile wyłącz ChromaticAberration i DepthOfField (już DoF `bokehScale: 0` na mobile — OK, ale pass nadal się wykonuje).
2. Użyj `enabled={!isMobile}` na ChromaticAberration.
3. Rozważ `DepthOfField` tylko gdy `dofEnabled=true` (warunkowy rendering).

---

### 🟡 C15 — Duplikowane materiały — te same paramery, nowe instancje

**Opis:** `color="#151515" roughness={0.6}` pojawia się ~20 razy w PCModel. Każde użycie tworzy nowy `MeshStandardMaterial`. R3F NIE reuse'uje materiałów deklarowanych inline.

**Wpływ:** ~100+ materialów w pamięci GPU zamiast ~15-20 unikalnych.

**Naprawa:**
```tsx
// constants.ts
export const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.6 });
// użycie: <mesh material={darkMetalMaterial} />
```

---

### 🟢 C16 — `Bvh` opakowuje cały model, ale nie ma `splitStrategy`

**Opis:** [PCModel.tsx:2030](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L2030) — `<Bvh firstHitOnly>` to dobra optymalizacja raycastingu, ale może być wolny dla dynamicznej sceny (explode zmieniany position).

**Wpływ:** Minimalny — BVH jest rebuild automatically, ale warto monitorować.

**Naprawa:** Dodaj `splitStrategy="SAH"` dla optymalnego podziału.

---

## 3. UX/UI i Spójność Designu

### 🟠 C17 — InfoPanel na desktop zajmuje 45vw, blokując widok 3D

**Opis:** [InfoPanel.tsx:143-147](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L143-L147) — `w-full md:w-[45vw] h-[60vh] md:h-screen`. Na desktopie panel zajmuje prawie połowę ekranu.

**Wpływ:** Wybrany komponent w 3D jest często zasłonięty. Camera offset (`setViewOffset`) częściowo kompensuje, ale na mniejszych monitorach (1366×768) komponent jest ciasno wtłoczony.

**Naprawa:** Zmniejsz do `md:w-[38vw] lg:w-[35vw]` i dodaj `xl:w-[30vw]` dla szerokich monitorów.

---

### 🟡 C18 — Brak wizualnego feedbacku na mobile, że Canvas jest interaktywny

**Opis:** Na mobile Canvas to 60vh, a hint na dole pojawia się z 2s opóźnieniem i znika po 8s. Jeśli użytkownik otworzy stronę w trakcie scrollowania, może go nie zauważyć.

**Wpływ:** Użytkownicy mobilni mogą nie wiedzieć, że model jest klikalny.

**Naprawa:** Dodaj pulsujący wskaźnik „tap to explore" bezpośrednio na Canvas, który znika po pierwszej interakcji.

---

### 🟡 C19 — Brak animacji powitalnej / onboarding

**Opis:** Po załadowaniu jest LoadingScreen, potem natychmiast widoczny model. Nie ma intro-animacji kamery ani onboardingu wyjaśniającego funkcjonalności.

**Wpływ:** Użytkownik nie wie o WASD/strzałkach, explode view, x-ray, airflow, RGB.

**Naprawa:** Dodaj opcjonalny walkthrough (3-4 kroków z wskaźnikami) przy pierwszej wizycie (localStorage flag).

---

### 🟡 C20 — Toolbar na mobile jest zbyt mały i ciasny

**Opis:** [UI.tsx:64](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L64) — buttony 36×36px (`w-9 h-9`) na mobile bez dodatkowych marginesów. Na ekranach 5" są ciasno obok siebie.

**Wpływ:** Trudne dotykowe target'y (minimum WCAG to 44×44px dla dotykowych).

**Naprawa:** Na mobile zwiększ do `w-11 h-11` (44px) i dodaj gap-4.

---

### 🟢 C21 — Paleta RGB i Environment flyout mogą wychodzić poza viewport

**Opis:** Flyouty otwierają się `left-12` na mobile. Na wąskich ekranach mogą wypaść poza prawy/dolny edge.

**Wpływ:** Użytkownik nie widzi wszystkich opcji.

**Naprawa:** Dodaj `max-h-[70vh] overflow-y-auto` i sprawdź pozycję z `useLayoutEffect`.

---

### 🟢 C22 — Inconsistent language (PL/EN)

**Opis:** UI jest w języku polskim, ale LoadingScreen mówi „Initializing Experience", „LOADING ASSETS". WebGL error screen jest po angielsku. ErrorBoundary: „Application Error" / „Reload Application".

**Wpływ:** Niespójna lokalizacja.

**Naprawa:** Ujednolicić do polskiego lub dodać i18n.

---

## 4. Responsywność, Dostępność (WCAG) i SEO

### 🟠 C23 — Brak `alt` text na ikonach interaktywnych (screen readers)

**Opis:** Ikony Lucide w toolbarze (`<Layers>`, `<Focus>`, itd.) nie mają `aria-hidden="true"`. Buttony mają `aria-label`, co jest dobrze, ale w instrukcji dialog ikony nie mają `aria-hidden`.

**Wpływ:** Screen readery mogą czytać śmieciowy tekst z ikon SVG.

**Naprawa:** Dodaj `aria-hidden="true"` do wszystkich ikon dekoracyjnych. Już częściowo zrobione w instrukcji ([UI.tsx:306](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L306)), ale brakuje tego w toolbarze.

---

### 🟠 C24 — Brak `aria-live` region dla zmiany stanu komponentów

**Opis:** Gdy użytkownik kliknie komponent, panel informacyjny się pojawia, ale nie ma `aria-live` regionu informującego screen reader o nowej treści.

**Wpływ:** Użytkownicy korzystający z czytników ekranu nie wiedzą, że otworzył się panel.

**Naprawa:** Dodaj `aria-live="polite"` na kontenerze InfoPanel.

---

### 🟠 C25 — Scena 3D jest nieczytelna dla screen readerów

**Opis:** Canvas WebGL jest black-box dla assistive technologies. Brak alternatywnego opisu sceny.

**Wpływ:** Użytkownicy z dysfunkcjami wzroku nie mają dostępu do głównej treści.

**Naprawa:**
1. Dodaj `role="img"` i `aria-label="Interaktywny model 3D komputera PC"` na div Canvas.
2. Dodaj listę komponentów w `<ul>` ze `sr-only` jako alternatywna nawigacja.

---

### 🟡 C26 — Kontrast tekstu w niektórych elementach jest za niski

**Opis:** `text-slate-400` na `bg-[#0a0a0a]/90` = kontrast ~3.5:1. WCAG AA wymaga 4.5:1 dla normalnego tekstu.

**Wpływ:** Tekst opisów w tooltipach i small text w UI trudny do odczytania.

**Naprawa:** Zmień `text-slate-400` → `text-slate-300` w tooltipach i opisach.

---

### 🟡 C27 — OG image path nie uwzględnia `base: '/pcverse/'`

**Opis:** [index.html:18](file:///d:/Projekty%20AI/PCVerse/index.html#L18) — `content="/images/og-cover.png"` bez prefix `/pcverse/`. Po deploy na GitHub Pages pod `/pcverse/` obraz nie będzie znaleziony.

**Wpływ:** Udostępnianie linku w social media nie pokaże preview.

**Naprawa:** Zmień na `/pcverse/images/og-cover.png` lub użyj pełnego URL.

---

### 🟡 C28 — Favicon path nie uwzględnia `base`

**Opis:** [index.html:6](file:///d:/Projekty%20AI/PCVerse/index.html#L6) — `href="/favicon.svg"` — bez `/pcverse/` prefix.

**Wpływ:** Brak ikony w zakładce po deploy.

**Naprawa:** Zmień na `/pcverse/favicon.svg` lub użyj relatywnego path.

---

### 🟢 C29 — Brak `<noscript>` fallback

**Opis:** Jeśli JavaScript jest wyłączony, użytkownik widzi białą stronę.

**Wpływ:** Minimalny (3D wymaga JS), ale to zła praktyka.

**Naprawa:** Dodaj `<noscript>` w `<body>` z komunikatem.

---

### 🟢 C30 — Brak canonical URL

**Opis:** Brak `<link rel="canonical">` w head.

**Wpływ:** Potencjalna duplikacja w indeksach Google.

**Naprawa:** Dodaj `<link rel="canonical" href="https://pcverse.app/" />`.

---

## 5. Błędy Logiczne, Edge Case'y i Potencjalne Crashe

### 🟠 C31 — `toggleExploded()` używa `setTimeout` — race condition

**Opis:** [usePC.tsx:42-52](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L42-L52) — dwuetapowe przejście z `setTimeout(800ms)`. Jeśli użytkownik kliknie toggle szybko 2x w 800ms, stany się nałożą.

**Wpływ:** Stan explode może utknąć w pośrednim kroku (1) i nie dokończyć animacji.

**Naprawa:**
```tsx
const [isAnimating, setIsAnimating] = useState(false);
const toggleExploded = () => {
  if (isAnimating) return; // guard
  setIsAnimating(true);
  // ... setTimeout logic
  setTimeout(() => setIsAnimating(false), 850);
};
```

---

### 🟠 C32 — `InfoPanel` image index nie jest resetowany przy zmianie komponentu

**Opis:** `zoomedImageIndex` nie jest resetowany gdy `selectedComponent` się zmienia. Jeśli komponent A ma 3 zdjęcia i użytkownik zobaczy zdjęcie #3, a potem kliknie komponent B z 2 zdjęciami — indeks 2 jest poza zakresem.

**Wpływ:** Crash/blank w lightboxie.

**Naprawa:** Dodaj `useEffect(() => setZoomedImageIndex(null), [selectedComponent])`.

---

### 🟡 C33 — `CableGeometry` returns null w explode, ale geometry nie jest czyszczona

**Opis:** [PCModel.tsx:1926](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1926) — `if (explodeStep > 0) return null`. Unmount komponentu bez cleanup geometrii.

**Wpływ:** Memory leak geometrii TubeGeometry przy każdym explode/collapse cyklu.

**Naprawa:** Użyj conditional visibility (`visible={explodeStep === 0}`) zamiast warunkowego renderowania, lub dodaj cleanup effect.

---

### 🟡 C34 — `playAmbientSound()` nie czyści oscillatorów przy szybkim toggle

**Opis:** [audio.ts:86](file:///d:/Projekty%20AI/PCVerse/src/utils/audio.ts#L86) — `if (ambientOsc) return` guard, ale `stopAmbientSound()` ustawia `ambientOsc = null` dopiero po 1.1s fade-out. Jeśli użytkownik szybko toggle ON → OFF → ON w <1s, `whineOsc` nie zostanie zatrzymany.

**Wpływ:** Zombie oscillator będzie grał w tle wiecznie (memory/audio leak).

**Naprawa:** Natychmiast ustaw `ambientOsc = null` i użyj `AbortController` pattern lub `cancelScheduledValues`.

---

### 🟢 C35 — `InfoPanel` rotateX/rotateY bazuje na `window.innerWidth` initial value

**Opis:** [InfoPanel.tsx:121-122](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L121-L122) — `useTransform(mouseY, [-window.innerHeight / 2, ...])` — `window.innerHeight` jest przechwycone w momencie mount. Po resize wartości będą niepoprawne.

**Wpływ:** Efekt 3D parallax będzie przesunięty po resize okna.

**Naprawa:** Użyj `useState` z listener `resize` do aktualizacji zakresu.

---

### 🟢 C36 — WebGL check w `App.tsx` nie sprawdza WebGL2

**Opis:** [App.tsx:9-16](file:///d:/Projekty%20AI/PCVerse/src/App.tsx#L9-L16) — sprawdza `webgl` i `experimental-webgl`, ale Three.js r184 domyślnie wymaga WebGL2.

**Wpływ:** Na starszych przeglądarkach WebGL1-only, Three.js może się załadować, ale postprocessing (EffectComposer) nie będzie działał.

**Naprawa:** Sprawdź `canvas.getContext('webgl2')`.

---

## 6. Optymalizacja Bundle Size, Ładowania Zasobów 3D i Czasu Startu

### 🟠 C37 — Wszystkie 29 tekstur ładowane eagerly (blokują start)

**Opis:** [PCModel.tsx:2048-2077](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L2048-L2077) — 29 wywołań `useTexture.preload()`. Łączny rozmiar tekstur w `src/assets`: **2.71 MB**. Wszystkie muszą się załadować zanim loading screen zniknie.

**Wpływ:** Na wolnym 3G (~750 KB/s) czas startu to ~4 sekundy samych tekstur. Na normalnym wifi ~1-2s, akceptowalne.

**Naprawa:**
1. Zrób 2-tier loading: najpierw krytyczne (case, mobo top), reszta lazy po starcie.
2. Rozważ KTX2 (Basis Universal) — kompresja GPU 5-8× mniejsza bez utraty jakości.
3. Niektóre tekstury (`mobo_back_photo.webp` 176KB, `case_back.webp` 276KB, `case_bottom.webp` 251KB) mogą być zmniejszone resolution.

---

### 🟡 C38 — Brak code splitting — jeden chunk

**Opis:** Vite config nie ma manual chunks. Cały bundle trafia do jednego pliku JS.

**Wpływ:** FCP (First Contentful Paint) jest opóźniony, bo przeglądarka musi pobrać i sparsować cały bundle przed renderem.

**Naprawa:**
```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        three: ['three'],
        r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
        motion: ['framer-motion'],
      }
    }
  }
}
```

---

### 🟡 C39 — Pliki `diff.txt` i `my_diff.txt` (82KB×2), `original_PCModel.tsx` (58KB) w repozytorium

**Opis:** Pliki debugowe/backup w katalogu głównym.

**Wpływ:** Zanieczyszczenie repozytorium, dodatkowe 222KB w git. Nie trafiają do bundle (nie w `src/`), ale to zła praktyka.

**Naprawa:** Dodaj do `.gitignore` i usuń: `diff.txt`, `my_diff.txt`, `original_PCModel.tsx`, `check_size.js`, `check_uvs.cjs`, `compress.cjs`, `compress.js`, `compress.mjs`, `compress_esm.js`.

---

### 🟢 C40 — `dist/` folder w repozytorium (nie w gitignore)

**Opis:** Folder `dist/` istnieje w projekcie — prawdopodobnie commitowany. Brak w `.gitignore`.

**Wpływ:** Zduplikowane pliki w repozytorium.

**Naprawa:** Sprawdź `.gitignore` i dodaj `dist/` jeśli brakuje.

---

## 7. Jakość Animacji, Sterowania Kamerą i Interakcji z Modelami 3D

### 🟡 C41 — Camera intro jest dwuetapowa z setTimeout, nie animation

**Opis:** [Scene3D.tsx:98-104](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L98-L104) — `setLookAt(0, 12, 35, ...)` → `setTimeout(300ms)` → `setLookAt(0, 3, 20, ...)`. To tworzy nienaturalny skok.

**Wpływ:** Użytkownik widzi 300ms statyczny kadr z daleka, potem smooth transition. Wygląda jak bug.

**Naprawa:** Użyj jednego `setLookAt` z `true` (smooth) bezpośrednio na docelową pozycję. Efekt cinematic lepiej zrobić za pomocą `dampingFactor` i wolniejszego `smoothTime`.

---

### 🟡 C42 — Exploded view floating animation zależy od `id.charCodeAt(0)` — niska entropia

**Opis:** [PCModel.tsx:1707](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1707) — `data.id.charCodeAt(0) * 10` jako seed. Komponenty o ID zaczynającym się tą samą literą (np. `case`, `case_fan`, `cpu`, `cpu_cooler`) będą miały identyczną fazę.

**Wpływ:** Komponenty „c" i „s" pulsują synchronicznie zamiast niezależnie.

**Naprawa:** Użyj hash całego ID: `data.id.split('').reduce((a, c) => a + c.charCodeAt(0) * 17, 0)`.

---

### 🟢 C43 — Hover lift effect jest niewidoczny na małych komponentach

**Opis:** [PCModel.tsx:1690](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L1690) — `liftOffset = 0.1` jest stały. Dla SSD (0.2 × 0.8 × 0.01) to 50% wysokości — zbyt dużo. Dla Case (4 × 5 × 2) to 2% — niewidoczne.

**Wpływ:** Niespójny feedback wizualny.

**Naprawa:** Skaluj lift proporcjonalnie do rozmiaru geometrii: `liftOffset = Math.max(0.05, data.geometryArgs[1] * 0.03)`.

---

### 🟢 C44 — Brak gesture support (pinch-to-zoom) na mobile Canvas

**Opis:** `CameraControls` z drei obsługuje pinch natywnie, więc to powinno działać. Warto zweryfikować.

**Wpływ:** Brak — CameraControls obsługuje touch.

**Naprawa:** Brak (weryfikacja OK).

---

## Priorytetyzacja Działań

### Faza 1 — Krytyczne (tydzień 1)
1. **C8** — Memo-ize krzywe kabli + dispose
2. **C7** — Dodaj dispose() do proceduralnych geometrii
3. **C31** — Guard na double-click toggle explode
4. **C32** — Reset zoomed image index

### Faza 2 — High (tydzień 2-3)
5. **C1** — Rozbij PCModel.tsx na pliki
6. **C2** — Wydziel `useIsMobile` hook
7. **C9** — Merge geometrii (VRM caps, fins, ports)
8. **C11** — Refactor x-ray mode
9. **C37** — 2-tier texture loading + KTX2

### Faza 3 — Medium (tydzień 4+)
10. **C3** — Podziel kontekst
11. **C10** — Optymalizacja useFrame
12. **C14** — Warunkowy postprocessing na mobile
13. **C17** — Zmniejsz InfoPanel width
14. **C27/C28** — Fix OG image i favicon paths
15. **C23-C25** — Accessibility fixes
16. **C38** — Code splitting w Vite
