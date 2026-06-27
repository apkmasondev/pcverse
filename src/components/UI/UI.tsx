import { useState, useEffect } from "react";
import {
  usePCSelection,
  usePCRGB,
  usePCView,
  usePCUI,
  usePCLighting,
} from "../../hooks/usePC";
import {
  Layers,
  Focus,
  MousePointerClick,
  Scan,
  Wind,
  Palette,
  Sun,
  Tag,
  Info,
  X,
  Sparkles,
  Cloud,
  Lightbulb,
  Hammer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  playExplodeSound,
  playSelectSound,
  playAmbientSound,
  stopAmbientSound,
} from "../../utils/audio";
import { useBuildStore } from "../../store/useBuildStore";
import { pcComponents } from "../../data/components";

const PRESETS = [
  { id: "city", name: "Cyberpunk", desc: "Nocne miasto" },
  { id: "studio", name: "Studio", desc: "Neutralne światło" },
  { id: "dawn", name: "Świt", desc: "Ciepłe poranne" },
  { id: "apartment", name: "Jasny Pokój", desc: "Bardzo jasne wnętrze" },
];

const COLORS = [
  { name: "Red", hex: "#ff003c" },
  { name: "Orange", hex: "#ff7b00" },
  { name: "Gold", hex: "#ffc107" },
  { name: "Green", hex: "#00ff73" },
  { name: "Cyan", hex: "#00f2fe" },
  { name: "Purple", hex: "#8a2be2" },
  { name: "Pink", hex: "#ff00ff" },
  { name: "White", hex: "#ffffff" },
];

