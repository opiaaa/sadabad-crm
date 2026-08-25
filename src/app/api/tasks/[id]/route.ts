import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (user.role !== "ADMIN" && task.assignedToId !== user.id)
    return NextResponse.json({ error: "Bu görev sana ait değil" }, { status: 403 });

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: { status: "TAMAMLANDI" },
  });

  return NextResponse.json(updated);
}
