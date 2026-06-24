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
  const [profile, grades] = await Promise.all([
    prisma.interactionsProfile.findUnique({ where: { userId } }),
    prisma.grade.findMany({ where: { userId } }),
  ]);

  const withNota = grades.filter((g) => g.nota !== null);
  const average = withNota.length
    ? withNota.reduce((sum, g) => sum + (g.nota ?? 0), 0) / withNota.length
    : null;
  const totalFaltas = grades.reduce((sum, g) => sum + g.faltas, 0);

  return NextResponse.json({
    name: session.user.name,
    grade: session.user.grade,
    gradeLabel: session.user.grade ? roomLabel(session.user.grade) : null,
    level: session.user.level,
    avatar: profile?.avatar ?? null,
    boletim: {
      average,
      totalFaltas,
      subjectsCount: new Set(grades.map((g) => g.subject)).size,
    },
  });
}
