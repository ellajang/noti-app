import { useState } from "react";
import { getRandomNickname } from "@woowa-babble/random-nickname";

export function useNicknameGenerator() {
  const [nickLoading, setNickLoading] = useState(false);

  const generateFallbackNickname = (): string => {
    const base = getRandomNickname("animals");
    const tail = Math.floor(100 + Math.random() * 900);
    return `${base}${tail}`;
  };

  const generateRandomNickname = async (): Promise<string> => {
    setNickLoading(true);
    try {
      const res = await fetch("/api/nickname/suggest", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.nickname) {
          return data.nickname;
        }
      }
      return generateFallbackNickname();
    } catch {
      return generateFallbackNickname();
    } finally {
      setNickLoading(false);
    }
  };

  return {
    nickLoading,
    generateRandomNickname,
  };
}
