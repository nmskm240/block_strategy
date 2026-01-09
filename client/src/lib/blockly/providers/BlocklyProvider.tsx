/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react';

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as ja from 'blockly/msg/ja';

import {
  BlocklyWorkspaceAdditionalParams,
  WithAdditionalWorkspace,
} from '../types';
import mlToolbox from '../workspace/toolbox';

type Context = {
  workspace: Blockly.WorkspaceSvg | null;
  blocklyDivRef: React.RefObject<HTMLDivElement | null>;
};

const BlocklyContext = createContext<Context | null>(null);

type Props = {
  children: React.ReactNode;
  initialState?: { [key: string]: any };
  workspaceParams?: BlocklyWorkspaceAdditionalParams;
  toolbox?: Blockly.utils.toolbox.ToolboxDefinition;
};

export function BlocklyProvider({
  children,
  initialState,
  workspaceParams,
  toolbox = mlToolbox,
}: Props) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDivRef.current) {
      return;
    }

    Blockly.setLocale(ja as any);
    const ws = Blockly.inject(blocklyDivRef.current, {
      toolbox: toolbox,
      trashcan: false,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      zoom: {
        controls: true,
        wheel: false,
        startScale: 0.7,
        maxScale: 1.0,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    });

    if (initialState) {
      Blockly.serialization.workspaces.load(initialState, ws);
    }

    if (workspaceParams) {
      (ws as WithAdditionalWorkspace).data = workspaceParams;
    }

    ws.addChangeListener(Blockly.Events.disableOrphans);

    setWorkspace(ws);

    return () => {
      ws.dispose();
    };
  }, [initialState, workspaceParams, toolbox]);

  const value = useMemo<Context>(
    () => ({
      workspace,
      blocklyDivRef,
    }),
    [workspace],
  );

  return (
    <BlocklyContext.Provider value={value}>{children}</BlocklyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBlockly() {
  const context = useContext(BlocklyContext);
  if (!context) {
    throw new Error('useBlockly must be used within a BlocklyProvider');
  }
  return context;
}
