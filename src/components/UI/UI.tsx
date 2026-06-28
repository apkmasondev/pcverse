import { useState, useEffect } from "react";
import { usePCView, usePCUI } from "../../hooks/usePC";
import { useBuildStore } from "../../store/useBuildStore";
import { MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Podkomponenty:
import { BuildModeOverlay } from "./BuildModeOverlay";
import { BuildModeExpertPanels } from "./BuildModeExpertPanels";
import { SidebarControls } from "./SidebarControls";
import { InstructionsDialog } from "./InstructionsDialog";
import { playAmbientSound, stopAmbientSound } from "../../utils/audio";

export const UI = () => {
  const { showAirflow, xrayMode } = usePCView();
  const { showInstructions, setShowInstructions } = usePCUI();
  const { buildMode } = useBuildStore();
  const [showHint, setShowHint] = useState(true);

  // Ukrycie hintu po czasie
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  // Dźwięk przepływu powietrza
  useEffect(() => {
    if (showAirflow) {
      playAmbientSound();
    } else {
      stopAmbientSound();
    }
  }, [showAirflow]);

  // Globalne skróty klawiszowe (Escape zamyka modale/tryb budowy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showInstructions) {
          setShowInstructions(false);
        } else if (useBuildStore.getState().buildMode) {
          useBuildStore.getState().toggleBuildMode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInstructions, setShowInstructions]);

  // Trap focusa dla okna instrukcji (Dostępność WCAG)
  useEffect(() => {
    if (!showInstructions) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return;
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleTab);
    
    // Focus first element on open
    setTimeout(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const firstBtn = dialog.querySelector<HTMLElement>("button");
        firstBtn?.focus();
      }
    }, 100);
    return () => window.removeEventListener("keydown", handleTab);
  }, [showInstructions]);

  return (
    <>
      <BuildModeOverlay />
      <BuildModeExpertPanels />
      
      {!buildMode && <SidebarControls />}
      
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full text-slate-300 text-sm z-30 cursor-pointer shadow-2xl pointer-events-auto"
            onClick={() => setShowHint(false)}
          >
            <MousePointerClick
              aria-hidden="true"
              size={18}
              className="text-indigo-400 animate-bounce"
            />
            Kliknij podzespół komputera, aby poznać jego budowę
          </motion.div>
        )}
      </AnimatePresence>

      <InstructionsDialog showInstructions={showInstructions} setShowInstructions={setShowInstructions} />

      <span role="status" aria-live="polite" className="sr-only">
        {`Hologram ${xrayMode ? "włączony" : "wyłączony"}. Airflow ${showAirflow ? "włączony" : "wyłączony"}.`}
      </span>
    </>
  );
};
