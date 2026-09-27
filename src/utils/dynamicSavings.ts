export type DynamicSavingsInput = {
  market: number;
  weather: number;
  safety: number;
  productivity: number;
};

export type DynamicSavingsResult = {
  rate: number;
  conditionScore: number;
  label: 'Strong day' | 'Normal day' | 'Low day';
  note: string;
};

export function calculateDynamicSavingsRate({
  market,
  weather,
  safety,
  productivity,
}: DynamicSavingsInput): DynamicSavingsResult {
  const conditionScore = (market * 0.35) + (weather * 0.25) + (safety * 0.25) + (productivity * 0.15);
  const rawRate = 0.015 + (conditionScore - 0.45) * 0.075;
  const rate = Math.min(Math.max(rawRate, 0.005), 0.06);

  if (conditionScore >= 0.72) {
    return {
      rate,
      conditionScore,
      label: 'Strong day',
      note: 'Favourable market and weather conditions justify a higher contribution while still keeping the burden manageable.',
    };
  }

  if (conditionScore >= 0.42) {
    return {
      rate,
      conditionScore,
      label: 'Normal day',
      note: 'Conditions are balanced, so the deduction remains modest and fair for the worker.',
    };
  }

  return {
    rate,
    conditionScore,
    label: 'Low day',
    note: 'Weak demand, poor weather or risky conditions reduce the saving amount to protect daily earnings.',
  };
}
