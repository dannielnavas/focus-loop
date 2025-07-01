import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task as TaskModel, TaskResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class Task {
  private readonly http = inject(HttpClient);

  getTasks(userId: string) {
    return this.http.get<TaskResponse[]>(
      `http://localhost:3000/tasks?user_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJzdWIiOjEsImlhdCI6MTc1MTMzNDczOH0.d-c1ir582hacgL0pD1h5hXsbSIssXQAeCNexrE197rU`,
        },
      }
    );
  }

  createTask(task: TaskModel) {
    return this.http.post<TaskModel>('http://localhost:3000/tasks', task, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJzdWIiOjEsImlhdCI6MTc1MTMzNDczOH0.d-c1ir582hacgL0pD1h5hXsbSIssXQAeCNexrE197rU`,
      },
    });
  }

  updateTask(id: number, task: TaskModel) {
    return this.http.patch<TaskModel>(
      `http://localhost:3000/tasks/${id}`,
      task,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJzdWIiOjEsImlhdCI6MTc1MTMzNDczOH0.d-c1ir582hacgL0pD1h5hXsbSIssXQAeCNexrE197rU`,
        },
      }
    );
  }
}
