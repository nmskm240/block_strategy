import { match } from 'ts-pattern';
import type {
  EntryAction,
  ExitAction,
  FunctionCallExpression,
} from '@shared/domain/strategy_il';
import {
  CodeGenerator,
  type CodeGeneratorOptions,
} from '@shared/application/code_generator/code_generator_base';
import {
  BACKTRADER_INDICATOR_ALIASES,
  BACKTRADER_INDICATOR_PARAMS,
} from './backtrader_indicator_params';

export type BacktraderGenerationOptions = CodeGeneratorOptions & {};

export class BacktraderGenerator extends CodeGenerator<BacktraderGenerationOptions> {
  public readonly target = 'backtrader';

  protected renderProgram(
    initLines: string[],
    nextLines: string[],
    options: BacktraderGenerationOptions = {}
  ): string {
    const className = options.name ?? 'GeneratedStrategy';
    const lines = [
      'import backtrader as bt',
      '',
      `class ${className}(bt.Strategy):`,
      '    def __init__(self):',
      ...(initLines.length > 0
        ? initLines.map((line) => `        ${line}`)
        : ['        pass']),
      '',
      '    def next(self):',
      ...(nextLines.length > 0
        ? nextLines.map((line) => `        ${line}`)
        : ['        pass']),
      '',
    ];

    return lines.join('\n');
  }

  protected assignmentPrefix(): string {
    return 'self.';
  }

  protected renderEntry(action: EntryAction): string[] {
    const sideExpr = this.renderExpression(action.side);
    const sizeExpr = this.renderExpression(action.size);
    const sizeArg = sizeExpr === 'None' ? '' : `size=${sizeExpr}`;

    if (action.side.kind === 'EnumLiteralExpression') {
      const side = action.side.value.toUpperCase();
      if (side === 'LONG') {
        return [`self.buy(${sizeArg})`.replace(/\(\)/, '()')];
      }
      if (side === 'SHORT') {
        return [`self.sell(${sizeArg})`.replace(/\(\)/, '()')];
      }
    }

    return [
      `if ${sideExpr} == "LONG":`,
      `    self.buy(${sizeArg})`.replace(/\(\)/, '()'),
      `elif ${sideExpr} == "SHORT":`,
      `    self.sell(${sizeArg})`.replace(/\(\)/, '()'),
    ];
  }

  protected renderExit(action: ExitAction): string[] {
    const sideExpr = this.renderExpression(action.side);
    const sizeExpr = this.renderExpression(action.size);
    const sizeArg = sizeExpr === 'None' ? '' : `size=${sizeExpr}`;

    if (action.side.kind === 'EnumLiteralExpression') {
      const side = action.side.value.toUpperCase();
      if (side === 'LONG') {
        return [
          'if self.position.size > 0:',
          `    self.close(${sizeArg})`.replace(/\(\)/, '()'),
        ];
      }
      if (side === 'SHORT') {
        return [
          'if self.position.size < 0:',
          `    self.close(${sizeArg})`.replace(/\(\)/, '()'),
        ];
      }
    }

    return [
      `if ${sideExpr} == "LONG":`,
      `    if self.position.size > 0:`,
      `        self.close(${sizeArg})`.replace(/\(\)/, '()'),
      `elif ${sideExpr} == "SHORT":`,
      `    if self.position.size < 0:`,
      `        self.close(${sizeArg})`.replace(/\(\)/, '()'),
    ];
  }

  protected mapIdentifier(name: string): string {
    const lower = name.toLowerCase();
    if (lower === 'close') return 'self.data.close';
    if (lower === 'open') return 'self.data.open';
    if (lower === 'high') return 'self.data.high';
    if (lower === 'low') return 'self.data.low';
    if (lower === 'volume') return 'self.data.volume';
    return `self.${name}`;
  }

  protected mapOperator(operator: string): string {
    const upper = operator.toUpperCase();
    if (upper === 'AND') return 'and';
    if (upper === 'OR') return 'or';
    if (upper === 'NOT') return 'not';
    return operator;
  }

  protected renderFunctionCall(expr: FunctionCallExpression): string {
    const callee = expr.callee;
    const lower = callee.toLowerCase();
    const canonical =
      BACKTRADER_INDICATOR_ALIASES[lower] ??
      BACKTRADER_INDICATOR_ALIASES[expr.callee] ??
      expr.callee;
    return match(lower)
      .with('fixed', () => {
        const args = this.renderArgs(expr);
        return args[0] ?? 'None';
      })
      .otherwise(() => {
        const args = this.renderArgs(expr);
        return `bt.ind.${canonical}(${args.join(', ')})`;
      });
  }

  private renderArgs(expr: FunctionCallExpression): string[] {
    const lower = expr.callee.toLowerCase();
    const canonical =
      BACKTRADER_INDICATOR_ALIASES[lower] ??
      BACKTRADER_INDICATOR_ALIASES[expr.callee] ??
      expr.callee;
    const paramOrder = BACKTRADER_INDICATOR_PARAMS[canonical] ?? [];

    const namedArgs = new Map(
      expr.args
        .filter((arg) => arg.kind === 'NamedArgument')
        .map((arg) => [arg.name.toLowerCase(), arg])
    );
    const positionalArgs = expr.args.filter(
      (arg) => arg.kind === 'PositionalArgument'
    );

    if (paramOrder.length === 0 || namedArgs.size === 0) {
      return expr.args.map((arg) => this.renderArg(arg));
    }

    const ordered: string[] = [];
    for (const arg of positionalArgs) {
      ordered.push(this.renderArg(arg));
    }

    const used = new Set<string>();
    for (const name of paramOrder) {
      const key = name.toLowerCase();
      const arg = namedArgs.get(key);
      if (!arg) continue;
      ordered.push(this.renderArg(arg));
      used.add(key);
    }

    for (const arg of expr.args) {
      if (arg.kind !== 'NamedArgument') continue;
      const key = arg.name.toLowerCase();
      if (!used.has(key)) {
        ordered.push(this.renderArg(arg));
        used.add(key);
      }
    }

    return ordered;
  }

  private renderArg(arg: FunctionCallExpression['args'][number]): string {
    if (arg.kind === 'NamedArgument') {
      return `${arg.name}=${this.renderExpression(arg.value)}`;
    }
    return this.renderExpression(arg.value);
  }

  protected booleanLiteral(value: boolean): string {
    return value ? 'True' : 'False';
  }

  protected missingLiteral(): string {
    return 'None';
  }
}
