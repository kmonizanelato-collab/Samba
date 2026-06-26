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
  const myGrade = session.user.grade ?? null;

  // Amigos aceitos
  const accepted = await prisma.friendRequest.findMany({
    where: { status: 'ACCEPTED', OR: [{ fromUserId: userId }, { toUserId: userId }] },
    select: { fromUserId: true, toUserId: true },
  });
  const friendIds = new Set<number>();
  for (const r of accepted) friendIds.add(r.fromUserId === userId ? r.toUserId : r.fromUserId);

  // Participantes: eu + colegas da minha sala + amigos
  const participants = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      OR: [
        { id: userId },
        ...(myGrade ? [{ grade: myGrade }] : []),
        { id: { in: Array.from(friendIds) } },
      ],
    },
    select: {
      id: true,
      name: true,
      grade: true,
      interactionsProfile: { select: { avatar: true, hat: true, top: true, accessory: true, bg: true } },
      grades: { select: { nota: true } },
    },
  });

  const ranking = participants
    .map((p) => {
      const notas = p.grades.map((g) => g.nota).filter((n): n is number => n !== null);
      const total = notas.reduce((s, n) => s + n, 0);
      const average = notas.length ? total / notas.length : null;
      // Pontos: soma das notas arredondada (gamificação)
      const points = Math.round(total * 10);
      return {
        id: p.id,
        name: p.name,
        grade: p.grade,
        gradeLabel: p.grade ? roomLabel(p.grade) : null,
        avatar: p.interactionsProfile?.avatar ?? null,
        outfit: p.interactionsProfile
          ? { hat: p.interactionsProfile.hat, top: p.interactionsProfile.top, accessory: p.interactionsProfile.accessory, bg: p.interactionsProfile.bg }
          : null,
        average,
        points,
        isMe: p.id === userId,
        isFriend: friendIds.has(p.id),
        sameClass: p.grade === myGrade,
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ ...p, position: i + 1 }));

  const me = ranking.find((r) => r.isMe) ?? null;

  return NextResponse.json({ ranking, me, myGradeLabel: myGrade ? roomLabel(myGrade) : null });
}
