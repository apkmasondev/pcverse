# Dziennik Zmian (Changelog)

## Etap 20 - Wielki Audyt Kodowy i Dostępność 🚀

### Poprawione / Zoptymalizowane
- **Zarządzanie Wydajnością (Efekty Cząsteczkowe)**: Wprowadzono w głównym interfejsie nową opcję włączania i wyłączania efektów cząsteczkowych (np. "kosmicznego pyłu"). Zgodnie z rygorystycznymi wytycznymi optymalizacji, efekty przestrzenne `<Sparkles>` oraz `<Stars>` są teraz domyślnie wyłączone, co gwarantuje najwyższą płynność (FPS) na najsłabszych urządzeniach i eliminuje nadmierny fill rate.
- **Zarządzanie Pamięcią i VRAM**: Wyeliminowano krytyczne wycieki pamięci materiałów w R3F. Zabezpieczono komponenty `MotherboardGeometry`, `GPUGeometry`, `CaseGeometry` oraz `CPUCoolerGeometry` hookiem `useMemo` dla współdzielonych referencji i wdrożono wymuszone czyszczenie `dispose()` dla dynamicznie generowanej siatki na obiekcie 2D Canvas.
- **Audio Memory Leaks**: Poprawiono architekturę modułu dźwiękowego. Dźwięki hover (najechania), kliknięcia oraz dekonstrukcji precyzyjnie odłączają teraz swoje węzły (`oscillator.disconnect()`) po zakończeniu odtwarzania, likwidując problem "osieroconych" procesów audio w tle.
- **Wydajność Renderingu**: Przebudowano logikę hooka `useIsMobile`, eliminując nadmiarowe aktualizacje stanu (Layout Shifts) powodujące kosztowne przebudowy głównego drzewa komponentów Reacta. Dodano również adaptacyjne zarządzanie pętlą `frameloop` ("demand" vs "always") dla urządzeń mobilnych.
- **Dostępność i Standardy WCAG**: 
  - Wdrożono rygorystyczny "Focus Trap" na modalu z instrukcjami, co zatrzymuje obieg klawisza `Tab` w obrębie panelu.
  - Naprawiono ukryte linki "Skip to content" (dodano identyfikatory `#ui-controls` i `#info-panel`), ułatwiając nawigację czytnikom ekranowym i użytkownikom klawiatury.
- **Optymalizacja Reacta**: Oczyszczono konsolę z komunikatów ostrzegawczych (React Warnings) używając `Array.flatMap()` zamiast podwójnie zagnieżdżonego `.map()` przy generowaniu dziesiątek portów i ram w obudowie.
- **Konfiguracja PWA i SEO**: Stworzono oficjalny plik `manifest.json`, wdrożono tagi `<meta name="theme-color">` dopasowane do trybu `prefers-color-scheme`, zoptymalizowano `chunkSizeWarningLimit` w narzędziu Vite oraz wygenerowano za pomocą AI dedykowaną ilustrację do kart Open Graph (`og-cover.png`).

## Etap 19 - Cyber-Scenografia i Plakaty 🖼️

### Dodane / Poprawione
- **Fotorealistyczne Cyber-Biurko**: Zastąpiono starą siatkę (Grid) fizycznym blatem z zaawansowanym materiałem `MeshReflectorMaterial`. Blat precyzyjnie odbija spód komputera, dodając ogromnej głębi i realizmu godnego silników klasy AAA.
- **Optymalizacja Cieni (`ContactShadows`)**: Wdrożono "wypiekanie" (baking) cieni uziemiających za pomocą flagi `frames={1}`. Usunęło to błąd z "ciągnącymi się smugami cienia" podczas animacji rozkładania komputera na części (Explode) i drastycznie podniosło wydajność aplikacji (FPS).
- **Galeria Plakatów PC**: Wzbogacono tło wirtualnego pokoju o potężne, lewitujące plakaty tematyczne. Skrypty graficzne AI wygenerowały obrazy: *Wojna CPU (Intel vs AMD)*, *Wojna OS (Windows vs Linux)* oraz klasyczny koszmar *Don't forget the I/O Shield*.
- **Bezstratna Kompresja WEBP**: Opracowano i wdrożono skrypt (Python + Pillow) automatycznie kompresujący ciężkie plakaty z rozszerzenia PNG do nowoczesnego, lekkiego formatu `.webp` – redukując ich wagę o ponad 80% (krytyczne dla czasu ładowania strony).

## Etap 18 - Audyt, Optymalizacja i Stabilizacja Wydania (Release Candidate)

### Dodane / Poprawione
- **Eliminacja Wycieków Pamięci (VRAM)**: Wprowadzono skrupulatne czyszczenie zasobów (`dispose()`) dla ręcznie klonowanych tekstur w obudowie oraz nowo tworzonych instancji materiałów (Bracket), zabezpieczając sprzęt mobilny przed przepełnieniem pamięci karty graficznej.
- **Koniec "Zombie Oscylatorów" Audio**: Przebudowano logikę sterującą odtwarzaniem ambientowego szumu (Airflow). Twarde rozłączanie (`disconnect`) i czyszczenie buforów wyeliminowało błąd, który powodował nakładanie się dźwięków w nieskończoność przy szybkim przeklikiwaniu przycisków.
- **Odciążenie GPU (Współdzielenie Materiałów)**: Usunięto setki zduplikowanych deklaracji materiałów "w locie" (np. RAM, sloty PCIe, kable). Przebudowano je tak, aby korzystały ze scentralizowanej bazy współdzielonych instancji (`materials.ts`), redukując liczbę shaderów na karcie graficznej.
- **Zrównoważony Postprocessing**: Poprawiono nasłuchiwacz `PerformanceMonitor` tak, by przy spadkach płynności deaktywował jedynie najcięższe efekty (Głębia Ostrości `DepthOfField` oraz Globalne Cieniowanie `N8AO`). Dzięki temu aplikacja działa płynnie, ale zachowuje swój flagowy styl (np. urokliwy Bloom).
- **Zgodność ze Standardami WCAG (Dostępność)**: Dokończono proces wdrażania dostępności: ukryto ikonki SVG dla czytników ekranowych (`aria-hidden`), dodano nawigację klawiaturową typu *skip link*, podbito kontrast pomniejszych opisów tekstowych na ciemnym tle oraz w pełni spolszczono komunikaty rzucane przez `GlobalErrorBoundary` w przypadku awarii renderera.
- **Etykiety Informacyjne (HUD)**: Zrekonstruowano algorytm pozycjonowania "dymków" z nazwami komponentów. Etykiety nie uciekają już do wnętrza 3D, a punkty celownicze (kropki) i linie łączące zawsze celują precyzyjnie w górną krawędź opisywanego sprzętu (np. CPU Cooler), niezależnie od kąta kamery.
## Etap 17 - Przebudowa UI i Nawigacji

### Dodane / Poprawione
- **Nowy boczny panel nawigacyjny**: Wdrożono opcję rozszerzającego się paska bocznego (Sidebar), który grupuje wszystkie narzędzia i przyciski w jednym eleganckim miejscu z lewej strony ekranu. Poprawiono zachowanie wyskakujących menu (RGB i HDRi) na urządzeniach mobilnych, zapobiegając ucinaniu interfejsu (menu wysuwa się płynnie obok ikon, przykrywając tekst na małych ekranach).
- **Zoptymalizowana Modalna Instrukcja**: Przebudowano okno instrukcji wprowadzając podział na mysz/klawiaturę i gesty mobilne. Usunięto błąd ucinania okna na małych ekranach (brak przewijania) poprzez wymuszenie `max-h-[90vh]` oraz `overflow-y-auto`. Zaktualizowano wszystkie opisy narzędzi dla pełnej spójności (m.in. tryb Hologramu).
- **Integracja Logo**: Wbudowano logo PCVerse bezpośrednio w nagłówek rozsuwanego panelu bocznego, ze zaktualizowanym gradientem dla tekstu dopasowanym do motywu interfejsu.
- **Odświeżona paleta RGB**: Zdefiniowano na nowo paletę barw Neon/Cyber, dostarczając 8 maksymalnie wyrazistych i odseparowanych od siebie kolorów. Przebudowano układ menu palety tworząc spójną siatkę 3x3 dla wszystkich kolorów (optymalizacja dla wersji mobilnych).
- **Tekstura paneli PCIe (Śledzie)**: Rozwiązano błąd z odbiciem lustrzanym na tylnych śledziach obudowy poprzez odseparowanie (klonowanie) tekstury w kodzie - lustrzane odbicie ma zastosowanie tylko dla twarzy wewnątrz obudowy.
- **Wizualizacje 3D (Z-fighting)**: Zlikwidowano usterki wizualne (tzw. Z-fighting) pojawiające się na styku slotów PCIe na płycie głównej poprzez obniżenie wysokości czarnego wypełnienia o 0.01 jednostki. Zoptymalizowano wymiary styku karty graficznej i tylnego panelu I/O aby zapobiegać kolizji brył 3D.
- **Ulepszone wentylatory (X-Ray)**: Zrekonstruowano modele fizycznych śmigieł wentylatorów (obudowy i coolera CPU) w trybie prześwietlenia (X-Ray). Zamiast surowego układu z dwóch krzyżujących się belek, renderowana jest płynna, 8-ramienna gwiazda wokół zaokrąglonego huba, dopasowując realizm do pozostałych komponentów.


