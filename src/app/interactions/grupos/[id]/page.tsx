import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GrupoChatClient } from '@/components/interactions/GrupoChatClient';

export default async function GrupoChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');
  return <GrupoChatClient groupId={parseInt(params.id)} currentUserId={parseInt(session.user.id)} />;
}
