import { motion, AnimatePresence } from "framer-motion";
import { useBuildStore } from "../../store/useBuildStore";
import { usePCSelection, usePCLighting } from "../../hooks/usePC";
import { pcComponents } from "../../data/components";
import { playSelectSound } from "../../utils/audio";
import { Cpu, Power } from "lucide-react";

export const BuildModeOverlay = () => {
  const { buildMode, currentStep, maxSteps, toggleBuildMode } = useBuildStore();
  const currentComponent = pcComponents.find((c) => c.buildOrder === currentStep);
  const isComplete = currentStep > maxSteps;

  return (
    <AnimatePresence>
      {buildMode && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 xl:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full max-w-lg pointer-events-none px-4 transition-all duration-700"
        >


          <div className="text-center mb-3 xl:mb-5">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ y: [-3, 3, -3] }} 
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="mb-2 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                >
                  <Cpu size={32} className="animate-pulse" />
                </motion.div>
                <h1 className="text-amber-400 font-black text-2xl xl:text-4xl tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.5)]">
                  GRATULACJE! ZŁOŻONO PC
                </h1>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="inline-flex relative">
                    <span className="absolute inset-0 bg-amber-500/40 rounded-full blur-md"></span>
                    <span className="relative text-amber-200 text-[10px] xl:text-xs font-bold uppercase tracking-wider border border-amber-500/50 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                      ✨ Poziom: Ekspert PC
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-indigo-300/90 font-bold uppercase tracking-[0.2em] text-[10px] xl:text-xs mb-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                  Tryb Budowy — Krok {Math.min(currentStep, maxSteps)}/{maxSteps}
                </h2>
                <h1 className="text-white font-black text-2xl xl:text-4xl tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_20px_rgba(0,0,0,0.5)]">
                  ZAMONTUJ: <span className="text-indigo-400">{currentComponent?.name.split(" - ")[0]}</span>
                </h1>
              </>
            )}
          </div>

          <div className="w-full max-w-sm h-1.5 xl:h-2 bg-black/40 backdrop-blur-md rounded-full overflow-hidden mb-4 xl:mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-white/5">
            <motion.div
              className={`h-full ${isComplete ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,1)]' : 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,1)]'}`}
              initial={{ width: 0 }}
              animate={{
                width: `${(Math.min(currentStep, maxSteps) / maxSteps) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSelectSound();
              toggleBuildMode();
              if (isComplete) {
                usePCSelection.setState({ explodeStep: 0 });
                usePCLighting.setState({ pcRGBOn: true });
              }
            }}
            className={`pointer-events-auto px-6 py-2.5 xl:px-8 xl:py-3.5 rounded-full transition-all font-bold text-xs xl:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border ${
              isComplete
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/40 hover:text-amber-100 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-md"
                : "bg-black/60 text-white/90 border-white/10 hover:bg-red-500/40 hover:text-white hover:border-red-500/50 backdrop-blur-md"
            }`}
          >
            {isComplete ? (
              <>
                <Power size={18} className="group-hover:text-amber-100 transition-colors" />
                Uruchom System
              </>
            ) : (
              "Zakończ Budowę"
            )}
            
            {isComplete && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" 
              />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
