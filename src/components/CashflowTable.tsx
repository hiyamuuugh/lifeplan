"use client";

import type { CashflowRow } from "@/lib/calc-cashflow";

type Props = { rows: CashflowRow[] };

const fmt = (v: number) => v.toLocaleString();
const cell = (v: number, highlight = false) => {
  const cls = highlight
    ? v < 0
      ? "text-red-600 font-bold"
      : "font-bold"
    : v !== 0
    ? ""
    : "text-muted-foreground/40";
  return <td key={Math.random()} className={`px-2 py-0.5 text-right text-xs whitespace-nowrap ${cls}`}>{v !== 0 || highlight ? fmt(v) : ""}</td>;
};

const SECTION_HEADER = "bg-muted/60 text-xs font-semibold";
const ROW_HOVER = "hover:bg-muted/30 transition-colors";

export const CashflowTable = ({ rows }: Props) => (
  <div className="overflow-x-auto rounded-lg border text-xs">
    <table className="min-w-max border-collapse">
      <thead>
        <tr className="bg-muted">
          <th className="sticky left-0 z-10 bg-muted px-3 py-1.5 text-left text-xs font-semibold min-w-[100px]">項目</th>
          {rows.map((r) => (
            <th key={r.year} className="px-2 py-1.5 text-center text-xs font-medium min-w-[52px]">
              {r.year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* 年齢 */}
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs text-muted-foreground">本人</td>
          {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-center text-xs">{r.ageSelf}</td>)}
        </tr>
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs text-muted-foreground">配偶者</td>
          {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-center text-xs">{r.ageSpouse}</td>)}
        </tr>
        {rows.some((r) => r.ageChild1 !== null) && (
          <tr className={ROW_HOVER}>
            <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs text-muted-foreground">子1</td>
            {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-center text-xs">{r.ageChild1 ?? ""}</td>)}
          </tr>
        )}
        {rows.some((r) => r.ageChild2 !== null) && (
          <tr className={ROW_HOVER}>
            <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs text-muted-foreground">子2</td>
            {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-center text-xs">{r.ageChild2 ?? ""}</td>)}
          </tr>
        )}
        {/* ライフイベント */}
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs text-indigo-600 font-medium">イベント</td>
          {rows.map((r) => (
            <td key={r.year} className="px-2 py-0.5 text-center text-xs text-indigo-600 whitespace-nowrap">
              {r.events.join(" / ")}
            </td>
          ))}
        </tr>

        {/* 収入 */}
        <tr className={SECTION_HEADER}><td className="sticky left-0 z-10 bg-muted/60 px-3 py-1" colSpan={rows.length + 1}>収入（万円）</td></tr>
        {[
          ["本人収入", "salarySelf"],
          ["配偶者収入", "salarySpouse"],
          ["臨時収入", "temporaryIncome"],
          ["本人年金", "pensionSelf"],
          ["配偶者年金", "pensionSpouse"],
          ["住宅ローン控除", "mortgageDeduction"],
          ["児童手当", "childAllowance"],
        ].map(([label, key]) => (
          <tr key={key} className={ROW_HOVER}>
            <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs pl-5 text-muted-foreground">{label}</td>
            {rows.map((r) => cell(r[key as keyof CashflowRow] as number))}
          </tr>
        ))}
        <tr className="bg-green-50 dark:bg-green-950/20 font-semibold">
          <td className="sticky left-0 z-10 bg-green-50 dark:bg-green-950/20 px-3 py-0.5 text-xs">収入合計</td>
          {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-right text-xs font-semibold">{fmt(r.totalIncome)}</td>)}
        </tr>

        {/* 支出 */}
        <tr className={SECTION_HEADER}><td className="sticky left-0 z-10 bg-muted/60 px-3 py-1" colSpan={rows.length + 1}>支出（万円）</td></tr>
        {[
          ["生活費", "livingCost"],
          ["住宅関連費", "housingCost"],
          ["教育費", "educationCost"],
          ["イベント支出", "eventExpense"],
          ["借入金返済", "loanRepayment"],
          ["保険料", "insurance"],
          ["NISA", "nisa"],
          ["自動車", "carCost"],
        ].map(([label, key]) => (
          <tr key={key} className={ROW_HOVER}>
            <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs pl-5 text-muted-foreground">{label}</td>
            {rows.map((r) => cell(r[key as keyof CashflowRow] as number))}
          </tr>
        ))}
        <tr className="bg-red-50 dark:bg-red-950/20 font-semibold">
          <td className="sticky left-0 z-10 bg-red-50 dark:bg-red-950/20 px-3 py-0.5 text-xs">支出合計</td>
          {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-right text-xs font-semibold">{fmt(r.totalExpense)}</td>)}
        </tr>

        {/* 収支・資産 */}
        <tr className={SECTION_HEADER}><td className="sticky left-0 z-10 bg-muted/60 px-3 py-1" colSpan={rows.length + 1}>収支・資産（万円）</td></tr>
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs font-semibold">年間収支</td>
          {rows.map((r) => (
            <td key={r.year} className={`px-2 py-0.5 text-right text-xs font-bold ${r.annualBalance < 0 ? "text-red-600 bg-red-50 dark:bg-red-950/20" : "text-emerald-600"}`}>
              {fmt(r.annualBalance)}
            </td>
          ))}
        </tr>
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs font-semibold">口座残高</td>
          {rows.map((r) => (
            <td key={r.year} className={`px-2 py-0.5 text-right text-xs font-bold ${r.cashBalance < 0 ? "text-red-600 bg-red-50 dark:bg-red-950/20" : ""}`}>
              {fmt(r.cashBalance)}
            </td>
          ))}
        </tr>
        <tr className={ROW_HOVER}>
          <td className="sticky left-0 z-10 bg-background px-3 py-0.5 text-xs">運用額</td>
          {rows.map((r) => <td key={r.year} className="px-2 py-0.5 text-right text-xs">{fmt(r.investmentBalance)}</td>)}
        </tr>
        <tr className="bg-indigo-50 dark:bg-indigo-950/20">
          <td className="sticky left-0 z-10 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-0.5 text-xs font-bold">総資産</td>
          {rows.map((r) => (
            <td key={r.year} className={`px-2 py-0.5 text-right text-xs font-bold ${r.totalAsset < 0 ? "text-red-600" : "text-indigo-700 dark:text-indigo-300"}`}>
              {fmt(r.totalAsset)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);
