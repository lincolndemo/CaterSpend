import { loadWorkspace } from '@/lib/data';

export default async function DashboardPage() {
  const { expenses, income } = await loadWorkspace();
  return (
    <p className="text-[var(--ink-600)]">
      {expenses.length} expenses, {income.length} income records.
    </p>
  );
}
