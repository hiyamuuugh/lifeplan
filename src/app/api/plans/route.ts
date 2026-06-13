import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { ageSelf: "asc" } } },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const plan = await prisma.plan.create({ data: body });
  return NextResponse.json(plan, { status: 201 });
}
