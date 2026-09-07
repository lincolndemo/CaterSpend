import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TruncationNotice } from '@/components/ui/TruncationNotice';
import { JobForm } from '@/components/jobs/JobForm';
import { JobCard } from '@/components/jobs/JobCard';
import { loadWorkspace } from '@/lib/data';
import { jobFigures } from '@/lib/totals';

export default async function JobsPage() {
  const { jobs, expenses, income, truncated } = await loadWorkspace();

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Jobs</h1>
        <Dialog
          title="Add job"
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white">
              <Plus size={16} /> Add job
            </button>
          }
        >
          <JobForm mode="create" />
        </Dialog>
      </div>

      {/* Each card states spend, profit and outstanding from the same possibly-partial arrays. */}
      {truncated && <TruncationNotice />}

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          body="Add a job to track what you quoted, what you have collected, and what you spent on it."
        />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} figures={jobFigures(job, expenses, income)} />
          ))}
        </div>
      )}
    </div>
  );
}
