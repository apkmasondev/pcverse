import { create } from 'zustand';

interface MobileStore {
  isMobile: boolean;
  setIsMobile: (val: boolean) => void;
}

const getIsMobile = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(max-width: 768px)').matches;
  }
  return false;
};

export const useMobileStore = create<MobileStore>((set) => ({
  isMobile: getIsMobile(),
  setIsMobile: (val) => set({ isMobile: val })
}));

if (typeof window !== 'undefined') {
  const mql = window.matchMedia('(max-width: 768px)');
  const onChange = (e: MediaQueryListEvent) => {
    useMobileStore.getState().setIsMobile(e.matches);
  };
  
  if (mql.addEventListener) {
    mql.addEventListener('change', onChange);
  } else {
    mql.addListener(onChange); // Fallback
  }
}

export const useIsMobile = () => {
  return useMobileStore((state) => state.isMobile);
};
