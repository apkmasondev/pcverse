import { AnimatePresence } from "framer-motion";
import { GraduationCap, Wrench, Activity, Cpu, Target, Lightbulb, Zap, Plug } from "lucide-react";
import { useBuildStore } from "../../store/useBuildStore";
import { pcComponents } from "../../data/components";
import { ExpertPanel, StatBars } from "./ExpertPanel";
import { PANEL_WIDTHS } from "./expertPanelStyles";

const PERF_LABELS: Record<string, string> = {
  gaming: "Gaming",
  ai: "AI / ML",
  productivity: "Produktywność",
};

export const BuildModeExpertPanels = () => {
  const { buildMode, currentStep, maxSteps } = useBuildStore();
  const currentComponent = pcComponents.find((c) => c.buildOrder === currentStep);

  // Panele towarzyszą wyłącznie krokom montażu — po ukończeniu budowy znikają.
  const isActive = buildMode && currentStep <= maxSteps && !!currentComponent;

  const perfStats = currentComponent?.perfImpact
    ? Object.entries(currentComponent.perfImpact).map(([key, value]) => ({
        label: PERF_LABELS[key] ?? key,
        value,
      }))
    : [];

  return (
    <>
      <div className="fixed top-4 xl:top-6 left-4 xl:left-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none">
        <AnimatePresence>
          {isActive && currentComponent.role && (
            <ExpertPanel
              side="left"
              accent="rose"
              icon={Target}
              title="Rola w Systemie"
              width={PANEL_WIDTHS.wide}
              first
              bodyClassName="flex flex-col gap-2 text-xs xl:text-sm leading-relaxed text-left"
            >
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-200/90 marker:text-rose-500">
                {currentComponent.role.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.buildTip && (
            <ExpertPanel
              side="left"
              accent="indigo"
              icon={GraduationCap}
              title="Porada Eksperta"
              width={PANEL_WIDTHS.medium}
              delay={0.1}
              bodyClassName="text-slate-200/90 text-xs xl:text-sm leading-relaxed text-left"
            >
              {currentComponent.buildTip}
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.funFact && (
            <ExpertPanel
              side="left"
              accent="yellow"
              icon={Lightbulb}
              title="Ciekawostka"
              width={PANEL_WIDTHS.medium}
              delay={0.2}
              bodyClassName="text-slate-200/90 text-xs xl:text-sm leading-relaxed italic text-left"
            >
              "{currentComponent.funFact}"
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.expertDetails && (
            <ExpertPanel
              side="left"
              accent="amber"
              icon={Wrench}
              title="Narzędzia i Parametry"
              width={PANEL_WIDTHS.medium}
              delay={0.2}
              bodyClassName="flex flex-col gap-2 text-xs xl:text-sm text-left"
            >
              <div className="flex items-start gap-2">
                <div className="text-amber-500/80 font-bold w-20 shrink-0">Wymagane:</div>
                <div className="text-slate-200/90">{currentComponent.expertDetails.tool}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-amber-500/80 font-bold w-20 shrink-0">Parametr:</div>
                <div className="text-slate-200/90">{currentComponent.expertDetails.parameter}</div>
              </div>
            </ExpertPanel>
          )}
        </AnimatePresence>
      </div>

      <div
        className="fixed top-4 xl:top-6 right-4 xl:right-6 z-50 flex flex-col gap-2 xl:gap-4 pointer-events-none items-end"
        aria-live="polite"
      >
        <AnimatePresence>
          {isActive && currentComponent.perfImpact && (
            <ExpertPanel
              side="right"
              accent="fuchsia"
              icon={Zap}
              title="Wpływ na Wydajność"
              width={PANEL_WIDTHS.compact}
              delay={0.1}
              first
              bodyClassName="flex flex-col gap-2.5 text-[11px] xl:text-xs font-mono text-right"
            >
              <StatBars stats={perfStats} accent="fuchsia" />
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.connections && (
            <ExpertPanel
              side="right"
              accent="orange"
              icon={Plug}
              title="Złącza i Kompatybilność"
              width={PANEL_WIDTHS.narrow}
              delay={0.3}
              bodyClassName="flex flex-col gap-2 text-xs xl:text-sm text-right"
            >
              {currentComponent.connections.map((conn) => (
                <div key={conn.name} className="flex flex-col gap-0.5">
                  <div className="text-orange-500/80 font-bold uppercase tracking-wider text-[10px] xl:text-[11px]">
                    {conn.name}:
                  </div>
                  <div className="text-slate-200/90 leading-tight">{conn.detail}</div>
                </div>
              ))}
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.customStats && (
            <ExpertPanel
              side="right"
              accent="cyan"
              icon={Activity}
              title="Telemetria"
              width={PANEL_WIDTHS.narrowest}
              delay={0.2}
              bodyClassName="flex flex-col gap-2.5 text-[11px] xl:text-xs font-mono text-right"
            >
              <StatBars stats={currentComponent.customStats} accent="cyan" />
            </ExpertPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && currentComponent.exampleSpecs && (
            <ExpertPanel
              side="right"
              accent="emerald"
              icon={Cpu}
              title="Przykładowe Modele"
              width={PANEL_WIDTHS.narrowest}
              delay={0.4}
              bodyClassName="flex flex-col gap-3 text-right"
            >
              {currentComponent.exampleSpecs.map((spec) => (
                <div key={`${spec.brand}-${spec.model}`} className="flex flex-col">
                  <div className="text-[9px] xl:text-[10px] text-emerald-500/90 uppercase tracking-widest font-bold">
                    {spec.brand}
                  </div>
                  <div className="text-emerald-100 font-bold text-xs xl:text-[14px] leading-tight">
                    {spec.model}
                  </div>
                  <div className="text-emerald-300/80 text-[10px] xl:text-[11px] leading-snug mt-0.5">
                    {spec.specs}
                  </div>
                </div>
              ))}
            </ExpertPanel>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
