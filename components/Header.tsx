'use client';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({ email, isAdmin }: { email?: string | null; isAdmin?: boolean }) {
  const router = useRouter();
  const signOut = async () => {
    await createBrowserSupabase().auth.signOut();
    router.push('/auth');
    router.refresh();
  };
  return <header className="bg-white border-b">
    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
      <Link href="/dashboard" className="font-black text-xl">🏆 VM-tipset 2026</Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
        {email && <span className="hidden sm:inline text-slate-500">{email}</span>}
        {email && <button onClick={signOut} className="rounded-xl bg-slate-900 text-white px-3 py-2">Logga ut</button>}
      </nav>
    </div>
  </header>;
}
