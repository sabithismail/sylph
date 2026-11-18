/* eslint-disable @next/next/no-img-element */
import { parseAvatar } from "@/lib/avatars";

/** A round profile picture. Pass the saved id and the name as a fallback seed. */
export default function Avatar({
  id,
  name = "",
  size = 40,
  label,
}: {
  id?: string | null;
  name?: string;
  size?: number;
  label?: string;
}) {
  const creator = id === "creator";
  return (
    <img
      src={`/avatars/${parseAvatar(id, name)}.webp`}
      width={size}
      height={size}
      alt={label ?? ""}
      title={creator ? "Creator of Sylph" : undefined}
      aria-hidden={label ? undefined : true}
      loading="lazy"
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size, ...(creator ? { boxShadow: "0 0 0 2px #e6eda0, 0 0 14px 2px rgba(230,237,160,.45)" } : null) }}
    />
  );
}
