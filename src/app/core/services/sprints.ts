import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Sprint, SprintResponse } from '../models/sprint.model';

@Injectable({
  providedIn: 'root',
})
export class Sprints {
  private readonly http = inject(HttpClient);
  private readonly session = computed(() => localStorage.getItem('token'));

  getSprints(userId: string | number) {
    console.log(userId);
    return this.http.get<SprintResponse[]>(
      `https://my-tracker-backend-pied.vercel.app/sprint/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  createSprint(sprint: Sprint) {
    console.log(sprint);
    return this.http.post<Sprint>(
      'https://my-tracker-backend-pied.vercel.app/sprint',
      sprint,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  updateSprint(id: number, sprint: Partial<Sprint>) {
    return this.http.patch<Sprint>(
      `https://my-tracker-backend-pied.vercel.app/sprint/${id}`,
      sprint,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  deleteSprint(id: number) {
    return this.http.delete(
      `https://my-tracker-backend-pied.vercel.app/sprints/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  generateDaily(sprint_id: number) {
    return this.http.post<{
      role: string | null;
      content: string;
      refusal: string | null;
      annotations: string[];
    }>(
      `https://my-tracker-backend-pied.vercel.app/ai-functions/generate`,
      {
        sprint_id,
        dateReport: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }
}
