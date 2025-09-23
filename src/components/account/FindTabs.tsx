"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type TabKey = "id" | "pw";

export default function FindTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<TabKey>("id");

  useEffect(() => {
    if (pathname?.endsWith("/pw")) setTab("pw");
    else setTab("id"); // /account/find 또는 /account/find/id
  }, [pathname]);

  const go = (key: TabKey) => {
    setTab(key);
    router.push(key === "id" ? "/account/find/id" : "/account/find/pw");
  };

  return (
    <div
      role="tablist"
      aria-label="계정 복구"
      className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
    >
      <Button
        aria-selected={tab === "id"}
        aria-controls="panel-id"
        onClick={() => go("id")}
        variant={tab === "id" ? "primary" : "secondary"}
        size="sm"
        fullWidth
        className="font-semibold"
      >
        아이디 찾기
      </Button>

      <span className="mx-1 w-px self-stretch bg-gray-300" />
      <Button
        aria-selected={tab === "pw"}
        aria-controls="panel-pw"
        onClick={() => go("pw")}
        variant={tab === "pw" ? "primary" : "secondary"}
        size="sm"
        fullWidth
        className="font-semibold"
      >
        비밀번호 찾기
      </Button>
    </div>
  );
}
