import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlaySquare, ExternalLink, Video } from "lucide-react";
import { toast } from "sonner";

import Checklist from "@/components/Checklist";
import DeleteContentDialog from "@/components/DeleteContentDialog";
import MetricsPanel from "@/components/MetricsPanel";
import ReviewPanel from "@/components/ReviewPanel";
import StageBar from "@/components/StageBar";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { labelOf, STAGES, canTransition, PLATFORMS, FORMATS, PRIORITIES } from "@/lib/constants";

// Tahap berikutnya yang dipindah dengan tombol biasa.
const NEXT_STAGE = {
  idea: "scripting",
  scripting: "recording",
  recording: "editing",
  ready: "published",
};

// Data dari API -> nilai form
function toFormValues(content) {
  const pubUrl = content.published_url ?? content.publishedUrl ?? "";
  return {
    title: content.title || "",
    channel_id: content.channel_id ? String(content.channel_id) : "",
    editor_id: content.editor_id ? String(content.editor_id) : "",
    format_type: content.format_type || "",
    priority: content.priority || "sedang",
    scheduled_date: content.scheduled_date ?? "",
    description: content.description ?? "",
    script_draft: content.script_draft ?? "",
    published_url: pubUrl,
  };
}

function getEmbedDetails(url) {
  if (!url) return { type: null, embedUrl: null };
  try {
    const parsedUrl = new URL(url);

    // 1. Cek YouTube (Support Iframe)
    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return {
        type: "youtube",
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      };
    } else if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.slice(1);
      return {
        type: "youtube",
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      };
    }

    // 2. Cek TikTok
    if (parsedUrl.hostname.includes("tiktok.com") || parsedUrl.hostname.includes("vm.tiktok.com")) {
      return {
        type: "tiktok",
        embedUrl: url,
      };
    }

    // 3. Cek Instagram (Reels / Postingan)
    if (parsedUrl.hostname.includes("instagram.com")) {
      return {
        type: "instagram",
        embedUrl: url,
      };
    }
  } catch (e) {
    return { type: null, embedUrl: null };
  }
  return { type: null, embedUrl: null };
}

