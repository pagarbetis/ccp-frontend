import React, { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { labelOf, PLATFORMS, FORMATS, PRIORITIES } from "@/lib/constants";

export default function ContentFields({
  values = {},
  onChange,
  errors = {},
  channels = [],
  editors,
  readOnly,
  showPublishedUrl,
}) {
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

  const set = (name) => (value) => onChange(name, value);

  let dateValue = undefined;
  if (values.scheduled_date) {
    const parsed = parseISO(values.scheduled_date);
    if (isValid(parsed)) dateValue = parsed;
  }

  return (
    <div className="min-w-0 space-y-5">
      <Field label="Judul" error={errors.title}>
        <Input
          value={values.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          readOnly={readOnly}
          placeholder="Contoh: 5 kesalahan pemula saat editing"
          className={`h-10 rounded-xl transition-colors disabled:opacity-100 ${
            isDarkMode
              ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
          }`}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Channel tujuan" error={errors.channel_id}>
          <Select
            value={values.channel_id ? String(values.channel_id) : ""}
            onValueChange={set("channel_id")}
            disabled={readOnly}
          >
            <SelectTrigger
              className={`h-10 rounded-xl transition-colors ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Pilih channel" />
            </SelectTrigger>
            <SelectContent
              className={
                isDarkMode
                  ? "border-slate-800 bg-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }
            >
              {channels.map((channel) => (
                <SelectItem
                  key={channel.id}
                  value={String(channel.id)}
                  className={
                    isDarkMode
                      ? "focus:bg-slate-800 focus:text-slate-100"
                      : "focus:bg-slate-100 focus:text-slate-900"
                  }
                >
                  {labelOf(PLATFORMS, channel.platform)}{" "}
                  {channel.handle_name || channel.handleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Format" error={errors.format_type}>
          <Select
            value={values.format_type || ""}
            onValueChange={set("format_type")}
            disabled={readOnly}
          >
            <SelectTrigger
              className={`h-10 rounded-xl transition-colors ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Pilih format" />
            </SelectTrigger>
            <SelectContent
              className={
                isDarkMode
                  ? "border-slate-800 bg-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }
            >
              {FORMATS.map((format) => (
                <SelectItem
                  key={format.value}
                  value={format.value}
                  className={
                    isDarkMode
                      ? "focus:bg-slate-800 focus:text-slate-100"
                      : "focus:bg-slate-100 focus:text-slate-900"
                  }
                >
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Prioritas" error={errors.priority}>
          <Select
            value={values.priority || "sedang"}
            onValueChange={set("priority")}
            disabled={readOnly}
          >
            <SelectTrigger
              className={`h-10 rounded-xl transition-colors ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={
                isDarkMode
                  ? "border-slate-800 bg-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }
            >
              {PRIORITIES.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className={
                    isDarkMode
                      ? "focus:bg-slate-800 focus:text-slate-100"
                      : "focus:bg-slate-100 focus:text-slate-900"
                  }
                >
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Target tanggal tayang" error={errors.scheduled_date}>
          <Popover>
            <PopoverTrigger asChild disabled={readOnly}>
              <Button
                variant="outline"
                disabled={readOnly}
                className={cn(
                  "w-full h-10 px-3 justify-between text-left font-normal rounded-xl transition-colors",
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900 hover:text-white focus-visible:ring-blue-500"
                    : "border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-blue-500 shadow-sm",
                  !dateValue &&
                    (isDarkMode ? "text-slate-500" : "text-slate-400"),
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon
                    className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  />
                  {dateValue ? (
                    format(dateValue, "dd/MM/yyyy")
                  ) : (
                    <span>Pilih tanggal tayang</span>
                  )}
                </span>
                {dateValue && !readOnly && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange("scheduled_date", "");
                    }}
                    className={`p-1 transition-colors rounded-md ${
                      isDarkMode
                        ? "hover:text-red-400 text-slate-400"
                        : "hover:text-red-600 text-slate-500"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            {!readOnly && (
              <PopoverContent
                className={`w-auto p-0 shadow-2xl rounded-2xl ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900 text-slate-100"
                    : "border-slate-200 bg-white text-slate-900 shadow-xl"
                }`}
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      const formatted = format(selectedDate, "yyyy-MM-dd");
                      onChange("scheduled_date", formatted);
                    } else {
                      onChange("scheduled_date", "");
                    }
                  }}
                  initialFocus
                  className={`p-3 rounded-2xl ${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
                />
              </PopoverContent>
            )}
          </Popover>
        </Field>

        {editors && (
          <Field
            label="Editor"
            error={errors.editor_id}
            hint={
              readOnly ? undefined : "Kosongkan jika kamu mengedit sendiri."
            }
          >
            <Select
              value={values.editor_id ? String(values.editor_id) : "none"}
              onValueChange={(val) =>
                onChange("editor_id", val === "none" ? "" : val)
              }
              disabled={readOnly}
            >
              <SelectTrigger
                className={`h-10 rounded-xl transition-colors ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500"
                    : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500"
                }`}
              >
                <SelectValue placeholder="Tanpa editor" />
              </SelectTrigger>
              <SelectContent
                className={
                  isDarkMode
                    ? "border-slate-800 bg-slate-900 text-slate-100"
                    : "border-slate-200 bg-white text-slate-900"
                }
              >
                <SelectItem
                  value="none"
                  className={
                    isDarkMode
                      ? "focus:bg-slate-800 focus:text-slate-100"
                      : "focus:bg-slate-100 focus:text-slate-900"
                  }
                >
                  Tanpa editor
                </SelectItem>
                {editors.map((editor) => (
                  <SelectItem
                    key={editor.id}
                    value={String(editor.id)}
                    className={
                      isDarkMode
                        ? "focus:bg-slate-800 focus:text-slate-100"
                        : "focus:bg-slate-100 focus:text-slate-900"
                    }
                  >
                    {editor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>

      <Field label="Konsep singkat" error={errors.description}>
        <Textarea
          value={values.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          readOnly={readOnly}
          rows={3}
          placeholder="Tuliskan ringkasan ide konten..."
          className={`rounded-xl transition-colors ${
            isDarkMode
              ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
          }`}
        />
      </Field>

      <Field
        label="Naskah"
        error={errors.script_draft}
        hint={
          readOnly
            ? "Draf naskah dari pembuat konten (Read-Only)."
            : "Hook, alur cerita, atau naskah lengkap."
        }
      >
        <Textarea
          value={values.script_draft || ""}
          onChange={(e) =>
            !readOnly && onChange("script_draft", e.target.value)
          }
          readOnly={readOnly}
          rows={16}
          placeholder="Belum ada draf naskah..."
          className={`font-mono text-sm rounded-xl transition-colors min-h-[250px] ${
            isDarkMode
              ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
          }`}
        />
      </Field>

      {showPublishedUrl && (
        <Field
          label="Link postingan"
          error={errors.published_url}
          hint="Wajib diisi sebelum konten ditandai Tayang."
        >
          <Input
            type="url"
            value={values.published_url || ""}
            onChange={(e) => onChange("published_url", e.target.value)}
            readOnly={readOnly}
            placeholder="https://"
            className={`h-10 rounded-xl transition-colors ${
              isDarkMode
                ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
                : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
            }`}
          />
        </Field>
      )}
    </div>
  );
}
