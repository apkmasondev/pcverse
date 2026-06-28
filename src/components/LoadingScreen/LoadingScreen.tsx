import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useAppLoading } from '../../hooks/usePC';

export const LoadingScreen = () => {
  const { progress, active } = useProgress();
  const { isManualLoading } = useAppLoading();
  const [show, setShow] = useState(true);

useEffect(() => {
    if (active || isManualLoading) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress, isManualLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] backdrop-blur-3xl text-white"
        >
          <div className="relative w-80 max-w-[80vw] flex flex-col items-center">
            {/* Logo or Title */}
            <h1 className="text-4xl font-extrabold tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
              PCVERSE
            </h1>
            <p className="text-sm text-slate-300 tracking-widest uppercase mb-8">
              Inicjalizacja środowiska
            </p>

            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              {/* Progress Bar Fill */}
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="mt-4 flex justify-between w-full text-xs text-indigo-300 font-mono">
              <span>ŁADOWANIE ZASOBÓW</span>
              <span>{Math.round(progress)}%</span>
            </div>
            
            {/* Decorative Cyberpunk elements */}
            <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
