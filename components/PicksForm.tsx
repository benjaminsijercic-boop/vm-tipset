'use client';
import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const stages = ['quarter_finalists','semi_finalists','finalists','winner'] as const;

export function PicksForm({ userId, teams, existing }: { userId: string; teams: string[]; existing?: any }) {
  const supabase = createBrowserSupabase();
  const [status, setStatus] = useState('');
  const [groupPicks, setGroupPicks] = useState<Record<string, string[]>>(existing?.group_picks ?? {});
  const [knockout, setKnockout] = useState<Record<string, string[]>>(existing?.knockout_picks ?? {});
  const [bonus, setBonus] = useState<Record<string, string>>(existing?.bonus_picks ?? {});

  const save = async () => {
    setStatus('Sparar...');
    const { error } = await supabase.from('picks').upsert({
      user_id: userId,
      group_picks: groupPicks,
      knockout_picks: knockout,
      bonus_picks: bonus,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setStatus(error ? error.message : 'Sparat!');
  };

  return <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      {groups.map(g => <div key={g} className="border rounded-2xl p-4">
        <h3 className="font-bold mb-3">Grupp {g}</h3>
        {[0,1,2,3].map(i => <select key={i} className="w-full border rounded-xl p-2 mb-2" value={groupPicks[g]?.[i] ?? ''} onChange={e => setGroupPicks(prev => ({...prev, [g]: Object.assign([...(prev[g] ?? [])], {[i]: e.target.value})}))}>
          <option value="">Plats {i + 1}</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>)}
      </div>)}
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {stages.map(stage => <div key={stage} className="border rounded-2xl p-4">
        <h3 className="font-bold mb-3">{stage.replace('_', ' ')}</h3>
        {Array.from({ length: stage === 'winner' ? 1 : stage === 'finalists' ? 2 : stage === 'semi_finalists' ? 4 : 8 }).map((_, i) => <select key={i} className="w-full border rounded-xl p-2 mb-2" value={knockout[stage]?.[i] ?? ''} onChange={e => setKnockout(prev => ({...prev, [stage]: Object.assign([...(prev[stage] ?? [])], {[i]: e.target.value})}))}>
          <option value="">Lag {i + 1}</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>)}
      </div>)}
    </div>

    <div className="border rounded-2xl p-4 grid md:grid-cols-2 gap-3">
      {['skytteligavinnare','flest_mal_gruppspel','sverige_hur_langt','flopp'].map(key => <label key={key} className="text-sm font-medium">{key.replaceAll('_', ' ')}<input className="mt-1 w-full border rounded-xl p-2" value={bonus[key] ?? ''} onChange={e => setBonus(prev => ({...prev, [key]: e.target.value}))}/></label>)}
    </div>

    <button onClick={save} className="rounded-xl bg-slate-900 text-white px-5 py-3 font-bold">Spara tips</button>
    {status && <p className="text-sm text-slate-600">{status}</p>}
  </div>;
}
