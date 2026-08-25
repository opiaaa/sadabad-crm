import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kaç gün temas edilmeyen lead "soğuk" sayılsın — ihtiyaca göre değiştir
const STALE_DAYS = 3;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - STALE_DAYS);

  const where = {
    ...(user.role === "ADMIN" ? {} : { assignedAgentId: user.id }),
    lastContactAt: { lt: threshold },
    stage: { notIn: ["KAPANDI_KAZANILDI", "KAPANDI_KAYIP"] as any },
  };

  const staleLeads = await prisma.lead.findMany({
    where,
    orderBy: { lastContactAt: "asc" },
    include: { assignedAgent: { select: { name: true } } },
  });

  return NextResponse.json(staleLeads);
}
