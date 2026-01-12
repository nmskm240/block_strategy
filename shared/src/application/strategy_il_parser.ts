import {
  EmbeddedActionsParser,
  Lexer,
  type TokenType,
  createToken,
  EOF,
} from 'chevrotain';
import type {
  Action,
  Argument,
  AssignmentStatement,
  BinaryExpression,
  EntryAction,
  ExitAction,
  EnumLiteralExpression,
  Expression,
  FunctionCallExpression,
  IdentifierExpression,
  LiteralExpression,
  NamedArgument,
  PositionalArgument,
  Program,
  Statement,
  UnaryExpression,
  WhenStatement,
} from '../domain/strategy_il';

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t\n\r]+/,
  group: Lexer.SKIPPED,
});

const LineComment = createToken({
  name: 'LineComment',
  pattern: /\/\/[^\n]*/,
  group: Lexer.SKIPPED,
});

const When = createToken({ name: 'When', pattern: /WHEN/i });
const Do = createToken({ name: 'Do', pattern: /DO/i });
const Entry = createToken({ name: 'Entry', pattern: /ENTRY/i });
const Exit = createToken({ name: 'Exit', pattern: /EXIT/i });
const True = createToken({ name: 'True', pattern: /TRUE/i });
const False = createToken({ name: 'False', pattern: /FALSE/i });
const And = createToken({ name: 'And', pattern: /AND/i });
const Or = createToken({ name: 'Or', pattern: /OR/i });
const Not = createToken({ name: 'Not', pattern: /NOT/i });

const GreaterEqual = createToken({ name: 'GreaterEqual', pattern: />=/ });
const LessEqual = createToken({ name: 'LessEqual', pattern: /<=/ });
const EqualEqual = createToken({ name: 'EqualEqual', pattern: /==/ });
const NotEqual = createToken({ name: 'NotEqual', pattern: /!=/ });
const Greater = createToken({ name: 'Greater', pattern: />/ });
const Less = createToken({ name: 'Less', pattern: /</ });

const LParen = createToken({ name: 'LParen', pattern: /\(/ });
const RParen = createToken({ name: 'RParen', pattern: /\)/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ });

const Plus = createToken({ name: 'Plus', pattern: /\+/ });
const Minus = createToken({ name: 'Minus', pattern: /-/ });
const Star = createToken({ name: 'Star', pattern: /\*/ });
const Slash = createToken({ name: 'Slash', pattern: /\// });

const Equal = createToken({ name: 'Equal', pattern: /=/ });

const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /[0-9]+(\.[0-9]+)?/,
});
const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"([^"\\]|\\.)*"/,
});

const Identifier = createToken({
  name: 'Identifier',
  pattern: /[A-Za-z_][A-Za-z0-9_]*/,
});

const allTokens: TokenType[] = [
  WhiteSpace,
  LineComment,
  When,
  Do,
  Entry,
  Exit,
  True,
  False,
  And,
  Or,
  Not,
  GreaterEqual,
  LessEqual,
  EqualEqual,
  NotEqual,
  Greater,
  Less,
  LParen,
  RParen,
  Comma,
  SemiColon,
  Plus,
  Minus,
  Star,
  Slash,
  Equal,
  NumberLiteral,
  StringLiteral,
  Identifier,
];

const StrategyILLexer = new Lexer(allTokens);

class StrategyILParser extends EmbeddedActionsParser {
  public constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  public program = this.RULE('program', (): Program => {
    const statements: Statement[] = [];
    this.MANY(() => {
      statements.push(this.SUBRULE(this.statement));
    });
    this.CONSUME(EOF);
    return {
      kind: 'Program',
      statements,
    } satisfies Program;
  });

  private statement = this.RULE(
    'statement',
    (): Statement =>
      this.OR([
        { ALT: () => this.SUBRULE(this.assignmentStatement) },
        { ALT: () => this.SUBRULE(this.whenStatement) },
      ])
  );

