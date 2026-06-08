"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LIFE_EVENT_CATEGORIES,
  type LifeEventCategory,
  type LifeEventFormData,
} from "@/types/life-plan";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LifeEventFormData) => Promise<void>;
  initialData?: LifeEventFormData;
};

const DEFAULT_FORM: LifeEventFormData = {
  age: 30,
  title: "",
  description: "",
  income: 0,
  expense: 0,
  category: "other",
};

export const EventDialog = ({ open, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<LifeEventFormData>(initialData ?? DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
    setForm(DEFAULT_FORM);
    onClose();
  };

  const set = <K extends keyof LifeEventFormData>(key: K, value: LifeEventFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "イベントを編集" : "イベントを追加"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>年齢</Label>
            <Input
              type="number"
              className="col-span-2"
              value={form.age}
              onChange={(e) => set("age", Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>タイトル</Label>
            <Input
              className="col-span-2"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="例: 住宅購入"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>カテゴリ</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v as LifeEventCategory)}
            >
              <SelectTrigger className="col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIFE_EVENT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>収入増 (万円)</Label>
            <Input
              type="number"
              className="col-span-2"
              value={form.income}
              onChange={(e) => set("income", Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>支出 (万円)</Label>
            <Input
              type="number"
              className="col-span-2"
              value={form.expense}
              onChange={(e) => set("expense", Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>メモ</Label>
            <Input
              className="col-span-2"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="任意"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
