import { useState, useEffect } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { canTransition } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import React from "react";

const ACTION_LABELS = {
  submitted: "Dikirim untuk review",
  approved: "Disetujui",
  revision_requested: "Revisi diminta",
};

export default function ReviewPanel({ content, onUpdated }) {
  const { user } = useAuth();
  const [reviewUrl, setReviewUrl] = useState(content.review_url ?? "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setReviewUrl(content.review_url ?? "");
  }, [content.review_url]);

  const canSubmit = canTransition(user, content, "in_review");
  const canDecide = canTransition(user, content, "ready");
  const history = content.reviews ?? [];

  let waitingText = null;
  if (content.status === "in_review")
    waitingText = "Menunggu keputusan kreator.";
  else if (
    ["editing", "revision"].includes(content.status) &&
    content.editor_name
  ) {
    waitingText = `Sedang dikerjakan ${content.editor_name}.`;
  }

  if (!canSubmit && !canDecide && !waitingText && history.length === 0)
    return null;

  async function run(action, successMessage) {
    setBusy(true);
    setErrors({});
    try {
      const result = await action();
      onUpdated(result);
      setNote("");
      toast.success(successMessage);
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">Review</CardTitle>
        <CardDescription className="text-slate-400">Pemeriksaan dan persetujuan hasil editing konten</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {canSubmit && (
          <div className="space-y-4">
            {content.status === "revision" && content.review_note && (
              <div className="p-3.5 text-sm rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
                <strong className="font-semibold text-amber-400">Catatan revisi:</strong> {content.review_note}
              </div>
            )}
            <Field label="Link hasil editing" error={errors.review_url} className="text-slate-300">
              <Input
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="https://"
                className="h-10 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              />
            </Field>
            <Button
              disabled={busy}
              onClick={() =>
                run(
                  () => api.submitReview(content.id, { review_url: reviewUrl }),
                  "Dikirim untuk review",
                )
              }
              className="h-10 px-6 font-medium text-white bg-blue-600 shadow-lg hover:bg-blue-500 shadow-blue-600/30"
            >
              Kirim untuk review
            </Button>
          </div>
        )}

        {canDecide && (
          <div className="space-y-4">
            <div>
              <a
                href={content.review_url || content.reviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-400 underline transition-colors hover:text-blue-300"
              >
                Buka hasil editing
              </a>
            </div>
            <Field
              label="Catatan revisi"
              error={errors.note}
              hint="Wajib diisi jika meminta revisi."
              className="text-slate-300"
            >
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Tuliskan catatan revisi di sini..."
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              />
            </Field>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                disabled={busy}
                onClick={() =>
                  run(
                    () => api.approveReview(content.id),
                    "Disetujui, siap tayang",
                  )
                }
                className="h-10 px-5 font-medium text-white shadow-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
              >
                Setujui (ACC)
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    () => api.requestRevision(content.id, { note }),
                    "Dikembalikan ke editor",
                  )
                }
                className="h-10 px-5 font-medium border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                Minta revisi
              </Button>
            </div>
          </div>
        )}

        {!canSubmit && !canDecide && waitingText && (
          <p className="text-sm text-slate-400">
            {waitingText}{" "}
            {content.status === "in_review" && content.review_url && (
              <a
                href={content.review_url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 font-medium text-blue-400 underline hover:text-blue-300"
              >
                Buka hasil editing
              </a>
            )}
          </p>
        )}

        {history.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <h3 className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">Riwayat Review</h3>
            <ul className="text-sm divide-y divide-slate-800/60">
              {history.map((item) => (
                <tr key={item.id} className="block py-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-slate-200">
                      {ACTION_LABELS[item.action]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.created_at
                        ? formatDate(item.created_at.slice(0, 10))
                        : ""}
                    </span>
                  </div>
                  <div className="text-xs text-blue-400/80 mt-0.5">{item.user_name}</div>
                  {item.note && <p className="p-2 mt-1 text-xs italic border rounded-lg text-slate-300 bg-slate-950/40 border-slate-800/60">{item.note}</p>}
                </tr>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}