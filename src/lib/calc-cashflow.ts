import type { Plan, PlanEvent } from "@/generated/prisma";

export type CashflowRow = {
  year: number;
  ageSelf: number;
  ageSpouse: number;
  ageChild1: number | null;
  ageChild2: number | null;
  events: string[];

  // 収入
  salarySelf: number;
  salarySpouse: number;
  temporaryIncome: number;
  pensionSelf: number;
  pensionSpouse: number;
  mortgageDeduction: number;
  childAllowance: number;
  totalIncome: number;

  // 支出
  livingCost: number;
  housingCost: number;
  educationCost: number;
  eventExpense: number;
  loanRepayment: number;
  insurance: number;
  nisa: number;
  carCost: number;
  totalExpense: number;

  // 収支・資産
  annualBalance: number;
  cashBalance: number;
  investmentBalance: number;
  totalAsset: number;
};

type PlanWithEvents = Plan & { events: PlanEvent[] };

const START_AGE = 29;
const END_AGE = 85;

export const calcCashflow = (plan: PlanWithEvents): CashflowRow[] => {
  const rows: CashflowRow[] = [];

  // 累積変化量（年をまたいで持続するもの）
  let salarySelf = plan.baseSalaryself;
  let salarySpouse = plan.baseSalarySpouse;
  let nisa = 0;
  let carCost = 0;
  let childAllowance = 0;
  let educationCost = 0;
  let loanRepayment = 0;
  let livingCostDelta = 0;
  let housingCostDelta = 0;
  let insuranceDelta = 0;

  let cashBalance = plan.initialCash;
  let investmentBalance = plan.initialInvestment;

  const startYear = plan.birthYearSelf + START_AGE;

  for (let ageSelf = START_AGE; ageSelf <= END_AGE; ageSelf++) {
    const year = plan.birthYearSelf + ageSelf;
    const ageSpouse = plan.birthYearSpouse ? ageSelf + (plan.birthYearSpouse - plan.birthYearSelf) : ageSelf;
    const ageChild1 = plan.birthYearChild1 ? year - plan.birthYearChild1 : null;
    const ageChild2 = plan.birthYearChild2 ? year - plan.birthYearChild2 : null;

    // このageのイベントを取得
    const yearEvents = plan.events.filter((e) => e.ageSelf === ageSelf);

    // 累積変化を適用（その年以降に持続）
    for (const ev of yearEvents) {
      salarySelf += ev.salaryChangeSelf ?? 0;
      salarySpouse += ev.salaryChangeSpouse ?? 0;
      nisa += ev.nisaChange ?? 0;
      carCost += ev.carCostChange ?? 0;
      childAllowance += ev.childAllowanceChange ?? 0;
      educationCost += ev.educationCostChange ?? 0;
      loanRepayment += ev.loanRepaymentChange ?? 0;
      livingCostDelta += ev.livingCostChange ?? 0;
      housingCostDelta += ev.housingCostChange ?? 0;
      insuranceDelta += ev.insuranceChange ?? 0;
    }

    // 退職後は給与0（上昇率は複利で毎年適用）
    const yearsElapsed = ageSelf - START_AGE;
    const growthSelf = Math.pow(1 + (plan.salaryGrowthRateSelf ?? 0) / 100, yearsElapsed);
    const growthSpouse = Math.pow(1 + (plan.salaryGrowthRateSpouse ?? 0) / 100, yearsElapsed);
    const effectiveSalarySelf = ageSelf >= plan.retirementAgeSelf ? 0 : Math.round(salarySelf * growthSelf);
    const effectiveSalarySpouse = ageSelf >= plan.retirementAgeSpouse ? 0 : Math.round(salarySpouse * growthSpouse);

    // 年金（退職後）
    const effectivePensionSelf = ageSelf >= plan.pensionAgeSelf ? plan.pensionSelf : 0;
    const effectivePensionSpouse = ageSelf >= plan.pensionAgeSpouse ? plan.pensionSpouse : 0;

    // その年のみの値
    const temporaryIncome = yearEvents.reduce((s, e) => s + (e.temporaryIncome ?? 0), 0);
    const eventExpense = yearEvents.reduce((s, e) => s + (e.eventExpense ?? 0), 0);

    // 住宅ローン控除: 適用中のイベント（開始ageSelf <= ageSelf <= endAge）の合計
    const mortgageDeduction = plan.events.reduce((s, e) => {
      const amt = e.mortgageDeduction ?? 0;
      if (amt === 0) return s;
      const start = e.ageSelf;
      const end = e.mortgageDeductionEndAge ?? start;
      return ageSelf >= start && ageSelf <= end ? s + amt : s;
    }, 0);

    // NISA は退職後0
    const effectiveNisa = ageSelf >= plan.retirementAgeSelf ? 0 : nisa;

    const totalIncome =
      effectiveSalarySelf +
      effectiveSalarySpouse +
      temporaryIncome +
      effectivePensionSelf +
      effectivePensionSpouse +
      mortgageDeduction +
      childAllowance;

    const livingCostGrowth = Math.pow(1 + (plan.livingCostGrowthRate ?? 0) / 100, yearsElapsed);
    const effectiveLivingCost = Math.round((plan.annualLivingCost + livingCostDelta) * livingCostGrowth);
    const effectiveHousingCost = plan.annualHousingCost + housingCostDelta;
    const effectiveInsurance = plan.annualInsurance + insuranceDelta;

    const totalExpense =
      effectiveLivingCost +
      effectiveHousingCost +
      educationCost +
      eventExpense +
      loanRepayment +
      effectiveInsurance +
      effectiveNisa +
      carCost;

    const annualBalance = totalIncome - totalExpense;

    // 口座残高（年間収支で増減）
    cashBalance += annualBalance;

    // 運用額（前年残高×1.03 + 今年のNISA積立）
    investmentBalance = Math.round(investmentBalance * (1 + plan.investmentRate / 100) + effectiveNisa);

    const totalAsset = cashBalance + investmentBalance;

    rows.push({
      year,
      ageSelf,
      ageSpouse,
      ageChild1,
      ageChild2,
      events: yearEvents.map((e) => e.title),

      salarySelf: effectiveSalarySelf,
      salarySpouse: effectiveSalarySpouse,
      temporaryIncome,
      pensionSelf: effectivePensionSelf,
      pensionSpouse: effectivePensionSpouse,
      mortgageDeduction,
      childAllowance,
      totalIncome,

      livingCost: effectiveLivingCost,
      housingCost: effectiveHousingCost,
      educationCost,
      eventExpense,
      loanRepayment,
      insurance: effectiveInsurance,
      nisa: effectiveNisa,
      carCost,
      totalExpense,

      annualBalance,
      cashBalance,
      investmentBalance,
      totalAsset,
    });
  }

  return rows;
};
