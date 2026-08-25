import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAccess(leadId: string, userId: string, role: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return null;
  if (role !== "ADMIN" && lead.assignedAgentId !== userId) return "forbidden";
  return lead;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const access = await assertAccess(params.id, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });

  const body = await req.json();

  // Her güncellemede lastContactAt'i otomatik yenile — takip disiplininin kalbi burası
  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: { ...body, lastContactAt: new Date() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const access = await assertAccess(params.id, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });

  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
