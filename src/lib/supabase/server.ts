import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, value, { path: "/", ...options });
        },
        remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, "", { path: "/", maxAge: 0, ...options });
        },
      },
    },
  );
};
