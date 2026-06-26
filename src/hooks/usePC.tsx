import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  showDesk: boolean;
  toggleDesk: () => void;
  showParticles: boolean;
  toggleParticles: () => void;
}

const PCSelectionContext = createContext<PCSelectionContextType | undefined>(undefined);
const PCSettingsContext = createContext<PCSettingsContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [selectedComponent, setSelectedComponent] = useState<PCComponent | null>(null);
  const [explodeStep, setExplodeStep] = useState(0); // 0: closed, 1: glass removed, 2: fully exploded
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const isAnimatingRef = useRef(false);

  const [xrayMode, setXrayMode] = useState(false);
  const [rgbColor, setRgbColor] = useState('#06b6d4'); // Default Cyan
  const [rgbEnabled, setRgbEnabled] = useState(true);
  const [showAirflow, setShowAirflow] = useState(false);
  const [envPreset, setEnvPreset] = useState('city');
  const [showLabels, setShowLabels] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDesk, setShowDesk] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleExploded = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setSelectedComponent(null); // Ukryj kartę szczegółów przy składaniu/rozkładaniu
    
    setExplodeStep(prev => {
      if (prev === 0) {
        timeoutRef.current = setTimeout(() => {
          setExplodeStep(2);
          isAnimatingRef.current = false;
        }, 800);
        return 1;
      } else {
        timeoutRef.current = setTimeout(() => {
          setExplodeStep(0);
          isAnimatingRef.current = false;
        }, 800);
        return 1;
      }
    });
  }, []);

  const triggerCameraReset = useCallback(() => {
    setCameraResetTrigger((prev) => prev + 1);
    setSelectedComponent(null);
  }, []);

  const toggleXrayMode = useCallback(() => setXrayMode((prev) => !prev), []);
  const toggleAirflow = useCallback(() => setShowAirflow((prev) => !prev), []);
  const toggleLabels = useCallback(() => setShowLabels((prev) => !prev), []);
  const toggleRgbEnabled = useCallback(() => setRgbEnabled((prev) => !prev), []);
  const toggleDesk = useCallback(() => setShowDesk((prev) => !prev), []);
  const toggleParticles = useCallback(() => setShowParticles((prev) => !prev), []);

  const settingsValue = useMemo(() => ({
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
    showDesk,
    toggleDesk,
    showParticles,
    toggleParticles,
  }), [xrayMode, rgbColor, rgbEnabled, showAirflow, envPreset, showLabels, showInstructions, showDesk, showParticles, toggleXrayMode, setRgbColor, toggleRgbEnabled, toggleAirflow, setEnvPreset, toggleLabels, setShowInstructions, toggleDesk, toggleParticles]);

  const selectionValue = useMemo(() => ({
    selectedComponent,
    explodeStep,
    cameraResetTrigger,
    setSelectedComponent,
    toggleExploded,
    triggerCameraReset,
  }), [
    selectedComponent, explodeStep, cameraResetTrigger,
    setSelectedComponent, toggleExploded, triggerCameraReset
  ]);

  return (
    <PCSettingsContext.Provider value={settingsValue}>
      <PCSelectionContext.Provider value={selectionValue}>
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
