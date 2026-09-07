import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { IncomeForm } from '@/components/income/IncomeForm';
import { IncomeList } from '@/components/income/IncomeList';
import { TruncationNotice } from '@/components/ui/TruncationNotice';
import { loadWorkspace } from '@/lib/data';

export default async function IncomePage() {
  const { income, jobs, truncated } = await loadWorkspace();

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Income</h1>
        <Dialog
          title="Record income"
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white">
              <Plus size={16} /> Record income
            </button>
          }
        >
          <IncomeForm mode="create" jobs={jobs} />
        </Dialog>
      </div>

      {/* The list below, and the totals it prints, are built from a possibly-partial array. */}
      {truncated && <TruncationNotice />}

      <IncomeList income={income} jobs={jobs} />
    </div>
  );
}