// Komponen form lokal
function ContentFields({ values = {}, onChange, errors = {}, channels = [], editors, readOnly, showPublishedUrl }) {
  const set = (name) => (event) => onChange(name, event.target.value);

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
                {labelOf(PLATFORMS, channel.platform)} {channel.handle_name}
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

        <Field label="Target tanggal tayang" error={errors.scheduled_date}>
          <Input 
            type="date" 
            value={values.scheduled_date || ""} 
            onChange={set("scheduled_date")} 
            className="h-10 border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500"
          />
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

export default function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditor = user.role === "editor";

  const [content, setContent] = useState(null);
  const [values, setValues] = useState(null);
  const [channels, setChannels] = useState([]);
  const [editors, setEditors] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([
      api.getContent(id),
      isEditor ? [] : api.getChannels(),
      isEditor ? [] : api.getUsers("editor"),
    ])
      .then(([contentData, channelData, editorData]) => {
        setContent(contentData);
        setValues(toFormValues(contentData));
        setChannels(isEditor ? [contentData.channel] : channelData);
        setEditors(editorData);
      })
      .catch((error) => {
        toast.error(error.message);
        navigate("/contents");
      });
  }, [id, isEditor, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!content || !values)
    return <p className="px-4 py-12 text-center text-slate-400">Memuat konten...</p>;

  const changeValue = (name, value) => setValues({ ...values, [name]: value });

  const applyUpdate = (updated) =>
    setContent((previous) => ({ ...previous, ...updated }));

  async function save(extra = {}, successMessage = "Perubahan disimpan") {
    setSaving(true);
    setErrors({});
    try {
      const updated = await api.updateContent(id, {
        ...values,
        channel_id: Number(values.channel_id),
        editor_id: Number(values.editor_id) || null,
        scheduled_date: values.scheduled_date || null,
        published_url: values.published_url || null,
        ...extra,
      });
      applyUpdate(updated);
      setValues(toFormValues(updated));
      loadData();
      toast.success(successMessage);
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    save();
  }

  async function handleDelete() {
    try {
      await api.deleteContent(id);
      toast.success("Konten dihapus");
      navigate("/contents");
    } catch (error) {
      toast.error(error.message);
    }
  }

  const nextStage = NEXT_STAGE[content.status];
  const canAdvance = nextStage && canTransition(user, content, nextStage);
  const isPublished = content.status === "published";
  
  const activePublishedUrl = content.published_url || content.publishedUrl || values.published_url;
  const { type: embedType, embedUrl } = getEmbedDetails(activePublishedUrl);
  
  const targetChannelId = values?.channel_id || content.channel_id;
  const currentChannel = channels.find((c) => String(c.id) === String(targetChannelId)) || content.channel;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Nav & Action Header */}
      <div>
        <Link
          to="/contents"
          className="inline-flex items-center gap-1.5 mb-3 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Semua konten
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {content.title}
          </h1>
          {!isEditor && (
            <DeleteContentDialog content={content} onConfirm={handleDelete} />
          )}
        </div>
      </div>

      {/* Stage Progress Card */}
      <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">
            Status & Progress
          </CardTitle>
          <CardDescription className="text-slate-400">Tahapan alur kerja konten saat ini</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <StageBar status={content.status} />
          {canAdvance && (
            <Button
              size="sm"
              disabled={saving}
              className="font-medium text-white bg-blue-600 shadow-md hover:bg-blue-500 shadow-blue-600/30"
              onClick={() =>
                save(
                  { status: nextStage },
                  `Tahap diubah ke ${labelOf(STAGES, nextStage)}`,
                )
              }
            >
              Lanjut ke {labelOf(STAGES, nextStage)}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Grid Content */}
      <div className={`grid gap-6 ${isPublished ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_22rem]"}`}>
        <div className="space-y-6">
          {/* INFORMASI KONTEN RINGKAS (MUNCUL JIKA PUBLISHED) */}
          {isPublished && (
            <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white">Informasi Konten</CardTitle>
                <CardDescription className="text-slate-400">Detail ringkas konten yang sudah tayang</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Judul</span>
                  <p className="text-base font-medium text-white mt-0.5">{content.title}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Channel Tujuan</span>
                  <p className="text-base font-medium text-white mt-0.5">
                    {currentChannel 
                      ? `${labelOf(PLATFORMS, currentChannel.platform)} ${currentChannel.handle_name || currentChannel.handleName || ""}`
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FORM UTAMA (MUNCUL JIKA BELUM PUBLISHED) */}
          {!isPublished && (
            <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Detail Konten</CardTitle>
                <CardDescription className="text-slate-400">Kelola informasi utama dan draf skrip konten</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <ContentFields
                    values={values}
                    onChange={changeValue}
                    errors={errors}
                    channels={channels}
                    editors={isEditor ? undefined : editors}
                    readOnly={isEditor}
                    showPublishedUrl={content.status === "ready"}
                  />
                  {!isEditor && (
                    <Button 
                      type="submit" 
                      className="px-6 mt-6 font-medium text-white bg-blue-600 shadow-lg hover:bg-blue-500 shadow-blue-600/25 h-11" 
                      disabled={saving}
                    >
                      {saving ? "Menyimpan..." : "Simpan perubahan"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* 🎬 CARD PRATINJAU VIDEO TAYANG (YOUTUBE / TIKTOK / INSTAGRAM) */}
          {isPublished && (
            <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <PlaySquare className="w-5 h-5 text-blue-400" />
                  Pratinjau Video Tayang {embedType ? `(${embedType.toUpperCase()})` : ""}
                </CardTitle>
                <CardDescription className="text-slate-400">Pemutar video otomatis dari tautan publikasi</CardDescription>
              </CardHeader>
              <CardContent>
                {embedType === "youtube" ? (
                  <div className="space-y-3">
                    <div className="relative w-full overflow-hidden border rounded-xl aspect-video bg-slate-950 border-slate-800">
                      <iframe
                        src={embedUrl}
                        title={content.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <a 
                      href={activePublishedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-xs font-medium text-center text-blue-400 underline truncate hover:text-blue-300"
                    >
                      {activePublishedUrl}
                    </a>
                  </div>
                ) : embedType === "tiktok" || embedType === "instagram" ? (
                  <div className="p-6 space-y-4 text-center border rounded-xl border-slate-800 bg-slate-950/70">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-blue-400 border rounded-full bg-slate-900 border-slate-800">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white">
                        {embedType === "tiktok" ? "Video TikTok Publikasi" : "Postingan / Reels Instagram"}
                      </h4>
                      <p className="max-w-md mx-auto mt-1 text-xs truncate text-slate-400">{activePublishedUrl}</p>
                    </div>
                    <div>
                      <a 
                        href={activePublishedUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Tonton di {embedType === "tiktok" ? "TikTok" : "Instagram"}
                      </a>
                    </div>
                  </div>
                ) : activePublishedUrl ? (
                  <div className="p-4 text-center border rounded-xl border-slate-800 bg-slate-950/50">
                    <p className="mb-2 text-sm text-slate-400">Format link tidak didukung.</p>
                    <a 
                      href={activePublishedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-400 underline hover:text-blue-300"
                    >
                      Buka tautan eksternal
                    </a>
                  </div>
                ) : (
                  <p className="py-4 text-sm italic text-center text-slate-500">
                    Belum ada link postingan yang ditambahkan.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metrics Panel */}
          {!isEditor && (
            <MetricsPanel
              contentId={content.id}
              isPublished={isPublished}
              metrics={content.metrics}
              onChange={(metrics) => applyUpdate({ metrics })}
            />
          )}
        </div>

        {/* ASIDE HANYA MUNCUL JIKA BELUM PUBLISHED */}
        {!isPublished && (
          <aside className="space-y-6">
            <ReviewPanel
              key={content.status}
              content={content}
              onUpdated={applyUpdate}
            />

            <Checklist
              contentId={content.id}
              items={content.checklists}
              onChange={(checklists) => applyUpdate({ checklists })}
            />
          </aside>
        )}
      </div>
    </div>
  );
}