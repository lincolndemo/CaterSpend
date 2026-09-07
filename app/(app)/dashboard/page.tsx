import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { MonthlyBars } from '@/components/charts/MonthlyBars';
import { BudgetBar } from '@/components/dashboard/BudgetBar';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { EmptyState } from '@/components/ui/EmptyState';
import { loadWorkspace } from '@/lib/data';
import { lastNMonthKeys, monthKey, todayISO } from '@/lib/dates';
import { formatNaira } from '@/lib/money';
import { categoryTotals, jobFigures, monthlyTotals, sumAmounts } from '@/lib/totals';

export default async function DashboardPage() {
  const { profile, categories, jobs, expenses, income } = await loadWorkspace();

  const today = todayISO();
  const thisMonth = monthKey(today);
  const monthExpenses = expenses.filter((e) => monthKey(e.date) === thisMonth);
  const monthIncome = income.filter((i) => monthKey(i.date) === thisMonth);

  const spent = sumAmounts(monthExpenses);
  const collected = sumAmounts(monthIncome);
  const outstanding = jobs.reduce((total, job) => total + jobFigures(job, expenses, income).outstanding, 0);
  const net = collected - spent;

  const slices = categoryTotals(monthExpenses, categories);
  const buckets = monthlyTotals(expenses, income, lastNMonthKeys(6, today));

  // Task 17 swaps this empty state for the sample-data prompt.
  if (expenses.length === 0 && income.length === 0 && jobs.length === 0) {
    return (
      <div className="grid gap-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">
          {profile.business_name ?? 'Welcome to CaterSpend'}
        </h1>
        <EmptyState
          title="Nothing recorded yet"
          body="Add your first expense, income record or job to see your figures here."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        {profile.business_name ?? 'Dashboard'}
      </h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Spent this month" value={formatNaira(spent)} hint={`${monthExpenses.length} records`} />
        <KpiCard
          label="Collected this month"
          value={formatNaira(collected)}
          tone="good"
          hint={`${monthIncome.length} records`}
        />
        <KpiCard label="Net this month" value={formatNaira(net)} tone={net >= 0 ? 'good' : 'critical'} />
        <KpiCard
          label="Outstanding on jobs"
          value={formatNaira(outstanding)}
          tone="gold"
          hint={`${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`}
        />
      </div>

      <BudgetBar spent={spent} budget={profile.monthly_budget} />

      <div className="grid gap-3 lg:grid-cols-2">
        <CategoryDonut slices={slices} total={spent} />
        <MonthlyBars buckets={buckets} currentKey={thisMonth} />
      </div>

      <RecentActivity expenses={expenses} income={income} categories={categories} jobs={jobs} />
    </div>
  );
}
