// Klien Supabase untuk komponen browser ("use client")
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Catatan: @supabase/ssr menurunkan generic Schema secara berbeda dari
// @supabase/supabase-js versi terbaru, sehingga inferensi tipe .insert()/.update()
// bisa jatuh ke `never`. Kita anotasikan tipe kembalian ke SupabaseClient<Database>
// milik supabase-js agar typing query akurat.
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as SupabaseClient<Database>;
}
