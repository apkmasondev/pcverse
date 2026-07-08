import React, { useEffect, useRef, useState } from 'react';
import { usePCView } from '../../hooks/usePC';

// The PC words to occasionally drop
const PC_WORDS = ['[RTX_5090]', '[RYZEN_9]', '[NVME_GEN5]', '[DDR5_8000]', '0x000000FF', 'ERR_SYSTEM', 'OVERCLOCK', 'KERNEL_PANIC', 'BIOS_FLASH'];

export const MatrixTerminal = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inputVal, setInputVal] = useState('');
  const [isWakingUp, setWakingUp] = useState(false);
  const [isError, setIsError] = useState(false);
  const errorRef = useRef(false);
  
  const exitMatrix = usePCView(state => state.exitMatrix);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 18;
    const columns = Math.floor(width / fontSize);
    
    // Arrays to track drops
    const drops: number[] = [];
    const characters: string[][] = [];
    
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
      characters[x] = [];
    }

    const aberrationColor1 = 'rgba(239, 68, 68, 0.4)'; // Red
    const aberrationColor2 = 'rgba(6, 182, 212, 0.4)'; // Cyan

    let frameCount = 0;

    const draw = () => {
      // RESET SHADOW BEFORE DRAWING BACKGROUND (Fixes green glow accumulation bug)
      ctx.shadowBlur = 0;

      // Fade out background with a deep black tint
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
      
      const isErr = errorRef.current;
      const primaryColor = isErr ? '#ef4444' : '#0f0'; // Red if error, else green
      
      for (let i = 0; i < drops.length; i++) {
        // Occasionally spawn a PC component name
        if (drops[i] === 1 && Math.random() < 0.02) {
          const word = PC_WORDS[Math.floor(Math.random() * PC_WORDS.length)];
          for(let w = 0; w < word.length; w++) {
             characters[i][drops[i] + w] = word[w];
          }
        }

        // Get character, either from pre-filled word or random
        let text = characters[i][drops[i]];
        if (!text) {
           text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
           characters[i][drops[i]] = text;
        }
        
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Draw Chromatic Aberration offset (Epic feel)
        ctx.shadowBlur = 0;
        ctx.fillStyle = aberrationColor1;
        ctx.fillText(text, x - 2, y);
        ctx.fillStyle = aberrationColor2;
        ctx.fillText(text, x + 2, y);
        
        // Draw the main leading bright character
        ctx.fillStyle = isErr ? '#fee2e2' : '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = primaryColor;
        ctx.fillText(text, x, y);

        // Draw the trailing character slightly above it
        if (drops[i] > 1) {
            const prevText = characters[i][drops[i]-1];
            ctx.fillStyle = primaryColor;
            ctx.shadowBlur = 5;
            ctx.fillText(prevText, x, y - fontSize);
        }

        // Reset drop
        if (y > height && Math.random() > 0.95) {
          drops[i] = 0;
          characters[i] = []; // Clear word queue
        }
        
        // Accelerate everything if waking up or error
        if (isWakingUp || isErr) {
            drops[i] += 2;
        } else {
            drops[i]++;
        }
      }
      
      frameCount++;
      // Clean up old memory in arrays
      if (frameCount % 100 === 0) {
          for(let i=0; i<columns; i++) {
             if (characters[i].length > height / fontSize + 10) {
                 characters[i] = [];
             }
          }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isWakingUp]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputVal.toLowerCase().trim();
      if (!cmd) return;
      
      if (cmd === 'wake up' || cmd === 'exit' || cmd === 'overclock' || cmd === 'sudo rm -rf /matrix') {
        setWakingUp(true);
        // The screen will flash white via CSS transitions
        setTimeout(() => {
          exitMatrix();
        }, 1200);
      } else {
        // TRIGGER ACCESS DENIED EFFECT
        setIsError(true);
        errorRef.current = true;
        setInputVal('');
        
        setTimeout(() => {
          setIsError(false);
          errorRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#05020a] flex items-center justify-center transition-all duration-1000 ${
        isWakingUp ? 'scale-110 opacity-0 blur-3xl brightness-[500]' : 'opacity-100'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* Terminal Overlay */}
      <div 
        className={`relative z-10 w-[600px] max-w-[90vw] p-8 rounded-xl backdrop-blur-md border shadow-[0_0_50px_rgba(0,0,0,0.5)] font-mono text-lg transition-all duration-100 ${
          isError 
            ? 'bg-red-900/40 border-red-500 text-red-400 scale-[1.02] -translate-x-1 translate-y-1' 
            : 'bg-black/40 border-cyan-500/30 text-cyan-400 scale-100'
        } ${isWakingUp ? 'scale-150 opacity-0' : ''}`}
        onClick={() => document.getElementById('matrix-input')?.focus()}
      >
        <div className={`mb-4 opacity-80 uppercase tracking-widest ${isError ? 'animate-pulse font-bold text-red-500' : 'text-sm animate-pulse'}`}>
          {isError ? 'ACCESS DENIED. UNKNOWN DIRECTIVE.' : 'PCVerse Matrix Subsystem v1.0.0. Awaiting extraction code...'}
        </div>
        <div className="flex items-center">
          <span className={`mr-2 font-bold ${isError ? 'text-red-600' : 'text-pink-500'}`}>root@pcverse:~#</span>
          <input 
            id="matrix-input"
            autoFocus
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleCommand}
            disabled={isError || isWakingUp}
            className={`bg-transparent border-none outline-none flex-1 placeholder-cyan-900 ${isError ? 'text-red-200 caret-red-500' : 'text-cyan-200 caret-cyan-400'}`}
            spellCheck={false}
            autoComplete="off"
            placeholder={isError ? '' : '_'}
          />
        </div>
      </div>
    </div>
  );
};