## Etap 16 - Audyt i Ostatnie Szlify Przed Wersją Finalną

### Poprawione / Zoptymalizowane
- **Efekty Wolumetryczne i Cząsteczkowe (Zgodne z Audytem)**: 
  - Wdrożono mgłę środowiskową (`<fog>`), która nadaje głębi układowi współrzędnych 3D (obiekty znikające na krawędzi sceny) bez spadków wydajności.
  - Zaktualizowano Cząsteczki (`<Sparkles>`) na dynamiczne "cyber-pyłki", dopasowujące barwy (miedziane, cyjan, szare) do wybranego presetu oświetlenia. Efekt ten, za pomocą instancjonowania sprzętowego, pozostaje ukryty na urządzeniach mobilnych oszczędzając baterię.
- **Dynamiczna Siatka (Grid)**: Wzbogacono tło środowiska 3D o potężną, zanikającą siatkę (Grid oparty na shaderach z biblioteki `drei`). Kolorystyka siatki dynamicznie adaptuje się do wybranego otoczenia (`envPreset`), oferując spójny, profesjonalny wygląd dla każdego trybu (np. miedziane barwy dla Świtu, neonowo-niebieskie dla Cyberpunku).
- **Materiały Kabli i X-Ray Mode**: Refaktoryzacja `CableGeometry` zgodnie z wytycznymi projektu (3D_DESIGN_GUIDELINES.md). Usunięto inline'owe definicje kolorów i modyfikatory przezroczystości, zastępując je globalnymi, reużywalnymi materiałami (`redCable`, `blackCable` w `materials.ts`). W trybie X-Ray kable poprawnie współdzielą wireframe'owy `xrayMaterial` zamiast błędnie korzystać z wbudowanego `opacity`.
- **Tekstury Chłodzenia CPU**: Wdrożono autorskie tekstury dla chłodzenia procesora (`copper_plate.webp` dla podstawy stykowej procesora oraz `radiator_plate.webp` na górze i dole głównego ożebrowania) co drastycznie podnosi realizm chłodzenia w trybie RGB.
- **Osłony Portów PCIe (Śledzie)**: Zastąpiono jednolity materiał zaślepek na wygenerowaną teksturę `bracket.webp`. Dodano logikę odwracania tekstury (Lustrzane Odbicie) po wewnętrznej stronie obudowy za pomocą mapowania Array w `BoxGeometry`.
- **Zarządzanie Pamięcią (VRAM)**: Dodano wymuszony `dispose()` dla ręcznie klonowanych tekstur w wentylatorach. Likwiduje to wyciek pamięci karty graficznej występujący przy każdej zmianie trybu RGB lub X-Ray.
- **Optymalizacja Materiałów**: Znacznie zredukowano ilość unikalnych instancji `meshStandardMaterial` poprzez współdzielenie referencji do predefiniowanych materiałów (np. `darkMetal`). Skutkuje to mniejszym narzutem na procesor.
- **Preloading Tekstur**: Wdrożono funkcję wstępnego ładowania (`useTexture.preload()`) dla tekstur podświetlanych wentylatorów RGB, całkowicie eliminując wizualne zacięcia ("pop-in") podczas pierwszej zmiany kolorów.
- **Wycieki pamięci w React (Timeouts)**: Zabezpieczono asynchroniczne funkcje czasu (setTimeout) odpowiedzialne za animację rozkładania (Teardown). Chroni to stan aplikacji przed błędem w przypadku szybkiego zamknięcia podglądu.
- **Cykl życia silnika Audio**: Naprawiono niekontrolowane pozostawanie w pamięci i odtwarzanie dźwięków w tle po wyłączeniu nawiewu (odseparowanie oscylatorów). 
- **Zabezpieczenie fokusu klawiatury**: Modale zostały w pełni dostosowane do standardów WCAG poprzez wymuszenie izolacji (focus trap za pomocą `aria-modal="true"` i `role="dialog"`).
- **Dostępność (Wrażliwość na ruch)**: Zintegrowano obsługę `prefers-reduced-motion`. Użytkownicy z włączonym ograniczeniem ruchu w systemie (Windows/macOS) nie widzą już animacji lewitacji podzespołów ani cząsteczek powietrza (Airflow).
- **Responsywność na najmniejszych ekranach**: Dodano elastyczne ograniczenia szerokości (`max-width: calc(100vw - 4.5rem)`) dla wyskakujących okien (Flyout) w menu RGB i środowiska, co zapobiega ucinaniu interfejsu na bardzo wąskich urządzeniach (np. stare modele iPhone).
- **Architektura, Wydajność i Rozmiar Builda**:
  - Rozbito gigantyczny plik `CaseGeometry.tsx` wyodrębniając z niego panele szklane i boczne do nowego pliku `CasePanels.tsx` w celu poprawy czytelności kodu.
  - Zoptymalizowano proces pakowania (bundlowania) Vite/Rollup - główny plik vendor o wadze 1.5MB został rozbity na mniejsze, precyzyjne paczki (`vendor-r3f`, `vendor-postprocessing`, `vendor-motion`, `vendor-core`). Znacznie przyspieszy to ładowanie aplikacji i efektywność cache'owania przeglądarki.
  - Zastosowano globalne optymalizacje importów (Tree-Shaking): usunięto wszystkie instrukcje `import * as THREE` na rzecz precyzyjnych importów nazwanych we wszystkich komponentach geometrii. Zmniejszy to końcowy rozmiar biblioteki 3D w projekcie.
  - Oczyszczono `CaseGeometry.tsx` i `CasePanels.tsx` z materiałów definiowanych w locie (inline) i przeniesiono je do globalnego słownika `materials.ts` (lepsza reużywalność i mniejsze obciążenie pamięci).
  - W `PCModel.tsx` zamieniono dopasowywanie komponentów po fragmencie nazwy na sztywną, bezpieczną mapę `GEOMETRY_REGISTRY`.
  - Wprowadzono pełną ochronę przed re-renderami dla głównej pętli lewitacji (zastosowano `React.memo` na `ComponentMesh`).
  - Rozwiązano błędy TypeScript w rejestrze komponentów poprzez dedykowany interfejs `GeometryProps`.
  - Usunięto błąd TypeScript w postprocessingu (reverting do obejścia typów dla `DepthOfField` w `EffectComposer`).
- **Użyteczność Galerii Zdjęć**: Kropki nawigacyjne w podglądzie zdjęć stały się pełnoprawnymi, interaktywnymi i opisanymi przyciskami. Wyświetlane zdjęcia doczekały się poprawnego atrybutu `alt`.
- **Interfejs Użytkownika (UI)**:
  - Wdrożono opóźnienie pojawiania się opisów (tooltips), co usunęło chaotyczne migotanie przy szybkim ruchu myszką.
  - Do Panelu Informacyjnego dodano elegancki, dolny wskaźnik przewijania (gradient scroll indicator) poprawiający czytelność długich opisów.
  - Usunięto nieaktywne, zduplikowane odnośniki z ukrytej nawigacji.
  - Naprawiono warunkowe renderowanie postprocessingu (Głębia Ostrości).
- **Utrzymanie Kodu**: Oznaczono jako przestarzały (`@deprecated`) ogólny hak `usePC` na korzyść rozdzielonych stanów (`usePCSelection` / `usePCSettings`) wraz ze stosownym ostrzeżeniem środowiskowym.
## Etap 15 - Audyt Optymalizacji, UX i Fizyki

