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
      `http://localhost:3000/sprint/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  createSprint(sprint: Sprint) {
    console.log(sprint);
    return this.http.post<Sprint>('http://localhost:3000/sprint', sprint, {
      headers: {
        Authorization: `Bearer ${this.session()}`,
      },
    });
  }

  updateSprint(id: number, sprint: Partial<Sprint>) {
    return this.http.patch<Sprint>(
      `http://localhost:3000/sprint/${id}`,
      sprint,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  deleteSprint(id: number) {
    return this.http.delete(`http://localhost:3000/sprints/${id}`, {
      headers: {
        Authorization: `Bearer ${this.session()}`,
      },
    });
  }
}
