'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { Users, Trophy, Waves, Sparkles, ArrowRight } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { FriendsPanel } from './FriendsPanel';
import { JungleBackground, InteractionsTopBar } from './JungleScene';

interface Props {
  session: Session;
  avatar: string;
}

function ChaletScene({ avatar }: { avatar: string }) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[6/5] select-none j-float">
      <div className="jungle-shadow absolute left-1/2 bottom-[18%] -translate-x-1/2 w-24 h-5 bg-black/30 rounded-full blur-[2px]" />

      <div className="absolute left-1/2 bottom-[20%] -translate-x-1/2 jungle-sway z-10">
        <AnimalAvatar animal={avatar} size={92} animated glow />
      </div>

      <svg viewBox="0 0 240 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
        <ellipse cx="120" cy="178" rx="118" ry="20" fill="#3f8f4f" />
        <ellipse cx="120" cy="174" rx="110" ry="16" fill="#4caf5e" />
        <rect x="148" y="40" width="14" height="26" fill="#7a4a2f" />
        <circle className="jungle-smoke" cx="155" cy="36" r="5" fill="#e5e7eb" />
        <circle className="jungle-smoke" cx="155" cy="36" r="4" fill="#e5e7eb" style={{ animationDelay: '0.8s' }} />
        <circle className="jungle-smoke" cx="155" cy="36" r="6" fill="#e5e7eb" style={{ animationDelay: '1.6s' }} />
        <polygon points="60,75 120,30 180,75" fill="#8b3a2b" />
        <polygon points="55,80 120,33 185,80 185,90 55,90" fill="#a44632" />
        <rect x="68" y="88" width="104" height="70" fill="#c8935a" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="106" x2="172" y2="106" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="124" x2="172" y2="124" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="142" x2="172" y2="142" stroke="#9a6a3c" strokeWidth="2" />
        <rect x="106" y="118" width="28" height="40" rx="3" fill="#5c3a22" />
        <circle cx="129" cy="139" r="1.8" fill="#f1c40f" />
        <rect x="78" y="100" width="18" height="18" rx="2" fill="#ffe9a8" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="87" y1="100" x2="87" y2="118" stroke="#9a6a3c" strokeWidth="1.5" />
        <line x1="78" y1="109" x2="96" y2="109" stroke="#9a6a3c" strokeWidth="1.5" />
        <rect x="144" y="100" width="18" height="18" rx="2" fill="#ffe9a8" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="153" y1="100" x2="153" y2="118" stroke="#9a6a3c" strokeWidth="1.5" />
        <line x1="144" y1="109" x2="162" y2="109" stroke="#9a6a3c" strokeWidth="1.5" />
      </svg>

      <div className="jungle-leaf absolute -left-2 bottom-[14%] text-5xl">🌿</div>
      <div className="jungle-leaf absolute -right-2 bottom-[12%] text-5xl" style={{ animationDelay: '1s' }}>🌴</div>
    </div>
  );
}

const FEATURES = [
  {
    href: '/interactions/ranking',
    icon: Trophy,
    title: 'Ranking',
    desc: 'Sua posição na disputa de pontos do boletim entre amigos e colegas de sala.',
    grad: 'from-amber-400 to-orange-500',
    glow: 'shadow-orange-500/30',
    tagBg: 'bg-orange-50 text-orange-700',
  },
  {
    href: '/interactions/grupos',
    icon: Waves,
    title: 'Grupos de Estudo',
    desc: 'Crie grupos com seus amigos e converse na lagoa de estudos em tempo real.',
    grad: 'from-cyan-400 to-teal-500',
    glow: 'shadow-teal-500/30',
    tagBg: 'bg-teal-50 text-teal-700',
  },
  {
    href: '/interactions/mentor',
    icon: Sparkles,
    title: 'Mentor de Estudos',
    desc: 'Uma análise do seu boletim com dicas inteligentes de onde focar agora.',
    grad: 'from-violet-400 to-fuchsia-500',
    glow: 'shadow-fuchsia-500/30',
    tagBg: 'bg-fuchsia-50 text-fuchsia-700',
  },
];

export function InteractionsHome({ session, avatar }: Props) {
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('/api/interactions/friend-requests')
      .then((r) => r.json())
      .then((d) => setPendingCount(d.received?.length ?? 0))
      .catch(() => {});
  }, [friendsOpen]);

  return (
    <main className="jungle-scene min-h-screen relative overflow-hidden">
      <JungleBackground />

      <InteractionsTopBar>
        <button
          onClick={() => setFriendsOpen(true)}
          className="relative inline-flex items-center gap-2 bg-white/90 hover:bg-white text-emerald-700 font-bold text-sm rounded-full px-4 py-2.5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Users size={17} /> Amizades
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center j-glow">
              {pendingCount}
            </span>
          )}
        </button>
      </InteractionsTopBar>

      <div className="relative z-10 px-4 pb-14">
        <div className="text-center mb-1 jungle-pop">
          <span className="inline-block text-white/90 text-xs font-bold uppercase tracking-[0.25em] mb-1">Samba Interactions</span>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl drop-shadow-lg">Sua cabana na selva</h1>
          <p className="text-white/90 text-sm mt-0.5">{session.user.name} · {session.user.grade}</p>
        </div>

        <ChaletScene avatar={avatar} />

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="feature-card group glass rounded-3xl p-5 flex flex-col gap-3 shadow-xl j-fade-up"
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              >
                <div className={`feature-icon w-12 h-12 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center shadow-lg ${f.glow}`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-50">{f.title}</h3>
                  <p className="text-[13px] text-gray-600 dark:text-slate-300 leading-snug mt-0.5">{f.desc}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Abrir <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <FriendsPanel open={friendsOpen} onClose={() => setFriendsOpen(false)} />
    </main>
  );
}
