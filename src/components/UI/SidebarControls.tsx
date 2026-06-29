import { useState } from "react";
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
              setShowLights(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        id="ui-controls"
        role="region"
        aria-label="Kontrolery aplikacji"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="group fixed top-6 left-6 z-10 flex flex-col gap-2 p-2 bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible transition-all duration-500 w-[60px] hover:w-[220px]"
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
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-colors ${explodeStep > 0 ? "text-indigo-400" : "text-slate-300"}`}>
            <Layers aria-hidden="true" size={20} className={`transition-transform duration-500 ${explodeStep > 0 ? "rotate-180" : ""}`} />
          </div>
          <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {explodeStep === 2 ? "Złóż Komputer" : explodeStep === 1 ? "Sekwencja..." : "Rozłóż na Części"}
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
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${xrayMode ? "text-cyan-400 scale-110" : "text-slate-300"}`}>
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
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showAirflow ? "text-blue-400 scale-110" : "text-slate-300"}`}>
            <Wind aria-hidden="true" size={20} />
          </div>
          <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Symulacja Airflow
          </span>
        </motion.button>

        {/* MODAL PALETY RGB */}
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
              <Palette aria-hidden="true" size={20} className="transition-colors" style={{ color: rgbEnabled ? rgbColor : "#94a3b8" }} />
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
                      borderColor: rgbColor === c.hex && rgbEnabled ? "white" : "transparent",
                      boxShadow: rgbColor === c.hex && rgbEnabled ? `0 0 10px ${c.hex}` : "none",
                    }}
                    title={c.name}
                  />
                ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL ŚRODOWISKA */}
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
            <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showEnv ? "text-amber-400 scale-110 rotate-90" : "text-slate-300"}`}>
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
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{p.desc}</div>
                  </button>
                ))}

                <div className="hidden md:block h-px bg-white/10 my-1 w-full" />

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
                  className={`hidden md:flex flex-col items-start text-left px-3 py-2 rounded-lg text-sm transition-colors ${isLowEndGPU ? 'opacity-30 cursor-not-allowed bg-[#1a1a1a] border border-white/5 text-slate-500' : (showDesk ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50" : "text-slate-300 hover:bg-white/10 hover:text-white")}`}
                >
                  <div className="font-medium whitespace-nowrap">Tryb Scenografii</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {isLowEndGPU ? "Niedostępne" : (showDesk ? "(Włączono)" : "(Wyłączono)")}
                  </div>
                </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL OŚWIETLENIA */}
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
            <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLights ? "text-yellow-400 scale-110" : "text-slate-300"}`}>
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
                  aria-pressed={pcRGBOn}
                  onClick={() => { playSelectSound(); triggerLoading(togglePcRGB); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${pcRGBOn ? "bg-purple-500/20 text-purple-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <div className="font-medium">Tylna Poświata RGB</div>
                  <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{pcRGBOn ? "(Włączona)" : "(Wyłączona)"}</div>
                </button>
                <button
                  aria-pressed={cursorLightOn}
                  onClick={() => { playSelectSound(); triggerLoading(toggleCursorLight); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${cursorLightOn ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <div className="font-medium">Latarka Kursora</div>
                  <div className="text-[10px] text-slate-300 font-normal mt-0.5 leading-tight">{cursorLightOn ? "(Włączona)" : "(Wyłączona)"}</div>
                </button>
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
          className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showLabels ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showLabels ? "text-emerald-400 scale-110" : "text-slate-300"}`}>
            <Tag aria-hidden="true" size={20} />
          </div>
          <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Etykiety
          </span>
        </motion.button>

        <motion.button
          aria-label="Efekty cząsteczkowe (Pył)"
          aria-pressed={showParticles}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            toggleParticles();
          }}
          className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showParticles ? "bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showParticles ? "text-amber-400 scale-110" : "text-slate-300"}`}>
            <Sparkles aria-hidden="true" size={20} />
          </div>
          <span className="ml-1 font-medium text-sm text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Efekty cząsteczkowe
          </span>
        </motion.button>

        <motion.button
          aria-label="Mgła tła"
          aria-pressed={showFog}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            triggerLoading(toggleFog);
          }}
          className={`relative flex items-center w-full h-11 rounded-xl transition-all overflow-hidden ${showFog ? "bg-sky-500/20 border border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "bg-transparent border border-transparent hover:bg-white/5"}`}
        >
          <div className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center transition-all duration-500 ${showFog ? "text-sky-400 scale-110" : "text-slate-300"}`}>
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
    </>
  );
};
