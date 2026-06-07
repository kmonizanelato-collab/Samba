'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ClipboardList, Target, ShieldCheck, ArrowRight, LucideIcon } from 'lucide-react';

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
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-700',
    activeBox: 'border-blue-200 dark:border-blue-800/70 bg-blue-50/60 dark:bg-blue-900/15',
    bar: 'bg-blue-500',
    previewBg: 'from-blue-50 via-white to-white dark:from-blue-900/15 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    glow: 'shadow-blue-500/25',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-700',
    activeBox: 'border-purple-200 dark:border-purple-800/70 bg-purple-50/60 dark:bg-purple-900/15',
    bar: 'bg-purple-500',
    previewBg: 'from-purple-50 via-white to-white dark:from-purple-900/15 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    glow: 'shadow-purple-500/25',
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    activeBox: 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-900/15',
    bar: 'bg-emerald-500',
    previewBg: 'from-emerald-50 via-white to-white dark:from-emerald-900/15 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    glow: 'shadow-emerald-500/25',
  },
  orange: {
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    text: 'text-orange-600 dark:text-orange-400',
    btn: 'bg-orange-600 hover:bg-orange-700',
    activeBox: 'border-orange-200 dark:border-orange-800/70 bg-orange-50/60 dark:bg-orange-900/15',
    bar: 'bg-orange-500',
    previewBg: 'from-orange-50 via-white to-white dark:from-orange-900/15 dark:via-slate-800 dark:to-slate-800',
    tag: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    glow: 'shadow-orange-500/25',
  },
};

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
    icon: CalendarDays,
    name: 'Agenda',
    short: 'Planejamento semanal',
    tag: 'Planejamento',
    description:
      'Organize sua semana com os horários da escola e atividades extracurriculares em um calendário inteligente, fluido e fácil de preencher.',
    accent: 'blue',
  },
  {
    href: '/boletim',
    icon: ClipboardList,
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
  const CurIcon = cur.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 lg:gap-10">
      {/* Lista de módulos */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 px-1">
          Ecossistema SAMBA
        </span>
        {modules.map((m, i) => {
          const Icon = m.icon;
          const ma = ACCENTS[m.accent];
          const isActive = i === active;
          return (
            <button
              key={m.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`group relative flex items-center gap-4 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300
                ${isActive
                  ? `${ma.activeBox} shadow-sm`
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
              {/* barra de destaque */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full transition-all duration-300 ${ma.bar} ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <div
                className={`w-11 h-11 shrink-0 rounded-2xl ${ma.iconBg} flex items-center justify-center shadow-md ${ma.glow} transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
              >
                <Icon size={20} className="text-white" />
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
      <div className={`relative card overflow-hidden bg-gradient-to-br ${a.previewBg} transition-colors duration-500`}>
        <div key={active} className="animate-fade-up h-full flex flex-col p-7 sm:p-9">
          <div className="flex items-start justify-between">
            <div className={`w-16 h-16 rounded-3xl ${a.iconBg} flex items-center justify-center shadow-xl ${a.glow}`}>
              <CurIcon size={30} className="text-white" />
            </div>
            <span className={`badge ${a.tag}`}>{cur.tag}</span>
          </div>

          <div className="mt-7 flex items-center gap-2">
            <span className="text-lg font-bold lowercase bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
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
            className={`group mt-auto inline-flex items-center gap-2 self-start text-white font-semibold py-3 px-6 rounded-2xl ${a.btn} shadow-lg ${a.glow} transition-all duration-200 active:scale-95`}
          >
            <span>explorar {cur.name.toLowerCase()}</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