  private assignmentStatement = this.RULE(
    'assignmentStatement',
    (): AssignmentStatement => {
      const targetToken = this.CONSUME(Identifier);
      let target = '';
      this.ACTION(() => {
        target = targetToken.image;
      });
      this.CONSUME(Equal);
      const expression = this.SUBRULE(this.expression);
      this.OPTION(() => {
        this.CONSUME(SemiColon);
      });
      return {
        kind: 'AssignmentStatement',
        target,
        expression,
      } satisfies AssignmentStatement;
    }
  );

  private whenStatement = this.RULE('whenStatement', (): WhenStatement => {
    this.CONSUME(When);
    const condition = this.SUBRULE(this.expression);
    this.CONSUME(Do);
    const actions = this.SUBRULE(this.actionList);
    this.OPTION(() => {
      this.CONSUME(SemiColon);
    });
    return {
      kind: 'WhenStatement',
      condition,
      actions,
    } satisfies WhenStatement;
  });

  private actionList = this.RULE('actionList', (): Action[] => {
    const actions: Action[] = [];
    actions.push(this.SUBRULE(this.action));
    this.MANY(() => {
      this.CONSUME(Comma);
      actions.push(this.SUBRULE2(this.action));
    });
    return actions;
  });

  private action = this.RULE(
    'action',
    (): Action =>
      this.OR([
        { ALT: () => this.SUBRULE(this.entryAction) },
        { ALT: () => this.SUBRULE(this.exitAction) },
      ])
  );

  private entryAction = this.RULE('entryAction', (): EntryAction => {
    this.CONSUME(Entry);
    this.CONSUME(LParen);
    const args = this.OPTION(() => this.SUBRULE(this.argumentList)) || [];
    this.CONSUME(RParen);
    const safeArgs = Array.isArray(args) ? args : [];
    const sideArg = safeArgs.find(
      (arg) => arg.kind === 'NamedArgument' && arg.name.toLowerCase() === 'side'
    ) as NamedArgument | undefined;
    const sizeArg = safeArgs.find(
      (arg) => arg.kind === 'NamedArgument' && arg.name.toLowerCase() === 'size'
    ) as NamedArgument | undefined;
    return {
      kind: 'EntryAction',
      side: sideArg?.value ?? this.createMissingIdentifier(),
      size: sizeArg?.value ?? this.createMissingIdentifier(),
    } satisfies EntryAction;
  });

  private exitAction = this.RULE('exitAction', (): ExitAction => {
    this.CONSUME(Exit);
    this.CONSUME(LParen);
    const args = this.OPTION(() => this.SUBRULE(this.argumentList)) || [];
    this.CONSUME(RParen);
    const safeArgs = Array.isArray(args) ? args : [];
    const sideArg = safeArgs.find(
      (arg) => arg.kind === 'NamedArgument' && arg.name.toLowerCase() === 'side'
    ) as NamedArgument | undefined;
    const sizeArg = safeArgs.find(
      (arg) => arg.kind === 'NamedArgument' && arg.name.toLowerCase() === 'size'
    ) as NamedArgument | undefined;
    return {
      kind: 'ExitAction',
      side: sideArg?.value ?? this.createMissingIdentifier(),
      size: sizeArg?.value ?? this.createMissingIdentifier(),
    } satisfies ExitAction;
  });

  private argumentList = this.RULE('argumentList', (): Argument[] => {
    const args: Argument[] = [];
    args.push(this.SUBRULE(this.argument));
    this.MANY(() => {
      this.CONSUME(Comma);
      args.push(this.SUBRULE2(this.argument));
    });
    return args;
  });

  private argument = this.RULE(
    'argument',
    (): Argument =>
      this.OR([
        {
          GATE: () =>
            this.LA(1).tokenType === Identifier &&
            this.LA(2).tokenType === Equal,
          ALT: () => this.SUBRULE(this.namedArgument),
        },
        { ALT: () => this.SUBRULE(this.positionalArgument) },
      ])
  );

