import { inject, Injectable } from '@angular/core';
import { FREE_SPRINT_LIMIT, FREE_TASK_LIMIT, PlanKey } from '../models/plan.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private readonly storage = inject(StorageService);

  /**
   * Maps subscription_plan_id (number) or name (string) from backend to PlanKey.
   * Unknown plans default to 'free' (most restrictive).
   */
  getPlanKey(): PlanKey {
    const plan = this.storage.getSubscriptionPlan();
    if (!plan) return 'free';

    const name = (plan.name ?? '').toLowerCase();
    const id = plan.subscription_plan_id;

    if (name === 'monthly' || id === 2) return 'monthly';
    if (name === 'lifetime' || id === 3) return 'lifetime';

    return 'free';
  }

  getSprintLimit(): number {
    return this.getPlanKey() === 'free' ? FREE_SPRINT_LIMIT : Infinity;
  }

  getTaskLimit(): number {
    return this.getPlanKey() === 'free' ? FREE_TASK_LIMIT : Infinity;
  }

  isFreePlan(): boolean {
    return this.getPlanKey() === 'free';
  }
}
