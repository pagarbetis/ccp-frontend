import React from "react";
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
  // Helper untuk shadcn Select onValueChange (menerima langsung valuenya)
  const set = (name) => (value) => onChange(name, value);

  // Parse string YYYY-MM-DD ke objek Date dengan aman
  let dateValue = undefined;
  if (values.scheduled_date) {
    const parsed = parseISO(values.scheduled_date);
    if (isValid(parsed)) dateValue = parsed;
  }

  return (
    <fieldset disabled={readOnly} className="min-w-0 space-y-5">
      <Field label="Judul" error={errors.title}>
        <Input
          value={values.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Contoh: 5 kesalahan pemula saat editing"
          className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Channel tujuan" error={errors.channel_id}>
          <Select
            value={values.channel_id ? String(values.channel_id) : ""}
            onValueChange={set("channel_id")}
          >
            <SelectTrigger className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500">
              <SelectValue placeholder="Pilih channel" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              {channels.map((channel) => (
                <SelectItem
                  key={channel.id}
                  value={String(channel.id)}
                  className="focus:bg-slate-800 focus:text-slate-100"
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
          >
            <SelectTrigger className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500">
              <SelectValue placeholder="Pilih format" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              {FORMATS.map((format) => (
                <SelectItem
                  key={format.value}
                  value={format.value}
                  className="focus:bg-slate-800 focus:text-slate-100"
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
          >
            <SelectTrigger className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              {PRIORITIES.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className="focus:bg-slate-800 focus:text-slate-100"
                >
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* 🔥 CUSTOM POPOVER CALENDAR SHADCN UI */}
        <Field label="Target tanggal tayang" error={errors.scheduled_date}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-10 px-3 justify-between text-left font-normal border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900 hover:text-white focus-visible:ring-blue-500",
                  !dateValue && "text-slate-500",
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {dateValue ? (
                    format(dateValue, "dd/MM/yyyy")
                  ) : (
                    <span>Pilih tanggal tayang</span>
                  )}
                </span>
                {dateValue && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange("scheduled_date", "");
                    }}
                    className="p-1 transition-colors rounded-md hover:text-red-400 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 shadow-2xl border-slate-800 bg-slate-900 text-slate-100 rounded-xl"
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
                className="p-3 bg-slate-900 text-slate-100 rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </Field>

        {editors && (
          <Field
            label="Editor"
            error={errors.editor_id}
            hint="Kosongkan jika kamu mengedit sendiri."
          >
            <Select
              value={values.editor_id ? String(values.editor_id) : "none"}
              onValueChange={(val) =>
                onChange("editor_id", val === "none" ? "" : val)
              }
            >
              <SelectTrigger className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500">
                <SelectValue placeholder="Tanpa editor" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                <SelectItem
                  value="none"
                  className="focus:bg-slate-800 focus:text-slate-100"
                >
                  Tanpa editor
                </SelectItem>
                {editors.map((editor) => (
                  <SelectItem
                    key={editor.id}
                    value={String(editor.id)}
                    className="focus:bg-slate-800 focus:text-slate-100"
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
          rows={3}
          className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
          placeholder="Tuliskan ringkasan ide konten..."
        />
      </Field>

      <Field
        label="Naskah"
        error={errors.script_draft}
        hint={readOnly ? undefined : "Hook, alur cerita, atau naskah lengkap."}
      >
        <Textarea
          value={values.script_draft || ""}
          onChange={(e) => onChange("script_draft", e.target.value)}
          rows={8}
          className="font-mono text-sm border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
          placeholder="Tulis draf naskah di sini..."
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
            placeholder="https://"
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
          />
        </Field>
      )}
    </fieldset>
  );
}
