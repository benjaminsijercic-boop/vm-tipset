import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Leaderboard } from '@/components/Leaderboard';
import { PicksForm } from '@/components/PicksForm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth');

  await supabase.from('profiles').upsert({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name ?? session.user.email }, { onConflict: 'id' });
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: teams } = await supabase.from('teams').select('name').order('name');
  const { data: pick } = await supabase.from('picks').select('*').eq('user_id', session.user.id).maybeSingle();
  const { data: leaderboard } = await supabase.from('leaderboard').select('name, points').order('points', { ascending: false });

  return <>
    <Header email={session.user.email} isAdmin={profile?.role === 'admin'} />
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-6">
        <h1 className="text-3xl font-black">Välkommen, {profile?.name ?? session.user.email}</h1>
        <p className="text-slate-200 mt-2">Lägg ditt tips, följ tabellen och njut av trash talk.</p>
      </section>
      <Card title="Leaderboard"><Leaderboard rows={(leaderboard ?? []).map((r: any) => ({ name: r.name, points: r.points ?? 0 }))} /></Card>
      <Card title="Mitt tips"><PicksForm userId={session.user.id} teams={(teams ?? []).map((t: any) => t.name)} existing={pick} /></Card>
    </main>
  </>;
}
