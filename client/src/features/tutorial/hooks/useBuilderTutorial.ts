import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "builder-tutorial-seen-v2";

export function useTutorial() {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, "1");
    setIsRunning(true);
  }, []);

  return {
    isRunning,
    start: useCallback(() => setIsRunning(true), []),
    stop: useCallback(() => setIsRunning(false), []),
  };
}
