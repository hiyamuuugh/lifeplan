"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  baseAnnualIncome: number;
  baseAnnualExpense: number;
  initialAsset: number;
  onChange: (key: "baseAnnualIncome" | "baseAnnualExpense" | "initialAsset", value: number) => void;
};

export const BaseSettings = ({ baseAnnualIncome, baseAnnualExpense, initialAsset, onChange }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">基本設定</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1">
        <Label>現在の年収 (万円)</Label>
        <Input
          type="number"
          value={baseAnnualIncome}
          onChange={(e) => onChange("baseAnnualIncome", Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>年間支出 (万円)</Label>
        <Input
          type="number"
          value={baseAnnualExpense}
          onChange={(e) => onChange("baseAnnualExpense", Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>現在の資産 (万円)</Label>
        <Input
          type="number"
          value={initialAsset}
          onChange={(e) => onChange("initialAsset", Number(e.target.value))}
        />
      </div>
    </CardContent>
  </Card>
);
