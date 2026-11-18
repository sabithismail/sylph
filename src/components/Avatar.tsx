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
  return (
    <img
      src={`/avatars/${parseAvatar(id, name)}.webp`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      loading="lazy"
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
