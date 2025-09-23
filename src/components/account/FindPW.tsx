"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { Input } from "../common/Input";
import CustomDatePicker from "../common/CustomDatePicker";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindPW() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [birth, setBirth] = useState(""); // YYYY-MM-DD
  const [openPicker, setOpenPicker] = useState(false);
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
      await fetch("/api/user/reset-password", {
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

  return (
    <div id="panel-pw" role="tabpanel" className="space-y-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          id="reset-email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            setBirth(`${y}-${m}-${d}`);
            setOpenPicker(false);
          }}
          onCancel={() => setOpenPicker(false)}
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
