"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FaArrowLeft } from "react-icons/fa";
import BottomNavBar from "@/components/common/BottomNavBar";
import { RecurrenceType } from "@/types/tasks";
import CustomDatePicker from "@/components/common/CustomDatePicker";
import CustomTimePicker from "@/components/common/CustomTimePicker";
import { Input } from "@/components/common/Input";

export default function AddTaskPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [delegateName, setDelegateName] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !scheduledDate) {
      alert("제목과 날짜는 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title,
        description: description || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || null,
        delegate_name: delegateName || null,
        recurrence: recurrence === "none" ? null : recurrence,
        status: "todo",
      });

      if (error) {
        console.error("Task creation error:", error);
        alert("일정 추가에 실패했습니다.");
        return;
      }

      // 성공 시 대시보드로 이동
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("예상치 못한 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white pb-24">
      <div className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              aria-label="뒤로가기"
            >
              <FaArrowLeft className="text-gray-700" size={18} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">일정 추가</h1>
          </div>
        </header>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-900">
              제목 <span className="text-emerald-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-900">
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 입력하세요"
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* 날짜/시간 그룹 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="mb-2 block text-sm font-semibold text-gray-900">
                날짜 <span className="text-emerald-500">*</span>
              </label>
              <Input
                id="date"
                placeholder="날짜 선택"
                value={scheduledDate}
                readOnly
                onClick={() => setOpenPicker(true)}
              />
              <CustomDatePicker
                isOpen={openPicker}
                value={scheduledDate ? new Date(scheduledDate) : undefined}
                onSelect={(date) => {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  setScheduledDate(`${y}-${m}-${d}`);
                  setOpenPicker(false);
                }}
                onCancel={() => setOpenPicker(false)}
              />
            </div>

            <div>
              <label htmlFor="time" className="mb-2 block text-sm font-semibold text-gray-900">
                시간
              </label>
              <Input
                id="time"
                placeholder="시간 선택"
                value={scheduledTime}
                readOnly
                onClick={() => setOpenTimePicker(true)}
              />
              <CustomTimePicker
                isOpen={openTimePicker}
                value={
                  scheduledTime
                    ? (() => {
                        const [h, m] = scheduledTime.split(":");
                        const d = new Date();
                        d.setHours(parseInt(h), parseInt(m));
                        return d;
                      })()
                    : undefined
                }
                onSelect={(date) => {
                  const h = String(date.getHours()).padStart(2, "0");
                  const m = String(date.getMinutes()).padStart(2, "0");
                  setScheduledTime(`${h}:${m}`);
                  setOpenTimePicker(false);
                }}
                onCancel={() => setOpenTimePicker(false)}
              />
            </div>
          </div>

          {/* 위임자 */}
          <div>
            <label htmlFor="delegate" className="mb-2 block text-sm font-semibold text-gray-900">
              위임자
            </label>
            <input
              id="delegate"
              type="text"
              value={delegateName}
              onChange={(e) => setDelegateName(e.target.value)}
              placeholder="위임받은 사람 이름"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* 반복 */}
          <div>
            <label htmlFor="recurrence" className="mb-2 block text-sm font-semibold text-gray-900">
              반복
            </label>
            <select
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%227%22%20viewBox%3D%220%200%2012%207%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M1%201l5%205%205-5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat px-4 py-3.5 pr-12 text-[15px] transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="none">안함</option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="biweekly">2주마다</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-4 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
      <BottomNavBar />
    </div>
  );
}
