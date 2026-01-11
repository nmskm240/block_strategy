/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { loadPyodide, type PyodideInterface } from "pyodide";

const PYODIDE_VERSION = import.meta.env.VITE_PYODIDE_VERSION;
const PYODIDE_CDN = import.meta.env.VITE_PYODIDE_CDN_URL;
const PYODIDE_INDEX_URL = `${PYODIDE_CDN}/v${PYODIDE_VERSION}/full/`;
const INDEXED_PACKAGES = (import.meta.env.VITE_PYODIDE_INDEXED_PACKAGES ?? "")
  .split(",")
  .map((p: string) => p.trim())
  .filter(Boolean);
const PYPI_PACKAGES = (import.meta.env.VITE_PYODIDE_PYPI_PACKAGES ?? "")
  .split(",")
  .map((p: string) => p.trim())
  .filter(Boolean);

type ContextType = {
  runner: PythonRunner;
  isLoading: boolean;
};

type PyodideProviderProps = {
  children: React.ReactNode;
};

type PythonRunner = <T = any>(code: string) => Promise<T>;

const Context = createContext<ContextType | undefined>(undefined);

export function PyodideProvider({ children }: PyodideProviderProps) {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const runner: PythonRunner = async (code: string) => {
    if (!pyodideRef.current) {
      throw new Error("Pyodide is not loaded");
    }
    return pyodideRef.current.runPythonAsync(code);
  };

  useEffect(() => {
    let isActive = true;

    const setup = async () => {
      setIsLoading(true);
      try {
        const pyodide = await loadPyodide({
          indexURL: PYODIDE_INDEX_URL,
          lockFileURL: `${PYODIDE_INDEX_URL}pyodide-lock.json`,
          packageBaseUrl: PYODIDE_INDEX_URL,
          packages: INDEXED_PACKAGES,
        });
        if (!isActive) return;

        if (PYPI_PACKAGES.length) {
          const micropip = pyodide.pyimport("micropip");
          await micropip.install(PYPI_PACKAGES);
        }

        pyodideRef.current = pyodide;
      } catch (err) {
        if (!isActive) return;
        console.error(err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    setup();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Context.Provider value={{ runner, isLoading }}>
      {children}
    </Context.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePyodide = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("usePyodide must be used within PyodideProvider");
  return ctx;
};
