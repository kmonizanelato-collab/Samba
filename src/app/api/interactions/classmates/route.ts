import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AVATAR_SELECT, lookOf } from '@/lib/interactions';

export const dynamic = 'force-dynamic';

// Lista os colegas da MESMA SALA com o status de amizade.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const myGrade = session.user.grade ?? null;
  if (!myGrade) return NextResponse.json([]);

  const [classmates, requests] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT', grade: myGrade, id: { not: userId } },
      select: { id: true, name: true, interactionsProfile: { select: AVATAR_SELECT } },
      orderBy: { name: 'asc' },
    }),
    prisma.friendRequest.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      select: { fromUserId: true, toUserId: true, status: true },
    }),
  ]);

  function statusFor(otherId: number): 'friend' | 'sent' | 'received' | 'none' {
    const r = requests.find((x) => x.fromUserId === otherId || x.toUserId === otherId);
    if (!r) return 'none';
    if (r.status === 'ACCEPTED') return 'friend';
    if (r.status === 'PENDING') return r.fromUserId === userId ? 'sent' : 'received';
    return 'none';
  }

  return NextResponse.json(
    classmates.map((c) => {
      const look = lookOf(c.interactionsProfile);
      return {
        id: c.id,
        name: c.name,
        avatar: c.interactionsProfile ? look.animal : null,
        hat: look.hat,
        accessory: look.accessory,
        bg: look.bg,
        status: statusFor(c.id),
      };
    })
  );
}
