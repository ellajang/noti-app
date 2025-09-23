"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindPW() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setSent(false);

    if (!EMAIL_RE.test(email)) return setErr("이메일 형식을 확인해 주세요.");
    if (fullName.trim().length < 2) return setErr("이름을 올바르게 입력해 주세요.");

    setLoading(true);
    try {
      // 서버에서 email+full_name 일치 확인 후 resetPasswordForEmail 호출
      await fetch("/api/account/reset-password-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName: fullName.trim() }),
      });
      setSent(true); // Enumeration 방지: 항상 동일 안내
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] outline-none text-gray-900 placeholder-gray-500 focus:ring-2 border-gray-300 focus:ring-emerald-200 focus:border-emerald-500";

  return (
    <div id="panel-pw" role="tabpanel" className="space-y-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="이메일"
          className={inputBase}
          autoComplete="email"
        />
        <input
          id="reset-name"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          placeholder="이름"
          className={inputBase}
          autoComplete="name"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner /> : "재설정 메일 보내기"}
        </Button>
      </form>

      <div className="space-y-3">
        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        {sent && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            입력하신 주소로 비밀번호 재설정 안내를 보냈습니다.
          </div>
        )}
      </div>
    </div>
  );
}
