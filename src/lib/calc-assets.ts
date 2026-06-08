import type { AssetDataPoint } from "@/types/life-plan";
import type { LifeEventModel as LifeEvent } from "@/generated/prisma/models/LifeEvent";

export const calcAssetTimeline = (
  events: LifeEvent[],
  birthYear: number,
  initialAsset: number,
  baseAnnualIncome: number,
  baseAnnualExpense: number,
  endAge: number = 90
): AssetDataPoint[] => {
  const startAge = Math.min(...events.map((e) => e.age), 20);
  const points: AssetDataPoint[] = [];
  let asset = initialAsset;

  for (let age = startAge; age <= endAge; age++) {
    const yearEvents = events.filter((e) => e.age === age);
    const eventIncome = yearEvents.reduce((sum, e) => sum + e.income, 0);
    const eventExpense = yearEvents.reduce((sum, e) => sum + e.expense, 0);

    const annualIncome = baseAnnualIncome + eventIncome;
    const annualExpense = baseAnnualExpense + eventExpense;

    asset += annualIncome - annualExpense;

    points.push({ age, asset, annualIncome, annualExpense });
  }

  return points;
};
