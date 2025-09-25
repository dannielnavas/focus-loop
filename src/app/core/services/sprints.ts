import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { format, subDays } from 'date-fns';
import { Observable } from 'rxjs';
import { Sprint, SprintResponse } from '../models/sprint.model';
import { OptimisticUIService } from './optimistic-ui';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class Sprints {
  private readonly http = inject(HttpClient);
  private readonly optimisticUI = inject(OptimisticUIService);
  private readonly storage = inject(StorageService);

  private readonly session = computed(() => this.storage.getToken());

  getSprints(userId: string | number) {
    return this.http.get<SprintResponse[]>(
      `https://focus-loop-api.danniel.dev/sprint/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  createSprint(sprint: Sprint) {
    return this.http.post<Sprint>(
      'https://focus-loop-api.danniel.dev/sprint',
      sprint,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  /**
   * Crea un sprint de manera optimista
   */
  createSprintOptimistic(sprint: Sprint): Observable<Sprint> {
    const operationId = this.optimisticUI.generateOperationId('create_sprint');

    // Crear sprint temporal con ID temporal
    const optimisticSprint: Sprint = {
      ...sprint,
      sprint_id: -Date.now(), // ID temporal negativo
    };

    return this.optimisticUI.createOptimistic(
      operationId,
      optimisticSprint,
      this.createSprint(sprint)
    );
  }

  updateSprint(id: number, sprint: Partial<Sprint>) {
    return this.http.patch<Sprint>(
      `https://focus-loop-api.danniel.dev/sprint/${id}`,
      sprint,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  /**
   * Actualiza un sprint de manera optimista
   */
  updateSprintOptimistic(
    id: number,
    sprint: Partial<Sprint>,
    originalSprint?: SprintResponse
  ): Observable<any> {
    const operationId = this.optimisticUI.generateOperationId(
      `update_sprint_${id}`
    );

    // Crear datos optimistas
    const optimisticData = originalSprint
      ? {
          ...originalSprint,
          ...sprint,
          updated_at: new Date().toISOString(),
        }
      : sprint;

    return this.optimisticUI.executeOptimistic(
      operationId,
      optimisticData,
      this.updateSprint(id, sprint),
      originalSprint
    );
  }

  deleteSprint(id: number) {
    return this.http.delete(
      `https://focus-loop-api.danniel.dev/sprints/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  generateDaily(sprint_id: number) {
    const currentDate = new Date();
    const yesterdayDate = subDays(currentDate, 1);
    const dateReport = format(yesterdayDate, "yyyy-MM-dd HH:mm:ss 'GMT'X");
    return this.http.post<{
      role: string | null;
      content: string;
      refusal: string | null;
      annotations: string[];
    }>(
      `https://focus-loop-api.danniel.dev/ai-functions/generate`,
      {
        sprint_id,
        dateReport,
      },
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }
}
