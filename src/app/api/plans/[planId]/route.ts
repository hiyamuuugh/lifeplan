import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { planId } = await params;
  const plan = await prisma.lifePlan.findUnique({
    where: { id: planId },
    include: { events: { orderBy: { age: "asc" } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { planId } = await params;
  await prisma.lifePlan.delete({ where: { id: planId } });
  return new NextResponse(null, { status: 204 });
}
