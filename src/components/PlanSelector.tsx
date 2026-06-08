"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LifePlanModel as LifePlan } from "@/generated/prisma/models/LifePlan";

type Props = {
  plans: LifePlan[];
  onSelect: (planId: string) => void;
  onCreate: (plan: LifePlan) => void;
};

export const PlanSelector = ({ plans, onSelect, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState(new Date().getFullYear() - 30);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthYear }),
    });
    const plan: LifePlan = await res.json();
    onCreate(plan);
    setName("");
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新しいプランを作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>プラン名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 自分のライフプラン"
            />
          </div>
          <div className="space-y-1">
            <Label>生まれ年</Label>
            <Input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full">
            {loading ? "作成中..." : "プランを作成"}
          </Button>
        </CardContent>
      </Card>

      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>既存のプラン</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plans.map((plan) => (
              <Button
                key={plan.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelect(plan.id)}
              >
                {plan.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {plan.birthYear}年生まれ
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
