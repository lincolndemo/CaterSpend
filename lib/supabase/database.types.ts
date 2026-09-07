// Hand-written Supabase database types, generated against `supabase/migrations/0001_init.sql`.
// `npx supabase gen types typescript --local` requires a running local stack (Docker), which is
// unavailable in this environment, so these are authored by hand from the migration instead of
// the brief's generic fallback — they give real column-level type-checking at the call sites.
//
// Note on `numeric` columns (`amount`, `quoted_amount`, `monthly_budget`): PostgREST can
// serialise `numeric` as a JSON string in some configurations. These types declare the intended
// domain type (`number`), matching what `supabase gen types` would emit; `lib/data.ts` coerces
// defensively at the data layer rather than trusting the wire format.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string | null;
          monthly_budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          monthly_budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          monthly_budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_builtin: boolean;
          color_light: string;
          color_dark: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_builtin?: boolean;
          color_light: string;
          color_dark: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_builtin?: boolean;
          color_light?: string;
          color_dark?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          client?: string | null;
          event_date?: string | null;
          quoted_amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          client?: string | null;
          event_date?: string | null;
          quoted_amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          description: string;
          category_id: string;
          payment_method: string;
          job_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          amount: number;
          description: string;
          category_id: string;
          payment_method: string;
          job_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          description?: string;
          category_id?: string;
          payment_method?: string;
          job_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      income: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          amount: number;
          description: string;
          job_id?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          description?: string;
          job_id?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
