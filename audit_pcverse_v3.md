# Pełny Audyt Aplikacji PCVerse (Etap 20)

> [!NOTE]
> Audyt przeprowadzony 26 czerwca 2026 r. po zmianach z Etapów 15–19. Zbadano **38 plików źródłowych** obejmujących architekturę, rendering 3D, UX/UI, dostępność, SEO, stabilność oraz bundle size.

---

## Podsumowanie Wykonawcze

| Priorytet | Ilość |
|-----------|-------|
| 🔴 Critical | 4 |
| 🟠 High | 9 |
| 🟡 Medium | 12 |
| 🟢 Low | 8 |

Aplikacja jest **bardzo dojrzała** — poprzednie audyty (Etapy 5, 11, 15–18) rozwiązały fundamentalne problemy z wyciekami pamięci, architekturą i performance. Pozostałe znaleziska dotyczą głównie **drobnych wycieków materiałów**, **brakujących optymalizacji re-renderów** oraz **dalszego szlifowania dostępności i SEO**.

---

## 🔴 CRITICAL (4 problemy)

---

### C1. Masowe tworzenie inline `meshStandardMaterial` na każdy re-render RGB
**Pliki**: [MotherboardGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/MotherboardGeometry.tsx#L306), [GPUGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/GPUGeometry.tsx#L145), [CaseGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CaseGeometry.tsx#L226), [CPUCoolerGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CPUCoolerGeometry.tsx#L101)

**Opis**: W wielu komponentach geometrii materiały RGB (`emissive={rgbColor}`) są deklarowane jako JSX inline `<meshStandardMaterial>`. Każda zmiana koloru RGB (`setRgbColor`) powoduje, że React Three Fiber **tworzy nowe instancje** `MeshStandardMaterial` i **nie dispose'uje starych** (bo nie ma jawnego `dispose()`). Dotyczy to m.in.:
- `MotherboardGeometry`: 5 elementów RGB (audio trace + 4 boki chipsetu)
- `GPUGeometry`: 5 elementów (edge lighting, RGB rings ×3, side strip)
- `CaseGeometry`: 1 element (power button ring)
- `CPUCoolerGeometry`/`FanGeometry`: torus RGB rings ×2 per fan × ~6 fanów

**Wpływ**: Wyciek ~20+ materiałów na każdą zmianę koloru RGB. Na sesjach mobilnych z ograniczoną VRAM może prowadzić do **crash / OOM**, a na desktopie do stopniowej degradacji FPS.

**Naprawa**:
1. Wynieś materiały RGB do `useRef` + `useMemo` z kluczem `[rgbColor]`.
2. W `useEffect` cleanup, wywołaj `ref.current?.dispose()`.
3. Alternatywa: użyj jednej współdzielonej instancji `MeshStandardMaterial` i mutuj `.color`/`.emissive` imperatywnie w `useFrame` lub `useEffect` (unikasz alokacji w ogóle).

```tsx
// Wzorzec referencyjny:
const rgbMat = useRef<MeshStandardMaterial>(null!);
useEffect(() => {
  rgbMat.current.color.set(rgbColor);
  rgbMat.current.emissive.set(rgbColor);
}, [rgbColor]);
// W JSX: <meshStandardMaterial ref={rgbMat} emissiveIntensity={1.5} toneMapped={false} />
```

---

### C2. Brak `dispose()` dla nowych materiałów w `FanGeometry` per-face
**Plik**: [CPUCoolerGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CPUCoolerGeometry.tsx#L79-L84)

**Opis**: `FanGeometry` renderuje 6 materiałów per-face na `BoxGeometry` (`material-0` … `material-5`), ale tworzy nowe instancje `<meshStandardMaterial>` inline (linie 79–84). Podobnie CPUCoolerGeometry (linie 183–189). Te materiały **nigdy nie są dispose'owane**.

**Wpływ**: ~12 materiałów × 6 fanów = ~72 instancje materiałów wyciekają. Wyciek powiększa się przy każdym remount (np. zmiana trybu X-Ray).

**Naprawa**: Wynieś per-face materiały do `useMemo` i dodaj cleanup w `useEffect`. Lepiej: zdefiniuj je w `materials.ts` jako stałe (bo tekstury są stabilne).

---

### C3. Kontekstowy re-render lawinowy w `ComponentMesh`
**Plik**: [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L96-L250)

**Opis**: `ComponentMesh` jest opakowane w `React.memo`, ale wewnątrz subskrybuje **obydwa konteksty** (`usePCSelection` + `usePCSettings`). Za każdym razem gdy zmienia się `rgbColor`, `xrayMode`, `showLabels`, `showInstructions`, `showAirflow` — **wszystkie 14 komponentów** przebudowują się (bo kontekst `PCSettingsContext` nie jest podzielony dalej). Custom comparator w `memo` (`prevProps.data.id === nextProps.data.id`) nie chroni, bo zmiana pochodzi z hooków wewnątrz, nie z propsów.

**Wpływ**: Zmiana jednego slidera kolorów powoduje **14 × pełen re-render** łącznie z `useMemo` na `ProceduralGeometry`, przetworzeniem 14 etykiet HTML, etc. Na mobile to wyraźny jank.

**Naprawa**: 
1. Podziel `PCSettingsContext` na mniejsze atomy: `RGBContext`, `ViewModeContext`, `UIContext`.
2. Albo: użyj selektorów (zustand/jotai) zamiast React Context, aby subskrybować tylko potrzebne pola.
3. Krótkoterminowo: wynieś `rgbColor` i `xrayMode` do propsów `ComponentMesh` i obsługuj je w memo comparatorze.

---

### C4. CSP blokuje `blob:` dla stylów — potencjalny crash Tailwind CSS v4
**Plik**: [index.html](file:///d:/Projekty%20AI/PCVerse/index.html#L5)

**Opis**: CSP header ustawia `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`. Tailwind CSS v4 (plugin `@tailwindcss/vite`) w dev mode generuje style poprzez `blob:` URL lub `<style>` injection, co może być zablokowane. Ponadto, `connect-src` pozwala na pobieranie z kilku CDN-ów, ale **HDR pliki są lokalne** (public/environments/), więc reguły CDN-owe w `connect-src` są niepotrzebne i rozszerzają surface ataku.

**Wpływ**: Na niektórych przeglądarkach (szczególnie Firefox z restrykcyjnym CSP), style mogą nie załadować się poprawnie, powodując **niezostylizowaną stronę**.

**Naprawa**:
1. Dodaj `blob:` do `style-src` lub usuń CSP z `index.html` i przenieś do response headers na serwerze (zalecane).
2. Wyczyść niepotrzebne domeny CDN z `connect-src` jeśli zasoby są lokalne.

---

## 🟠 HIGH (9 problemów)

---

### H1. `useIsMobile` defaultuje do `false` — flash layout na mobile
**Plik**: [useIsMobile.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/useIsMobile.tsx#L4)

**Opis**: Hook inicjalizuje `useState(false)` niezależnie od rzeczywistej szerokości ekranu. Na urządzeniach mobilnych, przez pierwszy render, `isMobile === false`, co powoduje:
- Załadowanie desktopowego `EffectComposer` z multisampling=4
- Renderowanie `Sparkles` i `Stars`
- Użycie `MeshPhysicalMaterial` (ciężki shader) zamiast `MeshStandardMaterial`

**Wpływ**: Na mobile użytkownik widzi **flash desktopowego layoutu** + chwilowy spike GPU, zanim `useEffect` poprawi stan.

**Naprawa**:
```tsx
const [isMobile, setIsMobile] = useState(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
});
```

---

### H2. Duplikacja materiału w `materials.ts` i `constants.ts`
**Pliki**: [materials.ts](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/materials.ts#L10), [constants.ts](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/constants.ts#L7)

**Opis**: `materials.caseFrame` (L10 w materials.ts) i `caseFrameMaterial` (L7 w constants.ts) to dwa **osobne** instancje `MeshStandardMaterial` z niemal identycznymi parametrami (`#2a2c30` vs `#1a1c20`, oba metalness ~0.8–0.9). Oba są używane w różnych plikach.

**Wpływ**: Dodatkowy draw call / shader, gorsza czytelność, ryzyko niespójności wizualnej.

**Naprawa**: Zdecyduj się na jeden kolor i jedną instancję. Przenieś `caseFrameMaterial` do `materials.ts` i usuń duplikat z `constants.ts`.

---

### H3. `EffectComposer` renderuje pusty `<group />` zamiast null (hack TypeScript)
**Plik**: [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L259)

**Opis**: Linia `{dofEnabled && !disableEffects ? <DepthOfField ... /> : <group /> as any}` — to jest workaround typowy dla starszych wersji `@react-three/postprocessing`, ale w v3+ lepiej użyć warunkowego renderowania. Aktualnie pusty `<group>` wewnątrz EffectComposer jest **ignorowany**, ale jest nieprzewidywalny i może crashnąć po aktualizacji biblioteki.

**Wpływ**: Potencjalny crash przy aktualizacji postprocessing. Hakowe `as any` maskuje błędy TypeScript.

**Naprawa**: Użyj warunkowego renderowania efektów bezpośrednio:
```tsx
<EffectComposer multisampling={4}>
  {dofEnabled && !disableEffects && <DepthOfField target={dofTarget} ... />}
  <Bloom ... />
  ...
</EffectComposer>
```

---

### H4. `PCProvider` context value nie jest memoizowane — re-rendery dzieci
**Plik**: [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L90-L124)

**Opis**: Obiekty `value` w `PCSettingsContext.Provider` i `PCSelectionContext.Provider` są tworzone jako nowe literały obiektów przy **każdym renderze** `PCProvider`. React traktuje każdy nowy obiekt jako zmianę kontekstu, co wymusza re-render **wszystkich konsumentów** (nawet jeśli żaden stan się nie zmienił).

**Wpływ**: Każdy klik w UI, który re-renderuje `PCProvider`, kaskadowo re-renderuje **całą scenę 3D**.

**Naprawa**:
```tsx
const selectionValue = useMemo(() => ({
  selectedComponent, explodeStep, cameraResetTrigger,
  setSelectedComponent, toggleExploded, triggerCameraReset,
}), [selectedComponent, explodeStep, cameraResetTrigger]);

const settingsValue = useMemo(() => ({
  xrayMode, rgbColor, rgbEnabled, showAirflow, envPreset,
  showLabels, showInstructions, showDesk,
  toggleXrayMode, setRgbColor, toggleRgbEnabled, toggleAirflow,
  setEnvPreset, toggleLabels, setShowInstructions, toggleDesk,
}), [xrayMode, rgbColor, rgbEnabled, showAirflow, envPreset,
     showLabels, showInstructions, showDesk]);
```

> [!IMPORTANT]
> Aby to zadziałało, callback'i (`toggleXrayMode`, `setRgbColor`, itp.) muszą być stabilne — użyj `useCallback` na każdym z nich.

---

### H5. `InfoPanel` nasłuchuje `mousemove` na window globalnie — niepotrzebne na mobile
**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L121-L128)

**Opis**: Efekt tilt-on-hover (`rotateX`, `rotateY`) nasłuchuje na `mousemove` na `window` **cały czas** (nawet gdy panel jest zamknięty i na mobile). Na mobile ten efekt jest wyłączony (`isMobile ? {} : { rotateX, rotateY }`), ale listener nadal rejestruje każdy ruch palca.

**Wpływ**: Na mobile: niepotrzebne kalkulacje + garbage z `useSpring`. Na desktop: listener pracuje nawet gdy `InfoPanel` jest unmounted (bo hook się nigdy nie wyłącza warunkowy).

**Naprawa**: Ogranicz listener tylko do desktopów i gdy panel jest widoczny:
```tsx
useEffect(() => {
  if (isMobile || !selectedComponent) return;
  const handleMouseMove = (e: MouseEvent) => { ... };
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [isMobile, selectedComponent, mouseX, mouseY]);
```

---

### H6. Brak `frameloop="demand"` — ciągłe renderowanie nawet gdy scena jest statyczna
**Plik**: [Scene3D.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/Scene3D.tsx#L307)

**Opis**: `<Canvas>` używa domyślnego `frameloop="always"`, co oznacza ciągłe 60 FPS nawet gdy scena jest absolutnie nieruchoma (żaden fan się nie kręci, żaden tooltip nie jest widoczny, etc.).

**Wpływ**: Na mobile — drastyczne zużycie baterii i ciepła urządzenia. Na desktop — niepotrzebne obciążenie GPU.

**Naprawa**: Niestety, przy stałych animacjach fanów (`useFrame` w PCModel) i CursorLight, `"demand"` wymagałoby `invalidate()` po każdej zmianie stanu. Kompromisowe rozwiązanie:
1. Na desktop: zostaw `"always"` (fany + cursor light wymagają ciągłego renderingu).
2. Na **mobile**: rozważ `frameloop="demand"` + `invalidate()` w `useFrame` fanów — to oszczędzi baterię w momentach bez interakcji.

---

### H7. `DeskScenery` używa `MeshReflectorMaterial` z resolution=1024 — ciężki FPS hit
**Plik**: [DeskScenery.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/Scene3D/DeskScenery.tsx#L34-L46)

**Opis**: `MeshReflectorMaterial` renderuje dodatkowy pass refleksji sceny z resolution=1024. To de facto podwaja ilość renderowanych obiektów w scenie (bo scena jest renderowana z perspektywy lustra).

**Wpływ**: Spadek FPS o ~30–50% na mid-range urządzeniach gdy tryb scenografii jest aktywny. Na mobile prawdopodobnie nie do użycia.

**Naprawa**: 
1. Zmniejsz `resolution` do 512 lub nawet 256.
2. Dodaj flagę `isMobile` i nie renderuj `DeskScenery` w ogóle na mobile (lub zamień na statyczną płaszczyznę).
3. Rozważ `mixStrength={20}` zamiast 40, żeby zmniejszyć impact wizualny braku rozdzielczości.

---

### H8. Brak stabilizacji callbacków w `PCProvider` — powoduje niepotrzebne re-rendery
**Plik**: [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L84-L88)

**Opis**: Funkcje toggle (`toggleXrayMode`, `toggleAirflow`, `toggleLabels`, `toggleRgbEnabled`, `toggleDesk`) są zdefiniowane jako inline arrow functions, tworzone na nowo przy każdym renderze. Powoduje to, że `useMemo` z H4 nie będzie skuteczny bez `useCallback`.

**Wpływ**: Powoduje kaskadowe re-rendery wszystkich komponentów subskrybujących konteksty.

**Naprawa**: Zamień na `useCallback`:
```tsx
const toggleXrayMode = useCallback(() => setXrayMode(prev => !prev), []);
const toggleAirflow = useCallback(() => setShowAirflow(prev => !prev), []);
// ... itd.
```

---

### H9. `XMesh` filtruje dzieci po `child.type` === string — kruche i niekompletne
**Plik**: [XMesh.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/XMesh.tsx#L10-L14)

**Opis**: `XMesh` sprawdza `child.type === 'meshStandardMaterial'` (string), ale R3F pod spodem mapuje typy JSX na klasy Three.js. Porównanie ze stringiem **może się złamać** przy zmianie wersji R3F lub przy użyciu custom komponentów.

**Wpływ**: Potencjalny crash lub niedziałający tryb X-Ray po aktualizacji `@react-three/fiber`.

**Naprawa**: Zamiast filtrowania, używaj bezpośrednio `material` prop na mesh:
```tsx
export const XMesh = ({ children, material, ...props }: any) => {
  const { xrayMode } = usePCSettings();
  return (
    <mesh material={xrayMode ? xrayMaterial : material} {...props}>
      {xrayMode ? React.Children.map(children, child => {
        // Keep only geometry children
        if (!child) return null;
        const isGeometry = typeof child.type === 'string' && child.type.endsWith('Geometry');
        return isGeometry ? child : null;
      }) : children}
    </mesh>
  );
};
```

---

## 🟡 MEDIUM (12 problemów)

---

### M1. Brak `key` na zagnieżdżonych `.map()` — React re-rendery
**Pliki**: [CaseGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CaseGeometry.tsx#L207-L214) (feet), [CasePanels.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CasePanels.tsx#L148-L152) (screws)

**Opis**: Zagnieżdżone `.map()` (np. nóżki obudowy) nie zwracają `React.Fragment` z `key` na zewnętrznym mapowaniu, tylko plain array. React poprawnie identyfikuje elementy wewnętrzne, ale zewnętrzne `.map()` bez wrappera z `key` emituje ostrzeżenia i może powodować nieprawidłową reconcylację.

**Naprawa**: Zawiń zewnętrzne `.map()` w `<React.Fragment key={...}>`.

---

### M2. Niepotrzebne `clone()` + `dispose()` na teksturach (overhead)
**Pliki**: [CPUCoolerGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CPUCoolerGeometry.tsx#L33-L45), [CasePanels.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CasePanels.tsx#L31-L50)

**Opis**: Tekstury są klonowane (`texture.clone()`) aby zmienić `rotation` lub `wrapS`. Klonowanie tworzy nowy obiekt GPU. `dispose()` jest prawidłowo wywoływane, ale lepszym rozwiązaniem jest modyfikacja UV zamiast klonowania tekstury.

**Naprawa**: Zamiast klonować teksturę i obracać ją, zmodyfikuj UV w geometrii:
```tsx
const geo = new BoxGeometry(...);
const uv = geo.attributes.uv;
// Obróć UV dla wybranej twarzy o 90 stopni
```
Lub: twórz dedykowane materiały w `materials.ts` (inicjowane raz) z wymaganymi transformacjami.

---

### M3. Brak `dispose()` dla geometrii generowanych w `MotherboardGeometry`
**Plik**: [MotherboardGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/MotherboardGeometry.tsx)

**Opis**: Komponent tworzy dużą ilość `boxGeometry`, `cylinderGeometry`, `planeGeometry` inline. W R3F deklaratywne geometrie są zarządzane automatycznie, **ale** przy komponentach, które mogą być odmontowane (np. `visible={false}` w X-Ray lub explode), geometrie mogą nie być poprawnie zwolnione.

**Wpływ**: Potencjalny powolny wyciek VRAM, zauważalny na długich sesjach.

**Naprawa**: Dla najcięższych geometrii (extrude, cylinder 32-seg) użyj `useMemo` z ref + `useEffect(() => () => geo.dispose())`.

---

### M4. `playHoverSound()` tworzy nowy oscillator na **każde** najechanie
**Plik**: [audio.ts](file:///d:/Projekty%20AI/PCVerse/src/utils/audio.ts#L13-L32)

**Opis**: Każde `onPointerOver` tworzy nowy `OscillatorNode` + `GainNode`. Na szybkim ruchu myszy to kilkadziesiąt alokacji na sekundę. Oscillatory poprawnie się kończą (`osc.stop`), ale nie są explicitly disconnect'owane — polegamy na GC.

**Wpływ**: GC pressure na mobile, możliwe mikro-janksy audio.

**Naprawa**: Dodaj jawne `osc.disconnect()` w callbacku `onended`:
```tsx
osc.onended = () => { osc.disconnect(); gain.disconnect(); };
```

---

### M5. Brak `loading="lazy"` na obrazach w galerii powiększonej
**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L296-L305)

**Opis**: Powiększony widok galerii (`motion.img`) nie ma `loading="lazy"`. Wszystkie zdjęcia w URL-ach są ładowane eagerly, nawet jeśli użytkownik ich nie widzi.

**Naprawa**: Dodaj `loading="lazy"` do zoomed image, plus `decoding="async"`.

---

### M6. `InfoPanel` dialog `aria-live="polite"` na kontenerze z `role="dialog"` — redundancja
**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L139-L141)

**Opis**: Element z `role="dialog"` + `aria-modal="true"` nie powinien mieć `aria-live="polite"`, bo dialog i tak anonsuje swoją zawartość po otwarciu. `aria-live` na dialogu powoduje podwójne annoucement w screen readerach.

**Naprawa**: Usuń `aria-live="polite"` z kontenera dialogu.

---

### M7. Brak focus trap w modalu instrukcji
**Plik**: [UI.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/UI/UI.tsx#L336-L453)

**Opis**: Modal instrukcji ma `role="dialog"` i `aria-modal="true"`, ale **nie implementuje focus trap**. Użytkownik może Tab-em wyjść poza modal do elementów pod spodem. To naruszenie WCAG 2.1 SC 2.4.3.

**Wpływ**: Screen reader users i keyboard-only users mogą „zgubić się" w interfejsie.

**Naprawa**: Zaimplementuj prosty focus trap za pomocą `useEffect` nasłuchującego `keydown` na `Tab`:
```tsx
useEffect(() => {
  if (!showInstructions) return;
  const dialog = document.querySelector('[role="dialog"]');
  const focusable = dialog?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  // ... trap focus between first and last focusable
}, [showInstructions]);
```

---

### M8. Brak atrybutu `id="ui-controls"` i `id="info-panel"` dla skip links
**Plik**: [App.tsx](file:///d:/Projekty%20AI/PCVerse/src/App.tsx#L45-L46)

**Opis**: Skip linki (`href="#ui-controls"` i `href="#info-panel"`) istnieją, ale **żaden element** w aplikacji nie ma tych `id`. Kliknięcie w skip link nie przeniesie fokusu nigdzie.

**Wpływ**: Naruszenie WCAG 2.4.1 — skip linki są martwe.

**Naprawa**: Dodaj `id="ui-controls"` na głównym divie `UI` i `id="info-panel"` na kontenerze `InfoPanel`.

---

### M9. `version: "0.0.0"` w `package.json`
**Plik**: [package.json](file:///d:/Projekty%20AI/PCVerse/package.json#L4)

**Opis**: Wersja nie jest aktualizowana. Utrudnia debugowanie, cache busting CDN, i identyfikację buildu.

**Naprawa**: Ustaw sensowną wersję (np. `"1.0.0-rc.1"`) i aktualizuj ją przy kolejnych etapach.

---

### M10. Brak `<link rel="manifest">` i ikon PWA
**Plik**: [index.html](file:///d:/Projekty%20AI/PCVerse/index.html)

**Opis**: Brak `manifest.json` i ikon PWA (apple-touch-icon, favicon PNG 192/512). Aplikacja nie może być zainstalowana jako PWA, co obniża scoring Lighthouse.

**Naprawa**: Dodaj `manifest.json` z nazwą, ikonami, `display: "standalone"`, `theme_color` i `background_color`.

---

### M11. `chunkSizeWarningLimit: 1600` maskuje potencjalnie zbyt duże chunki
**Plik**: [vite.config.ts](file:///d:/Projekty%20AI/PCVerse/vite.config.ts#L13)

**Opis**: Limit ostrzeżeń podniesiony do 1600 kB. `vendor-three` i `vendor-r3f` łącznie mogą przekraczać 1 MB, co jest dużo. Brak gzip/brotli kompresji konfiguracji.

**Naprawa**: 
1. Rozważ dodanie `vite-plugin-compression` do build pipeline.
2. Sprawdź rozmiar chunków po buildzie i zidentyfikuj oportuności do dalszego splittowania.

---

### M12. `ComponentMesh` memo comparator jest zbyt restrykcyjny
**Plik**: [PCModel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/PCModel.tsx#L250)

**Opis**: `(prevProps, nextProps) => prevProps.data.id === nextProps.data.id && prevProps.isMobile === nextProps.isMobile` — to ignoruje zmianę `data` samego obiektu (np. gdyby `pcComponents` były dynamicznie modyfikowane). W obecnym kodzie `data` jest statyczne, ale design jest kruchy.

**Naprawa**: Dodaj `prevProps.data === nextProps.data` (referencyjna równość), co jest bardziej precyzyjne.

---

## 🟢 LOW (8 problemów)

---

### L1. Deprecated `usePC` hook — usunięcie ostrzeżenia
**Plik**: [usePC.tsx](file:///d:/Projekty%20AI/PCVerse/src/hooks/usePC.tsx#L143-L151)

**Opis**: `usePC()` jest oznaczony `@deprecated`, ale nadal eksportowany i dostępny.

**Naprawa**: Po potwierdzeniu, że żaden plik go nie importuje — usuń hook i export.

---

### L2. `CaseGeometry` canvas nie zwalnia pamięci po generowaniu tekstur mesh
**Plik**: [CaseGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/CaseGeometry.tsx#L64-L122)

**Opis**: `meshTexture` i `backMeshTexture` tworzą canvasy, ale nie zerują ich `width/height` po konwersji do `CanvasTexture` (co było naprawione w Etapie 10 dla podobnego kodu). `frontMeshTexture` klonuje `backMeshTexture`, ale backMeshTexture.clone() nie jest dispose'owany oddzielnie.

**Naprawa**: Dodaj `canvas.width = 0; canvas.height = 0;` po utworzeniu `CanvasTexture`.

---

### L3. Niekonsekwentne użycie `materials.goldMetal` vs inline `meshStandardMaterial` z `color="#d4af37"`
**Pliki**: [MotherboardGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/MotherboardGeometry.tsx#L295) (battery clip), [MotherboardGeometry.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/PCModel/geometries/MotherboardGeometry.tsx#L440) (audio jacks)

**Opis**: Kilka instancji wciąż używa inline `<meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />` zamiast współdzielonego `materials.goldMetal`. Każde takie użycie tworzy nowy material.

**Naprawa**: Zamień na `<primitive object={materials.goldMetal} attach="material" />`.

---

### L4. Brak opisu `alt` na favicon / OG images
**Plik**: [index.html](file:///d:/Projekty%20AI/PCVerse/index.html#L18)

**Opis**: OG image wskazuje na `https://pcverse.app/images/og-cover.png` — prawdopodobnie nie istnieje (nie ma tego w `/public/images/`).

**Naprawa**: Wygeneruj og-cover.png i umieść w `public/images/`. Zaktualizuj URL na relatywny z `import.meta.env.BASE_URL`.

---

### L5. `hero.png` i `react.svg`, `vite.svg` w assets — nieużywane
**Plik**: [src/assets/](file:///d:/Projekty%20AI/PCVerse/src/assets)

**Opis**: `hero.png`, `react.svg`, `vite.svg` to artefakty z szablonu Vite. Nie są importowane nigdzie w kodzie.

**Naprawa**: Usuń nieużywane pliki, zmniejszając rozmiar repozytorium.

---

### L6. Brak `<meta name="theme-color">` w HTML
**Plik**: [index.html](file:///d:/Projekty%20AI/PCVerse/index.html)

**Opis**: `theme-color` kontroluje kolor paska adresu na mobile. Brak tego metataga = domyślny biały pasek na ciemnym tle aplikacji (vizualny clash).

**Naprawa**: Dodaj `<meta name="theme-color" content="#0f0a1c">`.

---

### L7. `getImageUrl` nie obsługuje `import.meta.env.BASE_URL` z trailing slash
**Plik**: [InfoPanel.tsx](file:///d:/Projekty%20AI/PCVerse/src/components/InfoPanel/InfoPanel.tsx#L80-L84)

**Opis**: `getImageUrl` konkatenuje `baseUrl` + `url.replace(/^\//, '')`. Jeśli `BASE_URL = '/pcverse/'`, a url = `/images/foo.webp`, wynik to `/pcverse/images/foo.webp` — poprawne. Ale jeśli `BASE_URL = '/pcverse'` (bez trailing slash), wynik to `/pcverseimages/foo.webp` — błędny.

**Naprawa**: Upewnij się, że `baseUrl` ma trailing slash: `const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');`

---

### L8. Brak obsługi `prefers-color-scheme` na stronie WebGL error
**Plik**: [App.tsx](file:///d:/Projekty%20AI/PCVerse/src/App.tsx#L25-L37)

**Opis**: Strona „Brak Obsługi WebGL" ma hardcoded ciemny motyw, co jest OK, ale brak `prefers-color-scheme` oznacza, że użytkownicy preferujący jasny motyw dostaną ciemne tło.

**Naprawa**: Niski priorytet — ten widok dotyczy marginalnego odsetka użytkowników. Można zignorować lub dodać media query.

---

## Plan Weryfikacji

### Testy Automatyczne
```bash
npm run lint     # Weryfikacja poprawek ESLint
npm run build    # Weryfikacja produkcyjnego buildu (chunki, rozmiary)
```

### Weryfikacja Manualna
1. **Memory profiling**: Otwórz Chrome DevTools → Memory → Heap snapshot → Zmień kolor RGB 10 razy → Porównaj snapshoty (szukaj wycieku MeshStandardMaterial).
2. **Performance profiling**: React DevTools → Profiler → Kliknij zmianę RGB → Sprawdź, czy tylko związane komponenty się re-renderują.
3. **Mobile testing**: Sprawdź na fizycznym telefonie — brak flash layout, brak spadku FPS, poprawne skip linki.
4. **Screen reader**: Przetestuj z NVDA/VoiceOver — focus trap w modalu, skip linki działające, brak podwójnych ogłoszeń.
5. **Lighthouse audit**: Uruchom dla mobile + desktop, sprawdź scoring SEO/Accessibility/Performance.

---

## Open Questions

> [!IMPORTANT]
> 1. **Migracja stanu do zustand/jotai**: Czy jesteś otwarty na zamianę React Context na zustand? To najskuteczniejsze rozwiązanie C3 i H4, ale wymaga refaktoru importów we wszystkich komponentach.
> 2. **Usunięcie `usePC()` deprecated hooka**: Czy mogę go bezpiecznie usunąć, czy jest używany w jakimś zewnętrznym kodzie?
> 3. **PWA manifest**: Czy chcesz dodać wsparcie PWA (offline, instalacja na home screen)?
