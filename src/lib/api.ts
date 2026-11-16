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
  return fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
}
