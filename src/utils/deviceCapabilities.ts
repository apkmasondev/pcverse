/**
 * Detekcja możliwości urządzenia wykonywana JEDNORAZOWO przed uruchomieniem
 * ciężkich efektów 3D. Wynik jest memoizowany na poziomie modułu — sonda WebGL
 * tworzy własny, tymczasowy kontekst, który natychmiast zwalnia
 * (`WEBGL_lose_context`), więc nie zabiera slotu kontekstu głównemu `<Canvas>`.
 */

export type WebGLSupport = 'webgl2' | 'webgl1' | 'none';
export type QualityTier = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  /** Trzy stany: pełne WebGL2, tylko WebGL1 (Three.js r163+ już go nie obsługuje), brak WebGL. */
  webgl: WebGLSupport;
  /** Nazwa renderera z WEBGL_debug_renderer_info (może być pusta — rozszerzenie bywa blokowane). */
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  hardwareConcurrency: number;
  /** navigator.deviceMemory w GiB — dostępne wyłącznie w silnikach Chromium. */
  deviceMemory: number | null;
  isSoftwareRenderer: boolean;
  isMobileGPU: boolean;
  isIntegratedGPU: boolean;
  /** Użytkownik prosi o oszczędzanie transferu (Save-Data). */
  saveData: boolean;
  /** Główny wskaźnik jest niedokładny (dotyk) — mocna przesłanka urządzenia mobilnego. */
  coarsePointer: boolean;
  tier: QualityTier;
  /** Powody, dla których przyznano dany tier — trafiają do diagnostyki w UI. */
  reasons: string[];
}

const SOFTWARE_RENDERER_PATTERN = /swiftshader|llvmpipe|softpipe|virgl|software|microsoft basic render/i;
const MOBILE_GPU_PATTERN = /adreno|mali|powervr|videocore|tegra|apple gpu/i;
const INTEGRATED_GPU_PATTERN = /intel|uhd graphics|hd graphics|iris|vega \d|radeon graphics/i;

/** Poniżej tej wartości renderowanie tekstur sceny zaczyna wymuszać downscaling. */
const MIN_TEXTURE_SIZE = 8192;

const readNavigatorNumber = (key: 'deviceMemory'): number | null => {
  if (typeof navigator === 'undefined') return null;
  const value = (navigator as Navigator & { deviceMemory?: number })[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const readSaveData = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
};

const readCoarsePointer = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};

interface ProbeResult {
  webgl: WebGLSupport;
  renderer: string;
  vendor: string;
  maxTextureSize: number;
}

const probeWebGL = (): ProbeResult => {
  const empty: ProbeResult = { webgl: 'none', renderer: '', vendor: '', maxTextureSize: 0 };
  if (typeof document === 'undefined') return empty;

  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    const gl = (gl2 ?? canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return empty;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? '')
      : String(gl.getParameter(gl.RENDERER) ?? '');
    const vendor = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? '')
      : String(gl.getParameter(gl.VENDOR) ?? '');

    const result: ProbeResult = {
      webgl: gl2 ? 'webgl2' : 'webgl1',
      renderer,
      vendor,
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? 0),
    };

    // Natychmiast zwalniamy kontekst sondy — przeglądarki limitują liczbę
    // jednoczesnych kontekstów WebGL (zwykle 8–16).
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return result;
  } catch {
    return empty;
  } finally {
    canvas?.remove();
  }
};

const resolveTier = (
  probe: ProbeResult,
  flags: {
    isSoftwareRenderer: boolean;
    isMobileGPU: boolean;
    isIntegratedGPU: boolean;
    hardwareConcurrency: number;
    deviceMemory: number | null;
    saveData: boolean;
    coarsePointer: boolean;
  },
): { tier: QualityTier; reasons: string[] } => {
  const reasons: string[] = [];

  if (probe.webgl === 'none') {
    return { tier: 'low', reasons: ['brak obsługi WebGL'] };
  }
  if (probe.webgl === 'webgl1') {
    return { tier: 'low', reasons: ['tylko WebGL 1 — brak wsparcia dla WebGL 2'] };
  }
  if (flags.isSoftwareRenderer) {
    return { tier: 'low', reasons: [`renderer programowy (${probe.renderer || 'nieznany'})`] };
  }
  if (probe.maxTextureSize > 0 && probe.maxTextureSize < MIN_TEXTURE_SIZE) {
    reasons.push(`MAX_TEXTURE_SIZE = ${probe.maxTextureSize}`);
  }
  if (flags.saveData) {
    reasons.push('tryb oszczędzania transferu (Save-Data)');
  }
  if (flags.deviceMemory !== null && flags.deviceMemory <= 4) {
    reasons.push(`deviceMemory = ${flags.deviceMemory} GB`);
  }
  if (flags.hardwareConcurrency > 0 && flags.hardwareConcurrency <= 4) {
    reasons.push(`hardwareConcurrency = ${flags.hardwareConcurrency}`);
  }
  if (flags.isMobileGPU) {
    reasons.push(`mobilne GPU (${probe.renderer || 'nieznane'})`);
  }

  if (reasons.length > 0) {
    return { tier: 'low', reasons };
  }

  // UWAGA: `deviceMemory` celowo nie bierze udziału w kwalifikacji do tieru
  // średniego. Specyfikacja kwantyzuje wynik i ucina go na 8 GB, więc warunek
  // „<= 8” byłby spełniony na praktycznie każdym desktopie.
  const mediumReasons: string[] = [];
  if (flags.hardwareConcurrency > 0 && flags.hardwareConcurrency <= 6) {
    mediumReasons.push(`hardwareConcurrency = ${flags.hardwareConcurrency}`);
  }
  if (flags.isIntegratedGPU) {
    mediumReasons.push(`zintegrowane GPU (${probe.renderer || 'nieznane'})`);
  }
  if (flags.coarsePointer) {
    mediumReasons.push('wskaźnik dotykowy');
  }

  if (mediumReasons.length > 0) {
    return { tier: 'medium', reasons: mediumReasons };
  }

  return { tier: 'high', reasons: ['brak przesłanek ograniczających'] };
};

let cached: DeviceCapabilities | null = null;

export const detectDeviceCapabilities = (): DeviceCapabilities => {
  if (cached) return cached;

  const probe = probeWebGL();
  const hardwareConcurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 0) : 0;
  const deviceMemory = readNavigatorNumber('deviceMemory');
  const isSoftwareRenderer = SOFTWARE_RENDERER_PATTERN.test(probe.renderer);
  const isMobileGPU = MOBILE_GPU_PATTERN.test(probe.renderer);
  const isIntegratedGPU = !isMobileGPU && INTEGRATED_GPU_PATTERN.test(probe.renderer);
  const saveData = readSaveData();
  const coarsePointer = readCoarsePointer();

  const { tier, reasons } = resolveTier(probe, {
    isSoftwareRenderer,
    isMobileGPU,
    isIntegratedGPU,
    hardwareConcurrency,
    deviceMemory,
    saveData,
    coarsePointer,
  });

  cached = {
    webgl: probe.webgl,
    renderer: probe.renderer,
    vendor: probe.vendor,
    maxTextureSize: probe.maxTextureSize,
    hardwareConcurrency,
    deviceMemory,
    isSoftwareRenderer,
    isMobileGPU,
    isIntegratedGPU,
    saveData,
    coarsePointer,
    tier,
    reasons,
  };

  return cached;
};

/** Wyłącznie na potrzeby testów — czyści memoizację sondy. */
export const resetDeviceCapabilitiesCache = () => {
  cached = null;
};
