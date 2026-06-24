'use client';
import { useEffect, useState } from 'react';
import { Trophy, Crown, Sparkles } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { JungleBackground, InteractionsTopBar } from './JungleScene';

interface Row {
  id: number;
  name: string;
  gradeLabel: string | null;
  avatar: string | null;
  average: number | null;
  points: number;
  position: number;
  isMe: boolean;
  isFriend: boolean;
  sameClass: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function RankingClient() {
  const [ranking, setRanking] = useState<Row[]>([]);
  const [me, setMe] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/interactions/ranking')
      .then((r) => r.json())
      .then((d) => { setRanking(d.ranking ?? []); setMe(d.me ?? null); })
      .finally(() => setLoading(false));
  }, []);

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  // ordem visual do pódio: 2º, 1º, 3º
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const heights = (pos: number) => (pos === 1 ? 'h-28' : pos === 2 ? 'h-20' : 'h-16');

  return (
    <main className="jungle-scene min-h-screen relative overflow-hidden pb-16">
      <JungleBackground />
      <InteractionsTopBar backHref="/interactions" backLabel="Selva" />

      <div className="relative z-10 px-4">
        <div className="text-center mb-6 jungle-pop">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/40 mb-2 j-float">
            <Trophy size={26} className="text-white" />
          </div>
          <h1 className="text-white font-extrabold text-3xl drop-shadow-lg">Ranking da Selva</h1>
          <p className="text-white/90 text-sm">Pontos somados das notas do boletim</p>
        </div>

        {loading ? (
          <div className="text-center text-white/90 py-10">Carregando...</div>
        ) : ranking.length === 0 ? (
          <div className="glass max-w-md mx-auto rounded-3xl p-8 text-center">
            <p className="text-gray-600 dark:text-slate-300">Ainda não há pontuação. Assim que houver notas no boletim, o ranking aparece aqui!</p>
          </div>
        ) : (
          <>
            {/* Pódio */}
            <div className="flex items-end justify-center gap-3 sm:gap-5 max-w-lg mx-auto mb-6">
              {podiumOrder.map((p) => (
                <div key={p.id} className="flex flex-col items-center j-fade-up" style={{ animationDelay: `${p.position * 0.12}s` }}>
                  <div className="relative">
                    {p.position === 1 && <Crown size={22} className="text-amber-300 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow j-float" />}
                    <AnimalAvatar animal={p.avatar ?? 'monkey'} size={p.position === 1 ? 76 : 60} animated={false} glow={p.position === 1} />
                  </div>
                  <span className="text-2xl -mt-1">{MEDALS[p.position - 1]}</span>
                  <div className={`glass ${heights(p.position)} w-20 sm:w-24 rounded-t-2xl flex flex-col items-center justify-start pt-2 px-1 shadow-lg`}>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate w-full text-center">{p.name}</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-extrabold">{p.points} pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lista restante */}
            {rest.length > 0 && (
              <div className="glass max-w-lg mx-auto rounded-3xl p-2 shadow-xl">
                {rest.map((p, i) => (
                  <RankRow key={p.id} p={p} delay={i * 0.04} />
                ))}
              </div>
            )}

            {/* Minha posição (se fora do top) */}
            {me && me.position > 3 && (
              <div className="max-w-lg mx-auto mt-4">
                <div className="glass rounded-2xl p-1 ring-2 ring-emerald-400 shadow-xl">
                  <RankRow p={me} highlight />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function RankRow({ p, delay = 0, highlight = false }: { p: Row; delay?: number; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl j-fade-up ${highlight ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : p.isMe ? 'bg-emerald-50/60 dark:bg-emerald-900/15' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="w-7 text-center font-extrabold text-gray-400 dark:text-slate-500">{p.position}º</span>
      <AnimalAvatar animal={p.avatar ?? 'monkey'} size={38} animated={false} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate flex items-center gap-1.5">
          {p.name}
          {p.isMe && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">você</span>}
          {!p.isMe && p.isFriend && <span className="badge bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[10px]">amigo</span>}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-slate-500">
          {p.gradeLabel ?? '—'}{p.average !== null ? ` · média ${p.average.toFixed(1)}` : ''}
        </div>
      </div>
      <span className="flex items-center gap-1 text-sm font-extrabold text-amber-600 dark:text-amber-400">
        <Sparkles size={13} /> {p.points}
      </span>
    </div>
  );
}
