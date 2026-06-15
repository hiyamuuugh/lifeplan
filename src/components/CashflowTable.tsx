"use client";

import { useState } from "react";
import type { CashflowRow } from "@/lib/calc-cashflow";

type Props = { rows: CashflowRow[] };

const fmt = (v: number) => v.toLocaleString();

const COL_W = "w-[56px] min-w-[56px] max-w-[56px]";

const cell = (v: number, key: string | number) => {
  const cls = v < 0 ? "text-red-600" : v !== 0 ? "" : "text-slate-300";
  return (
    <td key={key} className={`${COL_W} px-1 py-0.5 text-right text-xs border-r border-b border-slate-200 ${cls}`}>
      {v !== 0 ? fmt(v) : ""}
    </td>
  );
};

const stickyLabel = (bg: string, extra = "") =>
  `sticky left-0 z-10 ${bg} px-3 py-0.5 text-xs border-r border-b border-slate-200 whitespace-nowrap ${extra}`;

const SectionHeader = ({ label, bg, textColor, cols }: { label: string; bg: string; textColor: string; cols: number }) => (
  <tr>
    <td className={`sticky left-0 z-10 ${bg} ${textColor} px-3 py-1 text-xs font-semibold border-r border-b border-slate-300`}>
      {label}
    </td>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className={`${COL_W} ${bg} border-r border-b border-slate-300`} />
    ))}
  </tr>
);

