import { localDay } from "./day";
import { getSupabase } from "./supabase";

/** POST JSON to our API, attaching the signed-in user's token when there is one. */
export async function authedPost(url: string, body: unknown): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* send without a token */
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  // A piece was written: count today for the signed-in user's garden streak.
  if (res.ok && headers.Authorization && /^\/api\/(write|story|quote)$/.test(url)) {
    try {
      getSupabase()?.rpc("touch_writing_day", { local_day: localDay() }).then(() => undefined, () => undefined);
    } catch {
      /* the streak is a nicety, never block writing */
    }
  }
  return res;
}
