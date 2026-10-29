import { useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate, formatNumber, todayString } from "@/lib/utils";
import React from "react";

const COUNT_FIELDS = [
  { name: "viewsCount", label: "Views" },
  { name: "likesCount", label: "Likes" },
  { name: "commentsCount", label: "Komentar" },
  { name: "sharesCount", label: "Share" },
];

const emptyForm = () => ({
  recordedAt: todayString(),
  viewsCount: "",
  likesCount: "",
  commentsCount: "",
  sharesCount: "",
});

export default function MetricsPanel({ contentId, isPublished, metrics = [], onChange }) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!isPublished) {
    return (
      <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">Metrik Performa</CardTitle>
          <CardDescription className="text-slate-400">Riwayat performa konten</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-2 text-sm text-slate-500">
            Metrik bisa dicatat setelah konten ditandai Tayang.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        recordedAt: form.recordedAt,
        viewsCount: form.viewsCount === "" ? 0 : Number(form.viewsCount),
        likesCount: form.likesCount === "" ? 0 : Number(form.likesCount),
        commentsCount: form.commentsCount === "" ? 0 : Number(form.commentsCount),
        sharesCount: form.sharesCount === "" ? 0 : Number(form.sharesCount),
      };

      const metric = await api.addMetric(contentId, payload);
      
      // Urutkan dari tanggal terbaru pakai recordedAt
      onChange([metric, ...metrics].sort((a, b) => {
        const dateA = a.recordedAt || a.recorded_at || "";
        const dateB = b.recordedAt || b.recorded_at || "";
        return dateB.localeCompare(dateA);
      }));

      setForm(emptyForm());
      toast.success("Metrik berhasil disimpan ke database!");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message || "Gagal mencatat metrik.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">Metrik Performa</CardTitle>
        <CardDescription className="text-slate-400">Catat dan pantau perkembangan metrik konten secara berkala</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid items-end grid-cols-2 gap-3 sm:grid-cols-5">
          <Field label="Tanggal" error={errors.recordedAt || errors.recorded_at} className="text-slate-300">
            <Input
              type="date"
              value={form.recordedAt}
              onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
              className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
            />
          </Field>
          {COUNT_FIELDS.map((field) => (
            <Field key={field.name} label={field.label} error={errors[field.name]} className="text-slate-300">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              />
            </Field>
          ))}
          <div className="col-span-2 pt-2 sm:col-span-5">
            <Button 
              type="submit" 
              variant="outline" 
              disabled={saving}
              className="h-10 px-6 font-medium border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              {saving ? "Menyimpan..." : "Catat metrik"}
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto border rounded-xl border-slate-800 bg-slate-950/60">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-slate-800 bg-slate-900/90 text-slate-400">
              <tr>
                <th className="px-3.5 py-3 font-semibold">Tanggal</th>
                {COUNT_FIELDS.map((field) => (
                  <th key={field.name} className="px-3.5 py-3 text-right font-semibold">{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.map((metric) => {
                const recDate = metric.recordedAt || metric.recorded_at;
                return (
                  <tr key={metric.id} className="transition-colors hover:bg-slate-800/30">
                    <td className="px-3.5 py-3 text-slate-300">{recDate ? formatDate(recDate) : "-"}</td>
                    {COUNT_FIELDS.map((field) => {
                      const val = metric[field.name] ?? metric[field.name.replace('Count', '_count')] ?? 0;
                      return (
                        <td key={field.name} className="px-3.5 py-3 text-right tabular-nums text-slate-200">
                          {formatNumber(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {metrics.length === 0 && (
            <p className="px-4 py-8 text-sm text-center text-slate-500">
              Belum ada catatan. Isi angka dari dashboard platform secara berkala.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}