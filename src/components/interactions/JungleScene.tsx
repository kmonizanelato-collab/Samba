'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Partículas de ambiente sutis (faíscas quentes flutuando perto da lareira). */
export function JungleBackground() {
  const embers = [
    { left: '58%', top: '62%', delay: 0, dur: 6 },
    { left: '64%', top: '58%', delay: 1.5, dur: 7 },
    { left: '70%', top: '66%', delay: 0.8, dur: 6.5 },
    { left: '61%', top: '70%', delay: 2.2, dur: 7.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((f, i) => (
        <span key={i} className="firefly" style={{ left: f.left, top: f.top, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }} />
      ))}
    </div>
  );
}

/** Barra superior de navegação dentro do Interactions. */
export function InteractionsTopBar({ children, backHref = '/dashboard', backLabel = 'Samba' }: { children?: React.ReactNode; backHref?: string; backLabel?: string }) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-black/15 hover:bg-black/30 transition-all rounded-full px-3.5 py-2 backdrop-blur-sm hover:-translate-x-0.5"
      >
        <ArrowLeft size={15} /> {backLabel}
      </Link>
      <div className="flex items-center flex-wrap justify-end gap-2">{children}</div>
    </div>
  );
}
