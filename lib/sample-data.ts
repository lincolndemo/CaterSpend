import { lastNMonthKeys } from './dates';
import type { PaymentMethod } from './types';

export type SampleJob = {
  key: 'wedding' | 'anniversary';
  name: string;
  client: string;
  eventOffsetDays: number;
  quoted_amount: number;
};

export type SampleExpense = {
  date: string;
  amount: number;
  description: string;
  categoryName: string;
  payment_method: PaymentMethod;
  jobKey: SampleJob['key'] | null;
};

export type SampleIncome = {
  date: string;
  amount: number;
  description: string;
  jobKey: SampleJob['key'];
  source: PaymentMethod;
};

// [monthIndex 0..3 (0 = three months ago), day, amount, description, category, method, job]
const EXPENSE_TEMPLATE: [number, number, number, string, string, PaymentMethod, SampleJob['key'] | null][] = [
  [0, 4, 42000, 'Rice and beans in bulk', 'Ingredients', 'Cash', null],
  [0, 9, 18500, 'Disposable plates', 'Packaging', 'Cash', null],
  [0, 15, 12000, 'Van hire to Ikeja', 'Transport', 'Bank Transfer', null],
  [0, 21, 9500, 'Cooking gas refill', 'Gas/Fuel', 'Cash', null],
  [0, 27, 30000, 'Two kitchen assistants', 'Staff/Labour', 'Cash', null],
  [1, 3, 66000, 'Chicken and goat meat', 'Ingredients', 'Bank Transfer', 'anniversary'],
  [1, 8, 14000, 'Takeaway packs', 'Packaging', 'Cash', 'anniversary'],
  [1, 12, 7500, 'Fuel for generator', 'Gas/Fuel', 'Cash', 'anniversary'],
  [1, 17, 25000, 'Serving staff for the day', 'Staff/Labour', 'Cash', 'anniversary'],
  [1, 24, 5200, 'Instagram boost', 'Marketing', 'Debit Card', null],
  [2, 2, 88000, 'Bulk market run', 'Ingredients', 'Bank Transfer', 'wedding'],
  [2, 6, 22000, 'Chafing dishes', 'Equipment', 'Debit Card', 'wedding'],
  [2, 11, 16500, 'Cold room rental', 'Equipment', 'Bank Transfer', 'wedding'],
  [2, 14, 13000, 'Transport to venue', 'Transport', 'Cash', 'wedding'],
  [2, 19, 45000, 'Four service staff', 'Staff/Labour', 'Cash', 'wedding'],
  [2, 23, 11000, 'Electricity bill', 'Utilities', 'Bank Transfer', null],
  [3, 1, 38000, 'Vegetables and spices', 'Ingredients', 'Cash', 'wedding'],
  [3, 5, 8600, 'Foil trays', 'Packaging', 'Cash', 'wedding'],
  [3, 8, 6400, 'Cooking gas refill', 'Gas/Fuel', 'Cash', null],
  [3, 12, 4300, 'Printed flyers', 'Marketing', 'Cash', null],
];

const INCOME_TEMPLATE: [number, number, number, string, SampleJob['key'], PaymentMethod][] = [
  [1, 5, 105000, 'Anniversary deposit', 'anniversary', 'Bank Transfer'],
  [1, 26, 105000, 'Anniversary balance', 'anniversary', 'Cash'],
  [2, 4, 325000, 'Wedding deposit', 'wedding', 'Bank Transfer'],
  [3, 10, 200000, 'Wedding part payment', 'wedding', 'Bank Transfer'],
];

/**
 * A believable four months of a small Nigerian catering business, keyed to whatever "today" is so
 * the dashboard's six-month bars and this-month KPIs have something in them the moment it loads.
 *
 * Categories are named, not identified: the action resolves each name against the signed-in user's
 * own category rows, so this file never has to know an id and never invents one.
 */
export function buildSampleData(today: string) {
  const months = lastNMonthKeys(4, today);
  const dateFor = (monthIndex: number, day: number) => {
    // A month key plus a literal day skips the calendar entirely, so a template day of 30 would
    // produce `2026-02-30` — a string every helper here parses happily and Postgres rejects. Every
    // month has a 28th; nothing above it is safe without knowing which month it landed in.
    if (day < 1 || day > 28) throw new RangeError(`sample day ${day} is not in every month`);
    return `${months[monthIndex]}-${String(day).padStart(2, '0')}`;
  };

  const jobs: SampleJob[] = [
    {
      key: 'wedding',
      name: 'Adeyemi Wedding',
      client: 'Mrs Adeyemi',
      eventOffsetDays: 15,
      quoted_amount: 650000,
    },
    {
      key: 'anniversary',
      name: 'Church Anniversary',
      client: 'Grace Chapel',
      eventOffsetDays: -30,
      quoted_amount: 210000,
    },
  ];

  const expenses: SampleExpense[] = EXPENSE_TEMPLATE.map(
    ([monthIndex, day, amount, description, categoryName, payment_method, jobKey]) => ({
      date: dateFor(monthIndex, day),
      amount,
      description,
      categoryName,
      payment_method,
      jobKey,
    }),
  );

  const income: SampleIncome[] = INCOME_TEMPLATE.map(
    ([monthIndex, day, amount, description, jobKey, source]) => ({
      date: dateFor(monthIndex, day),
      amount,
      description,
      jobKey,
      source,
    }),
  );

  return { jobs, expenses, income };
}
