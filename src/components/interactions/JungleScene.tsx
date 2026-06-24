'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Camadas animadas de fundo (nuvens, vaga-lumes, colinas). */
export function JungleBackground() {
  const fireflies = [
    { left: '12%', top: '30%', delay: 0, dur: 6 },
    { left: '22%', top: '55%', delay: 1.5, dur: 7 },
    { left: '38%', top: '40%', delay: 0.8, dur: 6.5 },
    { left: '55%', top: '60%', delay: 2.2, dur: 7.5 },
    { left: '68%', top: '35%', delay: 1.1, dur: 6.2 },
    { left: '80%', top: '52%', delay: 3, dur: 8 },
    { left: '88%', top: '28%', delay: 0.4, dur: 6.8 },
    { left: '46%', top: '70%', delay: 2.6, dur: 7.2 },
  ];
  const clouds = [
    { top: '7%', left: '8%', w: 90, h: 30, dur: 22, delay: 0 },
    { top: '13%', left: '58%', w: 120, h: 38, dur: 26, delay: 2 },
    { top: '5%', left: '78%', w: 70, h: 24, dur: 18, delay: 1 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* colinas */}
      <div className="jungle-hills">
        <div className="jungle-hill" style={{ bottom: '-6%', height: '34%', background: 'rgba(34,110,64,0.55)' }} />
        <div className="jungle-hill" style={{ bottom: '-10%', height: '26%', left: '-20%', width: '90%', background: 'rgba(28,95,55,0.7)' }} />
        <div className="jungle-hill" style={{ bottom: '-10%', height: '24%', left: '40%', width: '90%', background: 'rgba(24,84,49,0.7)' }} />
      </div>

      {/* nuvens */}
      {clouds.map((c, i) => (
        <div key={i} className="jungle-cloud absolute" style={{ top: c.top, left: c.left, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
          <div className="bg-white/85 rounded-full" style={{ width: c.w, height: c.h }} />
          <div className="bg-white/80 rounded-full -mt-3 ml-4" style={{ width: c.w * 0.7, height: c.h * 0.8 }} />
        </div>
      ))}

      {/* vaga-lumes */}
      {fireflies.map((f, i) => (
        <span key={i} className="firefly" style={{ left: f.left, top: f.top, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }} />
      ))}
    </div>
  );
}

/** Barra superior de navegação dentro do Interactions. */
export function InteractionsTopBar({ children, backHref = '/dashboard', backLabel = 'Samba' }: { children?: React.ReactNode; backHref?: string; backLabel?: string }) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-8 py-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-black/15 hover:bg-black/30 transition-all rounded-full px-3.5 py-2 backdrop-blur-sm hover:-translate-x-0.5"
      >
        <ArrowLeft size={15} /> {backLabel}
      </Link>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
