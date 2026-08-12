import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ACCENTS } from "./expertPanelStyles";
import type { ExpertPanelAccent, ExpertPanelWidth } from "./expertPanelStyles";

interface ExpertPanelProps {
  side: "left" | "right";
  accent: ExpertPanelAccent;
  icon: LucideIcon;
  title: string;
  width: ExpertPanelWidth;
  /** Opóźnienie wejścia, by panele wjeżdżały kaskadowo. */
  delay?: number;
  /** Pierwszy panel w kolumnie nie dostaje górnego marginesu. */
  first?: boolean;
  /** Klasy specyficzne dla treści (wyrównanie, odstępy, krój). */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Wspólna powłoka bocznego panelu eksperta z Trybu Budowy: zwinięta do kwadratu
 * z ikoną, rozwijana po najechaniu myszą lub sfokusowaniu klawiaturą.
 */
export const ExpertPanel = ({
  side,
  accent,
  icon: Icon,
  title,
  width,
  delay = 0,
  first = false,
  bodyClassName = "",
  children,
}: ExpertPanelProps) => {
  const styles = ACCENTS[accent];
  const isRight = side === "right";

  const label = (
    <span
      className={`${styles.title} font-bold uppercase tracking-widest text-[10px] xl:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap`}
    >
      {title}
    </span>
  );

  const glyph = <Icon size={16} aria-hidden="true" className={`${styles.icon} shrink-0 xl:w-5 xl:h-5`} />;

  return (
    <motion.div
      tabIndex={0}
      onPointerDown={(e) => {
        // Ponowne kliknięcie sfokusowanego panelu ma go zwinąć, a nie zostawić otwartym.
        if (document.activeElement === e.currentTarget) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      initial={{ opacity: 0, x: isRight ? 50 : -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: isRight ? 50 : -50, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay }}
      className={`group w-[40px] xl:w-[48px] ${width.outer} max-h-[40px] xl:max-h-[48px] hover:max-h-[600px] focus:max-h-[600px] overflow-hidden flex flex-col bg-black/20 hover:bg-black/60 focus:bg-black/60 backdrop-blur-md ${styles.border} pointer-events-auto transition-all duration-500 ease-out cursor-pointer focus:outline-none ${
        isRight
          ? "items-end border-r-2 rounded-l-xl shadow-[-20px_0_30px_rgba(0,0,0,0.2)]"
          : "items-start border-l-2 rounded-r-xl shadow-[20px_0_30px_rgba(0,0,0,0.2)]"
      } ${first ? "" : "mt-1"}`}
    >
      <div className={`${width.inner} shrink-0 flex flex-col`}>
        <div
          className={`flex items-center h-[40px] xl:h-[48px] gap-2 px-3 ${styles.header} cursor-help ${isRight ? "justify-end" : ""}`}
        >
          {isRight ? (
            <>
              {label}
              {glyph}
            </>
          ) : (
            <>
              {glyph}
              {label}
            </>
          )}
        </div>
        <div
          className={`px-3 pb-4 pt-2 [text-shadow:0_1px_3px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 delay-150 ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

/** Wspólna lista pasków procentowych — używana przez „Wpływ na Wydajność” i „Telemetrię”. */
export const StatBars = ({
  stats,
  accent,
}: {
  stats: { label: string; value: number }[];
  accent: "fuchsia" | "cyan";
}) => {
  const labelColor = accent === "fuchsia" ? "text-fuchsia-100/80" : "text-cyan-100/80";
  const valueColor = accent === "fuchsia" ? "text-fuchsia-400" : "text-cyan-400";
  const track = accent === "fuchsia" ? "border-fuchsia-500/20" : "border-cyan-500/20";
  const fill =
    accent === "fuchsia"
      ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.8)]"
      : "bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]";

  return (
    <>
      {stats.map((stat, idx) => (
        <div key={stat.label} className="flex flex-col gap-1">
          <div className={`flex justify-between ${labelColor} uppercase tracking-wider`}>
            <span>{stat.label}</span>
            <span className={`${valueColor} font-bold`}>{stat.value}%</span>
          </div>
          <div className={`w-full h-1.5 bg-black/40 rounded-full overflow-hidden border ${track}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stat.value, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
              className={`h-full ${fill}`}
            />
          </div>
        </div>
      ))}
    </>
  );
};
