"use client";

import { useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventDialog } from "@/components/EventDialog";
import { CashflowTable } from "@/components/CashflowTable";
import { calcCashflow } from "@/lib/calc-cashflow";
import { type EventFormData } from "@/types/cashflow";
import type { Plan, PlanEvent } from "@/generated/prisma/client";

type PlanWithEvents = Plan & { events: PlanEvent[] };

type Props = { plan: PlanWithEvents };

export const PlanView = ({ plan: initialPlan }: Props) => {
  const [plan, setPlan] = useState<PlanWithEvents>(initialPlan);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlanEvent | null>(null);

  const rows = calcCashflow(plan);

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

  const openEdit = (event: PlanEvent) => {
    setEditTarget(event);
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null); };

  const chartData = rows.map((r) => ({
    age: r.ageSelf,
    口座残高: r.cashBalance,
    運用額: r.investmentBalance,
    総資産: r.totalAsset,
  }));

  return (
    <div className="space-y-6">
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
              <YAxis tickFormatter={(v) => `${Math.round(v / 100)}百万`} tick={{ fontSize: 11 }} />
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

      {/* ライフイベント一覧 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">ライフイベント</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>+ イベント追加</Button>
      </div>

      {plan.events.length === 0 ? (
        <p className="text-sm text-muted-foreground">イベントを追加するとキャッシュフローに反映されます。</p>
      ) : (
        <div className="space-y-2">
          {plan.events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm">
              <span className="w-14 shrink-0 text-right font-medium text-muted-foreground">{ev.ageSelf}歳</span>
              <span className="flex-1 font-medium">{ev.title}</span>
              {ev.note && <span className="text-xs text-muted-foreground">{ev.note}</span>}
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(ev)}>編集</Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(ev.id)}>削除</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* キャッシュフロー表 */}
      <div>
        <h2 className="text-base font-semibold mb-2">キャッシュフロー表</h2>
        <CashflowTable rows={rows} />
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={editTarget ? handleEdit : handleAdd}
        initialData={editTarget ? {
          ageSelf: editTarget.ageSelf,
          title: editTarget.title,
          note: editTarget.note ?? "",
          salaryChangeSelf: editTarget.salaryChangeSelf,
          salaryChangeSpouse: editTarget.salaryChangeSpouse,
          temporaryIncome: editTarget.temporaryIncome,
          eventExpense: editTarget.eventExpense,
          nisaChange: editTarget.nisaChange,
          carCostChange: editTarget.carCostChange,
          mortgageDeduction: editTarget.mortgageDeduction,
          childAllowanceChange: editTarget.childAllowanceChange,
          educationCostChange: editTarget.educationCostChange,
          loanRepaymentChange: editTarget.loanRepaymentChange,
        } : undefined}
      />
    </div>
  );
};
