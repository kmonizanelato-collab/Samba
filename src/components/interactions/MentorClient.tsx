'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { JungleBackground, InteractionsTopBar } from './JungleScene';

interface SubjectStat { subject: string; average: number; count: number; }
interface MentorData {
  name: string;
  overall: number | null;
  freqAnual: number;
  totalFaltas: number;
  strongest: SubjectStat | null;
  weakest: SubjectStat | null;
  attention: SubjectStat[];
  subjects: SubjectStat[];
  tips: string[];
}

interface Bubble { from: 'mentor' | 'me'; text: string; }

// **negrito** -> <strong>
function renderRich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-extrabold">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

function gradeColor(avg: number) {
  if (avg >= 7) return '#10b981';
  if (avg >= 5) return '#3b82f6';
  return '#ef4444';
}

const QUICK = [
  { label: 'O que estudar hoje?', key: 'today' },
  { label: 'Como me organizar?', key: 'organize' },
  { label: 'Me dá um incentivo', key: 'motivation' },
];

function answer(key: string, d: MentorData): string {
  if (key === 'today') {
    if (d.weakest && d.weakest.average < 7) return `Hoje eu focaria em **${d.weakest.subject}** (média ${d.weakest.average.toFixed(1)}). Faça 30 minutos de exercícios e revise a matéria mais recente. Pequenos passos todo dia vencem a prova! 💪`;
    return 'Você está bem em todas as matérias! Revise um pouco de cada uma para manter o ritmo e capriche na que tiver prova mais perto. 📚';
  }
  if (key === 'organize') {
    return 'Dica de ouro: use a técnica **Pomodoro** — 25 min focado + 5 min de pausa. Monte uma rotina fixa, anote as provas no **Calendário** do Samba e estude as matérias mais difíceis quando você estiver mais descansado(a). ⏱️';
  }
  return `Acredita em você, ${d.name}! Cada exercício que você faz hoje é um degrau a mais. Constância vale mais que intensidade — continue! 🌟`;
}

export function MentorClient() {
  const [data, setData] = useState<MentorData | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/interactions/mentor')
      .then((r) => r.json())
      .then((d: MentorData) => {
        setData(d);
        const intro: Bubble[] = [{ from: 'mentor', text: `Oi, ${d.name}! 👋 Eu sou o **Mentor da Selva**. Dei uma olhada no seu boletim e preparei algumas dicas:` }];
        for (const t of d.tips) intro.push({ from: 'mentor', text: t });
        setBubbles(intro);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles.length]);

  function ask(q: { label: string; key: string }) {
    if (!data) return;
    setBubbles((b) => [...b, { from: 'me', text: q.label }]);
    setTimeout(() => setBubbles((b) => [...b, { from: 'mentor', text: answer(q.key, data) }]), 350);
  }

  return (
    <main className="jungle-scene min-h-screen relative overflow-hidden flex flex-col">
      <JungleBackground />
      <InteractionsTopBar backHref="/interactions" backLabel="Selva" />

      <div className="relative z-10 px-4 flex-1 flex flex-col max-w-2xl mx-auto w-full pb-4">
        <div className="text-center mb-4 jungle-pop">
          <div className="inline-block j-float">
            <AnimalAvatar animal="panda" size={70} glow />
          </div>
          <h1 className="text-white font-extrabold text-2xl drop-shadow-lg mt-1">Mentor de Estudos</h1>
          <p className="text-white/90 text-sm">Análise inteligente do seu boletim</p>
        </div>

        {/* Stats rápidos */}
        {data && !loading && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="média geral" value={data.overall !== null ? data.overall.toFixed(1) : '—'} />
            <StatCard label="frequência" value={`${data.freqAnual}%`} />
            <StatCard label="ponto forte" value={data.strongest?.subject ?? '—'} small />
          </div>
        )}

        {/* Mini gráfico de matérias */}
        {data && data.subjects.length > 0 && (
          <div className="glass rounded-2xl p-3 mb-3">
            <div className="text-xs font-bold text-gray-600 dark:text-slate-300 mb-2 flex items-center gap-1"><Sparkles size={12} /> Médias por matéria</div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
              {data.subjects.map((s) => (
                <div key={s.subject} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-slate-300 w-28 truncate shrink-0">{s.subject}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200/70 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (s.average / 10) * 100)}%`, backgroundColor: gradeColor(s.average) }} />
                  </div>
                  <span className="text-[11px] font-bold w-7 text-right" style={{ color: gradeColor(s.average) }}>{s.average.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5 pr-1">
          {loading && <div className="text-center text-white/90 py-6">Analisando seu boletim...</div>}
          {bubbles.map((b, i) => (
            <div key={i} className={`flex items-end gap-2 j-fade-up ${b.from === 'me' ? 'flex-row-reverse' : ''}`}>
              {b.from === 'mentor' && <div className="shrink-0"><AnimalAvatar animal="panda" size={30} animated={false} /></div>}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 shadow text-sm ${b.from === 'me' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-bl-sm'}`}>
                {renderRich(b.text)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick replies */}
        {data && !loading && (
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK.map((q) => (
              <button key={q.key} onClick={() => ask(q)} className="text-xs font-semibold bg-white/90 hover:bg-white text-violet-700 rounded-full px-3.5 py-2 shadow transition-all hover:scale-105 active:scale-95">
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="glass rounded-2xl p-2.5 text-center">
      <div className={`font-extrabold text-gray-900 dark:text-slate-50 truncate ${small ? 'text-sm' : 'text-xl'}`}>{value}</div>
      <div className="text-[10px] text-gray-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
