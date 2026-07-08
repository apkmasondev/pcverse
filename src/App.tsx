import { Suspense, lazy } from 'react';
const Scene3D = lazy(() => import('./components/Scene3D/Scene3D').then(module => ({ default: module.Scene3D })));
const MatrixTerminal = lazy(() => import('./components/EasterEgg/MatrixTerminal').then(module => ({ default: module.MatrixTerminal })));
import { UI } from './components/UI/UI';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';

import { usePCView } from './hooks/usePC';

const FallbackLoader = () => (
  <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white">
    <div className="relative w-80 max-w-[80vw] flex flex-col items-center">
      <h1 className="text-4xl font-extrabold tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 animate-pulse">
        PCVERSE
      </h1>
      <p className="text-sm text-slate-300 tracking-widest uppercase mb-8">
        Ładowanie silnika WebGL...
      </p>
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-cyan-400 rounded-full animate-spin" />
      <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
    </div>
  </div>
);

function App() {
  const inMatrix = usePCView(state => state.inMatrix);

  return (
    <GlobalErrorBoundary>
      <main 
        className="relative w-full h-screen overflow-hidden bg-[#0f0a1c]"
        aria-label="Główny interfejs aplikacji PCVerse"
      >
        <h1 className="sr-only">PCVerse — Interaktywna Anatomia Komputera 3D</h1>
        <nav className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:bg-[#0f0a1c] focus-within:text-white focus-within:p-4 focus-within:rounded-br-xl">
          <a href="#ui-controls" className="block py-2 outline-none focus:ring-2 focus:ring-indigo-500">Przejdź do kontrolerów środowiska</a>
          <a href="#info-panel" className="block py-2 outline-none focus:ring-2 focus:ring-indigo-500">Przejdź do panelu informacji</a>
        </nav>

        {/* Ukrywamy całe UI i silnik 3D gdy jesteśmy w Matrixie. React nie odmontowuje drzewa by nie stracić zasobów WebGL, ale display: none pauzuje wycisza koszty */}
        <div style={{ display: inMatrix ? 'none' : 'block', width: '100%', height: '100%' }}>
          <Suspense fallback={<FallbackLoader />}>
            <Scene3D />
          </Suspense>
          <UI />
          <InfoPanel />
        </div>

        {inMatrix && (
          <Suspense fallback={<FallbackLoader />}>
            <MatrixTerminal />
          </Suspense>
        )}

        <LoadingScreen />
      </main>
    </GlobalErrorBoundary>
  );
}

export default App;
