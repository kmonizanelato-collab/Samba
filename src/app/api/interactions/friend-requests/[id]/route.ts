import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const body = await req.json();
  const action = body.action;
  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  }

  const userId = parseInt(session.user.id);
  const request = await prisma.friendRequest.findUnique({ where: { id } });
  if (!request || request.toUserId !== userId) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }
  if (request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Esse pedido já foi respondido.' }, { status: 409 });
  }

  const updated = await prisma.friendRequest.update({
    where: { id },
    data: { status: action === 'accept' ? 'ACCEPTED' : 'DECLINED', respondedAt: new Date() },
  });

  return NextResponse.json(updated);
}
