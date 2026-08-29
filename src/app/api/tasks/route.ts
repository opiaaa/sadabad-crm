import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string(), // ISO string
  leadId: z.string().optional(),
  assignedToId: z.string().optional(), // sadece admin başkasına atayabilir
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const where = user.role === "ADMIN" ? {} : { assignedToId: user.id };

  const tasks = await prisma.task.findMany({
    where: { ...where, status: "BEKLIYOR" },
    orderBy: { dueDate: "asc" },
    include: {
      lead: { select: { name: true, phone: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assignedToId =
    user.role === "ADMIN" && parsed.data.assignedToId ? parsed.data.assignedToId : user.id;

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      leadId: parsed.data.leadId,
      assignedToId,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
