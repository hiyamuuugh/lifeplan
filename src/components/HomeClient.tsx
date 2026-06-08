"use client";

import { useState } from "react";
import { PlanSelector } from "@/components/PlanSelector";
import { PlanView } from "@/components/PlanView";
import { BaseSettings } from "@/components/BaseSettings";
import { Button } from "@/components/ui/button";
import type { LifePlanModel } from "@/generated/prisma/models/LifePlan";
import type { LifeEventModel } from "@/generated/prisma/models/LifeEvent";

type LifePlan = LifePlanModel;
type LifeEvent = LifeEventModel;
type PlanWithEvents = LifePlan & { events: LifeEvent[] };

type Props = {
  initialPlans: LifePlan[];
};

export const HomeClient = ({ initialPlans }: Props) => {
  const [plans, setPlans] = useState<LifePlan[]>(initialPlans);
  const [activePlan, setActivePlan] = useState<PlanWithEvents | null>(null);
  const [baseAnnualIncome, setBaseAnnualIncome] = useState(400);
  const [baseAnnualExpense, setBaseAnnualExpense] = useState(300);
  const [initialAsset, setInitialAsset] = useState(100);

  const handleSelect = async (planId: string) => {
    const res = await fetch(`/api/plans/${planId}`);
    const plan: PlanWithEvents = await res.json();
    setActivePlan(plan);
  };

  const handleCreate = (plan: LifePlan) => {
    setPlans((prev) => [plan, ...prev]);
    handleSelect(plan.id);
  };

  const handleSettingsChange = (
    key: "baseAnnualIncome" | "baseAnnualExpense" | "initialAsset",
    value: number
  ) => {
    if (key === "baseAnnualIncome") setBaseAnnualIncome(value);
    else if (key === "baseAnnualExpense") setBaseAnnualExpense(value);
    else setInitialAsset(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold">LifePlan</h1>
        {activePlan && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{activePlan.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setActivePlan(null)}
            >
              プラン一覧へ
            </Button>
          </>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {activePlan ? (
          <>
            <BaseSettings
              baseAnnualIncome={baseAnnualIncome}
              baseAnnualExpense={baseAnnualExpense}
              initialAsset={initialAsset}
              onChange={handleSettingsChange}
            />
            <PlanView
              plan={activePlan}
              baseAnnualIncome={baseAnnualIncome}
              baseAnnualExpense={baseAnnualExpense}
              initialAsset={initialAsset}
            />
          </>
        ) : (
          <PlanSelector plans={plans} onSelect={handleSelect} onCreate={handleCreate} />
        )}
      </main>
    </div>
  );
};
