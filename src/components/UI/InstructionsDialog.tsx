import { motion, AnimatePresence } from "framer-motion";
import { Info, X, MousePointerClick, Layers, Hammer, Sun, Focus, Scan, Wind, Palette, Lightbulb, Tag, Sparkles, Cloud } from "lucide-react";


interface InstructionsDialogProps {
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

export const InstructionsDialog = ({ showInstructions, setShowInstructions }: InstructionsDialogProps) => {
  return (
    <AnimatePresence>
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="instructions-title"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-[#0a0a0a] to-indigo-950/20 border border-white/10 rounded-3xl p-5 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-[0_0_40px_rgba(99,102,241,0.15)]"
          >
            <button
              onClick={() => setShowInstructions(false)}
              aria-label="Zamknij instrukcję"
              className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-300 hover:text-white transition-colors"
            >
              <X aria-hidden="true" size={24} />
            </button>

            <h2
              id="instructions-title"
              className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
            >
              <Info className="text-indigo-400" aria-hidden="true" />
              Legenda i Instrukcja
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Lewa Kolumna - Sterowanie */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <MousePointerClick
                    aria-hidden="true"
                    className="text-indigo-400 shrink-0 mt-1"
                    size={28}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Sterowanie Kamerą
                    </h3>
                    <div className="flex flex-col gap-3">
                      {/* Komputer */}
                      <div className="flex flex-col gap-2 mb-2">
                        <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          🖥️ Komputer (Mysz)
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-black/40 rounded border border-white/20 text-xs font-semibold">
                            LPM
                          </kbd>{" "}
                          Obrót kamery (Orbit)
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-black/40 rounded border border-white/20 text-xs font-semibold">
                            Scroll
                          </kbd>{" "}
                          Przybliżanie / Oddalanie (Zoom)
                        </p>
                      </div>

                      {/* Mobilne */}
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          📱 Urządzenia Mobilne (Dotyk)
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-black/40 rounded border border-white/20 text-xs font-semibold">
                            Przeciągnięcie
                          </kbd>{" "}
                          Obrót kamery (Orbit)
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-black/40 rounded border border-white/20 text-xs font-semibold">
                            Uszczypnięcie
                          </kbd>{" "}
                          Przybliżanie (Zoom)
                        </p>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mt-2 p-3 bg-black/20 rounded-lg border border-white/5">
                        Kliknij (lub dotknij) dowolny podzespół komputera, by
                        wyświetlić panel detali. W trybie powiększenia galerii
                        możesz używać strzałek{" "}
                        <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/20 text-xs">
                          ←
                        </kbd>{" "}
                        <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/20 text-xs">
                          →
                        </kbd>{" "}
                        do przewijania.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <Layers
                    aria-hidden="true"
                    className="text-indigo-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1.5">
                      Eksplozja (Teardown)
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Przycisk <strong>"Rozłóż na Części"</strong> uruchamia
                      animację rozsunięcia obudowy PC, pozwalając zbadanie
                      budowy sprzętu od środka.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <Hammer
                    aria-hidden="true"
                    className="text-indigo-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1.5">
                      Tryb Budowy
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Interaktywny symulator składania komputera. Aplikacja
                      poprowadzi Cię krok po kroku przez optymalną kolejność
                      montażu z dawką wiedzy teoretycznej.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prawa Kolumna - Opcje i Legenda */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <Sun
                    aria-hidden="true"
                    className="text-amber-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1.5">
                      Otoczenie i Cyber-Scenografia
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Zmienia globalne oświetlenie. Aktywuj{" "}
                      <strong>"Tryb Scenografii"</strong>, by postawić sprzęt
                      na biurku z fotorealistycznymi odbiciami.
                      <span className="text-amber-400/90 block mt-2 text-xs">
                        ⚠️ <strong>Uwaga:</strong> Scenografia podwaja ilość
                        renderowanych detali (wymagane GPU).
                      </span>
                      <span className="text-sky-300 block mt-1.5 text-xs">
                        📱 <strong>Urządzenia mobilne:</strong> Ze względu na
                        proporcje pionowych ekranów i ograniczenia wydajności,
                        na wąskich ekranach sceneria nie wyświetli się.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="col-span-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Focus
                      aria-hidden="true"
                      className="text-indigo-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Zresetuj:</strong> Przywraca domyślny kąt kamery
                      i resetuje przybliżenie.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Scan
                      aria-hidden="true"
                      className="text-cyan-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Hologram:</strong> Prześwietla wszystkie
                      podzespoły PC.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Wind
                      aria-hidden="true"
                      className="text-blue-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Airflow:</strong> Wizualizacja przepływu
                      powietrza.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Palette
                      aria-hidden="true"
                      className="text-purple-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>RGB:</strong> Sterowanie podświetleniem części.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Lightbulb
                      aria-hidden="true"
                      className="text-yellow-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Oświetlenie:</strong> Kontrola świateł i
                      reflektorów.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Tag
                      aria-hidden="true"
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Etykiety:</strong> Włącza lub wyłącza nazwy w
                      3D.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Sparkles
                      aria-hidden="true"
                      className="text-amber-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Pył / Iskry:</strong> Przełącza efekty
                      cząsteczkowe 3D.
                    </span>
                  </div>
                  <div className="col-span-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <Cloud
                      aria-hidden="true"
                      className="text-sky-400 shrink-0"
                    />
                    <span className="text-sm text-slate-300 leading-tight">
                      <strong>Mgła tła:</strong> Włącza klimatyczne wtapianie
                      sceny w horyzont.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <p className="text-sm text-indigo-200 leading-relaxed">
                    🖥️{" "}
                    <strong className="text-indigo-100 font-semibold">
                      Rekomendacja:
                    </strong>{" "}
                    Dla zachowania najwyższego poziomu imersji i
                    profesjonalnego doświadczenia z aplikacji, zalecamy jej
                    uruchamianie na poziomych ekranach (Desktop / Tablet).
                  </p>
                </div>
              </div>
            </div>

            <button
              aria-label="Zamknij instrukcję"
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl font-bold text-indigo-300 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Zrozumiałem
            </button>

            <div className="mt-5 text-center">
              <p className="text-xs text-slate-300/70 font-medium tracking-wide">
                Designed by{" "}
                <span className="text-indigo-400 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] tracking-widest">
                  apkmasondev
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
