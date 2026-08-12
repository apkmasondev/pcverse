/**
 * Warianty wyglądu paneli eksperta z Trybu Budowy.
 *
 * Klasy Tailwind muszą być pełnymi, statycznymi łańcuchami — skaner nie wykryje
 * nazw sklejanych w runtime (`border-${accent}-500/70`), dlatego każdy wariant
 * jest wypisany wprost. Trzymamy je poza plikiem komponentu, żeby nie łamać
 * Fast Refresh (moduł komponentów powinien eksportować wyłącznie komponenty).
 */

export type ExpertPanelAccent =
  | "rose"
  | "indigo"
  | "yellow"
  | "amber"
  | "fuchsia"
  | "orange"
  | "cyan"
  | "emerald";

export interface AccentStyles {
  border: string;
  header: string;
  icon: string;
  title: string;
}

export const ACCENTS: Record<ExpertPanelAccent, AccentStyles> = {
  rose: {
    border: "border-rose-500/70",
    header: "bg-rose-500/10",
    icon: "text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]",
    title: "text-rose-300/90",
  },
  indigo: {
    border: "border-indigo-500/70",
    header: "bg-indigo-500/10",
    icon: "text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]",
    title: "text-indigo-300/90",
  },
  yellow: {
    border: "border-yellow-500/70",
    header: "bg-yellow-500/10",
    icon: "text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]",
    title: "text-yellow-400/90",
  },
  amber: {
    border: "border-amber-500/70",
    header: "bg-amber-500/10",
    icon: "text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]",
    title: "text-amber-400/90",
  },
  fuchsia: {
    border: "border-fuchsia-500/70",
    header: "bg-fuchsia-500/10",
    icon: "text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]",
    title: "text-fuchsia-400/90",
  },
  orange: {
    border: "border-orange-500/70",
    header: "bg-orange-500/10",
    icon: "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]",
    title: "text-orange-400/90",
  },
  cyan: {
    border: "border-cyan-500/70",
    header: "bg-cyan-500/10",
    icon: "text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]",
    title: "text-cyan-400/90",
  },
  emerald: {
    border: "border-emerald-500/70",
    header: "bg-emerald-500/10",
    icon: "text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]",
    title: "text-emerald-400/90",
  },
};

/** Szerokości rozwiniętego panelu: `outer` steruje animacją, `inner` trzyma treść bez zawijania. */
export interface ExpertPanelWidth {
  outer: string;
  inner: string;
}

export const PANEL_WIDTHS = {
  wide: {
    outer: "hover:w-[260px] focus:w-[260px] xl:hover:w-[340px] xl:focus:w-[340px]",
    inner: "w-[260px] xl:w-[340px]",
  },
  medium: {
    outer: "hover:w-[240px] focus:w-[240px] xl:hover:w-[320px] xl:focus:w-[320px]",
    inner: "w-[240px] xl:w-[320px]",
  },
  compact: {
    outer: "hover:w-[220px] focus:w-[220px] xl:hover:w-[260px] xl:focus:w-[260px]",
    inner: "w-[220px] xl:w-[260px]",
  },
  narrow: {
    outer: "hover:w-[200px] focus:w-[200px] xl:hover:w-[250px] xl:focus:w-[250px]",
    inner: "w-[200px] xl:w-[250px]",
  },
  narrowest: {
    outer: "hover:w-[200px] focus:w-[200px] xl:hover:w-[240px] xl:focus:w-[240px]",
    inner: "w-[200px] xl:w-[240px]",
  },
} as const satisfies Record<string, ExpertPanelWidth>;
