import { createClient } from "@supabase/supabase-js";

const SIGNED_IN_DAILY = 10;
const ANON_DAILY = 5;

const anon = new Map<string, { day: string; n: number }>();

/** Returns a message when the writer has used up today's writings, otherwise null. */
export async function checkQuota(req: Request, ip: string): Promise<string | null> {
  const auth = req.headers.get("authorization");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (auth?.startsWith("Bearer ") && url && key) {
    try {
      const sb = createClient(url, key, {
        global: { headers: { Authorization: auth } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await sb.rpc("use_quota", { max_per_day: SIGNED_IN_DAILY });
      if (!error) {
        return data === false
          ? `You've used today's ${SIGNED_IN_DAILY} writings. Sylph rests until tomorrow, and the random quotes are always open.`
          : null;
      }
    } catch {
      /* fall through to the guest limit */
    }
  }

  // Guests: best-effort count per IP (resets when the server restarts).
  const day = new Date().toISOString().slice(0, 10);
  const cur = anon.get(ip);
  const n = cur && cur.day === day ? cur.n + 1 : 1;
  anon.set(ip, { day, n });
  return n > ANON_DAILY
    ? `Guests get ${ANON_DAILY} writings a day. Join Sylph (it's free) for ${SIGNED_IN_DAILY} a day.`
    : null;
}

/** True when the request carries a valid signed-in user's token. */
export async function verifyUser(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!auth?.startsWith("Bearer ") || !url || !key) return false;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await sb.auth.getUser(auth.slice(7));
    return !error && Boolean(data.user);
  } catch {
    return false;
  }
}

export const SIGN_IN_MESSAGE = "Join Sylph (it's free) to write with it.";
