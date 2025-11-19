/**
 * 애플리케이션 라우팅 경로 상수
 * 경로 변경 시 이 파일만 수정하면 전체 앱에 반영됩니다.
 */

export const ROUTES = {
  // 메인 페이지
  HOME: "/",

  // 인증 관련
  LOGIN: "/login",
  SIGNUP: "/signup",

  // 계정 관리
  ACCOUNT: {
    FIND_ID: "/account/find/id",
    FIND_PW: "/account/find/pw",
    RESET_PASSWORD: "/account/reset-password",
    SETTING: "/account/setting",
  },

  // 인증 프로세스
  AUTH: {
    CALLBACK: "/auth/callback",
    LINK_ACCOUNT: "/auth/link-account",
    VERIFIED: "/auth/verified",
    FORGOT: "/auth/forgot",
  },

  // 주요 기능
  DASHBOARD: "/dashboard",
  TASKS: {
    LIST: "/tasks",
    ADD: "/tasks/add",
  },
} as const;

/**
 * 쿼리 파라미터를 포함한 동적 경로 생성 헬퍼 함수
 */
export const createRoute = {
  /**
   * 로그인 페이지 (리다이렉트 경로 포함)
   * @example createRoute.login("/dashboard") // "/login?redirect=%2Fdashboard"
   */
  login: (redirect?: string) => {
    if (!redirect) return ROUTES.LOGIN;
    return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirect)}`;
  },

  /**
   * 계정 연결 페이지
   */
  linkAccount: (params: { provider: string; email: string; identity_id: string }) => {
    const searchParams = new URLSearchParams(params);
    return `${ROUTES.AUTH.LINK_ACCOUNT}?${searchParams.toString()}`;
  },

  /**
   * 이메일 인증 완료 페이지
   */
  verified: (params: {
    status: "ok" | "fail";
    type?: string;
    reason?: string;
    message?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("status", params.status);
    if (params.type) searchParams.set("type", params.type);
    if (params.reason) searchParams.set("reason", params.reason);
    if (params.message) searchParams.set("message", params.message);
    return `${ROUTES.AUTH.VERIFIED}?${searchParams.toString()}`;
  },

  /**
   * 비밀번호 찾기 에러 페이지
   */
  findPasswordError: (error: string) => {
    return `${ROUTES.ACCOUNT.FIND_PW}?error=${encodeURIComponent(error)}`;
  },
} as const;
