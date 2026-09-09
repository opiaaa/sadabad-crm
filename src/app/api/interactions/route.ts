import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const interactionSchema = z
  .object({
    leadId: z.string().optional(),
    talepId: z.string().optional(),
    type: z.enum(["arama", "mesaj", "gosterim", "not"]),
    content: z.string().min(1),
  })
  .refine((data) => !!data.leadId !== !!data.talepId, {
    message: "leadId veya talepId alanlarından tam olarak biri gerekli",
  });

async function assertLeadAccess(leadId: string, userId: string, role: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return null;
  if (role !== "ADMIN" && lead.assignedAgentId !== userId) return "forbidden";
  return lead;
}

// Talep havuzu paylaşımlı — herkes görebilir/temas ekleyebilir (portföy ile tutarlı)
async function assertTalepAccess(talepId: string) {
  const talep = await prisma.talep.findUnique({ where: { id: talepId } });
  return talep;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const talepId = searchParams.get("talepId");
  if (!leadId && !talepId) return NextResponse.json({ error: "leadId veya talepId gerekli" }, { status: 400 });

  if (leadId) {
    const access = await assertLeadAccess(leadId, user.id, user.role);
    if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (access === "forbidden") return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });
  } else if (talepId) {
    const access = await assertTalepAccess(talepId);
    if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const interactions = await prisma.interaction.findMany({
    where: leadId ? { leadId } : { talepId },
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

  const { leadId, talepId, type, content } = parsed.data;

  if (leadId) {
    const access = await assertLeadAccess(leadId, user.id, user.role);
    if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (access === "forbidden") return NextResponse.json({ error: "Bu lead sana ait değil" }, { status: 403 });

    const [interaction] = await prisma.$transaction([
      prisma.interaction.create({
        data: { leadId, type, content, userId: user.id },
        include: { user: { select: { name: true } } },
      }),
      prisma.lead.update({ where: { id: leadId }, data: { lastContactAt: new Date() } }),
    ]);
    return NextResponse.json(interaction, { status: 201 });
  }

  const access = await assertTalepAccess(talepId!);
  if (!access) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const [interaction] = await prisma.$transaction([
    prisma.interaction.create({
      data: { talepId, type, content, userId: user.id },
      include: { user: { select: { name: true } } },
    }),
    prisma.talep.update({ where: { id: talepId! }, data: { lastContactAt: new Date() } }),
  ]);
  return NextResponse.json(interaction, { status: 201 });
}
