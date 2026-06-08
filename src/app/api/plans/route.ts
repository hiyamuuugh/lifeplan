import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.lifePlan.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { age: "asc" } } },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const plan = await prisma.lifePlan.create({
    data: { name: body.name, birthYear: body.birthYear },
  });
  return NextResponse.json(plan, { status: 201 });
}
