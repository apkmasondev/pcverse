import { useEffect, useState } from 'react';
import { Scene3D } from './components/Scene3D/Scene3D';
import { UI } from './components/UI/UI';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { PCProvider } from './hooks/usePC';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
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
      <div className="flex items-center justify-center h-screen w-screen bg-[#0a0a0f] text-white p-6 text-center">
        <div className="max-w-md bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">WebGL Not Supported</h1>
          <p className="text-slate-300">
            Your browser or device does not support WebGL, which is required to view the 3D PCVerse experience.
            Please try using a different browser or updating your graphics drivers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary fallback={<div className="text-white">Critical App Failure</div>}>
      <PCProvider>
        <main className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]">
          <h1 className="sr-only">PCVerse — Interaktywna Anatomia Komputera 3D</h1>
          <Scene3D />
          <UI />
          <InfoPanel />
          <LoadingScreen />
        </main>
      </PCProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
