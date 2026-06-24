import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AvatarOnboarding } from '@/components/interactions/AvatarOnboarding';

export default async function InteractionsAvatarPage() {
  const session = await getServerSession(authOptions);
  return <AvatarOnboarding session={session!} />;
}
