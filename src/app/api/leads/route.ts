import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  listingType: z.enum(["SATILIK", "KIRALIK"]),
  propertyType: z.enum(["KONUT", "TICARI", "ARSA"]),
  preferredArea: z.string().optional(),
  source: z.enum(["REFERANS", "SOSYAL_MEDYA", "WEB_SITESI", "PORTAL_ILAN", "SOGUK_ARAMA", "DIGER"]).optional(),
  assignedAgentId: z.string().optional(), // sadece admin başka birine atayabilir
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = session.user as any;
  const where = user.role === "ADMIN" ? {} : { assignedAgentId: user.id };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { assignedAgent: { select: { name: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Danışman sadece kendine lead açabilir; admin başkasına da atayabilir
  const assignedAgentId =
    user.role === "ADMIN" && parsed.data.assignedAgentId
      ? parsed.data.assignedAgentId
      : user.id;

  const lead = await prisma.lead.create({
    data: { ...parsed.data, assignedAgentId, lastContactAt: new Date() },
  });

  return NextResponse.json(lead, { status: 201 });
}
