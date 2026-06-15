"use client";

import { useState, useCallback, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventDialog } from "@/components/EventDialog";
import { CashflowTable } from "@/components/CashflowTable";
import { SettingsDialog } from "@/components/SettingsDialog";
import { calcCashflow } from "@/lib/calc-cashflow";
import { type EventFormData } from "@/types/cashflow";
import type { Plan, PlanEvent } from "@/generated/prisma";

type PlanWithEvents = Plan & { events: PlanEvent[] };
type Props = { plan: PlanWithEvents };

const EVENT_PAGE_SIZE = 10;
const HIDDEN_TITLES = new Set(["年間イベント支出", "初期設定"]);

type ChangeChip = { label: string; value: string; color: string };

const formatEventChanges = (ev: PlanEvent): ChangeChip[] => {
  const items: ChangeChip[] = [];
  const add = (label: string, v: number | null | undefined, color: string, unit = "万円", annual = false) => {
    if (!v) return;
    const sign = v > 0 ? "+" : "";
    items.push({ label, value: `${sign}${v}${unit}${annual ? "/年" : ""}`, color });
  };
  // 収入系 — emerald
  add("本人年収", ev.salaryChangeSelf, "bg-emerald-100 text-emerald-800", "万円", true);
  add("配偶者年収", ev.salaryChangeSpouse, "bg-emerald-100 text-emerald-800", "万円", true);
  add("臨時収入", ev.temporaryIncome, "bg-emerald-100 text-emerald-800");
  if (ev.mortgageDeduction) {
    const end = ev.mortgageDeductionEndAge;
    items.push({ label: "住宅ローン控除", value: `${ev.mortgageDeduction}万円/年（〜${end ?? ev.ageSelf}歳）`, color: "bg-emerald-100 text-emerald-800" });
  }
  add("児童手当", ev.childAllowanceChange, "bg-sky-100 text-sky-800", "万円", true);
  // 教育費 — violet
  add("教育費", ev.educationCostChange, "bg-violet-100 text-violet-800", "万円", true);
  // 支出系 — rose
  add("イベント支出", ev.eventExpense, "bg-rose-100 text-rose-800");
  add("生活費", ev.livingCostChange, "bg-rose-100 text-rose-800", "万円", true);
  add("住宅関連費", ev.housingCostChange, "bg-orange-100 text-orange-800", "万円", true);
  add("借入返済", ev.loanRepaymentChange, "bg-orange-100 text-orange-800", "万円", true);
  add("保険料", ev.insuranceChange, "bg-rose-100 text-rose-800", "万円", true);
  add("車費用", ev.carCostChange, "bg-amber-100 text-amber-800", "万円", true);
  // 運用 — indigo
  add("NISA", ev.nisaChange, "bg-indigo-100 text-indigo-800", "万円", true);
  return items;
};

