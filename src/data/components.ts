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
}

export const pcComponents: PCComponent[] = [
  {
    id: "motherboard",
    name: "Płyta Główna - Motherboard",
    description: "Główna płytka drukowana, która łączy wszystkie komponenty ze sobą, stanowiąc kręgosłup komputera.",
    role: [
      "Dystrybuuje zasilanie i filtruje napięcia poprzez sekcję zasilania (VRM)",
      "Umożliwia komunikację między CPU, RAM i GPU",
      "Przechowuje oprogramowanie BIOS/UEFI"
    ],
    funFact: "Nowoczesne płyty główne mogą mieć ponad 10 warstw włókna szklanego i miedzianych ścieżek.",
    position: [-0.45, 0, -1.75],
    explodedPosition: [-5.5, 1.5, -9.75],
    color: "#1a1a2e",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Przepustowość Magistrali", value: 100 },
      { label: "Stabilność Zasilania (VRM)", value: 95 },
      { label: "Możliwości Rozbudowy", value: 85 }
    ],
    geometryArgs: [3, 4, 0.05],
    imageUrls: ["/images/components/motherboard.webp", "/images/components/motherboard_macro.webp", "/images/components/mb_alt.webp", "/images/components/motherboard_real.webp"],
  },
  {
    id: "cpu",
    name: "Procesor - CPU",
    description: "Główny układ obliczeniowy komputera, pełniący rolę jego elektronicznego mózgu.",
    role: [
      "Wykonuje instrukcje programów",
      "Przeprowadza skomplikowane obliczenia matematyczne",
      "Koordynuje działanie całego systemu, delegując wyspecjalizowane zadania do GPU i RAMu"
    ],
    funFact: "Współczesny procesor zawiera miliardy mikroskopijnych tranzystorów na powierzchni kilku centymetrów kwadratowych.",
    position: [-0.45, 0.95, -1.7],
    explodedPosition: [-2.54, 6.5, -2.6],
    color: "#e94560",
    perfImpact: { gaming: 25, ai: 20, productivity: 40 },
    customStats: [
      { label: "Częstotliwość Taktowania (Ghz)", value: 80 },
      { label: "Ilość Rdzeni / Wątków", value: 75 },
      { label: "Rozmiar Pamięci Cache", value: 85 }
    ],
    geometryArgs: [0.8, 0.8, 0.05],
    imageUrls: ["/images/components/cpu.webp", "/images/components/cpu_macro.webp", "/images/components/cpu_alt.webp", "/images/components/cpu_real.webp"],
  },
  {
    id: "cpu_cooler",
    name: "Chłodzenie Procesora - CPU Cooler",
    description: "Rozprasza ciepło generowane przez procesor, zapobiegając przegrzaniu i spadkom wydajności (thermal throttling).",
    role: [
      "Odbiera ciepło poprzez miedziany lub aluminiowy blok",
      "Przenosi ciepło na radiatory za pomocą ciepłowodów",
      "Wydmuchuje gorące powietrze za pomocą dedykowanego wentylatora"
    ],
    funFact: "Woda używana w chłodzeniach cieczą (AIO) potrafi odebrać ciepło z procesora ponad 20 razy szybciej niż powietrze, redukując nagłe skoki temperatur (tzw. spiki).",
    position: [-0.45, 0.85, -1.40],
    explodedPosition: [-0.65, 7.5, 0],
    color: "#a0a0a0",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Wydajność Odprowadzania Ciepła", value: 95 },
      { label: "Kultura Pracy (Głośność)", value: 85 },
      { label: "Stabilność Temperatury pod Obciążeniem", value: 90 }
    ],
    geometryArgs: [1, 1.3, 0.8],
    imageUrls: ["/images/components/cooler.webp", "/images/components/cooler_macro.webp", "/images/components/cooler_alt.webp", "/images/components/cooler_real.webp"],
  },
  {
    id: "gpu",
    name: "Karta Graficzna - GPU",
    description: "Wyspecjalizowany procesor zaprojektowany do akceleracji renderowania grafiki oraz obliczeń równoległych.",
    role: [
      "Renderuje grafikę 3D oraz wideo",
      "Akceleruje zadania związane ze sztuczną inteligencją",
      "Przetwarza potężne pakiety danych równolegle"
    ],
    funFact: "Współczesne układy graficzne (GPU) są wykorzystywane nie tylko w grach, ale także jako potężne 'mózgi' dla sztucznej inteligencji, ponieważ potrafią przetwarzać tysiące operacji matematycznych jednocześnie.",
    position: [-0.25, -0.1, -1.15],
    explodedPosition: [-9, 0.65, -3.25],
    color: "#6366f1",
    perfImpact: { gaming: 60, ai: 60, productivity: 15 },
    geometryArgs: [2.5, 0.5, 1.2],
    imageUrls: ["/images/components/gpu.webp", "/images/components/gpu_macro.webp", "/images/components/gpu_alt.webp", "/images/components/gpu_real.webp"],
  },
  {
    id: "ram_1",
    name: "Pamięć RAM - Memory Module",
    description: "Pamięć operacyjna o ultra-niskich opóźnieniach (rzędu nanosekund), używana przez procesor do przechowywania aktualnie działających programów.",
    role: [
      "Przechowuje dane dla błyskawicznego dostępu przez CPU",
      "Umożliwia wielozadaniowość bez zacięć systemu",
      "Traci wszystkie dane w momencie odłączenia zasilania"
    ],
    funFact: "Pamięć RAM jest około 100 000 razy szybsza od tradycyjnego dysku twardego HDD.",
    position: [0.35, 0.95, -1.55],
    explodedPosition: [2.02, 7.15, -5.95],
    color: "#00b8a9",
    perfImpact: { gaming: 10, ai: 15, productivity: 20 },
    geometryArgs: [0.1, 1.2, 0.4],
    imageUrls: ["/images/components/ram.webp", "/images/components/ram_macro.webp", "/images/components/ram_alt.webp", "/images/components/ram_real.webp"],
  },
  {
    id: "ram_2",
    name: "Pamięć RAM - Memory Module",
    description: "Drugi moduł pamięci operacyjnej, pracujący w parze w celu maksymalizacji przepustowości.",
    role: [
      "Działa w trybie dual-channel, podwajając przepustowość pamięci",
      "Zwiększa całkowitą pojemność do obsługi ciężkich zadań",
      "Redukuje zacinanie się w nowoczesnych grach"
    ],
    funFact: "Użycie dwóch kości RAM zamiast jednej dużej może zwiększyć wydajność procesora nawet o 15%.",
    position: [0.63, 0.95, -1.55],
    explodedPosition: [3.38, 7.15, -5.95],
    color: "#00b8a9",
    perfImpact: { gaming: 2, ai: 1, productivity: 5 },
    geometryArgs: [0.1, 1.2, 0.4],
    imageUrls: ["/images/components/ram.webp", "/images/components/ram_macro.webp", "/images/components/ram_alt.webp", "/images/components/ram_real.webp"],
  },
  {
    id: "ssd",
    name: "Dysk NVMe - SSD",
    description: "Ultraszybka pamięć masowa przechowująca system operacyjny, gry oraz wszystkie pliki użytkownika.",
    role: [
      "Dramatycznie redukuje czasy uruchamiania i ładowania",
      "Przechowuje dane trwale i bezpiecznie",
      "Łączy się bezpośrednio z szyną PCIe dla maksymalnej prędkości"
    ],
    funFact: "Najnowsze dyski NVMe (w standardzie PCIe 5.0) osiągają oszałamiającą prędkość odczytu na poziomie przekraczającym 14 000 MB/s!",
    position: [-0.45, 0.35, -1.7],
    explodedPosition: [5.85, 4, -2.6],
    color: "#f8b500",
    perfImpact: { gaming: 10, ai: 5, productivity: 15 },
    geometryArgs: [0.2, 0.8, 0.05],
    imageUrls: ["/images/components/ssd.webp", "/images/components/ssd_macro.webp", "/images/components/ssd_alt.webp", "/images/components/ssd_real.webp"],
  },
  {
    id: "psu",
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
    geometryArgs: [1.8, 1, 1.5],
    imageUrls: ["/images/components/psu.webp", "/images/components/psu_macro.webp", "/images/components/psu_alt.webp", "/images/components/psu_real.webp"],
  },

  {
    id: "case_fan_1",
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
    name: "Wentylator Wyciągowy - Exhaust Fan 1",
    description: "Zainstalowany z tyłu obudowy wentylator odpowiedzialny za wyciąganie gorącego powietrza na zewnątrz systemu.",
    role: [
      "Bezpośrednio odbiera ciepło z okolic procesora",
      "Wyrzuca rozgrzane powietrze poza obręb obudowy",
      "Równoważy ciśnienie dla optymalnej krzywej chłodzenia"
    ],
    funFact: "Wyciąg ciepłego powietrza z tyłu jest kluczowy – gorące powietrze naturalnie unosi się do góry i gromadzi z tyłu obudowy.",
    position: [-1.8, 1.4, -0.4],
    explodedPosition: [-6, 2.6, -0.52],
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
    name: "Wentylator Wyciągowy - Exhaust Fan 2",
    description: "Drugi wentylator wyciągowy pracujący w parze na bocznej ramie.",
    role: [
      "Zwiększa strumień odsysanego powietrza",
      "Redukuje turbulencje na bocznej ścianie",
      "Uzupełnia obieg dla chłodzenia wodnego"
    ],
    funFact: "Podwójne wentylatory pozwalają kręcić się wolniej przy zachowaniu tej samej wydajności, co obniża hałas.",
    position: [-1.8, 1.4, 0.8],
    explodedPosition: [-6, 4.8, 1.04],
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
    geometryArgs: [1.0, 0.25, 1.4],
    imageUrls: [
      '/images/components/hdd_macro.webp',
      '/images/components/hdd_alt.webp',
      '/images/components/hdd_real.webp'
    ]
  }
];
