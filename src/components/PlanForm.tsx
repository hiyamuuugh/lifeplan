"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "@/generated/prisma";
import type { PlanFormData } from "@/types/cashflow";

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT: PlanFormData = {
  name: "",
  birthYearSelf: CURRENT_YEAR - 29,
  birthYearSpouse: CURRENT_YEAR - 29,
  birthYearChild1: CURRENT_YEAR - 2,
  birthYearChild2: CURRENT_YEAR - 1,
  initialCash: 100,
  initialInvestment: 200,
  baseSalaryself: 450,
  baseSalarySpouse: 300,
  pensionSelf: 180,
  pensionSpouse: 200,
  pensionAgeSelf: 65,
  pensionAgeSpouse: 65,
  retirementAgeSelf: 65,
  retirementAgeSpouse: 65,
  annualLivingCost: 348,
  annualHousingCost: 219,
  annualInsurance: 12,
  investmentRate: 3,
};

type Props = {
  onCreated: (plan: Plan) => void;
};

const Field = ({
  label, value, onChange, type = "number",
}: {
  label: string;
  value: string | number | null;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
    />
  </div>
);

export const PlanForm = ({ onCreated }: Props) => {
  const [form, setForm] = useState<PlanFormData>(DEFAULT);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof PlanFormData, raw: string) => {
    const value = raw === "" ? null : (key === "name" || key === "investmentRate") ? (key === "investmentRate" ? parseFloat(raw) : raw) : parseInt(raw, 10);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const plan = await res.json();
    onCreated(plan);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader><CardTitle>新しいプランを作成</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="プラン名" value={form.name} onChange={(v) => set("name", v)} type="text" />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <p className="text-sm font-medium">本人</p>
              <Field label="生まれ年" value={form.birthYearSelf} onChange={(v) => set("birthYearSelf", v)} />
              <Field label="基本年収 (万円)" value={form.baseSalaryself} onChange={(v) => set("baseSalaryself", v)} />
              <Field label="退職年齢" value={form.retirementAgeSelf} onChange={(v) => set("retirementAgeSelf", v)} />
              <Field label="年金開始年齢" value={form.pensionAgeSelf} onChange={(v) => set("pensionAgeSelf", v)} />
              <Field label="年金額 (万円/年)" value={form.pensionSelf} onChange={(v) => set("pensionSelf", v)} />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">配偶者</p>
              <Field label="生まれ年" value={form.birthYearSpouse} onChange={(v) => set("birthYearSpouse", v)} />
              <Field label="基本年収 (万円)" value={form.baseSalarySpouse} onChange={(v) => set("baseSalarySpouse", v)} />
              <Field label="退職年齢" value={form.retirementAgeSpouse} onChange={(v) => set("retirementAgeSpouse", v)} />
              <Field label="年金開始年齢" value={form.pensionAgeSpouse} onChange={(v) => set("pensionAgeSpouse", v)} />
              <Field label="年金額 (万円/年)" value={form.pensionSpouse} onChange={(v) => set("pensionSpouse", v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="子1 生まれ年" value={form.birthYearChild1} onChange={(v) => set("birthYearChild1", v)} />
            <Field label="子2 生まれ年" value={form.birthYearChild2} onChange={(v) => set("birthYearChild2", v)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="現在の口座残高 (万円)" value={form.initialCash} onChange={(v) => set("initialCash", v)} />
            <Field label="現在の運用残高 (万円)" value={form.initialInvestment} onChange={(v) => set("initialInvestment", v)} />
            <Field label="運用利回り (%)" value={form.investmentRate} onChange={(v) => set("investmentRate", v)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="生活費 (万円/年)" value={form.annualLivingCost} onChange={(v) => set("annualLivingCost", v)} />
            <Field label="住宅関連費 (万円/年)" value={form.annualHousingCost} onChange={(v) => set("annualHousingCost", v)} />
            <Field label="保険料 (万円/年)" value={form.annualInsurance} onChange={(v) => set("annualInsurance", v)} />
          </div>

          <Button onClick={handleSubmit} disabled={loading || !form.name.trim()} className="w-full">
            {loading ? "作成中..." : "プランを作成"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
