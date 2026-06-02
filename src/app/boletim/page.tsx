import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BoletimClient } from '@/components/boletim/BoletimClient';

export default async function BoletimPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <BoletimClient session={session} />
    </div>
  );
}
