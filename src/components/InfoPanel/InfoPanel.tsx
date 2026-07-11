import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePCSelection } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useBuildStore } from '../../store/useBuildStore';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  MonitorPlay, 
  Power, 
  Wind, 
  Server,
  X,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Activity
} from 'lucide-react';

const getIcon = (id: string) => {
  if (id.includes('cpu')) return <Cpu className="w-5 h-5 text-indigo-400" />;
  if (id.includes('gpu')) return <MonitorPlay className="w-5 h-5 text-indigo-400" />;
  if (id.includes('ram')) return <MemoryStick className="w-5 h-5 text-indigo-400" />;
  if (id.includes('ssd')) return <HardDrive className="w-5 h-5 text-indigo-400" />;
  if (id.includes('psu')) return <Power className="w-5 h-5 text-indigo-400" />;
  if (id.includes('fan')) return <Wind className="w-5 h-5 text-indigo-400" />;
  if (id.includes('motherboard')) return <Server className="w-5 h-5 text-indigo-400" />;
  return <Server className="w-5 h-5 text-indigo-400" />;
};

const ProgressBar = ({ label, value }: { label: string; value: number }) => (
  <div className="mb-5 bg-white/[0.01] border border-white/[0.02] p-4 rounded-xl">
    <div className="flex justify-between text-xs mb-2.5">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="text-indigo-400 font-mono font-semibold text-[11px]">{value}%</span>
    </div>
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
      />
    </div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    x: 20, 
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const getImageUrl = (url: string) => {
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${baseUrl}${url.replace(/^\//, '')}`;
};

export const InfoPanel: React.FC = () => {
  const selectedComponent = usePCSelection(s => s.selectedComponent);
  const setSelectedComponent = usePCSelection(s => s.setSelectedComponent);
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { buildMode } = useBuildStore();

  useEffect(() => {
    setZoomedImageIndex(null);
  }, [selectedComponent?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedComponent) {
        if (zoomedImageIndex !== null) {
          setZoomedImageIndex(null);
        } else {
          setSelectedComponent(null);
        }
      } else if (zoomedImageIndex !== null && selectedComponent?.imageUrls) {
        if (e.key === 'ArrowRight') {
          setZoomedImageIndex((zoomedImageIndex + 1) % selectedComponent.imageUrls.length);
        } else if (e.key === 'ArrowLeft') {
          setZoomedImageIndex((zoomedImageIndex - 1 + selectedComponent.imageUrls.length) % selectedComponent.imageUrls.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, setSelectedComponent, zoomedImageIndex]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 150, damping: 30 });

  useEffect(() => {
    if (isMobile || !selectedComponent) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, selectedComponent, mouseX, mouseY]);

  if (buildMode) return null;

  return (
    <>
    <AnimatePresence>
      {selectedComponent && (
        <motion.div
          id="info-panel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label={`Informacje o podzespole: ${selectedComponent.name}`}
          style={isMobile ? {} : { rotateX, rotateY, transformPerspective: 1200 }}
          className="absolute bottom-0 md:bottom-0 md:top-0 md:right-0 z-20 
                     w-full md:w-[35vw] lg:w-[30vw] h-[60vh] md:h-screen overflow-y-auto custom-scrollbar
                     bg-[#050505]/80 backdrop-blur-3xl border-l border-white/10 
                     rounded-t-3xl md:rounded-none p-6 md:p-12
                     text-slate-200 shadow-[-20px_0_50px_-12px_rgba(0,0,0,1)]"
        >
          <button 
            onClick={() => setSelectedComponent(null)}
            aria-label="Zamknij panel informacyjny"
            className="absolute top-6 right-6 p-2 md:hover:bg-white/10 rounded-full transition-all duration-300 md:hover:scale-110 md:hover:rotate-90 z-30 bg-black/40 backdrop-blur-md"
          >
            <X size={16} className="text-slate-300" />
          </button>

          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 relative z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              {getIcon(selectedComponent.id)}
            </div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold tracking-tight text-white drop-shadow-md"
            >
              {selectedComponent.name.includes(' - ') ? (
                <>
                  {selectedComponent.name.split(' - ')[0]}
                  <span className="text-indigo-400 font-medium ml-2 opacity-90">- {selectedComponent.name.split(' - ')[1]}</span>
                </>
              ) : (
                selectedComponent.name
              )}
            </motion.h2>
          </motion.div>

          {selectedComponent.imageUrls && selectedComponent.imageUrls.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8 flex gap-3">
              <div 
                className="relative flex-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
                onClick={() => setZoomedImageIndex(0)}
              >
                <div className="absolute inset-0 bg-indigo-500/20 opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <Search size={28} className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 opacity-60"></div>
                <img 
                  src={getImageUrl(selectedComponent.imageUrls[0])} 
                  alt={`Zdjęcie podzespołu komputera: ${selectedComponent.name}`} 
                  loading="lazy"
                  className="w-full h-40 sm:h-48 object-cover transition-transform duration-700 md:group-hover:scale-105" 
                />
              </div>

              {selectedComponent.imageUrls[1] && (
                <div 
                  className="relative w-1/3 rounded-xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group hidden sm:block bg-black"
                  onClick={() => setZoomedImageIndex(1)}
                >
                  <div className="absolute inset-0 bg-indigo-500/20 opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <Search size={20} className="text-white drop-shadow-md" />
                  </div>
                  <img 
                    src={getImageUrl(selectedComponent.imageUrls[1])} 
                    alt={`Opcjonalny widok podzespołu komputera: ${selectedComponent.name}`} 
                    loading="lazy"
                    className="w-full h-40 sm:h-48 object-cover opacity-90 transition-transform duration-700 md:group-hover:scale-110 md:group-hover:opacity-100" 
                  />
                </div>
              )}
            </motion.div>
          )}

          <motion.p variants={itemVariants} className="text-[14.5px] text-slate-300/90 mb-8 leading-relaxed font-light">
            {selectedComponent.description}
          </motion.p>

          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Rola w architekturze
            </h3>
            <ul className="space-y-4">
              {selectedComponent.role.map((r, i) => (
                <li key={i} className="text-[14px] text-slate-300/95 flex items-start gap-3 bg-white/[0.01] md:hover:bg-white/[0.03] p-4 rounded-xl border border-white/[0.03] transition-all duration-300">
                  <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10 p-6 bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-transparent border border-indigo-500/20 rounded-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            <div className="flex items-center gap-2.5 mb-3">
              <Info size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Czy wiesz, że...?</h3>
            </div>
            <p className="text-[14px] text-slate-300/90 leading-relaxed font-light italic">
              "{selectedComponent.funFact}"
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <Activity size={14} />
              {selectedComponent.customStats ? "Kluczowe Parametry" : "Wpływ na wydajność"}
            </h3>
            
            {selectedComponent.customStats ? (
              selectedComponent.customStats.map((stat, i) => (
                <ProgressBar key={i} label={stat.label} value={stat.value} />
              ))
            ) : (
              <>
                <ProgressBar label="Gry Komputerowe" value={selectedComponent.perfImpact.gaming} />
                <ProgressBar label="Obliczenia AI" value={selectedComponent.perfImpact.ai} />
                <ProgressBar label="Codzienna Praca" value={selectedComponent.perfImpact.productivity} />
              </>
            )}
          </motion.div>
          <div className="sticky bottom-0 -mx-6 md:-mx-12 -mb-6 md:-mb-12 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {zoomedImageIndex !== null && selectedComponent && (
        <motion.div 
          role="dialog"
          aria-modal="true"
          aria-label="Powiększone zdjęcie podzespołu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12 touch-none"
        >
          {/* Close Area */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setZoomedImageIndex(null)}></div>
          
          {/* Prev Arrow */}
          <button 
            className="absolute left-4 md:left-12 z-50 p-3 bg-white/5 md:hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImageIndex((zoomedImageIndex - 1 + selectedComponent.imageUrls.length) % selectedComponent.imageUrls.length);
            }}
            aria-label="Poprzednie zdjęcie"
          >
            <ChevronLeft size={32} />
          </button>

          <AnimatePresence mode="wait">
            <motion.img 
              key={zoomedImageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={getImageUrl(selectedComponent.imageUrls[zoomedImageIndex])} 
              alt={`Powiększone zdjęcie podzespołu komputera: ${selectedComponent.name}`}
              loading="lazy"
              decoding="async"
              className="relative max-w-full max-h-full object-contain rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 z-40 pointer-events-none"
            />
          </AnimatePresence>

          {/* Next Arrow */}
          <button 
            className="absolute right-4 md:right-12 z-50 p-3 bg-white/5 md:hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImageIndex((zoomedImageIndex + 1) % selectedComponent.imageUrls.length);
            }}
            aria-label="Następne zdjęcie"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
            {selectedComponent.imageUrls.map((_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); setZoomedImageIndex(idx); }}
                aria-label={`Przejdź do zdjęcia ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === zoomedImageIndex ? 'bg-white scale-125' : 'bg-white/30 md:hover:bg-white/50'}`} 
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
