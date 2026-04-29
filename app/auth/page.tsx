'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function AuthPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) return setMessage(error.message);
      setMessage('Konto skapat. Logga in om du inte skickades vidare automatiskt.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMessage(error.message);
    }
    router.push('/dashboard');
    router.refresh();
  };

  return <main className="min-h-screen grid place-items-center p-4">
    <div className="w-full max-w-md bg-white rounded-3xl border shadow-sm p-6">
      <h1 className="text-3xl font-black mb-2">🏆 VM-tipset 2026</h1>
      <p className="text-slate-600 mb-6">Logga in eller skapa konto för att lägga ditt tips.</p>
      {mode === 'signup' && <input className="w-full border rounded-xl p-3 mb-3" placeholder="Namn" value={name} onChange={e => setName(e.target.value)} />}
      <input className="w-full border rounded-xl p-3 mb-3" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full border rounded-xl p-3 mb-4" placeholder="Lösenord" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={submit} className="w-full bg-slate-900 text-white rounded-xl p-3 font-bold">{mode === 'login' ? 'Logga in' : 'Skapa konto'}</button>
      <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full mt-3 text-sm underline">{mode === 'login' ? 'Skapa konto istället' : 'Jag har redan konto'}</button>
      {message && <p className="text-sm text-slate-600 mt-4">{message}</p>}
    </div>
  </main>;
}
