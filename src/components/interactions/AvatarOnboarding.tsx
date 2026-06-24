'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { Compass, Sparkles, BookOpen, CalendarX2 } from 'lucide-react';
import { JUNGLE_ANIMALS } from '@/lib/interactions';
import { AnimalAvatar } from './AnimalAvatar';
import { JungleBackground } from './JungleScene';

interface Me {
  name: string;
  gradeLabel: string | null;
  boletim: { average: number | null; totalFaltas: number; subjectsCount: number };
}

interface Props {
  session: Session;
}

export function AvatarOnboarding({ session }: Props) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/interactions/me').then((r) => r.json()).then(setMe);
  }, []);

  async function confirm() {
    if (!chosen) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/interactions/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: chosen }),
    });
    if (res.ok) {
      router.push('/interactions');
      router.refresh();
    } else {
      setSaving(false);
      setError('Não foi possível salvar seu avatar. Tente novamente.');
    }
  }

  return (
    <main className="jungle-scene min-h-screen relative overflow-hidden flex flex-col items-center px-4 py-10 sm:py-14">
      <JungleBackground />

      <div className="jungle-pop relative z-10 w-full max-w-2xl rounded-3xl glass shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
          <Compass size={20} className="j-float" />
          <span className="text-xs uppercase tracking-widest">Ficha do explorador</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-50 mt-1">
          Bem-vindo(a) à selva, {session.user.name}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {me?.gradeLabel ?? '...'} · seus dados do Samba já estão aqui
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: BookOpen, box: 'bg-emerald-50 dark:bg-emerald-900/20', ic: 'text-emerald-600 dark:text-emerald-400', value: me?.boletim.average != null ? me.boletim.average.toFixed(1) : '—', label: 'média geral' },
            { icon: CalendarX2, box: 'bg-amber-50 dark:bg-amber-900/20', ic: 'text-amber-600 dark:text-amber-400', value: me?.boletim.totalFaltas ?? '—', label: 'faltas no total' },
            { icon: Sparkles, box: 'bg-sky-50 dark:bg-sky-900/20', ic: 'text-sky-600 dark:text-sky-400', value: me?.boletim.subjectsCount ?? '—', label: 'matérias' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`j-fade-up rounded-2xl ${s.box} p-3 text-center`} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <Icon size={18} className={`mx-auto ${s.ic}`} />
                <div className="text-lg font-bold text-gray-900 dark:text-slate-50 mt-1">{s.value}</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 mt-7">Escolha seu animal da selva</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 mb-4">
          Esse será o seu personagem dentro do Samba Interactions.
        </p>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {JUNGLE_ANIMALS.map((a, i) => (
            <div key={a.key} className="flex flex-col items-center gap-1.5 j-fade-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
              <AnimalAvatar animal={a.key} size={64} selected={chosen === a.key} glow={chosen === a.key} onClick={() => setChosen(a.key)} />
              <span className={`text-[11px] font-semibold transition-colors ${chosen === a.key ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-slate-300'}`}>{a.label}</span>
            </div>
          ))}
        </div>

        {chosen && (
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-400 mt-4 font-semibold j-fade-up">
            ✨ {JUNGLE_ANIMALS.find((a) => a.key === chosen)?.habitat}
          </p>
        )}

        {error && <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

        <button
          onClick={confirm}
          disabled={!chosen || saving}
          className={`w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 ${chosen ? 'j-pulse' : ''}`}
        >
          {saving ? 'Entrando na selva...' : 'Entrar na selva 🌴'}
        </button>

        <p className="text-center text-[11px] text-gray-400 dark:text-slate-500 mt-4">
          Ícones de animais: Twemoji (CC-BY 4.0)
        </p>
      </div>
    </main>
  );
}
