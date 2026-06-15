"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type EventFormData, DEFAULT_EVENT } from "@/types/cashflow";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: EventFormData;
  birthYearSelf: number;
  birthYearSpouse: number;
  birthYearChild1?: number | null;
  birthYearChild2?: number | null;
};

const Badge = ({ label, type }: { label: string; type: "annual" | "once" }) => (
  <span className={`ml-1 inline-block rounded px-1 py-0 text-[10px] font-medium ${
    type === "annual"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
  }`}>
    {type === "annual" ? "以降毎年" : "その年のみ"}
  </span>
);

const NumField = ({
  label, value, onChange, type,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  type: "annual" | "once";
}) => (
  <div className="space-y-1">
    <Label className="text-xs flex items-center gap-1">
      {label}<Badge label={type === "annual" ? "以降毎年" : "その年のみ"} type={type} />
    </Label>
    <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8 text-sm" />
  </div>
);

const Section = ({ title }: { title: string }) => (
  <p className="text-xs font-semibold text-muted-foreground pt-2 pb-1 border-b">{title}</p>
);

export const EventDialog = ({
  open, onClose, onSubmit, initialData,
  birthYearSelf, birthYearSpouse, birthYearChild1, birthYearChild2,
}: Props) => {
  const [form, setForm] = useState<EventFormData>(initialData ?? DEFAULT_EVENT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData ?? DEFAULT_EVENT);
  }, [initialData, open]);

  const set = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
    onClose();
  };

  // 年齢から各家族の年齢・西暦を計算
  const year = birthYearSelf + form.ageSelf;
  const ageSpouse = form.ageSelf + (birthYearSpouse - birthYearSelf);
  const ageChild1 = birthYearChild1 ? year - birthYearChild1 : null;
  const ageChild2 = birthYearChild2 ? year - birthYearChild2 : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "イベントを編集" : "イベントを追加"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">

          {/* 年齢・西暦 */}
          <div className="grid grid-cols-3 items-start gap-2">
            <Label className="text-xs pt-2">本人年齢（発生時）</Label>
            <div className="col-span-2 space-y-1">
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.ageSelf}
                onChange={(e) => set("ageSelf", Number(e.target.value))}
              />
              {/* 家族年齢・西暦プレビュー */}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground pl-1">
                <span>📅 {year}年</span>
                <span>配偶者 {ageSpouse}歳</span>
                {ageChild1 !== null && <span>子1 {ageChild1}歳</span>}
                {ageChild2 !== null && <span>子2 {ageChild2}歳</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">タイトル</Label>
            <Input className="col-span-2 h-8 text-sm" value={form.title}
              onChange={(e) => set("title", e.target.value)} placeholder="例: マイホーム購入" />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">メモ</Label>
            <Input className="col-span-2 h-8 text-sm" value={form.note}
              onChange={(e) => set("note", e.target.value)} placeholder="任意" />
          </div>

          {/* 収入 */}
          <Section title="収入（万円）" />
          <div className="grid grid-cols-2 gap-2">
            <NumField label="本人年収変化" type="annual" value={form.salaryChangeSelf} onChange={(v) => set("salaryChangeSelf", v)} />
            <NumField label="配偶者年収変化" type="annual" value={form.salaryChangeSpouse} onChange={(v) => set("salaryChangeSpouse", v)} />
            <NumField label="臨時収入" type="once" value={form.temporaryIncome} onChange={(v) => set("temporaryIncome", v)} />
            <NumField label="児童手当変化" type="annual" value={form.childAllowanceChange} onChange={(v) => set("childAllowanceChange", v)} />
          </div>

          {/* 住宅ローン控除（期間設定） */}
          <div className="rounded-md border border-border/60 px-3 py-2 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">住宅ローン控除</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">控除額（万円/年）</Label>
                <Input type="number" className="h-8 text-sm" value={form.mortgageDeduction}
                  onChange={(e) => set("mortgageDeduction", Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">終了年齢（本人）<span className="text-muted-foreground ml-1">※空欄=1年のみ</span></Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={form.mortgageDeductionEndAge ?? ""}
                  placeholder={String(form.ageSelf)}
                  onChange={(e) => set("mortgageDeductionEndAge", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            </div>
            {form.mortgageDeduction > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {form.ageSelf}歳〜{form.mortgageDeductionEndAge ?? form.ageSelf}歳まで 毎年{form.mortgageDeduction}万円
              </p>
            )}
          </div>

          {/* 支出 */}
          <Section title="支出（万円）" />
          <div className="grid grid-cols-2 gap-2">
            <NumField label="イベント支出" type="once" value={form.eventExpense} onChange={(v) => set("eventExpense", v)} />
            <NumField label="生活費変化" type="annual" value={form.livingCostChange} onChange={(v) => set("livingCostChange", v)} />
            <NumField label="住宅関連費変化" type="annual" value={form.housingCostChange} onChange={(v) => set("housingCostChange", v)} />
            <NumField label="教育費変化" type="annual" value={form.educationCostChange} onChange={(v) => set("educationCostChange", v)} />
            <NumField label="借入返済変化" type="annual" value={form.loanRepaymentChange} onChange={(v) => set("loanRepaymentChange", v)} />
            <NumField label="保険料変化" type="annual" value={form.insuranceChange} onChange={(v) => set("insuranceChange", v)} />
            <NumField label="車費用変化" type="annual" value={form.carCostChange} onChange={(v) => set("carCostChange", v)} />
            <NumField label="NISA変化" type="annual" value={form.nisaChange} onChange={(v) => set("nisaChange", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
