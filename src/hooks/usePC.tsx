import { create } from 'zustand';
import type { PCComponent } from '../data/components';

export interface PCSelectionContextType {
  selectedComponent: PCComponent | null;
  explodeStep: number;
  cameraResetTrigger: number;
  setSelectedComponent: (component: PCComponent | null) => void;
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
}

export interface PCUIContextType {
  showLabels: boolean;
  toggleLabels: () => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
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

export const usePCSelection = create<PCSelectionContextType>((set) => ({
  selectedComponent: null,
  explodeStep: 0,
  cameraResetTrigger: 0,
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  triggerCameraReset: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1, selectedComponent: null })),
  toggleExploded: () => {
    if (isAnimating) return;
    isAnimating = true;
    set({ selectedComponent: null });
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
  rgbEnabled: true,
  toggleRgbEnabled: () => set((state) => ({ rgbEnabled: !state.rgbEnabled }))
}));

export const usePCLighting = create<PCLightingContextType>((set) => ({
  ambientOn: false,
  mainSpotOn: false,
  pcRGBOn: true,
  cursorLightOn: true,
  toggleAmbient: () => set((state) => ({ ambientOn: !state.ambientOn })),
  toggleMainSpot: () => set((state) => ({ mainSpotOn: !state.mainSpotOn })),
  togglePcRGB: () => set((state) => ({ pcRGBOn: !state.pcRGBOn })),
  toggleCursorLight: () => set((state) => ({ cursorLightOn: !state.cursorLightOn }))
}));

export const usePCView = create<PCViewContextType>((set) => ({
  isLowEndGPU: false,
  setLowEndGPU: (val) => set({ isLowEndGPU: val }),
  xrayMode: false,
  showAirflow: false,
  envPreset: 'city',
  showDesk: false,
  showParticles: false,
  showFog: true,
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
  toggleDesk: () => set((state) => ({ showDesk: !state.showDesk })),
  toggleParticles: () => set((state) => ({ showParticles: !state.showParticles })),
  toggleFog: () => set((state) => ({ showFog: !state.showFog }))
}));

export const usePCUI = create<PCUIContextType>((set) => ({
  showLabels: true,
  showInstructions: false,
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setShowInstructions: (show) => set({ showInstructions: show })
}));

