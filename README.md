# CaterSpend

Expense, income and job tracking for catering businesses. Multi-tenant: each
account sees only its own records, enforced by Supabase Row Level Security.

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Supabase
(Postgres + Auth) · Vercel.

Reads happen in Server Components, writes in Server Actions. The app holds only
the anon key — there is no service-role key anywhere, because RLS is the single
authorisation point. Every `user_id` written comes from the session via
`requireUser()`, never from a form field, URL parameter or hidden input.

## Local setup

```bash
npm install
npx supabase start                 # needs Docker; prints the API URL and anon key
cp .env.local.example .env.local   # paste both values in
npx supabase db reset              # applies supabase/migrations
npm run dev
```

Local email confirmation is disabled in `supabase/config.toml`. When it is
enabled, confirmation emails land in the local mail viewer at
http://127.0.0.1:54324.

Use `127.0.0.1`, not `localhost`, when opening the app on Windows: `localhost`
resolves to `::1` first and the dev server binds IPv4.

## Tests

```bash
npm test                   # unit tests — pure functions, no database
npm run typecheck
npm run build

npm run test:integration   # RLS and constraints — needs `npx supabase start`
npm run e2e                # playwright happy path — needs the dev server and a local stack
```

**`npm test`, `npm run typecheck` and `npm run build` are the suites that run
anywhere.** All three are green: 107 unit tests across 11 files.

**`test:integration` and `e2e` have not been executed on this machine.** Both
need a local Postgres, which means Docker Desktop, which is not installed here.
The suites are written, collected by their runners (13 integration tests, 1 e2e
spec) and typecheck clean, but nothing has run them end to end. Run them once
you have `npx supabase start` working, and expect to fix selector details in the
e2e spec on first contact — those assertions were derived by reading the
components, not by watching a browser.

Neither suite may be pointed at the hosted project. Both sign up real users and
write real rows.

## Deploying

**Supabase.** Either `npx supabase link --project-ref <ref> && npx supabase db
push`, or paste `supabase/migrations/0001_init.sql` into the project's SQL
Editor and run it. The hosted project backing this app was set up the second
way, so its migration history is empty — before the first `db push` to it, run
`npx supabase migration repair --status applied 0001` or the push will try to
apply `0001_init.sql` a second time and fail on the existing objects.

In Auth settings, enable email and password sign-in, and add the production
domain to the redirect allow list — **that domain only**. Do not add
`http://localhost:3000` to a production project. Allow-listing it turns a
misaddressed confirmation link into a silent failure: Supabase accepts the
redirect, the email goes out, and the user clicks through to their own machine
where nothing is listening. Left off the list, the same mistake is rejected
outright and you see it on your first test signup. For local work, use a
separate development project and allow-list localhost there.

Leave "Confirm email" on for production; turn it off only for a throwaway test
project.

**Vercel.** Import the repo. Set these environment variables, all public:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` — recommended. The origin confirmation emails link back
  to. Leave it unset and the app derives the origin from the request it is
  serving, using the `x-forwarded-proto` and `x-forwarded-host` headers Vercel
  sets, which is correct for a normal deployment. Set it to override that when
  something in front of the app rewrites or drops those headers, or to pin a
  custom domain rather than whichever hostname the request arrived on.

Do not set a service-role key. Nothing in the application uses one, and adding
one to the environment would put a key that bypasses every RLS policy next to
code that never needs it.

## Schema

Five tables — `profiles`, `categories`, `jobs`, `expenses`, `income` — defined
in `supabase/migrations/0001_init.sql`. A trigger on `auth.users` seeds each new
account with a profile and nine built-in categories.

Deleting a job detaches its expenses and income (`on delete set null`) rather
than destroying them. A category still used by an expense cannot be deleted: the
foreign key is `on delete no action`, not `restrict`, so the check defers to end
of statement — `restrict` would fire immediately and make deleting the auth user
abort, because the cascade to categories is queued before the cascade to
expenses.

Built-in categories cannot be renamed or deleted. That is enforced in the RLS
policies (`and not is_builtin`), not in the UI, so it holds against a direct API
call as well.

## Known limits

**No pagination.** Every page loads the whole workspace and computes totals in
memory. Reads are capped, and PostgREST's own `max-rows` is 1000. When a read
comes back short, or its count cannot be read, every money page shows a banner
saying the figures may be incomplete rather than presenting a partial total as a
whole one. Real pagination is deferred past this MVP; the banner is the honest
interim answer, not the finished one.

**Sample data is not transactional.** PostgREST gives each request its own
transaction, so `loadSampleData` inserts jobs, then expenses, then income, and
deletes what it already created if a later step fails. A failure during that
undo would leave a partially seeded account.

**`middleware.ts` is deprecated in Next 16** in favour of `proxy.ts`. The build
warns; the behaviour is unchanged. Renaming it is a follow-up.
