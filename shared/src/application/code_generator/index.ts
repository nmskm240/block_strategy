import type { CodeGenerator } from './code_generator_base';
import { BacktraderGenerator } from './backtrader/backtrader_generator';
import type { CodeGenTarget } from './types';

export type { CodeGenerator };

export function codeGeneratorForTarget(
  target: CodeGenTarget
): CodeGenerator | null {
  switch (target) {
    case 'backtrader':
      return new BacktraderGenerator();
    default:
      throw new Error(`Unsupported code generation target: ${target}`);
  }
}
