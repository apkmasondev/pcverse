export const detectLowEndGPU = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true; // Assume low-end if WebGL is entirely missing or blocked
    
    // Check if it is a WebGLRenderingContext
    if ('getExtension' in gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      // Heuristics for integrated graphics and mobile GPUs
      const isIntegrated = /Intel|Radeon\(TM\)|HD Graphics|UHD Graphics|Iris|Vega/i.test(renderer);
      const isMobile = /Apple|Adreno|Mali|PowerVR/i.test(renderer);
      
      return isIntegrated || isMobile;
    }
    
    return false;
  } catch (e) {
    console.warn('Failed to detect GPU tier, defaulting to low-end', e);
    return true; // Safe fallback
  }
};
