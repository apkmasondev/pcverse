import { motion, AnimatePresence } from "framer-motion";
import { useBuildStore } from "../../store/useBuildStore";
import { pcComponents } from "../../data/components";
import { playSelectSound } from "../../utils/audio";

export const BuildModeOverlay = () => {
  const { buildMode, currentStep, maxSteps, toggleBuildMode } = useBuildStore();
  const currentComponent = pcComponents.find((c) => c.buildOrder === currentStep);

  return (
    <AnimatePresence>
      {buildMode && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 bg-[#0a0a0a]/80 backdrop-blur-3xl border border-indigo-500/30 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[90%] max-w-md pointer-events-auto"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">
              Tryb Budowy
            </span>
            <span className="text-slate-400 font-mono text-sm">
              {Math.min(currentStep, maxSteps)} / {maxSteps}
            </span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{
                width: `${(Math.min(currentStep, maxSteps) / maxSteps) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div
            className="text-center w-full min-h-[60px] flex items-center justify-center"
            aria-live="polite"
          >
            <span className="text-xl font-medium text-white drop-shadow-md">
              {currentStep > maxSteps ? (
                "Gratulacje! Komputer został złożony."
              ) : (
                <>
                  Zamontuj:{" "}
                  <span className="text-indigo-300 font-bold">
                    {currentComponent?.name.split(" - ")[0]}
                  </span>
                </>
              )}
            </span>
          </div>

          {currentStep <= maxSteps && (
            <p className="text-slate-400 text-sm text-center">
              Kliknij zaznaczony lewitujący komponent, aby go zamontować.
            </p>
          )}

          <button
            onClick={() => {
              playSelectSound();
              toggleBuildMode();
            }}
            className="mt-2 px-6 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition-colors border border-transparent hover:border-red-500/30 font-medium w-full"
          >
            Zakończ Budowę
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
