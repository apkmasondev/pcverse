import { useState, useEffect } from 'react';
import { usePC } from '../../hooks/usePC';
import { Layers, Focus, MousePointerClick, Scan, Wind, Palette, Sun, Tag, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playExplodeSound, playSelectSound, playAmbientSound, stopAmbientSound } from '../../utils/audio';

const PRESETS = [
  { id: 'studio', name: 'Studio', desc: 'Neutralne światło' },
  { id: 'city', name: 'Cyberpunk', desc: 'Nocne miasto' },
  { id: 'dawn', name: 'Świt', desc: 'Ciepłe poranne' },
  { id: 'apartment', name: 'Jasny Pokój', desc: 'Bardzo jasne wnętrze' }
];

const COLORS = [
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Gold', hex: '#fbbf24' }
];

const Tooltip = ({ text }: { text: string }) => (
  <span className="absolute top-full mt-3 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 text-slate-300 text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 font-medium tracking-wide">
    {text}
  </span>
);

export const UI = () => {
  const { explodeStep, toggleExploded, triggerCameraReset, xrayMode, toggleXrayMode, rgbColor, setRgbColor, rgbEnabled, toggleRgbEnabled, showAirflow, toggleAirflow, envPreset, setEnvPreset, showLabels, toggleLabels, showInstructions, setShowInstructions } = usePC();
  const [showHint, setShowHint] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [showEnv, setShowEnv] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
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
      if (e.key === 'Escape' && showInstructions) {
        setShowInstructions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInstructions, setShowInstructions]);

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-6 left-6 z-10 flex flex-col md:flex-row gap-3"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="hidden md:flex items-center gap-2 px-5 py-2 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-full text-indigo-300 font-bold text-sm tracking-wide mr-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        PCVerse
      </motion.div>

      <motion.button
        aria-label="Rozłóż na Części"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (explodeStep === 0) playExplodeSound();
          else playSelectSound();
          toggleExploded();
        }}
        className="group relative flex items-center justify-center w-9 h-9 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 rounded-full transition-all hover:bg-indigo-500/20 hover:border-indigo-500/30"
      >
        <Layers size={16} className={`transition-transform duration-500 ${explodeStep > 0 ? 'rotate-180 text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
        <Tooltip text={explodeStep === 2 ? 'Złóż Komputer' : explodeStep === 1 ? 'Sekwencja...' : 'Rozłóż na Części'} />
      </motion.button>
      
      <motion.button
        aria-label="Zresetuj Widok"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSelectSound();
          triggerCameraReset();
        }}
        className="group relative flex items-center justify-center w-9 h-9 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 rounded-full transition-all hover:bg-indigo-500/20 hover:border-indigo-500/30"
      >
        <Focus size={16} className="text-slate-400 group-hover:text-indigo-300" />
        <Tooltip text="Zresetuj Widok" />
      </motion.button>

      <motion.button
        aria-label="Hologram X-Ray"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSelectSound();
          toggleXrayMode();
        }}
        className={`group relative flex items-center justify-center w-9 h-9 backdrop-blur-md border rounded-full transition-all ${xrayMode ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#0a0a0a]/90 border-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30'}`}
      >
        <Scan size={16} className={`transition-all duration-500 ${xrayMode ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-cyan-300'}`} />
        <Tooltip text="Hologram (X-Ray)" />
      </motion.button>

      <motion.button
        aria-label="Symulacja Airflow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSelectSound();
          toggleAirflow();
        }}
        className={`group relative flex items-center justify-center w-9 h-9 backdrop-blur-md border rounded-full transition-all ${showAirflow ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-[#0a0a0a]/90 border-white/5 hover:bg-blue-500/20 hover:border-blue-500/30'}`}
      >
        <Wind size={16} className={`transition-all duration-500 ${showAirflow ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-blue-300'}`} />
        <Tooltip text="Symulacja Airflow" />
      </motion.button>

      <div className="relative">
        <motion.button
          aria-label="Tryb RGB"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            setShowPalette(!showPalette);
            setShowEnv(false);
          }}
          className={`group relative flex items-center justify-center w-9 h-9 backdrop-blur-md border rounded-full transition-all ${showPalette || rgbEnabled ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-purple-300' : 'bg-[#0a0a0a]/90 border-white/5 hover:bg-purple-500/20 hover:border-purple-500/30 text-slate-400'}`}
        >
          <Palette size={16} className="transition-colors" style={{ color: rgbEnabled ? rgbColor : '#94a3b8' }} />
          <Tooltip text="Tryb RGB" />
        </motion.button>
        
        <AnimatePresence>
          {showPalette && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex gap-2 z-50 items-center"
            >
              <button
                onClick={() => {
                  playSelectSound();
                  if (rgbEnabled) toggleRgbEnabled();
                  setShowPalette(false);
                }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer flex-shrink-0 flex items-center justify-center bg-[#111] ${!rgbEnabled ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                title="Wyłącz RGB"
              >
                <span className="text-[10px] font-bold">OFF</span>
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1" />

              {COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => {
                    playSelectSound();
                    setRgbColor(c.hex);
                    if (!rgbEnabled) toggleRgbEnabled();
                    setShowPalette(false);
                  }}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer flex-shrink-0"
                  style={{ 
                    backgroundColor: c.hex,
                    borderColor: rgbColor === c.hex && rgbEnabled ? 'white' : 'transparent',
                    boxShadow: rgbColor === c.hex && rgbEnabled ? `0 0 10px ${c.hex}` : 'none'
                  }}
                  title={c.name}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <motion.button
          aria-label="Otoczenie HDRi"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSelectSound();
            setShowEnv(!showEnv);
            setShowPalette(false);
          }}
          className={`group relative flex items-center justify-center w-9 h-9 backdrop-blur-md border rounded-full transition-all ${showEnv ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-300' : 'bg-[#0a0a0a]/90 border-white/5 hover:bg-amber-500/20 hover:border-amber-500/30'}`}
        >
          <Sun size={16} className={`transition-all duration-500 ${showEnv ? 'text-amber-400 scale-110 rotate-90' : 'text-slate-400 group-hover:text-amber-300'}`} />
          <Tooltip text="Otoczenie (HDRi)" />
        </motion.button>
        
        <AnimatePresence>
          {showEnv && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 p-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 z-50 w-48"
            >
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    playSelectSound();
                    setEnvPreset(p.id);
                    setShowEnv(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${envPreset === p.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">{p.desc}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        aria-label="Ukryj lub pokaż etykiety"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSelectSound();
          toggleLabels();
        }}
        className={`group relative flex items-center justify-center w-9 h-9 backdrop-blur-md border rounded-full transition-all ${showLabels ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#0a0a0a]/90 border-white/5 text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-white'}`}
      >
        <Tag size={16} className={`transition-all duration-500 ${showLabels ? 'text-emerald-400 scale-110' : 'text-slate-400 group-hover:text-emerald-300'}`} />
        <Tooltip text="Ukryj/pokaż etykiety" />
      </motion.button>

      <motion.button
        aria-label="Instrukcja obsługi"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSelectSound();
          setShowInstructions(true);
        }}
        className="group relative flex items-center justify-center w-9 h-9 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 rounded-full text-slate-300 transition-all hover:bg-white/10 hover:border-white/30 hover:text-white"
      >
        <Info size={16} className="text-slate-400 group-hover:text-white" />
        <Tooltip text="Instrukcja obsługi" />
      </motion.button>
    </motion.div>

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
            <MousePointerClick size={18} className="text-indigo-400 animate-bounce" />
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
              className="bg-gradient-to-br from-[#0a0a0a] to-indigo-950/20 border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative shadow-[0_0_40px_rgba(99,102,241,0.15)]"
            >
              <button 
                onClick={() => setShowInstructions(false)}
                aria-label="Zamknij instrukcję"
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 id="instructions-title" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Info className="text-indigo-400" aria-hidden="true" />
                Legenda i Instrukcja
              </h2>
              
              <div className="grid gap-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <MousePointerClick className="text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Nawigacja i Detale</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Użyj LPM do obrotu, kółka myszy do przybliżania. <strong>Użyj klawiszy W, A, S, D lub strzałek, by poruszać kamerą (przód, tył i na boki) podobnie jak w grach. Do przesuwania (Pan) w dowolnym kierunku użyj PPM (prawy klik).</strong> Kliknij w dowolny komponent obudowy, by skupić na nim kamerę i otworzyć szczegóły.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Layers className="text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Rozkładanie (Teardown)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Przycisk "Rozłóż na Części" aktywuje wybuchową animację rozsunięcia całego sprzętu. Rozkładanie zachodzi dwuetapowo: najpierw szkło, potem środek.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Focus className="text-indigo-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>Zresetuj:</strong> Przywróć domyślną kamerę.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Scan className="text-cyan-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>Hologram:</strong> Prześwietlenie X-Ray.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Wind className="text-blue-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>Airflow:</strong> Symulacja cyrkulacji powietrza.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Sun className="text-amber-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>Otoczenie:</strong> Zmiana tła i światła (HDRi).</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Palette className="text-purple-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>RGB:</strong> Zmiana koloru podświetlenia.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Tag className="text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300"><strong>Etykiety:</strong> Ukryj/pokaż nazwy w 3D.</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-colors"
              >
                Zrozumiałem
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
