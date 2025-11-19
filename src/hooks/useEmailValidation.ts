import { useState } from "react";

export function useEmailValidation() {
  const [idChecking, setIdChecking] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [idMsg, setIdMsg] = useState("");

  const resetValidation = () => {
    setIdChecked(false);
    setIdAvailable(null);
    setIdMsg("");
  };

  const checkEmailAvailability = async (email: string): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await fetch(`/api/user/check-id?email=${encodeURIComponent(normalizedEmail)}`, {
      cache: "no-store",
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : null;

    if (!res.ok) throw new Error(data?.message || `중복 확인 실패 (HTTP ${res.status})`);
    if (data?.exists) throw new Error("이미 사용 중인 이메일이에요.");
  };

  const validateEmail = async (email: string, isValidEmail: boolean): Promise<boolean> => {
    if (!isValidEmail) {
      setIdMsg("올바른 이메일 형식이 아니에요.");
      setIdChecked(false);
      setIdAvailable(null);
      return false;
    }

    setIdChecking(true);
    setIdMsg("");

    try {
      await checkEmailAvailability(email);
      setIdAvailable(true);
      setIdChecked(true);
      setIdMsg("사용 가능한 이메일입니다.");
      return true;
    } catch (e: unknown) {
      setIdAvailable(false);
      setIdChecked(true);
      const message =
        e instanceof Error ? e.message : "중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setIdMsg(message);
      return false;
    } finally {
      setIdChecking(false);
    }
  };

  return {
    idChecking,
    idChecked,
    idAvailable,
    idMsg,
    resetValidation,
    checkEmailAvailability,
    validateEmail,
  };
}