export const PlanView = ({ plan: initialPlan }: Props) => {
  const [plan, setPlan] = useState<PlanWithEvents>(initialPlan);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlanEvent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // イベント一覧のフィルタ・ページ状態
  const [eventSearch, setEventSearch] = useState("");
  const [eventAgeFrom, setEventAgeFrom] = useState("");
  const [eventAgeTo, setEventAgeTo] = useState("");
  const [eventPage, setEventPage] = useState(0);

  const rows = calcCashflow(plan);

  const nameSelf = plan.nameSelf ?? "本人";
  const nameSpouse = plan.nameSpouse ?? "配偶者";
  const nameChild1 = plan.nameChild1 ?? "子1";
  const nameChild2 = plan.nameChild2 ?? "子2";

  // 表示用イベント（シードの内部イベントを除外）
  const visibleEvents = useMemo(
    () => plan.events.filter((e) => !HIDDEN_TITLES.has(e.title)),
    [plan.events]
  );

  // フィルタ済みイベント
  const filteredEvents = useMemo(() => {
    let result = visibleEvents;
    const from = eventAgeFrom !== "" ? parseInt(eventAgeFrom, 10) : null;
    const to = eventAgeTo !== "" ? parseInt(eventAgeTo, 10) : null;
    if (from !== null) result = result.filter((e) => e.ageSelf >= from);
    if (to !== null) result = result.filter((e) => e.ageSelf <= to);
    if (eventSearch.trim() !== "") {
      const q = eventSearch.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.note ?? "").toLowerCase().includes(q) ||
          String(e.ageSelf).includes(q)
      );
    }
    return result;
  }, [visibleEvents, eventAgeFrom, eventAgeTo, eventSearch]);

  const totalEventPages = Math.ceil(filteredEvents.length / EVENT_PAGE_SIZE);
  const safePage = Math.min(eventPage, Math.max(0, totalEventPages - 1));
  const pagedEvents = filteredEvents.slice(safePage * EVENT_PAGE_SIZE, (safePage + 1) * EVENT_PAGE_SIZE);

  const resetEventFilter = () => { setEventSearch(""); setEventAgeFrom(""); setEventAgeTo(""); setEventPage(0); };
  const hasFilter = eventSearch || eventAgeFrom || eventAgeTo;

  const handleAdd = useCallback(async (data: EventFormData) => {
    const res = await fetch(`/api/plans/${plan.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const created: PlanEvent = await res.json();
    setPlan((prev) => ({
      ...prev,
      events: [...prev.events, created].sort((a, b) => a.ageSelf - b.ageSelf),
    }));
  }, [plan.id]);

  const handleEdit = useCallback(async (data: EventFormData) => {
    if (!editTarget) return;
    const res = await fetch(`/api/plans/${plan.id}/events/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated: PlanEvent = await res.json();
    setPlan((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === updated.id ? updated : e)),
    }));
    setEditTarget(null);
  }, [plan.id, editTarget]);

  const handleDelete = useCallback(async (eventId: string) => {
    await fetch(`/api/plans/${plan.id}/events/${eventId}`, { method: "DELETE" });
    setPlan((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== eventId) }));
  }, [plan.id]);

  const openEdit = (event: PlanEvent) => { setEditTarget(event); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null); };

  const chartData = rows.map((r) => ({
    age: r.ageSelf,
    口座残高: r.cashBalance,
    運用額: r.investmentBalance,
    総資産: r.totalAsset,
  }));

  return (
    <div className="space-y-6">
      {/* プランヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{plan.name}</h1>
        <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>⚙ 設定</Button>
      </div>

      {/* 資産推移グラフ */}
      <Card>
        <CardHeader><CardTitle className="text-base">資産推移</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="age" tickFormatter={(v) => `${v}歳`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `¥${(v * 10000).toLocaleString()}`} tick={{ fontSize: 11 }} width={90} />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [`${typeof value === "number" ? value.toLocaleString() : 0}万円`, String(name ?? "")]}
                labelFormatter={(l) => `${l}歳`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="総資産" stroke="#6366f1" strokeWidth={2} fill="url(#gTotal)" />
              <Area type="monotone" dataKey="口座残高" stroke="#10b981" strokeWidth={1.5} fill="url(#gCash)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* キャッシュフロー表 */}
      <div>
        <h2 className="text-base font-semibold mb-2">キャッシュフロー表</h2>
        <CashflowTable rows={rows} />
      </div>

      {/* ライフイベント一覧 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">ライフイベント</h2>
          <Button size="sm" onClick={() => setDialogOpen(true)}>+ イベント追加</Button>
        </div>

        {/* 検索・フィルタバー */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="イベント名・メモで検索"
            value={eventSearch}
            onChange={(e) => { setEventSearch(e.target.value); setEventPage(0); }}
            className="h-8 w-48 text-xs"
          />
          <span className="text-xs text-muted-foreground">年齢</span>
          <Input
            type="number"
            placeholder="FROM"
            value={eventAgeFrom}
            onChange={(e) => { setEventAgeFrom(e.target.value); setEventPage(0); }}
            className="h-8 w-20 text-xs"
          />
          <span className="text-xs text-muted-foreground">〜</span>
          <Input
            type="number"
            placeholder="TO"
            value={eventAgeTo}
            onChange={(e) => { setEventAgeTo(e.target.value); setEventPage(0); }}
            className="h-8 w-20 text-xs"
          />
          {hasFilter && (
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={resetEventFilter}>
              リセット
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredEvents.length}件 / 全{visibleEvents.length}件
          </span>
        </div>

        {/* イベントリスト */}
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {hasFilter ? "該当するイベントがありません" : "イベントを追加するとキャッシュフローに反映されます。"}
          </p>
        ) : (
          <>
            <div className="space-y-1">
              {pagedEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm hover:bg-muted/30 transition-colors">
                  <div className="shrink-0 text-right space-y-0.5 min-w-[72px]">
                    <div className="text-xs font-semibold">{plan.birthYearSelf + ev.ageSelf}年</div>
                    <div className="text-[11px] text-muted-foreground">{nameSelf} {ev.ageSelf}歳</div>
                    <div className="text-[11px] text-muted-foreground">{nameSpouse} {ev.ageSelf + (plan.birthYearSpouse - plan.birthYearSelf)}歳</div>
                    {plan.birthYearChild1 && <div className="text-[11px] text-muted-foreground">{nameChild1} {plan.birthYearSelf + ev.ageSelf - plan.birthYearChild1}歳</div>}
                    {plan.birthYearChild2 && <div className="text-[11px] text-muted-foreground">{nameChild2} {plan.birthYearSelf + ev.ageSelf - plan.birthYearChild2}歳</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{ev.title}</div>
                    {ev.note && <div className="text-xs text-muted-foreground mt-0.5">{ev.note}</div>}
                    {(() => {
                      const changes = formatEventChanges(ev);
                      if (changes.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {changes.map((c) => (
                            <span key={c.label} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${c.color}`}>
                              <span className="opacity-70">{c.label}</span>
                              <span>{c.value}</span>
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(ev)}>編集</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(ev.id)}>削除</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            {totalEventPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEventPage(0)} disabled={safePage === 0}>«</Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEventPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}>‹</Button>
                {Array.from({ length: totalEventPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i === safePage ? "default" : "outline"}
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setEventPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEventPage((p) => Math.min(totalEventPages - 1, p + 1))} disabled={safePage === totalEventPages - 1}>›</Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEventPage(totalEventPages - 1)} disabled={safePage === totalEventPages - 1}>»</Button>
                <span className="ml-2 text-xs text-muted-foreground">{safePage + 1} / {totalEventPages} ページ</span>
              </div>
            )}
          </>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={editTarget ? handleEdit : handleAdd}
        birthYearSelf={plan.birthYearSelf}
        birthYearSpouse={plan.birthYearSpouse}
        birthYearChild1={plan.birthYearChild1}
        birthYearChild2={plan.birthYearChild2}
        initialData={editTarget ? {
          ageSelf: editTarget.ageSelf,
          title: editTarget.title,
          note: editTarget.note ?? "",
          salaryChangeSelf: editTarget.salaryChangeSelf,
          salaryChangeSpouse: editTarget.salaryChangeSpouse,
          temporaryIncome: editTarget.temporaryIncome,
          mortgageDeduction: editTarget.mortgageDeduction,
          mortgageDeductionEndAge: editTarget.mortgageDeductionEndAge ?? null,
          childAllowanceChange: editTarget.childAllowanceChange,
          eventExpense: editTarget.eventExpense,
          livingCostChange: editTarget.livingCostChange,
          housingCostChange: editTarget.housingCostChange,
          educationCostChange: editTarget.educationCostChange,
          loanRepaymentChange: editTarget.loanRepaymentChange,
          insuranceChange: editTarget.insuranceChange,
          carCostChange: editTarget.carCostChange,
          nisaChange: editTarget.nisaChange,
        } : undefined}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        plan={plan}
        onSaved={(updated) => setPlan((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
};
