import type { Plan, PlanEvent } from "@/generated/prisma/client";

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
      salarySelf += ev.salaryChangeSelf;
      salarySpouse += ev.salaryChangeSpouse;
      nisa += ev.nisaChange;
      carCost += ev.carCostChange;
      childAllowance += ev.childAllowanceChange;
      educationCost += ev.educationCostChange;
      loanRepayment += ev.loanRepaymentChange;
    }

    // 退職後は給与0
    const effectiveSalarySelf = ageSelf >= plan.retirementAgeSelf ? 0 : salarySelf;
    const effectiveSalarySpouse = ageSelf >= plan.retirementAgeSpouse ? 0 : salarySpouse;

    // 年金（退職後）
    const effectivePensionSelf = ageSelf >= plan.pensionAgeSelf ? plan.pensionSelf : 0;
    const effectivePensionSpouse = ageSelf >= plan.pensionAgeSpouse ? plan.pensionSpouse : 0;

    // その年のみの値
    const temporaryIncome = yearEvents.reduce((s, e) => s + e.temporaryIncome, 0);
    const mortgageDeduction = yearEvents.reduce((s, e) => s + e.mortgageDeduction, 0);
    const eventExpense = yearEvents.reduce((s, e) => s + e.eventExpense, 0);

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

    const totalExpense =
      plan.annualLivingCost +
      plan.annualHousingCost +
      educationCost +
      eventExpense +
      loanRepayment +
      plan.annualInsurance +
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

      livingCost: plan.annualLivingCost,
      housingCost: plan.annualHousingCost,
      educationCost,
      eventExpense,
      loanRepayment,
      insurance: plan.annualInsurance,
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
