import type { Metadata } from "next";
import Link from "next/link";
import StyledCard from "@/components/StyledCard";
import { excerpt, getPublicPost } from "@/lib/publicPost";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicPost(id);
  if (!post) return { title: "Sylph", robots: { index: false } };
  const title = post.kind === "quote" ? `A quote by ${post.author_name}` : post.title || `A ${post.kind} by ${post.author_name}`;
  const description = excerpt(post.body);
  return {
    title: `${title} · Sylph`,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "article", siteName: "Sylph" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedPost({ params }: Props) {
  const { id } = await params;
  const post = await getPublicPost(id);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-10">
      {post ? (
        <>
          <StyledCard title={post.title} text={post.body} kind={post.kind} template={post.template} font={post.font} contrast={post.contrast} />
          <p className="text-base text-mist">
            Shared by{" "}
            <Link href={`/spirit/${encodeURIComponent(post.author_name)}`} className="underline underline-offset-4">
              {post.author_name}
            </Link>
          </p>
        </>
      ) : (
        <p className="text-lg text-mist">This piece isn&apos;t shared publicly any more, or it never existed.</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8]">
          Turn your own past into something gentle
        </Link>
        <Link href="/feed" className="rounded-full border border-stone px-5 py-3 text-base text-mist">
          Visit the garden
        </Link>
      </div>
    </main>
  );
}
