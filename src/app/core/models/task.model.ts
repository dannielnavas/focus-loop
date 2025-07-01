export interface Task {
  task_id?: number;
  title: string;
  status_task_id: number;
  user_id: number;
}

export interface TaskResponse {
  task_id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  statusTask: StatusTask;
}

export interface StatusTask {
  status_task_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
