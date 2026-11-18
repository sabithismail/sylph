// Hand-picked profile pictures. Files live in /public/avatars/<id>.webp (square, 256px).
export const AVATARS = [
  "earphones", "candle", "busstop", "guitar", "telephone",
  "hashbrown", "necktie", "sunrise", "sanandreas", "santa",
  "flowerphones", "ramen", "thumbsup", "studybuddy", "airplane",
  "sombrero", "meadow", "cucumber", "spectacles", "potcat",
] as const;
export type AvatarId = (typeof AVATARS)[number];

export function parseAvatar(id: string | null | undefined, seed = ""): AvatarId | typeof CREATOR_AVATAR {
  if (id === CREATOR_AVATAR) return id as AvatarId;
  if ((AVATARS as readonly string[]).includes(id ?? "")) return id as AvatarId;
  // No choice yet (or an old shape avatar): pick a stable default from the name.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

// Reserved for the creator of Sylph. The database refuses it for every other account.
export const CREATOR_AVATAR = "creator";
export const CREATOR_ID = "b18f08c4-9999-4532-8996-675ab8cc8ce5";
