import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';
import { signIn } from '@/app/actions/auth';

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-4 text-lg font-semibold">Sign in</h1>
      <AuthForm mode="login" action={signIn} />
      <p className="mt-5 text-sm text-[var(--ink-mute)]">
        New here? <Link className="text-[var(--accent)] underline" href="/signup">Create an account</Link>
      </p>
    </>
  );
}
