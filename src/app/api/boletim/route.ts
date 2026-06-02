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

  const [grades, attendance, user] = await Promise.all([
    prisma.grade.findMany({ where: { userId: targetId }, orderBy: { subject: 'asc' } }),
    prisma.studentAttendance.findFirst({ where: { userId: targetId, year: 2026 } }),
    prisma.user.findUnique({ where: { id: targetId }, select: { name: true, grade: true, level: true } }),
  ]);

  return NextResponse.json({ grades, attendance, user });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, subject, bimester, nota, faltas, ac, aulasMinistradas, diasFaltados } = body;

  if (diasFaltados !== undefined) {
    const att = await prisma.studentAttendance.upsert({
      where: { userId_year: { userId: parseInt(userId), year: 2026 } },
      update: { diasFaltados: parseInt(diasFaltados) },
      create: { userId: parseInt(userId), year: 2026, diasFaltados: parseInt(diasFaltados) },
    });
    return NextResponse.json(att);
  }

  const grade = await prisma.grade.upsert({
    where: { userId_subject_bimester: { userId: parseInt(userId), subject, bimester: parseInt(bimester) } },
    update: {
      nota: nota !== undefined ? parseFloat(nota) : undefined,
      faltas: faltas !== undefined ? parseInt(faltas) : undefined,
      ac: ac !== undefined ? parseFloat(ac) : undefined,
      aulasMinistradas: aulasMinistradas !== undefined ? parseInt(aulasMinistradas) : undefined,
    },
    create: {
      userId: parseInt(userId),
      subject,
      bimester: parseInt(bimester),
      nota: nota !== undefined ? parseFloat(nota) : null,
      faltas: faltas !== undefined ? parseInt(faltas) : 0,
      ac: ac !== undefined ? parseFloat(ac) : 0,
      aulasMinistradas: aulasMinistradas !== undefined ? parseInt(aulasMinistradas) : 50,
    },
  });

  return NextResponse.json(grade);
}
