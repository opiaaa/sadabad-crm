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
  roomCount: z.string().optional(),
  area: z.number(),
  price: z.number(),
  listingType: z.enum(["SATILIK", "KIRALIK"]),
  propertyType: z.enum(["KONUT", "TICARI", "ARSA"]),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(1),
  description: z.string().optional(),
  leadId: z.string().optional(), // ilişkili lead kaydı (opsiyonel)
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Portföy havuzu paylaşımlı — herkes tüm aktif ilanları görür
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district");
  const status = searchParams.get("status");
  const pageParam = searchParams.get("page");

  const where = {
    ...(district ? { district } : {}),
    ...(status ? { status: status as any } : {}),
  };
  const include = {
    listingAgent: { select: { name: true } },
    lead: { select: { id: true, name: true, phone: true } },
  };

  // page parametresi yoksa eski davranış korunur: tüm kayıtlar tek dizi olarak döner
  // (arama gibi tüm veri üzerinde çalışması gereken senaryolar ve dashboard bunu kullanıyor)
  if (!pageParam) {
    const properties = await prisma.property.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include,
    });
    return NextResponse.json(properties);
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      // Pasif ilanlar liste altına iner — PostgreSQL enum'ı tanım sırasına göre sıralar (AKTIF...PASIF en son)
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ data: properties, total, page, pageSize });
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
