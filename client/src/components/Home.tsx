import { useState } from "react";
import { svgResize } from "blockly/core";
import { pythonGenerator } from "blockly/python";
import { useResizeObserver } from "@/hooks";
import { BlocklyProvider, useBlockly } from "@/lib/blockly";
import { PyodideProvider, usePyodide } from "@/lib/pyodide";
import { Button } from "@/components/ui/button";

export function Editor() {
  const { blocklyDivRef, workspace } = useBlockly();
  const { ref: containerRef } = useResizeObserver(() => {
    if (workspace) {
      svgResize(workspace);
    }
  });

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        id="blockly-div"
        ref={blocklyDivRef}
        style={{
          flexGrow: 1,
          minHeight: 0,
        }}
      />
    </div>
  );
}

function Home() {
  return (
    <PyodideProvider>
      <PyodideGate>
        <div className="w-full h-screen flex flex-col">
          <BlocklyProvider>
            <EditorToolbar />
            <div className="flex-1 min-h-0">
              <Editor />
            </div>
          </BlocklyProvider>
        </div>
      </PyodideGate>
    </PyodideProvider>
  );
}

export default Home;

function PyodideGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePyodide();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-sm font-medium text-slate-600">
          Pyodide を読み込み中...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function EditorToolbar() {
  const { workspace } = useBlockly();
  const { runner, isLoading } = usePyodide();
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    if (!workspace || !runner || isLoading) {
      return;
    }

    const pythonCode = pythonGenerator.workspaceToCode(workspace);
    setCode(pythonCode);
    setIsRunning(true);

    try {
      const result = await runner(pythonCode);
      setOutput(result === undefined ? "OK" : String(result));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="border-b border-slate-200 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button onClick={runCode} disabled={!workspace || isLoading || isRunning}>
          {isRunning ? "Running..." : "Run Python"}
        </Button>
        <span className="text-xs text-slate-500">
          {isLoading ? "Pyodide loading..." : "Ready"}
        </span>
      </div>
      {code && (
        <pre className="text-xs bg-slate-50 border border-slate-200 rounded-md p-2 overflow-auto">
          {code}
        </pre>
      )}
      {output && (
        <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-md p-2">
          {output}
        </div>
      )}
    </div>
  );
}
