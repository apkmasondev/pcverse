# PCVerse - 3D Design Guidelines

Niniejszy dokument to zbiór żelaznych zasad i dobrych praktyk projektowania i kodowania obiektów 3D w projekcie PCVerse. Został stworzony na bazie obszernego audytu kodu, by chronić projekt przed "długiem technologicznym 3D", spadkami klatek na sekundę (FPS) i błędami renderowania (np. Z-Fighting).

Przestrzegaj tych zasad przy tworzeniu każdego nowego komponentu komputera (karty graficznej, zasilacza, płyty głównej itp.) w katalogu `src/components/PCModel/geometries/`.

## 1. Walka z Z-Fightingiem (Nakładające się płaszczyzny)
**Problem:** Dwie powierzchnie (np. lity plastik i płaska naklejka z teksturą) renderowane na dokładnie tej samej płaszczyźnie osi (np. na głębokości `Z = 0.05`) będą nieustannie "walczyć" o pierwszeństwo pikseli na ekranie, wywołując irytujący efekt migotania przy obracaniu kamerą.

**Rozwiązanie:** 
Gdy dodajesz płaską geometrię (`<planeGeometry />`) działającą jak naklejka/etykieta z teksturą, na lity na blok (`<boxGeometry />`), **zawsze używaj parametru `polygonOffset`** w materiale płaszczyzny:
```tsx
{/* PRAWIDŁOWY SPOSÓB APLIKACJI TEKSTURY PŁASKIEJ NA BRYŁĘ */}
<mesh position={[0, 0, 0]}>
  <planeGeometry args={[1, 1]} />
  <meshStandardMaterial 
    map={myTexture} 
    transparent={true} 
    polygonOffset={true} 
    polygonOffsetFactor={-1} 
    polygonOffsetUnits={-1} 
  />
</mesh>
```
To "oszukuje" silnik przeglądarki, wymuszając narysowanie naklejki zawsze o ułamek milimetra nad powierzchnią obiektu dominującego, eliminując z-fighting bez konieczności zabawy w mikro-koordynaty (np. przesunięcia `Z = 0.0001`).

## 2. Architektura Grup (Relatywne Współrzędne Lokalne)
**Problem:** Zbudowanie całego układu, np. gniazda PCIe i pinów bezpośrednio względem globalnych współrzędnych sceny sprawia, że przy jakiejkolwiek próbie przesunięcia slotu PCIe o ułamek milimetra, koder musi ręcznie korygować pozycję dziesiątek mniejszych brył wewnętrznych gniazda.

**Rozwiązanie:** 
Zawsze używaj tagu `<group>`! Każdy logiczny "moduł" na płycie głównej (np. procesor, zasilanie, RAM, bateria CMOS) musi stanowić odrębną grupę. W grupie ustawiamy Globalną Pozycję, a wewnątrz niej – wszystkie pozycje to koordynaty lokalne (przeważnie od `0, 0, 0`).
```tsx
{/* PRAWIDŁOWY SPOSÓB BUDOWY ZŁOŻONEGO ELEMENTU */}
<group position={[1.2, -0.5, 0.1]}> {/* Przesunięcie całej sekcji bazowej */}
  
  <mesh position={[0, 0, 0]}> {/* Główne ciało slotu, wyrównane w centrum */}
    <boxGeometry args={[2, 0.4, 0.2]} />
    <meshStandardMaterial color="black" />
  </mesh>
  
  <mesh position={[0.5, 0, 0.11]}> {/* Detale lokalne przesuwane WZGLĘDEM środka slotu */}
    <boxGeometry args={[0.2, 0.2, 0.02]} />
    <meshStandardMaterial color="gold" />
  </mesh>

</group>
```

## 3. Zakaz "Martwych" lub Ukrytych Geometrii
**Problem:** Geometrie generują "Draw Calls" w karcie graficznej. Setki małych klocków, wtyczek i radiatorów, które nakładają się na siebie w kodzie tak bardzo, że całkowicie giną wewnątrz siebie nawzajem (np. czarny klocek wewnątrz metalowego slotu PCIe).

**Rozwiązanie:** 
Rzeźb czysto! Jeśli bryła A całkowicie zasłania bryłę B i bryła B nie ma sensu funkcjonalnego/wizualnego - usuń bryłę B z kodu. Zawsze modeluj krawędzie do styku lub wymodeluj to jako jedną wspólną siatkę. WebGL nie potrzebuje renderować trójkątów, których użytkownik fizycznie nie może zobaczyć z żadnej strony.

## 4. Oszczędzanie Draw Calls - Potęga Instancji (`<Instances>`)
**Problem:** Płyta główna komputera składa się z setek powtarzalnych, identycznych części - piny, kondensatory sekcji zasilania VRM, dziesiątki żeberek radiatorów chłodzących. Renderowanie każdego z osobna tworzy w kodzie dziesiątki `<mesh>`, zabijając płynność (FPS) na słabszych urządzeniach i smartfonach.

**Rozwiązanie:** 
Zamiast mnożyć `<mesh>`, korzystaj z biblioteki `@react-three/drei` i zestawu tagów `<Instances>` / `<Instance>`. W ten sposób karta graficzna dostanie od procesora paczkę informacji o modelu "Kondensator", ale komendę narysuj dostanie tylko RAAZ dla wszystkich 30 sztuk na raz.

