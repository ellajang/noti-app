"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getTasks,
  getTodayTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  type TaskFilters,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/api/tasks";
import { queryClient } from "@/lib/tanstack/queryClient";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type { TaskStatus } from "@/types/tasks";

/**
 * Tasks 목록 조회
 */
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => getTasks(filters),
  });
}

/**
 * 오늘 날짜 Tasks 조회
 */
export function useTodayTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.today(),
    queryFn: getTodayTasks,
  });
}

/**
 * 단일 Task 조회
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

/**
 * Task 생성
 */
export function useCreateTask() {
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Task 수정
 */
export function useUpdateTask() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Task 상태 업데이트 (완료/실패)
 */
export function useUpdateTaskStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Task 삭제
 */
export function useDeleteTask() {
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
