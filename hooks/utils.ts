export function documentReadyPromise<T>(creator: () => Promise<T>): Promise<T> {
    return new Promise((resolve): void => {
      if (document.readyState === "complete") {
        resolve(creator());
      } else {
        window.addEventListener("load", () => resolve(creator()));
      }
    });
  }
  