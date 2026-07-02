export interface PCComponent {
  id: string;
  name: string;
  description: string;
  role: string[];
  funFact: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  explodedRotation?: [number, number, number];
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
  expertDetails?: {
    tool: string;
    parameter: string;
  };
  connections?: {
    name: string;
    detail: string;
  }[];
  exampleSpecs?: {
    brand: string;
    model: string;
    specs: string;
  }[];
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
    position: [-0.4, 0, -1.75],
    explodedPosition: [-6.2, 1.5, -9.75],
    explodedRotation: [-Math.PI / 48, Math.PI / 8, 0],
    color: "#1a1a2e",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Przepustowość Magistrali", value: 100 },
      { label: "Stabilność Zasilania (VRM)", value: 95 },
      { label: "Możliwości Rozbudowy", value: 85 }
    ],
    buildTip: 'Przed włożeniem płyty do obudowy upewnij się, że posiadasz odpowiednie kołki dystansowe (stand-offs). Zabezpieczają one delikatne ścieżki na odwrocie laminatu przed bezpośrednim kontaktem z metalową obudową i zwarciem.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby 6-32 lub M3. Moment: Delikatny opór (Hand-tight)"
    },
    connections: [
      { name: "Gniazdo CPU", detail: "Socket AM5 / LGA 1700 / 1851" },
      { name: "Zasilanie główne", detail: "Kabel 24-pin ATX" }
    ],
    exampleSpecs: [
      {
        brand: "ASUS",
        model: "ROG Crosshair X870E Hero",
        specs: "AM5, PCIe 5.0, Wi-Fi 7, 20+2+2 Power Stages"
      },
      {
        brand: "GIGABYTE",
        model: "Z890 AORUS XTREME",
        specs: "LGA 1851, Thunderbolt 5, 24+1+2 Phases"
      }
    ],
    geometryArgs: [3, 4.4, 0.05],
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
    position: [-0.4, 0.95, -1.6],
    explodedPosition: [-4, 6.5, -4],
    explodedRotation: [Math.PI / 6, -Math.PI / 12, 0],
    color: "#e94560",
    perfImpact: { gaming: 25, ai: 20, productivity: 40 },
    customStats: [
      { label: "Taktowanie (GHz)", value: 80 },
      { label: "Ilość Rdzeni / Wątków", value: 75 },
      { label: "Rozmiar Pamięci Cache", value: 85 }
    ],
    buildTip: 'Złoty trójkąt w rogu procesora musi idealnie pokryć się z małym oznaczeniem na gnieździe płyty głównej. Nie używaj siły – procesor musi sam grawitacyjnie "wpaść" na miejsce by uniknąć wygięcia delikatnych pinów pod spodem.',
    expertDetails: {
      tool: "Dłonie (Brak narzędzi)",
      parameter: "Zerowa siła ucisku, wyrównanie znaczników"
    },
    connections: [
      { name: "Styki procesora", detail: "Piny (PGA) lub Pola (LGA)" },
      { name: "Zasilanie i komunikacja", detail: "Bezpośrednio z gniazda płyty" }
    ],
    exampleSpecs: [
      {
        brand: "AMD",
        model: "Ryzen 9 9950X3D2 (Dual Edition)",
        specs: "Zen 5, 16 Rdzeni / 32 Wątki, 128MB 3D V-Cache"
      },
      {
        brand: "Intel",
        model: "Core Ultra 9 285K",
        specs: "Arrow Lake, 24 Rdzenie, 5.7 GHz, Intel AI Boost NPU"
      }
    ],
    geometryArgs: [0.8, 0.9, 0.05],
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
    position: [-0.4, 0.85, -1.40],
    explodedPosition: [-0.65, 6.5, 0],
    color: "#a0a0a0",
    perfImpact: { gaming: 5, ai: 5, productivity: 5 },
    customStats: [
      { label: "Wydajność Odprowadzania Ciepła", value: 95 },
      { label: "Kultura Pracy (Głośność)", value: 85 },
      { label: "Stabilność Temperatury pod Obciążeniem", value: 90 }
    ],
    buildTip: 'Nałóż najwyższej jakości pastę termoprzewodzącą (kropla wielkości groszku). Ważne jest równomierne dokręcanie chłodzenia, by rozprowadzić pastę po całym odpromienniku ciepła (IHS) bez powstawania bąbli powietrza.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby sprężynowe. Dokręcać na krzyż (X) do oporu"
    },
    connections: [
      { name: "Zasilanie pompy/wiatraka", detail: "Złącze 4-pin PWM (CPU_FAN/PUMP)" },
      { name: "Synchronizacja RGB", detail: "Złącze 3-pin ARGB (5V)" }
    ],
    exampleSpecs: [
      {
        brand: "Lian Li (AIO Ciecz)",
        model: "Galahad II LCD 360",
        specs: "Pompa Asetek 8. Gen, Wentylatory TL, Ekran IPS 2.88\""
      },
      {
        brand: "Noctua (Powietrze)",
        model: "NH-D15 G2",
        specs: "Asymetryczny Dual-Tower, 8 Ciepłowodów, 2x 140mm"
      }
    ],
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
    position: [-0.23, -0.455, -1],
    explodedPosition: [-11.2, 3.5, -3.5],
    explodedRotation: [-Math.PI / 1.7, 0, 0],
    color: "#6366f1",
    perfImpact: { gaming: 60, ai: 60, productivity: 15 },
    customStats: [
      { label: "Rdzenie Obliczeniowe", value: 95 },
      { label: "Przepustowość VRAM", value: 90 },
      { label: "Zapotrzebowanie na Moc", value: 85 }
    ],
    buildTip: 'Najcięższy element zestawu. Zawsze upewnij się, że plastikowy zatrzask z prawej strony portu PCIe x16 jest otwarty, a karta przy wsuwaniu wydaje satysfakcjonujące kliknięcie.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby 6-32 UNC. Wymagane mocne dociśnięcie śledzia"
    },
    connections: [
      { name: "Szyna danych (Płyta Gł.)", detail: "Slot PCIe x16 (Gen 4.0/5.0)" },
      { name: "Zasilanie dodatkowe", detail: "Wtyk 12V-2x6 (12VHPWR) lub 3x 8-pin" }
    ],
    exampleSpecs: [
      {
        brand: "NVIDIA",
        model: "GeForce RTX 5090 Founders Edition",
        specs: "Architektura Blackwell, 32GB GDDR7, DLSS 4.5"
      },
      {
        brand: "AMD",
        model: "Radeon RX 9070 XT",
        specs: "Architektura RDNA 4, 24GB GDDR6, FSR 4.0"
      }
    ],
    geometryArgs: [2.2, 0.4, 1.4],
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
    position: [0.4, 0.86, -1.55],
    explodedPosition: [3, 7.15, -5.95],
    explodedRotation: [0, -Math.PI / 8, Math.PI / 16],
    color: "#00b8a9",
    perfImpact: { gaming: 10, ai: 15, productivity: 20 },
    customStats: [
      { label: "Prędkość Taktowania (MT/s)", value: 85 },
      { label: "Niskie Opóźnienia (CL)", value: 80 },
      { label: "Przepustowość", value: 90 }
    ],
    buildTip: 'Aby aktywować tryb Dual Channel (co drastycznie zwiększa wydajność), pamięci należy montować parami w slotach A2 i B2 (drugi i czwarty od procesora). Między kościami musi zostać jeden wolny slot! Otwórz zatrzaski, wsuń kości i dociśnij je równomiernie, aż usłyszysz wyraźny "klik".',
    expertDetails: {
      tool: "Dłonie (Brak narzędzi)",
      parameter: "Równomierny obustronny nacisk aż do zatrzaśnięcia"
    },
    connections: [
      { name: "Standard Gniazda", detail: "Slot DIMM DDR5" },
      { name: "Zasilanie układu", detail: "Napięcie ok. 1.1V - 1.45V z płyty" }
    ],
    exampleSpecs: [
      {
        brand: "G.Skill",
        model: "Trident Z5 Neo RGB",
        specs: "64GB (2x32GB), DDR5-8000 MT/s, Ultra-low CL38"
      },
      {
        brand: "Corsair",
        model: "Dominator Titanium",
        specs: "64GB (2x32GB), DDR5-8200 MT/s, XMP 3.0"
      }
    ],
    geometryArgs: [0.5, 1.95, 0.8],
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
    position: [0.68, 0.86, -1.55],
    explodedPosition: [4, 7.15, -5.95],
    explodedRotation: [0, -Math.PI / 8, -Math.PI / 16],
    color: "#00b8a9",
    perfImpact: { gaming: 2, ai: 1, productivity: 5 },
    customStats: [
      { label: "Prędkość Taktowania (MT/s)", value: 85 },
      { label: "Niskie Opóźnienia (CL)", value: 80 },
      { label: "Przepustowość", value: 90 }
    ],
    buildTip: 'Dla poprawnej aktywacji trybu Dual Channel, obsadzaj sloty A2 i B2 (drugi i czwarty od procesora). Zawsze nasłuchuj charakterystycznego "klikania" po obu stronach modułu.',
    expertDetails: {
      tool: "Dłonie (Brak narzędzi)",
      parameter: "Równomierny obustronny nacisk wzdłuż osi"
    },
    connections: [
      { name: "Standard Gniazda", detail: "Slot DIMM DDR5" },
      { name: "Kanał roboczy", detail: "Dual-Channel (razem z modułem nr 1)" }
    ],
    exampleSpecs: [
      {
        brand: "G.Skill",
        model: "Trident Z5 Neo RGB",
        specs: "64GB (2x32GB), DDR5-8000 MT/s, Ultra-low CL38"
      },
      {
        brand: "Corsair",
        model: "Dominator Titanium",
        specs: "64GB (2x32GB), DDR5-8200 MT/s, XMP 3.0"
      }
    ],
    geometryArgs: [0.5, 1.95, 0.8],
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
    position: [-0.7, -0.5, -1.75],
    explodedPosition: [8, 4.5, -5],
    explodedRotation: [Math.PI / 6, Math.PI / 12, 0],
    color: "#f8b500",
    perfImpact: { gaming: 10, ai: 5, productivity: 15 },
    customStats: [
      { label: "Prędkość Odczytu", value: 95 },
      { label: "Prędkość Zapisu", value: 90 },
      { label: "Trwałość (TBW)", value: 80 }
    ],
    buildTip: 'Kluczem jest odpowiedni kąt wsunięcia (ok. 30 stopni). Jeśli instalujesz dysk pod masywnym radiatorem dostarczonym wraz z płytą, zdejmij najpierw z niego ochronną warstwę plastiku.',
    expertDetails: {
      tool: "Wkrętak precyzyjny (Phillips #0)",
      parameter: "Śruba M2x3mm. Minimalny moment, ryzyko pęknięcia PCB"
    },
    connections: [
      { name: "Złącze Płyty Głównej", detail: "Gniazdo M.2 (Klucz M)" },
      { name: "Magistrala danych", detail: "Protokół NVMe (PCIe x4)" }
    ],
    exampleSpecs: [
      {
        brand: "Crucial",
        model: "T705 PCIe Gen5 NVMe",
        specs: "Odczyt: 14,500 MB/s, Zapis: 12,700 MB/s, 232-Layer NAND"
      },
      {
        brand: "Samsung",
        model: "990 PRO Gen4",
        specs: "Odczyt: 7,450 MB/s, Zapis: 6,900 MB/s, V-NAND TLC"
      }
    ],
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
    position: [-1.2, -1.8, -0.8],
    explodedPosition: [-6, -0.1, 5.0],
    explodedRotation: [-Math.PI / 12, -Math.PI / 6, 0],
    color: "#2a363b",
    perfImpact: { gaming: 0, ai: 0, productivity: 0 },
    customStats: [
      { label: "Napięcie i Stabilność", value: 100 },
      { label: "Efektywność Energetyczna", value: 92 },
      { label: "Redukcja Szumów", value: 95 }
    ],
    buildTip: 'Zasilacz ułóż tak, aby jego wentylator skierowany był bezpośrednio w stronę wlotu powietrza z filtrem w obudowie. Podpinaj potężne wiązki kablowe na płasko przed ostatecznym osadzeniem bloku.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "4x śruby 6-32 UNC na stelażu tylnym. Przełącznik I/O na 0"
    },
    connections: [
      { name: "Zasilanie Płyty i CPU", detail: "Kable 24-pin ATX, 2x 8-pin EPS" },
      { name: "Zasilanie GPU", detail: "Kabel 12V-2x6 (12VHPWR)" }
    ],
    exampleSpecs: [
      {
        brand: "Seasonic",
        model: "Prime ATX 3.1 TX-1600",
        specs: "1600W, Certyfikat 80+ Titanium, Natywne złącza 12V-2x6"
      },
      {
        brand: "Corsair",
        model: "AX1600i",
        specs: "1600W, Cyfrowe zasilanie DSP, Wentylator FDB"
      }
    ],
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
    position: [0.8, -0.65, 1.75],
    explodedPosition: [4, -1.3, 5],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Przód komputera działa jak płuca. Frontowa, wyeksponowana część wentylatora musi patrzeć na pokój, aby zaciągać do wnętrza rześkie, niefiltrowane powietrze, budując nadciśnienie.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby samogwintujące. Do oporu i zaprzestania ślizgu"
    },
    connections: [
      { name: "Zasilanie silnika", detail: "Kabel 4-pin PWM (SYS_FAN)" },
      { name: "Podświetlenie", detail: "Kabel 3-pin ARGB (5V)" }
    ],
    exampleSpecs: [{ brand: "Noctua", model: "NF-A14x25 G2 PWM", specs: "140mm, Sterrox LCP, 0.5mm clearance" }, { brand: "Phanteks", model: "T30-120", specs: "120mm x 30mm, 3000 RPM, Ogromne ciśnienie" }],
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
    position: [0.8, 0.85, 1.75],
    explodedPosition: [3.5, 1.5, 5],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Kolejny element płuc (Intake). Zadbaj, aby kable łączące oświetlenie i obroty wychodziły blisko tacki tylnej, by ułatwić zarządzanie okablowaniem.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby samogwintujące. Do oporu i zaprzestania ślizgu"
    },
    exampleSpecs: [{ brand: "Noctua", model: "NF-A14x25 G2 PWM", specs: "140mm, Sterrox LCP, 0.5mm clearance" }, { brand: "Phanteks", model: "T30-120", specs: "120mm x 30mm, 3000 RPM, Ogromne ciśnienie" }],
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
    explodedPosition: [-7, 2.2, -0.52],
    explodedRotation: [0, Math.PI / 4, 0],
    color: "#ffffff",
    perfImpact: { gaming: 10, ai: 10, productivity: 5 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Tył komputera to tzw. Exhaust. Brzydsza strona ze wspornikami silnika musi być skierowana na zewnątrz, by móc aktywnie odsysać powietrze ugotowane przez procesor.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby samogwintujące lub antywibracyjne kołki silikonowe"
    },
    connections: [
      { name: "Zasilanie silnika", detail: "Kabel 4-pin PWM (SYS_FAN)" },
      { name: "Podświetlenie", detail: "Kabel 3-pin ARGB (5V)" }
    ],
    exampleSpecs: [{ brand: "Noctua", model: "NF-A14x25 G2 PWM", specs: "140mm, Sterrox LCP, 0.5mm clearance" }, { brand: "Phanteks", model: "T30-120", specs: "120mm x 30mm, 3000 RPM, Ogromne ciśnienie" }],
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
    explodedPosition: [-6, 5.2, 1.04],
    explodedRotation: [0, Math.PI / 4, 0],
    color: "#ffffff",
    perfImpact: { gaming: 5, ai: 5, productivity: 2 },
    customStats: [
      { label: "Przepływ Powietrza (CFM)", value: 85 },
      { label: "Ciśnienie Statyczne", value: 70 },
      { label: "Kultura Pracy (Głośność)", value: 90 }
    ],
    buildTip: 'Zbalansowany wyciąg ciepła. Pilnuj, by nie zbudować większego ciągu wylotowego niż dolotowego, by uniknąć wciągania kurzu szczelinami blach.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2)",
      parameter: "Śruby samogwintujące lub antywibracyjne kołki silikonowe"
    },
    exampleSpecs: [{ brand: "Noctua", model: "NF-A14x25 G2 PWM", specs: "140mm, Sterrox LCP, 0.5mm clearance" }, { brand: "Phanteks", model: "T30-120", specs: "120mm x 30mm, 3000 RPM, Ogromne ciśnienie" }],
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
    position: [0, 0.1, 0],
    explodedPosition: [0, 1, -6.7],
    color: "#4a6984",
    perfImpact: { gaming: 0, ai: 0, productivity: 0 },
    customStats: [
      { label: "Przepływ Powietrza (Airflow)", value: 90 },
      { label: "Wyciszenie Wnętrza", value: 75 },
      { label: "Kultura Pracy", value: 85 }
    ],
    connections: [
      { name: "Kable Front Panelu", detail: "USB-C, USB-A, Audio, Power SW" },
      { name: "Wspierane Płyty Gł.", detail: "E-ATX, ATX, Micro-ATX, Mini-ITX" }
    ],
    exampleSpecs: [{ brand: "HYTE", model: "Y70 Touch Infinite", specs: "Dwukomorowa, Szkło bez słupków, Ekran 4K" }, { brand: "Lian Li", model: "O11 Vision", specs: "Brak słupków, 3 panele ze szkła hartowanego" }],
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
    position: [1.3, -2, -0.45],
    explodedPosition: [7.5, 0, 1.5],
    explodedRotation: [Math.PI / 8, Math.PI / 8, 0],
    color: "#4a6984",
    perfImpact: { gaming: 5, ai: 2, productivity: 30 },
    customStats: [
      { label: "Pojemność Magazynowa", value: 95 },
      { label: "Trwałość Archiwalna", value: 90 },
      { label: "Odporność na Wibracje", value: 60 }
    ],
    buildTip: 'Te dyski to staroszkolne urządzenia mechaniczne wrażliwe na przeciążenia. Zawsze korzystaj z dołączonych podkładek antywibracyjnych w saneczkach, by wyciszyć ich naturalne stukanie i wibracje.',
    expertDetails: {
      tool: "Wkrętak krzyżakowy (Phillips #2) lub zatrzaski",
      parameter: "Gwint 6-32. Uważać by nie zgnieść gumowych damperów"
    },
    connections: [
      { name: "Transfer Danych", detail: "Kabel sygnałowy SATA III (6 Gb/s)" },
      { name: "Zasilanie napędu", detail: "Kabel zasilający SATA" }
    ],
    exampleSpecs: [{ brand: "Seagate", model: "IronWolf Pro 24TB", specs: "SATA 6Gb/s, 7200 RPM, Zapis CMR" }, { brand: "WD", model: "Red Pro 24TB", specs: "Optymalizowany pod NAS, Technologia OptiNAND" }],
    geometryArgs: [1.0, 0.45, 1.4],
    imageUrls: [
      '/images/components/hdd_macro.webp',
      '/images/components/hdd_alt.webp',
      '/images/components/hdd_real.webp'
    ]
  }
];
