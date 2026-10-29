import { useEffect, useState } from "react";
import { toast } from "sonner";

import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { api } from "@/lib/api";
import { PLATFORMS, labelOf } from "@/lib/constants";
import React from "react";

// Gunakan handle_name di state agar sesuai dengan ekspektasi backend
const EMPTY_FORM = { platform: "", handle_name: "" };

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getChannels()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : res?.data || res?.channels || [];
        setChannels(list);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const currentUser = JSON.parse(localStorage.getItem("ccp_user") || "{}");

      // Kirim payload dengan key handle_name dan platform
      const payload = {
        platform: form.platform,
        handle_name: form.handle_name,
        userId: currentUser.id || currentUser.userId,
      };

      const res = await api.createChannel(payload);
      const newChannel = res?.data || res;
      setChannels([...channels, newChannel]);
      setForm(EMPTY_FORM);
      toast.success("Channel ditambahkan");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Channel
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Akun media sosial yang kamu kelola. Setiap konten dikaitkan ke satu
          channel.
        </p>
      </div>

      <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Daftar Channel
          </CardTitle>
          <CardDescription className="text-slate-400">
            Semua akun sosial media yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-800/80">
            {channels.length === 0 && (
              <li className="py-4 text-sm text-center text-slate-500">
                Belum ada channel. Tambahkan satu di bawah supaya bisa membuat
                konten.
              </li>
            )}
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-baseline justify-between py-3.5"
              >
                <span className="font-medium text-slate-100">
                  {channel.handle_name || channel.handleName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {labelOf(PLATFORMS, channel.platform)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Tambah Channel Baru
          </CardTitle>
          <CardDescription className="text-slate-400">
            Daftarkan akun media sosial baru untuk pengelolaan konten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-start"
          >
            <Field
              label="Platform"
              error={errors.platform}
              className="text-slate-300"
            >
              <Select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="border-slate-700 bg-slate-950 text-slate-100 focus-visible:ring-blue-500 h-11"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  Pilih platform
                </option>
                {PLATFORMS.map((p) => (
                  <option
                    key={p.value}
                    value={p.value}
                    className="bg-slate-900 text-slate-100"
                  >
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Nama akun"
              error={errors.handle_name || errors.handleName}
              className="text-slate-300"
            >
              <Input
                placeholder="@namakamu"
                value={form.handle_name}
                onChange={(e) =>
                  setForm({ ...form, handle_name: e.target.value })
                }
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500 h-11"
              />
            </Field>
            <Button
              type="submit"
              disabled={saving}
              className="sm:mt-[1.625rem] bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/25 h-11 px-6"
            >
              {saving ? "Menambahkan..." : "Tambah channel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
