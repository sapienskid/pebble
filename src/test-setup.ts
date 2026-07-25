import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && typeof window.indexedDB === 'undefined') {
  Object.defineProperty(window, 'indexedDB', { value: {}, writable: true });
}
