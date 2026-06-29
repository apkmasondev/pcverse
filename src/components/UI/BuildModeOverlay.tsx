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
          className={`fixed bottom-4 xl:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 xl:gap-4 bg-[#0a0a0a]/80 backdrop-blur-3xl border p-4 xl:p-6 rounded-3xl w-[90%] max-w-[320px] xl:max-w-md pointer-events-auto transition-all duration-700 ${
            isComplete
              ? "border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
              : "border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          }`}
        >
          {isComplete && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute -top-12 bg-[#0a0a0a] border-2 border-amber-500 p-4 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.6)]"
            >
              <Cpu className="text-amber-400 animate-pulse" size={32} />
            </motion.div>
          )}

          <div className="w-full">
            <div className="flex justify-between items-end mb-1 xl:mb-2">
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] xl:text-xs">
                {isComplete ? "Status Systemu" : "Tryb Budowy"}
              </span>
              <span className="text-white font-mono text-xs xl:text-sm opacity-50">
                {Math.min(currentStep, maxSteps)} / {maxSteps}
              </span>
            </div>
            
            <h2 className="text-white font-bold text-lg xl:text-xl leading-tight">
              {isComplete ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                  Gratulacje! Złożono PC
                </span>
              ) : (
                currentComponent?.name || "Montaż..."
              )}
            </h2>
            
            {isComplete && (
              <div className="mt-2 xl:mt-3 flex items-center justify-center gap-2">
                <span className="inline-flex relative">
                  <span className="absolute inset-0 bg-amber-500/20 rounded-full blur-md"></span>
                  <span className="relative text-amber-300 text-[10px] xl:text-xs font-semibold uppercase tracking-wider border border-amber-500/30 px-2 py-1 xl:px-3 xl:py-1 rounded-full bg-amber-500/10 backdrop-blur-md">
                    ✨ Osiągnięto poziom: Ekspert PC
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
            <motion.div
              className={`h-full ${isComplete ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
              initial={{ width: 0 }}
              animate={{
                width: `${(Math.min(currentStep, maxSteps) / maxSteps) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div
            className="text-center w-full flex flex-col items-center justify-center relative z-10"
            aria-live="polite"
          >
            {isComplete ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 mt-2 mb-2"
              >
                <motion.div 
                  animate={{ y: [-3, 3, -3] }} 
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] text-amber-400"
                >
                  <Cpu size={32} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                    Gratulacje!
                  </h3>
                  <p className="text-slate-300 font-medium mt-1">Komputer został złożony.</p>
                  <p className="text-amber-500/80 text-xs mt-2 uppercase tracking-wider font-bold">Osiągnięto poziom: Ekspert PC</p>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[40px] xl:min-h-[60px] flex items-center justify-center">
                <span className="text-base xl:text-xl font-medium text-white drop-shadow-md">
                  Zamontuj:{" "}
                  <span className="text-indigo-300 font-bold">
                    {currentComponent?.name.split(" - ")[0]}
                  </span>
                </span>
              </div>
            )}
          </div>

          {!isComplete && (
            <p className="text-slate-400 text-xs xl:text-sm text-center relative z-10">
              Kliknij zaznaczony lewitujący komponent, aby go zamontować.
            </p>
          )}

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
            className={`mt-1 xl:mt-2 px-4 py-2 xl:px-6 xl:py-3 rounded-lg xl:rounded-xl transition-all font-bold text-sm xl:text-base w-full relative overflow-hidden group flex items-center justify-center gap-2 ${
              isComplete
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 hover:text-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent"
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
