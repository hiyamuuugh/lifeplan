export type LifeEventCategory =
  | "income"
  | "housing"
  | "education"
  | "marriage"
  | "vehicle"
  | "insurance"
  | "retirement"
  | "other";

export const LIFE_EVENT_CATEGORIES: Record<LifeEventCategory, string> = {
  income: "収入変化",
  housing: "住居",
  education: "教育",
  marriage: "結婚",
  vehicle: "車",
  insurance: "保険",
  retirement: "老後",
  other: "その他",
};

export type LifeEventFormData = {
  age: number;
  title: string;
  description?: string;
  income: number;
  expense: number;
  category: LifeEventCategory;
};

export type AssetDataPoint = {
  age: number;
  asset: number;
  annualIncome: number;
  annualExpense: number;
};
