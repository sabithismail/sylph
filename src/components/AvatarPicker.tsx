"use client";

import Avatar from "./Avatar";
import { AVATARS, CREATOR_AVATAR, CREATOR_ID } from "@/lib/avatars";

/** A small grid of profile pictures. The creator-only one is shown only to the creator. */
export default function AvatarPicker({
  value,
  onChange,
  userId,
}: {
  value: string;
  onChange: (id: string) => void;
  userId?: string;
}) {
  const list: string[] = userId === CREATOR_ID ? [CREATOR_AVATAR, ...AVATARS] : [...AVATARS];
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">Profile picture</legend>
      {list.map((x) => (
        <button
          key={x}
          type="button"
          aria-pressed={value === x}
          aria-label={x}
          onClick={() => onChange(x)}
          className={`rounded-full border-2 p-0.5 ${value === x ? "border-glow" : "border-stone"}`}
        >
          <Avatar id={x} size={48} />
        </button>
      ))}
    </fieldset>
  );
}
