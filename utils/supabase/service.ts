import { createServerClient } from "@supabase/ssr";

export async function createServiceClient() {
  // Uses the Supabase SERVICE ROLE KEY from server env. Only use on server-side endpoints.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variables");
  }

  // createServerClient works in node; we do not pass cookies for service usage.
  // The options object requires a `cookies` helper; for a service role client
  // we don't need to read or write cookies, so provide a minimal no-op
  // implementation that satisfies the typing expected by @supabase/ssr.
  return createServerClient(url, serviceKey, {
    cookies: {
      getAll() {
        return [] as any[];
      },
      setAll(_cookies: any[]) {
        // no-op for service role
      },
    },
  });
}
