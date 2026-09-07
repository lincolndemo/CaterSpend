import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { TruncationNotice } from '@/components/ui/TruncationNotice';
import { loadWorkspace } from '@/lib/data';

export default async function ExpensesPage() {
  const { expenses, categories, jobs, truncated } = await loadWorkspace();

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Expenses</h1>
        <Dialog
          title="Add expense"
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white">
              <Plus size={16} /> Add expense
            </button>
          }
        >
          <ExpenseForm mode="create" categories={categories} jobs={jobs} />
        </Dialog>
      </div>

      {/* The list below, and the totals it prints, are built from a possibly-partial array. */}
      {truncated && <TruncationNotice />}

      <ExpenseList expenses={expenses} categories={categories} jobs={jobs} />
    </div>
  );
}
