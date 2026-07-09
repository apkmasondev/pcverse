import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePCSelection,
  usePCRGB,
  usePCView,
  usePCUI,
  usePCLighting,
  useAppLoading,
} from "../../hooks/usePC";
import { useBuildStore } from "../../store/useBuildStore";
import { playExplodeSound, playSelectSound } from "../../utils/audio";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  Layers,
  Focus,
  Scan,
  Wind,
  Palette,
  Sun,
  Lightbulb,
  Tag,
  Sparkles,
  Cloud,
  Info,
  Hammer,
} from "lucide-react";

const PRESETS = [
  { id: "city", name: "Cyberpunk", desc: "Nocne miasto" },
  { id: "night", name: "Noc", desc: "Głęboka czerń" },
  { id: "studio", name: "Studio", desc: "Neutralne światło" },
  { id: "dawn", name: "Świt", desc: "Ciepłe poranne" },
  { id: "apartment", name: "Jasny Pokój", desc: "Bardzo jasne wnętrze" },
  { id: "lobby", name: "Hol / Korytarz", desc: "Eleganckie ciepłe światło" },
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

export const SidebarControls = () => {
  const explodeStep = usePCSelection(state => state.explodeStep);
  const toggleExploded = usePCSelection(state => state.toggleExploded);
  const triggerCameraReset = usePCSelection(state => state.triggerCameraReset);
  const setSelectedComponent = usePCSelection(state => state.setSelectedComponent);

  const rgbColor = usePCRGB(state => state.rgbColor);
  const setRgbColor = usePCRGB(state => state.setRgbColor);
  const rgbEnabled = usePCRGB(state => state.rgbEnabled);
  const toggleRgbEnabled = usePCRGB(state => state.toggleRgbEnabled);

  const xrayMode = usePCView(state => state.xrayMode);
  const toggleXrayMode = usePCView(state => state.toggleXrayMode);
  const showAirflow = usePCView(state => state.showAirflow);
  const toggleAirflow = usePCView(state => state.toggleAirflow);
  const envPreset = usePCView(state => state.envPreset);
  const setEnvPreset = usePCView(state => state.setEnvPreset);
  const showDesk = usePCView(state => state.showDesk);
  const toggleDesk = usePCView(state => state.toggleDesk);
  const showParticles = usePCView(state => state.showParticles);
  const toggleParticles = usePCView(state => state.toggleParticles);
  const showFog = usePCView(state => state.showFog);
  const toggleFog = usePCView(state => state.toggleFog);
  const isLowEndGPU = usePCView(state => state.isLowEndGPU);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  const showLabels = usePCUI(state => state.showLabels);
  const toggleLabels = usePCUI(state => state.toggleLabels);
  const setShowInstructions = usePCUI(state => state.setShowInstructions);

  const ambientOn = usePCLighting(state => state.ambientOn);
  const toggleAmbient = usePCLighting(state => state.toggleAmbient);
  const mainSpotOn = usePCLighting(state => state.mainSpotOn);
  const toggleMainSpot = usePCLighting(state => state.toggleMainSpot);
  const pcRGBOn = usePCLighting(state => state.pcRGBOn);
  const togglePcRGB = usePCLighting(state => state.togglePcRGB);
  const cursorLightOn = usePCLighting(state => state.cursorLightOn);
  const toggleCursorLight = usePCLighting(state => state.toggleCursorLight);

  const triggerLoading = useAppLoading(state => state.triggerLoading);
  const toggleBuildMode = useBuildStore(state => state.toggleBuildMode);

  const [showPalette, setShowPalette] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [showLights, setShowLights] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkCompact = () => {
      setIsCompact(window.innerWidth < 768 || window.innerHeight < 780);
    };
    checkCompact();
    window.addEventListener("resize", checkCompact);
    return () => window.removeEventListener("resize", checkCompact);
  }, []);

  return (
    <>
      <AnimatePresence>
        {(showPalette || showEnv || showLights) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${isCompact ? "bg-black/60 backdrop-blur-sm z-[90]" : "z-0"}`}
            onClick={() => {
              setShowPalette(false);
              setShowEnv(false);
              setShowLights(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        id="ui-controls"
        role="region"
        aria-label="Kontrolery aplikacji"
        initial={isCompact ? { opacity: 0, y: 20 } : { opacity: 0, x: -20 }}
        animate={isCompact ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`group fixed z-10 flex gap-2 p-2 bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ${
          isCompact 
            ? "bottom-6 left-6 right-6 top-auto flex-row overflow-x-auto scrollbar-hide h-[60px] w-auto justify-start items-center" 
            : "top-6 left-6 bottom-auto flex-col w-[60px] hover:w-[220px] overflow-visible"
        }`}
      >
        {!isCompact && (
          <>
            <div className="relative flex items-center w-full h-11 rounded-xl overflow-hidden cursor-default">
              <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.8)]"></span>
              </div>
              <span className="ml-1 font-extrabold text-base tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                PCVerse
              </span>
            </div>

            <div className="w-full h-px bg-white/10 mb-1 rounded-full" />
          </>
        )}

        <motion.button
          aria-label="Rozłóż na Części"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (explodeStep === 0) playExplodeSound();
            else playSelectSound();
            toggleExploded();
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${explodeStep > 0 ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-colors ${explodeStep > 0 ? "text-indigo-400" : "text-slate-300"}`}>
            <Layers aria-hidden="true" size={20} className={`transition-transform duration-500 ${explodeStep > 0 ? "rotate-180" : ""}`} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {explodeStep === 2 ? "Złóż Komputer" : explodeStep === 1 ? "Sekwencja..." : "Rozłóż na Części"}
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Zresetuj Widok"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            triggerCameraReset();
          }}
          className={`relative flex items-center h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          }`}
        >
          <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300">
            <Focus aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Zresetuj Widok
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Tryb Budowy"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            setSelectedComponent(null);
            toggleBuildMode();
          }}
          className={`relative flex items-center h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden max-md:opacity-30 max-md:cursor-not-allowed max-md:pointer-events-none ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          }`}
        >
          <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
            <Hammer aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 group-hover:text-indigo-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300">
              Tryb Budowy
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Hologram X-Ray"
          aria-pressed={xrayMode}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            toggleXrayMode();
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${xrayMode ? "bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${xrayMode ? "text-cyan-400 scale-110" : "text-slate-300"}`}>
            <Scan aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Hologram (X-Ray)
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Symulacja Airflow"
          aria-pressed={showAirflow}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            toggleAirflow();
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${showAirflow ? "bg-blue-500/20 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showAirflow ? "text-blue-400 scale-110" : "text-slate-300"}`}>
            <Wind aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Symulacja Airflow
            </span>
          )}
        </motion.button>

        <div
          className="relative"
          onMouseEnter={!isCompact ? () => {
            setShowPalette(true);
            setShowEnv(false);
            setShowLights(false);
          } : undefined}
          onMouseLeave={!isCompact ? () => setShowPalette(false) : undefined}
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
            className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
              isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
            } ${showPalette || rgbEnabled ? "bg-purple-500/20 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center">
              <Palette aria-hidden="true" size={20} className="transition-colors" style={{ color: rgbEnabled ? rgbColor : "#94a3b8" }} />
            </div>
            {!isCompact && (
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Tryb RGB
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showPalette && (
              <motion.div
                initial={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                animate={isCompact ? { y: 0 } : { opacity: 1, x: 0, scale: 1 }}
                exit={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                transition={isCompact ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.2 }}
                className={isCompact 
                  ? "fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full pl-0"
                  : "absolute top-1/2 -translate-y-1/2 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-max"
                }
              >
                <div className={isCompact
                  ? "p-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
                  : "p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl grid grid-cols-3 gap-3 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar"
                }>
                  {isCompact && (
                    <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />
                  )}
                  {isCompact && (
                    <div className="text-center text-sm font-bold text-slate-400 mb-2">Wybierz kolor RGB</div>
                  )}
                  
                  <div className={isCompact ? "grid grid-cols-5 gap-3 justify-items-center" : "contents"}>
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
                          borderColor: rgbColor === c.hex && rgbEnabled ? "white" : "transparent",
                          boxShadow: rgbColor === c.hex && rgbEnabled ? `0 0 10px ${c.hex}` : "none",
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="relative"
          onMouseEnter={!isCompact ? () => {
            setShowEnv(true);
            setShowPalette(false);
            setShowLights(false);
          } : undefined}
          onMouseLeave={!isCompact ? () => setShowEnv(false) : undefined}
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
            className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
              isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
            } ${showEnv ? "bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showEnv ? "text-amber-400 scale-110 rotate-90" : "text-slate-300"}`}>
              <Sun aria-hidden="true" size={20} />
            </div>
            {!isCompact && (
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Otoczenie (HDRi)
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showEnv && (
              <motion.div
                initial={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                animate={isCompact ? { y: 0 } : { opacity: 1, x: 0, scale: 1 }}
                exit={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                transition={isCompact ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.2 }}
                className={isCompact
                  ? "fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full pl-0"
                  : "absolute top-1/2 -translate-y-1/2 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-48"
                }
              >
                <div className={isCompact
                  ? "p-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto custom-scrollbar"
                  : "p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar"
                }>
                  {isCompact && (
                    <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />
                  )}
                  {isCompact && (
                    <div className="text-center text-sm font-bold text-slate-400 mb-2">Otoczenie (HDRi) i Scenografia</div>
                  )}

                  <div className={isCompact ? "grid grid-cols-2 gap-3" : "contents"}>
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
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{p.desc}</div>
                      </button>
                    ))}

                    <button
                      title={isLowEndGPU ? "Niedostępne ze względu na spadki płynności (FPS)" : "Pokaż scenografię"}
                      disabled={isLowEndGPU}
                      onClick={() => {
                        if (!isLowEndGPU) {
                          playSelectSound();
                          triggerLoading(toggleDesk);
                        }
                        setShowEnv(false);
                      }}
                      className={`flex flex-col items-start text-left px-3 py-2 rounded-lg text-sm transition-colors ${isCompact ? "" : "hidden md:flex"} ${isLowEndGPU ? 'opacity-30 cursor-not-allowed bg-[#1a1a1a] border border-white/5 text-slate-500' : (showDesk ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50" : "text-slate-300 hover:bg-white/10 hover:text-white")}`}
                    >
                      <div className="font-medium whitespace-nowrap">Tryb Scenografii</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {isLowEndGPU ? "Niedostępne" : (showDesk ? "(Włączono)" : "(Wyłączono)")}
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="relative"
          onMouseEnter={!isCompact ? () => {
            setShowLights(true);
            setShowEnv(false);
            setShowPalette(false);
          } : undefined}
          onMouseLeave={!isCompact ? () => setShowLights(false) : undefined}
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
            className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
              isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
            } ${showLights ? "bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
          >
            <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLights ? "text-yellow-400 scale-110" : "text-slate-300"}`}>
              <Lightbulb aria-hidden="true" size={20} />
            </div>
            {!isCompact && (
              <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Oświetlenie
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showLights && (
              <motion.div
                initial={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                animate={isCompact ? { y: 0 } : { opacity: 1, x: 0, scale: 1 }}
                exit={isCompact ? { y: "100%" } : { opacity: 0, x: -10, scale: 0.95 }}
                transition={isCompact ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.2 }}
                className={isCompact
                  ? "fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full pl-0"
                  : "absolute top-1/2 -translate-y-1/2 left-[50px] md:left-full pl-2 md:pl-4 z-50 w-52"
                }
              >
                <div className={isCompact
                  ? "p-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto custom-scrollbar"
                  : "p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar"
                }>
                  {isCompact && (
                    <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />
                  )}
                  {isCompact && (
                    <div className="text-center text-sm font-bold text-slate-400 mb-2">Opcje oświetlenia</div>
                  )}

                  <div className={isCompact ? "grid grid-cols-2 gap-3" : "contents"}>
                    <button
                      aria-pressed={ambientOn}
                      onClick={() => { playSelectSound(); triggerLoading(toggleAmbient); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${ambientOn ? "bg-yellow-500/20 text-yellow-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      <div className="font-medium">Światło Pokoju</div>
                      <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{ambientOn ? "(Włączone)" : "(Wyłączone)"}</div>
                    </button>
                    <button
                      aria-pressed={mainSpotOn}
                      onClick={() => { playSelectSound(); triggerLoading(toggleMainSpot); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${mainSpotOn ? "bg-yellow-500/20 text-yellow-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      <div className="font-medium">Główny Reflektor</div>
                      <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{mainSpotOn ? "(Włączony)" : "(Wyłączony)"}</div>
                    </button>
                    <button
                      title={(!showDesk || isMobile || isLowEndGPU) ? "Opcja dostępna tylko w Trybie Scenografii na PC (wymaga ściany)" : "Tylna Poświata RGB"}
                      disabled={!showDesk || isMobile || isLowEndGPU}
                      aria-pressed={pcRGBOn}
                      onClick={() => { if (showDesk && !isMobile && !isLowEndGPU) { playSelectSound(); triggerLoading(togglePcRGB); } }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${(!showDesk || isMobile || isLowEndGPU) ? 'opacity-30 cursor-not-allowed bg-[#1a1a1a] border border-white/5 text-slate-500' : (pcRGBOn ? "bg-purple-500/20 text-purple-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white")}`}
                    >
                      <div className="font-medium">Tylna Poświata RGB</div>
                      <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{(!showDesk || isMobile || isLowEndGPU) ? "(Niedostępna)" : (pcRGBOn ? "(Włączona)" : "(Wyłączona)")}</div>
                    </button>
                    <button
                      title={(isMobile || isLowEndGPU) ? "Niedostępne ze względu na wydajność" : "Latarka Kursora"}
                      disabled={isMobile || isLowEndGPU}
                      onClick={() => { if (!(isMobile || isLowEndGPU)) { playSelectSound(); triggerLoading(toggleCursorLight); } }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${(isMobile || isLowEndGPU) ? 'opacity-30 cursor-not-allowed bg-[#1a1a1a] border border-white/5 text-slate-500' : (cursorLightOn ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white")}`}
                    >
                      <div className="font-medium whitespace-nowrap">Latarka Kursora</div>
                      <div className="text-[10px] mt-0.5 opacity-70 leading-tight">{(isMobile || isLowEndGPU) ? "(Niedostępna)" : (cursorLightOn ? "(Włączona)" : "(Wyłączona)")}</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          aria-label="Ukryj lub pokaż etykiety"
          aria-pressed={showLabels}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            toggleLabels();
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${showLabels ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLabels ? "text-emerald-400 scale-110" : "text-slate-300"}`}>
            <Tag aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Etykiety
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Efekty cząsteczkowe (Pył)"
          title={(isLowEndGPU || isMobile || reducedMotion) ? "Niedostępne ze względu na wydajność" : "Efekty cząsteczkowe"}
          disabled={isLowEndGPU || isMobile || reducedMotion}
          whileTap={!(isLowEndGPU || isMobile || reducedMotion) ? { scale: 0.95 } : undefined}
          onClick={() => {
            if (!(isLowEndGPU || isMobile || reducedMotion)) {
              playSelectSound();
              toggleParticles();
            }
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${(isLowEndGPU || isMobile || reducedMotion) ? "opacity-30 cursor-not-allowed" : (showParticles ? "bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5")}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${(isLowEndGPU || isMobile || reducedMotion) ? "text-slate-500" : (showParticles ? "text-amber-400 scale-110" : "text-slate-300")}`}>
            <Sparkles aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className={`ml-1 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${(isLowEndGPU || isMobile || reducedMotion) ? "text-slate-500" : "text-slate-300"}`}>
              Efekty cząsteczkowe
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Mgła tła"
          aria-pressed={showFog}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            triggerLoading(toggleFog);
          }}
          className={`relative flex items-center h-11 rounded-xl transition-all overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          } ${showFog ? "bg-sky-500/20 border border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showFog ? "text-sky-400 scale-110" : "text-slate-300"}`}>
            <Cloud aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Mgła tła
            </span>
          )}
        </motion.button>

        <motion.button
          aria-label="Instrukcja obsługi"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            setShowInstructions(true);
          }}
          className={`relative flex items-center h-11 rounded-xl bg-transparent border border-transparent transition-colors hover:bg-white/5 overflow-hidden ${
            isCompact ? "w-11 justify-center flex-shrink-0" : "w-full"
          }`}
        >
          <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center text-slate-300">
            <Info aria-hidden="true" size={20} />
          </div>
          {!isCompact && (
            <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Instrukcja obsługi
            </span>
          )}
        </motion.button>
      </motion.div>
    </>
  );
};
