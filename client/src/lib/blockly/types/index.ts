import * as Blockly from 'blockly/core';

export type BlocklyWorkspaceAdditionalParams = {
  fileNames: () => string[];
};

export type WithAdditionalWorkspace = Blockly.WorkspaceSvg & {
  data: BlocklyWorkspaceAdditionalParams;
};
