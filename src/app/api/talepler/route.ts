import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const talepSchema = z.object({
  adSoyad: z.string().min(1),
  phone: z.string().min(1),
  listingType: z.enum(["SATILIK", "KIRALIK"]),
  rol: z.enum(["ALICI", "SATICI"]),
  il: z.string().min(1),
  ilce: z.string().min(1),
  mahalle: z.string().optional(),
  mulkTipi: z.enum(["DAIRE", "ISYERI", "OFIS", "IS_HANI", "DEPO"]),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  description: z.string().optional(),
  assignedAgentId: z.string().optional(), // sadece admin başka birine atayabilir
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = session.user as any;
  const where = user.role === "ADMIN" ? {} : { assignedAgentId: user.id };

  const talepler = await prisma.talep.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { assignedAgent: { select: { name: true } } },
  });

  return NextResponse.json(talepler);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const parsed = talepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Danışman sadece kendine talep açabilir; admin başkasına da atayabilir
  const assignedAgentId =
    user.role === "ADMIN" && parsed.data.assignedAgentId
      ? parsed.data.assignedAgentId
      : user.id;

  const talep = await prisma.talep.create({
    data: { ...parsed.data, assignedAgentId, lastContactAt: new Date() },
  });

  return NextResponse.json(talep, { status: 201 });
}
