import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { InteractionsHome } from '@/components/interactions/InteractionsHome';

export default async function InteractionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const profile = await prisma.interactionsProfile.findUnique({
    where: { userId: parseInt(session.user.id) },
  });
  if (!profile) redirect('/interactions/avatar');

  const outfit = {
    hat: profile.hat,
    top: profile.top,
    accessory: profile.accessory,
    bg: profile.bg,
  };

  return <InteractionsHome session={session} avatar={profile.avatar} outfit={outfit} />;
}
