import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/types/tasks";

/**
 * Task 생성 입력 타입
 */
export type CreateTaskInput = {
  title: string;
  description?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time?: string | null; // HH:MM:SS
  delegate_name?: string | null;
  status?: TaskStatus;
};

/**
 * Task 수정 입력 타입
 */
export type UpdateTaskInput = Partial<CreateTaskInput>;

/**
 * Task 목록 필터 타입
 */
export type TaskFilters = {
  date?: string; // YYYY-MM-DD
  status?: TaskStatus;
};

/**
 * 모든 Tasks 가져오기 (필터 옵션)
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const supabase = createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  // 날짜 필터
  if (filters?.date) {
    query = query.eq("scheduled_date", filters.date);
  }

  // 상태 필터
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

/**
 * 오늘 날짜의 Tasks 가져오기
 */
export async function getTodayTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return getTasks({ date: today });
}

/**
 * 특정 Task 가져오기
 */
export async function getTask(id: string): Promise<Task> {
  const supabase = createClient();

  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();

  if (error) throw error;

  return data;
}

/**
 * Task 생성
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("사용자 인증이 필요합니다.");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userData.user.id,
      title: input.title,
      description: input.description || null,
      scheduled_date: input.scheduled_date,
      scheduled_time: input.scheduled_time || null,
      delegate_name: input.delegate_name || null,
      status: input.status || "todo",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Task 수정
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Task 상태 업데이트
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return updateTask(id, { status });
}

/**
 * Task 삭제
 */
export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
}
