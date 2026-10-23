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
    api.getChannels().then(setChannels).catch((error) => toast.error(error.message));
    api.getUsers("editor").then(setEditors).catch((error) => toast.error(error.message));
  }, []);

  const changeValue = (name, value) => setValues({ ...values, [name]: value });

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const content = await api.createContent({
        ...values,
        channel_id: Number(values.channel_id) || null,
        editor_id: Number(values.editor_id) || null,
        scheduled_date: values.scheduled_date || null,
        status: "idea", // konten baru selalu mulai dari Ide
      });
      toast.success("Ide disimpan");
      navigate(`/contents/${content.id}`);
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Konten baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat draf ide konten baru untuk mulai mengelola alur produksi.
        </p>
      </div>

      {channels.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Kamu belum punya channel.{" "}
              <Link to="/channels" className="font-medium underline text-primary">
                Tambahkan channel
              </Link>{" "}
              dulu sebelum membuat konten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formulir Ide Konten</CardTitle>
            <CardDescription>Isi detail informasi awal untuk ide konten kamu</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <ContentFields values={values} onChange={changeValue} errors={errors} channels={channels} editors={editors} />
              <div className="flex gap-2 mt-8">
                <Button type="submit" disabled={saving}>Simpan ide</Button>
                <Link to="/contents" className={buttonVariants({ variant: "outline" })}>Batal</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}