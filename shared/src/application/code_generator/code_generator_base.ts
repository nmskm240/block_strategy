import { match } from 'ts-pattern';
import type {
  Action,
  AssignmentStatement,
  EntryAction,
  ExitAction,
  Expression,
  FunctionCallExpression,
  Program,
  Statement,
} from '@shared/domain/strategy_il';
import type { CodeGenTarget } from './types';

export type CodeGeneratorOptions = {
  name?: string;
};

export abstract class CodeGenerator<Options = CodeGeneratorOptions> {
  public abstract readonly target: CodeGenTarget;

  public generate(program: Program, options?: Options): string {
    const initLines: string[] = [];
    const nextLines: string[] = [];

    for (const statement of program.statements) {
      if (statement.kind === 'AssignmentStatement') {
        initLines.push(this.renderAssignment(statement));
        continue;
      }
      if (statement.kind === 'WhenStatement') {
        nextLines.push(...this.renderWhen(statement));
      }
    }

    return this.renderProgram(initLines, nextLines, options);
  }

  protected abstract renderProgram(
    initLines: string[],
    nextLines: string[],
    options?: Options
  ): string;

  protected renderAssignment(statement: AssignmentStatement): string {
    const target = statement.target;
    const expr = this.renderExpression(statement.expression);
    return `${this.assignmentPrefix()}${target} = ${expr}`;
  }

  protected assignmentPrefix(): string {
    return '';
  }

  protected renderWhen(
    statement: Extract<Statement, { kind: 'WhenStatement' }>
  ): string[] {
    const condition = this.renderExpression(statement.condition);
    const lines = [`if ${condition}:`];
    const actionLines = statement.actions.flatMap((action) =>
      this.renderAction(action).map((line) => `    ${line}`)
    );
    return lines.concat(actionLines.length > 0 ? actionLines : ['    pass']);
  }

  protected renderAction(action: Action): string[] {
    if (action.kind === 'EntryAction') {
      return this.renderEntry(action);
    }
    return this.renderExit(action);
  }

  protected abstract renderEntry(action: EntryAction): string[];
  protected abstract renderExit(action: ExitAction): string[];

  protected renderExpression(expr: Expression): string {
    return match(expr)
      .with({ kind: 'IdentifierExpression' }, (node) =>
        node.name === '__missing__'
          ? this.missingLiteral()
          : this.mapIdentifier(node.name)
      )
      .with({ kind: 'EnumLiteralExpression' }, (node) =>
        this.renderEnumLiteral(node.value)
      )
      .with({ kind: 'LiteralExpression' }, (node) =>
        this.renderLiteral(node.value)
      )
      .with({ kind: 'FunctionCallExpression' }, (node) =>
        this.renderFunctionCall(node)
      )
      .with({ kind: 'UnaryExpression' }, (node) => {
        const operator = this.mapOperator(node.operator);
        return `(${operator} ${this.renderExpression(node.operand)})`;
      })
      .with({ kind: 'BinaryExpression' }, (node) => {
        const operator = this.mapOperator(node.operator);
        return `(${this.renderExpression(node.left)} ${operator} ${this.renderExpression(
          node.right
        )})`;
      })
      .exhaustive();
  }

  protected renderLiteral(value: number | string | boolean): string {
    if (typeof value === 'string') {
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') {
      return value ? this.booleanLiteral(true) : this.booleanLiteral(false);
    }
    return String(value);
  }

  protected renderEnumLiteral(value: string): string {
    return JSON.stringify(value);
  }

  protected booleanLiteral(value: boolean): string {
    return value ? 'true' : 'false';
  }

  protected missingLiteral(): string {
    return 'null';
  }

  protected abstract mapIdentifier(name: string): string;
  protected abstract mapOperator(operator: string): string;
  protected abstract renderFunctionCall(expr: FunctionCallExpression): string;
}
