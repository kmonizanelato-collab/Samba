'use client';
import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import {
  Newspaper,
  GraduationCap,
  Target,
  Landmark,
  School,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Hourglass,
} from 'lucide-react';

type Category = 'ENEM' | 'ENEM_TREINEIRO' | 'VESTIBULAR' | 'VESTIBULINHO' | 'GERAL';
type Status = 'aberta' | 'em_breve' | 'encerrada' | null;

interface StudentNewsItem {
  id: number;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  category: Category;
  region: string;
  opensAt: string | null;
  closesAt: string | null;
  highlight: boolean;
  status: Status;
}

interface Props {
  session: Session;
}

const CATEGORY_META: Record<Category, { label: string; icon: typeof Newspaper; accent: string }> = {
  ENEM: { label: 'ENEM', icon: GraduationCap, accent: 'from-sky-400 via-blue-500 to-indigo-600' },
  ENEM_TREINEIRO: { label: 'ENEM Treineiro', icon: Target, accent: 'from-violet-400 via-indigo-500 to-blue-600' },
  VESTIBULAR: { label: 'Vestibular', icon: Landmark, accent: 'from-fuchsia-400 via-purple-500 to-violet-600' },
  VESTIBULINHO: { label: 'Vestibulinho', icon: School, accent: 'from-emerald-400 via-teal-500 to-cyan-600' },
  GERAL: { label: 'Região de Bauru', icon: Newspaper, accent: 'from-cyan-400 via-teal-500 to-blue-500' },
};

function daysUntil(iso: string, now: Date) {
  const diff = new Date(iso).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status, opensAt, closesAt }: { status: Status; opensAt: string | null; closesAt: string | null }) {
  if (!status) return null;
  const now = new Date();
  if (status === 'aberta') {
    const left = closesAt ? daysUntil(closesAt, now) : null;
    return (
      <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <CheckCircle2 size={12} /> {left !== null ? `Inscrições abertas · faltam ${left}d` : 'Inscrições abertas'}
      </span>
    );
  }
  if (status === 'em_breve') {
    const until = opensAt ? daysUntil(opensAt, now) : null;
    return (
      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <Hourglass size={12} /> {until !== null ? `Abre em ${until}d` : 'Em breve'}
      </span>
    );
  }
  return (
    <span className="badge bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">
      <Clock size={12} /> Inscrições encerradas
    </span>
  );
}

function NewsCard({ item, delay }: { item: StudentNewsItem; delay: number }) {
  const meta = CATEGORY_META[item.category];
  const Icon = meta.icon;
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-fade-up group card relative flex flex-col p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        item.highlight ? 'ring-2 ring-cyan-400/60 dark:ring-cyan-500/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.accent} flex items-center justify-center shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowUpRight size={18} className="text-gray-300 dark:text-slate-600 transition-all duration-300 group-hover:text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
      </div>

      <span className="badge bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300 mt-3 self-start">
        {meta.label}
      </span>

      <h3 className="text-[15px] font-bold text-gray-900 dark:text-slate-50 mt-2 leading-snug">{item.title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">{item.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={item.status} opensAt={item.opensAt} closesAt={item.closesAt} />
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
        <span>{item.sourceName}</span>
        <span className="font-medium text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          acessar site oficial
        </span>
      </div>
    </a>
  );
}

export function NoticiasClient({ session }: Props) {
  const [items, setItems] = useState<StudentNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student-news')
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const levelLabel = session.user.level === 'FUNDAMENTAL' ? 'Ensino Fundamental' : 'Ensino Médio';
  const highlights = items.filter((i) => i.highlight);
  const rest = items.filter((i) => !i.highlight);

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Newspaper size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Notícias</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {session.user.grade ? `${session.user.grade} · ${levelLabel}` : levelLabel} · Região de Bauru
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-gray-400">Carregando notícias...</div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center mb-4">
            <Newspaper size={30} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Nenhuma notícia por aqui ainda</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Quando houver novidades para a sua série, elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {highlights.length > 0 && (
            <section>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3 px-1 block">
                Destaques para você
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((item, i) => (
                  <NewsCard key={item.id} item={item} delay={i * 60} />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3 px-1 block">
                Mais notícias
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((item, i) => (
                  <NewsCard key={item.id} item={item} delay={(highlights.length + i) * 60} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
