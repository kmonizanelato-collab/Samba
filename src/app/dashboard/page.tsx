import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { CalendarDays, ClipboardList, Target } from 'lucide-react';

const cards = [
  {
    href: '/agenda',
    icon: CalendarDays,
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    title: 'Minha Agenda',
    description:
      'Planeje sua semana com os horários da escola e atividades extracurriculares. Organize estudos, cursos e compromissos em um calendário inteligente.',
    tag: 'Planejamento',
    tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    borderHover: 'hover:border-blue-200 dark:hover:border-blue-800',
    shadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20',
  },
  {
    href: '/boletim',
    icon: ClipboardList,
    iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    title: 'Boletim Escolar',
    description:
      'Acompanhe suas notas, frequência e desempenho por bimestre em todas as disciplinas. Visualize sua situação de aprovação com clareza.',
    tag: 'Notas & Frequência',
    tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    borderHover: 'hover:border-purple-200 dark:hover:border-purple-800',
    shadow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/20',
  },
  {
    href: '/metas',
    icon: Target,
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    title: 'Boletim de Metas',
    description:
      'Defina suas metas de notas por bimestre e acompanhe se os objetivos foram alcançados. Mantenha o foco e aumente sua performance.',
    tag: 'Objetivos',
    tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderHover: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    shadow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20',
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const levelLabel = session.user.level === 'FUNDAMENTAL' ? 'Ensino Fundamental' : 'Ensino Médio';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-50">
            Olá, {session.user.name}! 👋
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {session.user.grade
              ? `${session.user.grade} · ${levelLabel}`
              : session.user.role === 'TEACHER'
              ? 'Professor'
              : 'Administrador'}{' '}
            · Bem-vindo ao SAMBA
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.href}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group card p-6 flex flex-col gap-5 border-2 border-transparent ${card.borderHover} hover:shadow-xl ${card.shadow} transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <span className={`badge ${card.tagColor} text-xs`}>{card.tag}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <span>Abrir</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-10 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <span>💡</span>
          <span>Cada módulo abre em uma nova aba para melhor organização do seu espaço de trabalho.</span>
        </div>
      </main>
    </div>
  );
}
