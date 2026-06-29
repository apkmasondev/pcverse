import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Wrench, Activity, Cpu, Target, Lightbulb, Zap } from "lucide-react";
import { useBuildStore } from "../../store/useBuildStore";
import { pcComponents } from "../../data/components";

export const BuildModeExpertPanels = () => {
  const { buildMode, currentStep, maxSteps } = useBuildStore();
  const currentComponent = pcComponents.find((c) => c.buildOrder === currentStep);

  return (
    <>
      <div className="fixed top-4 xl:top-6 left-4 xl:left-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none">
        <AnimatePresence>
          {buildMode && currentComponent?.role && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="group w-[40px] hover:w-[260px] focus:w-[260px] xl:w-[48px] xl:hover:w-[340px] xl:focus:w-[340px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-start bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-l-2 border-rose-500/70 rounded-r-xl shadow-[20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out cursor-pointer focus:outline-none"
            >
              <div className="w-[260px] xl:w-[340px] shrink-0 flex flex-col">
                <div className="flex items-center h-[40px] xl:h-[48px] gap-2 px-3 bg-rose-500/10 cursor-help">
                  <Target size={16} className="text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] shrink-0 xl:w-5 xl:h-5" />
                  <span className="text-rose-300/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Rola w Systemie
                  </span>
                </div>
                <div className="px-3 pb-4 pt-2 flex flex-col gap-2 text-xs xl:text-sm leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,1)] text-left opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150">
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-200/90 marker:text-rose-500">
                    {currentComponent.role.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.buildTip && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
              className="group w-[40px] hover:w-[240px] focus:w-[240px] xl:w-[48px] xl:hover:w-[320px] xl:focus:w-[320px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-start bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-l-2 border-indigo-500/70 rounded-r-xl shadow-[20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out mt-1 cursor-pointer focus:outline-none"
            >
              <div className="w-[240px] xl:w-[320px] shrink-0 flex flex-col">
                <div className="flex items-center h-[40px] xl:h-[48px] gap-2 px-3 bg-indigo-500/10 cursor-help">
                  <GraduationCap size={16} className="text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)] shrink-0 xl:w-5 xl:h-5" />
                  <span className="text-indigo-300/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Porada Eksperta
                  </span>
                </div>
                <div className="px-3 pb-4 pt-2 text-slate-200/90 text-xs xl:text-sm leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,1)] text-left opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150">
                  {currentComponent.buildTip}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.funFact && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
              className="group w-[40px] hover:w-[240px] focus:w-[240px] xl:w-[48px] xl:hover:w-[320px] xl:focus:w-[320px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-start bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-l-2 border-yellow-500/70 rounded-r-xl shadow-[20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out mt-1 cursor-pointer focus:outline-none"
            >
              <div className="w-[240px] xl:w-[320px] shrink-0 flex flex-col">
                <div className="flex items-center h-[40px] xl:h-[48px] gap-2 px-3 bg-yellow-500/10 cursor-help">
                  <Lightbulb size={16} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)] shrink-0 xl:w-5 xl:h-5" />
                  <span className="text-yellow-400/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Ciekawostka
                  </span>
                </div>
                <div className="px-3 pb-4 pt-2 text-slate-200/90 text-xs xl:text-sm leading-relaxed italic [text-shadow:0_1px_3px_rgba(0,0,0,1)] text-left opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150">
                  "{currentComponent.funFact}"
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.expertDetails && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
              className="group w-[40px] hover:w-[240px] focus:w-[240px] xl:w-[48px] xl:hover:w-[320px] xl:focus:w-[320px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-start bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-l-2 border-amber-500/70 rounded-r-xl shadow-[20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out mt-1 cursor-pointer focus:outline-none"
            >
              <div className="w-[240px] xl:w-[320px] shrink-0 flex flex-col">
                <div className="flex items-center h-[40px] xl:h-[48px] gap-2 px-3 bg-amber-500/10 cursor-help">
                  <Wrench size={16} className="text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] shrink-0 xl:w-5 xl:h-5" />
                  <span className="text-amber-400/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Narzędzia i Parametry
                  </span>
                </div>
                <div className="px-3 pb-4 pt-2 flex flex-col gap-2 text-xs xl:text-sm [text-shadow:0_1px_3px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150">
                  <div className="flex items-start gap-2">
                    <div className="text-amber-500/80 font-bold w-20 shrink-0">Wymagane:</div>
                    <div className="text-slate-200/90">{currentComponent.expertDetails.tool}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-amber-500/80 font-bold w-20 shrink-0">Parametr:</div>
                    <div className="text-slate-200/90">{currentComponent.expertDetails.parameter}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed top-4 xl:top-6 right-4 xl:right-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none items-end" aria-live="polite">
        <AnimatePresence>
          {buildMode && currentComponent?.perfImpact && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
              className="group w-[40px] hover:w-[220px] focus:w-[220px] xl:w-[48px] xl:hover:w-[260px] focus:w-[260px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-end bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-r-2 border-fuchsia-500/70 rounded-l-xl shadow-[-20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out cursor-pointer focus:outline-none"
            >
              <div className="w-[220px] xl:w-[260px] shrink-0 flex flex-col">
                <div className="flex items-center justify-end h-[40px] xl:h-[48px] gap-2 px-3 bg-fuchsia-500/10 cursor-help">
                  <span className="text-fuchsia-400/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Wpływ na Wydajność
                  </span>
                  <Zap size={16} className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)] shrink-0 xl:w-5 xl:h-5" />
                </div>
                <div className="px-3 pb-4 pt-2 flex flex-col gap-2.5 text-[11px] xl:text-xs font-mono [text-shadow:0_1px_3px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150 text-right">
                  {Object.entries(currentComponent.perfImpact).map(([key, value], idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-fuchsia-100/80 uppercase tracking-wider">
                        <span>{key === 'gaming' ? 'Gaming' : key === 'ai' ? 'AI / ML' : 'Produktywność'}</span>
                        <span className="text-fuchsia-400 font-bold">{value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-fuchsia-500/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(value as number, 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                          className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.customStats && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
              className="group w-[40px] hover:w-[200px] focus:w-[200px] xl:w-[48px] xl:hover:w-[240px] focus:w-[240px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-end bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-r-2 border-cyan-500/70 rounded-l-xl shadow-[-20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out mt-1 cursor-pointer focus:outline-none"
            >
              <div className="w-[200px] xl:w-[240px] shrink-0 flex flex-col">
                <div className="flex items-center justify-end h-[40px] xl:h-[48px] gap-2 px-3 bg-cyan-500/10 cursor-help">
                  <span className="text-cyan-400/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Telemetria
                  </span>
                  <Activity size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] shrink-0 xl:w-5 xl:h-5" />
                </div>
                <div className="px-3 pb-4 pt-2 flex flex-col gap-2.5 text-[11px] xl:text-xs font-mono [text-shadow:0_1px_3px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150 text-right">
                  {currentComponent.customStats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-cyan-100/80 uppercase tracking-wider">
                        <span>{stat.label}</span>
                        <span className="text-cyan-400 font-bold">{stat.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan-500/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buildMode && currentComponent?.exampleSpecs && currentStep <= maxSteps && (
            <motion.div
              tabIndex={0}
              onPointerDown={(e) => {
                if (document.activeElement === e.currentTarget) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.3 }}
              className="group w-[40px] hover:w-[200px] focus:w-[200px] xl:w-[48px] xl:hover:w-[240px] focus:w-[240px] max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col items-end bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md border-r-2 border-emerald-500/70 rounded-l-xl shadow-[-20px_0_30px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 ease-out mt-1 cursor-pointer focus:outline-none"
            >
              <div className="w-[200px] xl:w-[240px] shrink-0 flex flex-col">
                <div className="flex items-center justify-end h-[40px] xl:h-[48px] gap-2 px-3 bg-emerald-500/10 cursor-help">
                  <span className="text-emerald-400/90 font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Przykładowe Modele
                  </span>
                  <Cpu size={16} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] shrink-0 xl:w-5 xl:h-5" />
                </div>
                <div className="px-3 pb-4 pt-2 flex flex-col gap-3 [text-shadow:0_1px_3px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150 text-right">
                  {currentComponent.exampleSpecs.map((spec, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="text-[9px] xl:text-[10px] text-emerald-500/90 uppercase tracking-widest font-bold">{spec.brand}</div>
                      <div className="text-emerald-100 font-bold text-xs xl:text-[14px] leading-tight">{spec.model}</div>
                      <div className="text-emerald-300/80 text-[10px] xl:text-[11px] leading-snug mt-0.5">{spec.specs}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
