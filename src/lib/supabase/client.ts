import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 클라이언트 싱글톤 인스턴스
 * 클라이언트 컴포넌트와 API 헬퍼에서 재사용
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

/**
 * @deprecated 하위 호환성을 위해 유지. 대신 `supabase` 인스턴스를 직접 import하세요.
 */
export const createClient = () => supabase;