  private namedArgument = this.RULE('namedArgument', (): NamedArgument => {
    const nameToken = this.CONSUME(Identifier);
    let name = '';
    this.ACTION(() => {
      name = nameToken.image;
    });
    this.CONSUME(Equal);
    const value = this.SUBRULE(this.expression);
    return {
      kind: 'NamedArgument',
      name,
      value,
    } satisfies NamedArgument;
  });

  private positionalArgument = this.RULE(
    'positionalArgument',
    (): PositionalArgument => {
      const value = this.SUBRULE(this.expression);
      return {
        kind: 'PositionalArgument',
        value,
      } satisfies PositionalArgument;
    }
  );

  private expression = this.RULE(
    'expression',
    (): Expression => this.SUBRULE(this.orExpr)
  );

  private orExpr = this.RULE('orExpr', (): Expression => {
    let left = this.SUBRULE(this.andExpr);
    this.MANY(() => {
      const operatorToken = this.CONSUME(Or);
      let operator = '';
      this.ACTION(() => {
        operator = operatorToken.image;
      });
      const right = this.SUBRULE2(this.andExpr);
      left = this.makeBinaryExpression(left, operator, right);
    });
    return left;
  });

  private andExpr = this.RULE('andExpr', (): Expression => {
    let left = this.SUBRULE(this.comparisonExpr);
    this.MANY(() => {
      const operatorToken = this.CONSUME(And);
      let operator = '';
      this.ACTION(() => {
        operator = operatorToken.image;
      });
      const right = this.SUBRULE2(this.comparisonExpr);
      left = this.makeBinaryExpression(left, operator, right);
    });
    return left;
  });

