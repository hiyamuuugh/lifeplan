"use client";

import { useState } from "react";
import { PlanForm } from "@/components/PlanForm";
import { PlanView } from "@/components/PlanView";
import { Button } from "@/components/ui/button";
import type { Plan, PlanEvent } from "@/generated/prisma";

type PlanWithEvents = Plan & { events: PlanEvent[] };

type Props = { initialPlans: Plan[] };

export const HomeClient = ({ initialPlans }: Props) => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [activePlan, setActivePlan] = useState<PlanWithEvents | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelect = async (planId: string) => {
    const res = await fetch(`/api/plans/${planId}`);
    const plan: PlanWithEvents = await res.json();
    setActivePlan(plan);
    setShowForm(false);
  };

  const handleCreated = (plan: Plan) => {
    setPlans((prev) => [plan, ...prev]);
    handleSelect(plan.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 flex items-center gap-3">
        <h1 className="text-lg font-bold">LifePlan</h1>
        {activePlan && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-sm">{activePlan.name}</span>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setActivePlan(null)}>
              プラン一覧へ
            </Button>
          </>
        )}
      </header>

      <main className="max-w-full px-4 py-6 space-y-6">
        {activePlan ? (
          <PlanView plan={activePlan} />
        ) : showForm ? (
          <PlanForm onCreated={handleCreated} />
        ) : (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">プラン一覧</h2>
              <Button size="sm" onClick={() => setShowForm(true)}>+ 新規プラン</Button>
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">プランがありません。新規作成してください。</p>
            ) : (
              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    className="w-full rounded-lg border px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelect(p.id)}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.birthYearSelf}年生まれ</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
