# PCVerse

Interaktywny, edukacyjny przewodnik 3D po komponentach komputera PC, zbudowany przy użyciu technologii React, Vite, Three.js, React Three Fiber oraz Tailwind CSS.

## Funkcje

- **Interaktywna scena 3D**: Stylizowany trójwymiarowy model komputera z klikalnymi podzespołami.
- **Widok rozłożony (Exploded View)**: Animacja rozdzielająca wszystkie części dla lepszej widoczności.
- **Kontrola kamery**: Swobodne obracanie wokół PC oraz automatyczne przybliżanie po kliknięciu wybranego komponentu.
- **Panel edukacyjny**: Szczegółowe informacje o roli każdego elementu, ciekawostki oraz ich wpływ na wydajność komputera.
- **Tryb Budowy**: Krok po kroku prowadzona sekwencja składania komputera.
- **Tryb Hologramu (X-Ray) i symulacja airflow**: Wizualizacja wnętrza obudowy i przepływu powietrza.
- **W pełni responsywny interfejs**: Dedykowany układ graficzny dopasowany do urządzeń mobilnych i desktopowych.
- **Adaptacyjna jakość grafiki**: Automatyczne dopasowanie efektów do możliwości urządzenia (szczegóły niżej).

## Wymagania sprzętowe i przeglądarkowe

| Wymaganie | Minimum | Zalecane |
| --- | --- | --- |
| Grafika | **WebGL 2** (obowiązkowo) | Dedykowane GPU lub nowoczesne iGPU |
| Przeglądarka | Chrome/Edge 56+, Firefox 51+, Safari 15+ | Aktualna wersja |
| CPU | 4 wątki logiczne | 8+ wątków |
| RAM | 4 GB | 8+ GB |
| JavaScript | Wymagany | — |

**WebGL 2 jest twardym wymaganiem** — Three.js porzucił wsparcie dla WebGL 1 w wydaniu r163.
Aplikacja wykrywa trzy sytuacje jeszcze przed startem Reacta (w `index.html`) i odpowiednio informuje użytkownika:

1. **WebGL 2 dostępne** — scena startuje normalnie.
2. **Tylko WebGL 1** — komunikat o konieczności aktualizacji przeglądarki lub sterowników.
3. **Brak WebGL** — komunikat o braku wsparcia.

W przypadkach 2 i 3 zamiast sceny wyświetlany jest **tekstowy przewodnik zastępczy** po podzespołach,
dzięki czemu strona zachowuje wartość edukacyjną i pozostaje czytelna dla czytników ekranu oraz robotów
indeksujących. Utrata kontekstu WebGL w trakcie działania (`webglcontextlost`, typowa przy presji pamięci
na słabych GPU) jest przechwytywana i kończy się czytelnym komunikatem z przyciskiem odświeżenia,
zamiast zamrożonym czarnym ekranem.

## Adaptacyjna jakość grafiki

Jakość renderowania jest sterowana jednym z trzech poziomów (`low` / `medium` / `high`), wyznaczanym
dwuetapowo. Poziom może się wyłącznie **obniżać** — przywracanie wyższego przy wahaniach FPS
powodowałoby oscylację, bo każda zmiana `dpr` wymusza realokację bufora renderu.

### Etap 1 — detekcja przed pierwszą klatką

`src/utils/deviceCapabilities.ts` tworzy jednorazową, natychmiast zwalnianą sondę WebGL i sprawdza:

- wsparcie **WebGL 2 / WebGL 1 / brak**,
- nazwę GPU przez `WEBGL_debug_renderer_info` (z fallbackiem na `gl.getParameter(gl.RENDERER)`) —
  rozpoznaje renderery programowe (SwiftShader, llvmpipe), układy mobilne (Adreno, Mali, PowerVR) i zintegrowane,
- `MAX_TEXTURE_SIZE`,
- `navigator.hardwareConcurrency`,
- `navigator.deviceMemory` (tylko silniki Chromium),
- `navigator.connection.saveData` oraz `(pointer: coarse)`.

> `deviceMemory` bierze udział wyłącznie w kwalifikacji do poziomu `low` (≤ 4 GB). Specyfikacja
> kwantyzuje tę wartość i ucina ją na 8 GB, więc warunek „≤ 8” byłby spełniony na praktycznie każdym
> desktopie i degradowałby jakość bez powodu.

### Etap 2 — pomiar FPS w runtime

`src/components/Scene3D/AdaptiveQuality.tsx` mierzy realną liczbę klatek w oknach czasowych:

- pierwsze 2 s są pomijane (kompilacja shaderów i upload tekstur zawyżają frame time),
- przez kolejne ~8 s próbkowanie odbywa się co 1 s, potem co 5 s jako zabezpieczenie przed throttlingiem,
- **< 20 FPS** → natychmiastowe zejście na poziom `low`,
- **< 35 FPS** w dwóch kolejnych oknach → obniżenie o jeden poziom,
- pojedyncze duże `delta` (powrót z zakładki w tle) unieważnia okno pomiarowe.

