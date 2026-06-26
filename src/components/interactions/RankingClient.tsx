'use client';
import { useEffect, useMemo, useState } from 'react';
import { Trophy, Crown, Sparkles, Calculator, Users2, TrendingUp, ChevronDown } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { InteractionsTopBar } from './JungleScene';
import { Outfit } from '@/lib/interactions';

interface Row {
  id: number;
  name: string;
  gradeLabel: string | null;
  avatar: string | null;
  outfit: Outfit | null;
  average: number | null;
  points: number;
  position: number;
  isMe: boolean;
  isFriend: boolean;
  sameClass: boolean;
}

type Filter = 'all' | 'class' | 'friends';
const MEDALS = ['🥇', '🥈', '🥉'];

export function RankingClient() {
  const [ranking, setRanking] = useState<Row[]>([]);
  const [me, setMe] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    fetch('/api/interactions/ranking')
      .then((r) => r.json())
      .then((d) => { setRanking(d.ranking ?? []); setMe(d.me ?? null); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const base =
      filter === 'class' ? ranking.filter((r) => r.sameClass || r.isMe)
      : filter === 'friends' ? ranking.filter((r) => r.isFriend || r.isMe)
      : ranking;
    return base.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [ranking, filter]);

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as (Row & { rank: number })[];
  const heights = (rank: number) => (rank === 1 ? 'h-28' : rank === 2 ? 'h-20' : 'h-16');
  const meRow = filtered.find((r) => r.isMe);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'class', label: 'Minha turma' },
    { key: 'friends', label: 'Amigos' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden pb-16 bg-gradient-to-b from-amber-400 via-orange-500 to-rose-500">
      {/* brilhos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute top-40 -right-16 w-72 h-72 rounded-full bg-yellow-200/30 blur-3xl" />
      </div>

      <InteractionsTopBar backHref="/interactions" backLabel="Chalé" />

      <div className="relative z-10 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-5 jungle-pop">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-xl shadow-black/20 mb-2 j-float">
            <Trophy size={30} className="text-amber-500" />
          </div>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl drop-shadow">Competição</h1>
          <p className="text-white/90 text-sm">Suas notas viram pontos. Capriche no boletim e suba no ranking! 🚀</p>
        </div>

        {/* Como funciona */}
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 shadow-xl p-4 sm:p-5 mb-5 jungle-pop">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <RuleChip icon={Calculator} color="text-amber-600 bg-amber-100 dark:bg-amber-900/30" title="Notas viram pontos" desc="soma das notas × 10" />
            <RuleChip icon={Users2} color="text-sky-600 bg-sky-100 dark:bg-sky-900/30" title="Quem participa" desc="sua turma + amigos" />
            <RuleChip icon={TrendingUp} color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" title="Como subir" desc="melhore as notas" />
          </div>
          <button
            onClick={() => setRulesOpen((v) => !v)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Ver regras completas
            <ChevronDown size={14} className={`transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
          </button>
          {rulesOpen && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-300 space-y-2 j-fade-up">
              <p>🏅 <b>Pontuação:</b> cada matéria contribui com a nota multiplicada por 10. Ex.: nota 8,5 = 85 pontos. Somamos todas as matérias do seu boletim.</p>
              <p>👥 <b>Ranking:</b> você disputa com os colegas da sua turma e com os amigos que você adicionar nas Amizades.</p>
              <p>📈 <b>Atualização:</b> sempre que uma nota é lançada ou corrigida, seus pontos mudam automaticamente.</p>
              <p>🎯 <b>Meta:</b> quanto mais alto o boletim, mais perto do topo do pódio você fica.</p>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex justify-center gap-1.5 mb-5 bg-white/25 rounded-full p-1 max-w-xs mx-auto backdrop-blur-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-1.5 rounded-full text-sm font-bold transition-all ${
                filter === f.key ? 'bg-white text-orange-600 shadow' : 'text-white/90 hover:bg-white/15'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/90 py-10">Carregando ranking...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-8 text-center shadow-xl">
            <p className="text-gray-600 dark:text-slate-300">Ainda não há pontuação por aqui. Assim que houver notas no boletim, o ranking aparece! 🌟</p>
          </div>
        ) : (
          <>
            {/* Pódio */}
            <div className="flex items-end justify-center gap-3 sm:gap-5 mb-5">
              {podiumOrder.map((p) => (
                <div key={p.id} className="flex flex-col items-center jungle-pop" style={{ animationDelay: `${p.rank * 0.1}s` }}>
                  <div className="relative">
                    {p.rank === 1 && <Crown size={24} className="text-amber-200 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow j-float" />}
                    <AnimalAvatar animal={p.avatar ?? 'monkey'} outfit={p.outfit ?? undefined} size={p.rank === 1 ? 82 : 62} animated={p.rank === 1} glow={p.rank === 1} />
                  </div>
                  <span className="text-2xl -mt-1.5 drop-shadow">{MEDALS[p.rank - 1]}</span>
                  <div className={`bg-white/95 dark:bg-slate-900/90 ${heights(p.rank)} w-[88px] sm:w-28 rounded-t-2xl flex flex-col items-center justify-start pt-2 px-1 shadow-lg`}>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate w-full text-center">{p.name}</span>
                    {p.gradeLabel && <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate w-full text-center">{p.gradeLabel}</span>}
                    <span className="mt-auto mb-2 inline-flex items-center gap-0.5 text-sm text-amber-600 dark:text-amber-400 font-extrabold">
                      <Sparkles size={12} /> {p.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lista restante */}
            {rest.length > 0 && (
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-2 shadow-xl">
                {rest.map((p, i) => (
                  <RankRow key={p.id} p={p} rank={p.rank} delay={i * 0.04} />
                ))}
              </div>
            )}

            {/* Minha posição (se fora do top 3) */}
            {meRow && meRow.rank > 3 && (
              <div className="mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 ring-2 ring-emerald-400 shadow-xl">
                  <RankRow p={meRow} rank={meRow.rank} highlight />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function RuleChip({ icon: Icon, color, title, desc }: { icon: React.ElementType; color: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 p-2">
      <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </span>
      <span className="text-[12px] font-bold text-gray-800 dark:text-slate-100 leading-tight">{title}</span>
      <span className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">{desc}</span>
    </div>
  );
}

function RankRow({ p, rank, delay = 0, highlight = false }: { p: Row; rank: number; delay?: number; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl j-fade-up ${
        highlight ? 'bg-emerald-50 dark:bg-emerald-900/20' : p.isMe ? 'bg-emerald-50/60 dark:bg-emerald-900/15' : ''
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="w-7 text-center font-extrabold text-gray-400 dark:text-slate-500">{rank}º</span>
      <AnimalAvatar animal={p.avatar ?? 'monkey'} outfit={p.outfit ?? undefined} size={40} animated={false} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate flex items-center gap-1.5">
          {p.name}
          {p.isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">você</span>}
          {!p.isMe && p.isFriend && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 font-bold">amigo</span>}
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
