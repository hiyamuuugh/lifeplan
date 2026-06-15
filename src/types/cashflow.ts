export type PlanFormData = {
  name: string;
  birthYearSelf: number;
  birthYearSpouse: number;
  birthYearChild1: number | null;
  birthYearChild2: number | null;
  initialCash: number;
  initialInvestment: number;
  baseSalaryself: number;
  baseSalarySpouse: number;
  pensionSelf: number;
  pensionSpouse: number;
  pensionAgeSelf: number;
  pensionAgeSpouse: number;
  retirementAgeSelf: number;
  retirementAgeSpouse: number;
  annualLivingCost: number;
  annualHousingCost: number;
  annualInsurance: number;
  investmentRate: number;
};

export type EventFormData = {
  ageSelf: number;
  title: string;
  note: string;
  // 収入
  salaryChangeSelf: number;
  salaryChangeSpouse: number;
  temporaryIncome: number;
  mortgageDeduction: number;
  mortgageDeductionEndAge: number | null;
  childAllowanceChange: number;
  // 支出
  eventExpense: number;
  livingCostChange: number;
  housingCostChange: number;
  educationCostChange: number;
  loanRepaymentChange: number;
  insuranceChange: number;
  carCostChange: number;
  nisaChange: number;
};

export const DEFAULT_EVENT: EventFormData = {
  ageSelf: 30,
  title: "",
  note: "",
  salaryChangeSelf: 0,
  salaryChangeSpouse: 0,
  temporaryIncome: 0,
  mortgageDeduction: 0,
  mortgageDeductionEndAge: null,
  childAllowanceChange: 0,
  eventExpense: 0,
  livingCostChange: 0,
  housingCostChange: 0,
  educationCostChange: 0,
  loanRepaymentChange: 0,
  insuranceChange: 0,
  carCostChange: 0,
  nisaChange: 0,
};
