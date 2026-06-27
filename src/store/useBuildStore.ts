import { create } from 'zustand';

export interface BuildState {
  buildMode: boolean;
  currentStep: number;
  maxSteps: number;
  toggleBuildMode: () => void;
  advanceStep: () => void;
  resetBuild: () => void;
}

export const useBuildStore = create<BuildState>((set) => ({
  buildMode: false,
  currentStep: 1,
  maxSteps: 9, // 1: Mobo, 2: CPU, 3: RAM, 4: SSD, 5: PSU, 6: Cooler, 7: GPU, 8: HDD, 9: Fans
  toggleBuildMode: () => set((state) => ({ buildMode: !state.buildMode, currentStep: 1 })),
  advanceStep: () => set((state) => {
    if (state.currentStep <= state.maxSteps) {
      return { currentStep: state.currentStep + 1 };
    }
    return state;
  }),
  resetBuild: () => set({ currentStep: 1 }),
}));
