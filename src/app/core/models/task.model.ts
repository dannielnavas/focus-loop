export interface Task {
  task_id?: number;
  title: string;
  status_task_id: number;
  position?: number;
  sprint_id: number;
  date_end?: string;
}

export interface TaskResponse {
  task_id: number;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  statusTask: StatusTask;
  date_end: string | null;
}

export interface StatusTask {
  status_task_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
