"use client";

import { useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventDialog } from "@/components/EventDialog";
import { calcAssetTimeline } from "@/lib/calc-assets";
import { LIFE_EVENT_CATEGORIES, type LifeEventFormData } from "@/types/life-plan";
import type { LifePlanModel } from "@/generated/prisma/models/LifePlan";
import type { LifeEventModel } from "@/generated/prisma/models/LifeEvent";

type LifePlan = LifePlanModel;
type LifeEvent = LifeEventModel;
type PlanWithEvents = LifePlan & { events: LifeEvent[] };

type Props = {
  plan: PlanWithEvents;
  baseAnnualIncome: number;
  baseAnnualExpense: number;
  initialAsset: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  income: "bg-green-100 text-green-800",
  housing: "bg-blue-100 text-blue-800",
  education: "bg-yellow-100 text-yellow-800",
  marriage: "bg-pink-100 text-pink-800",
  vehicle: "bg-orange-100 text-orange-800",
  insurance: "bg-purple-100 text-purple-800",
  retirement: "bg-gray-100 text-gray-800",
  other: "bg-slate-100 text-slate-800",
};

export const PlanView = ({ plan, baseAnnualIncome, baseAnnualExpense, initialAsset }: Props) => {
  const [events, setEvents] = useState<LifeEvent[]>(plan.events);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LifeEvent | null>(null);

  const timeline = calcAssetTimeline(
    events,
    plan.birthYear,
    initialAsset,
    baseAnnualIncome,
    baseAnnualExpense
  );

  const handleAdd = useCallback(async (data: LifeEventFormData) => {
    const res = await fetch(`/api/plans/${plan.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const created: LifeEvent = await res.json();
    setEvents((prev) => [...prev, created].sort((a, b) => a.age - b.age));
  }, [plan.id]);

  const handleEdit = useCallback(async (data: LifeEventFormData) => {
    if (!editTarget) return;
    const res = await fetch(`/api/plans/${plan.id}/events/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated: LifeEvent = await res.json();
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditTarget(null);
  }, [plan.id, editTarget]);

  const handleDelete = useCallback(async (eventId: string) => {
    await fetch(`/api/plans/${plan.id}/events/${eventId}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, [plan.id]);

  const openEdit = (event: LifeEvent) => {
    setEditTarget(event);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
  };

  const minAsset = Math.min(...timeline.map((p) => p.asset));

  return (
    <div className="space-y-8">
      {/* 資産推移グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>資産推移</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="age"
                tickFormatter={(v) => `${v}歳`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 100).toFixed(0)}百万`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: unknown) => {
                  const v = typeof value === "number" ? value : 0;
                  return [`${v.toLocaleString()}万円`, "資産"];
                }}
                labelFormatter={(label) => `${label}歳`}
              />
              {minAsset < 0 && <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />}
              <Area
                type="monotone"
                dataKey="asset"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#assetGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* タイムライン */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">ライフイベント</h2>
        <Button onClick={() => setDialogOpen(true)}>+ イベント追加</Button>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          イベントを追加してください。
        </p>
      ) : (
        <div className="relative">
          {/* タイムライン線 */}
          <div className="absolute left-16 top-0 bottom-0 w-px bg-border" />
          <ul className="space-y-6">
            {events.map((event) => (
              <li key={event.id} className="flex gap-4">
                <div className="w-16 shrink-0 text-right text-sm font-medium text-muted-foreground pt-1">
                  {event.age}歳
                </div>
                <div className="relative pl-6 flex-1">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-background -translate-x-[calc(50%+0.5px)]" />
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.title}</span>
                          <Badge
                            className={
                              CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.other
                            }
                            variant="outline"
                          >
                            {LIFE_EVENT_CATEGORIES[event.category as keyof typeof LIFE_EVENT_CATEGORIES] ?? event.category}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          {event.income > 0 && (
                            <span className="text-green-600">+{event.income.toLocaleString()}万円</span>
                          )}
                          {event.expense > 0 && (
                            <span className="text-red-500">-{event.expense.toLocaleString()}万円</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(event)}>
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <EventDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={editTarget ? handleEdit : handleAdd}
        initialData={
          editTarget
            ? {
                age: editTarget.age,
                title: editTarget.title,
                description: editTarget.description ?? "",
                income: editTarget.income,
                expense: editTarget.expense,
                category: editTarget.category as LifeEventFormData["category"],
              }
            : undefined
        }
      />
    </div>
  );
};
