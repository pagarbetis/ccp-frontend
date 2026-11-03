import { useState, useEffect } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatNumber, todayString } from "@/lib/utils";
import React from "react";
import { BarChart3 } from "lucide-react";

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

function safeFormatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID");
  } catch (e) {
    return dateStr;
  }
}

export default function MetricsPanel({
  contentId,
  isPublished,
  metrics = [],
  onChange,
}) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkMode(saved === "dark");
      }
    };

    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  if (!isPublished) {
    return (
      <Card
        className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
          isDarkMode
            ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <CardHeader className="pb-3">
          <CardTitle
            className={`flex items-center gap-2 text-base font-semibold ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Metrik Performa
          </CardTitle>
          <CardDescription
            className={isDarkMode ? "text-slate-400" : "text-slate-600"}
          >
            Riwayat performa konten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className={`py-2 text-sm ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
          >
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
        commentsCount:
          form.commentsCount === "" ? 0 : Number(form.commentsCount),
        sharesCount: form.sharesCount === "" ? 0 : Number(form.sharesCount),
      };

      const metric = await api.addMetric(contentId, payload);

      onChange(
        [metric, ...metrics].sort((a, b) => {
          const dateA = a.recordedAt || a.recorded_at || "";
          const dateB = b.recordedAt || b.recorded_at || "";
          return dateB.localeCompare(dateA);
        }),
      );

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
    <Card
      className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
        isDarkMode
          ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
          : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />

      <CardHeader
        className={`pb-4 mb-4 border-b ${
          isDarkMode ? "border-slate-800/60" : "border-slate-200"
        }`}
      >
        <CardTitle
          className={`flex items-center gap-2 text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Metrik Performa
        </CardTitle>
        <CardDescription
          className={isDarkMode ? "text-slate-400" : "text-slate-600"}
        >
          Catat dan pantau perkembangan metrik konten secara berkala
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="grid items-end grid-cols-2 gap-3 sm:grid-cols-5"
        >
          <Field
            label="Tanggal"
            error={errors.recordedAt || errors.recorded_at}
            className={isDarkMode ? "text-slate-300" : "text-slate-700"}
          >
            <Input
              type="date"
              value={form.recordedAt}
              onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
              className={`h-10 rounded-xl transition-colors ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus-visible:ring-blue-500"
              }`}
            />
          </Field>
          {COUNT_FIELDS.map((field) => (
            <Field
              key={field.name}
              label={field.label}
              error={errors[field.name]}
              className={isDarkMode ? "text-slate-300" : "text-slate-700"}
            >
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className={`h-10 rounded-xl transition-colors ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                }`}
              />
            </Field>
          ))}
          <div className="flex justify-end col-span-2 pt-2 sm:col-span-5">
            <Button
              type="submit"
              disabled={saving}
              className="px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              {saving ? "Menyimpan..." : "Catat metrik"}
            </Button>
          </div>
        </form>

        <div
          className={`overflow-x-auto border shadow-inner rounded-2xl ${
            isDarkMode
              ? "border-slate-800/80 bg-slate-950/50"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <table className="w-full text-sm">
            <thead
              className={`text-left border-b ${
                isDarkMode
                  ? "border-slate-800/80 bg-slate-900/90 text-slate-400"
                  : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                {COUNT_FIELDS.map((field) => (
                  <th
                    key={field.name}
                    className="px-4 py-3 font-semibold text-right"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-slate-800/60" : "divide-slate-200"}`}
            >
              {metrics.map((metric) => {
                const recDate = metric.recordedAt || metric.recorded_at;
                return (
                  <tr
                    key={metric.id}
                    className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-100/50"}`}
                  >
                    <td
                      className={`px-4 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      {safeFormatDate(recDate)}
                    </td>
                    {COUNT_FIELDS.map((field) => {
                      const val =
                        metric[field.name] ??
                        metric[field.name.replace("Count", "_count")] ??
                        0;
                      return (
                        <td
                          key={field.name}
                          className={`px-4 py-3 text-right tabular-nums ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
                        >
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
            <p
              className={`px-4 py-8 text-sm italic text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Belum ada catatan. Isi angka dari dashboard platform secara
              berkala.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
