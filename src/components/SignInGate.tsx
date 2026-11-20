"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

/** Shows its children only to signed-in spirits; everyone else gets a gentle sign-in card. */
export default function SignInGate({ what, children }: { what: string; children: React.ReactNode }) {
  const { me } = useAuth();
  const path = usePathname() || "/";

  if (me === undefined) {
    return <p className="text-base text-sage" role="status">Opening the garden gate…</p>;
  }
  if (me && !me.needsSetup) return <>{children}</>;

  const next = encodeURIComponent(path);
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-stone bg-deep p-6 sm:p-8">
      <h2 className="text-3xl text-mist sm:text-4xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        Join to {what}
      </h2>
      <p className="text-lg leading-relaxed text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
        {me?.needsSetup
          ? "Almost there. Finish setting up your name to start writing."
          : "Writing with Sylph is for spirits with an account. It's free, and it keeps your pieces and your journal safe."}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/login?next=${next}`}
          className="rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5"
        >
          {me?.needsSetup ? "Finish setup" : "Sign in or join"}
        </Link>
        <Link href="/feed" className="rounded-full border border-stone px-6 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5">
          Read the garden
        </Link>
      </div>
    </div>
  );
}
