import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const interactionSchema = z.object({
  leadId: z.string().min(1),
  type: z.enum(["arama", "mesaj", "gosterim", "not"]),
  content: z.string().min(1),
});

async function assertLeadAccess(leadId: string, userId: string, role: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return null;
  if (role !== "ADMIN" && lead.assignedAgentId !== userId) return "forbidden";
  return lead;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ error: "leadId gerekli" }, { status: 400 });

  const access = await assertLeadAccess(leadId, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });

  const interactions = await prisma.interaction.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(interactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = interactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const access = await assertLeadAccess(parsed.data.leadId, user.id, user.role);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });

  const [interaction] = await prisma.$transaction([
    prisma.interaction.create({
      data: {
        leadId: parsed.data.leadId,
        type: parsed.data.type,
        content: parsed.data.content,
        userId: user.id,
      },
      include: { user: { select: { name: true } } },
    }),
    prisma.lead.update({
      where: { id: parsed.data.leadId },
      data: { lastContactAt: new Date() },
    }),
  ]);

  return NextResponse.json(interaction, { status: 201 });
}
