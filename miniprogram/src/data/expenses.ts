export function getMockExpenseSummary() {
  return {
    totalAmount: 8960,
    raceCount: 3,
    breakdown: {
      registrationFee: 600,
      accommodation: 2800,
      transportation: 3600,
      food: 1100,
      gear: 600,
      other: 260,
    },
  }
}

export default function () {
  return getMockExpenseSummary()
}
