// utils/document-ready.ts
export function documentReadyPromise(): Promise<boolean> {
  // Check if window exists (to handle SSR)
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Document is already ready
      resolve(true);
    } else {
      // Wait for document to be ready
      document.addEventListener('DOMContentLoaded', () => {
        resolve(true);
      });
    }
  });
}
