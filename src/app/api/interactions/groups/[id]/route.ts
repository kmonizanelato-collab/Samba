import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roomLabel } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function ensureMember(groupId: number, userId: number) {
  return prisma.studyGroupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const groupId = parseInt(params.id);
  const userId = parseInt(session.user.id);
  if (!(await ensureMember(groupId, userId))) return NextResponse.json({ error: 'Você não participa deste grupo.' }, { status: 403 });

  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true, grade: true, interactionsProfile: { select: { avatar: true } } } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, interactionsProfile: { select: { avatar: true } } } } },
      },
    },
  });
  if (!group) return NextResponse.json({ error: 'Grupo não encontrado.' }, { status: 404 });

  return NextResponse.json({
    id: group.id,
    name: group.name,
    emoji: group.emoji,
    subject: group.subject,
    ownerId: group.ownerId,
    members: group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      gradeLabel: m.user.grade ? roomLabel(m.user.grade) : null,
      avatar: m.user.interactionsProfile?.avatar ?? null,
      isOwner: m.user.id === group.ownerId,
    })),
    messages: group.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      authorId: msg.user.id,
      author: msg.user.name,
      avatar: msg.user.interactionsProfile?.avatar ?? null,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const groupId = parseInt(params.id);
  const userId = parseInt(session.user.id);
  if (!(await ensureMember(groupId, userId))) return NextResponse.json({ error: 'Você não participa deste grupo.' }, { status: 403 });

  const body = await req.json();
  const content = (body.content ?? '').trim();
  if (!content) return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 });
  if (content.length > 1000) return NextResponse.json({ error: 'Mensagem muito longa.' }, { status: 400 });

  const msg = await prisma.studyGroupMessage.create({
    data: { groupId, userId, content },
    include: { user: { select: { id: true, name: true, interactionsProfile: { select: { avatar: true } } } } },
  });

  return NextResponse.json({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt,
    authorId: msg.user.id,
    author: msg.user.name,
    avatar: msg.user.interactionsProfile?.avatar ?? null,
  }, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const groupId = parseInt(params.id);
  const userId = parseInt(session.user.id);
  if (!(await ensureMember(groupId, userId))) return NextResponse.json({ error: 'Você não participa deste grupo.' }, { status: 403 });

  const body = await req.json();
  const addUserId = parseInt(body.addUserId);
  if (!addUserId) return NextResponse.json({ error: 'Aluno inválido.' }, { status: 400 });

  const target = await prisma.user.findFirst({ where: { id: addUserId, role: 'STUDENT' } });
  if (!target) return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });

  await prisma.studyGroupMember.upsert({
    where: { groupId_userId: { groupId, userId: addUserId } },
    update: {},
    create: { groupId, userId: addUserId },
  });

  return NextResponse.json({ ok: true });
}
