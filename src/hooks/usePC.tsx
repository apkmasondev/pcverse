import { create } from 'zustand';
import type { PCComponent } from '../data/components';
import { detectDeviceCapabilities } from '../utils/deviceCapabilities';

export interface PCSelectionContextType {
  selectedComponent: PCComponent | null;
  selectedComponentFocus: [number, number, number] | null;
  explodeStep: number;
  cameraResetTrigger: number;
  setSelectedComponent: (
    component: PCComponent | null,
    focus?: [number, number, number] | null,
  ) => void;
  toggleExploded: () => void;
  triggerCameraReset: () => void;
}

export interface PCRGBContextType {
  rgbColor: string;
  setRgbColor: (color: string) => void;
  rgbEnabled: boolean;
  toggleRgbEnabled: () => void;
}

export interface PCViewContextType {
  isLowEndGPU: boolean;
  setLowEndGPU: (val: boolean) => void;
  xrayMode: boolean;
  toggleXrayMode: () => void;
  showAirflow: boolean;
  toggleAirflow: () => void;
  envPreset: string;
  setEnvPreset: (preset: string) => void;
  showDesk: boolean;
  toggleDesk: () => void;
  showParticles: boolean;
  toggleParticles: () => void;
  showFog: boolean;
  toggleFog: () => void;
  inMatrix: boolean;
  enterMatrix: () => void;
  exitMatrix: () => void;
}

export interface PCUIContextType {
  showLabels: boolean;
  toggleLabels: () => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
  hoveredComponentId: string | null;
  setHoveredComponentId: (id: string | null) => void;
}

export interface PCLightingContextType {
  ambientOn: boolean;
  toggleAmbient: () => void;
  mainSpotOn: boolean;
  toggleMainSpot: () => void;
  pcRGBOn: boolean;
  togglePcRGB: () => void;
  cursorLightOn: boolean;
  toggleCursorLight: () => void;
}


export interface AppLoadingContextType {
  isManualLoading: boolean;
  triggerLoading: (callback: () => void) => void;
}

/** Opóźnienie przed wykonaniem akcji, by ekran ładowania zdążył się pojawić. */
const LOADING_SHOW_DELAY_MS = 150;
/** Minimalny czas widoczności ekranu ładowania po wykonaniu akcji. */
const LOADING_HIDE_DELAY_MS = 800;
/** Czas trwania animacji rozkładania/składania modelu. */
const EXPLODE_ANIMATION_MS = 800;

let loadingRunTimer: ReturnType<typeof setTimeout> | null = null;
let loadingHideTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppLoading = create<AppLoadingContextType>((set) => ({
  isManualLoading: false,
  triggerLoading: (callback) => {
    // Szybkie, kolejne wywołania muszą zresetować poprzedni cykl — inaczej timer
    // pierwszego zgłoszenia chowa ekran ładowania w trakcie drugiego.
    if (loadingRunTimer) clearTimeout(loadingRunTimer);
    if (loadingHideTimer) clearTimeout(loadingHideTimer);

    set({ isManualLoading: true });
    loadingRunTimer = setTimeout(() => {
      loadingRunTimer = null;
      callback();
      loadingHideTimer = setTimeout(() => {
        loadingHideTimer = null;
        set({ isManualLoading: false });
      }, LOADING_HIDE_DELAY_MS);
    }, LOADING_SHOW_DELAY_MS);
  }
}));

let explodeTimer: ReturnType<typeof setTimeout> | null = null;

// Pełna detekcja (WebGL2/WebGL1/brak, GPU, rdzenie, pamięć) żyje w utils/deviceCapabilities.
// Tutaj interesuje nas tylko, czy start odbywa się na najniższym poziomie jakości.
const hasLimitedHardwareHints = () => detectDeviceCapabilities().tier === 'low';

export const usePCSelection = create<PCSelectionContextType>((set, get) => ({
  selectedComponent: null,
  selectedComponentFocus: null,
  explodeStep: 0,
  cameraResetTrigger: 0,
  setSelectedComponent: (component, focus = null) => set({
    selectedComponent: component,
    selectedComponentFocus: component ? focus : null,
  }),
  triggerCameraReset: () => set((state) => ({
    cameraResetTrigger: state.cameraResetTrigger + 1,
    selectedComponent: null,
    selectedComponentFocus: null,
  })),
  toggleExploded: () => {
    // Krok 1 oznacza trwającą animację — stan sam w sobie jest blokadą, więc nie
    // potrzebujemy dodatkowej flagi `isAnimating` żyjącej poza magazynem.
    const currentStep = get().explodeStep;
    if (currentStep === 1) return;

    const targetStep = currentStep === 0 ? 2 : 0;
    set({ selectedComponent: null, selectedComponentFocus: null, explodeStep: 1 });

    if (explodeTimer) clearTimeout(explodeTimer);
    explodeTimer = setTimeout(() => {
      explodeTimer = null;
      set({ explodeStep: targetStep });
    }, EXPLODE_ANIMATION_MS);
  }
}));

export const usePCRGB = create<PCRGBContextType>((set) => ({
  rgbColor: '#06b6d4',
  setRgbColor: (color) => set({ rgbColor: color }),
  rgbEnabled: false,
  toggleRgbEnabled: () => set((state) => ({ rgbEnabled: !state.rgbEnabled }))
}));

export const usePCLighting = create<PCLightingContextType>((set) => ({
  ambientOn: true,
  mainSpotOn: true,
  pcRGBOn: false,
  cursorLightOn: false,
  toggleAmbient: () => set((state) => ({ ambientOn: !state.ambientOn })),
  toggleMainSpot: () => set((state) => ({ mainSpotOn: !state.mainSpotOn })),
  togglePcRGB: () => set((state) => ({ pcRGBOn: !state.pcRGBOn })),
  toggleCursorLight: () => set((state) => ({ cursorLightOn: !state.cursorLightOn }))
}));

export const usePCView = create<PCViewContextType>((set) => ({
  isLowEndGPU: hasLimitedHardwareHints(),
  setLowEndGPU: (val) => set((state) => ({
    isLowEndGPU: val,
    showDesk: val ? false : state.showDesk,
    showParticles: val ? false : state.showParticles,
  })),
  xrayMode: false,
  showAirflow: false,
  envPreset: 'night',
  showDesk: false,
  showParticles: false,
  showFog: true,
  inMatrix: false,
  enterMatrix: () => set({ inMatrix: true }),
  exitMatrix: () => set({ inMatrix: false }),
  toggleXrayMode: () => set((state) => ({ xrayMode: !state.xrayMode })),
  toggleAirflow: () => set((state) => ({ showAirflow: !state.showAirflow })),
  setEnvPreset: (preset) => {
    set({ envPreset: preset });
    if (preset === 'city') {
      usePCLighting.setState({ ambientOn: false, mainSpotOn: false, pcRGBOn: true, cursorLightOn: true });
    } else {
      usePCLighting.setState({ ambientOn: true, mainSpotOn: true, pcRGBOn: false, cursorLightOn: false });
    }
  },
  toggleDesk: () => set((state) => (
    state.isLowEndGPU ? state : { showDesk: !state.showDesk }
  )),
  toggleParticles: () => set((state) => ({ showParticles: !state.showParticles })),
  toggleFog: () => set((state) => ({ showFog: !state.showFog }))
}));

export const usePCUI = create<PCUIContextType>((set) => ({
  showLabels: true,
  showInstructions: false,
  hoveredComponentId: null,
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setShowInstructions: (show) => set({ showInstructions: show }),
  setHoveredComponentId: (id) => set({ hoveredComponentId: id })
}));
