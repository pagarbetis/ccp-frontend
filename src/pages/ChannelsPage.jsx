import React, { useEffect, useState } from "react";
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

// Sesuaikan property form jadi handleName agar cocok dengan backend
const EMPTY_FORM = { platform: "", handleName: "" };

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getChannels()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.channels || []);
        setChannels(list);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      // Ambil data user yang sedang login untuk mendapatkan userId
      const currentUser = JSON.parse(localStorage.getItem("ccp_user") || "{}");
      
      // Gabungkan userId ke dalam payload yang dikirim ke backend
      const payload = {
        ...form,
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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Channel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Akun media sosial yang kamu kelola. Setiap konten dikaitkan ke satu channel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Channel</CardTitle>
          <CardDescription>Semua akun sosial media yang terdaftar dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {channels.length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">
                Belum ada channel. Tambahkan satu di bawah supaya bisa membuat konten.
              </li>
            )}
            {channels.map((channel) => (
              <li key={channel.id} className="flex items-baseline justify-between py-3">
                <span className="font-medium">{channel.handleName}</span>
                <span className="text-sm text-muted-foreground">{labelOf(PLATFORMS, channel.platform)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tambah Channel Baru</CardTitle>
          <CardDescription>Daftarkan akun media sosial baru untuk pengelolaan konten</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
            <Field label="Platform" error={errors.platform}>
              <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <option value="">Pilih platform</option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Nama akun" error={errors.handleName || errors.handle_name}>
              <Input
                placeholder="@namakamu"
                value={form.handleName}
                onChange={(e) => setForm({ ...form, handleName: e.target.value })}
              />
            </Field>
            <Button type="submit" disabled={saving} className="sm:mt-[1.625rem]">
              Tambah channel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}