### Dodane / Poprawione
- **Fizyka obrotu wentylatorów**: Zoptymalizowano system obrotu wirtualnych śmigieł. Wyeliminowano problem nieprawidłowej osi obrotu zasilacza (PSU) oraz karty graficznej (GPU) po restrukturyzacji pętli `useFrame`. Stworzono dedykowane sety `fanBladesRefsY` oraz `fanBladesRefsZ` dla uniknięcia opóźnień asynchronicznych w React Three Fiber.
- **Optymalizacja renderowania środowiska**: Zoptymalizowano proces przypisywania mapy otoczenia (`envMap`) poprzez jej pre-kalkulację przed renderowaniem głównego drzewa komponentów, stabilizując pętlę renderowania.
- **Dostępność i SEO (WCAG)**: Dodano unikalne i deskryptywne atrybuty `aria-label` do wszystkich przycisków interfejsu (m.in. nawigacji, zamykania instrukcji). Zwiększono kontrast kolorystyczny podrzędnych tekstów w interfejsie.
- **Responsywność mobilna**: Skorygowano nachodzące na siebie warstwy interfejsu na bardzo wąskich ekranach smartfonów (zmiana pozycji wysuwanego menu z `left-12` na `left-14`), zapobiegając ucięciu interfejsu.
- **Stabilność etykiet 3D**: Rozwiązano problem niespodziewanie znikających dymków (tooltips) z nazwami komponentów podczas swobodnego obracania kamerą po rozłożeniu komputera na części pierwsze.
- **Korekta nóżek obudowy**: Przesunięto gumowe stopki na osi Y, eliminując wizualną szparę między nimi a dolnym panelem (podłogą) po ostatnich zmianach wysokości komponentów.
- **Wyeliminowanie przenikania siatki zasilacza (Z-Fighting/Clipping)**: Docięto i przesunięto siatkę wywiewną (mesh) na panelu bocznym tak, aby idealnie przylegała do wycięcia na zasilacz, zapobiegając wychodzeniu jej poniżej rantu obudowy.
- **Poprawa wycięcia na śledzie PCIe**: Wydłużono otwór na tylnym panelu obudowy, by odsłonić wszystkie 6 wygenerowanych zaślepek kart rozszerzeń, dopasowując geometrię do tekstury.
- **Rozszerzona paleta RGB**: Dodano siódmy, intensywny kolor podświetlenia (Pink) do opcji personalizacji UI, potęgujący immersję w klimacie cyberpunk.
- **Aktualizacja tras kabli (Cable Management)**: Wygenerowano drugi przewód zasilający 8-pin PCIe dla masywnej karty graficznej. Zoptymalizowano punkty kontrolne krzywych Beziera dla pozostałych przewodów, poprawiając ich ułożenie w przestrzeni 3D.
- **Uzupełnienie instrukcji obsługi UI**: Dodano brakującą informację o obsłudze przybliżania (Zoom) za pomocą scrolla myszki do modala z legendą interfejsu.
- **Dynamiczne teksturowanie wentylatorów RGB**: Wdrożono system w locie podmieniający tekstury frontu wentylatorów chłodnicy AIO oraz obudowy w momencie aktywacji podświetlenia RGB w interfejsie. Rozwiązanie oparto na optymalnym bindowaniu tekstur z użyciem globalnego hooka bez dodatkowego narzutu na Draw Calls.

## Etap 14 - Detale konstrukcyjne (Złącza i krawędzie)

### Dodane
- **Tekstura spodu karty graficznej**: Zintegrowano nową grafikę `gpu_bottom.webp` na krawędzi karty graficznej przylegającej do złącza PCIe (płyty głównej).
- **Tekstura portów HDD**: Wdrożono nową grafikę `hdd_ports.webp` na tylną krawędź dysku HDD, gdzie podpinane są kable. Użytkownik ręcznie dostosował współrzędne fizycznych, plastikowo-złotych wtyków, by lepiej komponowały się z tłem.
- **Tekstura frontu HDD**: Zaaplikowano finalną grafikę `hdd_behind.webp` na całkowicie przednią (przeciwległą do portów) krawędź dysku HDD, kończąc tym samym oteksturowanie wszystkich 6 ścian dysku.

### Poprawione / Zmienione
- **Wydłużenie złącza PCIe**: Znacząco zwiększono głębokość wystawania złotych pinów PCIe z karty graficznej (z `0.05` na `0.15`), aby sprawiały wrażenie masywniejszych i mocniej "siedzących" w płycie głównej.
- **Odwrócenie tekstury spodu GPU**: Obrócono płaszczyznę `gpu_bottom.webp` o 180 stopni (dodatkowe `Math.PI` na osi Z) zgodnie z wytycznymi.

## Etap 13 - Tekstury, Glassmorphism Tooltips i poprawki Z-Index

### Dodane

- Zintegrowano nową grafikę `hdd_side.webp` na lewą i prawą burtę dysku twardego (`HDDGeometry`).
- Zintegrowano nową grafikę `fan_side.webp` na zewnętrzne krawędzie ram wszystkich wentylatorów w obudowie (`FanGeometry`).

### Poprawione / Zmienione

- **Lustrzane Odbicie HDD**: Wdrożono sklonowaną i odwróconą teksturę (Mirroring via `RepeatWrapping` i `repeat.x = -1`) na prawej ścianie dysku HDD, co zapewnia jej poprawną orientację.
- **Rotacja UV wentylatorów**: Zmodyfikowano mapowanie UV na bocznych krawędziach (lewa/prawa) wentylatorów poprzez rotację tekstury o równe 90 stopni (`Math.PI / 2`). Wyeliminowano efekt "pikselowych smug" wynikający z agresywnego zgniatania proporcji tekstury.
- **Glassmorphism Tooltips**: Wdrożono nowy, elegancki design dymków z nazwami komponentów. Użyto `backdrop-blur-xl`, asymetrycznych zaokrągleń i gradientów, dodając jednocześnie precyzyjny celownik i lepszą typografię z oddzielonym tłumaczeniem (zero wpływu na wydajność, brak bibliotek zewnętrznych).
- **Z-Index Fix (Loading Screen)**: Naprawiono błąd nakładania się warstw, w którym etykiety 3D (`<Html>`) przebijały ekran ładowania podczas zmiany środowiska. Ekran ładowania otrzymał nadrzędny `z-[9999]`.
Wszystkie znaczące zmiany w tym projekcie będą dokumentowane w tym pliku.

## Etap 12 - Wdrożenie Ostatnich Szlifów Audytu - Faza 7 (Backlog)

- **Wyeliminowanie migotania (Flickeringu) Animacji**: Wdrożono system "zatrzasku" (Snap-to-Grid) na samą końcówkę krzywej animacji `lerp` dla rozsuwanych paneli szklanych i blaszanych (Exploded View). Skrypt ucina asympotyczną funkcję gdy margines błędu spadnie poniżej 0.005, drastycznie pomagając silnikowi WebGL z sortowaniem głębi i zapobiegając kilkusekundowemu migotaniu nakładających się warstw szkła.

- **Hover Effect (Inteligenty Z-Offset)**: Skalowanie unoszenia się komponentów po najechaniu kursorem (hover) odbywa się teraz proporcjonalnie w dół względem rozmiaru komponentu. Ogromna obudowa drga minimalnie, a mały dysk SSD dynamicznie odskakuje.
- **Wyeliminowanie Z-fightingu obudowy**: Skrócono w dół płaszczyzny lewego panelu, tacki płyty głównej i tylnego panelu w `CaseGeometry.tsx` o grubość podłogi (Y z `-2.4` na `-2.3`), eliminując brutalne przenikanie się brył.
- **Śrubki Szklanych Paneli**: Zgodnie z zasadami oszczędzania Draw Calls, zastosowano system `<Instances>` dodający po 4 fizyczne śrubki montażowe w rogach dwóch szklanych paneli (przednim i prawym bocznym).

