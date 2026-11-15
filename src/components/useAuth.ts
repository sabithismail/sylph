"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type Me = { id: string; name: string } | null;

/** Current signed-in user: undefined while loading, null when signed out. */
export function useAuth(): { me: Me | undefined; configured: boolean } {
  const sb = getSupabase();
  const [me, setMe] = useState<Me | undefined>(sb ? undefined : null);

  useEffect(() => {
    if (!sb) return;
    let alive = true;
    async function load(uid: string | null) {
      if (!uid) {
        if (alive) setMe(null);
        return;
      }
      const { data } = await sb!.from("profiles").select("id,display_name").eq("id", uid).maybeSingle();
      if (alive) setMe({ id: uid, name: data?.display_name ?? "Spirit" });
    }
    sb.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      // Defer so we never call Supabase inside the auth callback itself.
      setTimeout(() => load(session?.user.id ?? null), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  return { me, configured: Boolean(sb) };
}
