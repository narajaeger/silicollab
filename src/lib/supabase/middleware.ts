// Menyegarkan sesi Supabase pada tiap request & melindungi route privat
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Halaman-halaman ini butuh login. Menjelajah proyek, komunitas, dan registry
// tool tetap terbuka untuk pengunjung tanpa akun — supaya orang bisa lihat dulu
// fitur-fiturnya sebelum daftar. Login baru diwajibkan saat mau membuat proyek
// atau membuka fitur pribadi (dashboard, profil, notifikasi, onboarding).
// Sub-halaman workspace proyek (chat/tugas/pipeline/dll) sudah menjaga dirinya
// sendiri lewat pengecekan keanggotaan di masing-masing halaman.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/notifications",
  "/onboarding",
  "/projects/new",
];

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}