- **Culling paneli bocznych**: Obudowa automatycznie wyłącza renderowanie paneli (właściwość `visible = false`), gdy oddalą się poza zasięg wzroku kamery, odciążając kartę graficzną i zmniejszając liczbę Draw Calls.
- **Wznawianie ekranu ładowania**: Skrypt `LoadingScreen.tsx` został zaktualizowany, aby automatycznie powracał i maskował chrupnięcia podczas asynchronicznego pobierania nowych map środowiskowych (HDRI).
- **Grubsze RGB Chipsetu**: Podwojono grubość obrysu LED (z 0.04 do 0.08) na układzie chłodzącym Chipset na płycie głównej.
- **Złote piny w gniazdach RAM**: Dodano nowe, realistyczne, fizyczne złącza stykowe do środka wszystkich 4 slotów pamięci na płycie głównej.
- **Obrót tekstury radiatora CPU**: Poprawiono mapowanie UV na wieży chłodzącej procesora, obracając tekstury bocznego i górnego finu o 90 stopni.
- **Rozdział portów SATA dysku HDD**: Zastąpiono pojedyncze, szerokie gniazdo na dysku twardym prawidłowymi, osobnymi złączami zasilania oraz przesyłu danych, pokrytymi realistycznym materiałem `materials.goldMetal`.

