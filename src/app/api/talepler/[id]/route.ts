import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAccess(talepId: string, userId: string, role: string) {
  const talep = await prisma.talep.findUnique({ where: { id: talepId } });
  if (!talep) return null;
  if (role !== "ADMIN" && talep.assignedAgentId !== userId) return "forbidden";
  return talep;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const access = await assertAccess(params.id, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu talep sana ait değil" }, { status: 403 });

  const body = await req.json();

  const updated = await prisma.talep.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const access = await assertAccess(params.id, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu talep sana ait değil" }, { status: 403 });

  await prisma.talep.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
