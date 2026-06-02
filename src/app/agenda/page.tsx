import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AgendaClient } from '@/components/agenda/AgendaClient';

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <AgendaClient session={session} />
    </div>
  );
}
