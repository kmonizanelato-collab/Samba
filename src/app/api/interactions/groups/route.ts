import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const groups = await prisma.studyGroup.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, interactionsProfile: { select: { avatar: true } } } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { user: { select: { name: true } } } },
      _count: { select: { messages: true, members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      subject: g.subject,
      ownerId: g.ownerId,
      memberCount: g._count.members,
      messageCount: g._count.messages,
      members: g.members.map((m) => ({ id: m.user.id, name: m.user.name, avatar: m.user.interactionsProfile?.avatar ?? null })),
      lastMessage: g.messages[0]
        ? { content: g.messages[0].content, author: g.messages[0].user.name, createdAt: g.messages[0].createdAt }
        : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const body = await req.json();
  const name = (body.name ?? '').trim();
  const emoji = (body.emoji ?? '🌿').trim() || '🌿';
  const subject = (body.subject ?? '').trim() || null;
  const memberIds: number[] = Array.isArray(body.memberIds) ? body.memberIds.map(Number).filter(Boolean) : [];

  if (!name) return NextResponse.json({ error: 'Dê um nome ao grupo.' }, { status: 400 });

  // valida membros (apenas alunos)
  const validMembers = memberIds.length
    ? await prisma.user.findMany({ where: { id: { in: memberIds }, role: 'STUDENT' }, select: { id: true } })
    : [];
  const memberSet = new Set<number>([userId, ...validMembers.map((m) => m.id)]);

  const group = await prisma.studyGroup.create({
    data: {
      name,
      emoji,
      subject,
      ownerId: userId,
      members: { create: Array.from(memberSet).map((id) => ({ userId: id })) },
    },
  });

  return NextResponse.json({ id: group.id }, { status: 201 });
}
