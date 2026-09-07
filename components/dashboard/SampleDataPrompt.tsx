import { EmptyState } from '@/components/ui/EmptyState';
import { loadSampleData } from '@/app/actions/sample';

export function SampleDataPrompt({ businessName }: { businessName: string | null }) {
  return (
    <div className="grid gap-5">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        {businessName ?? 'Welcome to CaterSpend'}
      </h1>
      <EmptyState
        title="Nothing recorded yet"
        body="Add your first expense, income record or job — or load a set of sample records to see how the dashboard looks."
        action={
          <form action={loadSampleData}>
            <button className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
              Load sample data
            </button>
          </form>
        }
      />
    </div>
  );
}