```tsx
import { Instances, Instance } from '@react-three/drei';

{/* Renderowanie jednego obiektu w 3 miejscach z jednym narzutem wydajnościowym */}
<Instances limit={100}>
  <boxGeometry args={[0.1, 0.3, 0.1]} />
  <meshStandardMaterial color="silver" />
  <group>
    <Instance position={[0, 1, 0]} />
    <Instance position={[0, 2, 0]} />
    <Instance position={[0, 3, 0]} />
  </group>
</Instances>
```

## 5. Optymalizacja Trybu Prześwietlenia (X-Ray Mode)
Z powodu złożoności materiałowej we Frameworku Three.js i R3F, unikaj inwazyjnego modyfikowania sceny (tzw. `scene.traverse()`), aby wymuszać efekt siatki (Wireframe). To drastycznie blokuje główny wątek (tzw. zjawisko *stuttering* i *race condition* z frameworkiem React).

Rozwiązaniem poprawnym jest wstrzykiwanie flagi boolowskiej za pomocą kontekstu (`usePCSettings().xrayMode`) i wariantowe przepinanie podanego materiału bezpośrednio w strukturze JSX dla każdej siatki z osobna. Zawsze stosuj globalnie zdefiniowany `xrayMaterial` (wyeksportowany z `materials.ts`).

## 6. Zapobieganie Wyciekom Pamięci (Garbage Collection)
**Problem:** Złożone geometrie proceduralne generowane w locie (jak `ExtrudeGeometry`, `TubeGeometry` dla kabli, czy `ShapeGeometry`) nie są automatycznie usuwane z pamięci VRAM (pamięci karty graficznej) po odmontowaniu komponentu w React Three Fiber. Prowadzi to do potężnych wycieków pamięci i crashy na urządzeniach mobilnych (Zgłoszenie z audytu: C7).

**Rozwiązanie:** 
Zawsze przypinaj `ref` do ciężkich geometrii proceduralnych i wywołuj na nich metodę `dispose()` w bloku czyszczącym (cleanup) hooka `useEffect`:

```tsx
const geometryRef = useRef<ExtrudeGeometry>(null);

useEffect(() => {
  // Funkcja czyszcząca wywoływana przy Unmount
  return () => {
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }
  };
}, []);

return (
  <mesh>
    <extrudeGeometry ref={geometryRef} args={[shape, extrudeSettings]} />
  </mesh>
)
```

## 7. Współdzielenie Materiałów (Unikanie Inline Materials)
**Problem:** Deklarowanie materiałów bezpośrednio w JSX (np. `<meshStandardMaterial color="#151515" roughness={0.6} />`) sprawia, że React Three Fiber przy każdym użyciu tworzy nową, unikalną instancję materiału w pamięci karty graficznej (Zgłoszenie z audytu v2: P1). Setki takich samych materiałów drastycznie zwiększają zużycie VRAM i ilość Draw Calls.

**Rozwiązanie:** 
Zawsze staraj się korzystać z predefiniowanych, wyeksportowanych instancji materiałów (np. ze słownika `materials.ts`). W JSX przypinaj je za pomocą tagu `<primitive>`:

```tsx
import { materials } from '../materials';

{/* PRAWIDŁOWY SPOSÓB: Współdzielenie 1 instancji materiału */}
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <primitive object={materials.darkMetal} attach="material" />
</mesh>
```
W ostateczności, w przypadku proceduralnych kolorów, deklaruj materiały po za komponentem lub używaj hooka `useMemo`.

## 8. Optymalizacja Importów z Three.js (Tree-Shaking)
**Problem:** Używanie dzikiej karty `import * as THREE from 'three'` sprawia, że narzędzia do bundlowania (jak Vite/Rollup) nie potrafią efektywnie wyciąć nieużywanego kodu (tree-shaking). Prowadzi to do drastycznego powiększenia finalnego rozmiaru aplikacji, obciążając pamięć RAM i czas ładowania przeglądarki użytkownika, ponieważ importowana jest cała potężna biblioteka Three.js, nawet jeśli używamy z niej tylko obiektu `Vector3`.

**Rozwiązanie:** 
Zawsze używaj importów nazwanych. Zamiast importować wszystko, deklaruj precyzyjnie te elementy, których fizycznie używasz w komponencie:

```tsx
{/* ŹLE: Powoduje wczytanie całego Three.js (duży rozmiar paczki) */}
import * as THREE from 'three';
// ...
const vec = new THREE.Vector3();

{/* DOBRZE: Pozwala na perfekcyjny Tree-Shaking */}
import { Vector3, MeshStandardMaterial } from 'three';
// ...
const vec = new Vector3();
```

---

## 9. Zarządzanie Stanem i Unikanie Re-renderów Lawinowych
**Problem:** Opieranie zmiennych 3D o wysokiej częstotliwości zmian (np. kolory RGB, animacje, tryby wyświetlania) o klasyczny `React.Context` powoduje pełne przebudowywanie kilkunastu komponentów naraz, zabijając FPS.
**Rozwiązanie:** Dla izolowanych stanów 3D używaj wzorców z zewnętrznymi store'ami (Zustand/Jotai) pozwalających na subskrypcję pojedynczych wartości. Nigdy nie ładuj szybko zmieniających się flag (np. `explodeMode`) do wspólnego wora kontekstowego. Do efektów tymczasowych (duchy, hover) używaj globalnie wyeksportowanych materiałów z `materials.ts`, unikając tworzenia nowych obiektów w JSX.

---
Dbając o powyższe 9 filarów zagwarantujesz, że renderowana scena 3D pozostanie wolna od błędów wizualnych (glitchy) oraz zachowa stabilność pamięci i wydajność powyżej optymalnych 60 FPS na każdym urządzeniu.
