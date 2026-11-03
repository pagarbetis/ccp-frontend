import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StageBar from "@/components/StageBar";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FORMATS, PLATFORMS, STAGES, labelOf } from "@/lib/constants";
import { cn, formatDate, todayString } from "@/lib/utils";
import React from "react";

export default function ContentsPage() {
  const { user } = useAuth();
  const isEditor = user.role === "editor";
  const [contents, setContents] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [channelId, setChannelId] = useState("all");
  const [format, setFormat] = useState("all");
  const [stage, setStage] = useState("");

  // Ambil state tema dari localStorage dan pasang listener real-time
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

  useEffect(() => {
    if (isEditor) return;
    api
      .getChannels()
      .then((data) => setChannels(data))
      .catch((error) => toast.error(error.message));
  }, [isEditor]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (channelId && channelId !== "all") {
      params.channel_id = channelId;
    }

    api
      .getContents(params)
      .then(setContents)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  const contentsInFormat = useMemo(() => {
    return contents.filter(
      (content) =>
        format === "all" || !format || content.format_type === format,
    );
  }, [contents, format]);

  const visibleContents = contentsInFormat.filter(
    (content) => !stage || content.status === stage,
  );

  const countByStage = (value) =>
    contentsInFormat.filter((c) => c.status === value).length;

  return (
    <div className={`space-y-6 transition-colors duration-300 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Konten
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Pipeline dan alur produksi konten dari tahap ide hingga siap tayang.
          </p>
        </div>
        {!isEditor && (
          <Link
            to="/contents/new"
            className={cn(
              buttonVariants(),
              "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 h-11 px-6 rounded-xl font-medium transition-all hover:scale-[1.02] cursor-pointer",
            )}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Konten baru
          </Link>
        )}
      </div>

      {/* Tab tahap dengan scrollbar tersembunyi */}
      <div className={`flex overflow-x-auto border-b [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 pb-1 ${
        isDarkMode ? "border-slate-800/80" : "border-slate-200"
      }`}>
        <StageTab
          active={stage === ""}
          onClick={() => setStage("")}
          label="Semua"
          count={contentsInFormat.length}
          isDarkMode={isDarkMode}
        />
        {STAGES.map((item) => (
          <StageTab
            key={item.value}
            active={stage === item.value}
            onClick={() => setStage(item.value)}
            label={item.label}
            count={countByStage(item.value)}
            color={item.color}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {!isEditor && (
          <Select value={channelId} onValueChange={setChannelId}>
            <SelectTrigger className={`w-52 h-11 rounded-xl transition-colors ${
              isDarkMode 
                ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500" 
                : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500 shadow-sm"
            }`}>
              <SelectValue placeholder="Semua channel" />
            </SelectTrigger>
            <SelectContent className={`rounded-xl ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
              <SelectItem
                value="all"
                className={isDarkMode ? "focus:bg-slate-800 focus:text-slate-100" : "focus:bg-slate-100 focus:text-slate-900"}
              >
                Semua channel
              </SelectItem>
              {channels.map((channel) => (
                <SelectItem
                  key={channel.id}
                  value={String(channel.id)}
                  className={isDarkMode ? "focus:bg-slate-800 focus:text-slate-100" : "focus:bg-slate-100 focus:text-slate-900"}
                >
                  {labelOf(PLATFORMS, channel.platform)} {channel.handle_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className={`w-48 h-11 rounded-xl transition-colors ${
            isDarkMode 
              ? "border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500" 
              : "border-slate-300 bg-slate-50 text-slate-900 focus:ring-blue-500 shadow-sm"
          }`}>
            <SelectValue placeholder="Semua format" />
          </SelectTrigger>
          <SelectContent className={`rounded-xl ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
            <SelectItem
              value="all"
              className={isDarkMode ? "focus:bg-slate-800 focus:text-slate-100" : "focus:bg-slate-100 focus:text-slate-900"}
            >
              Semua format
            </SelectItem>
            {FORMATS.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className={isDarkMode ? "focus:bg-slate-800 focus:text-slate-100" : "focus:bg-slate-100 focus:text-slate-900"}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`relative overflow-hidden border shadow-xl rounded-3xl backdrop-blur-2xl transition-colors duration-300 ${
        isDarkMode 
          ? "border-slate-800/80 bg-slate-900/70 shadow-blue-950/25" 
          : "border-slate-200/80 bg-white/90 shadow-slate-200/60"
      }`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className={`border-b ${
              isDarkMode 
                ? "border-slate-800/80 bg-slate-900/90 text-slate-400" 
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}>
              <tr>
                <th className="px-4 py-3.5 font-semibold">Judul</th>
                <th className="px-4 py-3.5 font-semibold">Format</th>
                <th className="px-4 py-3.5 font-semibold">Tahap</th>
                <th className="px-4 py-3.5 font-semibold">Target tayang</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-slate-800/60" : "divide-slate-200"}`}>
              {!loading &&
                visibleContents.map((content) => (
                  <ContentRow key={content.id} content={content} isDarkMode={isDarkMode} />
                ))}
            </tbody>
          </table>
        </div>

        {!loading && visibleContents.length === 0 && (
          <EmptyState hasAnyContent={contents.length > 0} isEditor={isEditor} isDarkMode={isDarkMode} />
        )}
        {loading && (
          <p className={`px-4 py-12 text-sm text-center animate-pulse ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Memuat konten...
          </p>
        )}
      </div>
    </div>
  );
}

function StageTab({ label, count, active, onClick, isDarkMode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-xl px-4 py-2 text-sm transition-all border cursor-pointer",
        active
          ? isDarkMode
            ? "font-semibold text-white bg-blue-600/20 border-blue-500/40 shadow-inner"
            : "font-semibold text-blue-900 bg-blue-50 border-blue-300 shadow-sm"
          : isDarkMode
            ? "border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/50"
            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      {label}{" "}
      <span className={cn("ml-1.5 px-2 py-0.5 text-xs rounded-full tabular-nums", 
        active 
          ? isDarkMode ? "bg-blue-500/30 text-blue-200 font-semibold" : "bg-blue-200 text-blue-800 font-semibold"
          : isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
      )}>
        {count}
      </span>
    </button>
  );
}

function ContentRow({ content, isDarkMode }) {
  const navigate = useNavigate();
  const isLate =
    content.scheduled_date &&
    content.scheduled_date < todayString() &&
    content.status !== "published";

  const channelOwner =
    content.channel?.user_name ||
    content.channel?.user?.name ||
    content.channel?.ownerName;
  const hasTitle = content.title && content.title.trim() !== "";

  return (
    <tr
      onClick={() => navigate(`/contents/${content.id}`)}
      className={`transition-colors cursor-pointer ${isDarkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-100/50"}`}
    >
      <td className="px-4 py-3.5">
        <div
          className={cn(
            "font-medium transition-colors",
            hasTitle
              ? isDarkMode ? "text-slate-100 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"
              : isDarkMode ? "text-slate-500 italic" : "text-slate-400 italic",
          )}
        >
          {hasTitle ? content.title : "Tanpa judul"}
        </div>
        <div className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          {labelOf(PLATFORMS, content.channel?.platform)}{" "}
          {content.channel?.handle_name || content.channel?.handleName}
          {channelOwner && (
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}> ({channelOwner})</span>
          )}
        </div>
        {content.editor_name && (
          <div className="text-xs text-blue-500 mt-0.5 font-medium">
            Editor: {content.editor_name}
          </div>
        )}
      </td>
      <td className={`px-4 py-3.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
        {labelOf(FORMATS, content.format_type)}
      </td>
      <td className="px-4 py-3.5">
        <StageBar status={content.status} />
      </td>
      <td
        className={cn(
          "px-4 py-3.5",
          isDarkMode ? "text-slate-300" : "text-slate-700",
          isLate && "font-medium text-red-500",
        )}
      >
        {formatDate(content.scheduled_date)}
        {isLate && (
          <span className="block text-xs text-red-500 mt-0.5 font-medium">
            Lewat jadwal
          </span>
        )}
      </td>
    </tr>
  );
}

function EmptyState({ hasAnyContent, isEditor, isDarkMode }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
        {hasAnyContent
          ? "Tidak ada konten dengan filter ini."
          : "Belum ada konten."}
      </p>
      <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
        {hasAnyContent
          ? "Ganti tahap, channel, atau format di atas."
          : isEditor
            ? "Konten muncul di sini setelah kreator menugaskanmu sebagai editor."
            : "Catat ide pertamamu, nanti digeser tahap demi tahap sampai tayang."}
      </p>
    </div>
  );
}