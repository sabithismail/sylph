import type { Metadata } from "next";
import Link from "next/link";
import Ambient from "@/components/Ambient";
import SylphIcon from "@/components/SylphIcon";

export const metadata: Metadata = {
  title: "Rules & privacy · Sylph",
  description: "How Sylph treats your words, your data and each other.",
};

const h2 = "text-3xl text-mist";
const script = { fontFamily: "var(--font-script)", fontWeight: 700 } as const;

export default function RulesPage() {
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

        <h1 className="text-4xl text-mist sm:text-5xl" style={script}>Rules &amp; privacy</h1>
        <p className="text-base leading-relaxed text-mist">
          Sylph is a small, student-made garden for turning hard memories into gentle words. This page says plainly how it works. It is not legal advice.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>Who can join</h2>
          <p className="text-base leading-relaxed text-mist">You must be 13 or older. If you are not, please don&apos;t create an account.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>What Sylph keeps</h2>
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-mist">
            <li>Your email and password (the password is stored hashed, never as plain text).</li>
            <li>Your display name, which is shown on your posts. Your real name and email are never shown.</li>
            <li>Posts you choose to publish, with their likes and reports.</li>
            <li>An Instagram or Facebook handle, only if you add one. It stays private unless you choose &ldquo;Visible to my spirits&rdquo;, and then only spirits you accepted can see it.</li>
            <li>A count of how many pieces you wrote today, to keep the free service fair.</li>
          </ul>
          <p className="text-base leading-relaxed text-mist">
            The stories you type to be turned into a poem, story or quote are not saved by Sylph unless you post the result.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>The AI that writes with you</h2>
          <p className="text-base leading-relaxed text-mist">
            To write a piece, Sylph sends what you typed to Google&apos;s Gemini service. Sylph uses a free plan, and Google may keep and review inputs sent on free plans to improve its products. So please leave out real names, phone numbers, addresses and anything you would not want a stranger to read.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>Being kind here</h2>
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-mist">
            <li>Post only your own words, or pieces Sylph helped you write.</li>
            <li>No harassment, hate, sexual content, or sharing other people&apos;s private details.</li>
            <li>No content that encourages self-harm. Posts with that wording are not published.</li>
            <li>Use Report on anything that breaks these rules. Three reports hide a post until the garden keeper reviews it. Reported posts, including spirits-only ones, may be read during that review. Reporters stay anonymous.</li>
            <li>Never use someone&apos;s shared handle to pressure or follow them anywhere they did not invite you.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>If things feel heavy</h2>
          <p className="text-base leading-relaxed text-mist">
            Sylph is a creative companion, not a counsellor or emergency service. If you might hurt yourself, please talk to someone now. In India, Tele-MANAS is free at 14416, any time. If you are in immediate danger, call your local emergency number.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={h2} style={script}>Your choices</h2>
          <p className="text-base leading-relaxed text-mist">
            You can delete any post, change who sees your handle, or delete your whole account from <Link href="/me" className="underline underline-offset-4">My garden</Link>. Deleting your account removes your profile, posts, likes and spirits for good.
          </p>
        </section>
      </div>
    </div>
  );
}
