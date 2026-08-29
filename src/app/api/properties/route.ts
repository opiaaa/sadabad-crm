import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(1),
  listingNumber: z.string().optional(),
  address: z.string().min(1),
  district: z.string().min(1),
  area: z.number(),
  price: z.number(),
  listingType: z.enum(["SATILIK", "KIRALIK"]),
  propertyType: z.enum(["KONUT", "TICARI", "ARSA"]),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Portföy havuzu paylaşımlı — herkes tüm aktif ilanları görür
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district");
  const status = searchParams.get("status");

  const properties = await prisma.property.findMany({
    where: {
      ...(district ? { district } : {}),
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { listingAgent: { select: { name: true } } },
  });

  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: { ...parsed.data, listingAgentId: user.id },
  });

  return NextResponse.json(property, { status: 201 });
}
