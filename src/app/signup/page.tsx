"use client";

import Button from "@/components/common/Button";
import CustomDatePicker from "@/components/common/CustomDatePicker";
import { useSignUp } from "@/hooks/useSignUp";
import { createClient } from "@/lib/supabase/client";
import { getRandomNickname } from "@woowa-babble/random-nickname";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { RiKakaoTalkFill } from "react-icons/ri";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { AlertDialog } from "@/components/common/AlertDialog";

export default function SignUpPage() {
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState(""); // 이메일
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [birth, setBirth] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [nickLoading, setNickLoading] = useState(false);

  // 알림 모달
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [onAlertConfirm, setOnAlertConfirm] = useState<() => void>(() => () => {});

  const supabase = createClient();
  const router = useRouter();
  const { mutateAsync, isPending } = useSignUp();

  const isValidEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId), [userId]);
  const isValidPw = useMemo(() => password.length >= 8, [password]);
  const isPwMatch = useMemo(() => confirm === password, [confirm, password]);
  // 이메일 중복 확인 UX
  const [idChecking, setIdChecking] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [idMsg, setIdMsg] = useState("");

  const onChangeEmail = (v: string) => {
    setUserId(v);
    setIdChecked(false);
    setIdAvailable(null);
    setIdMsg("");
  };

  // 최종 중복확인
  const ensureEmailAvailable = async () => {
    const email = userId.trim().toLowerCase();
    const res = await fetch(`/api/user/check-id?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : null;

    if (!res.ok) throw new Error(data?.message || `중복 확인 실패 (HTTP ${res.status})`);
    if (data?.exists) throw new Error("이미 사용 중인 이메일이에요.");
  };

  // 가입 실행
  const doSubmit = async () => {
    const email = userId.trim().toLowerCase();
    const res = await mutateAsync({ email, password, nickname, fullName, birth });
    if (res?.needsEmailConfirm) {
      setAlertMsg("가입 완료! 이메일로 전송된 인증 링크를 확인해 주세요.");
      setOnAlertConfirm(() => () => router.push("/login"));
    } else {
      setAlertMsg("가입 완료! 지금부터 바로 이용할 수 있어요.");
      setOnAlertConfirm(() => () => router.push("/tasks"));
    }
    setAlertOpen(true);
  };

  const allFilled = [nickname, fullName, userId, password, birth].every(Boolean);
  const isFormValid = allFilled && isValidEmail && isValidPw && isPwMatch;

  // “중복확인”
  const checkDuplicate = async () => {
    if (!isValidEmail) {
      setIdMsg("올바른 이메일 형식이 아니에요.");
      setIdChecked(false);
      setIdAvailable(null);
      return;
    }
    setIdChecking(true);
    setIdMsg("");
    try {
      await ensureEmailAvailable();
      setIdAvailable(true);
      setIdChecked(true);
      setIdMsg("사용 가능한 이메일입니다.");
      if (isFormValid && !isPending) {
        await doSubmit();
      }
    } catch (e: unknown) {
      setIdAvailable(false);
      setIdChecked(true);
      const message =
        e instanceof Error ? e.message : "중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setIdMsg(message);
    } finally {
      setIdChecking(false);
    }
  };

  const pickRandomNickname = async () => {
    setNickLoading(true);
    try {
      const res = await fetch("/api/nickname/suggest", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.nickname) {
          setNickname(data.nickname);
          return;
        }
      }
      const base = getRandomNickname("animals");
      const tail = Math.floor(100 + Math.random() * 900);
      setNickname(`${base}${tail}`);
    } catch {
      const base = getRandomNickname("animals");
      const tail = Math.floor(100 + Math.random() * 900);
      setNickname(`${base}${tail}`);
    } finally {
      setNickLoading(false);
    }
  };

  // 제출
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;
    try {
      await ensureEmailAvailable();
      setIdAvailable(true);
      setIdChecked(true);
      setIdMsg("사용 가능한 이메일입니다.");
      await doSubmit();
    } catch (err: unknown) {
      setIdAvailable(false);
      setIdChecked(true);
      const message = err instanceof Error ? err.message : "가입 중 오류가 발생했어요.";
      setIdMsg(message);
    }
  };

  const snsSignIn = async (provider: "kakao" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-5">
        <h1 className="mt-6 mb-6 text-center text-[26px] font-bold tracking-tight text-gray-800">
          가입하기
        </h1>

        <div className="rounded-2xl bg-white">
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {/* 닉네임 */}
            <Input
              id="nickname"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {/* 이메일 + 중복확인 */}
            <Input
              id="userId"
              type="email"
              placeholder="example@email.com"
              value={userId}
              onChange={(e) => onChangeEmail(e.target.value)}
              error={
                userId && !isValidEmail
                  ? "올바른 이메일 형식이 아니에요."
                  : idChecked && idAvailable === false
                    ? idMsg
                    : undefined
              }
              hint={
                idChecked && idAvailable === true ? idMsg : !idChecked && idMsg ? idMsg : undefined
              }
              rightSlot={
                <Button
                  type="button"
                  size="lg"
                  onClick={checkDuplicate}
                  disabled={!isValidEmail || idChecking}
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
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
              error={password && !isValidPw ? "비밀번호는 8자 이상이어야 해요." : undefined}
            />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\s/g, ""))}
              error={confirm && !isPwMatch ? "비밀번호가 일치하지 않습니다." : undefined}
            />
            {/* 생년월일 (읽기 전용 인풋 + 선택 버튼) */}
            <Input
              id="birth"
              placeholder="생년월일"
              value={birth}
              readOnly
              onClick={() => setOpenPicker(true)}
            />

            <CustomDatePicker
              isOpen={openPicker}
              value={birth ? new Date(birth) : undefined}
              onSelect={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const d = String(date.getDate()).padStart(2, "0");
                setBirth(`${y}-${m}-${d}`);
                setOpenPicker(false);
              }}
              onCancel={() => setOpenPicker(false)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isFormValid || isPending}
            >
              {isPending ? (
                <div className="flex w-full justify-center">
                  <Spinner />
                </div>
              ) : (
                "가입하기"
              )}
            </Button>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="shrink-0 text-xs text-gray-500">SNS 계정으로 가입하기</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="mt-4 mb-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => snsSignIn("kakao")}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FEE500] hover:brightness-95"
                aria-label="카카오 가입"
              >
                <RiKakaoTalkFill size={24} color="#3C1E1E" />
              </button>

              <button
                type="button"
                onClick={() => snsSignIn("google")}
                aria-label="구글로 가입"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 hover:brightness-95"
              >
                <Image src="/images/icons/google.svg" alt="" width={30} height={30} />
              </button>
            </div>
          </form>
        </div>
      </section>
      <AlertDialog
        open={alertOpen}
        title="알림"
        message={alertMsg}
        showCancel={false}
        onConfirm={() => {
          setAlertOpen(false);
          onAlertConfirm();
        }}
      />
    </main>
  );
}
