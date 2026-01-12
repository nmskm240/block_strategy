import { parseStrategyIL } from '@shared/application/strategy_il_parser';
import { describe, expect, test } from 'bun:test';

describe('parseStrategyIL', () => {
  test('parses sample strategy IL', () => {
    const input = `
sma_fast = SMA(close, 20);
sma_slow = SMA(close, 50);

WHEN cross_over(sma_fast, sma_slow)
  DO ENTRY(
    side = LONG,
    size = FIXED(0.1)
  ), EXIT(
    side = LONG,
    size = FIXED(0.1)
  );
`;
    const result = parseStrategyIL(input);

    expect(result.lexErrors.length).toBe(0);
    expect(result.parseErrors.length).toBe(0);
    expect(result.ast).not.toBeNull();
    expect(result.ast?.statements.length).toBe(3);

    const whenStatement = result.ast?.statements[2];
    expect(whenStatement?.kind).toBe('WhenStatement');
    if (whenStatement?.kind === 'WhenStatement') {
      expect(whenStatement.actions.length).toBe(2);
    }
  });
});
