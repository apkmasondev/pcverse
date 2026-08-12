import { create } from 'zustand';
import { detectDeviceCapabilities } from '../utils/deviceCapabilities';
import type { DeviceCapabilities, QualityTier } from '../utils/deviceCapabilities';
import { usePCView } from '../hooks/usePC';

export interface QualitySettings {
  /** Zakres pixel ratio przekazywany do `<Canvas dpr>`. */
  dpr: number | [number, number];
  /** `powerPreference` kontekstu WebGL — świadomie różny dla desktopu i urządzeń bateryjnych. */
  powerPreference: WebGLPowerPreference;
  /** Czy w ogóle montujemy EffectComposer (post-processing kosztuje pełne przebiegi fullscreen). */
  postProcessing: boolean;
  /** Antyaliasing SMAA (osobny pass) — wyłączany na słabym sprzęcie. */
  antialias: boolean;
  ambientOcclusion: boolean;
  depthOfField: boolean;
  chromaticAberration: boolean;
  bloomMipmap: boolean;
  /** Sparkles + Stars w tle. */
  atmosphere: boolean;
  sparkleCount: number;
  starCount: number;
  /** Reflektor podążający za kursorem (dodatkowy spotLight). */
  cursorLight: boolean;
  /** Pełna scenografia biurka (dziesiątki mesh-y i tekstur). */
  scenery: boolean;
  /** Rozdzielczość MeshReflectorMaterial; 0 = odbicia wyłączone. */
  reflectorResolution: number;
  /** Mnożnik liczby cząsteczek airflow (LOD dla instancji). */
  particleScale: number;
  /** Uproszczony model oświetlenia (hemisphereLight zamiast ambient + rectAreaLight). */
  simplifiedLighting: boolean;
}

const TIER_SETTINGS: Record<QualityTier, QualitySettings> = {
  high: {
    dpr: [1, 2],
    powerPreference: 'high-performance',
    postProcessing: true,
    antialias: true,
    ambientOcclusion: true,
    depthOfField: true,
    chromaticAberration: true,
    bloomMipmap: true,
    atmosphere: true,
    sparkleCount: 500,
    starCount: 3000,
    cursorLight: true,
    scenery: true,
    reflectorResolution: 512,
    particleScale: 1,
    simplifiedLighting: false,
  },
  medium: {
    dpr: [1, 1.5],
    powerPreference: 'high-performance',
    postProcessing: true,
    antialias: false,
    ambientOcclusion: false,
    depthOfField: false,
    chromaticAberration: false,
    bloomMipmap: false,
    atmosphere: true,
    sparkleCount: 200,
    starCount: 1200,
    cursorLight: true,
    scenery: true,
    reflectorResolution: 256,
    particleScale: 0.6,
    simplifiedLighting: false,
  },
  low: {
    dpr: 1,
    powerPreference: 'low-power',
    postProcessing: false,
    antialias: false,
    ambientOcclusion: false,
    depthOfField: false,
    chromaticAberration: false,
    bloomMipmap: false,
    atmosphere: false,
    sparkleCount: 0,
    starCount: 0,
    cursorLight: false,
    scenery: false,
    reflectorResolution: 0,
    particleScale: 0.35,
    simplifiedLighting: true,
  },
};

const TIER_ORDER: QualityTier[] = ['low', 'medium', 'high'];

export interface QualityState {
  capabilities: DeviceCapabilities;
  tier: QualityTier;
  settings: QualitySettings;
  /** Tier ustalony przy starcie — pozwala odróżnić detekcję sprzętu od degradacji w runtime. */
  initialTier: QualityTier;
  /** Czy jakość spadła w wyniku pomiaru FPS, a nie wstępnej detekcji. */
  autoDowngraded: boolean;
  /** Ostatni powód obniżenia jakości (pokazywany w diagnostyce). */
  lastReason: string | null;
  /** Ostatni zmierzony FPS w oknie próbkowania. */
  measuredFps: number | null;
  setMeasuredFps: (fps: number) => void;
  /** Ustawia tier — wyłącznie w dół, żeby uniknąć oscylacji jakości. */
  applyTier: (tier: QualityTier, reason: string) => void;
  /** Obniża jakość o jeden poziom. */
  downgrade: (reason: string) => void;
}

const initialCapabilities = detectDeviceCapabilities();

export const useQualityStore = create<QualityState>((set, get) => ({
  capabilities: initialCapabilities,
  tier: initialCapabilities.tier,
  settings: TIER_SETTINGS[initialCapabilities.tier],
  initialTier: initialCapabilities.tier,
  autoDowngraded: false,
  lastReason: initialCapabilities.reasons[0] ?? null,
  measuredFps: null,
  setMeasuredFps: (fps) => set({ measuredFps: Math.round(fps) }),
  applyTier: (tier, reason) => {
    const current = get().tier;
    if (TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(current)) return;
    set({
      tier,
      settings: TIER_SETTINGS[tier],
      autoDowngraded: true,
      lastReason: reason,
    });
  },
  downgrade: (reason) => {
    const currentIndex = TIER_ORDER.indexOf(get().tier);
    if (currentIndex <= 0) return;
    get().applyTier(TIER_ORDER[currentIndex - 1], reason);
  },
}));

export const getQualitySettings = (tier: QualityTier): QualitySettings => TIER_SETTINGS[tier];

// `isLowEndGPU` w usePCView steruje dostępnością przełączników w UI. Trzymamy je
// zsynchronizowane z tierem, żeby istniało jedno źródło prawdy o wydajności.
useQualityStore.subscribe((state, prevState) => {
  if (state.tier === prevState.tier) return;
  usePCView.getState().setLowEndGPU(state.tier === 'low');
});

// Podgląd diagnostyczny wyłącznie w trybie deweloperskim — pozwala sprawdzić,
// jaki tier przyznano danemu urządzeniu, bez dokładania UI do produkcji.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as Window & { __pcverseQuality?: () => QualityState }).__pcverseQuality = () => useQualityStore.getState();
}
