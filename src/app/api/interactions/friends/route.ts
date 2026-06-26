import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roomLabel } from '@/lib/constants';
import { AVATAR_SELECT, lookOf } from '@/lib/interactions';

export const dynamic = 'force-dynamic';

const userSelect = { id: true, name: true, grade: true, interactionsProfile: { select: AVATAR_SELECT } } as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const accepted = await prisma.friendRequest.findMany({
    where: { status: 'ACCEPTED', OR: [{ fromUserId: userId }, { toUserId: userId }] },
    include: { fromUser: { select: userSelect }, toUser: { select: userSelect } },
  });

  const friends = accepted.map((req) => {
    const f = req.fromUserId === userId ? req.toUser : req.fromUser;
    const look = lookOf(f.interactionsProfile);
    return {
      id: f.id,
      name: f.name,
      grade: f.grade,
      gradeLabel: f.grade ? roomLabel(f.grade) : null,
      avatar: f.interactionsProfile ? look.animal : null,
      hat: look.hat,
      accessory: look.accessory,
      bg: look.bg,
    };
  });

  return NextResponse.json(friends);
}
