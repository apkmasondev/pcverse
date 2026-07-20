declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext!)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playHoverSound = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch (e) { console.warn('Audio warning:', e); }
};

export const playSelectSound = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch (e) { console.warn('Audio warning:', e); }
};

export const playExplodeSound = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Sci-fi deep bass sweep
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch (e) { console.warn('Audio warning:', e); }
};

let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let whineOsc: OscillatorNode | null = null;

export const playAmbientSound = () => {
  try {
    const ctx = getContext();
    if (ambientOsc) return;
    
    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();
    whineOsc = ctx.createOscillator();
    
    ambientOsc.type = 'sine';
    // Server room deep hum
    ambientOsc.frequency.setValueAtTime(50, ctx.currentTime);
    
    // Create a second oscillator for a bit of fan whine
    whineOsc.type = 'triangle';
    whineOsc.frequency.setValueAtTime(250, ctx.currentTime);
    
    ambientOsc.connect(ambientGain);
    whineOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2); // slow fade in
    
    ambientOsc.start(ctx.currentTime);
    whineOsc.start(ctx.currentTime);
  } catch (e) { console.warn('Audio warning:', e); }
};

export const stopAmbientSound = () => {
  try {
    if (ambientGain && ambientOsc) {
      const ctx = getContext();
      ambientGain.gain.cancelScheduledValues(ctx.currentTime);
      ambientGain.gain.setValueAtTime(0, ctx.currentTime);
      
      ambientOsc.stop();
      ambientOsc.disconnect();
      if (whineOsc) {
        whineOsc.stop();
        whineOsc.disconnect();
        whineOsc = null;
      }
      
      ambientGain.disconnect();
      ambientOsc = null;
      ambientGain = null;
    }
  } catch (e) { console.warn('Audio warning:', e); }
};
