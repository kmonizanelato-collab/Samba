import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { DashboardExplorer } from '@/components/dashboard/DashboardExplorer';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const levelLabel = session.user.level === 'FUNDAMENTAL' ? 'Ensino Fundamental' : 'Ensino Médio';
  const subtitle = session.user.grade
    ? `${session.user.grade} · ${levelLabel}`
    : session.user.role === 'TEACHER'
    ? 'Professor'
    : 'Administrador';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-50 tracking-tight">
            Olá, {session.user.name}! 👋
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            {subtitle} · escolha um módulo para começar
          </p>
        </div>

        <DashboardExplorer role={session.user.role} />
      </main>
    </div>
  );
}
