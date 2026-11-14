import { useState, useEffect } from 'react';

/**
 * Detects WebGL availability and device performance tier so 3D scenes
 * gracefully fall back on unsupported or headless environments.
 */
export function useWebGLSupport() {
  const [webglState, setWebglState] = useState({
    supported: false,
    checked: false,
    lowPower: false,
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        setWebglState({ supported: false, checked: true, lowPower: true });
        return;
      }

      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      const cores = navigator?.hardwareConcurrency || 4;
      const isMobileViewport = window.innerWidth < 768;
      const lowPower = cores <= 2 || isMobileViewport;

      setWebglState({
        supported: Boolean(gl),
        checked: true,
        lowPower,
      });
    } catch {
      setWebglState({ supported: false, checked: true, lowPower: true });
    }
  }, []);

  return webglState;
}

