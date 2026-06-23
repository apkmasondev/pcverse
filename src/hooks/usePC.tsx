import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PCComponent } from '../data/components';

export interface PCSelectionContextType {
  selectedComponent: PCComponent | null;
  explodeStep: number;
  cameraResetTrigger: number;
  setSelectedComponent: (component: PCComponent | null) => void;
  toggleExploded: () => void;
  triggerCameraReset: () => void;
}

export interface PCSettingsContextType {
  xrayMode: boolean;
  toggleXrayMode: () => void;
  rgbColor: string;
  setRgbColor: (color: string) => void;
  rgbEnabled: boolean;
  toggleRgbEnabled: () => void;
  showAirflow: boolean;
  toggleAirflow: () => void;
  envPreset: string;
  setEnvPreset: (preset: string) => void;
  showLabels: boolean;
  toggleLabels: () => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const PCSelectionContext = createContext<PCSelectionContextType | undefined>(undefined);
const PCSettingsContext = createContext<PCSettingsContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [selectedComponent, setSelectedComponent] = useState<PCComponent | null>(null);
  const [explodeStep, setExplodeStep] = useState(0); // 0: closed, 1: glass removed, 2: fully exploded
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [xrayMode, setXrayMode] = useState(false);
  const [rgbColor, setRgbColor] = useState('#06b6d4'); // Default Cyan
  const [rgbEnabled, setRgbEnabled] = useState(true);
  const [showAirflow, setShowAirflow] = useState(false);
  const [envPreset, setEnvPreset] = useState('city');
  const [showLabels, setShowLabels] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleExploded = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (explodeStep === 0) {
      setExplodeStep(1);
      setTimeout(() => {
        setExplodeStep(2);
        setIsAnimating(false);
      }, 800);
    } else {
      setExplodeStep(1);
      setTimeout(() => {
        setExplodeStep(0);
        setIsAnimating(false);
      }, 800);
    }
  };

  const triggerCameraReset = () => {
    setCameraResetTrigger((prev) => prev + 1);
    setSelectedComponent(null);
  };

  const toggleXrayMode = () => setXrayMode((prev) => !prev);
  const toggleAirflow = () => setShowAirflow((prev) => !prev);
  const toggleLabels = () => setShowLabels((prev) => !prev);
  const toggleRgbEnabled = () => setRgbEnabled((prev) => !prev);

  return (
    <PCSettingsContext.Provider
      value={{
        xrayMode,
        toggleXrayMode,
        rgbColor,
        setRgbColor,
        rgbEnabled,
        toggleRgbEnabled,
        showAirflow,
        toggleAirflow,
        envPreset,
        setEnvPreset,
        showLabels,
        toggleLabels,
        showInstructions,
        setShowInstructions,
      }}
    >
      <PCSelectionContext.Provider
        value={{
          selectedComponent,
          explodeStep,
          cameraResetTrigger,
          setSelectedComponent,
          toggleExploded,
          triggerCameraReset,
        }}
      >
        {children}
      </PCSelectionContext.Provider>
    </PCSettingsContext.Provider>
  );
};

export const usePCSelection = () => {
  const context = useContext(PCSelectionContext);
  if (context === undefined) {
    throw new Error('usePCSelection must be used within a PCProvider');
  }
  return context;
};

export const usePCSettings = () => {
  const context = useContext(PCSettingsContext);
  if (context === undefined) {
    throw new Error('usePCSettings must be used within a PCProvider');
  }
  return context;
};

// Legacy hook dla kompatybilności wstecznej - uzywac ostroznie!
export const usePC = () => {
  const selection = usePCSelection();
  const settings = usePCSettings();
  return { ...selection, ...settings };
};
