import { Suspense, lazy } from 'react';
const Scene3D = lazy(() => import('./components/Scene3D/Scene3D').then(module => ({ default: module.Scene3D })));
import { UI } from './components/UI/UI';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';

function App() {

  return (
    <GlobalErrorBoundary>
      <main 
        className="relative w-full h-screen overflow-hidden bg-[#0f0a1c]"
        role="region"
        aria-label="Główny interfejs aplikacji PCVerse"
      >
        <h1 className="sr-only">PCVerse — Interaktywna Anatomia Komputera 3D</h1>
        <nav className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:bg-[#0f0a1c] focus-within:text-white focus-within:p-4 focus-within:rounded-br-xl">
          <a href="#ui-controls" className="block py-2 outline-none focus:ring-2 focus:ring-indigo-500">Przejdź do kontrolerów środowiska</a>
          <a href="#info-panel" className="block py-2 outline-none focus:ring-2 focus:ring-indigo-500">Przejdź do panelu informacji</a>
        </nav>

        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
        <UI />
        <InfoPanel />
        <LoadingScreen />
      </main>
    </GlobalErrorBoundary>
  );
}

export default App;
