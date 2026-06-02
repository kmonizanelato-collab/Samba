import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const targetId =
    session.user.role !== 'STUDENT' && userId
      ? parseInt(userId)
      : parseInt(session.user.id);

  const [goals, grades, user] = await Promise.all([
    prisma.gradeGoal.findMany({ where: { userId: targetId }, orderBy: { subject: 'asc' } }),
    prisma.grade.findMany({ where: { userId: targetId }, orderBy: { subject: 'asc' } }),
    prisma.user.findUnique({ where: { id: targetId }, select: { name: true, grade: true, level: true } }),
  ]);

  return NextResponse.json({ goals, grades, user });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, subject, bimester, metaNota } = body;

  const targetId =
    session.user.role === 'ADMIN' && userId
      ? parseInt(userId)
      : parseInt(session.user.id);

  const goal = await prisma.gradeGoal.upsert({
    where: { userId_subject_bimester: { userId: targetId, subject, bimester: parseInt(bimester) } },
    update: { metaNota: metaNota !== null ? parseFloat(metaNota) : null },
    create: {
      userId: targetId,
      subject,
      bimester: parseInt(bimester),
      metaNota: metaNota !== null ? parseFloat(metaNota) : null,
    },
  });

  return NextResponse.json(goal);
}
