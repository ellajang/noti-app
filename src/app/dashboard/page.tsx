"use client";

import { FaRegClock } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Task } from "@/types/tasks";
import BottomNavBar from "@/components/layout/BottomNavBar";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { getTodayYYYYMMDD } from "@/lib/utils/date";
import { ROUTES } from "@/lib/constants/routes";

function formatTimeParts(timeStr: string | null) {
  if (!timeStr) {
    return { time: "--:--", period: "" };
  }

  const [hh, mm] = timeStr.split(":"); // "HH:MM:SS"
  const hour = Number(hh);

  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 || 12;

  return {
    time: `${hour12}:${mm}`,
    period,
  };
}

async function fetchTodayTasks(): Promise<Task[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const today = getTodayYYYYMMDD();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("scheduled_date", today)
    .order("scheduled_time", { ascending: true, nullsFirst: true });
  if (error) {

    return [];
  }

  return (data ?? []) as Task[];
}

export default function DashBoardPage() {
  const router = useRouter();
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", "today"],
    queryFn: fetchTodayTasks,
    staleTime: 1000 * 30,
  });

  const handleAddTask = () => {
    router.push(ROUTES.TASKS.ADD);
  };

  return (
    <>
      <main className="flex justify-center pb-20">
        {/* 모바일 화면 폭 느낌으로 가운데 정렬 */}
        <div className="w-full max-w-sm px-5 py-6">
          {/* 상단 헤더 */}
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">일정추가하기</h1>
            <button
              type="button"
              onClick={handleAddTask}
              aria-label="일정 추가"
              className="cursor-pointer inline-flex items-center justify-center text-emerald-500 transition hover:bg-emerald-50"
            >
              <span className="text-xl leading-none">＋</span>
            </button>
          </header>

          {/* 일정 추가 카드 */}
          <section className="mb-6">
            <button
              type="button"
              onClick={handleAddTask}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-emerald-200 cursor-pointer"
              style={{ backgroundColor: "#e3f1dcff" }}
            >
              <div className="flex h-9 w-9 items-center justify-center">
                <span className="text-lg">
                  <FaRegClock color="green" />
                </span>
              </div>
              <span className="text-sm font-medium">일정 추가</span>
            </button>
          </section>

          <div className="space-y-8 border-[0.01rem] border-[#eff0f4]" />

          {/* 오늘 섹션 */}
          <section>
            <h2 className="mt-3 mb-3 text-sm font-semibold text-slate-700">Today</h2>

            {isLoading && (
              <p className="text-xs text-slate-500">오늘 일정을 불러오는 중이에요...</p>
            )}

            {!isLoading && tasks.length === 0 && (
              <p className="text-xs text-slate-500">오늘 등록된 일정이 없어요.</p>
            )}

            {!isLoading && tasks.length > 0 && (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const { time, period } = formatTimeParts(task.scheduled_time);

                  return (
                    <article key={task.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                      {/* 시간 / 제목 / 위임자 */}
                      <div className="flex gap-3">
                        <div className="min-w-[52px] pt-1 text-xs text-slate-500">
                          <div>{time}</div>
                          <div>{period}</div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                          {task.delegate_name && (
                            <p className="mt-1 text-xs text-slate-500">
                              위임:{" "}
                              <span className="font-medium text-slate-700">
                                {task.delegate_name}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 버튼 영역 */}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: 완료 처리 로직 구현
                            console.log("완료:", task.id);
                          }}
                          className="flex-1 rounded-full bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-600"
                        >
                          완료
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: 실행 못함 처리 로직 구현
                            console.log("실행 못함:", task.id);
                          }}
                          className="flex-1 rounded-full border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          실행 못함
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <FloatingActionButton onClick={handleAddTask} />
      <BottomNavBar />
    </>
  );
}
