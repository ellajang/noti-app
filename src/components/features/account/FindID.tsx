"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { formatToYYYYMMDD } from "@/lib/utils/date";

export default function FindId() {
  const [fullName, setFullName] = useState("");
  const [birth, setBirth] = useState(""); // YYYY-MM-DD
  const [openPicker, setOpenPicker] = useState(false);
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
      const res = await fetch("/api/user/find-id", {
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

  return (
    <div id="panel-id" role="tabpanel" className="space-y-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          id="fullName"
          placeholder="이름"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
            setBirth(formatToYYYYMMDD(date));
            setOpenPicker(false);
          }}
          onCancel={() => setOpenPicker(false)}
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
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
