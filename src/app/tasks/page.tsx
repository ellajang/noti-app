"use client";

import BottomNavBar from "@/components/layout/BottomNavBar";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

export default function TaskPage() {
  const handleAddTask = () => {
    // TODO: 일정 추가 페이지로 이동 또는 모달 열기
    console.log("일정 추가 버튼 클릭");
  };

  return (
    <>
      <main className="bg-white p-6 pb-20">
        <h1 className="text-xl font-bold">일정 관리</h1>
        {/* 여기에 일정 관리 내용이 들어갑니다 */}
      </main>
      <FloatingActionButton onClick={handleAddTask} />
      <BottomNavBar />
    </>
  );
}
