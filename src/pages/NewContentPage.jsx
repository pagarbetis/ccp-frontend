import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContentFields from "@/components/ContentFields";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import React from "react";

const EMPTY_VALUES = {
  title: "",
  editor_id: "",
  channel_id: "",
  format_type: "",
  priority: "medium",
  scheduled_date: "",
  description: "",
  script_draft: "",
};

export default function NewContentPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [editors, setEditors] = useState([]);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getChannels()
      .then(setChannels)
      .catch((error) => toast.error(error.message));
    api
      .getUsers("editor")
      .then(setEditors)
      .catch((error) => toast.error(error.message));
  }, []);

  const changeValue = (name, value) => {
    setValues({ ...values, [name]: value });
    // Hapus error title otomatis waktu user mulai ngetik
    if (name === "title" && errors.title) {
      setErrors({ ...errors, title: null });
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});

    // Validasi: Judul wajib diisi
    if (!values.title || values.title.trim() === "") {
      setErrors({ title: "Judul konten wajib diisi!" });
      toast.error("Mohon isi judul konten terlebih dahulu.");
      return;
    }

    setSaving(true);
    try {
      const content = await api.createContent({
        ...values,
        title: values.title.trim(),
        channel_id: Number(values.channel_id) || null,
        editor_id: Number(values.editor_id) || null,
        scheduled_date: values.scheduled_date || null,
        status: "idea", // konten baru selalu mulai dari Ide
      });
      toast.success("Ide disimpan");
      navigate(`/contents`);
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message || "Gagal menyimpan konten");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Konten baru</h1>
        <p className="mt-1 text-sm text-slate-400">
          Buat draf ide konten baru untuk mulai mengelola alur produksi.
        </p>
      </div>

      {channels.length === 0 ? (
        <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">
              Kamu belum punya channel.{" "}
              <Link
                to="/channels"
                className="font-medium text-blue-400 underline hover:text-blue-300"
              >
                Tambahkan channel
              </Link>{" "}
              dulu sebelum membuat konten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Formulir Ide Konten</CardTitle>
            <CardDescription className="text-slate-400">
              Isi detail informasi awal untuk ide konten kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <ContentFields
                values={values}
                onChange={changeValue}
                errors={errors}
                channels={channels}
                editors={editors}
              />
              <div className="flex gap-3 mt-8">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 font-medium text-white bg-blue-600 shadow-lg hover:bg-blue-500 shadow-blue-600/25 h-11"
                >
                  {saving ? "Menyimpan..." : "Simpan ide"}
                </Button>
                <Link
                  to="/contents"
                  className={buttonVariants({ variant: "outline" }) + " border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white h-11 px-6"}
                >
                  Batal
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}