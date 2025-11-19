"use client";

import Button from "@/components/ui/Button";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { useSignUp } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { AlertDialog } from "@/components/ui/AlertDialog";
import Link from "next/link";
import SocialLoginButtons from "@/components/features/auth/SocialLoginButtons";
import { formatToYYYYMMDD } from "@/lib/utils/date";
import { ROUTES } from "@/lib/constants/routes";
import { useSignupForm } from "@/hooks/useSignupForm";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { useNicknameGenerator } from "@/hooks/useNicknameGenerator";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import type { SignupFormData } from "@/lib/schemas/signup";

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useSignUp();

  // Custom hooks
  const { form, openPicker, setOpenPicker } = useSignupForm();
  const { register, handleSubmit, formState, setValue, watch } = form;
  const { errors, isValid } = formState;

  const { idChecking, idChecked, idAvailable, idMsg, resetValidation, validateEmail } =
    useEmailValidation();

  const { nickLoading, generateRandomNickname } = useNicknameGenerator();
  const { alertOpen, alertMsg, showAlert, closeAlert } = useAlertDialog();

  // Watch values
  const userId = watch("userId");
  const birth = watch("birth");

  // Handlers
  const onChangeEmail = (v: string) => {
    setValue("userId", v, { shouldValidate: true });
    resetValidation();
  };

  const pickRandomNickname = async () => {
    const newNickname = await generateRandomNickname();
    setValue("nickname", newNickname, { shouldValidate: true });
  };

  const doSubmit = async (data: SignupFormData) => {
    const res = await mutateAsync({
      email: data.userId.trim().toLowerCase(),
      password: data.password,
      nickname: data.nickname,
      fullName: data.fullName,
      birth: data.birth,
    });

    if (res?.needsEmailConfirm) {
      showAlert(
        "가입이 성공적으로 완료되었습니다! 계정을 사용하려면 이메일 인증을 완료해 주세요.",
        () => router.push(ROUTES.LOGIN),
      );
    } else {
      showAlert("가입이 성공적으로 완료되었습니다! 지금부터 바로 이용할 수 있어요.", () =>
        router.push(ROUTES.DASHBOARD),
      );
    }
  };

  const checkDuplicate = async () => {
    const isValidEmail = !errors.userId && userId.length > 0;
    await validateEmail(userId, isValidEmail);
  };

  const onSubmit = async (data: SignupFormData) => {
    if (isPending) return;

    try {
      const isValidEmail = !errors.userId && userId.length > 0;
      const isEmailValid = await validateEmail(userId, isValidEmail);
      if (isEmailValid) {
        await doSubmit(data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "가입 중 오류가 발생했어요.";
      showAlert(message);
    }
  };

  const snsSignIn = async (provider: "kakao" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        showAlert(`${provider === "kakao" ? "카카오" : "구글"} 로그인에 실패했습니다. 다시 시도해 주세요.`);
      }
    } catch {
      showAlert("SNS 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-5">
        <h1 className="mt-6 mb-6 text-center text-[26px] font-bold tracking-tight text-gray-800">
          가입하기
        </h1>

        <div className="rounded-2xl bg-white">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            {/* 닉네임 */}
            <Input
              id="nickname"
              placeholder="닉네임"
              {...register("nickname")}
              error={errors.nickname?.message}
              size="md"
              rightSlot={
                <Button
                  type="button"
                  size="lg"
                  onClick={pickRandomNickname}
                  disabled={nickLoading}
                  className="text-[13px] leading-none whitespace-nowrap"
                >
                  {nickLoading ? "생성 중…" : "랜덤 생성"}
                </Button>
              }
            />

            {/* 이름 */}
            <Input
              id="fullName"
              placeholder="이름"
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            {/* 이메일 + 중복확인 */}
            <Input
              id="userId"
              type="email"
              placeholder="example@email.com"
              {...register("userId")}
              onChange={(e) => onChangeEmail(e.target.value)}
              error={
                errors.userId?.message || (idChecked && idAvailable === false ? idMsg : undefined)
              }
              hint={idChecked && idAvailable === true ? idMsg : undefined}
              rightSlot={
                <Button
                  type="button"
                  size="lg"
                  onClick={checkDuplicate}
                  disabled={!!errors.userId || !userId || idChecking}
                  className="text-[13px] leading-none whitespace-nowrap"
                >
                  {idChecking ? <Spinner /> : "중복 확인"}
                </Button>
              }
            />

            {/* 비밀번호 */}
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 (8자 이상)"
              {...register("password")}
              onChange={(e) =>
                setValue("password", e.target.value.replace(/\s/g, ""), { shouldValidate: true })
              }
              error={errors.password?.message}
            />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 확인"
              {...register("confirm")}
              onChange={(e) =>
                setValue("confirm", e.target.value.replace(/\s/g, ""), { shouldValidate: true })
              }
              error={errors.confirm?.message}
            />

            {/* 생년월일 */}
            <Input
              id="birth"
              placeholder="생년월일"
              {...register("birth")}
              readOnly
              onClick={() => setOpenPicker(true)}
              error={errors.birth?.message}
            />

            <CustomDatePicker
              isOpen={openPicker}
              value={birth ? new Date(birth) : undefined}
              onSelect={(date) => {
                setValue("birth", formatToYYYYMMDD(date), { shouldValidate: true });
                setOpenPicker(false);
              }}
              onCancel={() => setOpenPicker(false)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isValid || isPending}
            >
              {isPending ? (
                <div className="flex w-full justify-center">
                  <Spinner />
                </div>
              ) : (
                "가입하기"
              )}
            </Button>

            {/* 로그인 페이지로 돌아가기 */}
            <div className="mt-3 text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href={ROUTES.LOGIN} className="font-medium text-emerald-600 hover:text-emerald-700">
                로그인
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="shrink-0 text-xs text-gray-500">SNS 계정으로 가입하기</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="mt-4 mb-6">
              <SocialLoginButtons type="signup" onSocialLogin={snsSignIn} />
            </div>
          </form>
        </div>
      </section>
      <AlertDialog
        open={alertOpen}
        title="알림"
        message={alertMsg}
        showCancel={false}
        onConfirm={closeAlert}
      />
    </main>
  );
}
