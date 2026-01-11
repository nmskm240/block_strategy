import { describe, expect, test } from 'bun:test';
import { parseStrategyIL } from './strategy_il_parser';
import { generateBacktraderStrategy } from './backtrader_generator';

describe('generateBacktraderStrategy', () => {
  test('generates python strategy code', () => {
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
    if (!result.ast) {
      throw new Error('expected AST');
    }

    const code = generateBacktraderStrategy(result.ast, {
      className: 'TestStrategy',
    });

    expect(code).toContain('class TestStrategy(bt.Strategy):');
    expect(code).toContain('self.sma_fast = bt.ind.SMA(self.data.close, 20)');
    expect(code).toContain('if (bt.ind.CrossOver(self.sma_fast, self.sma_slow) > 0):');
    expect(code).toContain('self.buy(size=0.1)');
    expect(code).toContain('self.close(size=0.1)');
  });
});
