export type BillingCycle = 'monthly' | 'semi-annual' | 'annual';
export type PlanTier = 'essential' | 'experience' | 'elite';

export interface PlanPricing {
  tier: PlanTier;
  monthly: number;
  semiAnnual: number;
  annual: number;
}

export const usePricingModel = () => {
  /**
   * Calculates the base monthly fee before tier multipliers.
   * Formula: €125 + Max(0, rooms - 50) * €2
   */
  const calculateBaseFee = (rooms: number): number => {
    const validRooms = Math.max(0, rooms); // ensure no negative
    return 125 + Math.max(0, validRooms - 50) * 2;
  };

  const calculatePlans = (rooms: number): PlanPricing[] => {
    // Exact matched base rates for 50 rooms (after 30% discount)
    const extraRooms = Math.max(0, rooms - 50);

    const getMonthly = (baseFor50: number, multiplier: number) => {
      return baseFor50 + Math.round(extraRooms * 1.508 * multiplier);
    };

    const getSemi = (baseFor50: number, multiplier: number) => {
      return baseFor50 + Math.round(extraRooms * 1.4 * multiplier);
    };

    const getAnnual = (baseFor50: number, multiplier: number) => {
      return baseFor50 + Math.round(extraRooms * 1.252 * multiplier);
    };

    return [
      {
        tier: 'essential',
        monthly: getMonthly(57, 0.6),
        semiAnnual: getSemi(52, 0.6),
        annual: getAnnual(48, 0.6),
      },
      {
        tier: 'experience',
        monthly: getMonthly(95, 1.0),
        semiAnnual: getSemi(86, 1.0),
        annual: getAnnual(79, 1.0),
      },
      {
        tier: 'elite',
        monthly: getMonthly(143, 1.5),
        semiAnnual: getSemi(130, 1.5),
        annual: getAnnual(119, 1.5),
      },
    ];
  };

  return {
    calculateBaseFee,
    calculatePlans,
  };
};
