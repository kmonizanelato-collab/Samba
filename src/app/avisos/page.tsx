import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AvisosClient } from '@/components/avisos/AvisosClient';

export default async function AvisosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <AvisosClient session={session} />
    </div>
  );
}
