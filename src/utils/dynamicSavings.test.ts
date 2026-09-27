import { describe, expect, it } from 'vitest';
import { calculateDynamicSavingsRate } from './dynamicSavings';

describe('calculateDynamicSavingsRate', () => {
  it('keeps poor-day deductions affordable for low-income workers', () => {
    const result = calculateDynamicSavingsRate({
      market: 0.2,
      weather: 0.3,
      safety: 0.2,
      productivity: 0.2,
    });

    expect(result.rate).toBeLessThanOrEqual(0.06);
    expect(result.rate).toBeGreaterThanOrEqual(0.005);
    expect(result.label).toBe('Low day');
  });

  it('raises the deduction on strong market and weather conditions', () => {
    const result = calculateDynamicSavingsRate({
      market: 0.9,
      weather: 0.9,
      safety: 0.9,
      productivity: 0.9,
    });

    expect(result.rate).toBeGreaterThan(0.04);
    expect(result.label).toBe('Strong day');
  });

  it('caps the amount so workers are not over-deducted', () => {
    const result = calculateDynamicSavingsRate({
      market: 1,
      weather: 1,
      safety: 1,
      productivity: 1,
    });

    expect(result.rate).toBeLessThanOrEqual(0.06);
  });
});
