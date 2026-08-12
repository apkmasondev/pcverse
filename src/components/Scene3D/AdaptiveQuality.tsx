import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useQualityStore } from '../../store/useQualityStore';

/** Ignorujemy pierwsze klatki — kompilacja shaderów i upload tekstur zawyżają frame time. */
const WARMUP_MS = 2000;
/** Długość pojedynczego okna pomiarowego w fazie intensywnego monitoringu. */
const WINDOW_MS = 1000;
/** Liczba okien fazy startowej (~8 s po starcie sceny). */
const STARTUP_WINDOWS = 8;
/** Po fazie startowej próbkujemy rzadziej — tylko jako zabezpieczenie przed przegrzaniem/throttlingiem. */
const WATCHDOG_WINDOW_MS = 5000;

/** Poniżej tej wartości scena jest nieużywalna — schodzimy od razu na najniższy poziom. */
const CRITICAL_FPS = 20;
/** Poniżej tej wartości obniżamy jakość o jeden poziom po dwóch kolejnych oknach. */
const DEGRADED_FPS = 35;
/** Ile kolejnych „słabych” okien musi wystąpić, zanim zareagujemy. */
const DEGRADED_WINDOWS_REQUIRED = 2;

/**
 * Runtime'owy monitor FPS. Mierzy realną liczbę klatek w oknach czasowych
 * i obniża tier jakości, gdy sprzęt nie wyrabia — niezależnie od wstępnej
 * detekcji sprzętowej, która potrafi się mylić (np. dedykowane GPU
 * w laptopie działające na trybie oszczędzania energii).
 *
 * Jakość zmienia się wyłącznie w dół. Przywracanie wyższego poziomu przy
 * wahaniach FPS powodowałoby oscylację (każda zmiana `dpr` to realokacja
 * bufora renderu), więc świadomie z niego rezygnujemy.
 */
export const AdaptiveQuality = ({ active }: { active: boolean }) => {
  const applyTier = useQualityStore(state => state.applyTier);
  const downgrade = useQualityStore(state => state.downgrade);
  const setMeasuredFps = useQualityStore(state => state.setMeasuredFps);

  const elapsedRef = useRef(0);
  const windowTimeRef = useRef(0);
  const windowFramesRef = useRef(0);
  const windowsCompletedRef = useRef(0);
  const degradedStreakRef = useRef(0);

  useFrame((_state, delta) => {
    if (!active) return;

    // Duże `delta` (powrót z zakładki w tle, zawieszenie wątku) nie jest
    // miarodajnym pomiarem wydajności — kasujemy bieżące okno.
    if (delta > 0.5) {
      windowTimeRef.current = 0;
      windowFramesRef.current = 0;
      return;
    }

    elapsedRef.current += delta * 1000;
    if (elapsedRef.current < WARMUP_MS) return;

    windowTimeRef.current += delta * 1000;
    windowFramesRef.current += 1;

    const windowLength = windowsCompletedRef.current < STARTUP_WINDOWS ? WINDOW_MS : WATCHDOG_WINDOW_MS;
    if (windowTimeRef.current < windowLength) return;

    const fps = (windowFramesRef.current * 1000) / windowTimeRef.current;
    const measuredIn = windowTimeRef.current;
    windowTimeRef.current = 0;
    windowFramesRef.current = 0;
    windowsCompletedRef.current += 1;
    setMeasuredFps(fps);

    if (fps < CRITICAL_FPS) {
      degradedStreakRef.current = 0;
      applyTier('low', `krytycznie niski FPS (${Math.round(fps)})`);
      // Po zmianie ustawień dajemy scenie czas na ustabilizowanie się.
      elapsedRef.current = 0;
      return;
    }

    if (fps < DEGRADED_FPS) {
      degradedStreakRef.current += 1;
      if (degradedStreakRef.current >= DEGRADED_WINDOWS_REQUIRED) {
        degradedStreakRef.current = 0;
        downgrade(`niski FPS (${Math.round(fps)}) przez ${Math.round((DEGRADED_WINDOWS_REQUIRED * measuredIn) / 1000)} s`);
        elapsedRef.current = 0;
      }
      return;
    }

    degradedStreakRef.current = 0;
  });

  return null;
};
