export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Debit Card', 'Other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Colour pair every custom (non-built-in) category gets, per the artifact.
export const CUSTOM_CATEGORY_COLORS = { light: '#9C7E4C', dark: '#D3AD70' } as const;

export type Profile = {
  id: string;
  business_name: string | null;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  is_builtin: boolean;
  color_light: string;
  color_dark: string;
  sort_order: number;
  created_at: string;
};

export type Job = {
  id: string;
  user_id: string;
  name: string;
  client: string | null;
  event_date: string | null;
  quoted_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  description: string;
  category_id: string;
  payment_method: PaymentMethod;
  job_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  description: string;
  job_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};