  private comparisonExpr = this.RULE('comparisonExpr', (): Expression => {
    let left = this.SUBRULE(this.additiveExpr);
    this.MANY(() => {
      let operator = '';
      this.OR([
        {
          ALT: () => {
            const token = this.CONSUME(EqualEqual);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(NotEqual);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(GreaterEqual);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(LessEqual);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(Greater);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(Less);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
      ]);
      const right = this.SUBRULE2(this.additiveExpr);
      left = this.makeBinaryExpression(left, operator, right);
    });
    return left;
  });

  private additiveExpr = this.RULE('additiveExpr', (): Expression => {
    let left = this.SUBRULE(this.multiplicativeExpr);
    this.MANY(() => {
      let operator = '';
      this.OR([
        {
          ALT: () => {
            const token = this.CONSUME(Plus);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(Minus);
            this.ACTION(() => {
              operator = token.image;
            });
          },
        },
      ]);
      const right = this.SUBRULE2(this.multiplicativeExpr);
      left = this.makeBinaryExpression(left, operator, right);
    });
    return left;
  });

  private multiplicativeExpr = this.RULE(
    'multiplicativeExpr',
    (): Expression => {
      let left = this.SUBRULE(this.unaryExpr);
      this.MANY(() => {
        let operator = '';
        this.OR([
          {
            ALT: () => {
              const token = this.CONSUME(Star);
              this.ACTION(() => {
                operator = token.image;
              });
            },
          },
          {
            ALT: () => {
              const token = this.CONSUME(Slash);
              this.ACTION(() => {
                operator = token.image;
              });
            },
          },
        ]);
        const right = this.SUBRULE2(this.unaryExpr);
        left = this.makeBinaryExpression(left, operator, right);
      });
      return left;
    }
  );

  private unaryExpr = this.RULE(
    'unaryExpr',
    (): Expression =>
      this.OR([
        {
          ALT: () => {
            let operator = '';
            this.OR2([
              {
                ALT: () => {
                  const token = this.CONSUME(Not);
                  this.ACTION(() => {
                    operator = token.image;
                  });
                },
              },
              {
                ALT: () => {
                  const token = this.CONSUME(Minus);
                  this.ACTION(() => {
                    operator = token.image;
                  });
                },
              },
            ]);
            const operand = this.SUBRULE(this.unaryExpr);
            return {
              kind: 'UnaryExpression',
              operator,
              operand,
            } satisfies UnaryExpression;
          },
        },
        { ALT: () => this.SUBRULE(this.primaryExpr) },
      ])
  );

  private primaryExpr = this.RULE(
    'primaryExpr',
    (): Expression =>
      this.OR([
        {
          GATE: () =>
            this.LA(1).tokenType === Identifier &&
            this.LA(2).tokenType === LParen,
          ALT: () => this.SUBRULE(this.functionCallExpr),
        },
        {
          ALT: () => {
            this.CONSUME(LParen);
            const value = this.SUBRULE(this.expression);
            this.CONSUME(RParen);
            return value;
          },
        },
        { ALT: () => this.SUBRULE(this.literalExpr) },
        { ALT: () => this.SUBRULE(this.identifierExpr) },
      ])
  );

  private functionCallExpr = this.RULE(
    'functionCallExpr',
    (): FunctionCallExpression => {
      const calleeToken = this.CONSUME(Identifier);
      let callee = '';
      this.ACTION(() => {
        callee = calleeToken.image;
      });
      this.CONSUME(LParen);
      const args = this.OPTION(() => this.SUBRULE(this.argumentList)) || [];
      this.CONSUME(RParen);
      return {
        kind: 'FunctionCallExpression',
        callee,
        args,
      } satisfies FunctionCallExpression;
    }
  );

  private literalExpr = this.RULE(
    'literalExpr',
    (): LiteralExpression =>
      this.OR([
        {
          ALT: () => {
            const token = this.CONSUME(NumberLiteral);
            let value = 0;
            this.ACTION(() => {
              value = Number(token.image);
            });
            return {
              kind: 'LiteralExpression',
              value,
            } satisfies LiteralExpression;
          },
        },
        {
          ALT: () => {
            const token = this.CONSUME(StringLiteral);
            let parsed = '';
            this.ACTION(() => {
              parsed = JSON.parse(token.image);
            });
            return {
              kind: 'LiteralExpression',
              value: parsed,
            } satisfies LiteralExpression;
          },
        },
        {
          ALT: () => {
            const token = this.OR2([
              { ALT: () => this.CONSUME(True) },
              { ALT: () => this.CONSUME(False) },
            ]);
            let value = false;
            this.ACTION(() => {
              value = token.image.toLowerCase() === 'true';
            });
            return {
              kind: 'LiteralExpression',
              value,
            } satisfies LiteralExpression;
          },
        },
      ])
  );

  private identifierExpr = this.RULE('identifierExpr', (): Expression => {
    const token = this.CONSUME(Identifier);
    let result: Expression = this.createMissingIdentifier();
    this.ACTION(() => {
      if (this.isEnumLiteral(token.image)) {
        result = {
          kind: 'EnumLiteralExpression',
          value: token.image,
        } satisfies EnumLiteralExpression;
        return;
      }
      result = {
        kind: 'IdentifierExpression',
        name: token.image,
      } satisfies IdentifierExpression;
    });
    return result;
  });

  private makeBinaryExpression(
    left: Expression,
    operator: string,
    right: Expression
  ): BinaryExpression {
    return {
      kind: 'BinaryExpression',
      operator,
      left,
      right,
    };
  }

  private isEnumLiteral(value: string): boolean {
    return /^[A-Z][A-Z0-9_]*$/.test(value);
  }

  private createMissingIdentifier(): IdentifierExpression {
    return {
      kind: 'IdentifierExpression',
      name: '__missing__',
    };
  }
}

const parserInstance = new StrategyILParser();

export type StrategyILParseResult = {
  ast: Program | null;
  lexErrors: ReturnType<typeof StrategyILLexer.tokenize>['errors'];
  parseErrors: StrategyILParser['errors'];
};

export const parseStrategyIL = (input: string): StrategyILParseResult => {
  const lexResult = StrategyILLexer.tokenize(input);
  parserInstance.errors = [];
  parserInstance.input = lexResult.tokens;
  const ast = parserInstance.program();
  return {
    ast:
      lexResult.errors.length === 0 && parserInstance.errors.length === 0
        ? ast
        : null,
    lexErrors: lexResult.errors,
    parseErrors: parserInstance.errors,
  };
};
