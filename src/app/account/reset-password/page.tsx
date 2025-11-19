"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants/routes";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setHasSession(false);
        return;
      }
      setHasSession(!!data.session);
    };
    check();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 8) return setErr("비밀번호는 8자 이상이어야 해요.");
    if (pw !== pw2) return setErr("비밀번호가 일치하지 않습니다.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);

    if (error) {
      setErr(error.message || "비밀번호 변경에 실패했어요.");
      return;
    }
    setOk(true);
  };

  // 세션이 없으면 안내 (링크 만료/재사용 등)
  if (hasSession === false) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md p-6">
          <h1 className="mb-3 text-lg font-bold">링크가 유효하지 않아요 : (</h1>
          <p className="mb-6 text-sm text-gray-700">
            링크가 만료되었거나 이미 사용되었을 수 있어요. 비밀번호 재설정 메일을 다시 요청해
            주세요.
          </p>
          <Button fullWidth onClick={() => router.push(ROUTES.AUTH.FORGOT)}>
            재설정 메일 다시 보내기
          </Button>
        </div>
      </main>
    );
  }

  // 최초 로딩 상태
  if (hasSession === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner />
      </main>
    );
  }

  // 성공 화면
  if (ok) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 p-6">
          <h1 className="mb-3 text-lg font-bold">비밀번호가 변경되었습니다</h1>
          <p className="mb-6 text-sm text-gray-700">새 비밀번호로 로그인해 주세요.</p>
          <Button fullWidth onClick={() => router.push(ROUTES.LOGIN)}>
            로그인하러 가기
          </Button>
        </div>
      </main>
    );
  }

  // 비밀번호 입력 폼
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 p-6">
        <h1 className="mb-3 text-lg font-bold">비밀번호 재설정</h1>
        <p className="mb-6 text-sm text-gray-700">새 비밀번호를 입력해 주세요. (8자 이상)</p>

        <form onSubmit={submit} className="space-y-3">
          <Input
            id="pw"
            type="password"
            placeholder="새 비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value.replace(/\s/g, ""))}
          />
          <Input
            id="pw2"
            type="password"
            placeholder="새 비밀번호 확인"
            value={pw2}
            onChange={(e) => setPw2(e.target.value.replace(/\s/g, ""))}
          />

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading || pw.length < 8 || pw !== pw2}>
            {loading ? <Spinner /> : "비밀번호 변경하기"}
          </Button>
        </form>
      </section>
    </main>
  );
}
