export type PlanKey = 'free' | 'monthly' | 'lifetime';

export const FREE_SPRINT_LIMIT = 2;
export const FREE_TASK_LIMIT = 30;

export interface SubscriptionPlanFromBackend {
  subscription_plan_id?: number;
  name?: string;
  price?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
