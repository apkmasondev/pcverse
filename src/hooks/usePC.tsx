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

export interface PCRGBContextType {
  rgbColor: string;
  setRgbColor: (color: string) => void;
  rgbEnabled: boolean;
  toggleRgbEnabled: () => void;
}

export interface PCViewContextType {
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
}

export interface PCUIContextType {
  showLabels: boolean;
  toggleLabels: () => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const PCSelectionContext = createContext<PCSelectionContextType | undefined>(undefined);
const PCRGBContext = createContext<PCRGBContextType | undefined>(undefined);
const PCViewContext = createContext<PCViewContextType | undefined>(undefined);
const PCUIContext = createContext<PCUIContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [selectedComponent, setSelectedComponent] = useState<PCComponent | null>(null);
  const [explodeStep, setExplodeStep] = useState(0);
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
    setSelectedComponent(null); 
    
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

  const rgbValue = useMemo(() => ({
    rgbColor, setRgbColor, rgbEnabled, toggleRgbEnabled
  }), [rgbColor, rgbEnabled, setRgbColor, toggleRgbEnabled]);

  const viewValue = useMemo(() => ({
    xrayMode, toggleXrayMode, showAirflow, toggleAirflow,
    envPreset, setEnvPreset, showDesk, toggleDesk,
    showParticles, toggleParticles
  }), [xrayMode, showAirflow, envPreset, showDesk, showParticles, toggleXrayMode, toggleAirflow, setEnvPreset, toggleDesk, toggleParticles]);

  const uiValue = useMemo(() => ({
    showLabels, toggleLabels, showInstructions, setShowInstructions
  }), [showLabels, showInstructions, toggleLabels, setShowInstructions]);

  return (
    <PCSelectionContext.Provider value={selectionValue}>
      <PCRGBContext.Provider value={rgbValue}>
        <PCViewContext.Provider value={viewValue}>
          <PCUIContext.Provider value={uiValue}>
            {children}
          </PCUIContext.Provider>
        </PCViewContext.Provider>
      </PCRGBContext.Provider>
    </PCSelectionContext.Provider>
  );
};

export const usePCSelection = () => {
  const context = useContext(PCSelectionContext);
  if (context === undefined) {
    throw new Error('usePCSelection must be used within a PCProvider');
  }
  return context;
};

export const usePCRGB = () => {
  const context = useContext(PCRGBContext);
  if (context === undefined) {
    throw new Error('usePCRGB must be used within a PCProvider');
  }
  return context;
};

export const usePCView = () => {
  const context = useContext(PCViewContext);
  if (context === undefined) {
    throw new Error('usePCView must be used within a PCProvider');
  }
  return context;
};

export const usePCUI = () => {
  const context = useContext(PCUIContext);
  if (context === undefined) {
    throw new Error('usePCUI must be used within a PCProvider');
  }
  return context;
};
