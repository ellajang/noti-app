export type TaskStatus = "todo" | "done" | "failed";

export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_date: string; // 'YYYY-MM-DD'
  scheduled_time: string | null; // 'HH:MM:SS' 또는 null
  delegate_name: string | null;
  recurrence: RecurrenceType | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
};
