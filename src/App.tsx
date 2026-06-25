import { useEffect, useState, lazy, Suspense } from 'react';
const Scene3D = lazy(() => import('./components/Scene3D/Scene3D').then(module => ({ default: module.Scene3D })));
import { UI } from './components/UI/UI';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { PCProvider } from './hooks/usePC';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
};

function App() {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!webGLSupported) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#0f0a1c] text-white p-6 text-center">
        <div className="max-w-md bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Brak Obsługi WebGL</h1>
          <p className="text-slate-300">
            Twoja przeglądarka lub urządzenie nie obsługuje WebGL, który jest wymagany do uruchomienia aplikacji PCVerse.
            Spróbuj zaktualizować sterowniki karty graficznej lub użyć innej przeglądarki.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <PCProvider>
        <main className="relative w-full h-screen overflow-hidden bg-[#0f0a1c]">
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
      </PCProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
