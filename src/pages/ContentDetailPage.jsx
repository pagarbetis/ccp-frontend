import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  PlaySquare,
  FileText,
  ExternalLink,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { InstagramEmbed } from "react-social-media-embed";

import Checklist from "@/components/Checklist";
import DeleteContentDialog from "@/components/DeleteContentDialog";
import MetricsPanel from "@/components/MetricsPanel";
import ReviewPanel from "@/components/ReviewPanel";
import StageBar from "@/components/StageBar";
import ContentFields from "@/components/ContentFields";
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
import { labelOf, STAGES, canTransition, PLATFORMS } from "@/lib/constants";

const NEXT_STAGE = {
  idea: "scripting",
  scripting: "recording",
  recording: "editing",
  ready: "published",
};

function toFormValues(content) {
  const pubUrl = content.published_url ?? content.publishedUrl ?? "";
  return {
    title: content.title || "",
    channel_id: content.channel_id
      ? String(content.channel_id)
      : content.channelId
        ? String(content.channelId)
        : "",
    editor_id: content.editor_id
      ? String(content.editor_id)
      : content.editorId
        ? String(content.editorId)
        : "",
    format_type: content.format_type || content.formatType || "",
    priority: content.priority || "sedang",
    scheduled_date: content.scheduled_date ?? content.scheduledDate ?? "",
    description: content.description ?? "",
    script_draft: content.script_draft ?? content.scriptDraft ?? "",
    published_url: pubUrl,
  };
}

function getEmbedDetails(url) {
  if (!url) return { type: null, embedUrl: null };
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const videoId = hostname.includes("youtu.be")
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get("v");
      return {
        type: "youtube",
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : url,
      };
    }

    if (hostname.includes("tiktok.com") || url.includes("tiktok.com")) {
      return { type: "tiktok", embedUrl: url };
    }

    if (hostname.includes("instagram.com") || hostname.includes("instagr.am")) {
      return { type: "instagram", embedUrl: url };
    }
  } catch (e) {
    if (url.includes("tiktok.com")) {
      return { type: "tiktok", embedUrl: url };
    }
  }
  return { type: null, embedUrl: null };
}

