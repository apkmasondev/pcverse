import { create } from 'zustand';
import type { PCComponent } from '../data/components';

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

export const useAppLoading = create<AppLoadingContextType>((set) => ({
  isManualLoading: false,
  triggerLoading: (callback) => {
    set({ isManualLoading: true });
    setTimeout(() => {
      callback();
      setTimeout(() => set({ isManualLoading: false }), 800);
    }, 150);
  }
}));

let isAnimating = false;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const hasLimitedHardwareHints = () => {
  if (typeof navigator === 'undefined') return false;

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const logicalProcessors = navigator.hardwareConcurrency;

  return (deviceMemory !== undefined && deviceMemory <= 4)
    || (logicalProcessors !== undefined && logicalProcessors <= 4);
};

export const usePCSelection = create<PCSelectionContextType>((set) => ({
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
    if (isAnimating) return;
    isAnimating = true;
    set({ selectedComponent: null, selectedComponentFocus: null });
    set((state) => {
      if (state.explodeStep === 0) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          set({ explodeStep: 2 });
          isAnimating = false;
        }, 800);
        return { explodeStep: 1 };
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          set({ explodeStep: 0 });
          isAnimating = false;
        }, 800);
        return { explodeStep: 1 };
      }
    });
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
