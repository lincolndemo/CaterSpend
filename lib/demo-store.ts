/**
 * TEMPORARY in-memory data store — PREVIEW ONLY.
 *
 * This exists so the UI can be built and viewed before Supabase is wired in
 * (Tasks 7-9). It is a module-level singleton: it survives across requests
 * within one dev-server process and resets when that process restarts.
 *
 * It is NOT multi-tenant, NOT persistent, and NOT authorised. Every caller
 * shares one workspace.
 *
 * REMOVAL PLAN: when Supabase lands, `lib/data.ts#loadWorkspace` swaps its body
 * back to the Supabase queries in the Task 10 brief and the mutation helpers
 * below are replaced by Server Actions writing through the RLS-protected
 * client. Nothing else in the app should import this file — pages read through
 * `loadWorkspace()` and nothing else.
 */
import type { Category, Expense, Income, Job, PaymentMethod, Profile } from './types';

const USER_ID = 'demo-user';

function nowISO(): string {
  return new Date().toISOString();
}

let seq = 0;
export function demoId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

/** Calendar date `monthsBack` months before the current month, on day `d`. */
function iso(monthsBack: number, d: number): string {
  const base = new Date();
  const shifted = new Date(base.getFullYear(), base.getMonth() - monthsBack, 1);
  const y = shifted.getFullYear();
  const m = shifted.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const BUILTIN_CATEGORIES: ReadonlyArray<[string, string, string, number]> = [
  ['Ingredients', '#2a78d6', '#3987e5', 10],
  ['Packaging', '#eb6834', '#d95926', 20],
  ['Transport', '#1baf7a', '#199e70', 30],
  ['Gas/Fuel', '#eda100', '#c98500', 40],
  ['Staff/Labour', '#e87ba4', '#d55181', 50],
  ['Equipment', '#008300', '#008300', 60],
  ['Marketing', '#4a3aa7', '#9085e9', 70],
  ['Utilities', '#e34948', '#e66767', 80],
  ['Other', '#898781', '#898781', 90],
];

export const CUSTOM_CATEGORY_COLORS = { light: '#9C7E4C', dark: '#D3AD70' } as const;

type Store = {
  profile: Profile;
  categories: Category[];
  jobs: Job[];
  expenses: Expense[];
  income: Income[];
};

function seed(): Store {
  const created = nowISO();

  const categories: Category[] = BUILTIN_CATEGORIES.map(([name, light, dark, sort]) => ({
    id: `cat-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    user_id: USER_ID,
    name,
    is_builtin: true,
    color_light: light,
    color_dark: dark,
    sort_order: sort,
    created_at: created,
  }));

  const catId = (name: string): string => categories.find((c) => c.name === name)!.id;

  const job1: Job = {
    id: 'job-adeyemi',
    user_id: USER_ID,
    name: 'Adeyemi Wedding',
    client: 'Mrs Adeyemi',
    event_date: iso(1, 20),
    quoted_amount: 650000,
    notes: null,
    created_at: created,
    updated_at: created,
  };
  const job2: Job = {
    id: 'job-church',
    user_id: USER_ID,
    name: 'Church Anniversary',
    client: 'Grace Chapel',
    event_date: iso(3, 27),
    quoted_amount: 210000,
    notes: null,
    created_at: created,
    updated_at: created,
  };

  const rows: Array<[number, number, string, number, string, PaymentMethod, string | null, string | null]> = [
    [0, 1, 'Tomatoes for weekend order', 18500, 'Ingredients', 'Bank Transfer', null, 'Purchased from Kuto Market'],
    [0, 1, 'Delivery to client venue', 7000, 'Transport', 'Cash', null, null],
    [1, 28, 'Food packs (100 units)', 12000, 'Packaging', 'Bank Transfer', null, null],
    [1, 26, 'Cooking gas refill', 15000, 'Gas/Fuel', 'Cash', null, null],
    [1, 20, 'Chicken for wedding order', 32000, 'Ingredients', 'Bank Transfer', job1.id, null],
    [1, 20, 'Beef and turkey for wedding', 95000, 'Ingredients', 'Bank Transfer', job1.id, null],
    [1, 15, 'Assistant cook, weekend shift', 20000, 'Staff/Labour', 'Cash', null, null],
    [1, 20, 'Two extra hands for wedding', 45000, 'Staff/Labour', 'Cash', job1.id, null],
    [1, 10, 'Rice and beans, bulk', 41000, 'Ingredients', 'Bank Transfer', null, null],
    [1, 5, 'Instagram ad boost', 6000, 'Marketing', 'Debit Card', null, null],
    [2, 24, 'Cooler box repair', 9500, 'Equipment', 'Cash', null, null],
    [2, 18, 'Generator fuel', 13000, 'Gas/Fuel', 'Cash', null, null],
    [2, 14, 'Onions, pepper, tatashe', 27500, 'Ingredients', 'Bank Transfer', null, null],
    [2, 9, 'Foil trays and cups', 16800, 'Packaging', 'Debit Card', null, null],
    [2, 3, 'Electricity token', 11000, 'Utilities', 'Bank Transfer', null, null],
    [3, 27, 'Extra hands, church event', 25000, 'Staff/Labour', 'Cash', job2.id, null],
    [3, 27, 'Ingredients, church anniversary', 72000, 'Ingredients', 'Bank Transfer', job2.id, null],
    [3, 16, 'Uber to supplier warehouse', 5200, 'Transport', 'Debit Card', null, null],
    [3, 11, 'Flyers for open day', 8000, 'Marketing', 'Cash', null, null],
    [3, 6, 'Spare gas cylinder', 14500, 'Other', 'Cash', null, null],
  ];

  const expenses: Expense[] = rows.map(([back, day, description, amount, cat, method, jobId, notes]) => ({
    id: demoId('exp'),
    user_id: USER_ID,
    date: iso(back, day),
    amount,
    description,
    category_id: catId(cat),
    payment_method: method,
    job_id: jobId,
    notes,
    created_at: created,
    updated_at: created,
  }));

  const income: Income[] = (
    [
      [1, 12, 'Deposit, Adeyemi wedding', 350000, job1.id, 'Client payment'],
      [1, 22, 'Balance, Adeyemi wedding', 300000, job1.id, 'Client payment'],
      [3, 25, 'Deposit, church anniversary', 120000, job2.id, 'Client payment'],
      [0, 1, 'Small order, office lunch', 32000, null, 'Walk-in order'],
    ] as Array<[number, number, string, number, string | null, string | null]>
  ).map(([back, day, description, amount, jobId, source]) => ({
    id: demoId('inc'),
    user_id: USER_ID,
    date: iso(back, day),
    amount,
    description,
    job_id: jobId,
    source,
    created_at: created,
    updated_at: created,
  }));

  return {
    profile: {
      id: USER_ID,
      business_name: 'Demo Catering',
      monthly_budget: 120000,
      created_at: created,
      updated_at: created,
    },
    categories,
    jobs: [job1, job2],
    expenses,
    income,
  };
}

// Survives hot reloads in dev, where module state is otherwise discarded.
const globalStore = globalThis as unknown as { __caterspendDemo?: Store };
export const store: Store = (globalStore.__caterspendDemo ??= seed());

export const DEMO_USER_ID = USER_ID;

export function touch(): string {
  return nowISO();
}
