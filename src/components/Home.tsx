import Link from "next/link";
import Ambient from "./Ambient";
import SylphIcon from "./SylphIcon";
import SylphWordmark from "./SylphWordmark";

const PATHS = [
  {
    title: "Write a poem",
    href: "/poem",
    body: "Tell Sylph a little of your story. Choose the form, the length and the grammar level, and it writes with you.",
    icon: (
      <path d="M20 4C12 6 6 13 5 22l-1 6 6-1c9-1 16-7 18-15zM8 24 22 10" />
    ),
  },
  {
    title: "Tell a story",
    href: "/story",
    body: "Pick the length and the word count, share what you have lived through, and watch it become a tale.",
    icon: (
      <path d="M5 5h9a4 4 0 0 1 4 4v18a3 3 0 0 0-3-3H5zM27 5h-9M27 5v19h-9" />
    ),
  },
  {
    title: "Find a quote",
    href: undefined as string | undefined,
    body: "Draw a random line from the garden, or turn one hard moment into a line or two with a touch of nature.",
    icon: (
      <path d="M6 22c0-6 2-10 7-12M7 22h5v5H7zM18 22c0-6 2-10 7-12M19 22h5v5h-5z" />
    ),
  },
];

export default function Home() {
  return (
    <div className="sy-sky relative min-h-dvh">
      <Ambient />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-12 px-4 py-8 sm:px-8">
        <header className="flex items-center gap-4">
          <SylphIcon size={36} glow={false} />
          <SylphWordmark className="w-32" />
        </header>

        <section className="sy-home-in flex flex-col gap-4">
          <h1
            className="text-balance text-5xl text-mist sm:text-6xl"
            style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
          >
            What would you like to write today?
          </h1>
          <p
            className="max-w-xl text-pretty text-2xl text-mist"
            style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}
          >
            Sit by the lantern. Whatever you carry, Sylph will help you turn it into something gentle.
          </p>
        </section>

        <section
          className="sy-home-in grid gap-5 sm:grid-cols-3"
          style={{ animationDelay: "0.15s" }}
        >
          {PATHS.map((p) => (
            <article
              key={p.title}
              className="flex flex-col gap-4 rounded-2xl border border-stone bg-deep p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                stroke="#c7cbb8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {p.icon}
              </svg>
              <h2 className="text-xl font-semibold text-mist">{p.title}</h2>
              <p className="text-pretty text-base leading-relaxed text-mist">
                {p.body}
              </p>
              {p.href ? (
                <Link
                  href={p.href}
                  className="mt-auto self-start rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  Begin
                </Link>
              ) : (
                <span className="mt-auto self-start rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-[#f1f3e8] opacity-60">
                  Opening soon
                </span>
              )}
            </article>
          ))}
        </section>

        <footer className="mt-auto pb-4 text-sm text-sage">
          Sylph is being grown one screen at a time.
        </footer>
      </div>
    </div>
  );
}
