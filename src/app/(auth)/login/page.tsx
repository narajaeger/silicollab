"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input, Label } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirect = params.get("redirect") || "/dashboard";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-glass">
          Si
        </span>
        Sili<span className="text-brand-600">Collab</span>
      </Link>
      <h1 className="mb-1 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">Selamat datang kembali</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Masuk untuk lanjut ke ruang kerjamu.</p>
      <Card>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-brand-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <Icon name="google" size={18} />
          {googleLoading ? "Mengarahkan ke Google..." : "Lanjut dengan Google"}
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          atau pakai email
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
