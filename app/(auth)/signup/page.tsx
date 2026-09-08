import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';
import { signUp } from '@/app/actions/auth';

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-4 text-lg font-semibold">Create your account</h1>
      <AuthForm mode="signup" action={signUp} />
      <p className="mt-5 text-sm text-[var(--ink-mute)]">
        Already have one? <Link className="text-[var(--accent)] underline" href="/login">Sign in</Link>
      </p>
    </>
  );
}
