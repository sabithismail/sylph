import type { Metadata } from "next";
import Link from "next/link";
import Ambient from "@/components/Ambient";
import SpiritProfile from "@/components/SpiritProfile";
import SylphIcon from "@/components/SylphIcon";

export const metadata: Metadata = { title: "A spirit · Sylph" };

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    /* keep the raw value */
  }
  return (
    <div className="sy-sky relative min-h-dvh">
      <Ambient />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-mist" aria-label="Sylph home">
            <SylphIcon size={26} glow={false} />
            <span className="text-3xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Sylph</span>
          </Link>
          <Link href="/feed" className="rounded-full border border-stone px-4 py-2 text-sm text-mist">Feed</Link>
        </header>
        <SpiritProfile name={decoded} />
      </div>
    </div>
  );
}
