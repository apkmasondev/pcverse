export interface PCComponent {
  id: string;
  name: string;
  description: string;
  role: string[];
  funFact: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  color: string;
  perfImpact: {
    gaming: number;
    ai: number;
    productivity: number;
  };
  customStats?: {
    label: string;
    value: number;
  }[];
  geometryArgs: [number, number, number];
  imageUrls: string[];
  buildOrder?: number;
  buildTip?: string;
}

export const pcComponents: PCComponent[] = [
  {
    id: "motherboard",
    buildOrder: 1,
    name: "Płyta Główna - Motherboard",
    description: "Główna płytka drukowana, która łączy wszystkie komponenty ze sobą, stanowiąc kręgosłup komputera.",
    role: [
      "Dystrybuuje zasilanie i filtruje napięcia poprzez sekcję zasilania (VRM)",
      "Umożliwia komunikację między CPU, RAM i GPU",
      "Przechowuje oprogramowanie BIOS/UEFI"
    ],
    funFact: "Nowoczesne płyty główne mogą mieć ponad 10 warstw włókna szklanego i miedzianych ścieżek.",
    position: [-0.42, 0, -1.75],
    explodedPosition: [-5.5, 1.5, -9.75],
    color: "#1a1a2e",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Przepustowość Magistrali", value: 100 },
      { label: "Stabilność Zasilania (VRM)", value: 95 },
      { label: "Możliwości Rozbudowy", value: 85 }
    ],
    buildTip: 'Przed włożeniem płyty do obudowy upewnij się, że wkręciłeś odpowiednie kołki dystansowe (stand-offs). Zabezpieczają one delikatne ścieżki na odwrocie laminatu przed bezpośrednim kontaktem z metalową obudową. Brak kołków oznacza natychmiastowe zwarcie i uszkodzenie sprzętu!',
    geometryArgs: [3, 4, 0.05],
    imageUrls: ["/images/components/motherboard.webp", "/images/components/motherboard_macro.webp", "/images/components/mb_alt.webp", "/images/components/motherboard_real.webp"],
  },
  {
    id: "cpu",
    buildOrder: 2,
    name: "Procesor - CPU",
    description: "Główny układ obliczeniowy komputera, pełniący rolę jego elektronicznego mózgu.",
    role: [
      "Wykonuje instrukcje programów",
      "Przeprowadza skomplikowane obliczenia matematyczne",
      "Koordynuje działanie całego systemu, delegując wyspecjalizowane zadania do GPU i RAMu"
    ],
    funFact: "Współczesny procesor zawiera miliardy mikroskopijnych tranzystorów na powierzchni kilku centymetrów kwadratowych.",
    position: [-0.42, 0.95, -1.6],
    explodedPosition: [-2.54, 6.5, -2.6],
    color: "#e94560",
    perfImpact: { gaming: 25, ai: 20, productivity: 40 },
    customStats: [
      { label: "Częstotliwość Taktowania (Ghz)", value: 80 },
      { label: "Ilość Rdzeni / Wątków", value: 75 },
      { label: "Rozmiar Pamięci Cache", value: 85 }
    ],
    buildTip: 'Złoty trójkąt w rogu procesora musi idealnie pokryć się z małym oznaczeniem na gnieździe płyty głównej. Nie używaj siły – procesor powinien swobodnie "wpaść" na swoje miejsce. Dopiero wtedy możesz bezpiecznie docisnąć i zablokować metalową dźwignię, unikając wygięcia delikatnych pinów.',
    geometryArgs: [0.8, 0.8, 0.05],
    imageUrls: ["/images/components/cpu.webp", "/images/components/cpu_macro.webp", "/images/components/cpu_alt.webp", "/images/components/cpu_real.webp"],
  },
  {
    id: "cpu_cooler",
    buildOrder: 6,
    name: "Chłodzenie Procesora - CPU Cooler",
    description: "Rozprasza ciepło generowane przez procesor, zapobiegając przegrzaniu i spadkom wydajności (thermal throttling).",
    role: [
      "Odbiera ciepło poprzez miedziany lub aluminiowy blok",
      "Przenosi ciepło na radiatory za pomocą ciepłowodów",
      "Wydmuchuje gorące powietrze za pomocą dedykowanego wentylatora"
    ],
    funFact: "Woda używana w chłodzeniach cieczą (AIO) potrafi odebrać ciepło z procesora ponad 20 razy szybciej niż powietrze, redukując nagłe skoki temperatur (tzw. spiki).",
    position: [-0.42, 0.85, -1.40],
    explodedPosition: [-0.65, 7.5, 0],
    color: "#a0a0a0",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Wydajność Odprowadzania Ciepła", value: 95 },
      { label: "Kultura Pracy (Głośność)", value: 85 },
      { label: "Stabilność Temperatury pod Obciążeniem", value: 90 }
    ],
    buildTip: 'Nakładając pastę termoprzewodzącą (np. kroplę wielkości ziarenka grochu), pamiętaj o właściwym dokręcaniu chłodzenia. Śruby radiatora wkręcaj stopniowo, obracając je po trochu na krzyż (po przekątnej). Gwarantuje to równomierny nacisk na procesor i zapobiega powstawaniu bąbli powietrza.',
    geometryArgs: [1, 1.3, 0.8],
    imageUrls: ["/images/components/cooler.webp", "/images/components/cooler_macro.webp", "/images/components/cooler_alt.webp", "/images/components/cooler_real.webp"],
  },
  {
    id: "gpu",
    buildOrder: 7,
    name: "Karta Graficzna - GPU",
    description: "Wyspecjalizowany procesor zaprojektowany do akceleracji renderowania grafiki oraz obliczeń równoległych.",
    role: [
      "Renderuje grafikę 3D oraz wideo",
      "Akceleruje zadania związane ze sztuczną inteligencją",
      "Przetwarza potężne pakiety danych równolegle"
    ],
    funFact: "Współczesne układy graficzne (GPU) są wykorzystywane nie tylko w grach, ale także jako potężne 'mózgi' dla sztucznej inteligencji, ponieważ potrafią przetwarzać tysiące operacji matematycznych jednocześnie.",
    position: [-0.25, -0.455, -1],
    explodedPosition: [-9, 0.65, -3.25],
    color: "#6366f1",
    perfImpact: { gaming: 60, ai: 60, productivity: 15 },
    buildTip: 'Karta graficzna to często najcięższy element w całym zestawie. Otwórz plastikowy zatrzask z prawej strony portu PCIe x16, a następnie wsuwaj kartę prostopadle, aż usłyszysz wyraźne kliknięcie zapadki. Na koniec mocno przykręć jej "śledzia" śrubami, by zapobiec opadaniu (tzw. GPU sag).',
    geometryArgs: [2.5, 0.5, 1.2],
    imageUrls: ["/images/components/gpu.webp", "/images/components/gpu_macro.webp", "/images/components/gpu_alt.webp", "/images/components/gpu_real.webp"],
  },
  {
    id: "ram_1",
    buildOrder: 3,
    name: "Pamięć RAM - Memory Module",
    description: "Pamięć operacyjna o ultra-niskich opóźnieniach (rzędu nanosekund), używana przez procesor do przechowywania aktualnie działających programów.",
    role: [
      "Przechowuje dane dla błyskawicznego dostępu przez CPU",
      "Umożliwia wielozadaniowość bez zacięć systemu",
      "Traci wszystkie dane w momencie odłączenia zasilania"
    ],
    funFact: "Pamięć RAM jest około 100 000 razy szybsza od tradycyjnego dysku twardego HDD.",
    position: [0.38, 0.86, -1.55],
    explodedPosition: [2.02, 7.15, -5.95],
    color: "#00b8a9",
    perfImpact: { gaming: 10, ai: 15, productivity: 20 },
    buildTip: 'Aby aktywować tryb Dual Channel (co drastycznie zwiększa wydajność), pamięci należy montować parami w slotach A2 i B2 (drugi i czwarty od procesora). Między kościami musi zostać jeden wolny slot! Otwórz zatrzaski, wsuń kości i dociśnij je równomiernie, aż usłyszysz wyraźny "klik".',
    geometryArgs: [0.5, 1.2, 0.8],
    imageUrls: ["/images/components/ram.webp", "/images/components/ram_macro.webp", "/images/components/ram_alt.webp", "/images/components/ram_real.webp"],
  },
  {
    id: "ram_2",
    buildOrder: 3,
    name: "Pamięć RAM - Memory Module",
    description: "Drugi moduł pamięci operacyjnej, pracujący w parze w celu maksymalizacji przepustowości.",
    role: [
      "Działa w trybie dual-channel, podwajając przepustowość pamięci",
      "Zwiększa całkowitą pojemność do obsługi ciężkich zadań",
      "Redukuje zacinanie się w nowoczesnych grach"
    ],
    funFact: "Użycie dwóch kości RAM zamiast jednej dużej może zwiększyć wydajność procesora nawet o 15%.",
    position: [0.66, 0.86, -1.55],
    explodedPosition: [3.38, 7.15, -5.95],
    color: "#00b8a9",
    perfImpact: { gaming: 2, ai: 1, productivity: 5 },
    buildTip: 'Aby aktywować tryb Dual Channel (co drastycznie zwiększa wydajność), pamięci należy montować parami w slotach A2 i B2 (drugi i czwarty od procesora). Między kościami musi zostać jeden wolny slot! Otwórz zatrzaski, wsuń kości i dociśnij je równomiernie, aż usłyszysz wyraźny "klik".',
    geometryArgs: [0.5, 1.2, 0.8],
    imageUrls: ["/images/components/ram.webp", "/images/components/ram_macro.webp", "/images/components/ram_alt.webp", "/images/components/ram_real.webp"],
  },
  {
    id: "ssd",
    buildOrder: 4,
    name: "Dysk NVMe - SSD",
    description: "Ultraszybka pamięć masowa przechowująca system operacyjny, gry oraz wszystkie pliki użytkownika.",
    role: [
      "Dramatycznie redukuje czasy uruchamiania i ładowania",
      "Przechowuje dane trwale i bezpiecznie",
      "Łączy się bezpośrednio z szyną PCIe dla maksymalnej prędkości"
    ],
    funFact: "Najnowsze dyski NVMe (w standardzie PCIe 5.0) osiągają oszałamiającą prędkość odczytu na poziomie przekraczającym 14 000 MB/s!",
    position: [-0.42, 0.35, -1.8],
    explodedPosition: [5.85, 4, -2.6],
    color: "#f8b500",
    perfImpact: { gaming: 10, ai: 5, productivity: 15 },
    buildTip: 'Dysk M.2 wsuwamy w port pod kątem około 30 stopni, a następnie delikatnie dociskamy do płyty i blokujemy śrubką. Jeśli Twoja płyta posiada dedykowany, aluminiowy radiator na dysk, bezwzględnie pamiętaj o ściągnięciu przezroczystej folii ochronnej z termopada przed jego przykręceniem!',
    geometryArgs: [0.4, 1.2, 0.8],
    imageUrls: ["/images/components/ssd.webp", "/images/components/ssd_macro.webp", "/images/components/ssd_alt.webp", "/images/components/ssd_real.webp"],
  },
  {
    id: "psu",
    buildOrder: 5,
    name: "Zasilacz - PSU",
    description: "Konwertuje prąd przemienny z gniazdka na stabilny prąd stały, zasilając komputer.",
    role: [
      "Dostarcza czyste, stabilne napięcie do czułej elektroniki",
      "Chroni przed przepięciami i zwarciami",
      "Zasila wszystkie wewnętrzne podzespoły"
    ],
    funFact: "Wydajny zasilacz zamienia mniej prądu w bezużyteczne ciepło, oszczędzając Twoje pieniądze na rachunkach za prąd.",
    position: [-1.2, -1.86, -0.8],
    explodedPosition: [-4.55, -0.5, 4.0],
    color: "#2a363b",
    perfImpact: { gaming: 0, ai: 0, productivity: 0 },
    customStats: [
      { label: "Napięcie i Stabilność", value: 100 },
      { label: "Efektywność Energetyczna", value: 92 },
      { label: "Redukcja Szumów", value: 95 }
    ],
    buildTip: 'W zasilaczach modularnych najlepiej podpiąć wszystkie potrzebne przewody (ATX 24-pin, EPS 8-pin) przed włożeniem go do "piwnicy" obudowy. Pamiętaj też, by wentylator zasilacza skierować do dołu – dzięki temu będzie zaciągał z zewnątrz chłodne powietrze przez dolny filtr przeciwkurzowy.',
    geometryArgs: [1.8, 1, 1.5],
    imageUrls: ["/images/components/psu.webp", "/images/components/psu_macro.webp", "/images/components/psu_alt.webp", "/images/components/psu_real.webp"],
  },

  {
    id: "case_fan_1",
    buildOrder: 9,
    name: "Wentylator Obudowy - Intake Fan 1",
    description: "Wentylator wtłaczający chłodne powietrze do wnętrza obudowy, tworzący nadciśnienie.",
    role: [
      "Kieruje świeże powietrze prosto na kartę graficzną i procesor",
      "Pomaga utrzymać nadciśnienie, chroniąc przed kurzem",
      "Działa w tandemie z systemem wyciągowym"
    ],
    funFact: "Wentylatory RGB potrafią synchronizować się tworząc niesamowite, płynne pokazy świetlne wewnątrz obudowy.",
    position: [0.8, -0.8, 1.75],
    explodedPosition: [4, -1.5, 5],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Wentylatory tworzą główny obieg wiatru (Airflow). Zazwyczaj "ładna" strona z rotorem zaciąga powietrze, a tylna ze stelażem je tłoczy. Przednie wiatraki (Intake) zaciągają zimne powietrze z pokoju. Tylne i górne (Exhaust) wyrzucają wrzątek z budy na zewnątrz!',
    geometryArgs: [1.2, 1.2, 0.2],
    imageUrls: [
      '/images/components/fan.webp',
      '/images/components/fan_macro.webp',
      '/images/components/fan_alt.webp',
      '/images/components/fan_real.webp'
    ]
  },
  {
    id: "case_fan_2",
    buildOrder: 9,
    name: "Wentylator Obudowy - Intake Fan 2",
    description: "Drugi wentylator wtłaczający chłodne powietrze do wnętrza obudowy.",
    role: [
      "Kieruje świeże powietrze prosto na kartę graficzną",
      "Działa w tandemie z systemem wyciągowym"
    ],
    funFact: "Dwa wentylatory z przodu pozwalają uzyskać pożądany przepływ przy niższych i cichszych obrotach.",
    position: [0.8, 0.8, 1.75],
    explodedPosition: [3.5, 1.5, 5],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Wentylatory tworzą główny obieg wiatru (Airflow). Zazwyczaj "ładna" strona z rotorem zaciąga powietrze, a tylna ze stelażem je tłoczy. Przednie wiatraki (Intake) zaciągają zimne powietrze z pokoju. Tylne i górne (Exhaust) wyrzucają wrzątek z budy na zewnątrz!',
    geometryArgs: [1.2, 1.2, 0.2],
    imageUrls: [
      '/images/components/fan.webp',
      '/images/components/fan_macro.webp',
      '/images/components/fan_alt.webp',
      '/images/components/fan_real.webp'
    ]
  },
  {
    id: "rear_fan_1",
    buildOrder: 9,
    name: "Wentylator Wyciągowy - Exhaust Fan 1",
    description: "Zainstalowany z tyłu obudowy wentylator odpowiedzialny za wyciąganie gorącego powietrza na zewnątrz systemu.",
    role: [
      "Bezpośrednio odbiera ciepło z okolic procesora",
      "Wyrzuca rozgrzane powietrze poza obręb obudowy",
      "Równoważy ciśnienie dla optymalnej krzywej chłodzenia"
    ],
    funFact: "Wyciąg ciepłego powietrza z tyłu jest kluczowy – gorące powietrze naturalnie unosi się do góry i gromadzi z tyłu obudowy.",
    position: [-1.8, 1.4, -0.4],
    explodedPosition: [-6.3, 2.6, -0.52],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    geometryArgs: [1.2, 1.2, 0.2],
    imageUrls: [
      '/images/components/fan.webp',
      '/images/components/fan_macro.webp',
      '/images/components/fan_alt.webp',
      '/images/components/fan_real.webp'
    ]
  },
  {
    id: "rear_fan_2",
    buildOrder: 9,
    name: "Wentylator Wyciągowy - Exhaust Fan 2",
    description: "Drugi wentylator wyciągowy pracujący w parze na bocznej ramie.",
    role: [
      "Zwiększa strumień odsysanego powietrza",
      "Redukuje turbulencje na bocznej ścianie",
      "Uzupełnia obieg dla chłodzenia wodnego"
    ],
    funFact: "Podwójne wentylatory pozwalają kręcić się wolniej przy zachowaniu tej samej wydajności, co obniża hałas.",
    position: [-1.8, 1.4, 0.8],
    explodedPosition: [-6, 5, 1.04],
    color: "#ffffff",
    perfImpact: { gaming: 5, ai: 5, productivity: 2 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    geometryArgs: [1.2, 1.2, 0.2],
    imageUrls: [
      '/images/components/fan.webp',
      '/images/components/fan_macro.webp',
      '/images/components/fan_alt.webp',
      '/images/components/fan_real.webp'
    ]
  },
  {
    id: "case",
    name: "Obudowa - PC Case",
    description: "Szkielet konstrukcyjny chroniący i organizujący wszystkie komponenty komputera.",
    role: [
      "Zapewnia wsparcie strukturalne dla hardware'u",
      "Wymusza kierunek obiegu przepływającego powietrza",
      "Kryje w sobie komponenty, chroniąc je przed uszkodzeniami i zanieczyszczeniami"
    ],
    funFact: "Wczesne obudowy PC były niemal w całości beżowe, w przeciwieństwie do dzisiejszych rzeźb z hartowanego szkła i LED.",
    position: [0, 0, 0],
    explodedPosition: [0, 0.5, 0],
    color: "#4a6984",
    perfImpact: { gaming: 0, ai: 0, productivity: 0 },
    customStats: [
      { label: "Przepływ Powietrza (Airflow)", value: 90 },
      { label: "Wyciszenie Wnętrza", value: 75 },
      { label: "Kultura Pracy", value: 85 }
    ],
    geometryArgs: [4, 5, 2],
    imageUrls: ["/images/components/case.webp", "/images/components/case_macro.webp", "/images/components/case_alt.webp", "/images/components/case_real.webp"],
  },
  {
    id: 'storage_hdd',
    buildOrder: 8,
    name: "Dysk Twardy - HDD",
    description: 'Tradycyjny, magnetyczny nośnik danych o ogromnej pojemności. Używa fizycznych talerzy wirujących z prędkością tysięcy obrotów na minutę i głowicy odczytującej dane.',
    role: [
      'Główny magazyn dużych plików (zdjęcia, filmy, archiwa)',
      'Tani koszt w przeliczeniu na 1 Terabajt',
      'System tworzenia kopii zapasowych (Backup)'
    ],
    funFact: 'Talerze w dysku HDD wirują tak szybko, że głowica odczytująca lewituje ledwie 2 nanometry nad nimi! To tak, jakby lecieć Boeingiem 747 milimetr nad ziemią.',
    position: [1.3, -2.18, -0.5],
    explodedPosition: [6.8, 0, 1.5],
    color: "#4a6984",
    perfImpact: { gaming: 5, ai: 2, productivity: 30 },
    buildTip: 'Tradycyjne dyski HDD posiadają kręcące się wewnątrz talerze i mechaniczną głowicę, co czyni je wrażliwymi na wibracje. Dlatego zawsze montuj je na dołączonych saniach wyposażonych w gumowe podkładki antywibracyjne. Wytłumi to irytujące buczenie przenoszone na stalowy szkielet obudowy.',
    geometryArgs: [1.0, 0.25, 1.4],
    imageUrls: [
      '/images/components/hdd_macro.webp',
      '/images/components/hdd_alt.webp',
      '/images/components/hdd_real.webp'
    ]
  }
];
