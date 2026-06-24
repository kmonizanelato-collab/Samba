'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { ArrowLeft, Users, Trophy, Waves, Bot, Lock } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { FriendsPanel } from './FriendsPanel';

interface Props {
  session: Session;
  avatar: string;
}

function Cloud({ top, left, scale, duration }: { top: string; left: string; scale: number; duration: number }) {
  return (
    <div
      className="jungle-cloud absolute"
      style={{ top, left, animationDuration: `${duration}s` }}
    >
      <div
        className="bg-white/90 rounded-full"
        style={{ width: 70 * scale, height: 28 * scale, filter: 'blur(0.5px)' }}
      />
    </div>
  );
}

function ChaletScene({ avatar }: { avatar: string }) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[6/5] select-none">
      {/* sombra do personagem */}
      <div className="absolute left-1/2 bottom-[18%] -translate-x-1/2 w-24 h-5 bg-black/20 rounded-full blur-[2px]" />

      {/* personagem */}
      <div className="absolute left-1/2 bottom-[20%] -translate-x-1/2 jungle-sway z-10">
        <AnimalAvatar animal={avatar} size={88} animated />
      </div>

      <svg viewBox="0 0 240 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
        {/* monte de grama */}
        <ellipse cx="120" cy="178" rx="118" ry="20" fill="#3f8f4f" />
        <ellipse cx="120" cy="174" rx="110" ry="16" fill="#4caf5e" />

        {/* chaminé + fumaça */}
        <rect x="148" y="40" width="14" height="26" fill="#7a4a2f" />
        <circle className="jungle-smoke" cx="155" cy="36" r="5" fill="#e5e7eb" />
        <circle className="jungle-smoke" cx="155" cy="36" r="4" fill="#e5e7eb" style={{ animationDelay: '0.8s' }} />
        <circle className="jungle-smoke" cx="155" cy="36" r="6" fill="#e5e7eb" style={{ animationDelay: '1.6s' }} />

        {/* telhado */}
        <polygon points="60,75 120,30 180,75" fill="#8b3a2b" />
        <polygon points="55,80 120,33 185,80 185,90 55,90" fill="#a44632" />

        {/* paredes */}
        <rect x="68" y="88" width="104" height="70" fill="#c8935a" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="106" x2="172" y2="106" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="124" x2="172" y2="124" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="68" y1="142" x2="172" y2="142" stroke="#9a6a3c" strokeWidth="2" />

        {/* porta */}
        <rect x="106" y="118" width="28" height="40" rx="3" fill="#5c3a22" />
        <circle cx="129" cy="139" r="1.8" fill="#f1c40f" />

        {/* janelas */}
        <rect x="78" y="100" width="18" height="18" rx="2" fill="#ffe9a8" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="87" y1="100" x2="87" y2="118" stroke="#9a6a3c" strokeWidth="1.5" />
        <line x1="78" y1="109" x2="96" y2="109" stroke="#9a6a3c" strokeWidth="1.5" />
        <rect x="144" y="100" width="18" height="18" rx="2" fill="#ffe9a8" stroke="#9a6a3c" strokeWidth="2" />
        <line x1="153" y1="100" x2="153" y2="118" stroke="#9a6a3c" strokeWidth="1.5" />
        <line x1="144" y1="109" x2="162" y2="109" stroke="#9a6a3c" strokeWidth="1.5" />
      </svg>

      {/* folhagem decorativa */}
      <div className="jungle-leaf absolute -left-2 bottom-[14%] text-5xl">🌿</div>
      <div className="jungle-leaf absolute -right-2 bottom-[12%] text-5xl" style={{ animationDelay: '1s' }}>🌴</div>
    </div>
  );
}

function ComingSoonCard({ icon: Icon, title, desc }: { icon: typeof Trophy; title: string; desc: string }) {
  return (
    <div className="relative flex flex-col items-center text-center gap-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-4 border border-white/50 opacity-80">
      <span className="absolute top-2 right-2 badge bg-amber-100 text-amber-700 text-[10px]">
        <Lock size={10} /> Em breve
      </span>
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md">
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug">{desc}</p>
    </div>
  );
}

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
      <Cloud top="8%" left="10%" scale={1} duration={16} />
      <Cloud top="14%" left="60%" scale={1.3} duration={20} />
      <Cloud top="5%" left="78%" scale={0.8} duration={14} />

      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white bg-black/15 hover:bg-black/25 transition-colors rounded-full px-3.5 py-2"
        >
          <ArrowLeft size={15} /> Samba
        </Link>

        <button
          onClick={() => setFriendsOpen(true)}
          className="relative inline-flex items-center gap-2 bg-white/90 hover:bg-white text-emerald-700 font-bold text-sm rounded-full px-4 py-2.5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Users size={17} /> Amizades
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      <div className="relative z-10 px-4 pb-10">
        <div className="text-center mb-2">
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl drop-shadow">Sua cabana na selva</h1>
          <p className="text-white/85 text-sm">{session.user.name} · {session.user.grade}</p>
        </div>

        <ChaletScene avatar={avatar} />

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <ComingSoonCard icon={Trophy} title="Competição" desc="Pontos do boletim por bimestre, comparado com seus amigos da sala." />
          <ComingSoonCard icon={Waves} title="Grupo de Estudos" desc="Crie grupos com seus amigos e converse na lagoa." />
          <ComingSoonCard icon={Bot} title="Ajuda da IA" desc="Tire dúvidas e receba feedback dos seus trabalhos." />
        </div>
      </div>

      <FriendsPanel open={friendsOpen} onClose={() => setFriendsOpen(false)} />
    </main>
  );
}
