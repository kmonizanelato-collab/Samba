import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const targetId =
    session.user.role !== 'STUDENT' && userId
      ? parseInt(userId)
      : parseInt(session.user.id);

  const entries = await prisma.agendaEntry.findMany({
    where: {
      userId: targetId,
      ...(startDate && endDate
        ? { date: { gte: new Date(startDate), lte: new Date(endDate) } }
        : {}),
    },
    orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { date, timeSlot, activity, customText, color, userId } = body;

  const targetId =
    session.user.role === 'ADMIN' && userId
      ? parseInt(userId)
      : parseInt(session.user.id);

  if (session.user.role === 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entry = await prisma.agendaEntry.upsert({
    where: { userId_date_timeSlot: { userId: targetId, date: new Date(date), timeSlot } },
    update: { activity, customText, color },
    create: { userId: targetId, date: new Date(date), timeSlot, activity, customText, color },
  });

  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') ?? '0');

  const entry = await prisma.agendaEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.user.role !== 'ADMIN' && entry.userId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.agendaEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
