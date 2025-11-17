/**
 * TanStack Query Key 상수 관리
 * 일관성 있는 캐시 관리를 위해 query key를 중앙화
 */

export const queryKeys = {
  // Auth 관련
  auth: {
    user: ["auth", "user"] as const,
    session: ["auth", "session"] as const,
  },

  // Tasks 관련
  tasks: {
    all: ["tasks"] as const,
    list: (filters?: { date?: string; status?: string }) => ["tasks", "list", filters] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    today: () => ["tasks", "today"] as const,
  },
} as const;
