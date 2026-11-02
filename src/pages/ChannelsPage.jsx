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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { PLATFORMS, labelOf } from "@/lib/constants";
import React from "react";
import { Tv } from "lucide-react";

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
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Channel
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Akun media sosial yang kamu kelola. Setiap konten dikaitkan ke satu
          channel.
        </p>
      </div>

      <Card className="relative overflow-hidden shadow-xl border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl text-slate-100 rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <CardHeader className="pb-4 mb-4 border-b border-slate-800/60">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Tv className="w-5 h-5 text-blue-400" />
            Daftar Channel
          </CardTitle>
          <CardDescription className="text-slate-400">
            Semua akun sosial media yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="px-4 overflow-hidden border divide-y shadow-inner divide-slate-800/60 rounded-2xl border-slate-800/80 bg-slate-950/50">
            {channels.length === 0 && (
              <li className="py-8 text-sm italic text-center text-slate-500">
                Belum ada channel. Tambahkan satu di bawah supaya bisa membuat
                konten.
              </li>
            )}
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-center justify-between py-3.5 first:pt-4 last:pb-4"
              >
                <span className="font-medium text-slate-200">
                  {channel.handle_name || channel.handleName}
                </span>
                <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-slate-800/80 text-slate-300 border-slate-700/60">
                  {labelOf(PLATFORMS, channel.platform)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden shadow-xl border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl text-slate-100 rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent rounded-t-3xl" />
        <CardHeader className="pb-4 mb-4 border-b border-slate-800/60">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Tv className="w-5 h-5 text-blue-400" />
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
                onValueChange={(value) => setForm({ ...form, platform: value })}
              >
                <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100 focus:ring-blue-500 h-11 rounded-xl">
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-100 rounded-xl">
                  {PLATFORMS.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      className="focus:bg-slate-800 focus:text-slate-100"
                    >
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
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
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 rounded-xl"
              />
            </Field>
            <div className="flex sm:mt-[1.625rem]">
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xl shadow-blue-600/30 h-11 px-6 rounded-xl transition-all hover:scale-[1.02]"
              >
                {saving ? "Menambahkan..." : "Tambah channel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
