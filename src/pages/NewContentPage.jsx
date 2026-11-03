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
import { FilePlus } from "lucide-react";

const EMPTY_VALUES = {
  title: "",
  editor_id: "",
  channel_id: "",
  format_type: "",
  priority: "sedang",
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
    if (name === "title" && errors.title) {
      setErrors({ ...errors, title: null });
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});

    if (!values.title || values.title.trim() === "") {
      setErrors({ title: "Judul konten wajib diisi!" });
      toast.error("Mohon isi judul konten terlebih dahulu.");
      return;
    }

    setSaving(true);
    try {
      await api.createContent({
        ...values,
        title: values.title.trim(),
        channel_id: Number(values.channel_id) || null,
        editor_id: Number(values.editor_id) || null,
        scheduled_date: values.scheduled_date || null,
        status: "idea",
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
    <div
      className={`max-w-3xl space-y-6 transition-colors duration-300 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
    >
      <div>
        <h1
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Konten baru
        </h1>
        <p
          className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
        >
          Buat draf ide konten baru untuk mulai mengelola alur produksi.
        </p>
      </div>

      {channels.length === 0 ? (
        <Card
          className={`relative overflow-hidden shadow-xl backdrop-blur-2xl rounded-3xl transition-colors duration-300 ${
            isDarkMode
              ? "border-slate-800/80 bg-slate-900/70 text-slate-100 shadow-blue-950/25"
              : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/60"
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
          <CardContent className="pt-8 pb-8">
            <p
              className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Kamu belum punya channel.{" "}
              <Link
                to="/channels"
                className="font-medium text-blue-500 underline hover:text-blue-600"
              >
                Tambahkan channel
              </Link>{" "}
              dulu sebelum membuat konten.
            </p>
          </CardContent>
        </Card>
      ) : (
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
              <FilePlus className="w-5 h-5 text-blue-500" />
              Formulir Ide Konten
            </CardTitle>
            <CardDescription
              className={isDarkMode ? "text-slate-400" : "text-slate-600"}
            >
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
              <div
                className={`flex items-center justify-end gap-3 pt-6 mt-6 border-t ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}
              >
                <Link
                  to="/contents"
                  className={
                    buttonVariants({ variant: "outline" }) +
                    (isDarkMode
                      ? " border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
                      : " border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm") +
                    " h-11 px-6 rounded-xl transition-all cursor-pointer"
                  }
                >
                  Batal
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-6 font-medium text-white bg-blue-600 shadow-xl hover:bg-blue-500 shadow-blue-600/30 h-11 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Simpan ide"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
