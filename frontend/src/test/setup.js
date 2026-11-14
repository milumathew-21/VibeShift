import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 5000 });

// Polyfill ResizeObserver and IntersectionObserver for Recharts, Framer Motion, and Three.js in jsdom
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      if (typeof this.callback === 'function') {
        this.callback([{ isIntersecting: true, target }], this);
      }
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
if (typeof globalThis !== 'undefined' && !globalThis.IntersectionObserver && typeof window !== 'undefined') {
  globalThis.IntersectionObserver = window.IntersectionObserver;
}

// Prevent jsdom not-implemented stderr noise when checking WebGL support on <canvas>
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}

// Polyfill matchMedia for useReducedMotion in jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Polyfill URL.createObjectURL & revokeObjectURL for Blob tests
if (typeof URL !== 'undefined') {
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock-url';
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = () => {};
  }
}
