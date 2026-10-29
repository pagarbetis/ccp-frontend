import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import Checklist from "@/components/Checklist";
import ContentFields from "@/components/ContentFields";
import DeleteContentDialog from "@/components/DeleteContentDialog";
import MetricsPanel from "@/components/MetricsPanel";
import ReviewPanel from "@/components/ReviewPanel";
import StageBar from "@/components/StageBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { labelOf, STAGES, canTransition } from "@/lib/constants";

// Tahap berikutnya yang dipindah dengan tombol biasa.
const NEXT_STAGE = {
  idea: "scripting",
  scripting: "recording",
  recording: "editing",
  ready: "published",
};

// Data dari API -> nilai form
function toFormValues(content) {
  return {
    title: content.title,
    channel_id: String(content.channel_id),
    editor_id: content.editor_id ? String(content.editor_id) : "",
    format_type: content.format_type,
    priority: content.priority,
    scheduled_date: content.scheduled_date ?? "",
    description: content.description ?? "",
    script_draft: content.script_draft ?? "",
    published_url: content.published_url ?? "",
  };
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

  if (!content)
    return <p className="text-muted-foreground">Memuat konten...</p>;

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

  // Cari nama channel berdasarkan channel_id
  const currentChannel = channels.find((c) => String(c.id) === String(values?.channel_id)) || content.channel;

  return (
    <div className="space-y-6">
      {/* Top Nav & Action Header */}
      <div>
        <Link
          to="/contents"
          className="inline-flex items-center gap-1 mb-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Semua konten
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {content.title}
          </h1>
          {!isEditor && (
            <DeleteContentDialog content={content} onConfirm={handleDelete} />
          )}
        </div>
      </div>

      {/* Stage Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Status & Progress
          </CardTitle>
          <CardDescription>Tahapan alur kerja konten saat ini</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <StageBar status={content.status} />
          {canAdvance && (
            <Button
              size="sm"
              disabled={saving}
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
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Main Form Fields Card / Read-only View jika sudah Published */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isPublished ? "Informasi Konten" : "Detail Konten"}
              </CardTitle>
              <CardDescription>
                {isPublished
                  ? "Konten sudah tayang dan dipublikasikan"
                  : "Kelola informasi utama dan draf skrip konten"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPublished ? (
                /* 🔥 TAMPILAN RINGKAS (JUDUL & CHANNEL) JIKA SUDAH TAYANG */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Judul</span>
                    <p className="text-base font-medium text-foreground mt-0.5">{content.title}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Channel Tujuan</span>
                    <p className="text-base font-medium text-foreground mt-0.5">
                      {currentChannel ? currentChannel.name : "-"}
                    </p>
                  </div>
                  {content.published_url && (
                    <div>
                      <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Link Postingan</span>
                      <p className="mt-0.5">
                        <a 
                          href={content.published_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-medium underline text-primary"
                        >
                          {content.published_url}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* 📝 FORM NORMAL JIKA BELUM TAYANG */
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
                    <Button type="submit" className="mt-6" disabled={saving}>
                      {saving ? "Menyimpan..." : "Simpan perubahan"}
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Metrics Panel (Muncul otomatis jika sudah published) */}
          {!isEditor && (
            <MetricsPanel
              contentId={content.id}
              isPublished={isPublished}
              metrics={content.metrics}
              onChange={(metrics) => applyUpdate({ metrics })}
            />
          )}
        </div>

        <aside className="space-y-6">
          {/* Review Panel */}
          <ReviewPanel
            key={content.status}
            content={content}
            onUpdated={applyUpdate}
          />

          {/* Checklist Panel */}
          <Checklist
            contentId={content.id}
            items={content.checklists}
            onChange={(checklists) => applyUpdate({ checklists })}
          />
        </aside>
      </div>
    </div>
  );
}