Pomiar jest aktywny wyłącznie przy `frameloop="always"`. Na urządzeniach mobilnych pętla działa
w trybie `demand`, gdzie liczba klatek odzwierciedla aktywność użytkownika, a nie wydajność sprzętu.

### Co zmienia się na poszczególnych poziomach

| Ustawienie | `high` | `medium` | `low` |
| --- | --- | --- | --- |
| `dpr` | `[1, 2]` | `[1, 1.5]` | `1` |
| `powerPreference` | `high-performance` | `high-performance` | `low-power` |
| Post-processing | pełny | Bloom + Vignette | wyłączony |
| Antyaliasing (SMAA) | tak | nie | nie |
| Ambient Occlusion (N8AO) | tak | nie | nie |
| Depth of Field | tak | nie | nie |
| Aberracja chromatyczna | tak | nie | nie |
| Sparkles / Stars | 500 / 3000 | 200 / 1200 | wyłączone |
| Latarka kursora | tak | tak | nie |
| Scenografia biurka | tak | tak | nie |
| Rozdzielczość odbić podłogi | 512 | 256 | brak odbić |
| Cząsteczki airflow (LOD) | 100% | 60% | 35% |
| Model oświetlenia | pełny | pełny | uproszczony (`hemisphereLight`) |

Na urządzeniach mobilnych `dpr` jest dodatkowo twardo ograniczone do `1` niezależnie od poziomu —
ekrany o gęstości 3× potrafią potroić liczbę renderowanych pikseli.

Aplikacja respektuje również `prefers-reduced-motion`: wyłącza unoszenie komponentów w widoku
rozłożonym, cząsteczki tła i airflow, animacje plakatów oraz skraca czasy wygładzania kamery.

## Uruchomienie lokalne

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom serwer deweloperski:

   ```bash
   npm run dev
   ```

3. Otwórz adres wyświetlony w terminalu (domyślnie `http://localhost:5173/pcverse/`).

W trybie deweloperskim dostępna jest funkcja diagnostyczna `window.__pcverseQuality()`, zwracająca
wykryte możliwości urządzenia, aktualny poziom jakości i ostatni zmierzony FPS.

## Dostępne skrypty

| Skrypt | Opis |
| --- | --- |
| `npm run dev` | Serwer deweloperski Vite z HMR. |
| `npm run build` | Sprawdzenie typów (`tsc -b`) i produkcyjny build do `dist/`. |
| `npm run lint` | ESLint dla całego repozytorium. |
| `npm run preview` | Lokalny podgląd zbudowanej wersji produkcyjnej. |

W repozytorium nie ma zestawu testów automatycznych — nie istnieje skrypt `npm test`.
Bramką jakości w CI są `npm run lint` i `npm run build`.

## Struktura projektu

```
PCVerse/
├─ .github/workflows/deploy.yml   # CI: lint → build → deploy na GitHub Pages
├─ public/                        # Zasoby serwowane bez przetwarzania
│  ├─ environments/               # Mapy HDRi (1k) dla presetów otoczenia
│  ├─ images/components/          # Zdjęcia podzespołów w panelu edukacyjnym
│  └─ textures/posters/           # Tekstury scenografii biurka
├─ src/
│  ├─ assets/                     # Tekstury modelu 3D (bundlowane przez Vite)
│  ├─ components/
│  │  ├─ EasterEgg/               # Terminal Matrix
│  │  ├─ InfoPanel/               # Panel edukacyjny wybranego podzespołu
│  │  ├─ LoadingScreen/           # Ekran ładowania zasobów
│  │  ├─ PCModel/                 # Model PC: geometrie, materiały, kable, wentylatory
│  │  │  └─ geometries/           # Proceduralne geometrie poszczególnych podzespołów
│  │  ├─ Scene3D/                 # Canvas, oświetlenie, scenografia, adaptacyjna jakość
│  │  └─ UI/                      # Pasek sterowania, tryb budowy, dialogi
│  ├─ data/components.ts          # Dane edukacyjne i pozycje podzespołów
│  ├─ hooks/                      # usePC, useIsMobile, useReducedMotion
│  ├─ store/                      # Magazyny Zustand: tryb budowy, jakość grafiki
│  └─ utils/                      # Detekcja sprzętu, syntezator dźwięków
├─ 3D_DESIGN_GUIDELINES.md        # Zasady modelowania sceny
└─ CHANGELOG.md                   # Dziennik zmian
```

## Wdrożenie

Push na gałąź `main` uruchamia workflow GitHub Actions, który wykonuje `npm ci`, `npm run lint`,
`npm run build` i publikuje katalog `dist/` na GitHub Pages. Aplikacja jest serwowana spod ścieżki
`/pcverse/` (`base` w `vite.config.ts`).
