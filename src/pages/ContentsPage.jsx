import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StageBar from "@/components/StageBar";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect as Select } from "@/components/ui/native-select";
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

  const [channelId, setChannelId] = useState("");
  const [format, setFormat] = useState("");
  const [stage, setStage] = useState("");

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
    if (channelId) {
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
      (content) => !format || content.format_type === format,
    );
  }, [contents, format]);

  const visibleContents = contentsInFormat.filter(
    (content) => !stage || content.status === stage,
  );

  const countByStage = (value) =>
    contentsInFormat.filter((c) => c.status === value).length;

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Konten</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pipeline dan alur produksi konten dari tahap ide hingga siap tayang.
          </p>
        </div>
        {!isEditor && (
          <Link to="/contents/new" className={cn(buttonVariants(), "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30")}>
            <Plus className="w-4 h-4 mr-1.5" />
            Konten baru
          </Link>
        )}
      </div>

      {/* Tab tahap dengan scrollbar tersembunyi */}
      <div className="flex overflow-x-auto border-b border-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <StageTab
          active={stage === ""}
          onClick={() => setStage("")}
          label="Semua"
          count={contentsInFormat.length}
        />
        {STAGES.map((item) => (
          <StageTab
            key={item.value}
            active={stage === item.value}
            onClick={() => setStage(item.value)}
            label={item.label}
            count={countByStage(item.value)}
            color={item.color}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {!isEditor && (
          <Select
            className="w-52 border-slate-700 bg-slate-900 text-slate-100 focus-visible:ring-blue-500"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            aria-label="Filter channel"
          >
            <option value="" className="bg-slate-900 text-slate-400">Semua channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id} className="bg-slate-900 text-slate-100">
                {labelOf(PLATFORMS, channel.platform)} {channel.handle_name}
              </option>
            ))}
          </Select>
        )}
        <Select
          className="w-48 border-slate-700 bg-slate-900 text-slate-100 focus-visible:ring-blue-500"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          aria-label="Filter format"
        >
          <option value="" className="bg-slate-900 text-slate-400">Semua format</option>
          {FORMATS.map((item) => (
            <option key={item.value} value={item.value} className="bg-slate-900 text-slate-100">
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto border shadow-xl border-slate-800 rounded-xl bg-slate-900/80 backdrop-blur-xl shadow-blue-950/20">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Judul</th>
              <th className="px-4 py-3 font-semibold">Format</th>
              <th className="px-4 py-3 font-semibold">Tahap</th>
              <th className="px-4 py-3 font-semibold">Target tayang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {!loading &&
              visibleContents.map((content) => (
                <ContentRow key={content.id} content={content} />
              ))}
          </tbody>
        </table>

        {!loading && visibleContents.length === 0 && (
          <EmptyState hasAnyContent={contents.length > 0} isEditor={isEditor} />
        )}
        {loading && (
          <p className="px-4 py-8 text-sm text-center text-slate-400">
            Memuat konten...
          </p>
        )}
      </div>
    </div>
  );
}

function StageTab({
  label,
  count,
  active,
  onClick,
  color = "#3b82f6",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px whitespace-nowrap border-b-[3px] px-4 py-2.5 text-sm transition-colors hover:text-white hover:bg-slate-900/50",
        active ? "font-semibold text-white" : "border-transparent text-slate-400",
      )}
      style={active ? { borderBottomColor: color } : undefined}
    >
      {label}{" "}
      <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-slate-800 text-slate-300 tabular-nums">{count}</span>
    </button>
  );
}

function ContentRow({ content }) {
  const navigate = useNavigate();
  const isLate =
    content.scheduled_date &&
    content.scheduled_date < todayString() &&
    content.status !== "published";

  // Ambil nama pemilik channel jika ada di relasi data backend
  const channelOwner = content.channel?.user_name || content.channel?.user?.name || content.channel?.ownerName;
  const hasTitle = content.title && content.title.trim() !== "";

  return (
    <tr 
      onClick={() => navigate(`/contents/${content.id}`)}
      className="transition-colors cursor-pointer hover:bg-slate-800/40"
    >
      <td className="px-4 py-3.5">
        <div className={cn("font-medium transition-colors", hasTitle ? "text-slate-100 hover:text-blue-400" : "text-slate-500 italic")}>
          {hasTitle ? content.title : "Tanpa judul"}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {labelOf(PLATFORMS, content.channel?.platform)}{" "}
          {content.channel?.handle_name || content.channel?.handleName}
          {channelOwner && <span className="text-slate-500"> - {channelOwner}</span>}
        </div>
        {content.editor_name && (
          <div className="text-xs text-blue-400/80 mt-0.5">
            Editor: {content.editor_name}
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 text-slate-300">{labelOf(FORMATS, content.format_type)}</td>
      <td className="px-4 py-3.5">
        <StageBar status={content.status} />
      </td>
      <td className={cn("px-4 py-3.5 text-slate-300", isLate && "font-medium text-red-400")}>
        {formatDate(content.scheduled_date)}
        {isLate && <span className="block text-xs text-red-400 mt-0.5">Lewat jadwal</span>}
      </td>
    </tr>
  );
}

function EmptyState({ hasAnyContent, isEditor }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="font-medium text-slate-300">
        {hasAnyContent
          ? "Tidak ada konten dengan filter ini."
          : "Belum ada konten."}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {hasAnyContent
          ? "Ganti tahap, channel, atau format di atas."
          : isEditor
            ? "Konten muncul di sini setelah kreator menugaskanmu sebagai editor."
            : "Catat ide pertamamu, nanti digeser tahap demi tahap sampai tayang."}
      </p>
    </div>
  );
}