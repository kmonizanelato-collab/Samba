'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { Users, Trophy, BookOpen, Wand2 } from 'lucide-react';
import { FriendsPanel } from './FriendsPanel';
import { InteractionsTopBar } from './JungleScene';
import { ChaletScene, ChaletChairFront } from './ChaletScene';
import { CharacterAvatar } from './CharacterAvatar';
import { Outfit } from '@/lib/interactions';

interface Props {
  session: Session;
  avatar: string;
  outfit: Outfit;
}

function pillClass() {
  return 'relative inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-emerald-900 border border-white/60 font-bold text-sm rounded-full px-4 py-2.5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95';
}

export function InteractionsHome({ session, avatar, outfit }: Props) {
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('/api/interactions/friend-requests')
      .then((r) => r.json())
      .then((d) => setPendingCount(d.received?.length ?? 0))
      .catch(() => {});
  }, [friendsOpen]);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2a1c12] via-[#34241a] to-[#1f140d]">
      <InteractionsTopBar>
        <Link href="/interactions/ranking" className={pillClass()}>
          <Trophy size={15} className="text-amber-500" /> Competição
        </Link>
        <Link href="/interactions/grupos" className={pillClass()}>
          <BookOpen size={15} className="text-sky-600" /> Grupo de Estudo
        </Link>
        <button onClick={() => setFriendsOpen(true)} className={pillClass()}>
          <Users size={15} className="text-violet-600" /> Amizades
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center j-glow">
              {pendingCount}
            </span>
          )}
        </button>
      </InteractionsTopBar>

      <div className="relative z-10 px-4 pb-12 pt-2 flex flex-col items-center">
        <div className="text-center mb-4 jungle-pop">
          <span className="inline-block text-amber-200/90 text-xs font-bold uppercase tracking-[0.25em]">Samba Interactions</span>
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl drop-shadow-lg mt-0.5">
            Bem-vindo(a) ao seu chalé, {session.user.name?.split(' ')[0]}!
          </h1>
          <p className="text-white/70 text-sm">{session.user.grade}</p>
        </div>

        {/* Cena do chalé */}
        <div className="jungle-pop relative w-full max-w-3xl aspect-[800/520] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/30">
          <div className="absolute inset-0">
            <ChaletScene />
          </div>
          {/* avatar sentado, entre o encosto e a frente da poltrona */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 j-float" style={{ top: '34%', width: '32%' }}>
            <CharacterAvatar animal={avatar} outfit={outfit} pose="sit" framed={false} size={260} className="w-full h-auto drop-shadow-xl" />
          </div>
          <div className="absolute inset-0 z-20 pointer-events-none">
            <ChaletChairFront />
          </div>

          {/* botão personalizar */}
          <Link
            href="/interactions/avatar"
            className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1.5 bg-emerald-500/95 hover:bg-emerald-500 text-white text-xs font-bold rounded-full px-3.5 py-2 shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Wand2 size={14} /> Personalizar
          </Link>
        </div>

        <p className="text-center text-white/55 text-sm mt-5 max-w-md">
          Relaxe no seu cantinho. Visite a <span className="text-amber-200 font-semibold">Competição</span> pra subir no ranking ou crie um <span className="text-sky-200 font-semibold">Grupo de Estudo</span> com a galera.
        </p>
      </div>

      <FriendsPanel open={friendsOpen} onClose={() => setFriendsOpen(false)} />
    </main>
  );
}
