import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roomLabel } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const accepted = await prisma.friendRequest.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: { select: { id: true, name: true, grade: true, interactionsProfile: { select: { avatar: true } } } },
      toUser: { select: { id: true, name: true, grade: true, interactionsProfile: { select: { avatar: true } } } },
    },
  });

  const friends = accepted.map((req) => {
    const friendUser = req.fromUserId === userId ? req.toUser : req.fromUser;
    return {
      id: friendUser.id,
      name: friendUser.name,
      grade: friendUser.grade,
      gradeLabel: friendUser.grade ? roomLabel(friendUser.grade) : null,
      avatar: friendUser.interactionsProfile?.avatar ?? null,
    };
  });

  return NextResponse.json(friends);
}
