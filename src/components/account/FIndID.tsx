"use client";

import { useMemo, useState } from "react";
import Button from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

export default function FindId() {
  const [fullName, setFullName] = useState("");
  const [birth, setBirth] = useState(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; maskedEmail?: string } | null>(null);
  const [error, setError] = useState("");

  const isValidBirth = useMemo(() => /^\d{4}-\d{2}-\d{2}$/.test(birth), [birth]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (fullName.trim().length < 2) return setError("이름을 올바르게 입력해 주세요.");
    if (!isValidBirth) return setError("생년월일은 YYYY-MM-DD 형식으로 입력해 주세요.");

    setLoading(true);
    try {
      const res = await fetch("/api/account/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), birth }),
      });
      const json = (await res.json()) as { found?: boolean; maskedEmail?: string };
      setResult({ found: !!json.found, maskedEmail: json.maskedEmail });
    } catch {
      setError("조회 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] outline-none text-gray-900 placeholder-gray-500 focus:ring-2 border-gray-300 focus:ring-emerald-200 focus:border-emerald-500";

  return (
    <div id="panel-id" role="tabpanel" className="space-y-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <input
          id="fullName"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          placeholder="이름"
          className={inputBase}
          autoComplete="name"
        />
        <input
          id="birth"
          value={birth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBirth(e.target.value)}
          placeholder="생년월일 (YYYY-MM-DD)"
          className={inputBase}
          inputMode="numeric"
          autoComplete="bday"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner /> : "아이디 찾기"}
        </Button>
      </form>

      {/* 메시지 */}
      <div className="space-y-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {result && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {result.found ? (
              <>
                가입하신 이메일은 <strong>{result.maskedEmail}</strong> 입니다.
              </>
            ) : (
              <>일치하는 계정을 찾을 수 없어요.</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
