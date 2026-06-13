import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { planId } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { events: { orderBy: { ageSelf: "asc" } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(request: Request, { params }: Params) {
  const { planId } = await params;
  const body = await request.json();
  const plan = await prisma.plan.update({ where: { id: planId }, data: body });
  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { planId } = await params;
  await prisma.plan.delete({ where: { id: planId } });
  return new NextResponse(null, { status: 204 });
}
