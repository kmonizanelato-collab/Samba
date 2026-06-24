import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStudentYear, getNewsStatus, isRelevantNews } from '@/lib/studentNews';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const studentYear = getStudentYear(session.user.grade);
  const all = await prisma.studentNews.findMany({ where: { region: 'Bauru' } });

  const now = new Date();
  const relevant = all
    .filter((n) => isRelevantNews(n, studentYear))
    .map((n) => ({ ...n, status: getNewsStatus(n, now) }))
    .sort((a, b) => {
      if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
      const statusRank = { aberta: 0, em_breve: 1, encerrada: 2, null: 3 } as const;
      const ra = statusRank[a.status ?? 'null'];
      const rb = statusRank[b.status ?? 'null'];
      if (ra !== rb) return ra - rb;
      if (a.closesAt && b.closesAt) return a.closesAt.getTime() - b.closesAt.getTime();
      return 0;
    });

  return NextResponse.json(relevant);
}