function TikTokPlayer({ url, title, isDarkMode }) {
  const [embedHtml, setEmbedHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOEmbed() {
      if (!url) return;
      setLoading(true);
      try {
        const cleanUrl = url.match(/(https?:\/\/[^\s]+)/)?.[1] || url;
        const res = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`,
        );
        const data = await res.json();
        if (data && data.html) {
          setEmbedHtml(data.html);
        }
      } catch (e) {
        console.error("Gagal memuat TikTok oEmbed", e);
      }
      setLoading(false);
    }
    fetchOEmbed();
  }, [url]);

  useEffect(() => {
    if (embedHtml) {
      let scriptTag = document.querySelector(
        'script[src="https://www.tiktok.com/embed.js"]',
      );
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.src = "https://www.tiktok.com/embed.js";
        scriptTag.async = true;
        document.body.appendChild(scriptTag);
      } else if (window.tiktok && window.tiktok.embed) {
        try {
          window.tiktok.embed.lib.render();
        } catch (err) {}
      }
    }
  }, [embedHtml]);

  return (
    <div
      className={`flex flex-col items-center justify-center w-full overflow-y-auto border rounded-2xl p-4 min-h-[580px] shadow-inner transition-colors ${
        isDarkMode
          ? "bg-slate-950 border-slate-800/80"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      {loading ? (
        <p
          className={`text-sm animate-pulse ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Memuat pemutar TikTok...
        </p>
      ) : embedHtml ? (
        <div
          className="flex justify-center w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div
            className={`flex items-center justify-center w-12 h-12 text-blue-500 border rounded-2xl ${
              isDarkMode
                ? "bg-blue-500/10 border-blue-500/20"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <PlaySquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p
              className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {title || "Video TikTok"}
            </p>
            <p
              className={`max-w-xs text-xs truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {url}
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <span>Buka Video di TikTok</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
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
    return (
      <p
        className={`px-4 py-12 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Memuat detail konten...
      </p>
    );

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
  const isReadyOrPublished = content.status === "ready" || isPublished;

  const activePublishedUrl =
    content.published_url || content.publishedUrl || values.published_url;
  const { type: embedType, embedUrl } = getEmbedDetails(activePublishedUrl);

  const targetChannelId = values?.channel_id || content.channel_id;
  const currentChannel =
    channels.find((c) => String(c.id) === String(targetChannelId)) ||
    content.channel;

  return (
    <div
      className={`pb-12 mx-auto space-y-6 transition-colors duration-300 max-w-7xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
    >
      {/* Top Nav & Action Header */}
      <div className="flex flex-col gap-2">
        <Link
          to="/contents"
          className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors w-fit ${
            isDarkMode
              ? "text-slate-400 hover:text-white"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar konten
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-blue-500 uppercase">
              Detail Produksi
            </span>
            <h1
              className={`text-2xl font-bold tracking-tight sm:text-3xl line-clamp-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {content.title}
            </h1>
          </div>
          {!isEditor && (
            <DeleteContentDialog content={content} onConfirm={handleDelete} />
          )}
        </div>
      </div>

      <Card
        className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
          isDarkMode
            ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle
            className={`flex items-center gap-2 text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Status Alur Kerja
          </CardTitle>
          <CardDescription
            className={isDarkMode ? "text-slate-400" : "text-slate-600"}
          >
            Pantau dan teruskan tahapan produksi konten ke level berikutnya
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <StageBar status={content.status} />
          {canAdvance && (
            <Button
              size="sm"
              disabled={saving}
              className="font-medium text-white bg-blue-600 shadow-lg hover:bg-blue-500 shadow-blue-600/30 rounded-xl px-5 h-10 transition-all hover:scale-[1.02] cursor-pointer"
              onClick={() =>
                save(
                  { status: nextStage },
                  `Tahap diubah ke ${labelOf(STAGES, nextStage)}`,
                )
              }
            >
              Lanjut ke {labelOf(STAGES, nextStage)} &rarr;
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div
        className={`grid gap-6 ${isPublished ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_24rem]"}`}
      >
        <div className="space-y-6">
          {isReadyOrPublished && (
            <Card
              className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
                isDarkMode
                  ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
                  : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
              <CardHeader
                className={`pb-4 mb-4 border-b ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}
              >
                <CardTitle
                  className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <Link2 className="w-5 h-5 text-blue-500" />
                  {isPublished ? "Ringkasan Publikasi" : "Tautan Postingan"}
                </CardTitle>
                <CardDescription
                  className={isDarkMode ? "text-slate-400" : "text-slate-600"}
                >
                  {isPublished
                    ? "Informasi utama konten yang telah tayang"
                    : "Wajib diisi sebelum konten ditandai Tayang"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPublished ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div
                      className={`p-4 border rounded-2xl ${isDarkMode ? "bg-slate-950/50 border-slate-800/60" : "bg-slate-50 border-slate-200"}`}
                    >
                      <span
                        className={`text-[11px] font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Judul
                      </span>
                      <p
                        className={`mt-1 text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {content.title}
                      </p>
                    </div>
                    <div
                      className={`p-4 border rounded-2xl ${isDarkMode ? "bg-slate-950/50 border-slate-800/60" : "bg-slate-50 border-slate-200"}`}
                    >
                      <span
                        className={`text-[11px] font-semibold tracking-wider uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Channel Tujuan
                      </span>
                      <p
                        className={`mt-1 text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {currentChannel
                          ? `${labelOf(PLATFORMS, currentChannel.platform)} ${currentChannel.handle_name || currentChannel.handleName || ""}`
                          : "-"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}
                      >
                        Link postingan platform
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="url"
                          value={values.published_url || ""}
                          onChange={(e) =>
                            changeValue("published_url", e.target.value)
                          }
                          placeholder="https://"
                          disabled={isEditor}
                          className={`flex w-full px-3 py-2 text-sm border h-11 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isDarkMode
                              ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600"
                              : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 shadow-sm"
                          }`}
                        />
                        {!isEditor && (
                          <Button
                            type="submit"
                            disabled={saving}
                            className="px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            {saving ? "Menyimpan..." : "Simpan Link"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {!isPublished && (
            <Card
              className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
                isDarkMode
                  ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
                  : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
              <CardHeader
                className={`pb-4 mb-4 border-b ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}
              >
                <CardTitle
                  className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  Formulir Detail & Naskah
                </CardTitle>
                <CardDescription
                  className={isDarkMode ? "text-slate-400" : "text-slate-600"}
                >
                  Kelola informasi utama dan draf skrip secara terstruktur
                </CardDescription>
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
                    showPublishedUrl={false}
                  />
                  {!isEditor && (
                    <div
                      className={`flex justify-end pt-6 mt-6 border-t ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}
                    >
                      <Button
                        type="submit"
                        className="px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                        disabled={saving}
                      >
                        {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {isPublished && (
            <Card
              className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
                isDarkMode
                  ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
                  : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
              <CardHeader
                className={`pb-3 mb-4 border-b ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}
              >
                <CardTitle
                  className={`flex items-center gap-2 text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <PlaySquare className="w-5 h-5 text-blue-500" />
                  Pratinjau Video Tayang{" "}
                  {embedType ? `(${embedType.toUpperCase()})` : ""}
                </CardTitle>
                <CardDescription
                  className={isDarkMode ? "text-slate-400" : "text-slate-600"}
                >
                  Pemutar video otomatis langsung dari tautan publikasi platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {embedType === "youtube" ? (
                  <div className="space-y-3">
                    <div
                      className={`relative w-full overflow-hidden border shadow-xl rounded-2xl aspect-video ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}
                    >
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
                      className="block text-xs font-medium text-center text-blue-500 underline truncate hover:text-blue-600"
                    >
                      {activePublishedUrl}
                    </a>
                  </div>
                ) : embedType === "tiktok" ? (
                  <div className="space-y-3">
                    <TikTokPlayer
                      url={activePublishedUrl}
                      title={content.title}
                      isDarkMode={isDarkMode}
                    />
                    <a
                      href={activePublishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs font-medium text-center text-blue-500 underline truncate hover:text-blue-600"
                    >
                      {activePublishedUrl}
                    </a>
                  </div>
                ) : embedType === "instagram" ? (
                  <div className="space-y-3">
                    <div
                      className={`flex justify-center w-full p-2 overflow-hidden border shadow-xl rounded-2xl ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                    >
                      <InstagramEmbed url={activePublishedUrl} width={328} />
                    </div>
                    <a
                      href={activePublishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs font-medium text-center text-blue-500 underline truncate hover:text-blue-600"
                    >
                      {activePublishedUrl}
                    </a>
                  </div>
                ) : activePublishedUrl ? (
                  <div
                    className={`p-6 text-center border rounded-2xl ${isDarkMode ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <p
                      className={`mb-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Format link tidak didukung untuk pratinjau langsung.
                    </p>
                    <a
                      href={activePublishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-500 underline hover:text-blue-600"
                    >
                      Buka tautan eksternal &rarr;
                    </a>
                  </div>
                ) : (
                  <p
                    className={`py-8 text-sm italic text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Belum ada link postingan yang ditambahkan.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!isEditor && (
            <MetricsPanel
              contentId={content.id}
              isPublished={isPublished}
              metrics={content.metrics}
              onChange={(metrics) => applyUpdate({ metrics })}
            />
          )}
        </div>

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
