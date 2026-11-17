import type { Metadata } from "next";
import Link from "next/link";
import Ambient from "@/components/Ambient";
import SylphIcon from "@/components/SylphIcon";

export const metadata: Metadata = {
  title: "About · Sylph",
  description: "Why Sylph exists and who made it.",
};

const script = { fontFamily: "var(--font-script)", fontWeight: 700 } as const;

export default function AboutPage() {
  return (
    <div className="sy-sky relative min-h-dvh">
      <Ambient />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-mist" aria-label="Sylph home">
            <SylphIcon size={26} glow={false} />
            <span className="text-3xl" style={script}>Sylph</span>
          </Link>
          <Link href="/" className="rounded-full border border-stone px-4 py-2 text-sm text-mist">Home</Link>
        </header>

        <h1 className="text-4xl text-mist sm:text-5xl" style={script}>About Sylph</h1>

        <p className="text-2xl leading-snug text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
          A sylph is a garden spirit. This one helps you turn what you have been through into something gentle: a poem, a story, a quote.
        </p>

        <p className="text-base leading-relaxed text-mist">
          Sylph began as a student&apos;s way of calming his own past by writing it down. It is free, it has no ads, and what you type is not kept unless you choose to post it.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-3xl text-mist" style={script}>Made by Sabith</h2>
          <p className="text-base leading-relaxed text-mist">
            Built by Sabith, an AI &amp; Machine Learning student. You can find the code and other projects on GitHub.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/sabithismail"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
            >
              github.com/sabithismail
            </a>
            <a
              href="https://github.com/sabithismail/sylph"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone px-6 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Sylph&apos;s code
            </a>
          </div>
        </section>

        <p className="text-sm text-sage">
          Questions about how your words are handled? Read the <Link href="/rules" className="underline underline-offset-4">Rules &amp; privacy</Link>.
        </p>
      </div>
    </div>
  );
}
