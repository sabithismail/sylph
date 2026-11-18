"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CREATOR_ID } from "@/lib/avatars";
import Avatar from "./Avatar";
import OwnerMark from "./OwnerMark";
import { useAuth } from "./useAuth";

const pill =
  "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5";

export default function NavAccount() {
  const { me, configured } = useAuth();
  const [pic, setPic] = useState<string | null>(null);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !me) return;
    let alive = true;
    sb.from("profiles").select("avatar").eq("id", me.id).maybeSingle().then(({ data }) => {
      if (alive) setPic((data?.avatar as string | null) ?? null);
    });
    return () => {
      alive = false;
    };
  }, [me]);
  return (
    <nav aria-label="Account" className="ml-auto flex items-center gap-2">
      <Link href="/feed" className={pill}>Feed</Link>
      {configured &&
        (me ? (
          <Link href="/me" className="flex items-center gap-2 rounded-full border border-stone py-1 pl-1 pr-3.5 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5">
            <Avatar id={pic} name={me.name} size={28} />
            <span className="max-w-[7rem] truncate">{me.name}</span>
            {me.id === CREATOR_ID && <OwnerMark size={16} />}
          </Link>
        ) : me === null ? (
          <Link href="/login" className={pill}>Sign in</Link>
        ) : null)}
    </nav>
  );
}
