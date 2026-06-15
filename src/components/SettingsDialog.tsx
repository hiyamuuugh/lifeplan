"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Plan } from "@/generated/prisma";

type SettingsFormData = {
  nameSelf: string;
  nameSpouse: string;
  nameChild1: string;
  nameChild2: string;
  salaryGrowthRateSelf: number;
  salaryGrowthRateSpouse: number;
  livingCostGrowthRate: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  plan: Plan;
  onSaved: (updated: Plan) => void;
};

const Section = ({ title }: { title: string }) => (
  <p className="text-xs font-semibold text-muted-foreground pt-2 pb-1 border-b">{title}</p>
);

export const SettingsDialog = ({ open, onClose, plan, onSaved }: Props) => {
  const [form, setForm] = useState<SettingsFormData>({
    nameSelf: plan.nameSelf ?? "",
    nameSpouse: plan.nameSpouse ?? "",
    nameChild1: plan.nameChild1 ?? "",
    nameChild2: plan.nameChild2 ?? "",
    salaryGrowthRateSelf: plan.salaryGrowthRateSelf ?? 0,
    salaryGrowthRateSpouse: plan.salaryGrowthRateSpouse ?? 0,
    livingCostGrowthRate: plan.livingCostGrowthRate ?? 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nameSelf: plan.nameSelf ?? "",
        nameSpouse: plan.nameSpouse ?? "",
        nameChild1: plan.nameChild1 ?? "",
        nameChild2: plan.nameChild2 ?? "",
        salaryGrowthRateSelf: plan.salaryGrowthRateSelf ?? 0,
        salaryGrowthRateSpouse: plan.salaryGrowthRateSpouse ?? 0,
        livingCostGrowthRate: plan.livingCostGrowthRate ?? 0,
      });
    }
  }, [open, plan]);

  const set = <K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch(`/api/plans/${plan.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameSelf: form.nameSelf || null,
        nameSpouse: form.nameSpouse || null,
        nameChild1: form.nameChild1 || null,
        nameChild2: form.nameChild2 || null,
        salaryGrowthRateSelf: form.salaryGrowthRateSelf,
        salaryGrowthRateSpouse: form.salaryGrowthRateSpouse,
        livingCostGrowthRate: form.livingCostGrowthRate,
      }),
    });
    const updated: Plan = await res.json();
    setLoading(false);
    onSaved(updated);
    onClose();
  };

  const hasChild1 = !!plan.birthYearChild1;
  const hasChild2 = !!plan.birthYearChild2;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">

          <Section title="家族の名前" />
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">本人</Label>
            <Input
              className="col-span-2 h-8 text-sm"
              value={form.nameSelf}
              onChange={(e) => set("nameSelf", e.target.value)}
              placeholder="本人"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">配偶者</Label>
            <Input
              className="col-span-2 h-8 text-sm"
              value={form.nameSpouse}
              onChange={(e) => set("nameSpouse", e.target.value)}
              placeholder="配偶者"
            />
          </div>
          {hasChild1 && (
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs">子1</Label>
              <Input
                className="col-span-2 h-8 text-sm"
                value={form.nameChild1}
                onChange={(e) => set("nameChild1", e.target.value)}
                placeholder="子1"
              />
            </div>
          )}
          {hasChild2 && (
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs">子2</Label>
              <Input
                className="col-span-2 h-8 text-sm"
                value={form.nameChild2}
                onChange={(e) => set("nameChild2", e.target.value)}
                placeholder="子2"
              />
            </div>
          )}

          <Section title="給与の計算式" />
          <p className="text-[11px] text-muted-foreground">基本年収からの毎年の上昇率（%）を設定します。</p>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">{form.nameSelf || "本人"}年収 上昇率</Label>
            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                className="h-8 text-sm"
                value={form.salaryGrowthRateSelf}
                onChange={(e) => set("salaryGrowthRateSelf", Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">% / 年</span>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">{form.nameSpouse || "配偶者"}年収 上昇率</Label>
            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                className="h-8 text-sm"
                value={form.salaryGrowthRateSpouse}
                onChange={(e) => set("salaryGrowthRateSpouse", Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">% / 年</span>
            </div>
          </div>

          <Section title="支出の計算式" />
          <p className="text-[11px] text-muted-foreground">生活費の毎年の上昇率（インフレ想定）を設定します。</p>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">生活費 上昇率</Label>
            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                className="h-8 text-sm"
                value={form.livingCostGrowthRate}
                onChange={(e) => set("livingCostGrowthRate", Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">% / 年</span>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
