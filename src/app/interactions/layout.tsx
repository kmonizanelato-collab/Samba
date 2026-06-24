import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import './interactions.css';

export default async function InteractionsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');
  if (session.user.role !== 'STUDENT') redirect('/dashboard');

  return <div className="font-brand min-h-screen">{children}</div>;
}
