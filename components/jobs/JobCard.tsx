import { Dialog } from '@/components/ui/Dialog';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { JobForm } from './JobForm';
import { deleteJob } from '@/app/actions/jobs';
import { formatDateShort } from '@/lib/dates';
import { formatNaira } from '@/lib/money';
import type { JobFigures } from '@/lib/totals';
import type { Job } from '@/lib/types';

export function JobCard({ job, figures }: { job: Job; figures: JobFigures }) {
  const profitColor = figures.profit >= 0 ? 'var(--good)' : 'var(--critical)';

  return (
    <article className="card grid gap-4 p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{job.name}</h2>
          <p className="text-sm text-[var(--ink-mute)]">
            {job.client ?? 'No client recorded'}
            {job.event_date ? ` · ${formatDateShort(job.event_date)}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            title="Edit job"
            trigger={
              <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
                Edit
              </button>
            }
          >
            <JobForm mode="edit" job={job} />
          </Dialog>
          <form action={deleteJob}>
            <input type="hidden" name="id" value={job.id} />
            <ConfirmButton
              message={`Delete "${job.name}"? Its ${figures.expCount} expense and ${figures.incCount} income records stay, but lose their job link.`}
            >
              Delete
            </ConfirmButton>
          </form>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Quoted" value={formatNaira(figures.quoted)} />
        <Figure label={`Collected (${figures.incCount})`} value={formatNaira(figures.collected)} />
        <Figure label={`Spent (${figures.expCount})`} value={formatNaira(figures.spent)} />
        <Figure label="Outstanding" value={formatNaira(figures.outstanding)} color="var(--gold)" />
      </dl>

      <p className="text-sm text-[var(--ink-600)]">
        Profit so far:{' '}
        <span className="num font-medium" style={{ color: profitColor }}>
          {formatNaira(figures.profit)}
        </span>
      </p>

      {job.notes && <p className="text-sm text-[var(--ink-mute)]">{job.notes}</p>}
    </article>
  );
}

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-2)] p-3">
      <dt className="text-xs uppercase tracking-wide text-[var(--ink-mute)]">{label}</dt>
      <dd className="num mt-1 font-medium" style={color ? { color } : undefined}>
        {value}
      </dd>
    </div>
  );
}
