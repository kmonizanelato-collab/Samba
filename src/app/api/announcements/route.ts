import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ALL_ROOMS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function canEdit(role: string) {
  return role === 'TEACHER' || role === 'ADMIN';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gradeFilter = searchParams.get('grade');

  const where: Record<string, unknown> = {};
  if (session.user.role === 'STUDENT') {
    where.OR = [{ grade: null }, { grade: session.user.grade ?? '___' }];
  } else if (gradeFilter && gradeFilter !== 'ALL') {
    where.OR = gradeFilter === 'GLOBAL' ? [{ grade: null }] : [{ grade: gradeFilter }];
  }

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { createdBy: { select: { name: true, role: true } } },
  });

  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const title = (body.title ?? '').trim();
  const content = (body.content ?? '').trim();
  const grade = body.grade && ALL_ROOMS.includes(body.grade) ? body.grade : null;
  const pinned = !!body.pinned;

  if (!title) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
  if (!content) return NextResponse.json({ error: 'Mensagem é obrigatória.' }, { status: 400 });

  const ann = await prisma.announcement.create({
    data: { title, content, grade, pinned, createdById: parseInt(session.user.id) },
    include: { createdBy: { select: { name: true, role: true } } },
  });
  return NextResponse.json(ann, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const id = parseInt(body.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const ann = await prisma.announcement.update({
    where: { id },
    data: {
      title: body.title?.trim(),
      content: body.content?.trim(),
      grade: body.grade && ALL_ROOMS.includes(body.grade) ? body.grade : null,
      pinned: body.pinned !== undefined ? !!body.pinned : undefined,
    },
    include: { createdBy: { select: { name: true, role: true } } },
  });
  return NextResponse.json(ann);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') ?? '');
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
