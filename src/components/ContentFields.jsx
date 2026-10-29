import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { labelOf, PLATFORMS, FORMATS, PRIORITIES } from "@/lib/constants";

export default function ContentFields({ values = {}, onChange, errors = {}, channels = [], editors, readOnly, showPublishedUrl }) {
  const set = (name) => (event) => onChange(name, event.target.value);

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
          onChange={set("title")} 
          placeholder="Contoh: 5 kesalahan pemula saat editing" 
          className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Channel tujuan" error={errors.channel_id}>
          <Select 
            value={values.channel_id || ""} 
            onChange={set("channel_id")}
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id} className="bg-slate-900 text-slate-100">
                {labelOf(PLATFORMS, channel.platform)} {channel.handle_name || channel.handleName}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Format" error={errors.format_type}>
          <Select 
            value={values.format_type || ""} 
            onChange={set("format_type")}
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih format</option>
            {FORMATS.map((format) => (
              <option key={format.value} value={format.value} className="bg-slate-900 text-slate-100">{format.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Prioritas" error={errors.priority}>
          <Select 
            value={values.priority || "sedang"} 
            onChange={set("priority")}
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value} className="bg-slate-900 text-slate-100">{priority.label}</option>
            ))}
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
                  !dateValue && "text-slate-500"
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pilih tanggal tayang</span>}
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
            <PopoverContent className="w-auto p-0 shadow-2xl border-slate-800 bg-slate-900 text-slate-100 rounded-xl" align="start">
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
              value={values.editor_id || ""} 
              onChange={set("editor_id")}
              className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
            >
              <option value="" className="bg-slate-900 text-slate-400">Tanpa editor</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id} className="bg-slate-900 text-slate-100">{editor.name}</option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <Field label="Konsep singkat" error={errors.description}>
        <Textarea 
          value={values.description || ""} 
          onChange={set("description")} 
          rows={3} 
          className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
          placeholder="Tuliskan ringkasan ide konten..."
        />
      </Field>

      <Field label="Naskah" error={errors.script_draft} hint={readOnly ? undefined : "Hook, alur cerita, atau naskah lengkap."}>
        <Textarea 
          value={values.script_draft || ""} 
          onChange={set("script_draft")} 
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
            onChange={set("published_url")}
            placeholder="https://"
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
          />
        </Field>
      )}
    </fieldset>
  );
}