export const CashflowTable = ({ rows }: Props) => {
  const [agesOpen, setAgesOpen] = useState(false);

  const hasChild1 = rows.some((r) => r.ageChild1 !== null);
  const hasChild2 = rows.some((r) => r.ageChild2 !== null);

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 text-xs" style={{ maxHeight: "60vh" }}>
      <table className="border-collapse table-fixed">
        <colgroup>
          <col className="w-[120px]" />
          {rows.map((r) => <col key={r.year} className="w-[56px]" />)}
        </colgroup>

        <thead className="sticky top-0 z-30">
          {/* 西暦行（常時表示） */}
          <tr>
            <th className="sticky left-0 z-30 bg-slate-800 text-white px-3 py-1 text-left text-xs font-semibold w-[120px] border border-slate-600">
              <button
                onClick={() => setAgesOpen((v) => !v)}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span>{agesOpen ? "▾" : "▸"}</span>
                <span>西暦</span>
              </button>
            </th>
            {rows.map((r) => (
              <th key={r.year} className={`${COL_W} px-1 py-1 text-center text-xs font-semibold bg-slate-800 text-white border border-slate-600`}>
                {r.year}
              </th>
            ))}
          </tr>

          {/* 年齢行（トグル） */}
          {agesOpen && (
            <>
              <tr>
                <th className="sticky left-0 z-30 bg-white text-slate-600 px-3 py-0.5 text-left text-xs font-normal w-[120px] border border-slate-300">本人</th>
                {rows.map((r) => <th key={r.year} className={`${COL_W} px-1 py-0.5 text-center text-xs font-normal bg-white text-slate-600 border border-slate-300`}>{r.ageSelf}</th>)}
              </tr>
              <tr>
                <th className="sticky left-0 z-30 bg-white text-slate-600 px-3 py-0.5 text-left text-xs font-normal w-[120px] border border-slate-300">配偶者</th>
                {rows.map((r) => <th key={r.year} className={`${COL_W} px-1 py-0.5 text-center text-xs font-normal bg-white text-slate-600 border border-slate-300`}>{r.ageSpouse}</th>)}
              </tr>
              {hasChild1 && (
                <tr>
                  <th className="sticky left-0 z-30 bg-white text-slate-600 px-3 py-0.5 text-left text-xs font-normal w-[120px] border border-slate-300">子1</th>
                  {rows.map((r) => <th key={r.year} className={`${COL_W} px-1 py-0.5 text-center text-xs font-normal bg-white text-slate-600 border border-slate-300`}>{r.ageChild1 ?? ""}</th>)}
                </tr>
              )}
              {hasChild2 && (
                <tr>
                  <th className="sticky left-0 z-30 bg-white text-slate-600 px-3 py-0.5 text-left text-xs font-normal w-[120px] border border-slate-300">子2</th>
                  {rows.map((r) => <th key={r.year} className={`${COL_W} px-1 py-0.5 text-center text-xs font-normal bg-white text-slate-600 border border-slate-300`}>{r.ageChild2 ?? ""}</th>)}
                </tr>
              )}
            </>
          )}
        </thead>

        <tbody>
          {/* ライフイベント */}
          <tr className="bg-indigo-50">
            <td className={stickyLabel("bg-indigo-50") + " text-indigo-700 font-medium"}>イベント</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-[10px] text-indigo-600 border-r border-b border-slate-200 align-top`}>
                {r.events.filter((e) => e !== "年間イベント支出" && e !== "初期設定").map((e, i) => (
                  <div key={i} className="leading-tight break-words">{e}</div>
                ))}
              </td>
            ))}
          </tr>

          {/* 収入 */}
          <SectionHeader label="収入（万円）" bg="bg-emerald-600" textColor="text-white" cols={rows.length} />
          {([
            ["本人収入",       "salarySelf",         "bg-emerald-50",   "text-emerald-700"],
            ["配偶者収入",     "salarySpouse",        "bg-teal-50",      "text-teal-700"],
            ["臨時収入",       "temporaryIncome",     "bg-cyan-50",      "text-cyan-700"],
            ["本人年金",       "pensionSelf",         "bg-emerald-50",   "text-emerald-700"],
            ["配偶者年金",     "pensionSpouse",       "bg-teal-50",      "text-teal-700"],
            ["住宅ローン控除", "mortgageDeduction",   "bg-lime-50",      "text-lime-700"],
            ["児童手当",       "childAllowance",      "bg-sky-50",       "text-sky-700"],
          ] as const).map(([label, key, bg, tc]) => (
            <tr key={key} className={bg}>
              <td className={stickyLabel(bg) + ` pl-5 ${tc} font-medium`}>{label}</td>
              {rows.map((r) => cell(r[key as keyof CashflowRow] as number, r.year))}
            </tr>
          ))}
          <tr className="bg-emerald-100">
            <td className={stickyLabel("bg-emerald-100") + " font-semibold text-emerald-800"}>収入合計</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs font-semibold border-r border-b border-slate-200 text-emerald-800`}>
                {fmt(r.totalIncome)}
              </td>
            ))}
          </tr>

          {/* 支出 */}
          <SectionHeader label="支出（万円）" bg="bg-rose-500" textColor="text-white" cols={rows.length} />
          {([
            ["生活費",     "livingCost",    "bg-rose-50",    "text-rose-700"],
            ["住宅関連費", "housingCost",   "bg-orange-50",  "text-orange-700"],
            ["教育費",     "educationCost", "bg-violet-50",  "text-violet-700"],
            ["イベント",   "eventExpense",  "bg-pink-50",    "text-pink-700"],
            ["借入金返済", "loanRepayment", "bg-orange-50",  "text-orange-700"],
            ["保険料",     "insurance",     "bg-red-50",     "text-red-700"],
            ["NISA",       "nisa",          "bg-indigo-50",  "text-indigo-700"],
            ["自動車",     "carCost",       "bg-amber-50",   "text-amber-700"],
          ] as const).map(([label, key, bg, tc]) => (
            <tr key={key} className={bg}>
              <td className={stickyLabel(bg) + ` pl-5 ${tc} font-medium`}>{label}</td>
              {rows.map((r) => cell(r[key as keyof CashflowRow] as number, r.year))}
            </tr>
          ))}
          <tr className="bg-rose-100">
            <td className={stickyLabel("bg-rose-100") + " font-semibold text-rose-800"}>支出合計</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs font-semibold border-r border-b border-slate-200 text-rose-800`}>
                {fmt(r.totalExpense)}
              </td>
            ))}
          </tr>

          {/* 収支・資産 */}
          <SectionHeader label="収支・資産（万円）" bg="bg-slate-700" textColor="text-white" cols={rows.length} />
          <tr className="bg-sky-50">
            <td className={stickyLabel("bg-sky-50") + " font-semibold text-sky-700"}>年間収支</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs font-bold border-r border-b border-slate-200 ${r.annualBalance < 0 ? "text-red-600 bg-red-50" : "text-sky-700"}`}>
                {fmt(r.annualBalance)}
              </td>
            ))}
          </tr>
          <tr className="bg-teal-50">
            <td className={stickyLabel("bg-teal-50") + " font-semibold text-teal-700"}>口座残高</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs font-bold border-r border-b border-slate-200 ${r.cashBalance < 0 ? "text-red-600 bg-red-50" : "text-teal-700"}`}>
                {fmt(r.cashBalance)}
              </td>
            ))}
          </tr>
          <tr className="bg-cyan-50">
            <td className={stickyLabel("bg-cyan-50") + " text-cyan-700"}>運用額</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs border-r border-b border-slate-200 text-cyan-700`}>
                {fmt(r.investmentBalance)}
              </td>
            ))}
          </tr>
          <tr className="bg-indigo-50">
            <td className={stickyLabel("bg-indigo-50") + " font-bold text-indigo-800"}>総資産</td>
            {rows.map((r) => (
              <td key={r.year} className={`${COL_W} px-1 py-0.5 text-right text-xs font-bold border-r border-b border-slate-200 ${r.totalAsset < 0 ? "text-red-600" : "text-indigo-700"}`}>
                {fmt(r.totalAsset)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
