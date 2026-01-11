import type {
  Action,
  AssignmentStatement,
  EntryAction,
  ExitAction,
  Expression,
  FunctionCallExpression,
  Program,
  Statement,
} from '../domain/strategy_il';

export type BacktraderGenerationOptions = {
  className?: string;
};

export const generateBacktraderStrategy = (
  program: Program,
  options: BacktraderGenerationOptions = {}
): string => {
  const className = options.className ?? 'GeneratedStrategy';
  const initLines: string[] = [];
  const nextLines: string[] = [];

  for (const statement of program.statements) {
    if (statement.kind === 'AssignmentStatement') {
      initLines.push(renderAssignment(statement));
      continue;
    }
    if (statement.kind === 'WhenStatement') {
      nextLines.push(...renderWhen(statement));
    }
  }

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
};

const renderAssignment = (statement: AssignmentStatement): string => {
  const target = statement.target;
  const expr = renderExpression(statement.expression);
  return `self.${target} = ${expr}`;
};

const renderWhen = (
  statement: Extract<Statement, { kind: 'WhenStatement' }>
): string[] => {
  const condition = renderExpression(statement.condition);
  const lines = [`if ${condition}:`];
  const actionLines = statement.actions.flatMap((action) =>
    renderAction(action).map((line) => `    ${line}`)
  );
  return lines.concat(actionLines.length > 0 ? actionLines : ['    pass']);
};

const renderAction = (action: Action): string[] => {
  if (action.kind === 'EntryAction') {
    return renderEntry(action);
  }
  return renderExit(action);
};

const renderEntry = (action: EntryAction): string[] => {
  const sideExpr = renderExpression(action.side);
  const sizeExpr = renderExpression(action.size);
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
};

const renderExit = (action: ExitAction): string[] => {
  const sideExpr = renderExpression(action.side);
  const sizeExpr = renderExpression(action.size);
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
};

const renderExpression = (expr: Expression): string => {
  switch (expr.kind) {
    case 'IdentifierExpression':
      if (expr.name === '__missing__') {
        return 'None';
      }
      return mapIdentifier(expr.name);
    case 'EnumLiteralExpression':
      return JSON.stringify(expr.value);
    case 'LiteralExpression':
      if (typeof expr.value === 'string') {
        return JSON.stringify(expr.value);
      }
      if (typeof expr.value === 'boolean') {
        return expr.value ? 'True' : 'False';
      }
      return String(expr.value);
    case 'FunctionCallExpression':
      return renderFunctionCall(expr);
    case 'UnaryExpression': {
      const operator = mapOperator(expr.operator);
      return `(${operator} ${renderExpression(expr.operand)})`;
    }
    case 'BinaryExpression': {
      const operator = mapOperator(expr.operator);
      return `(${renderExpression(expr.left)} ${operator} ${renderExpression(
        expr.right
      )})`;
    }
    default: {
      const _exhaustive: never = expr;
      return _exhaustive;
    }
  }
};

const renderFunctionCall = (expr: FunctionCallExpression): string => {
  const callee = expr.callee;
  const args = expr.args.map((arg) => {
    if (arg.kind === 'NamedArgument') {
      return `${arg.name}=${renderExpression(arg.value)}`;
    }
    return renderExpression(arg.value);
  });

  const lower = callee.toLowerCase();
  if (lower === 'sma') {
    return `bt.ind.SMA(${args.join(', ')})`;
  }
  if (lower === 'ema') {
    return `bt.ind.EMA(${args.join(', ')})`;
  }
  if (lower === 'rsi') {
    return `bt.ind.RSI(${args.join(', ')})`;
  }
  if (lower === 'cross_over') {
    return `(bt.ind.CrossOver(${args.join(', ')}) > 0)`;
  }
  if (lower === 'cross_under') {
    return `(bt.ind.CrossOver(${args.join(', ')}) < 0)`;
  }
  if (lower === 'fixed') {
    return args[0] ?? 'None';
  }

  return `${callee}(${args.join(', ')})`;
};

const mapIdentifier = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower === 'close') return 'self.data.close';
  if (lower === 'open') return 'self.data.open';
  if (lower === 'high') return 'self.data.high';
  if (lower === 'low') return 'self.data.low';
  if (lower === 'volume') return 'self.data.volume';
  return `self.${name}`;
};

const mapOperator = (operator: string): string => {
  const upper = operator.toUpperCase();
  if (upper === 'AND') return 'and';
  if (upper === 'OR') return 'or';
  if (upper === 'NOT') return 'not';
  return operator;
};
