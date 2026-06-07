'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarRange, GraduationCap, Target, ShieldCheck, ArrowRight, LucideIcon } from 'lucide-react';

interface Accent {
  iconBg: string;
  text: string;
  btn: string;
  activeBox: string;
  bar: string;
  previewBg: string;
  tag: string;
  glow: string;
}

const ACCENTS: Record<string, Accent> = {
  blue: {
    iconBg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
    text: 'text-blue-600 dark:text-blue-400',
    btn: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    activeBox: 'border-blue-200 dark:border-blue-800/70 bg-blue-50/60 dark:bg-blue-900/15',
    bar: 'bg-blue-500',
    previewBg: 'from-blue-50/80 via-white to-white dark:from-blue-900/10 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-violet-600',
    text: 'text-purple-600 dark:text-purple-400',
    btn: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    activeBox: 'border-purple-200 dark:border-purple-800/70 bg-purple-50/60 dark:bg-purple-900/15',
    bar: 'bg-purple-500',
    previewBg: 'from-purple-50/80 via-white to-white dark:from-purple-900/10 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    glow: 'shadow-purple-500/30',
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    btn: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
    activeBox: 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-900/15',
    bar: 'bg-emerald-500',
    previewBg: 'from-emerald-50/80 via-white to-white dark:from-emerald-900/10 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    glow: 'shadow-emerald-500/30',
  },
  orange: {
    iconBg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    text: 'text-orange-600 dark:text-orange-400',
    btn: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
    activeBox: 'border-orange-200 dark:border-orange-800/70 bg-orange-50/60 dark:bg-orange-900/15',
    bar: 'bg-orange-500',
    previewBg: 'from-orange-50/80 via-white to-white dark:from-orange-900/10 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    glow: 'shadow-orange-500/30',
  },
};

/** Ícone estilo "app": gradiente vívido + brilho superior + sombra colorida */
function AppIcon({ icon: Icon, accent, big = false }: { icon: LucideIcon; accent: keyof typeof ACCENTS; big?: boolean }) {
  const a = ACCENTS[accent];
  const box = big ? 'w-16 h-16 rounded-[20px]' : 'w-12 h-12 rounded-[15px]';
  return (
    <div className={`relative ${box} ${a.iconBg} flex items-center justify-center shadow-lg ${a.glow} overflow-hidden ring-1 ring-white/20`}>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      <Icon size={big ? 30 : 22} className="relative text-white drop-shadow-sm" strokeWidth={2.1} />
    </div>
  );
}

interface ModuleItem {
  href: string;
  icon: LucideIcon;
  name: string;
  short: string;
  tag: string;
  description: string;
  accent: keyof typeof ACCENTS;
}

const BASE_MODULES: ModuleItem[] = [
  {
    href: '/agenda',
    icon: CalendarRange,
    name: 'Agenda',
    short: 'Planejamento semanal',
    tag: 'Planejamento',
    description:
      'Organize sua semana com os horários da escola e atividades extracurriculares em um calendário inteligente, fluido e fácil de preencher.',
    accent: 'blue',
  },
  {
    href: '/boletim',
    icon: GraduationCap,
    name: 'Boletim',
    short: 'Notas e frequência',
    tag: 'Desempenho',
    description:
      'Acompanhe notas, faltas e frequência por bimestre, com a situação de aprovação de cada disciplina destacada de forma clara.',
    accent: 'purple',
  },
  {
    href: '/metas',
    icon: Target,
    name: 'Boletim de Metas',
    short: 'Objetivos por bimestre',
    tag: 'Objetivos',
    description:
      'Defina metas de nota para cada bimestre e acompanhe, em tempo real, se os objetivos foram alcançados ou superados.',
    accent: 'emerald',
  },
];

const ADMIN_MODULE: ModuleItem = {
  href: '/admin',
  icon: ShieldCheck,
  name: 'Administração',
  short: 'Gestão de contas',
  tag: 'Administração',
  description:
    'Crie e gerencie contas de alunos, professores e administradores, definindo salas, séries e permissões de acesso.',
  accent: 'orange',
};

export function DashboardExplorer({ isAdmin }: { isAdmin: boolean }) {
  const modules = isAdmin ? [...BASE_MODULES, ADMIN_MODULE] : BASE_MODULES;
  const [active, setActive] = useState(0);
  const cur = modules[active];
  const a = ACCENTS[cur.accent];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 md:gap-10 items-start">
      {/* Lista de módulos */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 px-1">
          Ecossistema SAMBA
        </span>
        {modules.map((m, i) => {
          const ma = ACCENTS[m.accent];
          const isActive = i === active;
          return (
            <button
              key={m.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`group relative flex items-center gap-3.5 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300
                ${isActive
                  ? `${ma.activeBox} shadow-sm`
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full transition-all duration-300 ${ma.bar} ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <div className={`transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                <AppIcon icon={m.icon} accent={m.accent} />
              </div>
              <div className="min-w-0">
                <div className={`font-bold text-[15px] leading-tight transition-colors ${isActive ? ma.text : 'text-gray-800 dark:text-slate-100'}`}>
                  {m.name}
                </div>
                <div className="text-sm text-gray-400 dark:text-slate-500 truncate">{m.short}</div>
              </div>
              <ArrowRight
                size={16}
                className={`ml-auto shrink-0 transition-all duration-300 ${isActive ? `${ma.text} opacity-100 translate-x-0` : 'opacity-0 -translate-x-1 text-gray-400'}`}
              />
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className={`relative card overflow-hidden bg-gradient-to-br ${a.previewBg} transition-colors duration-500 md:sticky md:top-24`}>
        <div key={active} className="animate-fade-up flex flex-col p-7 sm:p-9 min-h-[360px]">
          <div className="flex items-start justify-between">
            <AppIcon icon={cur.icon} accent={cur.accent} big />
            <span className={`badge ${a.tag}`}>{cur.tag}</span>
          </div>

          <div className="mt-7 flex items-center gap-1.5">
            <span className="text-lg font-extrabold lowercase bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              samba
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">/ {cur.name.toLowerCase()}</span>
          </div>

          <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-50 tracking-tight">
            {cur.name}
          </h3>

          <p className="mt-3 text-[15px] leading-relaxed text-gray-500 dark:text-slate-400 max-w-md">
            {cur.description}
          </p>

          <Link
            href={cur.href}
            className={`group mt-auto pt-8 inline-flex items-center gap-2 self-start`}
          >
            <span className={`inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-2xl ${a.btn} shadow-lg ${a.glow} transition-all duration-200 active:scale-95`}>
              explorar {cur.name.toLowerCase()}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
