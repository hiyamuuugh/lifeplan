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
  salaryChangeSelf: number;
  salaryChangeSpouse: number;
  temporaryIncome: number;
  eventExpense: number;
  nisaChange: number;
  carCostChange: number;
  mortgageDeduction: number;
  childAllowanceChange: number;
  educationCostChange: number;
  loanRepaymentChange: number;
};

export const DEFAULT_EVENT: EventFormData = {
  ageSelf: 30,
  title: "",
  note: "",
  salaryChangeSelf: 0,
  salaryChangeSpouse: 0,
  temporaryIncome: 0,
  eventExpense: 0,
  nisaChange: 0,
  carCostChange: 0,
  mortgageDeduction: 0,
  childAllowanceChange: 0,
  educationCostChange: 0,
  loanRepaymentChange: 0,
};
