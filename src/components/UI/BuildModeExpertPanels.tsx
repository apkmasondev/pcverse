import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Wrench, Activity, Cpu } from "lucide-react";
import { useBuildStore } from "../../store/useBuildStore";
import { pcComponents } from "../../data/components";

export const BuildModeExpertPanels = () => {
  const { buildMode, currentStep, maxSteps } = useBuildStore();
  const currentComponent = pcComponents.find((c) => c.buildOrder === currentStep);

  return (
    <>
      <div className="fixed top-4 xl:top-6 left-4 xl:left-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none">
        <AnimatePresence>
          {buildMode && currentComponent?.buildTip && currentStep <= maxSteps && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-[calc(100vw-2rem)] max-w-[240px] xl:max-w-sm flex flex-col bg-[#0a0a0a]/80 backdrop-blur-3xl border border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-2 xl:gap-3 bg-indigo-500/10 px-3 xl:px-4 py-2 xl:py-3 border-b border-indigo-500/20">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <GraduationCap size={14} className="xl:w-4 xl:h-4" />
                </div>
                <span className="text-indigo-300 font-bold uppercase tracking-wider text-[10px] xl:text-xs">
                  Porada Eksperta
                </span>
              </div>
              <div className="p-3 xl:p-4 text-slate-300 text-xs xl:text-[15px] text-center leading-relaxed">
                {currentComponent.buildTip}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.expertDetails && currentStep <= maxSteps && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
              className="w-[calc(100vw-2rem)] max-w-[240px] xl:max-w-sm flex flex-col bg-[#0a0a0a]/80 backdrop-blur-3xl border border-amber-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-2 xl:gap-3 bg-amber-500/10 px-3 xl:px-4 py-2 xl:py-3 border-b border-amber-500/20">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Wrench size={14} className="xl:w-4 xl:h-4" />
                </div>
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] xl:text-xs">
                  Narzędzia i Parametry
                </span>
              </div>
              <div className="p-3 xl:p-4 flex flex-col gap-2 xl:gap-3 text-xs xl:text-sm">
                <div className="flex items-start gap-2 xl:gap-3">
                  <div className="text-amber-500/70 font-semibold w-20 xl:w-24 shrink-0">Wymagane:</div>
                  <div className="text-slate-300">{currentComponent.expertDetails.tool}</div>
                </div>
                <div className="flex items-start gap-2 xl:gap-3">
                  <div className="text-amber-500/70 font-semibold w-20 xl:w-24 shrink-0">Parametr:</div>
                  <div className="text-slate-300">{currentComponent.expertDetails.parameter}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed top-4 xl:top-6 right-4 xl:right-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none items-end" aria-live="polite">
        <AnimatePresence>
          {buildMode && currentComponent?.customStats && currentStep <= maxSteps && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
              className="w-[calc(100vw-2rem)] max-w-[200px] xl:max-w-xs flex flex-col bg-[#0a0a0a]/80 backdrop-blur-3xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-2 xl:gap-3 bg-cyan-500/10 px-3 xl:px-4 py-2 xl:py-3 border-b border-cyan-500/20">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Activity size={14} className="xl:w-4 xl:h-4" />
                </div>
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] xl:text-xs font-mono">
                  Telemetria
                </span>
              </div>
              <div className="p-3 xl:p-4 flex flex-col gap-3 xl:gap-4 text-xs xl:text-sm font-mono">
                {currentComponent.customStats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-cyan-100/70 text-[8px] xl:text-[10px] uppercase tracking-wider">
                      <span>{stat.label}</span>
                      <span className="text-cyan-400 font-bold">{stat.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-cyan-500/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.exampleSpecs && currentStep <= maxSteps && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.3 }}
              className="w-[calc(100vw-2rem)] max-w-[200px] xl:max-w-xs flex flex-col bg-[#0a0a0a]/80 backdrop-blur-3xl border border-emerald-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-2 xl:gap-3 bg-emerald-500/10 px-3 xl:px-4 py-2 xl:py-3 border-b border-emerald-500/20">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cpu size={14} className="xl:w-4 xl:h-4" />
                </div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] xl:text-xs font-mono">
                  Przykładowe Modele (2026)
                </span>
              </div>
              <div className="p-3 xl:p-4 flex flex-col gap-3 xl:gap-4">
                {currentComponent.exampleSpecs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 xl:gap-1">
                    <div className="text-[8px] xl:text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">{spec.brand}</div>
                    <div className="text-emerald-100 font-bold text-xs xl:text-sm leading-tight">{spec.model}</div>
                    <div className="text-emerald-300/70 text-[9px] xl:text-[11px] leading-snug">{spec.specs}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
