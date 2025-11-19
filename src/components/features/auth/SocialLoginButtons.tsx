import Image from "next/image";
import { RiKakaoTalkFill } from "react-icons/ri";

type SocialProvider = "kakao" | "google";

interface SocialLoginButtonsProps {
  type: "login" | "signup";
  onSocialLogin: (provider: SocialProvider) => void;
}

export default function SocialLoginButtons({ type, onSocialLogin }: SocialLoginButtonsProps) {
  const actionText = type === "login" ? "로그인" : "가입";

  return (
    <div className="flex items-center justify-center gap-3">
      {/* 카카오 */}
      <button
        type="button"
        onClick={() => onSocialLogin("kakao")}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FEE500] hover:brightness-95"
        aria-label={`카카오 ${actionText}`}
      >
        <RiKakaoTalkFill size={24} color="#3C1E1E" />
      </button>

      {/* 구글 */}
      <button
        type="button"
        onClick={() => onSocialLogin("google")}
        aria-label={`구글로 ${actionText}`}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 hover:brightness-95"
      >
        <Image src="/images/icons/google.svg" alt="" width={30} height={30} />
      </button>
    </div>
  );
}
