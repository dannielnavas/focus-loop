export interface Auth {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    user_id: number;
    email: string;
    full_name: string;
    profile_image: string;
    role: string;
    created_at: string;
    updated_at: string;
    subscriptionPlan: {
      subscription_plan_id: number;
      name: string;
      price: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
  };
}
