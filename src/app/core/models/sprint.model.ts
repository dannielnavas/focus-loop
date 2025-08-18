export interface Sprint {
  sprint_id?: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'planned';
  user_id: number;
}

export interface SprintResponse {
  sprint_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'planned';
  user_id: number;
  countTaskPending: number;
  countTaskInProgress: number;
  countTaskCompleted: number;
}
