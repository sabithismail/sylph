"use client";

import Link from "next/link";
import { useAuth } from "./useAuth";

const pill =
  "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5";

export default function NavAccount() {
  const { me, configured } = useAuth();
  return (
    <nav aria-label="Account" className="ml-auto flex items-center gap-2">
      <Link href="/feed" className={pill}>Feed</Link>
      {configured &&
        (me ? (
          <Link href="/me" className={pill}>{me.name}</Link>
        ) : me === null ? (
          <Link href="/login" className={pill}>Sign in</Link>
        ) : null)}
    </nav>
  );
}
