"use client";

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      Logout
    </button>
  )
}
