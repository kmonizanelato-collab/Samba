import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ALL_ROOMS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const TYPES = ['PROVA', 'TRABALHO', 'EVENTO', 'REUNIAO', 'FERIADO', 'OUTRO'];

function canEdit(role: string) {
  return role === 'TEACHER' || role === 'ADMIN';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const gradeFilter = searchParams.get('grade');

  const where: Record<string, unknown> = {};
  if (start && end) where.date = { gte: new Date(start), lte: new Date(end) };

  if (session.user.role === 'STUDENT') {
    // Aluno vê eventos globais (grade null) + da sua sala
    where.OR = [{ grade: null }, { grade: session.user.grade ?? '___' }];
  } else if (gradeFilter && gradeFilter !== 'ALL') {
    where.OR = gradeFilter === 'GLOBAL' ? [{ grade: null }] : [{ grade: gradeFilter }];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'asc' },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const title = (body.title ?? '').trim();
  const type = body.type;
  const date = body.date;
  const grade = body.grade && ALL_ROOMS.includes(body.grade) ? body.grade : null;
  const description = (body.description ?? '').trim() || null;

  if (!title) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
  if (!date) return NextResponse.json({ error: 'Data é obrigatória.' }, { status: 400 });
  if (!TYPES.includes(type)) return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      type,
      grade,
      createdById: parseInt(session.user.id),
    },
    include: { createdBy: { select: { name: true } } },
  });
  return NextResponse.json(event, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const id = parseInt(body.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: body.title?.trim(),
      description: (body.description ?? '').trim() || null,
      date: body.date ? new Date(body.date) : undefined,
      type: TYPES.includes(body.type) ? body.type : undefined,
      grade: body.grade && ALL_ROOMS.includes(body.grade) ? body.grade : null,
    },
    include: { createdBy: { select: { name: true } } },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') ?? '');
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
