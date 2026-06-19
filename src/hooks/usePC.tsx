import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PCComponent } from '../data/components';

export interface PCContextType {
  selectedComponent: PCComponent | null;
  explodeStep: number;
  cameraResetTrigger: number;
  xrayMode: boolean;
  setSelectedComponent: (component: PCComponent | null) => void;
  toggleExploded: () => void;
  triggerCameraReset: () => void;
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

const PCContext = createContext<PCContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [selectedComponent, setSelectedComponent] = useState<PCComponent | null>(null);
  const [explodeStep, setExplodeStep] = useState(0); // 0: closed, 1: glass removed, 2: fully exploded
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [xrayMode, setXrayMode] = useState(false);
  const [rgbColor, setRgbColor] = useState('#06b6d4'); // Default Cyan
  const [rgbEnabled, setRgbEnabled] = useState(true);
  const [showAirflow, setShowAirflow] = useState(false);
  const [envPreset, setEnvPreset] = useState('studio');
  const [showLabels, setShowLabels] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleExploded = () => {
    if (explodeStep === 0) {
      // Rozkładanie: Najpierw szkło (1), potem komponenty (2)
      setExplodeStep(1);
      setTimeout(() => setExplodeStep(2), 800);
    } else {
      // Składanie: Najpierw komponenty (1), potem szkło wraca (0)
      setExplodeStep(1);
      setTimeout(() => setExplodeStep(0), 800);
    }
  };

  const toggleXrayMode = () => setXrayMode((prev) => !prev);
  const triggerCameraReset = () => {
    setCameraResetTrigger((prev) => prev + 1);
    setSelectedComponent(null);
  };
  const toggleAirflow = () => setShowAirflow((prev) => !prev);
  const toggleLabels = () => setShowLabels((prev) => !prev);
  const toggleRgbEnabled = () => setRgbEnabled((prev) => !prev);

  return (
    <PCContext.Provider
      value={{
        selectedComponent,
        explodeStep,
        cameraResetTrigger,
        xrayMode,
        setSelectedComponent,
        toggleExploded,
        triggerCameraReset,
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
      {children}
    </PCContext.Provider>
  );
};

export const usePC = () => {
  const context = useContext(PCContext);
  if (context === undefined) {
    throw new Error('usePC must be used within a PCProvider');
  }
  return context;
};
