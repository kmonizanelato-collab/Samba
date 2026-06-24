import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { NoticiasClient } from '@/components/noticias/NoticiasClient';

export default async function NoticiasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');
  if (session.user.role !== 'STUDENT') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <NoticiasClient session={session} />
    </div>
  );
}
