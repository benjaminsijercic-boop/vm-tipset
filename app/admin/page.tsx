import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { AdminResults } from './results';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');
  const { data: teams } = await supabase.from('teams').select('name').order('name');
  const { data: actual } = await supabase.from('actual_results').select('*').eq('id', 1).maybeSingle();
  return <>
    <Header email={session.user.email} isAdmin />
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <Card title="Admin: faktiska resultat"><AdminResults teams={(teams ?? []).map((t: any) => t.name)} existing={actual} /></Card>
    </main>
  </>;
}
