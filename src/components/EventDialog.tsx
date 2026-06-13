"use client";

import { useState } from "react";
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
};

const NumField = ({
  label, value, onChange, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; hint?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}{hint && <span className="text-muted-foreground ml-1">{hint}</span>}</Label>
    <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8 text-sm" />
  </div>
);

export const EventDialog = ({ open, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<EventFormData>(initialData ?? DEFAULT_EVENT);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
    setForm(DEFAULT_EVENT);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "イベントを編集" : "イベントを追加"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="text-xs">本人年齢（発生時）</Label>
            <Input type="number" className="col-span-2 h-8 text-sm" value={form.ageSelf}
              onChange={(e) => set("ageSelf", Number(e.target.value))} />
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

          <p className="text-xs font-medium text-muted-foreground pt-1">── 収入（万円）──</p>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="本人年収変化" hint="以降毎年" value={form.salaryChangeSelf} onChange={(v) => set("salaryChangeSelf", v)} />
            <NumField label="配偶者年収変化" hint="以降毎年" value={form.salaryChangeSpouse} onChange={(v) => set("salaryChangeSpouse", v)} />
            <NumField label="臨時収入" hint="その年のみ" value={form.temporaryIncome} onChange={(v) => set("temporaryIncome", v)} />
            <NumField label="住宅ローン控除" hint="その年のみ" value={form.mortgageDeduction} onChange={(v) => set("mortgageDeduction", v)} />
            <NumField label="児童手当変化" hint="以降毎年" value={form.childAllowanceChange} onChange={(v) => set("childAllowanceChange", v)} />
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">── 支出（万円）──</p>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="イベント支出" hint="その年のみ" value={form.eventExpense} onChange={(v) => set("eventExpense", v)} />
            <NumField label="教育費変化" hint="以降毎年" value={form.educationCostChange} onChange={(v) => set("educationCostChange", v)} />
            <NumField label="借入返済変化" hint="以降毎年" value={form.loanRepaymentChange} onChange={(v) => set("loanRepaymentChange", v)} />
            <NumField label="車費用変化" hint="以降毎年" value={form.carCostChange} onChange={(v) => set("carCostChange", v)} />
            <NumField label="NISA変化" hint="以降毎年" value={form.nisaChange} onChange={(v) => set("nisaChange", v)} />
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