- **Kolizja Zasilacza z obudową**: Podniesiono globalne współrzędne zasilacza (PSU) wewnątrz obudowy (oś Y skorygowana z `-1.92` na `-1.86`), dzięki czemu wystający w dół pierścień podświetlenia RGB wentylatora opiera się elegancko na metalowej podłodze zamiast przez nią brutalnie przenikać.
- **Śledzie PCIe w Exploded View**: Śledzie (zaślepki) portów PCIe obudowy zostały zintegrowane z grupą odlatującego, lewego panelu bocznego, dzięki czemu przestają nienaturalnie "lewitować" w powietrzu po rozłożeniu komputera. Zoptymalizowano je również za pomocą tagu `<Instances>`, redukując ilość zapytań Draw Calls.
- **Środowisko Domyślne**: Zmieniono domyślny preset oświetleniowy z "Studio" na "Cyberpunk" (`city`), zgodnie z preferencjami dla bardziej dynamicznego wyglądu. Dodatkowo zaktualizowano bazowe kolory tła w całej aplikacji (np. `App.tsx` i `index.css`), by zniwelować skoki (flash) jasności przy pierwszym ładowaniu.
- **Interfejs (UI)**: Zwiększono rozmiar ikon w panelu nawigacyjnym dla lepszej czytelności i prezencji, a preset środowiska "Cyberpunk" przeniesiono na pierwszą pozycję w liście.
- **Karta Instrukcji (Legenda)**: Przeprojektowano okno z instrukcją obsługi – powiększono fonty (dla lepszej czytelności na desktopach), zastosowano wyraźniejsze wypunktowania i skrócono opisy nawigacji dla szybszego przyswajania. Dodano również subtelną stopkę "Designed by apkmasondev" z efektem poświaty oraz odświeżono główny przycisk "Zrozumiałem".
- **Dymki (Tooltips)**: Delikatnie powiększono font w dymkach z podpowiedziami z `11px` do `13px` w celu lepszej czytelności na monitorach o wysokiej rozdzielczości.
- **Realistyczne Zdjęcia Komponentów**: Wygenerowano przy pomocy AI zestaw 10 dodatkowych, wysoce fotorealistycznych zdjęć sprzętu w środowisku warsztatowym. Skonwertowano je do wydajnego formatu `.webp` i podpięto jako ostatnie zdjęcie w galerii na kartach szczegółów poszczególnych komponentów.
- **Karta Szczegółów (UI Bugfix)**: Od teraz kliknięcie przycisku "Złóż Komputer" / "Rozłóż na Części" automatycznie ukrywa panel detali aktywnego komponentu (jeśli był otwarty) i gładko resetuje kamerę, rozwiązując problem zacinającej się i "skaczącej" do dawnej pozycji kamery.
- **Odległość wentylatorów GPU**: Zwiększono rozstaw pierścieni RGB na karcie graficznej (odstęp z 1.1 na 1.15), dopasowując pod nie również pozycje fizycznych wiatraków i cząsteczek powietrza.
- **Złącze PCIe Karty Graficznej**: Zaktualizowano model złącza (pinów) GPU, wydłużając je oraz dzieląc na dwie sekcje (krótką zasilającą i długą z danymi), precyzyjnie symulując wcięcie (notch) standardu PCIe x16. Dodatkowo pozbyto się narzuconego na sztywno materiału (Inline Material) na rzecz współdzielonego `materials.goldMetal`, oszczędzając pamięć.
- **Tekstura GPU (Backplate)**: Usunięto starą, niewidzialną bryłę geometryczną, która przenikała i zasłaniała część nowoczesnej, fotorealistycznej tekstury na tylnej płycie (backplate) karty graficznej.
- **Kolizje z siatką podłogi**: Podniesiono współrzędne `explodedPosition` dla Zasilacza (PSU) oraz Dysku HDD w konfiguracji. Zapobiega to ich nierealistycznemu wpadaniu pod "podłogę" (siatkę GridHelper) po rozłożeniu wirtualnego komputera na części (Exploded View).
- **Środowisko HDRi (S2)**: Pliki środowiska .hdr zostały pobrane do katalogu lokalnego \`public/environments/\` i zaimportowane do mapy w \`Scene3D.tsx\`. Gwarantuje to ominięcie problemów z Content Security Policy (CSP), które blokowały zasoby dostarczane przez zewnętrzne CDN.
- **Moduł Audio (S5, S6)**: Poprawiono bezpieczeństwo modułu - "puste" bloki wyjątków logują powiadomienia, a funkcja tworzenia dźwięku sferycznego precyzyjniej wygasza oscylatory przy drastycznie szybkich kliknięciach.
- **Dostępność i Tłumaczenia (U1, U3, U4, U5)**:
  - Przyciski nawigacyjne w \`Toolbar\` osiągnęły standardowe 44x44px.
  - Dodano niewidoczną "matę powrotu" na ekrany telefonów - zamykanie otwartych menu Palety Kolorów odbywa się poprzez dotknięcie tła za modelem 3D.
  - Komunikaty techniczne zostały spolszczone (np. "Brak obsługi WebGL").
  - Pierwsza instruktażowa podpowiedź ukazuje się aż do 15 sekund w trakcie pierwszego kontaktu z UI.
- **Karta Graficzna (GPU)**: Dodano statyczne, świecące pierścienie RGB na wentylatorach karty graficznej, dopasowane do nowej tekstury frontu.
- **Refaktoryzacja Trybu X-Ray (S3.3)**: Zastąpiono imperatywne przeszukiwanie sceny (`traverse`) w pełni deklaratywną obsługą `xrayMaterial` w JSX komponentów geometrii. Zapobiega to gubieniu tekstur na radiatorach płyty głównej przy zmianie stanu RGB i eliminuje race condition z Reactem. Ukryto szklane panele i wewnętrzne podświetlenie w trybie X-Ray, co znacząco poprawia widoczność wireframe'ów.

## Etap 11 - Zakończenie Audytu - Faza 6 (Wydajność i Kamery)

- **Warunkowe renderowanie materiałów szkła**: Obudowa zachowuje flagowy wygląd na komputerach stacjonarnych (\`MeshPhysicalMaterial\`), jednak na urządzeniach mobilnych korzysta ze zoptymalizowanego \`MeshStandardMaterial\` z przeźroczystością, zapewniając ogromny wzrost klatek (rozwiązany błąd P5).
- **Czyszczenie tła i shaderów (P3, P7, P8)**:
  - Systemy cząsteczek tła (\`Stars\`, \`Sparkles\`) całkowicie deaktywowane na smartfonach.
  - \`EffectComposer\` (Depth Of Field) otrzymał owijanie logiką bool, eliminując koszty "pustych przebiegów".
  - Grid renderowany pod sceną został odpowiednio wywindowany w górę.
- **Uniezależnienie płynności od platformy**: Animacje \`CursorLight\` i ujęcia \`camera.LookAt()\` działają idealnie dzięki użyciu delta-time zamiast sztucznego timeoutu. Usunięto niepotrzebny frame limiter w pętli dla urządzeń mobilnych.

## Etap 10 - Stabilność Architektury i Pamięć (Faza 5)

- **Refaktoryzacja stanu i hooków**: Rozdzielono masywny hook `usePC` na dedykowane mniejsze hooki (`usePCSelection` i `usePCSettings`), ograniczając niepotrzebne re-rendery i przeliczanie parametrów obudowy przez komponenty, które ich nie potrzebowały.
- **Zarządzanie Pamięcią i Canvas**: Wprowadzono rygorystyczne czyszczenie pamięci tekstur (VRAM). Po wygenerowaniu dynamicznej siatki obudowy (mesh grill) za pomocą API Canvas, kod natychmiast zwalnia pamięć operacyjną wywołując `canvas.width = 0; canvas.height = 0;`.
- **Zarządzanie Lifecycle Geometrii**: Dodano bezpieczniki czyszczące (`dispose()`) podpięte pod hooki `useEffect` (poprzez kolekcję `geoRefs`) dla ciężkich obiektów typu `ExtrudeGeometry` i `ShapeGeometry`, zapobiegając gigantycznym wyciekom pamięci podczas przeładowywania drzewa DOM w React Three Fiber.
- **Optymalizacja Materiałów**: Utworzono scentralizowany słownik materiałów `materials.ts`, drastycznie ograniczając instancjonowanie setek identycznych materiałów `MeshStandardMaterial` rozsianych wewnątrz plików geometrii. Wszystkie modele współdzielą od teraz predefiniowane referencje materiałów.
- **Korekty Geometrii**: Wdrożono nowy tryb X-Ray (prześwietlenia), oparty na wstrzykiwaniu materiałów przez kontekst z wykorzystaniem React, pozbywając się inwazyjnego polecenia `scene.traverse()` (które zamrażało wątek przeglądarki). Zastąpiono instrukcje warunkowe `if-else` mapowaniem ze słownika `GEOMETRY_MAP` w `PCModel.tsx`.

## Etap 9 - Detale i Poprawki Wizualne (Faza 4)

- **Całkowita eliminacja Z-fightingu (C9/C15)**: Przebudowano geometrię obudowy (CaseGeometry). Stworzono lity panel górny (Top) oraz zunifikowano dolny. Usunięto zduplikowane listwy boczne szkła i wprowadzono precyzyjne narożniki (0.1x0.1), w które szkło płynnie się zagłębia, co permanentnie rozwiązało problem Z-fightingu. Wszystkie ramy używają teraz jednego globalnego materiału `caseFrameMaterial`, znacząco redukując draw-calls (zgodnie z PCVerse Audit).
- **Poprawa estetyki GPU i płyty głównej**: Naprawiono błąd tekstury panelu I/O karty graficznej, naciągając siatkę na pełną szerokość złącza. Przesunięto całą "platformę" (płyta główna, CPU, RAM, GPU, SSD, cooler) o `0.1` w osi X w głąb obudowy, by złącza naturalnie chowały się za krawędzią tylnego panelu PC.
- **Detale M.2 i Baterii CMOS**: Przesunięto baterię CMOS wyżej (z `Y=-1.4` na `Y=-0.9`), aby była widoczna i nie chowała się pod radiatorem. Nałożono nową, dedykowaną teksturę radiatora ("AORUS M.2 SSD HEATSINK") na dolny radiator M.2. Zoptymalizowano oryginalny, bazowy model dysku SSD na płycie głównej (pod CPU), poprawiając obrót i proporcje jego tekstury, dzięki czemu pozbyto się efektu "rozmazanego bluru" po wyjęciu interaktywnego dysku.

## Etap 8 - Optymalizacja i Dostępność (Faza 3)

- **Code Splitting (C38)**: Wdrożono dynamiczny import dla głównej sceny 3D (`React.lazy`) w pliku `App.tsx` oraz zdefiniowano `manualChunks` dla silnika Vite, co rozwiązuje problem zbyt dużych paczek przy kompilacji i przyspiesza wstępne ładowanie interfejsu.
- **Dostępność i Screen Readery (C23-C25)**: Naprawiono problemy z czytelnością dla czytników ekranowych. Dodano etykiety `aria-label` do nawigacji galerii oraz przycisku zamknięcia. Panel informacyjny zyskał `role="dialog"` oraz `aria-live="polite"`, a renderowany element Canvas WebGL został ukryty z drzewa a11y (`aria-hidden="true"`), eliminując dezorientację użytkowników niepełnosprawnych.

## Etap 7 - Kamień Milowy: Architektura i Płynność (Faza 2)

- **Rozbicie Monolitu `PCModel.tsx` (C1)**: Wyodrębniono tysiące linijek kodu z jednego, ogromnego pliku `PCModel.tsx` do modułowej, zorganizowanej struktury w nowym katalogu `geometries/` (m.in. `MotherboardGeometry.tsx`, `CPUGeometry.tsx`, `GPUGeometry.tsx`, `PSUGeometry.tsx`, `CaseGeometry.tsx`). Główny plik pełni teraz wyłącznie rolę deklaratywnego orkiestratora.
- **Globalny Hook `useIsMobile` (C2)**: Wydzielono logikę nasłuchiwania na rozmiar okna (media query) do reużywalnego hooka `src/hooks/useIsMobile.tsx`, oczyszczając kod i zapobiegając redundantnym event listenerom.
- **Optymalizacja Draw Calls z `<Instances>` (C9)**: Zrefaktoryzowano skomplikowane i powtarzalne układy zasilania (kondensatory VRM, finy radiatorów VRM) na Płycie Głównej, wykorzystując wysoko zoptymalizowany tag `<Instances>` z `@react-three/drei`. Radykalnie zmniejsza to narzut na procesor graficzny, zwłaszcza w trybie standardowym.
- **Refaktoryzacja Trybu Prześwietlenia (X-Ray) (C11)**: Całkowicie przebudowano logikę renderowania widoku transparentnego. Zamiast brutalnie iterować i mutować parametry bezpośrednio w oryginalnych materiałach (co blokowało na ułamek sekundy główny wątek i wywoływało wycieki w R3F), komponent teraz elegancko przepina referencje na globalny i stabilny `xrayMaterial` (MeshStandardMaterial). Utrzymuje to współdzielenie materiałów w czystości.
- **Sloty PCIe w 3D**: Przepisano płaską "teksturową naklejkę" na porty PCIe i obudowano je fizyczną, trójwymiarową ramką, tworząc naturalne zagłębienia, do których karty rozszerzeń "wchodzą" zamiast na nich leżeć.
- **Poprawki Zgodności i Aparatu (C32)**: Odkryto i usunięto błąd TypeScripcie związany ze starą metodą `rest()` w `CameraControls` na rzecz poprawnego wywołania `reset(true)`.

## Etap 6 - Wdrożenie Poprawek z Audytu (Faza 1)

- **Rozwiązanie wycieku pamięci geometrii**: Wydzielono logikę generowania kabli do zewnętrznego komponentu `CableGeometry.tsx`. Od teraz krzywe modelujące kable są buforowane poprzez `useMemo`, a same kształty (`TubeGeometry`) posiadają mechanizm wymuszający zrzucanie instancji z pamięci VRAM (`dispose()`) przy każdorazowym chowaniu i demontażu komponentu, naprawiając największe "dropy" wydajności.
- **Bezpieczeństwo animacji**: Dodano bezpiecznik stanu `isAnimating` do logiki widoku rozstrzelonego (Explode View). Zapobiega on zapętlaniu się i de-synchronizacji animacji podczas szybkiego, wielokrotnego klikania przycisku.
- **Odporność panelu informacyjnego (C32)**: Wdrożono resetowanie indexu w powiększonej galerii zdjęć komponentu przy przełączaniu na inny podzespół (co chroni przed crashami aplikacji).
- **Niestandardowy Ekran Ładowania (Custom Loader)**: Zastąpiono domyślny loader z `@react-three/drei` w pełni spersonalizowanym komponentem w technologii Framer Motion z mrocznym motywem glassmorphismu.
- **Podwójny Wentylator Boczny**: Dodano `side_fan_2` do bazy komponentów i przebudowano logikę wywiewu z tyłu, tak by obudowa dysponowała potężnym podwójnym odciągiem powietrza z bloku CPU.
- **Optymalizacje Wydajności**: Zredukowano jakość efektu SSAO (N8AO), wyłączono `mipmapBlur` w komponencie Bloom oraz multisampling EffectComposera dla urządzeń mobilnych, zyskując potężny zastrzyk FPS-ów na słabszych urządzeniach.
- **Siatka Wentylatorów (Front)**: Naprawiono błąd z wektorami otworów przedniego panelu szklanego - wycięcie ramki dla przednich wentylatorów jest teraz w 100% przezroczyste na całej wysokości.
- **Tekstura Tyłu Obudowy**: Dodano fotorealistyczną teksturę na tylnym, metalowym panelu obudowy (z mapowaniem UV dla całego panelu).
- **Tekstura Prawego Panelu**: Nałożono wygenerowaną teksturę wentylacji z napisem "COOLING" na boczny, prawy panel (znajdujący się za płytą główną).
- **Tekstura Spodu i Wnętrza Obudowy**: Zastosowano elegancką, chropowatą powłokę gradientową na spodzie komputera oraz pokryto nią całe wewnętrzne poszycie (ścianę płyty głównej oraz podłogę wnętrza), nadając podstawie jednolity, premium wygląd.
- **Procesor (Piny)**: Dodano realistyczną teksturę złotych pinów na spodzie procesora (LGA/PGA).
- **Śledź Karty Graficznej**: Skorygowano proporcje śledzia (bracket) karty graficznej, wydłużając go w osi Z (w bok), by idealnie domykał lukę w tylnym panelu obudowy. Dopasowano również jego kolor do ciemnego odcienia portów.
- **Radiator Procesora**: Przywrócono teksturę "żeberek" u dołu radiatora oraz zmieniono kolor wewnętrznego panelu stykowego i tylnej "ścianki" z powrotem na srebrny z miedzianym klockiem bazowym (Base Contact).

### Zmiany dzisiejsze (Poprawki Obudowy, Optymalizacja i Detale)

- **Poprawki Geometrii Obudowy**: Precyzyjnie przesunięto i wycentrowano wszystkie fizyczne wycięcia na lewym i dolnym panelu obudowy dla zasilacza (PSU), w tym na wentylator oraz port na kabel zasilający. Naprawiono również obrys tylnego panelu.
- **Kabel Zasilania Procesora (EPS)**: Poprowadzono nowy, 8-pinowy kabel łączący zasilacz (PSU) bezpośrednio z gniazdem CPU na płycie głównej. Kabel przebiega strategicznie wzdłuż samej krawędzi obudowy (całkowicie z tyłu za płytą główną), elegancko omijając kartę graficzną i unikając jakichkolwiek kolizji.
- **Audyt Wydajnościowy i Kompresja (.webp)**: Przeprowadzono gigantyczne odchudzanie aplikacji! Ogromne pliki `PNG` używane jako tekstury zostały w locie zoptymalizowane nowoczesnym kodekiem (`.webp`), oszczędzając kilkanaście megabajtów (MB) czystego wczytywania, niesamowicie przyspieszając proces ładownia.
- **Tekstura GPU i Precyzyjne Kable**: Dodano dedykowaną teksturę `gpu_top.webp` dla karty graficznej i perfekcyjnie dopasowano trajektorię kabla zasilającego PCIe, by fizycznie wpinał się ze złączem ukazanym bezpośrednio na tej teksturze (uwzględniając realne globalne koordynaty w przestrzeni 3D). Naprawiono również błędy mapowania UV (skalowania) tekstur wewnętrznych obudowy (Mobo Tray, lewy panel boczny).
- **Efekty Środowiskowe (Gwiazdy)**: Wzbogacono tło sceny dodając dynamiczny, mroczny efekt gwiezdnego pyłu (`<Stars />`), który nadaje otoczeniu niesamowitego, przestrzennego klimatu i niweluje pustkę tła.
- **Optymalizacja Kadrowania (Mobile)**: Naprawiono błąd z ucinaniem i nadmiernym rozmywaniem obiektów po ich kliknięciu na urządzeniach mobilnych. Zwiększono dystans kamery z 4 do 8 jednostek, rekompensując wąski kąt widzenia na pionowych ekranach, oraz zmniejszono siłę efektu `DepthOfField` (bokehScale z 4 do 0), aby zapobiec zamazywaniu detali.
- **Tylny Panel i Wycięcie Zasilacza**: Rozszerzono geometrię tylnego panelu i tacki płyty głównej do granic obudowy (X=1.97). Poprawiono pozycję okna wyciętego na panel I/O zasilacza przesuwając go dokładnie na środek osi (X=-1.2) i poszerzając jego krawędź. Wtyczka kabla zasilającego na zasilaczu jest teraz widoczna w 100%.
- **Wycięcie na zasilacz (Spód)**: Wyrównano dolny otwór wentylacyjny pod zasilaczem wraz z siatką Mesh do nowej pozycji zasilacza (Z=-0.8). Powiększono wycięcie w podłodze obudowy tak, aby idealnie odpowiadało rozmiarom pełnego plastra miodu, zapobiegając jego nachodzeniu na lity panel.

### Zmiany na Płycie Głównej

- **Z-fighting i rendering tekstur**: Zastosowano parametr `polygonOffset` na głównych płaszczyznach tekstur (front, tył, panel I/O) w celu całkowitego wyeliminowania migotania (z-fighting) w kontakcie z bryłami 3D. Skorygowano również położenie bloku panelu wejść/wyjść, aby opierał się o laminat płyty głównej zamiast w niego przenikać.
- **Estetyka sekcji zasilania**: Usunięto zduplikowane, niewidoczne bryły złączy 8-pin EPS i 24-pin ATX, które zakłócały wizualną czystość układu i kolidowały z radiatorem sekcji VRM.
- **Stylizacja RGB Chipsetu**: Wymieniono generyczny, lity kwadrat świetlny na radiatorze na zmodernizowany, powiększony (0.8x0.8) obrys (pusty w środku kontur) uformowany z czterech osobnych pasów LED, eksponujący znajdujące się pod nim tekstury.
- **Realizm gniazd pamięci RAM**: Znacznie zredukowano odstępy między czterema slotami pamięci, pakując je ciaśniej i wyrównując do lewej krawędzi (bliżej gniazda CPU). Precyzyjnie zsynchronizowano także koordynaty samych kości RAM z ich nowymi, węższymi wejściami (w trybie dual-channel).
- **Masywne Chłodzenie CPU**: Przeskalowano całą grupę geometrii chłodzenia procesora o 15% we wszystkich osiach, zachowując bezkolizyjność z RAM-em oraz idealne przyleganie podstawy miedzianej do bloku CPU.
- **Nowy układ wyświetlacza POST**: Bryła wyświetlacza diagnostycznego została zminiaturyzowana, obrócona o 90 stopni do pionu i wkomponowana w prawą krawędź laminatu (obok slotów RAM), zapobiegając zasłanianiu jej przez chłodzenie CPU i układ GPU.
- **Fizyczne Złącze PCIe 3D**: Wyeliminowano zduplikowane, płaskie naklejki i przenikające się bryły M.2 na korzyść autentycznie wyrzeźbionego rowka PCIe. Wycięcie zyskało fizyczną, trójwymiarową głębię, mostek (notch divider) dzielący piny oraz wewnętrzny, złoty grzebień styków (Gold Pins) schowany głęboko we wzmacnianej stalowej ramie.
- **Pozycjonowanie VRM**: Zoptymalizowano parametryczny rozkład kondensatorów VRM (zbliżono i opuszczono lewy oraz górny rząd), dając miejsce dla masywniejszego chłodzenia i zapewniając czystszy wygląd sekcji zasilania.

### Zmienione

- **Orientacja i rotacja wentylatorów**: Skorygowano błędy matematyczne z rotacjami w grupie `ComponentMesh`, przez które wentylatory wylotowe (exhaust) miały zły kąt i niepoprawnie wtłaczały powietrze do środka. Teraz wydmuchują je na zewnątrz obudowy (-X).
- **Zasilacz (PSU)**: Rozszerzono mapowanie tekstur. Boczna etykieta z modelem (AX1600i) jest teraz symetrycznie aplikowana również na tylną, niewidoczną od frontu stronę PSU. Rozciągnięto również tylny i przedni płaski panel z teksturami do szerokości 1.8 (wcześniej 1.6), co całkowicie wyeliminowało czarne pasy po bokach obudowy zasilacza.
- **Ekran Ładowania (Loading Screen)**: Dodano wymuszone pobieranie wszystkich 27 tekstur w tle tuż po uruchomieniu aplikacji (`useTexture.preload()`). Dzięki temu menedżer ładowania nie uznaje procesu za zakończony przedwcześnie, a ekran ładowania znika dopiero, gdy wszystkie tekstury i materiały znajdą się w pamięci karty graficznej.
- **Top Panel Mesh**: Przebudowano CanvasTexture siatki na top panelu, naprawiając skalowanie wycięć (`repeat.set`), dzięki czemu plaster miodu wreszcie jest poprawnie widoczny.

### Zmienione

- Zastosowano hybrydowe podejście do Płyty Głównej: na płaskie PCB naniesiono fotorealistyczną teksturę o wysokiej rozdzielczości (front i tył), a kluczowe trójwymiarowe elementy (gniazdo CPU, chłodzenie VRM, sloty RAM/PCIe) pozostały w pełni wyrenderowanymi bryłami 3D, generując fizyczne cienie na zdjęciu.
- Dodano "zaślepkę" gniazda CPU na płycie głównej, aby perfekcyjnie ukryć nadrukowany socket z fotografii i wyeksponować tylko fizyczny model 3D bez artefaktów.
- Skorygowano pozycje gwintów płyty głównej w obudowie, zachowując perfekcyjne marginesy i unikając nakładania się ich na wielkie wycięcie wentylacyjne pod procesorem (CPU cooler cutout).
- Procesor (Ryzen AM5) otrzymał fotorealistyczną teksturę połączoną z precyzyjnym `bumpMap` i `bumpScale`, dzięki czemu wycięcia IHS z tekstury fizycznie reagują i odbijają dynamiczne światło 3D obudowy.
- Zamieniono lity model tacki na płytę główną na zaawansowaną geometrię `ExtrudeGeometry` wyposażoną w fizyczne, wycięte na wylot otwory dla backplate'u coolera CPU oraz otworu wylotowego zasilacza PSU, w pełni rozwiązując problemy z widocznością siatek.
- Usunięto błąd nakładającej się, wiszącej w powietrzu siatki wywiewnej z zasilacza (PSU), uszczelniając jego bryłę.
- Zoptymalizowano użycie tekstur Canvas w komponencie `CaseGeometry` poprzez dodanie czyszczenia (`.dispose()`), eliminując wycieki pamięci VRAM.
- Zoptymalizowano działanie efektu `ChromaticAberration` w `Scene3D` wyciągając wektor przesunięcia poza pętlę renderowania.
- Zaimplementowano hybrydową, niestandardową szybę z geometrycznym wycięciem i stalową ramką (pill-shape cutout), za którą osadzono wentylatory wprowadzające powietrze (intake). W ten sposób rozwiązano problem mało realistycznego przepływu powietrza przez lity front. Wewnątrz ramki osadzona jest dedykowana struktura plastra miodu, generująca realistyczne refleksy i głębię obudowy.
- Usunięto niepotrzebne rzucanie i odbieranie cieni (`castShadow`, `receiveShadow`) z setek obiektów typu mesh oraz ze źródeł światła, odzyskując zasoby GPU (cienie i tak nie były renderowane po usunięciu podłogi).
- Zastąpiono ręczne modyfikowanie kursora systemowego zoptymalizowanym hookiem `useCursor` od `@react-three/drei`.
- Zaimplementowano zamykanie modalu instrukcji za pomocą klawisza `Escape`.
- Usunięto martwy kod i nieużywane importy w całym projekcie (np. `ContactShadows`, `Float`).
- Całkowicie przebudowano lewy panel obudowy w `CaseGeometry` używając `ExtrudeGeometry` i `THREE.Shape` by stworzyć autentyczne, puste na wylot luki montażowe dla sekcji I/O płyty głównej, wylotu GPU (PCIe), wentylatora wyciągowego oraz zasilacza.
- Skorygowano wysokość mocowania GPU by porty HDMI/DP idealnie wychodziły przez dedykowane otwory obudowy (eliminacja martwego bloku blachy).
- Materiał tylnej siatki wylotowej zasilacza nakłada teraz kanał przezroczystości (alphaMap) bezpośrednio na strukturę siatki, dzięki czemu przewiewny plaster miodu widać naturalnie zarówno z wnętrza, jak i zewnątrz budy PC.
- Animacja eksplozji rozsuwa teraz nie tylko boczny, ale również przedni, szklany panel obudowy. Przednie szkło otrzymało też dopasowaną cienką stalową ramkę.

## Etap 5 - Audyt SEO, Bezpieczeństwa i Wydajności

### Dodane

- Kompleksowa optymalizacja SEO (lang, tagi meta, Open Graph, JSON-LD, ukryty H1 tylko dla czytników ekranu).
- Nagłówki Content-Security-Policy (CSP) dla zwiększenia bezpieczeństwa.
- Efekt `N8AO` (Screen Space Ambient Occlusion) dla głębszego i bardziej realistycznego cieniowania obiektów 3D.
- `PerformanceMonitor` do dynamicznego obniżania rozdzielczości (DPR) na słabszych urządzeniach w celu utrzymania płynności.
- Drzewa `Bvh` (Bounding Volume Hierarchy) z biblioteki drei do optymalizacji śledzenia promieni (raycasting) i ogólnej wydajności myszy.
- Wskazówka "Onboarding" dla nowych użytkowników, informująca o interaktywności modelu.
- Wprowadzająca animacja kinowa kamery przy starcie aplikacji.

### Zmienione

- Zrefaktoryzowano alokacje wektorów `Vector3` wewnątrz `useFrame` i `useEffect` (użycie `useMemo` i `useRef`), aby wyeliminować mikro-przycięcia powodowane przez Garbage Collector.
- Dodano płynną interpolację skali (lerp) podczas najeżdżania kursorem na komponenty.
- Naprawiono brak resetowania `viewOffset` podczas odmontowywania sceny (Scene3D).
- Ukryto techniczne stosy wywołań w `ErrorBoundary` w środowisku produkcyjnym.
- Usunięto nieużywany plik `App.css` pochodzący z szablonu.

## Etap 4 - Ostateczne Szlify Estetyczne i Poprawki Układu

### Dodane

- **Włącznik/Wyłącznik Oświetlenia RGB**: Dodano nowy przycisk (z ikoną Power) w menu palety kolorów, który pozwala całkowicie wygasić podświetlenie RGB podzespołów.
- **Modal Instrukcji**: Dodano przycisk, który otwiera eleganckie, szklane (glassmorphism) nakładki z instrukcjami wyjaśniającymi kluczowe interakcje (nawigacja, demontaż, narzędzia).
- **Przełącznik Etykiet**: Dodano przycisk umożliwiający łatwe włączanie/wyłączanie trójwymiarowych etykiet HTML dla czystszego widoku modelu.
- **Klikalne i Interaktywne Etykiety HTML**: Tagi unoszące się nad komponentami są teraz w pełni interaktywne. Najechanie na etykietę aktywuje te same efekty co najechanie na model 3D (dźwięki, podświetlenia), a kliknięcie w nią otwiera Panel Informacyjny.
- **Czwarte Otoczenie HDRi**: Dodano preset "Jasny Pokój" (`apartment`), zapewniający opcję bardzo jasnej, dobrze oświetlonej sceny.
- **Przełącznik Środowisk HDRi**: Dodano menu wyboru z poziomu UI, pozwalające na przełączanie się między środowiskami o wysokim zakresie dynamiki (`Studio`, `Cyberpunk`, `Świt`).
- Wewnętrzne dwukolorowe oświetlenie RGB punktowe wewnątrz obudowy (indygo na górze, różowe na dole) dla dynamicznych podświetleń komponentów.

### Zmienione

- Poprawiono teksturę portów I/O karty graficznej na idealnie odwzorowującą układ złączy NVIDIA (3x DisplayPort, 1x HDMI) po dostarczeniu nowej grafiki.
- Zaktualizowano model zasilacza (PSU) o nową, fotorealistyczną teksturę tylnego panelu (złącza modularne, przełącznik AC i gęsty mesh wentylacyjny), dostarczoną przez użytkownika.
- **UI Menu RGB**: Poprawiono wygląd palety kolorów po wyłączeniu RGB. Pola mają teraz szary, wyszarzony kolor i zapalają się z powrotem po wybraniu trybu świecącego.
- **Mechanika Kamery**: Zmieniono działanie strzałek góra/dół oraz dodano wsparcie dla klawiszy WASD – teraz poruszają kamerą do przodu i tyłu (zbliżanie/oddalanie) podobnie do poruszania się w grach FPS (First-Person Shooter).
- **Widok Hologramu (X-Ray)**: Przywrócono widoczność wewnętrznych, fizycznie kręcących się wirników we wszystkich wentylatorach (obudowy, chłodzenia CPU oraz zasilacza). Są one teraz ponownie widoczne, gdy naklejki/tekstury stają się przeźroczyste w trybie X-Ray. Dodatkowo zwiększono rozmiar wewnętrznego wentylatora zasilacza, aby realistycznie wypełniał swoją przestrzeń.
- **Zasilacz PSU (Dół)**: Wymieniono generyczny wentylator na fotorealistyczną teksturę dołu zasilacza oraz dodano do niej geometryczny pierścień `torus` z materiałem `emissive`, który świeci i reaguje na zmiany koloru RGB w obudowie.
- **Efekty Post-Processingu**: Dodano filmową Głębię Ostrości (Depth of Field). Po kliknięciu w dowolny komponent, staje się on idealnie ostry, a reszta sceny (zarówno tło, jak i elementy bliżej kamery) ulega pięknemu, soczewkowemu rozmyciu typu Bokeh. Po odkliknięciu ostrość wraca do normy.
- **Dysk SSD (Dół)**: Nałożono nową, pełną detali teksturę ścieżek i układów scalonych na dolną stronę dysku M.2, zachowując przy tym prawidłowe umiejscowienie pinów złącza.
- **UI Instrukcje**: Zaktualizowano tekst w zakładce "Legenda i Instrukcja", aby poprawnie odzwierciedlał możliwość sterowania za pomocą klawiszy WASD / Strzałek oraz PPM.
- Zmieniono UI Panelu Informacyjnego: Zmniejszono wysokość głównego obrazu, dając więcej pionowej przestrzeni na tekst i szczegóły bez konieczności przewijania.
- Przebudowano od zera model Płyty Głównej (Motherboard), dodając high-endowe detale (chłodzenie VRM, osłony NVMe M.2, modelowane kondensatory, gniazda ATX/EPS/SATA, podświetlaną sekcję audio, baterię CMOS oraz czerwony wyświetlacz POST).
- Dodano do galerii każdego z podzespołów trzeci, profesjonalny i dedykowany obraz wysokiej jakości wygenerowany przez AI (skompresowany do WebP).
- Formatowanie nagłówków w Kartach Informacyjnych używa teraz eleganckiego myślnika ` - ` zamiast nawiasów `( )`, a angielskie odpowiedniki są akcentowane kolorem Indigo-400.
- Skompresowano zasoby graficzne, dostosowując obrazy do standardu WebP z myślą o szybkim ładowaniu w środowisku sieciowym.
- Zmodyfikowano wektory rozsunięcia dla karty graficznej i zasilacza tak, by nie nakładały się one na siebie po rozłożeniu PC.
- Zamknięto przerwę między kartą graficzną a ścianą obudowy. Model GPU zyskał wspornik, porty HDMI/DP oraz kable 12VHPWR.
- Odwrócono bryłę zasilacza (PSU) o 180 stopni dla zachowania realizmu podłączania i wentylacji, dodano też kratkę wentylacyjną (mesh) u spodu obudowy.
- Przeprowadzono fizyczną weryfikację pozycji osi XYZ każdego podzespołu — wyeliminowano efekt lewitującego dysku HDD.
- Przebudowano tylny i boczny panel wejść/wyjść płyty głównej (Rear IO) z kompletem przycisków i portów, dodano wyciągowy tylny wentylator oraz fizyczne otwory wywiewne.
- **System Cząsteczkowy Airflow**: Wdmuchem zajmują się świecące na niebiesko cząsteczki z frontu, a czerwone, rozgrzane wyrzucane są na zewnątrz przez tył. Poprawiono ich matematyczne zwroty wektorowe (w tym przepływ przez pionowe wentylatory chłodzenia GPU).
- Kliknięcie w dowolne puste tło (`onPointerMissed`) zamyka panel informacyjny i oddala kamerę.
- Usunięto błędy nachodzących na siebie płaszczyzn (Z-fighting) na radiatorze procesora oraz karcie graficznej.
- Ulepszono materiał szkła przedniego i bocznego w obudowie o współczynnik załamania światła (`ior=1.5`) oraz gładką warstwę ochronną (`clearcoat=1`), z lodowo-niebieskim zabarwieniem.
- Włączono powolne, asynchroniczne lewitowanie podzespołów (na bazie fal sinusoidalnych) podczas trybu dekompozycji dla lepszego efektu holograficznego sci-fi.
- Wentylator na zasilaczu działa poprawnie, a wektory obrotu ringów RGB na wentylatorach zostały perfekcyjnie zsynchronizowane z ich łopatkami.
- Zoptymalizowano Karty Informacyjne - pasek przewijania jest teraz ukryty poprzez dedykowaną klasę CSS, a paski postępu renderowane są wielokolorowymi gradientami.

## Etap 3 - Profesjonalna Estetyka i Detale

### Zmienione

- Usunięto płaskie, dwuwymiarowe modele podzespołów zastępując je w 100% trójwymiarowymi rzeźbami w środowisku 3D.
- Dodano świecące linie emisji światła (glow) w geometrii układów graficznych i pamięci RAM.
- Dodano filmowe cząsteczki `Sparkles` unoszące się w tle jako eleganckie dopełnienie sceny.
- Przeprojektowano wizytówki części na eleganckie panele "frosted glass".
- Wygenerowano i umiejscowiono w aplikacji najwyższej jakości tekstury 8K dla każdego elementu komputera.
- Ograniczono fizycznie minimalne oraz maksymalne przybliżenie kamery by zapobiec zjawisku wchodzenia "wewnątrz" zamkniętego modelu.
- Wprowadzono animację przybliżania idealnie do odległości 5 jednostek wektora względem centrowanego obiektu.
- InfoPanel został całkowicie przeprojektowany z zastosowaniem płynnych animacji `framer-motion` (opóźnione pojawianie się list i komponentów, rozmazywanie wejść tekstowych).
- Kiedy InfoPanel się otwiera, zajmuje idealnie 50% szerokości z prawej strony i używając offsetu rzutu natywnie spycha model komputera dokładnie w bezpieczną strefę widoczności po lewej stronie.
- Etykiety 3D chowają się całkowicie natychmiast po kliknięciu jakiegokolwiek podzespołu.
- Przetłumaczono absolutnie wszystkie teksty w aplikacji (interfejsy, przyciski, encyklopedyczne opisy hardware'u oraz legendy) na język polski.
- Usunięto piwnicę zasilacza na korzyść transparentnej i pełnej widoczności obudowy dla zwiększenia wrażeń wizualnych.
- Modele SSD, Pamięci RAM i Procesora idealnie przylegają teraz do szyny (tacy) płyty głównej.
- Naprawiono globalny wektor obudowy (`Z=1`), który powodował wystawanie wszystkich podzespołów poza bryłę ochronną skrzyni komputera.

## Etap 2 - Przebudowa UX/UI

### Zmienione

- Przebudowa geometrii podstawowej. Zamiast prostych boksów, używane są teraz zintegrowane formacje 3D dla procesora (dodano IHS), kratownice dla karty graficznej i układy radiatorowe dla pamięci RAM.
- Zastąpiono latające teksty 3D o wiele atrakcyjniejszymi powiadomieniami z czystego HTML renderowanego na powierzchni Canvas przez `@react-three/drei`.
- Zmieniono surowe środowisko `OrbitControls` na profesjonalne przejścia kinematyczne realizowane biblioteką `CameraControls`.
- Płaskie oświetlenie środowiskowe zostało zmienione w predefiniowany profil studia HDRI (`Environment preset=studio`).
- Zreorganizowano pasek nawigacyjny do formy przypominającej nowoczesne aplikacje typu Linear czy Vercel (monochromatyczny design, rozmyte tła, czarne motywy z jedno-pikselowym borderem).

## Etap 1 - Inicjalizacja i Podstawowe Funkcje

### Dodane

- Inicjalna struktura projektu w ekosystemie: React 19, Vite, TypeScript.
- Integracja i konfiguracja frameworku Tailwind CSS w najnowszej wersji v4.
- Import rdzeni projektowych: Three.js, React Three Fiber, React Three Drei oraz Framer Motion.
- Powstanie pierwszej prostej sceny z bryłami 3D (`PCModel`, `Scene3D`).
- Podpięcie silnika detekcji kliknięć z przestrzeni 3D do stanu globalnego (Raycasting).
- Wybudowanie interfejsu dolnego "Bottom Sheet" dla użytkowników nawigujących z urządzeń mobilnych.
- System wektorów rozbioru (Exploded View) realizujący separację przestrzenną hardware'u komputera.
- Podłączenie bazowych informacji do pliku `src/data/components.ts` dla 8 głównych organów zestawu PC.
- Pomyślna weryfikacja obsługi WebGL w procesie ładowania środowiska DOM.
