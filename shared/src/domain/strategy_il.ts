export type Identifier = string;

export type Program = {
  kind: 'Program';
  statements: Statement[];
};

export type Statement = AssignmentStatement | WhenStatement;

export type AssignmentStatement = {
  kind: 'AssignmentStatement';
  target: Identifier;
  expression: Expression;
};

export type WhenStatement = {
  kind: 'WhenStatement';
  condition: Expression;
  actions: Action[];
};

export type Action = EntryAction | ExitAction;

export type EntryAction = {
  kind: 'EntryAction';
  side: Expression;
  size: Expression;
};

export type ExitAction = {
  kind: 'ExitAction';
  side: Expression;
  size: Expression;
};

export type Expression =
  | IdentifierExpression
  | LiteralExpression
  | EnumLiteralExpression
  | FunctionCallExpression
  | UnaryExpression
  | BinaryExpression;

export type IdentifierExpression = {
  kind: 'IdentifierExpression';
  name: Identifier;
};

export type LiteralExpression = {
  kind: 'LiteralExpression';
  value: number | string | boolean;
};

export type EnumLiteralExpression = {
  kind: 'EnumLiteralExpression';
  value: string;
};

export type FunctionCallExpression = {
  kind: 'FunctionCallExpression';
  callee: Identifier;
  args: Argument[];
};

export type UnaryExpression = {
  kind: 'UnaryExpression';
  operator: string;
  operand: Expression;
};

export type BinaryExpression = {
  kind: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
};

export type Argument = PositionalArgument | NamedArgument;

export type PositionalArgument = {
  kind: 'PositionalArgument';
  value: Expression;
};

export type NamedArgument = {
  kind: 'NamedArgument';
  name: Identifier;
  value: Expression;
};