export const UI = () => {
  const {
    explodeStep,
    toggleExploded,
    triggerCameraReset,
    setSelectedComponent,
  } = usePCSelection();
  const { rgbColor, setRgbColor, rgbEnabled, toggleRgbEnabled } = usePCRGB();
  const {
    xrayMode,
    toggleXrayMode,
    showAirflow,
    toggleAirflow,
    envPreset,
    setEnvPreset,
    showDesk,
    toggleDesk,
    showParticles,
    toggleParticles,
    showFog,
    toggleFog,
  } = usePCView();
  const { showLabels, toggleLabels, showInstructions, setShowInstructions } =
    usePCUI();
  const {
    ambientOn,
    toggleAmbient,
    mainSpotOn,
    toggleMainSpot,
    pcRGBOn,
    togglePcRGB,
    cursorLightOn,
    toggleCursorLight,
  } = usePCLighting();
  const [showHint, setShowHint] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [showLights, setShowLights] = useState(false);
  const { buildMode, currentStep, maxSteps, toggleBuildMode } = useBuildStore();
  const currentComponent = pcComponents.find(
    (c) => c.buildOrder === currentStep,
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showAirflow) {
      playAmbientSound();
    } else {
      stopAmbientSound();
    }
  }, [showAirflow]);

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
      <AnimatePresence>
        {(showPalette || showEnv) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0"
            onClick={() => {
              setShowPalette(false);
              setShowEnv(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Tryb Budowy UI Overlay */}
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

      <AnimatePresence>
        {buildMode && currentComponent?.buildTip && currentStep <= maxSteps && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-6 left-6 z-50 w-[calc(100vw-3rem)] max-w-sm flex flex-col bg-[#0a0a0a]/80 backdrop-blur-3xl border border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
          >
            <div className="flex items-center gap-3 bg-indigo-500/10 px-4 py-3 border-b border-indigo-500/20">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Sparkles size={16} />
              </div>
              <span className="text-indigo-300 font-bold uppercase tracking-wider text-xs">
                Porada Eksperta
              </span>
            </div>
            <div className="p-4 text-slate-300 text-[15px] text-center leading-relaxed">
              {currentComponent.buildTip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!buildMode && (
        <motion.div
          id="ui-controls"
          role="region"
          aria-label="Kontrolery aplikacji"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`group fixed top-6 left-6 z-10 flex flex-col gap-2 p-2 bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible transition-all duration-500 w-[60px] hover:w-[220px]`}
        >
          <div className="relative flex items-center w-full h-11 rounded-xl overflow-hidden cursor-default">
            <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.8)]"></span>
            </div>
            <span className="ml-1 font-extrabold text-base tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              PCVerse
            </span>
          </div>

          <div className="w-full h-px bg-white/10 mb-1 rounded-full" />
          <motion.button
            aria-label="Rozłóż na Części"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (explodeStep === 0) playExplodeSound();
              else playSelectSound();
              toggleExploded();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${explodeStep > 0 ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-colors ${explodeStep > 0 ? "text-indigo-400" : "text-slate-300"}`}
            >
              <Layers
                aria-hidden="true"
                size={20}
                className={`transition-transform duration-500 ${explodeStep > 0 ? "rotate-180" : ""}`}
              />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {explodeStep === 2
                ? "Złóż Komputer"
                : explodeStep === 1
                  ? "Sekwencja..."
                  : "Rozłóż na Części"}
            </span>
          </motion.button>

          <motion.button
            aria-label="Zresetuj Widok"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              triggerCameraReset();
            }}
            className="relative flex items-center w-full h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden"
          >
            <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300">
              <Focus aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Zresetuj Widok
            </span>
          </motion.button>

          <motion.button
            aria-label="Tryb Budowy"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              setSelectedComponent(null);
              toggleBuildMode();
            }}
            className="relative flex items-center w-full h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden"
          >
            <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
              <Hammer aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 group-hover:text-indigo-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300">
              Tryb Budowy
            </span>
          </motion.button>

          <motion.button
            aria-label="Hologram X-Ray"
            aria-pressed={xrayMode}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              toggleXrayMode();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${xrayMode ? "bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${xrayMode ? "text-cyan-400 scale-110" : "text-slate-300"}`}
            >
              <Scan aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Hologram (X-Ray)
            </span>
          </motion.button>

          <motion.button
            aria-label="Symulacja Airflow"
            aria-pressed={showAirflow}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              toggleAirflow();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showAirflow ? "bg-blue-500/20 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showAirflow ? "text-blue-400 scale-110" : "text-slate-300"}`}
            >
              <Wind aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Symulacja Airflow
            </span>
          </motion.button>

          <div 
            className="relative"
            onMouseEnter={() => {
              setShowPalette(true);
              setShowEnv(false);
              setShowLights(false);
            }}
            onMouseLeave={() => setShowPalette(false)}
          >
            <motion.button
              aria-label="Tryb RGB"
              aria-pressed={showPalette || rgbEnabled}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSelectSound();
                setShowPalette(!showPalette);
                setShowEnv(false);
                setShowLights(false);
              }}
              className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showPalette || rgbEnabled ? "bg-purple-500/20 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
            >
              <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center">
                <Palette
                  aria-hidden="true"
                  size={20}
                  className="transition-colors"
                  style={{ color: rgbEnabled ? rgbColor : "#94a3b8" }}
                />
              </div>
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Tryb RGB
              </span>
            </motion.button>

            <AnimatePresence>
              {showPalette && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="absolute top-0 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-max"
                >
                  <div className="p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl grid grid-cols-3 gap-3 shadow-2xl">
                  <button
                    aria-label="Wyłącz RGB"
                    onClick={() => {
                      playSelectSound();
                      if (rgbEnabled) toggleRgbEnabled();
                      setShowPalette(false);
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer flex-shrink-0 flex items-center justify-center bg-[#111] ${!rgbEnabled ? "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border-white/10 text-white/50 hover:border-white/30"}`}
                    title="Wyłącz RGB"
                  >
                    <span className="text-[10px] font-bold">OFF</span>
                  </button>

                  {COLORS.map((c) => (
                    <button
                      key={c.hex}
                      aria-label={`Kolor RGB ${c.name}`}
                      onClick={() => {
                        playSelectSound();
                        setRgbColor(c.hex);
                        if (!rgbEnabled) toggleRgbEnabled();
                        setShowPalette(false);
                      }}
                      className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer flex-shrink-0"
                      style={{
                        backgroundColor: c.hex,
                        borderColor:
                          rgbColor === c.hex && rgbEnabled
                            ? "white"
                            : "transparent",
                        boxShadow:
                          rgbColor === c.hex && rgbEnabled
                            ? `0 0 10px ${c.hex}`
                            : "none",
                      }}
                      title={c.name}
                    />
                  ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => {
              setShowEnv(true);
              setShowPalette(false);
              setShowLights(false);
            }}
            onMouseLeave={() => setShowEnv(false)}
          >
            <motion.button
              aria-label="Otoczenie HDRi"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSelectSound();
                setShowEnv(!showEnv);
                setShowPalette(false);
                setShowLights(false);
              }}
              className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showEnv ? "bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
            >
              <div
                className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showEnv ? "text-amber-400 scale-110 rotate-90" : "text-slate-300"}`}
              >
                <Sun aria-hidden="true" size={20} />
              </div>
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Otoczenie (HDRi)
              </span>
            </motion.button>

            <AnimatePresence>
              {showEnv && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="absolute top-0 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-48"
                >
                  <div className="p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 shadow-2xl">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      aria-label={`Otoczenie ${p.name}`}
                      onClick={() => {
                        playSelectSound();
                        setEnvPreset(p.id);
                        setShowEnv(false);
                      }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${envPreset === p.id ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                        {p.desc}
                      </div>
                    </button>
                  ))}

                  <div className="hidden md:block h-px bg-white/10 my-1 w-full" />

                  <button
                    aria-label="Przełącz Biurko"
                    onClick={() => {
                      playSelectSound();
                      toggleDesk();
                      setShowEnv(false);
                    }}
                    className={`hidden md:block text-left px-3 py-2 rounded-lg text-sm transition-colors ${showDesk ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <div className="font-medium">Tryb Scenografii</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                      {showDesk ? "Cyber-Biurko (Wł)" : "Cyber-Biurko (Wył)"}
                    </div>
                  </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => {
              setShowLights(true);
              setShowEnv(false);
              setShowPalette(false);
            }}
            onMouseLeave={() => setShowLights(false)}
          >
            <motion.button
              aria-label="Oświetlenie"
              aria-pressed={showLights}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSelectSound();
                setShowLights(!showLights);
                setShowEnv(false);
                setShowPalette(false);
              }}
              className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showLights ? "bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
            >
              <div
                className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLights ? "text-yellow-400 scale-110" : "text-slate-300"}`}
              >
                <Lightbulb aria-hidden="true" size={20} />
              </div>
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Oświetlenie
              </span>
            </motion.button>

            <AnimatePresence>
              {showLights && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="absolute top-0 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-52"
                >
                  <div className="p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 shadow-2xl">
                  <button
                    aria-pressed={ambientOn}
                    onClick={() => {
                      playSelectSound();
                      toggleAmbient();
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${ambientOn ? "bg-yellow-500/20 text-yellow-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <div className="font-medium">Światło Pokoju</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                      {ambientOn ? "(Włączone)" : "(Wyłączone)"}
                    </div>
                  </button>
                  <button
                    aria-pressed={mainSpotOn}
                    onClick={() => {
                      playSelectSound();
                      toggleMainSpot();
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${mainSpotOn ? "bg-yellow-500/20 text-yellow-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <div className="font-medium">Główny Reflektor</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                      {mainSpotOn ? "(Włączony)" : "(Wyłączony)"}
                    </div>
                  </button>
                  <button
                    aria-pressed={pcRGBOn}
                    onClick={() => {
                      playSelectSound();
                      togglePcRGB();
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${pcRGBOn ? "bg-purple-500/20 text-purple-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <div className="font-medium">Tylna Poświata RGB</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                      {pcRGBOn ? "(Włączona)" : "(Wyłączona)"}
                    </div>
                  </button>
                  <button
                    aria-pressed={cursorLightOn}
                    onClick={() => {
                      playSelectSound();
                      toggleCursorLight();
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${cursorLightOn ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <div className="font-medium">Latarka Kursora</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">
                      {cursorLightOn ? "(Włączona)" : "(Wyłączona)"}
                    </div>
                  </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            aria-label="Ukryj lub pokaż etykiety"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              toggleLabels();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showLabels ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLabels ? "text-emerald-400 scale-110" : "text-slate-300"}`}
            >
              <Tag aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Etykiety
            </span>
          </motion.button>

          <motion.button
            aria-label="Efekty cząsteczkowe (Pył)"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              toggleParticles();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showParticles ? "bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showParticles ? "text-amber-400 scale-110" : "text-slate-300"}`}
            >
              <Sparkles aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Efekty cząsteczkowe
            </span>
          </motion.button>

          <motion.button
            aria-label="Mgła tła"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              toggleFog();
            }}
            className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showFog ? "bg-sky-500/20 border border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div
              className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showFog ? "text-sky-400 scale-110" : "text-slate-300"}`}
            >
              <Cloud aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Mgła tła
            </span>
          </motion.button>

          <motion.button
            aria-label="Instrukcja obsługi"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSelectSound();
              setShowInstructions(true);
            }}
            className="relative flex items-center w-full h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden"
          >
            <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300">
              <Info aria-hidden="true" size={20} />
            </div>
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Instrukcja obsługi
            </span>
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full text-slate-300 text-sm z-30 cursor-pointer shadow-2xl"
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
                    />
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Sterowanie i Interakcja
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300">
                        <div>
                          <p className="font-semibold text-white/90 mb-2 border-b border-white/10 pb-1.5">
                            Mysz i Klawiatura
                          </p>
                          <ul className="space-y-2">
                            <li>
                              • <strong className="text-white">Obrót:</strong>{" "}
                              Lewy przycisk (LPM)
                            </li>
                            <li>
                              • <strong className="text-white">Zoom:</strong>{" "}
                              Kółko myszy
                            </li>
                            <li>
                              • <strong className="text-white">Wyjście:</strong>{" "}
                              Klawisz ESC
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white/90 mb-2 border-b border-white/10 pb-1.5">
                            Gesty Dotykowe
                          </p>
                          <ul className="space-y-2">
                            <li>
                              • <strong className="text-white">Obrót:</strong>{" "}
                              Pojedynczy palec
                            </li>
                            <li>
                              • <strong className="text-white">Zoom:</strong>{" "}
                              Uszczypnięcie ekranu
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-sm text-indigo-200 font-medium leading-relaxed">
                          💡{" "}
                          <strong className="text-indigo-100">
                            Wskazówka:
                          </strong>{" "}
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
      <span role="status" aria-live="polite" className="sr-only">
        {`Hologram ${xrayMode ? "włączony" : "wyłączony"}. Airflow ${showAirflow ? "włączony" : "wyłączony"}.`}
      </span>
    </>
  );
};
