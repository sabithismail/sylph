import type { Metadata } from "next";
import Link from "next/link";
import Ambient from "@/components/Ambient";
import StoryWizard from "@/components/StoryWizard";
import SylphIcon from "@/components/SylphIcon";

export const metadata: Metadata = {
  title: "Tell a story · Sylph",
  description: "Share your past and Sylph will turn it into a story.",
};

export default function StoryPage() {
  return (
    <div className="sy-sky relative min-h-dvh">
      <Ambient />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-mist" aria-label="Sylph home">
            <SylphIcon size={26} glow={false} />
            <span
              className="text-3xl"
              style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
            >
              Sylph
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5"
          >
            Home
          </Link>
        </header>
        <div data-tour="wizard">
          <StoryWizard />
        </div>
      </div>
    </div>
  );
}
