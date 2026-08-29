import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAccess(propertyId: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return null;
  if (role !== "ADMIN" && property.listingAgentId !== userId) return "forbidden";
  return property;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const access = await assertAccess(params.id, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu ilan sana ait değil" }, { status: 403 });

  const body = await req.json();

  const updated = await prisma.property.update({
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
  if (access === "forbidden") return NextResponse.json({ error: "Bu ilan sana ait değil" }, { status: 403 });

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
